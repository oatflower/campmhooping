-- ============================================================================
-- CAMPY DATABASE SCHEMA
-- Version: 1.1.0
-- Description: Production-ready schema for camping booking platform
-- Auth: Integrated with Supabase Auth via auth_user_id column and get_profile_id()
-- Migration: See 20241225000001_auth_rls_complete.sql for RLS policies
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: profiles
-- Description: User profile information
-- PDPA: Contains personal data (name, email, phone, avatar)
-- ============================================================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mock_user_id TEXT UNIQUE NOT NULL,  -- Legacy field; auth_user_id added via migration

    -- Personal Data (PDPA Protected)
    email TEXT NOT NULL,                 -- PDPA: Personal identifier
    name TEXT,                           -- PDPA: Personal identifier
    phone TEXT,                          -- PDPA: Personal identifier
    avatar_url TEXT,                     -- PDPA: May contain identifiable image

    -- Role & Status
    role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'HOST', 'ADMIN')),
    is_verified BOOLEAN DEFAULT FALSE,
    is_host BOOLEAN DEFAULT FALSE,

    -- Host-specific fields
    host_bio TEXT,
    host_languages TEXT[],               -- e.g., ['th', 'en']
    host_response_rate INTEGER CHECK (host_response_rate >= 0 AND host_response_rate <= 100),
    host_response_time TEXT,             -- e.g., 'within an hour'

    -- Preferences
    preferred_language TEXT DEFAULT 'th',
    preferred_currency TEXT DEFAULT 'THB',
    notification_settings JSONB DEFAULT '{"email": true, "push": true, "sms": false}'::jsonb,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ              -- Soft delete for PDPA compliance
);

-- ============================================================================
-- TABLE: camps
-- Description: Camp/property listings
-- PDPA: Contains host reference (indirect personal data)
-- ============================================================================
CREATE TABLE camps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Basic Info
    name TEXT NOT NULL,
    name_en TEXT,                        -- English translation
    slug TEXT UNIQUE,                    -- URL-friendly identifier
    description TEXT NOT NULL,
    description_en TEXT,

    -- Location
    location TEXT NOT NULL,              -- Display address
    location_en TEXT,
    province TEXT NOT NULL,
    district TEXT,
    coordinates JSONB,                   -- { lat: number, lng: number }
    show_exact_location BOOLEAN DEFAULT TRUE,

    -- Pricing
    price_per_night DECIMAL(10,2) NOT NULL CHECK (price_per_night >= 0),
    currency TEXT DEFAULT 'THB',

    -- Capacity
    max_guests INTEGER NOT NULL DEFAULT 2 CHECK (max_guests > 0 AND max_guests <= 100),

    -- Media
    images TEXT[] NOT NULL DEFAULT '{}',
    cover_image_index INTEGER DEFAULT 0,

    -- Classification
    accommodation_type TEXT NOT NULL DEFAULT 'tent'
        CHECK (accommodation_type IN ('tent', 'dome', 'cabin', 'rv', 'treehouse', 'other')),

    -- Features
    facilities TEXT[] DEFAULT '{}',      -- e.g., ['wifi', 'parking', 'bathroom']
    highlights TEXT[] DEFAULT '{}',      -- e.g., ['mountain view', 'near waterfall']
    rules TEXT[],                        -- House rules

    -- Booking Settings
    min_nights INTEGER DEFAULT 1 CHECK (min_nights >= 1),
    max_nights INTEGER DEFAULT 30 CHECK (max_nights >= 1),
    advance_notice_days INTEGER DEFAULT 1,
    instant_book BOOLEAN DEFAULT FALSE,

    -- Status & Flags
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'active', 'inactive', 'suspended')),
    is_popular BOOLEAN DEFAULT FALSE,
    is_beginner BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,

    -- Stats (denormalized for performance)
    rating_average DECIMAL(2,1) DEFAULT 0 CHECK (rating_average >= 0 AND rating_average <= 5),
    review_count INTEGER DEFAULT 0 CHECK (review_count >= 0),
    booking_count INTEGER DEFAULT 0 CHECK (booking_count >= 0),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

