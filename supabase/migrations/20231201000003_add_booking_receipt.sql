-- Add receipt_url to bookings table for bank transfer slips
alter table bookings
add column if not exists receipt_url text;

-- Storage bucket setup for payment slips
-- Note: Run these commands in Supabase SQL Editor or via supabase CLI

-- Create the payment-slips bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-slips',
  'payment-slips',
  false,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

-- SECURITY: Storage RLS Policies for payment-slips bucket
-- Users can only upload files to their own folder
CREATE POLICY "Users can upload own payment slips"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'payment-slips'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can only view their own payment slips
CREATE POLICY "Users can view own payment slips"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-slips'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own payment slips
CREATE POLICY "Users can delete own payment slips"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'payment-slips'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Hosts can view payment slips for their camps' bookings
CREATE POLICY "Hosts can view payment slips for their bookings"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-slips'
  AND EXISTS (
    SELECT 1 FROM bookings b
    JOIN camps c ON b.camp_id = c.id
    WHERE b.receipt_url LIKE '%' || name || '%'
    AND c.host_id = auth.uid()
  )
);
