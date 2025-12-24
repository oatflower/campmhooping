-- Add new columns to camps table for better filtering
alter table camps 
add column if not exists province text,
add column if not exists max_guests integer default 2,
add column if not exists accommodation_type text default 'tent',
add column if not exists facilities text[] default '{}',
add column if not exists highlights text[] default '{}',
add column if not exists is_popular boolean default false,
add column if not exists is_beginner boolean default false,
add column if not exists coordinates jsonb default '{"lat": 13.7, "lng": 100.5}';

-- Update RLS if needed (existing policies cover update/insert if column list changes, usually)
-- But we might want to index these for performance later. For now, this is enough.
