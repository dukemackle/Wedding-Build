-- Song requests: guests can suggest a song for the DJ/band alongside
-- their RSVP, same mechanism as the guestbook message -- it only becomes
-- part of the real guest record once the couple approves the submission
-- (see approveRsvpSubmission). Couple-only, no public exposure needed.

alter table rsvp_submissions add column if not exists song_request text;
alter table guests add column if not exists song_request text;
