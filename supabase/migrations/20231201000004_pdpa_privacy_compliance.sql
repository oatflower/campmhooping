-- PDPA Privacy Compliance Migration
-- Adds consent tracking, data retention, and user rights support

-- ============================================
-- 1. CONSENT TRACKING
-- ============================================

-- User consent preferences table
CREATE TABLE IF NOT EXISTS user_consent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Consent types
    consent_essential BOOLEAN NOT NULL DEFAULT TRUE,
    consent_analytics BOOLEAN NOT NULL DEFAULT FALSE,
    consent_marketing BOOLEAN NOT NULL DEFAULT FALSE,
    consent_personalization BOOLEAN NOT NULL DEFAULT FALSE,

    -- Metadata
    consent_version VARCHAR(10) NOT NULL DEFAULT '1.0',
    ip_address INET,
    user_agent TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(user_id)
);

-- Consent history for audit trail (PDPA requires proof of consent)
CREATE TABLE IF NOT EXISTS consent_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- What changed
    consent_type VARCHAR(50) NOT NULL, -- 'analytics', 'marketing', 'personalization', 'all'
    action VARCHAR(20) NOT NULL, -- 'granted', 'withdrawn', 'updated'
    previous_value BOOLEAN,
    new_value BOOLEAN,

    -- Context
    consent_version VARCHAR(10) NOT NULL,
    ip_address INET,
    user_agent TEXT,

    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. DATA RETENTION FIELDS
-- ============================================

-- Add retention fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS
    deletion_requested_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS
    deletion_scheduled_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS
    deletion_reason TEXT;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS
    data_retention_until TIMESTAMP WITH TIME ZONE;

-- Add privacy policy acceptance tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS
    privacy_policy_accepted_version VARCHAR(10);

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS
    privacy_policy_accepted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS
    terms_accepted_version VARCHAR(10);

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS
    terms_accepted_at TIMESTAMP WITH TIME ZONE;

-- Add retention to bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS
    data_retention_until TIMESTAMP WITH TIME ZONE;

-- Add retention to messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS
    data_retention_until TIMESTAMP WITH TIME ZONE;

-- ============================================
-- 3. USER DATA ACCESS LOG (Audit Trail)
-- ============================================

CREATE TABLE IF NOT EXISTS data_access_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    accessed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- What was accessed
    access_type VARCHAR(50) NOT NULL, -- 'view', 'export', 'delete', 'update'
    data_category VARCHAR(50) NOT NULL, -- 'profile', 'bookings', 'messages', 'all'

    -- Context
    ip_address INET,
    user_agent TEXT,
    reason TEXT,

    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. DELETION LOG (For compliance proof)
-- ============================================

CREATE TABLE IF NOT EXISTS deletion_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Anonymized reference (user_id is nullified on delete)
    original_user_id UUID,
    anonymized_email VARCHAR(255), -- Hashed or partially redacted

    -- Deletion details
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_by UUID, -- Could be user themselves or admin
    deletion_type VARCHAR(20) NOT NULL, -- 'user_request', 'retention_expiry', 'admin'
    reason TEXT,

    -- What was deleted
    data_categories_deleted TEXT[], -- ['profile', 'bookings', 'messages']
    data_exported_before_deletion BOOLEAN DEFAULT FALSE
);

-- ============================================
-- 5. DATA EXPORT REQUESTS
-- ============================================

CREATE TABLE IF NOT EXISTS data_export_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'

    -- Export details
    format VARCHAR(10) NOT NULL DEFAULT 'json', -- 'json', 'csv'
    download_url TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,

    -- Error tracking
    error_message TEXT
);

-- ============================================
-- 6. ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on new tables
ALTER TABLE user_consent ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_export_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE deletion_log ENABLE ROW LEVEL SECURITY;

-- Deletion log: Admin-only access (contains sensitive audit data)
-- No user policies - only service role can access for compliance audits
CREATE POLICY "deletion_log_admin_only"
    ON deletion_log FOR ALL
    USING (false)
    WITH CHECK (false);

-- User consent: Users can only see/modify their own consent
CREATE POLICY "Users can view own consent"
    ON user_consent FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own consent"
    ON user_consent FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consent"
    ON user_consent FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Consent log: Users can view their own consent history
