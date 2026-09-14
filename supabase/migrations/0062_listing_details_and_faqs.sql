-- Richer venue detail, matching what couples expect from a real venue
-- listing (the kind of info competitors' vendor-written storefronts
-- carry). These stay empty on the ~1,275 synthetic seed venues -- they
-- get filled in per venue as real ones are onboarded, rather than
-- inventing facts about placeholder listings.
alter table venues add column if not exists about text;
alter table venues add column if not exists included text;
alter table venues add column if not exists amenities text[] not null default '{}';

-- Free-form Q&A, so a venue's specifics (distance from the airport,
-- peak season, alcohol policy, hours included) don't each need their own
-- column -- the questions vary too much venue to venue.
create table if not exists venue_faqs (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references venues (id) on delete cascade,
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists venue_faqs_venue_id_idx on venue_faqs (venue_id, sort_order);

-- Same read-for-everyone / write-by-admin-only shape as the venues table
-- itself: the catalog is reference data, not per-couple data.
alter table venue_faqs enable row level security;

drop policy if exists "venue_faqs_read_all" on venue_faqs;
create policy "venue_faqs_read_all" on venue_faqs
  for select using (true);

-- Same treatment for vendors, so a photographer or caterer listing can
-- carry the same depth as a venue once a real one is onboarded.
alter table vendors add column if not exists about text;
alter table vendors add column if not exists included text;
alter table vendors add column if not exists amenities text[] not null default '{}';
alter table vendors add column if not exists is_sample boolean not null default false;

-- Every vendor currently in the table came from the same synthetic seed
-- as the venues (migration 0018), so they all get flagged as samples.
update vendors set is_sample = true;

create table if not exists vendor_faqs (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references vendors (id) on delete cascade,
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists vendor_faqs_vendor_id_idx on vendor_faqs (vendor_id, sort_order);

alter table vendor_faqs enable row level security;

drop policy if exists "vendor_faqs_read_all" on vendor_faqs;
create policy "vendor_faqs_read_all" on vendor_faqs
  for select using (true);
