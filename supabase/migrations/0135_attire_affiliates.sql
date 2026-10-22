-- Attire affiliate pilot (docs/attire-affiliates.md).
--
-- - attire_merchants: the retailers we apply to (Revelry, Brilliant Earth...),
--   which network runs their program, where the application stands, and what
--   they said about using their photos. Admin-only.
-- - attire_items.affiliate_url: the tracked link, kept apart from
--   retailer_url so dropping a program falls back to the plain link without
--   editing every item.
-- - attire_items.price_checked_at: when someone last saw this price on the
--   retailer's site. The couple sees the date; a stored price is never shown
--   as live.
-- - attire_clicks: one row per "Shop" tap, written by /go/attire/<id>. Our
--   own count of clicks, to set against the sales the network reports.
--   Anonymous on purpose: no user or wedding is recorded.

create table if not exists attire_merchants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  website text,
  -- 'Awin' | 'Impact' | 'Rakuten' | 'CJ' | 'Direct' ...
  network text,
  -- 'Not applied' | 'Applied' | 'Approved' | 'Rejected' | 'Paused'
  status text not null default 'Not applied',
  commission_note text,
  -- What the program terms or the merchant said about showing their photos.
  -- Photos go up only once this says yes.
  image_rights_note text,
  contact text,
  approved_at date,
  notes text,
  created_at timestamptz not null default now()
);

alter table attire_merchants enable row level security;
-- No policies: only the service-role admin client reads or writes it.

alter table attire_items add column if not exists merchant_id uuid references attire_merchants (id) on delete set null;
alter table attire_items add column if not exists affiliate_url text;
alter table attire_items add column if not exists price_checked_at date;

create index if not exists attire_items_merchant_id_idx on attire_items (merchant_id);

create table if not exists attire_clicks (
  id uuid primary key default gen_random_uuid(),
  attire_item_id uuid not null references attire_items (id) on delete cascade,
  merchant_id uuid references attire_merchants (id) on delete set null,
  -- Whether the link carried an affiliate tag at the time of the click.
  affiliate boolean not null default false,
  -- 'attire' (the couple's browser) | 'party' (the shared party page)
  source text not null default 'attire',
  created_at timestamptz not null default now()
);

create index if not exists attire_clicks_item_idx on attire_clicks (attire_item_id, created_at);
create index if not exists attire_clicks_merchant_idx on attire_clicks (merchant_id, created_at);

alter table attire_clicks enable row level security;
-- No policies: written by the /go route and read by the admin, both with the
-- service-role client.

-- The shared party page now sends "Order this look" through /go/attire/<id>
-- too, so it needs the item id, and whether the link is an affiliate one (for
-- the disclosure line). Same function as 0080 otherwise.
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
          'id', i.id,
          'name', i.name,
          'category', i.category,
          'designer', i.designer,
          'image_urls', i.image_urls,
          'retailer_url', i.retailer_url,
          'affiliate_url', i.affiliate_url,
          'price_checked_at', i.price_checked_at,
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
