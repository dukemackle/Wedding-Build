-- Questions asked on /admin/ask ("Ask Wren"). Counts toward the daily cap in
-- src/lib/ai/admin-assistant.ts and keeps a record of what was asked. Written
-- and read only through the service-role client, so RLS is on with no
-- policies: nobody reaches it with a normal session.
create table if not exists admin_assistant_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  question text not null,
  answer text not null,
  created_at timestamptz not null default now()
);

create index if not exists admin_assistant_log_user_created_idx
  on admin_assistant_log (user_id, created_at);

alter table admin_assistant_log enable row level security;
