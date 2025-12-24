# Phase 2: Authentication + RLS Architecture

## Executive Summary

This document outlines the authentication and Row Level Security (RLS) implementation for Campy. The design prioritizes **zero data loss**, **no breaking changes**, and **additive modifications** to the existing codebase.

---

## 1. Authentication Model

### 1.1 User Roles

| Role | Description | Capabilities |
|------|-------------|--------------|
| **guest** | Unauthenticated visitor | Read-only access to public data (camps, reviews) |
| **user** | Authenticated camper | Book camps, write reviews, manage favorites |
| **host** | Camp owner | All user capabilities + manage camps, view bookings for owned camps |
| **admin** | Platform administrator | Full access to all data |

### 1.2 Role Storage

Roles are stored in `profiles.role` column with CHECK constraint:
```sql
role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'HOST', 'ADMIN'))
```

### 1.3 Role Hierarchy

```
admin > host > user > guest (anonymous)
```

Host is a **superset** of user - hosts can also make bookings as guests at other camps.

---

## 2. Data Mapping: auth.users ↔ profiles

### 2.1 Current Schema Problem

**Production schema (schema.sql)**:
- Uses `mock_user_id TEXT` as identifier
- `profiles.id` is auto-generated UUID (not linked to auth.users)

**Migration schema (init_schema.sql)**:
- Uses `profiles.id UUID REFERENCES auth.users`
- Has proper `handle_new_user()` trigger

### 2.2 Migration Strategy: Additive Column

Add `auth_user_id` column to link profiles to Supabase Auth without breaking existing data:

```sql
-- Step 1: Add auth_user_id column (nullable initially)
ALTER TABLE profiles
ADD COLUMN auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;

-- Step 2: Create index for performance
CREATE INDEX idx_profiles_auth_user_id ON profiles(auth_user_id) WHERE auth_user_id IS NOT NULL;
```

### 2.3 Profile Lookup Function

Helper function to find profile by auth.uid():

```sql
-- Get profile ID from auth.uid()
CREATE OR REPLACE FUNCTION get_profile_id()
RETURNS UUID AS $$
  SELECT id FROM profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if current user owns a profile
CREATE OR REPLACE FUNCTION is_profile_owner(profile_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = profile_id AND auth_user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

### 2.4 Auto-create Profile Trigger

```sql
-- Automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    auth_user_id,
    mock_user_id,  -- Keep for backward compatibility
    email,
    name,
    avatar_url,
    role
  ) VALUES (
    NEW.id,
    'auth_' || NEW.id::TEXT,  -- Generate mock_user_id from auth id
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url',
    'USER'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists, then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 3. RLS Policy Design

### 3.1 Design Principles

1. **Anonymous read access** for public data (camps, published reviews)
2. **Owner-based write access** for user-specific data
3. **Host access** to booking data for their camps
4. **Admin bypass** for administrative operations

### 3.2 Helper Functions for RLS

```sql
-- Check if user has specific role
CREATE OR REPLACE FUNCTION has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE auth_user_id = auth.uid()
    AND role = required_role
    AND deleted_at IS NULL
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT has_role('ADMIN');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user is host
CREATE OR REPLACE FUNCTION is_host()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE auth_user_id = auth.uid()
    AND (role = 'HOST' OR role = 'ADMIN')
    AND deleted_at IS NULL
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user owns a camp
CREATE OR REPLACE FUNCTION owns_camp(camp_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM camps c
    JOIN profiles p ON c.host_id = p.id
    WHERE c.id = camp_id AND p.auth_user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

---

## 4. RLS Policies by Table

### 4.1 profiles

```sql
-- Drop development policy
DROP POLICY IF EXISTS "Allow all for development" ON profiles;

-- SELECT: Public read for basic info, full access for own profile
CREATE POLICY "profiles_select_public"
ON profiles FOR SELECT
USING (
  deleted_at IS NULL  -- Respect soft deletes
);

-- INSERT: Only via trigger (handled by handle_new_user)
CREATE POLICY "profiles_insert_own"
ON profiles FOR INSERT
WITH CHECK (
  auth_user_id = auth.uid()
);

-- UPDATE: Own profile only
CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE
USING (auth_user_id = auth.uid())
WITH CHECK (auth_user_id = auth.uid());

-- DELETE: Own profile only (soft delete)
CREATE POLICY "profiles_delete_own"
ON profiles FOR DELETE
USING (auth_user_id = auth.uid());
```

### 4.2 camps

```sql
-- Drop development policy
DROP POLICY IF EXISTS "Allow all for development" ON camps;

-- SELECT: Public read for active camps
CREATE POLICY "camps_select_public"
ON camps FOR SELECT
USING (
  status = 'active' AND deleted_at IS NULL
  OR owns_camp(id)  -- Hosts can see their own camps regardless of status
  OR is_admin()
);

-- INSERT: Hosts only
CREATE POLICY "camps_insert_host"
ON camps FOR INSERT
WITH CHECK (
  host_id = get_profile_id()
  AND is_host()
);

-- UPDATE: Own camps only
CREATE POLICY "camps_update_own"
ON camps FOR UPDATE
USING (owns_camp(id) OR is_admin())
WITH CHECK (owns_camp(id) OR is_admin());

-- DELETE: Own camps only
CREATE POLICY "camps_delete_own"
ON camps FOR DELETE
USING (owns_camp(id) OR is_admin());
```

### 4.3 bookings

```sql
-- Drop development policy
DROP POLICY IF EXISTS "Allow all for development" ON bookings;

-- SELECT: Own bookings OR bookings for camps you host
CREATE POLICY "bookings_select_own_or_host"
ON bookings FOR SELECT
USING (
  user_id = get_profile_id()  -- User's own bookings
  OR owns_camp(camp_id)        -- Host's camp bookings
  OR is_admin()
);

-- INSERT: Authenticated users only, for themselves
CREATE POLICY "bookings_insert_own"
ON bookings FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND user_id = get_profile_id()
);

