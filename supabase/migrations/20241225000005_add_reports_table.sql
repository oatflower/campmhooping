-- Migration: Add Reports table for Notice and Takedown compliance
-- This supports the Report Listing feature for legal compliance

-- Create reports table
create table reports (
  id uuid default gen_random_uuid() primary key,
  camp_id uuid references camps(id) on delete cascade not null,
  camp_name text not null, -- Stored for record-keeping even if camp is deleted
  reason text not null check (reason in ('inaccurate', 'scam', 'offensive', 'photos', 'other')),
  details text,
  reporter_id uuid references profiles(id) on delete set null, -- Can be null for anonymous reports
  reporter_email text,
  status text default 'pending' check (status in ('pending', 'reviewing', 'resolved', 'dismissed')),
  admin_notes text, -- Internal notes for admin review
  resolved_at timestamp with time zone,
  resolved_by uuid references profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on reports
alter table reports enable row level security;

-- Users can submit reports (insert)
create policy "Authenticated users can submit reports." on reports
  for insert with check (
    auth.uid() is not null
  );

-- Users can view their own reports
create policy "Users can view their own reports." on reports
  for select using (
    auth.uid() = reporter_id
  );

-- Hosts can view reports about their camps (for transparency)
create policy "Hosts can view reports for their camps." on reports
  for select using (
    exists (
      select 1 from camps
      where camps.id = reports.camp_id
      and camps.host_id = auth.uid()
    )
  );

-- Admin policy: Users with role 'ADMIN' can manage all reports
create policy "Admins can view all reports." on reports
  for select using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'ADMIN'
    )
  );

create policy "Admins can update all reports." on reports
  for update using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'ADMIN'
    )
  );

create policy "Admins can delete reports." on reports
  for delete using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'ADMIN'
    )
  );

-- Create indexes for better performance
create index idx_reports_camp_id on reports(camp_id);
create index idx_reports_reporter_id on reports(reporter_id);
create index idx_reports_status on reports(status);
create index idx_reports_created_at on reports(created_at desc);

-- Trigger to update updated_at timestamp
create trigger update_reports_updated_at
  before update on reports
  for each row execute procedure update_updated_at_column();

-- Function to auto-set resolved_at when status changes to resolved
create or replace function update_report_resolved_at()
returns trigger as $$
begin
  if NEW.status in ('resolved', 'dismissed') and OLD.status not in ('resolved', 'dismissed') then
    NEW.resolved_at = timezone('utc'::text, now());
    NEW.resolved_by = auth.uid();
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_report_status_resolved
  before update of status on reports
  for each row
  execute procedure update_report_resolved_at();

-- Create a view for admin dashboard statistics
create or replace view report_statistics as
select
  count(*) as total_reports,
  count(*) filter (where status = 'pending') as pending_reports,
  count(*) filter (where status = 'reviewing') as reviewing_reports,
  count(*) filter (where status = 'resolved') as resolved_reports,
  count(*) filter (where status = 'dismissed') as dismissed_reports,
  count(*) filter (where created_at > now() - interval '7 days') as reports_last_7_days,
  count(*) filter (where created_at > now() - interval '30 days') as reports_last_30_days
from reports;

-- Grant access to the view
grant select on report_statistics to authenticated;
