-- Thank-you note tracker: a simple per-guest flag so the couple can
-- track who's been sent a thank-you card for their gift, without a
-- separate spreadsheet.
alter table guests add column if not exists thanked boolean not null default false;
