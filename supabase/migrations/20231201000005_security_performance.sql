-- Security: Old policy removed - replaced by profileId-based RLS in 20241225000001_auth_rls_complete.sql
-- The new policy "bookings_update_own_or_host" uses get_profile_id() for proper auth integration
-- DROP POLICY IF EXISTS "Users can update their own bookings (e.g. cancel)" ON bookings;

-- Performance: Add indexes for frequently filtered columns
create index if not exists idx_camps_province on camps(province);
create index if not exists idx_camps_price on camps(price_per_night);
create index if not exists idx_camps_guests on camps(max_guests);
create index if not exists idx_camps_accommodation on camps(accommodation_type);
create index if not exists idx_bookings_user_id on bookings(user_id);
create index if not exists idx_bookings_camp_id on bookings(camp_id);

-- GIN index for partial text search on amenities/facilities is useful if we filter by them often
create index if not exists idx_camps_facilities on camps using gin(facilities);
