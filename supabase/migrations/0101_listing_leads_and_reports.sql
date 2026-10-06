-- Leads a listing gets outside the inquiry form: a couple tapping its phone
-- number or opening its website. Together with vendor_inquiries /
-- venue_inquiries this is the count we show a vendor ("N couples contacted you
-- through You Do, I Do"). Written by /api/contact-click with the service role.
create table if not exists listing_contact_clicks (
  id uuid primary key default gen_random_uuid(),
  listing_type text not null check (listing_type in ('venue', 'vendor')),
  listing_id uuid not null,
  kind text not null check (kind in ('phone', 'website', 'social')),
  created_at timestamptz not null default now()
);

create index if not exists listing_contact_clicks_listing_idx
  on listing_contact_clicks (listing_type, listing_id);

-- "Report a problem" on a listing page: closed, wrong price, dead link... The
-- admin works these on /admin/listing-health. Inserted by a server action with
-- the service role, so anyone (signed in or not) can report.
create table if not exists listing_reports (
  id uuid primary key default gen_random_uuid(),
  listing_type text not null check (listing_type in ('venue', 'vendor')),
  listing_id uuid not null,
  reason text not null check (reason in ('closed', 'contact', 'price', 'details', 'photos', 'other')),
  details text check (char_length(details) <= 1000),
  reporter_email text check (char_length(reporter_email) <= 200),
  status text not null default 'open' check (status in ('open', 'fixed', 'dismissed')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists listing_reports_status_idx on listing_reports (status, created_at desc);

-- Both are written and read only with the service role.
alter table listing_contact_clicks enable row level security;
alter table listing_reports enable row level security;
