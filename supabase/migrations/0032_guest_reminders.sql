-- RSVP reminders: track when a guest was last nudged to respond,
-- separate from invite_sent_at (the original invite), so the couple can
-- follow up with guests who still haven't RSVP'd without re-sending the
-- original invite email.
alter table guests add column if not exists last_reminded_at timestamptz;
