-- The colour the "Both" bucket is drawn in on the guest list. Null keeps the
-- neutral default, same as the two sides.
alter table weddings add column if not exists side_both_color text;
