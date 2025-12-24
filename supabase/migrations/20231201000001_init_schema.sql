-- Create a table for public profiles (linked to auth.users)
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  name text,
  avatar_url text,
  role text default 'USER',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Create a table for Camps
create table camps (
  id uuid default gen_random_uuid() primary key,
  host_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  description text,
  price_per_night numeric not null,
  location text,
  images text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on camps
alter table camps enable row level security;

create policy "Camps are viewable by everyone." on camps
  for select using (true);

create policy "Hosts can insert their own camps." on camps
  for insert with check (auth.uid() = host_id);

create policy "Hosts can update their own camps." on camps
  for update using (auth.uid() = host_id);

-- Create a table for Bookings
create table bookings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  camp_id uuid references camps(id) on delete cascade not null,
  start_date date not null,
  end_date date not null,
  status text default 'pending', -- pending, confirmed, cancelled
  total_price numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on bookings
alter table bookings enable row level security;

create policy "Users can view their own bookings." on bookings
  for select using (auth.uid() = user_id);

-- Security Enhancement: Ensure hosts only see bookings for camps they own
create policy "Hosts can view bookings for their camps." on bookings
  for select using (
    exists (
      select 1 from camps
      where camps.id = bookings.camp_id
      and camps.host_id = auth.uid()
    )
  );

-- Allow users to update their own bookings (e.g., cancel)
create policy "Users can update their own bookings." on bookings
  for update using (auth.uid() = user_id);

-- Hosts can update bookings for their camps (e.g., confirm)
create policy "Hosts can update bookings for their camps." on bookings
  for update using (
    exists (
      select 1 from camps
      where camps.id = bookings.camp_id
      and camps.host_id = auth.uid()
    )
  );

-- Users can delete (cancel) their own bookings
create policy "Users can delete their own bookings." on bookings
  for delete using (auth.uid() = user_id);

-- Hosts can delete their own camps
create policy "Hosts can delete their own camps." on camps
  for delete using (auth.uid() = host_id);

-- Users can delete their own profile
create policy "Users can delete their own profile." on profiles
  for delete using (auth.uid() = id);

-- Add constraint to prevent overlapping bookings
-- Note: Requires btree_gist extension for daterange exclusion
-- CREATE EXTENSION IF NOT EXISTS btree_gist;
-- ALTER TABLE bookings ADD CONSTRAINT no_overlapping_bookings
--   EXCLUDE USING GIST (camp_id WITH =, daterange(start_date, end_date, '[]') WITH &&)
--   WHERE (status != 'cancelled');

-- Add check constraints for data integrity
alter table camps add constraint valid_price check (price_per_night > 0);
alter table bookings add constraint valid_booking_price check (total_price > 0);
alter table bookings add constraint valid_date_range check (end_date > start_date);

create policy "Users can insert their own bookings." on bookings
  for insert with check (auth.uid() = user_id);

-- Trigger to automatically create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
