-- How the venue plan is dressed, so it reads as a room rather than a diagram.
--
--   weddings.layout_room_style  the floor and walls the plan draws: blank
--                               (the plain plan), barn or ballroom.
--   seating_tables.linen        the tablecloth colour, a key into the
--                               palette in src/lib/layout-styles.ts. Null
--                               means the room style's default.
--   seating_tables.centerpiece  what sits in the middle of the table, also a
--                               key from that file. Null means the default.
--
-- Plain text rather than enums so a new room style or centrepiece is a code
-- change, not a migration; the app ignores keys it doesn't know.

alter table weddings
  add column if not exists layout_room_style text not null default 'blank';

alter table seating_tables
  add column if not exists linen text,
  add column if not exists centerpiece text;
