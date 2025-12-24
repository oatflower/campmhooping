-- ============================================================================
-- CAMPY AUTHENTICATION & RLS MIGRATION
-- Version: 2.0.0
-- Description: Adds Supabase Auth integration and Row Level Security policies
-- Dependencies: Existing schema.sql must be applied first
-- ============================================================================

-- ============================================================================
-- STEP 1: ADD AUTH_USER_ID COLUMN TO PROFILES
-- ============================================================================

-- Add auth_user_id column to link profiles with Supabase Auth
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE;

-- Add foreign key constraint to auth.users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_profiles_auth_users'
  ) THEN
    ALTER TABLE profiles
    ADD CONSTRAINT fk_profiles_auth_users
    FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create index for auth_user_id lookups
CREATE INDEX IF NOT EXISTS idx_profiles_auth_user_id
ON profiles(auth_user_id) WHERE auth_user_id IS NOT NULL;

-- ============================================================================
-- STEP 2: CREATE HELPER FUNCTIONS
-- ============================================================================

-- Function to get current user's profile ID from auth.uid()
CREATE OR REPLACE FUNCTION get_profile_id()
RETURNS UUID AS $$
  SELECT id FROM profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Function to check if current user owns a profile
CREATE OR REPLACE FUNCTION is_profile_owner(profile_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = profile_id AND auth_user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Function to check if user has specific role
CREATE OR REPLACE FUNCTION has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE auth_user_id = auth.uid()
    AND role = required_role
    AND deleted_at IS NULL
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT has_role('ADMIN');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Function to check if user is host (or admin)
CREATE OR REPLACE FUNCTION is_host()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE auth_user_id = auth.uid()
    AND (role = 'HOST' OR role = 'ADMIN')
    AND deleted_at IS NULL
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Function to check if user owns a specific camp
CREATE OR REPLACE FUNCTION owns_camp(camp_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM camps c
    JOIN profiles p ON c.host_id = p.id
    WHERE c.id = camp_uuid AND p.auth_user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================================
-- STEP 3: CREATE PROFILE AUTO-CREATION TRIGGER
-- ============================================================================

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    auth_user_id,
    mock_user_id,
    email,
    name,
    avatar_url,
    role
  ) VALUES (
    NEW.id,
    'auth_' || NEW.id::TEXT,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User'),
    NEW.raw_user_meta_data->>'avatar_url',
    'USER'
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists (e.g., linked mock user), just update auth_user_id
    UPDATE public.profiles
    SET auth_user_id = NEW.id,
        email = COALESCE(NEW.email, email),
        updated_at = NOW()
    WHERE email = NEW.email AND auth_user_id IS NULL;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- STEP 4: DROP OLD POLICIES (Development + Legacy auth.uid()-based policies)
-- ============================================================================

-- Drop development policies
DROP POLICY IF EXISTS "Allow all for development" ON profiles;
DROP POLICY IF EXISTS "Allow all for development" ON camps;
DROP POLICY IF EXISTS "Allow all for development" ON accommodations;
DROP POLICY IF EXISTS "Allow all for development" ON bookings;
DROP POLICY IF EXISTS "Allow all for development" ON payments;
DROP POLICY IF EXISTS "Allow all for development" ON reviews;
DROP POLICY IF EXISTS "Allow all for development" ON favorites;
DROP POLICY IF EXISTS "Allow all for development" ON blocked_dates;
DROP POLICY IF EXISTS "Allow all for development" ON messages;

-- Drop legacy policies that used auth.uid() = user_id directly (incompatible with profileId model)
DROP POLICY IF EXISTS "Users can view their own bookings." ON bookings;
DROP POLICY IF EXISTS "Hosts can view bookings for their camps." ON bookings;
DROP POLICY IF EXISTS "Users can update their own bookings." ON bookings;
DROP POLICY IF EXISTS "Hosts can update bookings for their camps." ON bookings;
DROP POLICY IF EXISTS "Users can delete their own bookings." ON bookings;
DROP POLICY IF EXISTS "Users can update their own bookings (e.g. cancel)" ON bookings;
DROP POLICY IF EXISTS "Hosts can delete their own camps." ON camps;
DROP POLICY IF EXISTS "Users can delete their own profile." ON profiles;

-- ============================================================================
-- STEP 5: CREATE RLS POLICIES FOR PROFILES
-- ============================================================================

-- SELECT: Anyone can read profiles (for displaying reviewer names, etc.)
CREATE POLICY "profiles_select_public"
ON profiles FOR SELECT
USING (deleted_at IS NULL);

-- INSERT: Only via trigger or for own profile
CREATE POLICY "profiles_insert_own"
ON profiles FOR INSERT
WITH CHECK (auth_user_id = auth.uid());

-- UPDATE: Own profile only
CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE
USING (auth_user_id = auth.uid())
WITH CHECK (auth_user_id = auth.uid());

-- DELETE: Own profile only
CREATE POLICY "profiles_delete_own"
ON profiles FOR DELETE
USING (auth_user_id = auth.uid());

-- ============================================================================
-- STEP 6: CREATE RLS POLICIES FOR CAMPS
-- ============================================================================

-- SELECT: Public for active camps, hosts see their own
CREATE POLICY "camps_select_public"
ON camps FOR SELECT
USING (
  (status = 'active' AND deleted_at IS NULL)
  OR owns_camp(id)
  OR is_admin()
);

-- INSERT: Hosts only, for themselves
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

-- ============================================================================
-- STEP 7: CREATE RLS POLICIES FOR ACCOMMODATIONS
-- ============================================================================

-- SELECT: Public for active camp accommodations
CREATE POLICY "accommodations_select_public"
ON accommodations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM camps c
    WHERE c.id = camp_id
    AND ((c.status = 'active' AND c.deleted_at IS NULL) OR owns_camp(c.id))
  )
  OR is_admin()
);

