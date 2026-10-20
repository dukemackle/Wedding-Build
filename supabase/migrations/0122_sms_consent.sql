-- A record of each guest's consent to schedule texts: the words they saw on
-- the RSVP form (src/lib/sms-consent.ts) and when they ticked the box. The
-- RSVP carries it, and approving the RSVP copies it to the guest. Without it
-- there's no way to show a guest agreed (TCPA; docs/legal-audit.md R2).
alter table rsvp_submissions
  add column if not exists sms_consent text,
  add column if not exists sms_opt_in_at timestamptz;

alter table guests
  add column if not exists sms_consent text,
  add column if not exists sms_opt_in_at timestamptz;
