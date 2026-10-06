-- Feedback from venues and vendors, asked on the claim page right after
-- they send their listing ("was there anything you couldn't add?"). They
-- have no account -- the claim token is their only credential -- so these
-- rows are written by the service role with no user_id, tied to the
-- listing instead. Couples' /help feedback keeps working as before.

alter table feedback_submissions alter column user_id drop not null;

alter table feedback_submissions
  add column if not exists source text not null default 'couple'
    check (source in ('couple', 'venue', 'vendor')),
  add column if not exists venue_id uuid references venues (id) on delete set null,
  add column if not exists vendor_id uuid references vendors (id) on delete set null,
  add column if not exists rating smallint check (rating between 1 and 5);

create index if not exists feedback_submissions_venue_id_idx on feedback_submissions (venue_id);
create index if not exists feedback_submissions_vendor_id_idx on feedback_submissions (vendor_id);