-- ============================================================================
-- TABLE: accommodations
-- Description: Specific accommodation options within a camp
-- ============================================================================
CREATE TABLE accommodations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,

    -- Basic Info
    name TEXT NOT NULL,
    name_en TEXT,
    description TEXT,
    description_en TEXT,

    -- Type & Capacity
    type TEXT NOT NULL CHECK (type IN ('tent', 'dome', 'cabin', 'rv', 'treehouse', 'other')),
    max_guests INTEGER NOT NULL DEFAULT 2 CHECK (max_guests > 0),

    -- Pricing
    price_per_night DECIMAL(10,2) NOT NULL CHECK (price_per_night >= 0),
    extra_adult_price DECIMAL(10,2) DEFAULT 0,
    extra_child_price DECIMAL(10,2) DEFAULT 0,

    -- Features
    amenities TEXT[] DEFAULT '{}',
    images TEXT[] DEFAULT '{}',

    -- Inventory
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),

    -- Status
    is_available BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: bookings
-- Description: Booking/reservation records
-- PDPA: Contains user reference and guest details (personal data)
-- ============================================================================
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- References
    user_id UUID NOT NULL REFERENCES profiles(id),
    camp_id UUID NOT NULL REFERENCES camps(id),
    accommodation_id UUID REFERENCES accommodations(id),

    -- Dates
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    nights INTEGER GENERATED ALWAYS AS (end_date - start_date) STORED,

    -- Guest Info (PDPA Protected)
    guest_count JSONB NOT NULL DEFAULT '{"adults": 1, "children": 0, "infants": 0}'::jsonb,
    guest_name TEXT,                     -- PDPA: May differ from profile name
    guest_email TEXT,                    -- PDPA: Contact for this booking
    guest_phone TEXT,                    -- PDPA: Contact for this booking
    special_requests TEXT,

    -- Pricing (snapshot at booking time)
    base_price DECIMAL(10,2) NOT NULL,
    extra_guest_price DECIMAL(10,2) DEFAULT 0,
    addon_price DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    service_fee DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
    currency TEXT DEFAULT 'THB',

    -- Addons
    addons JSONB DEFAULT '[]'::jsonb,    -- Array of addon objects

    -- Status
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'processing', 'confirmed', 'cancelled', 'completed', 'failed', 'refunded')),

    -- Payment
    payment_method TEXT CHECK (payment_method IN ('card', 'promptpay', 'bank', 'pay_at_camp')),
    payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid', 'refunded')),

    -- Cancellation
    cancelled_at TIMESTAMPTZ,
    cancelled_by TEXT,                   -- 'user', 'host', 'system'
    cancellation_reason TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT valid_date_range CHECK (end_date > start_date),
    CONSTRAINT valid_nights CHECK (end_date - start_date >= 1 AND end_date - start_date <= 365)
);

-- ============================================================================
-- TABLE: payments
-- Description: Payment transaction records
-- PDPA: Contains financial data (sensitive personal data)
-- ============================================================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,

    -- Transaction Info
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    currency TEXT DEFAULT 'THB',
    payment_method TEXT NOT NULL CHECK (payment_method IN ('card', 'promptpay', 'bank', 'pay_at_camp')),

    -- Status
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled')),

    -- Provider Info
    provider TEXT,                       -- e.g., 'stripe', 'omise', 'manual'
    provider_transaction_id TEXT,
    provider_response JSONB,             -- Store provider response for debugging

    -- Receipt (PDPA: May contain identifiable info)
    receipt_url TEXT,
    receipt_number TEXT,

    -- Card Info (PDPA Protected - store only last 4 digits)
    card_last_four TEXT,
    card_brand TEXT,                     -- e.g., 'visa', 'mastercard'

    -- Refund Info
    refund_amount DECIMAL(10,2),
    refund_reason TEXT,
    refunded_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- ============================================================================
