-- A per-item size, so a couple can stretch a dance floor or shrink a bar to
-- match the space they actually have.
--
-- Until now an item's footprint came from its type alone: every bar was
-- 130x60, every parking area 200x130. That was fine as a starting guess and is
-- kept as exactly that -- these columns are nullable, and null means "use the
-- default for this type", so every layout drawn before this migration keeps
-- the size it already had without a backfill.
--
-- Stored in the same pixel units as position_x/position_y, which is what both
-- the 2D editor and the 3D view scale from, so one number drives both views.
alter table venue_layout_items add column if not exists width integer;
alter table venue_layout_items add column if not exists height integer;
