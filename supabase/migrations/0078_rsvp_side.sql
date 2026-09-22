-- Which side a guest says they're with, asked on the RSVP form.
--
-- The couple's own answer to "whose guest is this?" is on guests.side
-- (0077). This is the guest's answer, kept on the submission so it can be
-- read before the couple approves the row and carried onto the guest when
-- they do. Same three values, and null when they skipped the question.
alter table rsvp_submissions add column if not exists side text;
