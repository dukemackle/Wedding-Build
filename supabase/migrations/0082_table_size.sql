-- Tables can be resized on the plan like every other item. Null keeps the
-- footprint derived from shape and seat count, which is what every existing
-- table has.
alter table seating_tables add column if not exists width integer;
alter table seating_tables add column if not exists height integer;
