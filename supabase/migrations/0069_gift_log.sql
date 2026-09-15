-- What each guest gave, and the thank-you note written for it.
--
-- `guests.thanked` has been a bare boolean: it records that a note went out
-- but not what it was for. On a 150-guest list that is exactly the fact
-- nobody can hold in their head, so the tracker could flag who was still
-- owed a note without helping anyone write one.
--
-- Both columns are plain text on `guests`, so they inherit the table's
-- existing RLS policies -- no policy changes needed.
alter table guests add column if not exists gift_description text;
alter table guests add column if not exists thank_you_note text;
