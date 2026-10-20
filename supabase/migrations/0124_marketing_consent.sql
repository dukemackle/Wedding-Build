-- Marketing email consent (docs/legal.md, "Marketing email"; legal-audit R10).
--
-- Keyed by email rather than user id so one row covers a couple who ticked
-- the box at signup and a business that only ever met us through an
-- invitation, and so an unsubscribe link works without signing in.
--
-- A couple is mailed only when opted_in is true. A business (CAN-SPAM's
-- opt-out regime) is mailed unless its address is in outreach_opt_outs,
-- which every unsubscribe also writes to. Only the service role touches
-- either table.
create table if not exists marketing_consents (
  email text primary key,
  user_id uuid references auth.users (id) on delete cascade,
  opted_in boolean not null default false,
  opted_in_at timestamptz,
  opted_out_at timestamptz,
  -- Where the latest change came from: 'signup', 'account', 'unsubscribe'.
  source text not null,
  updated_at timestamptz not null default now()
);

create index if not exists marketing_consents_user_id_idx on marketing_consents (user_id);

alter table marketing_consents enable row level security;

-- Where an opt-out came from, so a reply-by-email "no thanks" logged by hand
-- and a link click can be told apart later.
alter table outreach_opt_outs add column if not exists source text;
