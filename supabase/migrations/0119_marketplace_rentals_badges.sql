-- Marketplace, part 3.
--
-- listing_type: 'rent' is something lent for a wedding and returned after
-- (an arch, a sign, a card box), priced per event. Deposit and return date
-- are agreed in messages.
--
-- seller_badge: "Married Oct 2026" or "Getting married Jun 2027", written by
-- the server from the seller's own wedding when they tick the box on the
-- sell form, so a buyer knows they're dealing with a real couple. Month and
-- year only: a first name plus an exact date and venue would be enough to
-- find someone.

alter table market_listings
  add column if not exists listing_type text not null default 'sale' check (listing_type in ('sale', 'rent')),
  add column if not exists seller_badge text check (char_length(seller_badge) <= 40);
