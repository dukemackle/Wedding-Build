-- Adds an optional email per guest and tracks when a bulk RSVP invite
-- email was last sent to them, so the couple can email guests their
-- public RSVP link in bulk instead of copy-pasting it individually, and
-- can see at a glance who's already been invited.
alter table guests add column if not exists email text;
alter table guests add column if not exists invite_sent_at timestamptz;
