-- "Anything else couples should know?" on venue and vendor listings: booking
-- lead time, deposits, travel fees -- whatever the form doesn't ask. Written
-- by the business through its edit link, reviewed like every other field.
alter table venues add column if not exists good_to_know text;
alter table vendors add column if not exists good_to_know text;

-- A vendor that picks "Other" when listing itself says what it does here.
-- Admin-only: couples see the category, and a type that keeps coming up
-- becomes a real category rather than one per vendor.
alter table vendors add column if not exists category_note text;

-- "Fill this in for me": each time a venue or vendor has Wren read their
-- website or pricing guide to draft their listing. Only here to cap the
-- paid AI calls per listing per day; written by the service role only.
create table if not exists listing_reads (
  id uuid primary key default gen_random_uuid(),
  listing_kind text not null check (listing_kind in ('venue', 'vendor')),
  listing_id uuid not null,
  created_at timestamptz not null default now()
);
create index if not exists listing_reads_listing_idx on listing_reads (listing_kind, listing_id, created_at);
alter table listing_reads enable row level security;
