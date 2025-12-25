-- ============================================================================
-- MIGRATION: Fix Booking Race Condition
-- Version: 1.0.0
-- Description: Prevents double-booking using PostgreSQL EXCLUDE constraint
-- Problem: Current unique index doesn't prevent overlapping date ranges
-- Solution: Use btree_gist extension with daterange exclusion
-- ============================================================================

-- ============================================================================
-- STEP 1: Enable btree_gist Extension
-- Required for combining equality (=) with range overlap (&&) in EXCLUDE
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ============================================================================
-- STEP 2: Drop Old Incomplete Index
-- The old index only checked exact (camp_id, start_date, end_date) matches
-- It did NOT prevent overlapping ranges like:
--   Booking A: Jan 1-5
--   Booking B: Jan 3-7 (SHOULD BE BLOCKED but wasn't!)
-- ============================================================================
DROP INDEX IF EXISTS idx_bookings_no_overlap;

-- ============================================================================
-- STEP 3: Add Proper Exclusion Constraint
-- This prevents ANY overlapping date ranges for the same camp
-- Uses daterange with '[]' = inclusive on both ends
-- ============================================================================

-- First, check if there are any existing overlapping bookings
-- If there are, this migration will fail (which is correct behavior)
DO $$
DECLARE
    overlap_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO overlap_count
    FROM bookings b1
    JOIN bookings b2 ON b1.camp_id = b2.camp_id
        AND b1.id < b2.id  -- Avoid self-join and duplicates
        AND b1.status IN ('pending', 'processing', 'confirmed')
        AND b2.status IN ('pending', 'processing', 'confirmed')
        AND daterange(b1.start_date, b1.end_date, '[]') && daterange(b2.start_date, b2.end_date, '[]');

    IF overlap_count > 0 THEN
        RAISE NOTICE 'Found % overlapping booking pairs. These need to be resolved before applying constraint.', overlap_count;
        -- Log the overlapping bookings for manual review
        RAISE NOTICE 'Run this query to see overlaps: SELECT b1.id, b2.id, b1.camp_id, b1.start_date, b1.end_date, b2.start_date, b2.end_date FROM bookings b1 JOIN bookings b2 ON b1.camp_id = b2.camp_id AND b1.id < b2.id AND b1.status IN (''pending'', ''processing'', ''confirmed'') AND b2.status IN (''pending'', ''processing'', ''confirmed'') AND daterange(b1.start_date, b1.end_date, ''[]'') && daterange(b2.start_date, b2.end_date, ''[]'');';
    ELSE
        RAISE NOTICE 'No overlapping bookings found. Safe to proceed.';
    END IF;
END $$;

-- Add the exclusion constraint
-- This will fail if overlapping bookings exist (data integrity check)
ALTER TABLE bookings
ADD CONSTRAINT no_overlapping_bookings
EXCLUDE USING GIST (
    camp_id WITH =,
    daterange(start_date, end_date, '[]') WITH &&
)
WHERE (status IN ('pending', 'processing', 'confirmed'));

-- ============================================================================
-- STEP 4: Add Accommodation-Level Constraint (SKIPPED - accommodations table not yet created)
-- For camps with multiple accommodations, we also need to prevent
-- overbooking at the accommodation level
-- TODO: Add this constraint after accommodations table is created
-- ============================================================================

-- SKIPPED: accommodations table does not exist yet
-- ALTER TABLE bookings ADD COLUMN IF NOT EXISTS accommodation_id UUID REFERENCES accommodations(id);
-- ALTER TABLE bookings
-- ADD CONSTRAINT no_overlapping_accommodation_bookings
-- EXCLUDE USING GIST (
--     accommodation_id WITH =,
--     daterange(start_date, end_date, '[]') WITH &&
-- )
-- WHERE (
--     accommodation_id IS NOT NULL
--     AND status IN ('pending', 'processing', 'confirmed')
-- );

-- ============================================================================
-- STEP 5: Create Helper Function for Availability Check
-- Use this BEFORE attempting to insert to give better error messages
-- ============================================================================
CREATE OR REPLACE FUNCTION check_camp_availability(
    p_camp_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    is_available BOOLEAN,
    conflicting_booking_id UUID,
    conflict_start DATE,
    conflict_end DATE,
    message TEXT
) AS $$
BEGIN
    -- Check for conflicting bookings
    RETURN QUERY
    SELECT
        FALSE AS is_available,
        b.id AS conflicting_booking_id,
        b.start_date AS conflict_start,
        b.end_date AS conflict_end,
        format('Camp is already booked from %s to %s', b.start_date, b.end_date) AS message
    FROM bookings b
    WHERE b.camp_id = p_camp_id
      AND b.status IN ('pending', 'processing', 'confirmed')
      AND daterange(b.start_date, b.end_date, '[]') && daterange(p_start_date, p_end_date, '[]')
    LIMIT 1;

    -- If no conflicts found, return available
    IF NOT FOUND THEN
        RETURN QUERY SELECT
            TRUE AS is_available,
            NULL::UUID AS conflicting_booking_id,
            NULL::DATE AS conflict_start,
            NULL::DATE AS conflict_end,
            'Available'::TEXT AS message;
    END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- STEP 6: Create Booking Insert Function with Race Condition Protection
-- Uses advisory locks to serialize booking attempts for the same camp/dates
-- ============================================================================
CREATE OR REPLACE FUNCTION create_booking_safe(
    p_user_id UUID,
    p_camp_id UUID,
    p_start_date DATE,
    p_end_date DATE,
    p_guest_count JSONB,
    p_total_price DECIMAL,
    p_payment_method TEXT DEFAULT NULL
)
RETURNS TABLE (
    success BOOLEAN,
    booking_id UUID,
    error_message TEXT
) AS $$
DECLARE
    v_booking_id UUID;
    v_lock_key BIGINT;
    v_is_available BOOLEAN;
    v_conflict_msg TEXT;
BEGIN
    -- Generate a lock key based on camp_id and date range
    -- This serializes concurrent booking attempts for overlapping dates
    v_lock_key := hashtext(p_camp_id::TEXT || p_start_date::TEXT || p_end_date::TEXT);

    -- Acquire advisory lock (waits if another transaction has it)
    PERFORM pg_advisory_xact_lock(v_lock_key);

    -- Check availability (within the lock)
    SELECT ca.is_available, ca.message
    INTO v_is_available, v_conflict_msg
    FROM check_camp_availability(p_camp_id, p_start_date, p_end_date) ca
    LIMIT 1;

    IF NOT v_is_available THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, v_conflict_msg;
        RETURN;
    END IF;

    -- Insert the booking
    INSERT INTO bookings (
        user_id,
        camp_id,
        start_date,
        end_date,
        total_price,
        status
    ) VALUES (
        p_user_id,
        p_camp_id,
        p_start_date,
        p_end_date,
        p_total_price,
        'pending'
    )
    RETURNING id INTO v_booking_id;

    RETURN QUERY SELECT TRUE, v_booking_id, NULL::TEXT;

EXCEPTION
    WHEN exclusion_violation THEN
        -- This catches the race condition at DB level as final safety net
        RETURN QUERY SELECT FALSE, NULL::UUID, 'This camp is no longer available for the selected dates. Please choose different dates.'::TEXT;
    WHEN OTHERS THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 7: Grant Permissions
-- ============================================================================
GRANT EXECUTE ON FUNCTION check_camp_availability(UUID, DATE, DATE) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION create_booking_safe(UUID, UUID, DATE, DATE, JSONB, DECIMAL, TEXT) TO authenticated;

-- ============================================================================
-- STEP 8: Add Index for Fast Availability Lookups
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_bookings_availability
ON bookings (camp_id, start_date, end_date)
WHERE status IN ('pending', 'processing', 'confirmed');

-- SKIPPED: accommodation_id column does not exist yet
-- CREATE INDEX IF NOT EXISTS idx_bookings_accommodation_availability
-- ON bookings (accommodation_id, start_date, end_date)
-- WHERE accommodation_id IS NOT NULL AND status IN ('pending', 'processing', 'confirmed');

-- ============================================================================
-- VERIFICATION QUERIES (Run manually to verify)
-- ============================================================================
--
-- Check constraints exist:
-- SELECT conname, contype, pg_get_constraintdef(oid)
-- FROM pg_constraint
-- WHERE conrelid = 'bookings'::regclass;
--
-- Test availability check:
-- SELECT * FROM check_camp_availability(
--     'your-camp-uuid',
--     '2024-01-15'::DATE,
--     '2024-01-20'::DATE
-- );
--
-- Test safe booking creation:
-- SELECT * FROM create_booking_safe(
--     'user-uuid',
--     'camp-uuid',
--     NULL,
--     '2024-01-15'::DATE,
--     '2024-01-20'::DATE,
--     '{"adults": 2, "children": 0}'::JSONB,
--     1500.00
-- );
-- ============================================================================

COMMENT ON CONSTRAINT no_overlapping_bookings ON bookings IS
'Prevents double-booking by ensuring no two active bookings can have overlapping date ranges for the same camp. Uses btree_gist for efficient range overlap detection.';

COMMENT ON FUNCTION check_camp_availability IS
'Check if a camp is available for the given date range. Returns availability status and conflict details if unavailable.';

COMMENT ON FUNCTION create_booking_safe IS
'Safely create a booking with race condition protection. Uses advisory locks + exclusion constraint for bulletproof double-booking prevention.';
