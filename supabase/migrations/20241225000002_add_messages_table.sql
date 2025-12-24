-- ============================================================================
-- MIGRATION: Add messages table for user-host communication
-- ============================================================================

-- Create messages table if not exists
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Participants
    sender_id UUID NOT NULL REFERENCES profiles(id),
    recipient_id UUID NOT NULL REFERENCES profiles(id),

    -- Context
    booking_id UUID REFERENCES bookings(id),
    camp_id UUID REFERENCES camps(id),

    -- Content
    content TEXT NOT NULL,
    attachments TEXT[] DEFAULT '{}',

    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id, is_read) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_messages_booking ON messages(booking_id) WHERE booking_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC) WHERE deleted_at IS NULL;

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "messages_select_participant" ON messages;
DROP POLICY IF EXISTS "messages_insert_own" ON messages;
DROP POLICY IF EXISTS "messages_update_recipient" ON messages;
DROP POLICY IF EXISTS "messages_delete_sender" ON messages;

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

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
