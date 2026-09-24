-- Attire, ready for real product, plus the wedding party board.
--
-- Until now attire_items was a placeholder catalog: a name, a category, one
-- price and a line of copy. Real product needs photos, who makes it, where
-- to get it, and the attributes people actually shop by (silhouette,
-- colour, sleeves...). Products come from two places, and one row serves
-- both:
--
-- - An outside retailer (Azazie, The Black Tux...): retailer_url is where
--   the "Shop" button sends the couple. Affiliate links go here as-is.
-- - A boutique listed on Wren's vendor side: vendor_id points at the vendor,
--   and the item links to their vendor page for an appointment.
--
-- buy_price / rent_price replace the single price_from + buy_or_rent pair,
-- because a lot of menswear (and some gowns) is both, at different prices.
-- The old columns stay and are kept in step by the admin form, since the
-- budget page and older code still read them.

alter table attire_items add column if not exists designer text;
alter table attire_items add column if not exists image_urls text[] not null default '{}';
alter table attire_items add column if not exists retailer_url text;
alter table attire_items add column if not exists vendor_id uuid references vendors (id) on delete set null;
alter table attire_items add column if not exists buy_price numeric(10, 2);
alter table attire_items add column if not exists rent_price numeric(10, 2);
alter table attire_items add column if not exists silhouette text;
alter table attire_items add column if not exists neckline text;
alter table attire_items add column if not exists sleeves text;
alter table attire_items add column if not exists length text;
alter table attire_items add column if not exists colors text[] not null default '{}';
alter table attire_items add column if not exists fabric text;
alter table attire_items add column if not exists size_range text;
-- A short label on the photo: "New", "Ships fast", "Best seller".
alter table attire_items add column if not exists badge text;
alter table attire_items add column if not exists is_featured boolean not null default false;
-- Hidden items stay in shortlists and party boards that already use them,
-- they just stop showing up in browse.
alter table attire_items add column if not exists is_active boolean not null default true;

create index if not exists attire_items_vendor_id_idx on attire_items (vendor_id);

update attire_items
set
  buy_price = case when buy_or_rent in ('Buy', 'Buy or Rent') then price_from end,
  rent_price = case
    when buy_or_rent = 'Rent' then price_from
    -- The seed only had one price; rentals typically run about a fifth of
    -- the purchase price, which is close enough for placeholder data.
    when buy_or_rent = 'Buy or Rent' then round(price_from * 0.2)
  end
where buy_price is null and rent_price is null;

-- Seed attributes so the filters have something to show before real
-- product is loaded. Only touches rows that have none yet.
update attire_items set silhouette = style
where silhouette is null and category in ('Wedding Dress', 'Bridesmaid Dress');

update attire_items set colors = case category
    when 'Wedding Dress' then array['Ivory', 'White']
    when 'Bridesmaid Dress' then array['Sage', 'Dusty Blue', 'Blush']
    when 'Groom Attire' then array['Black', 'Navy']
    when 'Groomsmen Attire' then array['Charcoal', 'Navy']
    when 'Ring - Her' then array['Yellow Gold', 'Platinum']
    when 'Ring - Him' then array['Yellow Gold', 'Platinum']
    else colors
  end
where colors = '{}';

-- The wedding party board: one row per bridesmaid, groomsman, flower girl...
-- with the look assigned to them and where they are with ordering it.
create table if not exists attire_party_members (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings (id) on delete cascade,
  user_id uuid not null default auth.uid(),
  name text not null,
  -- "Maid of honor", "Bridesmaid", "Best man", "Groomsman"...
  role text,
  attire_item_id uuid references attire_items (id) on delete set null,
  color text,
  size text,
  -- 'To order' | 'Ordered' | 'Arrived' | 'Fitted'
  status text not null default 'To order',
  notes text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists attire_party_members_wedding_id_idx
  on attire_party_members (wedding_id, sort_order);

alter table attire_party_members enable row level security;

drop policy if exists "attire_party_members_owner_all" on attire_party_members;
create policy "attire_party_members_owner_all" on attire_party_members
  for all
  using (wedding_id in (select id from weddings where user_id = auth.uid() or partner_user_id = auth.uid()))
  with check (wedding_id in (select id from weddings where user_id = auth.uid() or partner_user_id = auth.uid()));

-- The link the couple sends the party. Null until they turn sharing on;
-- regenerating it kills the old link.
alter table weddings add column if not exists party_share_token uuid unique;

-- Everything the shared party page shows, looked up by token. A function
-- rather than a public policy so nobody can list boards -- you get one
-- board, and only by holding its link.
create or replace function get_shared_attire_party(share_token uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'partner_a_name', w.partner_a_name,
    'partner_b_name', w.partner_b_name,
    'wedding_date', w.wedding_date,
    'members', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', m.id,
        'name', m.name,
        'role', m.role,
        'color', m.color,
        'size', m.size,
        'status', m.status,
        'notes', m.notes,
        'item', case when i.id is null then null else jsonb_build_object(
          'name', i.name,
          'category', i.category,
          'designer', i.designer,
          'image_urls', i.image_urls,
          'retailer_url', i.retailer_url,
          'vendor_name', v.name,
          'buy_price', i.buy_price,
          'rent_price', i.rent_price
        ) end
      ) order by m.sort_order, m.created_at)
      from attire_party_members m
      left join attire_items i on i.id = m.attire_item_id
      left join vendors v on v.id = i.vendor_id
      where m.wedding_id = w.id
    ), '[]'::jsonb)
  )
  from weddings w
  where w.party_share_token = share_token;
$$;

grant execute on function get_shared_attire_party(uuid) to anon, authenticated;
