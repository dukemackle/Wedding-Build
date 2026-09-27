-- Venues and vendors listing themselves, and vendors editing their listings.
--
-- "List your business" (linked from the login page) creates the listing as an
-- inactive row with source = 'self-listed' and hands back a private edit link.
-- The business fills in the rest through that link, and nothing appears to
-- couples until the admin approves it -- same rule as venue claims (0083).
--
-- Venues already have claim links and submissions. This adds the same pair
-- for vendors. Written only by server actions using the service role after
-- they've checked the link's token, so RLS is on with no policies at all.

create table if not exists vendor_claim_links (
  vendor_id uuid primary key references vendors (id) on delete cascade,
  token text not null unique,
  created_at timestamptz not null default now()
);

alter table vendor_claim_links enable row level security;

create table if not exists vendor_submissions (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references vendors (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  submitter_name text not null,
  submitter_email text not null,
  submitter_role text,
  -- Vendor columns as the vendor wants them: name, category, city, about...
  details jsonb not null default '{}',
  -- The listing's photo. Vendors show a single photo today (image_url).
  photo_url text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists vendor_submissions_pending_idx
  on vendor_submissions (created_at) where status = 'pending';

alter table vendor_submissions enable row level security;

-- "Edit my listing" looks listings up by email, case-insensitively.
create index if not exists venues_contact_email_idx on venues (lower(contact_email));
create index if not exists vendors_contact_email_idx on vendors (lower(contact_email));

-- Public, like venue-photos. Uploads only through signed URLs handed to a
-- valid claim link, so no insert policy.
insert into storage.buckets (id, name, public)
values ('vendor-photos', 'vendor-photos', true)
on conflict (id) do nothing;
