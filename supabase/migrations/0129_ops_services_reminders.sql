-- The renewal date a reminder email was last sent for, so the daily check
-- (/api/spend-reminders) mails each renewal once. Moving next_renewal on to
-- the following year makes the service due for a reminder again.
alter table ops_services add column if not exists reminded_for date;