-- UPDATE: Own bookings (cancel) OR host's camp bookings (confirm/reject)
CREATE POLICY "bookings_update_own_or_host"
ON bookings FOR UPDATE
USING (
  user_id = get_profile_id()
  OR owns_camp(camp_id)
  OR is_admin()
)
WITH CHECK (
  user_id = get_profile_id()
  OR owns_camp(camp_id)
  OR is_admin()
);

-- DELETE: Own pending bookings only (or admin)
CREATE POLICY "bookings_delete_own"
ON bookings FOR DELETE
USING (
  (user_id = get_profile_id() AND status = 'pending')
  OR is_admin()
);
```

### 4.4 payments

```sql
-- Drop development policy
DROP POLICY IF EXISTS "Allow all for development" ON payments;

-- SELECT: Via booking ownership
CREATE POLICY "payments_select_via_booking"
ON payments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM bookings b
    WHERE b.id = payments.booking_id
    AND (
      b.user_id = get_profile_id()
      OR owns_camp(b.camp_id)
      OR is_admin()
    )
  )
);

-- INSERT: Only for own bookings
CREATE POLICY "payments_insert_via_booking"
ON payments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM bookings b
    WHERE b.id = booking_id
    AND b.user_id = get_profile_id()
  )
);

-- UPDATE: Admin only (payment status updates via backend)
CREATE POLICY "payments_update_admin"
ON payments FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

-- DELETE: Admin only
CREATE POLICY "payments_delete_admin"
ON payments FOR DELETE
USING (is_admin());
```

### 4.5 reviews

```sql
-- Drop development policy
DROP POLICY IF EXISTS "Allow all for development" ON reviews;

-- SELECT: Public for published, own for all statuses
CREATE POLICY "reviews_select_public"
ON reviews FOR SELECT
USING (
  status = 'published'
  OR user_id = get_profile_id()
  OR owns_camp(camp_id)  -- Hosts can see reviews on their camps
  OR is_admin()
);

-- INSERT: Authenticated users only
CREATE POLICY "reviews_insert_own"
ON reviews FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND user_id = get_profile_id()
);

-- UPDATE: Own reviews only (for editing), hosts for response
CREATE POLICY "reviews_update_own_or_host"
ON reviews FOR UPDATE
USING (
  user_id = get_profile_id()
  OR owns_camp(camp_id)  -- Host can add response
  OR is_admin()
)
WITH CHECK (
  user_id = get_profile_id()
  OR owns_camp(camp_id)
  OR is_admin()
);

-- DELETE: Own reviews only (or admin)
CREATE POLICY "reviews_delete_own"
ON reviews FOR DELETE
USING (
  user_id = get_profile_id()
  OR is_admin()
);
```

### 4.6 favorites

```sql
-- Drop development policy
DROP POLICY IF EXISTS "Allow all for development" ON favorites;

