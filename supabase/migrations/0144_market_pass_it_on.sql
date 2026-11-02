-- Marketplace step 2, part 1: "Pass it on" drafts and colour tags.
--
-- source_budget_item: the budget line a listing was started from, through
--   "Pass it on" -- a budget category key ('attire') or a budget_custom_items
--   id. Drafts are worked out from the budget each time rather than stored,
--   so this is what stops a line being suggested again once it's listed.
-- color_families: up to three of the guest-site colour families
--   (COLOR_FAMILIES in src/lib/site-design.ts), so "Shop your wedding" can
--   match listings to a couple's palette. Added now, ahead of that filter,
--   so listings posted in the meantime carry them.

alter table market_listings
  add column if not exists source_budget_item text check (char_length(source_budget_item) <= 64),
  add column if not exists color_families text[] not null default '{}'
    check (
      color_families <@ array['neutral', 'green', 'blue', 'pink', 'purple', 'red', 'orange', 'gold', 'brown', 'black']::text[]
      and cardinality(color_families) <= 3
    );

create index if not exists market_listings_seller_source_idx
  on market_listings (seller_id, source_budget_item)
  where source_budget_item is not null;
