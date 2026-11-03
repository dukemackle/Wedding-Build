-- How people found us (src/lib/attribution.ts). Admin-only reads: the
-- submission tables already have RLS on with no public policies, and the new
-- signup_sources table gets the same.

alter table venue_submissions
  add column if not exists heard_from text,
  add column if not exists arrived_via text,
  add column if not exists first_touch jsonb;

alter table vendor_submissions
  add column if not exists heard_from text,
  add column if not exists arrived_via text,
  add column if not exists first_touch jsonb;

create table if not exists signup_sources (
  user_id uuid primary key references auth.users (id) on delete cascade,
  heard_from text,
  first_touch jsonb,
  created_at timestamptz not null default now()
);
alter table signup_sources enable row level security;
