-- Sending save-the-dates (Guests › Save the date › Send).
--
-- Per guest: when their save-the-date was last emailed, and when they first
-- opened their card (their personal link /w/<slug>/s/<code> loaded). Those
-- are the only statuses shown, because they're the only ones we know: no
-- tracking pixel, so no "read".
alter table guests
  add column if not exists std_sent_at timestamptz,
  add column if not exists std_opened_at timestamptz;

-- The card as a picture, for the email and for link previews in texts and
-- group chats. Made in the couple's browser from the same drawing at send
-- time; image_version is the card's updated_at it shows, so a card edited
-- since gets a fresh picture on the next send or share.
alter table save_the_dates
  add column if not exists image_url text,
  add column if not exists image_version timestamptz;
