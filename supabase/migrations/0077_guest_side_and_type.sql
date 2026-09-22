-- Which side a guest belongs to, and whether they're family or friends.
--
-- On a 270-name list every row looks the same, so the questions that actually
-- come up -- "how many of these are mine?", "is my cousin in or out?" -- can
-- only be answered by reading names one at a time. Two small columns turn
-- that into a colour and a sort.
--
-- `side` is 'a' | 'b' | 'both', matching weddings.partner_a_name /
-- partner_b_name so the labels read as the couple's own names rather than as
-- bride/groom, which doesn't fit every wedding. Null means unassigned, which
-- is what every existing guest is.
--
-- `guest_type` is 'family' | 'friends' | 'work' | 'other'. Deliberately four
-- fixed values rather than free-form tags: the point is a sort that always
-- works, and free-form labels drift into twenty groups of one.
alter table guests add column if not exists side text;
alter table guests add column if not exists guest_type text;

-- The colour each side is drawn in, picked by the couple. Stored on the
-- wedding because it's a property of the pair, not of one guest, and both
-- partners should see the same key.
alter table weddings add column if not exists side_a_color text;
alter table weddings add column if not exists side_b_color text;
