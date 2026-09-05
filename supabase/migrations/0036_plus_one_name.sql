-- Plus-one name: plus_one was previously just a yes/no flag -- this
-- lets the couple (or the guest, via the public RSVP form) record who
-- the plus one actually is, same guest-submission-then-approval pattern
-- as meal/notes/song_request.
alter table rsvp_submissions add column if not exists plus_one_name text;
alter table guests add column if not exists plus_one_name text;
