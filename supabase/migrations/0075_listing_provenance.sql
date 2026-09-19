-- Where a listing came from, and when anyone last checked it was true.
--
-- Added before any bulk import rather than after, because this is the part
-- that gets expensive to retrofit. Four columns across forty hand-entered
-- rows is nothing; the same four across fifty thousand imported rows whose
-- origin nobody recorded is unrecoverable -- you cannot work out afterwards
-- which rows came from where, so you cannot refresh selectively, cannot
-- attribute a source that requires attribution, and cannot tell a curated row
-- from a scraped one.
--
-- It also buys the thing that would actually differentiate Wren's listings:
-- being able to tell a couple when these details were last confirmed. A venue
-- directory's real failure isn't missing entries, it's confident wrong ones --
-- a couple who drives two hours to a venue that closed last year doesn't file
-- a bug, they stop trusting the product.

-- `source`: 'manual', 'import', 'osm', 'google', 'claimed' -- deliberately
-- free text rather than an enum, since the set will change as sources are
-- tried and abandoned, and a migration per experiment isn't worth it.
alter table venues add column if not exists source text;
alter table venues add column if not exists source_id text;
alter table venues add column if not exists last_verified_at timestamptz;
-- Who or what confirmed it: an admin email, or the job that re-checked it.
alter table venues add column if not exists verified_by text;

alter table vendors add column if not exists source text;
alter table vendors add column if not exists source_id text;
alter table vendors add column if not exists last_verified_at timestamptz;
alter table vendors add column if not exists verified_by text;

-- Stops the same upstream record being imported twice under different names,
-- which is how a directory quietly fills with near-duplicates. Partial, so the
-- many rows with no external id don't collide with each other.
create unique index if not exists venues_source_unique
  on venues (source, source_id)
  where source is not null and source_id is not null;

create unique index if not exists vendors_source_unique
  on vendors (source, source_id)
  where source is not null and source_id is not null;

-- The refresh job's question is "what's due?", asked per cadence.
create index if not exists venues_last_verified_idx on venues (last_verified_at nulls first);
create index if not exists vendors_last_verified_idx on vendors (last_verified_at nulls first);

-- Everything already here was entered by hand and is as true as it was the day
-- it was added, so it's marked accordingly rather than left null and treated
-- as unknown provenance.
update venues set source = 'manual' where source is null;
update vendors set source = 'manual' where source is null;
