-- The marketplace: anyone with an account sells what's left over from their
-- wedding (decor, signs, attire, tableware) to someone whose wedding is still
-- coming, the way Facebook Marketplace works. Payment and pickup happen
-- between the two of them, never through us.
--
-- 1. market_listings: one row per thing for sale (or free). Readable by
--    anyone while active or pending, so the browse screen works logged out;
--    the seller sees and edits their own in every state. 'removed' is the
--    admin's (a reported listing taken down) and a seller can't edit their way
--    out of it.
--
-- 2. market_saves: a viewer's hearted listings.
--
-- 3. market-photos: public bucket, each seller writing only under a folder
--    named after their own user id. The browser uploads straight to it, so a
--    listing's ten photos never pass through the server-action body cap.
--
-- Messages between buyer and seller come in a later migration.

create table if not exists market_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- First name only, as the seller typed it; we have no profile table to
  -- borrow one from, and a full name has no business on a public listing.
  seller_name text not null check (char_length(seller_name) between 1 and 40),
  title text not null check (char_length(title) between 3 and 80),
  description text check (char_length(description) <= 2000),
  category text not null check (category in (
    'decor', 'signage', 'attire', 'tableware', 'florals', 'lighting', 'stationery', 'other'
  )),
  condition text not null check (condition in ('new', 'like_new', 'good', 'fair')),
  -- 0 is free.
  price_cents integer not null check (price_cents between 0 and 10000000),
  quantity integer not null default 1 check (quantity between 1 and 10000),
  city text not null check (char_length(city) between 1 and 80),
  -- Two-letter abbreviation.
  state text not null check (state ~ '^[A-Z]{2}$'),
  -- The town's centre, not the seller's address: pickup details are agreed in
  -- messages, and a pin on a house is the one thing a stranger shouldn't get.
  latitude double precision,
  longitude double precision,
  photo_urls text[] not null default '{}' check (cardinality(photo_urls) <= 10),
  status text not null default 'active' check (status in ('active', 'pending', 'sold', 'removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists market_listings_status_created_idx on market_listings (status, created_at desc);
create index if not exists market_listings_seller_idx on market_listings (seller_id);

alter table market_listings enable row level security;

create policy "anyone can browse live listings"
  on market_listings for select
  to anon, authenticated
  using (status in ('active', 'pending'));

create policy "sellers see their own listings"
  on market_listings for select
  to authenticated
  using (seller_id = auth.uid());

create policy "sellers create their own listings"
  on market_listings for insert
  to authenticated
  with check (seller_id = auth.uid() and status = 'active');

create policy "sellers edit their own listings"
  on market_listings for update
  to authenticated
  using (seller_id = auth.uid() and status <> 'removed')
  with check (seller_id = auth.uid() and status <> 'removed');

create policy "sellers delete their own listings"
  on market_listings for delete
  to authenticated
  using (seller_id = auth.uid());

create table if not exists market_saves (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  listing_id uuid not null references market_listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

alter table market_saves enable row level security;

create policy "people manage their own saves"
  on market_saves for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

insert into storage.buckets (id, name, public)
values ('market-photos', 'market-photos', true)
on conflict (id) do nothing;

create policy "sellers upload their own marketplace photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'market-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "anyone can view marketplace photos"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'market-photos');

create policy "sellers delete their own marketplace photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'market-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
