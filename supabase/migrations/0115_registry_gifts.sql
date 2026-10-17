-- The registry, grown past a list of links.
--
-- 1. registry_gifts: things the couple wants from any store (kind 'gift',
--    with a quantity) and cash funds (kind 'fund', with an optional goal).
--    registry_items stays as it was: links to registries kept at a store.
--
-- 2. registry_claims: a guest saying "I'm getting this" (or "I gave to this
--    fund"). This is what stops two guests buying the same toaster. Guests
--    never write the table directly: claim_registry_gift locks the gift row,
--    checks how many are still wanted and only then records the claim, so
--    two guests tapping at the same moment can't both get the last one. Each
--    claim carries a secret token the guest's browser keeps, which is the
--    only way release_registry_claim lets a guest take their claim back.
--    Guests never see who claimed what -- only how many are left.
--
-- 3. How guests pay the couple for a fund (their own Venmo, PayPal, Cash App
--    or Zelle), so money goes straight to them and never through us, and a
--    shipping address handed only to a guest who has just claimed a gift.

create table if not exists registry_gifts (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings (id) on delete cascade,
  kind text not null default 'gift' check (kind in ('gift', 'fund')),
  title text not null,
  url text,
  image_url text,
  store text,
  price numeric(10, 2),
  quantity integer not null default 1 check (quantity between 1 and 99),
  goal numeric(10, 2),
  note text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists registry_gifts_wedding_id_idx on registry_gifts (wedding_id);

create table if not exists registry_claims (
  id uuid primary key default gen_random_uuid(),
  gift_id uuid not null references registry_gifts (id) on delete cascade,
  wedding_id uuid not null references weddings (id) on delete cascade,
  guest_name text not null,
  quantity integer not null default 1 check (quantity between 1 and 99),
  amount numeric(10, 2),
  message text,
  token uuid not null unique default gen_random_uuid(),
  created_at timestamptz not null default now()
);
create index if not exists registry_claims_gift_id_idx on registry_claims (gift_id);
create index if not exists registry_claims_wedding_id_idx on registry_claims (wedding_id);

alter table registry_gifts enable row level security;
alter table registry_claims enable row level security;

drop policy if exists "registry_gifts_owner_all" on registry_gifts;
create policy "registry_gifts_owner_all" on registry_gifts
  for all using (can_edit_wedding(wedding_id)) with check (can_edit_wedding(wedding_id));
drop policy if exists "registry_gifts_member_select" on registry_gifts;
create policy "registry_gifts_member_select" on registry_gifts
  for select using (is_wedding_member(wedding_id));

-- The couple sees who is giving what and can release a claim (a guest who
-- changed their mind, or one that's clearly a mistake). No insert policy:
-- claims only arrive through claim_registry_gift.
drop policy if exists "registry_claims_member_select" on registry_claims;
create policy "registry_claims_member_select" on registry_claims
  for select using (is_wedding_member(wedding_id));
drop policy if exists "registry_claims_owner_delete" on registry_claims;
create policy "registry_claims_owner_delete" on registry_claims
  for delete using (can_edit_wedding(wedding_id));

alter table weddings add column if not exists gift_venmo text;
alter table weddings add column if not exists gift_paypal text;
alter table weddings add column if not exists gift_cashapp text;
alter table weddings add column if not exists gift_zelle text;
alter table weddings add column if not exists gift_ship_to text;

-- What guests read: each gift with how many are spoken for and, for a fund,
-- how much guests have said they gave. Never names. Like public_weddings it
-- is owned by the migration role and so reads past row security, which is
-- why it limits itself to published sites and the couple's own wedding.
create or replace view public_registry_gifts as
  select
    g.id,
    g.wedding_id,
    g.kind,
    g.title,
    g.url,
    g.image_url,
    g.store,
    g.price,
    g.quantity,
    g.goal,
    g.note,
    g.sort_order,
    g.created_at,
    coalesce(c.claimed, 0)::integer as claimed,
    coalesce(c.raised, 0)::numeric(10, 2) as raised
  from registry_gifts g
  join weddings w on w.id = g.wedding_id
  left join (
    select gift_id, sum(quantity) as claimed, sum(coalesce(amount, 0)) as raised
    from registry_claims
    group by gift_id
  ) c on c.gift_id = g.id
  where w.public_slug is not null or is_wedding_member(g.wedding_id);

grant select on public_registry_gifts to anon, authenticated;

-- public_weddings as of 0114, plus the payment handles a fund needs. The
-- shipping address is deliberately not here.
create or replace view public_weddings as
  select
    w.id,
    w.public_slug,
    w.partner_a_name,
    w.partner_b_name,
    w.wedding_date,
    w.region,
    w.hero_photo_url,
    w.rsvp_deadline,
    w.dress_code,
    w.travel_notes,
    coalesce(v.name, w.own_venue_name) as venue_name,
    coalesce(v.city, w.own_venue_city) as venue_city,
    coalesce(v.state, w.own_venue_state) as venue_state,
    w.itinerary_published,
    w.site_design,
    coalesce(nullif(w.own_venue_photo_urls, '{}'), v.photo_urls) as venue_photo_urls,
    coalesce(v.about, v.description) as venue_about,
    coalesce(v.address, w.own_venue_address) as venue_address,
    (w.site_password_hash is not null) as site_locked,
    (cardinality(w.own_venue_photo_urls) > 0) as venue_photos_own,
    w.gift_venmo,
    w.gift_paypal,
    w.gift_cashapp,
    w.gift_zelle
  from weddings w
  left join venues v on v.id = w.venue_id
  where w.public_slug is not null;

grant select on public_weddings to anon, authenticated;

-- A guest claims a gift (or records a fund gift). Returns the claim's token,
-- for taking it back later, and the couple's shipping address for a gift.
create or replace function claim_registry_gift(
  p_gift uuid,
  p_name text,
  p_quantity integer default 1,
  p_amount numeric default null,
  p_message text default null
)
returns table (token uuid, ship_to text)
language plpgsql
security definer
set search_path = public
as $$
declare
  gift registry_gifts%rowtype;
  taken integer;
  new_token uuid;
  address text;
begin
  -- Locking the gift row makes claims on it take turns, so the count below
  -- can't go stale between reading it and inserting.
  select * into gift from registry_gifts where id = p_gift for update;
  if not found then
    raise exception 'gift_not_found';
  end if;

  select w.gift_ship_to into address from weddings w
  where w.id = gift.wedding_id and w.public_slug is not null;
  if not found then
    raise exception 'gift_not_found';
  end if;

  if coalesce(btrim(p_name), '') = '' then
    raise exception 'name_required';
  end if;

  if gift.kind = 'gift' then
    if p_quantity is null or p_quantity < 1 then
      raise exception 'bad_quantity';
    end if;
    select coalesce(sum(quantity), 0) into taken from registry_claims where gift_id = gift.id;
    if taken + p_quantity > gift.quantity then
      raise exception 'already_taken';
    end if;
  elsif p_amount is not null and (p_amount <= 0 or p_amount > 100000) then
    raise exception 'bad_amount';
  end if;

  insert into registry_claims (gift_id, wedding_id, guest_name, quantity, amount, message)
  values (
    gift.id,
    gift.wedding_id,
    left(btrim(p_name), 120),
    case when gift.kind = 'gift' then p_quantity else 1 end,
    case when gift.kind = 'fund' then p_amount end,
    nullif(left(btrim(coalesce(p_message, '')), 500), '')
  )
  returning registry_claims.token into new_token;

  return query select new_token, case when gift.kind = 'gift' then address end;
end;
$$;

-- A guest takes back their own claim, proven by the token from claiming it.
create or replace function release_registry_claim(p_token uuid)
returns void
language sql
security definer
set search_path = public
as $$
  delete from registry_claims where token = p_token;
$$;

grant execute on function claim_registry_gift(uuid, text, integer, numeric, text) to anon, authenticated;
grant execute on function release_registry_claim(uuid) to anon, authenticated;