-- INSERT: Camp owner only
CREATE POLICY "accommodations_insert_host"
ON accommodations FOR INSERT
WITH CHECK (owns_camp(camp_id) OR is_admin());

-- UPDATE: Camp owner only
CREATE POLICY "accommodations_update_host"
ON accommodations FOR UPDATE
USING (owns_camp(camp_id) OR is_admin())
WITH CHECK (owns_camp(camp_id) OR is_admin());

-- DELETE: Camp owner only
CREATE POLICY "accommodations_delete_host"
ON accommodations FOR DELETE
USING (owns_camp(camp_id) OR is_admin());

-- ============================================================================
-- STEP 8: CREATE RLS POLICIES FOR BOOKINGS
-- ============================================================================

-- SELECT: Own bookings or bookings for hosted camps
CREATE POLICY "bookings_select_own_or_host"
ON bookings FOR SELECT
USING (
  user_id = get_profile_id()
  OR owns_camp(camp_id)
  OR is_admin()
);

-- INSERT: Authenticated users only, for themselves
CREATE POLICY "bookings_insert_own"
ON bookings FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND user_id = get_profile_id()
);

-- UPDATE: Own bookings or host's camp bookings
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

-- DELETE: Own pending bookings only
CREATE POLICY "bookings_delete_own"
ON bookings FOR DELETE
USING (
  (user_id = get_profile_id() AND status = 'pending')
  OR is_admin()
);

-- ============================================================================
-- STEP 9: CREATE RLS POLICIES FOR PAYMENTS
-- ============================================================================

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

-- UPDATE: Admin only
CREATE POLICY "payments_update_admin"
ON payments FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

-- DELETE: Admin only
CREATE POLICY "payments_delete_admin"
ON payments FOR DELETE
USING (is_admin());

-- ============================================================================
-- STEP 10: CREATE RLS POLICIES FOR REVIEWS
-- ============================================================================

-- SELECT: Public for published, own for all
CREATE POLICY "reviews_select_public"
ON reviews FOR SELECT
USING (
  status = 'published'
  OR user_id = get_profile_id()
  OR owns_camp(camp_id)
  OR is_admin()
);

-- INSERT: Authenticated users only
CREATE POLICY "reviews_insert_own"
ON reviews FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND user_id = get_profile_id()
);

-- UPDATE: Own reviews or host for response
CREATE POLICY "reviews_update_own_or_host"
ON reviews FOR UPDATE
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

-- DELETE: Own reviews only
CREATE POLICY "reviews_delete_own"
ON reviews FOR DELETE
USING (
  user_id = get_profile_id()
  OR is_admin()
);

-- ============================================================================
-- STEP 11: CREATE RLS POLICIES FOR FAVORITES
-- ============================================================================

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

-- ============================================================================
-- STEP 12: CREATE RLS POLICIES FOR BLOCKED_DATES
-- ============================================================================

-- SELECT: Public (for availability checking)
CREATE POLICY "blocked_dates_select_public"
ON blocked_dates FOR SELECT
USING (true);

-- INSERT: Camp owners only
CREATE POLICY "blocked_dates_insert_host"
ON blocked_dates FOR INSERT
WITH CHECK (owns_camp(camp_id) OR is_admin());

-- UPDATE: Camp owners only
CREATE POLICY "blocked_dates_update_host"
ON blocked_dates FOR UPDATE
USING (owns_camp(camp_id) OR is_admin())
WITH CHECK (owns_camp(camp_id) OR is_admin());

-- DELETE: Camp owners only
CREATE POLICY "blocked_dates_delete_host"
ON blocked_dates FOR DELETE
USING (owns_camp(camp_id) OR is_admin());

-- ============================================================================
-- STEP 13: CREATE RLS POLICIES FOR MESSAGES
-- ============================================================================

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

-- DELETE: Sender only
CREATE POLICY "messages_delete_sender"
ON messages FOR DELETE
USING (sender_id = get_profile_id());

-- ============================================================================
-- STEP 14: GRANT NECESSARY PERMISSIONS
-- ============================================================================

-- Grant execute on helper functions to authenticated and anon users
GRANT EXECUTE ON FUNCTION get_profile_id() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION is_profile_owner(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION has_role(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION is_host() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION owns_camp(UUID) TO authenticated, anon;

-- ============================================================================
-- VERIFICATION QUERIES (Run manually to verify)
-- ============================================================================

-- Check policies are created:
-- SELECT tablename, policyname, cmd, qual FROM pg_policies WHERE schemaname = 'public';

-- Check helper functions exist:
-- SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';

-- Test get_profile_id (when authenticated):
-- SELECT get_profile_id();
