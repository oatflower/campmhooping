-- Migration: Add Camp Zones and Pitches tables
-- This supports the Zone/Pitch selection feature (like cinema seat selection)

-- Create camp_zones table
create table camp_zones (
  id uuid default gen_random_uuid() primary key,
  camp_id uuid references camps(id) on delete cascade not null,
  name text not null,
  name_en text not null,
  description text,
  description_en text,
  features text[] default '{}',
  price_modifier integer default 0, -- Percentage modifier (e.g., 10 = +10%, -5 = -5%)
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create camp_pitches table
create table camp_pitches (
  id uuid default gen_random_uuid() primary key,
  zone_id uuid references camp_zones(id) on delete cascade not null,
  name text not null, -- e.g., "A1", "A2", "B1"
  size text not null check (size in ('small', 'medium', 'large')),
  max_tents integer default 1,
  status text default 'available' check (status in ('available', 'booked', 'maintenance')),
  features text[] default '{}',
  position_x integer, -- For visual map placement
  position_y integer,
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add zone and pitch references to bookings table
alter table bookings add column zone_id uuid references camp_zones(id);
alter table bookings add column pitch_id uuid references camp_pitches(id);

-- Enable RLS on camp_zones
alter table camp_zones enable row level security;

-- Zones are viewable by everyone (for browsing)
create policy "Camp zones are viewable by everyone." on camp_zones
  for select using (true);

-- Hosts can manage zones for their own camps
create policy "Hosts can insert zones for their camps." on camp_zones
  for insert with check (
    exists (
      select 1 from camps
      where camps.id = camp_zones.camp_id
      and camps.host_id = auth.uid()
    )
  );

create policy "Hosts can update zones for their camps." on camp_zones
  for update using (
    exists (
      select 1 from camps
      where camps.id = camp_zones.camp_id
      and camps.host_id = auth.uid()
    )
  );

create policy "Hosts can delete zones for their camps." on camp_zones
  for delete using (
    exists (
      select 1 from camps
      where camps.id = camp_zones.camp_id
      and camps.host_id = auth.uid()
    )
  );

-- Enable RLS on camp_pitches
alter table camp_pitches enable row level security;

-- Pitches are viewable by everyone (for browsing)
create policy "Camp pitches are viewable by everyone." on camp_pitches
  for select using (true);

-- Hosts can manage pitches for their own camps
create policy "Hosts can insert pitches for their zones." on camp_pitches
  for insert with check (
    exists (
      select 1 from camp_zones
      join camps on camps.id = camp_zones.camp_id
      where camp_zones.id = camp_pitches.zone_id
      and camps.host_id = auth.uid()
    )
  );

create policy "Hosts can update pitches for their zones." on camp_pitches
  for update using (
    exists (
      select 1 from camp_zones
      join camps on camps.id = camp_zones.camp_id
      where camp_zones.id = camp_pitches.zone_id
      and camps.host_id = auth.uid()
    )
  );

create policy "Hosts can delete pitches for their zones." on camp_pitches
  for delete using (
    exists (
      select 1 from camp_zones
      join camps on camps.id = camp_zones.camp_id
      where camp_zones.id = camp_pitches.zone_id
      and camps.host_id = auth.uid()
    )
  );

-- Create indexes for better performance
create index idx_camp_zones_camp_id on camp_zones(camp_id);
create index idx_camp_pitches_zone_id on camp_pitches(zone_id);
create index idx_camp_pitches_status on camp_pitches(status);
create index idx_bookings_zone_id on bookings(zone_id);
create index idx_bookings_pitch_id on bookings(pitch_id);

-- Function to update pitch status when booking is created/updated
create or replace function update_pitch_status_on_booking()
returns trigger as $$
begin
  -- When a booking is confirmed, mark the pitch as booked
  if NEW.status = 'confirmed' and NEW.pitch_id is not null then
    update camp_pitches
    set status = 'booked'
    where id = NEW.pitch_id;
  end if;

  -- When a booking is cancelled, mark the pitch as available
  if NEW.status = 'cancelled' and NEW.pitch_id is not null then
    update camp_pitches
    set status = 'available'
    where id = NEW.pitch_id;
  end if;

  return NEW;
end;
$$ language plpgsql security definer;

-- Note: Pitch status should be managed based on actual booking dates
-- This trigger is simplified; production should check date ranges

create trigger on_booking_status_change
  after insert or update of status on bookings
  for each row
  when (NEW.pitch_id is not null)
  execute procedure update_pitch_status_on_booking();

-- Trigger to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  NEW.updated_at = timezone('utc'::text, now());
  return NEW;
end;
$$ language plpgsql;

create trigger update_camp_zones_updated_at
  before update on camp_zones
  for each row execute procedure update_updated_at_column();

create trigger update_camp_pitches_updated_at
  before update on camp_pitches
  for each row execute procedure update_updated_at_column();
