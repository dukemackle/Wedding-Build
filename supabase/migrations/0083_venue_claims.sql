-- Venues claiming and correcting their own listings.
--
-- A venue gets a private link (no account), opens its listing pre-filled,
-- corrects it, adds photos and its preferred vendors, and submits. Nothing
-- goes live from that submission until the admin approves it: the link is the
-- only credential, links get forwarded, and a directory that publishes
-- whatever a stranger types is worse than one that's out of date.
--
-- Every table here is written only by server actions using the service role,
-- after they've checked the link's token. So RLS is on with no write policies
-- at all -- anon and signed-in users get nothing but the one public read below.

-- Photos beyond the cover. `image_url` stays the cover (the first photo) so
-- every existing card, map pin and similar-venues tile keeps working unchanged.
alter table venues add column if not exists photo_urls text[] not null default '{}';

-- ---------------------------------------------------------------------------
-- Claim links
-- ---------------------------------------------------------------------------

-- One live link per venue. Regenerating a link replaces the row, which is how
-- a forwarded or leaked link is revoked.
create table if not exists venue_claim_links (
  venue_id uuid primary key references venues (id) on delete cascade,
  token text not null unique,
  created_at timestamptz not null default now()
);

alter table venue_claim_links enable row level security;

-- ---------------------------------------------------------------------------
-- Submissions waiting for review
-- ---------------------------------------------------------------------------

-- The whole proposed listing is kept as submitted, not merged field by field,
-- so the review screen can show exactly what the venue asked for next to what
-- is live, and a rejected submission leaves the listing untouched.
create table if not exists venue_submissions (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references venues (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  submitter_name text not null,
  submitter_email text not null,
  submitter_role text,
  -- Venue columns as the venue wants them: name, city, capacity, about...
  details jsonb not null default '{}',
  -- [{question, answer}]
  faqs jsonb not null default '[]',
  -- [{category, name, website}]
  preferred_vendors jsonb not null default '[]',
  -- Cover first. Already uploaded to the venue-photos bucket.
  photo_urls text[] not null default '{}',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists venue_submissions_pending_idx
  on venue_submissions (created_at) where status = 'pending';

alter table venue_submissions enable row level security;

-- ---------------------------------------------------------------------------
-- Preferred vendors, as shown to couples
-- ---------------------------------------------------------------------------

create table if not exists venue_preferred_vendors (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references venues (id) on delete cascade,
  category text not null,
  name text not null,
  website text,
  -- Set when the vendor is also listed on Wren, so the couple lands on its
  -- Wren page (inquiry, favourites) instead of leaving the site.
  vendor_id uuid references vendors (id) on delete set null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists venue_preferred_vendors_venue_idx
  on venue_preferred_vendors (venue_id, sort_order);

alter table venue_preferred_vendors enable row level security;

drop policy if exists "anyone can read preferred vendors of active venues" on venue_preferred_vendors;
create policy "anyone can read preferred vendors of active venues"
  on venue_preferred_vendors for select
  to anon, authenticated
  using (exists (select 1 from venues v where v.id = venue_id and v.active));

-- ---------------------------------------------------------------------------
-- Photo storage
-- ---------------------------------------------------------------------------

-- Public so listing photos load like any image. Uploads go through signed
-- upload URLs the server hands out only to a valid claim link, so there's no
-- insert policy for anyone to abuse.
insert into storage.buckets (id, name, public)
values ('venue-photos', 'venue-photos', true)
on conflict (id) do nothing;
