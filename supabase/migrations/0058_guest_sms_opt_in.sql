-- Adds an optional phone number + a dedicated SMS opt-in checkbox for
-- guests, kept separate from submitting an RSVP itself. Only guests who
-- explicitly check the box are ever texted (schedule-change notices) --
-- collected on rsvp_submissions first, then carried over to guests when
-- the couple approves a submission (see approveRsvpSubmission).
alter table rsvp_submissions add column if not exists phone text;
alter table rsvp_submissions add column if not exists sms_opt_in boolean not null default false;

alter table guests add column if not exists phone text;
alter table guests add column if not exists sms_opt_in boolean not null default false;