CREATE POLICY "Users can view own consent history"
    ON consent_log FOR SELECT
    USING (auth.uid() = user_id);

-- Data access log: Users can view accesses to their data
CREATE POLICY "Users can view own data access log"
    ON data_access_log FOR SELECT
    USING (auth.uid() = user_id);

-- Data export requests: Users can manage their own export requests
CREATE POLICY "Users can view own export requests"
    ON data_export_requests FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create export requests"
    ON data_export_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 7. HELPER FUNCTIONS
-- ============================================

-- Function to update last_active_at
CREATE OR REPLACE FUNCTION update_last_active()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles
    SET last_active_at = NOW()
    WHERE id = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log consent changes
CREATE OR REPLACE FUNCTION log_consent_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        -- Log analytics consent change
        IF OLD.consent_analytics IS DISTINCT FROM NEW.consent_analytics THEN
            INSERT INTO consent_log (user_id, consent_type, action, previous_value, new_value, consent_version)
            VALUES (NEW.user_id, 'analytics',
                    CASE WHEN NEW.consent_analytics THEN 'granted' ELSE 'withdrawn' END,
                    OLD.consent_analytics, NEW.consent_analytics, NEW.consent_version);
        END IF;

        -- Log marketing consent change
        IF OLD.consent_marketing IS DISTINCT FROM NEW.consent_marketing THEN
            INSERT INTO consent_log (user_id, consent_type, action, previous_value, new_value, consent_version)
            VALUES (NEW.user_id, 'marketing',
                    CASE WHEN NEW.consent_marketing THEN 'granted' ELSE 'withdrawn' END,
                    OLD.consent_marketing, NEW.consent_marketing, NEW.consent_version);
        END IF;

        -- Log personalization consent change
        IF OLD.consent_personalization IS DISTINCT FROM NEW.consent_personalization THEN
            INSERT INTO consent_log (user_id, consent_type, action, previous_value, new_value, consent_version)
            VALUES (NEW.user_id, 'personalization',
                    CASE WHEN NEW.consent_personalization THEN 'granted' ELSE 'withdrawn' END,
                    OLD.consent_personalization, NEW.consent_personalization, NEW.consent_version);
        END IF;
    ELSIF TG_OP = 'INSERT' THEN
        -- Log initial consent
        INSERT INTO consent_log (user_id, consent_type, action, previous_value, new_value, consent_version)
        VALUES (NEW.user_id, 'all', 'granted', NULL, TRUE, NEW.consent_version);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for consent logging
CREATE TRIGGER consent_change_trigger
    AFTER INSERT OR UPDATE ON user_consent
    FOR EACH ROW EXECUTE FUNCTION log_consent_change();

-- Function to set booking data retention (24 hours after checkout per spec)
CREATE OR REPLACE FUNCTION set_booking_retention()
RETURNS TRIGGER AS $$
BEGIN
    -- Set retention to 24 hours after checkout date
    NEW.data_retention_until := NEW.check_out_date + INTERVAL '24 hours';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for booking retention
CREATE TRIGGER booking_retention_trigger
    BEFORE INSERT OR UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION set_booking_retention();

-- ============================================
-- 8. INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_consent_user_id ON user_consent(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_log_user_id ON consent_log(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_log_created_at ON consent_log(created_at);
CREATE INDEX IF NOT EXISTS idx_data_access_log_user_id ON data_access_log(user_id);
CREATE INDEX IF NOT EXISTS idx_data_export_requests_user_id ON data_export_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_data_export_requests_status ON data_export_requests(status);
CREATE INDEX IF NOT EXISTS idx_profiles_deletion_scheduled ON profiles(deletion_scheduled_at) WHERE deletion_scheduled_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_retention ON bookings(data_retention_until) WHERE data_retention_until IS NOT NULL;

-- ============================================
-- 9. COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE user_consent IS 'Stores user consent preferences for PDPA compliance';
COMMENT ON TABLE consent_log IS 'Audit trail of all consent changes for PDPA proof of consent';
COMMENT ON TABLE data_access_log IS 'Tracks who accessed what user data and when';
COMMENT ON TABLE deletion_log IS 'Records of deleted user data for compliance verification';
COMMENT ON TABLE data_export_requests IS 'Tracks user data portability requests (PDPA Article 32)';