-- TABLE: reviews
-- Description: User reviews for camps
-- PDPA: Contains user reference (indirect personal data)
-- ============================================================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- References
    user_id UUID NOT NULL REFERENCES profiles(id),
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id),     -- Optional: link to booking

    -- Review Content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT NOT NULL,

    -- Sub-ratings (optional)
    rating_cleanliness INTEGER CHECK (rating_cleanliness >= 1 AND rating_cleanliness <= 5),
    rating_location INTEGER CHECK (rating_location >= 1 AND rating_location <= 5),
    rating_value INTEGER CHECK (rating_value >= 1 AND rating_value <= 5),
    rating_communication INTEGER CHECK (rating_communication >= 1 AND rating_communication <= 5),

    -- Media
    images TEXT[] DEFAULT '{}',

    -- Host Response
    host_response TEXT,
    host_response_at TIMESTAMPTZ,

    -- Engagement
    helpful_count INTEGER DEFAULT 0 CHECK (helpful_count >= 0),

    -- Moderation
    status TEXT DEFAULT 'published' CHECK (status IN ('pending', 'published', 'hidden', 'removed')),
    reported_count INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints: One review per user per camp
    CONSTRAINT unique_user_camp_review UNIQUE (user_id, camp_id)
);

-- ============================================================================
-- TABLE: favorites
-- Description: User's favorited/wishlisted camps
-- ============================================================================
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,

    -- Optional: Wishlist organization
    list_name TEXT DEFAULT 'default',
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints: One favorite per user per camp per list
    CONSTRAINT unique_user_camp_favorite UNIQUE (user_id, camp_id, list_name)
);

-- ============================================================================
-- TABLE: blocked_dates
-- Description: Dates when a camp/accommodation is unavailable
-- ============================================================================
CREATE TABLE blocked_dates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    accommodation_id UUID REFERENCES accommodations(id) ON DELETE CASCADE,

    -- Date Range
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,

    -- Reason
    reason TEXT,                         -- e.g., 'maintenance', 'private event', 'seasonal closure'
    block_type TEXT DEFAULT 'manual' CHECK (block_type IN ('manual', 'booking', 'maintenance', 'seasonal')),

    -- Metadata
    created_by UUID REFERENCES profiles(id),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_blocked_range CHECK (end_date >= start_date)
);

-- ============================================================================
-- TABLE: messages (Optional - for host-guest communication)
-- PDPA: Contains personal communication
-- ============================================================================
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Participants
    sender_id UUID NOT NULL REFERENCES profiles(id),
    recipient_id UUID NOT NULL REFERENCES profiles(id),

    -- Context
    booking_id UUID REFERENCES bookings(id),
    camp_id UUID REFERENCES camps(id),

    -- Content (PDPA Protected)
    content TEXT NOT NULL,
    attachments TEXT[] DEFAULT '{}',

    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ               -- Soft delete
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Profiles
CREATE INDEX idx_profiles_mock_user_id ON profiles(mock_user_id);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role) WHERE deleted_at IS NULL;

