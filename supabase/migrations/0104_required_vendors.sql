-- A venue's vendor list can mean two things: "we recommend these" or "you
-- must book from these". Couples budget very differently for the second, so
-- the listing shows them apart.
alter table venue_preferred_vendors
  add column if not exists required boolean not null default false;
