-- Vendors claiming and correcting their own listings -- the same flow venues
-- got in 0083/0084: a private link, a pre-filled form, and nothing live until
-- the admin approves it. See 0083 for why every table here is written only by
-- the service role and has no write policies.

-- What a couple needs from a vendor listing that the table couldn't hold.
alter table vendors add column if not exists photo_urls text[] not null default '{}';
alter table vendors add column if not exists contact_phone text;
alter table vendors add column if not exists website text;
-- Vendors travel to the wedding, so where they work matters more than where
-- they're based: "Austin + 100 miles", "All of Central Texas".
alter table vendors add column if not exists service_area text;
-- "From $3,200 per event". The unit is the point: a caterer's $65 and a
-- photographer's $3,200 are both "starting prices" and mean nothing compared
-- without it.
alter table vendors add column if not exists price_from integer;
alter table vendors add column if not exists price_unit text
  check (price_unit in ('event', 'guest', 'hour', 'package'));
alter table vendors add column if not exists price_note text;
alter table vendors add column if not exists instagram_url text;
alter table vendors add column if not exists facebook_url text;
alter table vendors add column if not exists pinterest_url text;

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
  details jsonb not null default '{}',
  faqs jsonb not null default '[]',
  photo_urls text[] not null default '{}',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);
create index if not exists vendor_submissions_pending_idx
  on vendor_submissions (created_at) where status = 'pending';
alter table vendor_submissions enable row level security;

insert into storage.buckets (id, name, public)
values ('vendor-photos', 'vendor-photos', true)
on conflict (id) do nothing;
