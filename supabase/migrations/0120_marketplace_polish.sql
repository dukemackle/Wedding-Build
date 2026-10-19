-- Marketplace, Facebook-parity polish.
--
-- original_price_cents: the price before the seller lowered it, so the
--   listing can show "$2,000 ~~$2,400~~". Set the first time the price
--   drops, cleared if the price goes back up to it or above.
-- pickup_options: how the buyer can get it -- a public meetup, pickup at
--   the seller's door, or shipped.
-- negotiable: "or best offer".
-- market_messages.kind: 'event' for the lines the app posts into a
--   conversation itself ("Price reduced to $40", "Marked as sold"), shown
--   centred and grey rather than as a bubble from the seller.

alter table market_listings
  add column if not exists original_price_cents integer check (original_price_cents > 0),
  add column if not exists pickup_options text[] not null default '{meetup}'
    check (pickup_options <@ array['meetup', 'door', 'ship']::text[] and cardinality(pickup_options) >= 1),
  add column if not exists negotiable boolean not null default false;

alter table market_messages
  add column if not exists kind text not null default 'text' check (kind in ('text', 'event'));