-- SELECT: Own favorites only
CREATE POLICY "favorites_select_own"
ON favorites FOR SELECT
USING (user_id = get_profile_id());

-- INSERT: Own favorites only
CREATE POLICY "favorites_insert_own"
ON favorites FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND user_id = get_profile_id()
);

-- UPDATE: Own favorites only
CREATE POLICY "favorites_update_own"
ON favorites FOR UPDATE
USING (user_id = get_profile_id())
WITH CHECK (user_id = get_profile_id());

-- DELETE: Own favorites only
CREATE POLICY "favorites_delete_own"
ON favorites FOR DELETE
USING (user_id = get_profile_id());
```

### 4.7 blocked_dates

```sql
-- Drop development policy
DROP POLICY IF EXISTS "Allow all for development" ON blocked_dates;

-- SELECT: Public (for availability checking)
CREATE POLICY "blocked_dates_select_public"
ON blocked_dates FOR SELECT
USING (true);

-- INSERT/UPDATE/DELETE: Camp owners only
CREATE POLICY "blocked_dates_modify_host"
ON blocked_dates FOR ALL
USING (owns_camp(camp_id) OR is_admin())
WITH CHECK (owns_camp(camp_id) OR is_admin());
```

### 4.8 messages

```sql
-- Drop development policy
DROP POLICY IF EXISTS "Allow all for development" ON messages;

-- SELECT: Sender or recipient only
CREATE POLICY "messages_select_participant"
ON messages FOR SELECT
USING (
  sender_id = get_profile_id()
  OR recipient_id = get_profile_id()
  OR is_admin()
);

-- INSERT: Authenticated, as sender
CREATE POLICY "messages_insert_own"
ON messages FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND sender_id = get_profile_id()
);

-- UPDATE: Recipient only (mark as read)
CREATE POLICY "messages_update_recipient"
ON messages FOR UPDATE
USING (recipient_id = get_profile_id())
WITH CHECK (recipient_id = get_profile_id());

-- DELETE: Sender only (soft delete)
CREATE POLICY "messages_delete_sender"
ON messages FOR DELETE
USING (sender_id = get_profile_id());
```

### 4.9 accommodations

```sql
-- Drop development policy
DROP POLICY IF EXISTS "Allow all for development" ON accommodations;

-- SELECT: Public (via active camps)
CREATE POLICY "accommodations_select_public"
ON accommodations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM camps c
    WHERE c.id = camp_id
    AND (c.status = 'active' OR owns_camp(c.id))
  )
  OR is_admin()
);

-- INSERT/UPDATE/DELETE: Camp owner only
CREATE POLICY "accommodations_modify_host"
ON accommodations FOR ALL
USING (owns_camp(camp_id) OR is_admin())
WITH CHECK (owns_camp(camp_id) OR is_admin());
```

---

## 5. Migration Plan

### 5.1 Pre-Migration Checklist

- [ ] Backup database
- [ ] Test in staging environment
- [ ] Verify all AUTH_MIGRATION markers are addressed
- [ ] Test OTP authentication flow

### 5.2 Migration Steps

#### Step 1: Add auth_user_id Column (Non-Breaking)

```sql
-- Migration: 20241225000001_add_auth_user_id.sql

-- Add auth_user_id to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE;

-- Add foreign key constraint (deferred)
ALTER TABLE profiles
ADD CONSTRAINT fk_profiles_auth_users
FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index
CREATE INDEX IF NOT EXISTS idx_profiles_auth_user_id
ON profiles(auth_user_id) WHERE auth_user_id IS NOT NULL;
```

#### Step 2: Create Helper Functions

```sql
-- Migration: 20241225000002_auth_helper_functions.sql

-- [Include all helper functions from Section 3.2]
```

#### Step 3: Create Profile Trigger

```sql
-- Migration: 20241225000003_profile_trigger.sql

-- [Include handle_new_user() function from Section 2.4]
```

#### Step 4: Apply RLS Policies

```sql
-- Migration: 20241225000004_rls_policies.sql

