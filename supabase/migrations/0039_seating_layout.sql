-- Visual seating layout: each table gets a shape (how it's drawn) and a
-- position on the floor-plan canvas, so the couple can drag tables
-- around a room view instead of only managing a flat list. Table size
-- on the canvas is derived from shape + capacity (no separate size
-- field to keep in sync), so shape + capacity together are all that's
-- needed to describe how a table looks.
alter table seating_tables add column if not exists shape text not null default 'round'
  check (shape in ('round', 'square', 'rectangle'));
alter table seating_tables add column if not exists position_x integer not null default 60;
alter table seating_tables add column if not exists position_y integer not null default 60;
