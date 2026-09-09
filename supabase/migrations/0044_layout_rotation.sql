-- Rotation: tables and layout items can now be turned to any angle, not
-- just dragged, so a couple can angle a table against a wall or square
-- up the dance floor exactly how it'll really sit.
alter table seating_tables add column if not exists rotation integer not null default 0
  check (rotation >= 0 and rotation < 360);
alter table venue_layout_items add column if not exists rotation integer not null default 0
  check (rotation >= 0 and rotation < 360);
