-- Marketplace step 2, part 3: "Shop your wedding".
--
-- The dates a rental is already out. The seller marks them on their rental
-- listing; "Free on your date" and the browse filter read them. Only the
-- dates are stored, never who booked, so anyone may read them.
--
-- The exclusion constraint keeps one listing's bookings from overlapping
-- (both ends inclusive: a rental out on the 12th to the 14th is out on the
-- 14th). Comparing listing_id with = inside a gist index needs btree_gist.

create extension if not exists btree_gist with schema extensions;

create table if not exists market_rental_bookings (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references market_listings (id) on delete cascade,
  starts_on date not null,
  ends_on date not null,
  created_at timestamptz not null default now(),
  check (ends_on >= starts_on),
  check (ends_on - starts_on <= 60),
  constraint market_rental_bookings_no_overlap
    exclude using gist (listing_id with =, daterange(starts_on, ends_on, '[]') with &&)
);

create index if not exists market_rental_bookings_dates_idx on market_rental_bookings (starts_on, ends_on);

alter table market_rental_bookings enable row level security;

create policy "anyone can see when a live rental is out"
  on market_rental_bookings for select
  to anon, authenticated
  using (
    exists (
      select 1 from market_listings l
      where l.id = listing_id and (l.status in ('active', 'pending') or l.seller_id = auth.uid())
    )
  );

create policy "sellers book their own rentals"
  on market_rental_bookings for insert
  to authenticated
  with check (
    exists (
      select 1 from market_listings l
      where l.id = listing_id and l.seller_id = auth.uid() and l.listing_type = 'rent'
    )
  );

create policy "sellers free up their own rentals"
  on market_rental_bookings for delete
  to authenticated
  using (
    exists (select 1 from market_listings l where l.id = listing_id and l.seller_id = auth.uid())
  );
