-- Emailing invitations (Guests › Invitations › Send), as 0156 did for
-- save-the-dates: per guest, when their invitation was last emailed and when
-- they first opened it (/w/<slug>/v/<code>), and the card as a picture for
-- the email and link previews, with the card version it shows.
alter table guests
  add column if not exists inv_sent_at timestamptz,
  add column if not exists inv_opened_at timestamptz;

alter table invitations
  add column if not exists image_url text,
  add column if not exists image_version timestamptz;
