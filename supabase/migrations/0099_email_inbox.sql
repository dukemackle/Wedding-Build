-- Mail sent to @youdoido.com (hello@, privacy@, listings@ ...). Resend receives
-- it and calls /api/resend-webhook, which keeps a copy here and forwards it to
-- the admin inbox. This is where the AI triage (docs/email-playbook.md) will
-- read from; for now it's the record that nothing sent to us was lost.
create table if not exists inbox_messages (
  id uuid primary key default gen_random_uuid(),
  resend_email_id text not null unique,
  from_address text not null,
  to_addresses text[] not null default '{}',
  subject text,
  body_text text,
  received_at timestamptz not null default now(),
  -- new -> handled / archived. category is the triage label, set later.
  status text not null default 'new' check (status in ('new', 'handled', 'archived')),
  category text,
  forwarded boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists inbox_messages_status_idx on inbox_messages (status, received_at desc);

-- Addresses our mail can't reach: hard bounces, spam complaints and Resend's
-- own suppressions. Checked before a couple's inquiry goes out, so the couple
-- hears straight away that the address is dead instead of waiting on a reply
-- that can't come, and read by the data audit to find stale listing emails.
create table if not exists email_bounces (
  email text primary key,
  reason text not null check (reason in ('bounce', 'complaint', 'suppressed')),
  detail text,
  last_event_at timestamptz not null default now()
);

-- Both are written and read only with the service role.
alter table inbox_messages enable row level security;
alter table email_bounces enable row level security;
