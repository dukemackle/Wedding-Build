-- Marketplace step 2, part 2: whole-wedding sets.
--
-- A seller bundles two or more of their own listings into one set ("Sam &
-- Alex's garden set": arch, vases, lanterns, signs) with one price for the
-- lot. The items stay ordinary listings, still buyable one by one; a set is
-- a cover over them. Messages about a set go through its first item's
-- conversation, so market_threads is unchanged.
--
-- market_listings.set_id: the set an item is in, at most one. A trigger
-- keeps it to the seller's own sets.

create table if not exists market_sets (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 3 and 80),
  description text check (char_length(description) <= 2000),
  price_cents integer not null check (price_cents between 0 and 10000000),
  listing_type text not null default 'sale' check (listing_type in ('sale', 'rent')),
  status text not null default 'active' check (status in ('active', 'pending', 'sold', 'removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists market_sets_status_created_idx on market_sets (status, created_at desc);
create index if not exists market_sets_seller_idx on market_sets (seller_id);

alter table market_sets enable row level security;

create policy "anyone can browse live sets"
  on market_sets for select
  to anon, authenticated
  using (status in ('active', 'pending'));

create policy "sellers see their own sets"
  on market_sets for select
  to authenticated
  using (seller_id = auth.uid());

create policy "sellers create their own sets"
  on market_sets for insert
  to authenticated
  with check (seller_id = auth.uid() and status = 'active');

create policy "sellers edit their own sets"
  on market_sets for update
  to authenticated
  using (seller_id = auth.uid() and status <> 'removed')
  with check (seller_id = auth.uid() and status <> 'removed');

create policy "sellers delete their own sets"
  on market_sets for delete
  to authenticated
  using (seller_id = auth.uid());

alter table market_listings
  add column if not exists set_id uuid references market_sets (id) on delete set null;

create index if not exists market_listings_set_idx on market_listings (set_id) where set_id is not null;

-- Only into a set of the listing's own seller.
create or replace function market_listings_own_set()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.set_id is not null and not exists (
    select 1 from market_sets s where s.id = new.set_id and s.seller_id = new.seller_id
  ) then
    raise exception 'A listing can only join its own seller''s set';
  end if;
  return new;
end;
$$;

drop trigger if exists market_listings_own_set on market_listings;
create trigger market_listings_own_set
  before insert or update of set_id, seller_id on market_listings
  for each row execute function market_listings_own_set();
