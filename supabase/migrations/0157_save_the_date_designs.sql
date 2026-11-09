-- Several save-the-date designs per wedding (Guests › Save the date).
--
-- Couples can keep a few cards to compare, like guest-site designs. One is
-- `chosen`: the card guests see at their personal link. Sending a card makes
-- it the chosen one. Existing cards (one per wedding) become chosen.
alter table save_the_dates drop constraint if exists save_the_dates_wedding_id_key;

alter table save_the_dates
  add column if not exists name text not null default 'My design',
  add column if not exists chosen boolean not null default false;

update save_the_dates set chosen = true where not chosen;

create unique index if not exists save_the_dates_one_chosen on save_the_dates (wedding_id) where chosen;
create index if not exists save_the_dates_wedding on save_the_dates (wedding_id);