-- [Include all RLS policies from Section 4]
```

#### Step 5: Link Mock User to Auth (Optional - for existing data)

```sql
-- Run manually after first real user signs up:
-- UPDATE profiles SET auth_user_id = '<auth_user_uuid>' WHERE mock_user_id = '00000000-0000-0000-0000-000000000001';
```

### 5.3 Rollback Plan

```sql
-- Rollback Step 4: Remove RLS policies
-- (Re-add development policies if needed)

-- Rollback Step 3: Drop trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Rollback Step 2: Drop helper functions
DROP FUNCTION IF EXISTS get_profile_id();
DROP FUNCTION IF EXISTS is_profile_owner(UUID);
DROP FUNCTION IF EXISTS has_role(TEXT);
DROP FUNCTION IF EXISTS is_admin();
DROP FUNCTION IF EXISTS is_host();
DROP FUNCTION IF EXISTS owns_camp(UUID);

-- Rollback Step 1: Remove auth_user_id
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS fk_profiles_auth_users;
DROP INDEX IF EXISTS idx_profiles_auth_user_id;
ALTER TABLE profiles DROP COLUMN IF EXISTS auth_user_id;
```

---

## 6. Frontend Changes (Minimal)

### 6.1 Service Layer Updates

Update `src/services/constants.ts`:

```typescript
// AUTH_MIGRATION: COMPLETE - Now uses real auth
export async function getCurrentUserId(fallbackUserId?: string): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // Get profile ID from auth user
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    return profile?.id || null;
  }

  // Development fallback (remove in production)
  if (import.meta.env.DEV && fallbackUserId) {
    return fallbackUserId;
  }

  return null;
}
```

### 6.2 CRUD Service Updates

All services already have `userId?: string` parameters. Update pattern:

```typescript
// Before (in bookingCrud.ts, reviewsFavoritesCrud.ts)
const currentUserId = getCurrentUserId(userId);

// After
const currentUserId = await getCurrentUserId(userId);
if (!currentUserId) {
  return customErrorResult('Authentication required');
}
```

**Files to update:**
- `src/services/bookingCrud.ts` - 4 functions
- `src/services/reviewsFavoritesCrud.ts` - 8 functions

### 6.3 Context Updates

Update `AuthContext.tsx` to expose profile ID:

```typescript
interface AuthContextType {
  user: User | null;
  session: Session | null;
  profileId: string | null;  // ADD THIS
  isAuthenticated: boolean;
  // ...
}
```

### 6.4 Required Auth Checks

Add authentication guards to:

1. **Payment.tsx** - Already has login check before confirm
2. **ReviewSection.tsx** - Check auth before showing review form
3. **FavoritesContext.tsx** - Check auth before operations

---

## 7. Testing Checklist

### 7.1 Authentication Tests

- [ ] Email OTP sign up creates profile
- [ ] Email OTP sign in works
- [ ] Session persistence across page refresh
- [ ] Sign out clears session

### 7.2 RLS Tests (as User)

- [ ] Can read public camps
- [ ] Can read own profile
- [ ] Can create booking for self
- [ ] Cannot read other users' bookings
- [ ] Can read own bookings
- [ ] Can add/remove favorites
- [ ] Can create review (one per camp)
- [ ] Cannot delete other users' reviews

### 7.3 RLS Tests (as Host)

- [ ] Can create camp
- [ ] Can see bookings for own camps
- [ ] Can update booking status
- [ ] Can respond to reviews
- [ ] Cannot modify other hosts' camps

### 7.4 RLS Tests (Anonymous)

- [ ] Can read active camps
- [ ] Can read published reviews
- [ ] Cannot create bookings
- [ ] Cannot add favorites

---

## 8. Security Considerations

### 8.1 SECURITY DEFINER Functions

All helper functions use `SECURITY DEFINER` to ensure they run with elevated privileges when checking auth.uid(). This is safe because:

1. Functions only perform SELECT operations
2. Functions return boolean or single UUID
3. No user input is directly interpolated into queries

### 8.2 Soft Delete Handling

RLS policies respect `deleted_at IS NULL` for profiles to ensure:
- Soft-deleted profiles cannot authenticate
- Existing data relationships remain intact for audit

### 8.3 Admin Bypass

Admin bypass is intentionally limited:
- Admin can view all data
- Admin can modify all data
- Admin bypass is explicit in each policy

---

## 9. Appendix: Complete Migration SQL

See separate file: `supabase/migrations/20241225000001_auth_rls_complete.sql`

This file combines all migration steps into a single executable migration for convenience.
