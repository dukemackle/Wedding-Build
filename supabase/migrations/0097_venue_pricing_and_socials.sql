-- Venue pricing as venues actually quote it, tap-to-pick "what's included",
-- and the social links couples look for. Filled in through the claim form.

-- What the starting price is: the room hire, a package, per head, a food and
-- drink minimum, or "ask us" for venues that won't publish a number.
alter table venues add column if not exists price_basis text
  check (price_basis in ('rental', 'package', 'per_person', 'minimum', 'ask'));

-- The other prices beside the starting one, in the venue's own words:
-- [{"label": "Saturday", "amount": 12000}, {"label": "Weekend buyout", "amount": 20000}]
alter table venues add column if not exists price_options jsonb not null default '[]'::jsonb;

-- Picked from a list on the form (tables, chairs, bar...), so couples can
-- compare. `included` stays as the free-text "anything else included".
alter table venues add column if not exists included_items text[] not null default '{}';

alter table venues add column if not exists tiktok_url text;
alter table venues add column if not exists youtube_url text;
-- One reviews page: Google, The Knot or WeddingWire.
alter table venues add column if not exists reviews_url text;

-- Anon reads venues column by column since 0091.
grant select (price_basis, price_options, included_items, tiktok_url, youtube_url, reviews_url) on venues to anon;

-- "Help me write this" is metered in the same log as "Fill this in for me",
-- with its own (larger, cheaper) daily allowance.
alter table listing_reads add column if not exists purpose text not null default 'read'
  check (purpose in ('read', 'write'));