-- Camps
CREATE INDEX idx_camps_host_id ON camps(host_id);
CREATE INDEX idx_camps_province ON camps(province) WHERE status = 'active' AND deleted_at IS NULL;
CREATE INDEX idx_camps_status ON camps(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_camps_accommodation_type ON camps(accommodation_type) WHERE status = 'active';
CREATE INDEX idx_camps_price ON camps(price_per_night) WHERE status = 'active';
CREATE INDEX idx_camps_rating ON camps(rating_average DESC) WHERE status = 'active';
CREATE INDEX idx_camps_popular ON camps(is_popular) WHERE status = 'active' AND is_popular = TRUE;
CREATE INDEX idx_camps_coordinates ON camps USING GIN (coordinates) WHERE coordinates IS NOT NULL;

-- Accommodations
CREATE INDEX idx_accommodations_camp_id ON accommodations(camp_id);
CREATE INDEX idx_accommodations_available ON accommodations(camp_id) WHERE is_available = TRUE;

-- Bookings
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_camp_id ON bookings(camp_id);
CREATE INDEX idx_bookings_dates ON bookings(camp_id, start_date, end_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_created ON bookings(created_at DESC);

-- Unique constraint to prevent double booking (Critical Issue - Race Condition)
CREATE UNIQUE INDEX idx_bookings_no_overlap ON bookings(camp_id, start_date, end_date)
    WHERE status IN ('pending', 'processing', 'confirmed');

-- Payments
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Reviews
CREATE INDEX idx_reviews_camp_id ON reviews(camp_id) WHERE status = 'published';
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(camp_id, rating) WHERE status = 'published';

-- Favorites
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_camp_id ON favorites(camp_id);

-- Blocked Dates
CREATE INDEX idx_blocked_dates_camp ON blocked_dates(camp_id, start_date, end_date);
CREATE INDEX idx_blocked_dates_accommodation ON blocked_dates(accommodation_id, start_date, end_date)
    WHERE accommodation_id IS NOT NULL;

-- Messages
CREATE INDEX idx_messages_recipient ON messages(recipient_id, is_read) WHERE deleted_at IS NULL;
CREATE INDEX idx_messages_booking ON messages(booking_id) WHERE booking_id IS NOT NULL;

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update camp stats after review
CREATE OR REPLACE FUNCTION update_camp_review_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE camps SET
            rating_average = (
                SELECT COALESCE(AVG(rating)::DECIMAL(2,1), 0)
                FROM reviews
                WHERE camp_id = NEW.camp_id AND status = 'published'
            ),
            review_count = (
                SELECT COUNT(*)
                FROM reviews
                WHERE camp_id = NEW.camp_id AND status = 'published'
            ),
            updated_at = NOW()
        WHERE id = NEW.camp_id;
    END IF;

    IF TG_OP = 'DELETE' THEN
        UPDATE camps SET
            rating_average = (
                SELECT COALESCE(AVG(rating)::DECIMAL(2,1), 0)
                FROM reviews
                WHERE camp_id = OLD.camp_id AND status = 'published'
            ),
            review_count = (
                SELECT COUNT(*)
                FROM reviews
                WHERE camp_id = OLD.camp_id AND status = 'published'
            ),
            updated_at = NOW()
        WHERE id = OLD.camp_id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_camps_updated_at
    BEFORE UPDATE ON camps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_accommodations_updated_at
    BEFORE UPDATE ON accommodations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-update camp review stats
CREATE TRIGGER trg_update_camp_review_stats
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_camp_review_stats();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) - Placeholder for future auth integration
-- ============================================================================

-- Enable RLS on all tables (will be enforced when policies are added)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE camps ENABLE ROW LEVEL SECURITY;
ALTER TABLE accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Temporary: Allow all operations for development (mock auth)
-- IMPORTANT: Replace with proper RLS policies before production auth
CREATE POLICY "Allow all for development" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for development" ON camps FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for development" ON accommodations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for development" ON bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for development" ON payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for development" ON reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for development" ON favorites FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for development" ON blocked_dates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for development" ON messages FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- SEED DATA (Optional - for development)
-- ============================================================================

-- Create a mock user for development
INSERT INTO profiles (mock_user_id, email, name, role, is_verified)
VALUES ('mock_user_1', 'demo@campy.com', 'Demo User', 'USER', true)
ON CONFLICT (mock_user_id) DO NOTHING;

-- Create a mock host for development
INSERT INTO profiles (mock_user_id, email, name, role, is_verified, is_host)
VALUES ('mock_host_1', 'host@campy.com', 'Demo Host', 'HOST', true, true)
ON CONFLICT (mock_user_id) DO NOTHING;
