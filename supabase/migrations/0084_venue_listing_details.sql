-- The rest of what a couple needs from a venue listing, filled in by the venue
-- through its claim link: where exactly it is, what it costs, what it
-- provides, and the separate spaces on the property.
--
-- Added before any venue has used the claim form, because every field added
-- after that means asking venues to come back and fill the form in again.

alter table venues add column if not exists address text;

-- "Starting at $3,500" and what that price covers ("Full wedding",
-- "Ceremony only"). Whole dollars.
alter table venues add column if not exists price_from integer;
alter table venues add column if not exists price_note text;

-- What the couple still has to book themselves.
alter table venues add column if not exists service_level text
  check (service_level in ('space_only', 'some_services', 'all_inclusive'));
alter table venues add column if not exists vendor_policy text
  check (vendor_policy in ('any', 'preferred', 'required'));

-- `capacity` stays the seated maximum -- it's what the capacity filter and
-- every card already read. Standing is the extra number for cocktail-style.
alter table venues add column if not exists capacity_standing integer;

alter table venues add column if not exists lodging_sleeps integer;
alter table venues add column if not exists parking text;
alter table venues add column if not exists wheelchair_accessible boolean;
alter table venues add column if not exists pets_allowed boolean;

alter table venues add column if not exists instagram_url text;
alter table venues add column if not exists facebook_url text;
alter table venues add column if not exists pinterest_url text;

-- ---------------------------------------------------------------------------
-- Event spaces: "The Barn", "Oak Grove", "The Chapel"
-- ---------------------------------------------------------------------------

create table if not exists venue_spaces (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references venues (id) on delete cascade,
  name text not null,
  description text,
  capacity integer,
  setting text,
  photo_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists venue_spaces_venue_idx on venue_spaces (venue_id, sort_order);

alter table venue_spaces enable row level security;

drop policy if exists "anyone can read spaces of active venues" on venue_spaces;
create policy "anyone can read spaces of active venues"
  on venue_spaces for select
  to anon, authenticated
  using (exists (select 1 from venues v where v.id = venue_id and v.active));

-- Spaces travel with the rest of a claim until it's approved.
alter table venue_submissions add column if not exists spaces jsonb not null default '[]';
