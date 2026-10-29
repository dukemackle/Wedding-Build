-- "Shop your wedding": colours a couple picks by hand on the marketplace,
-- for when they haven't chosen a guest-site palette yet. Up to three of
-- COLOR_FAMILIES (src/lib/site-design.ts), like market_listings.color_families.
-- Kept on the wedding so the pick follows them between devices. The
-- weddings policies already let the couple update their own row.

alter table weddings
  add column if not exists market_colors text[] not null default '{}'
    check (cardinality(market_colors) <= 3);
