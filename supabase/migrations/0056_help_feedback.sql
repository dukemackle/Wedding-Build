-- Help & Feedback: (1) a log of every question asked to the Wren
-- assistant and the answer it gave, so we can see what people actually
-- need help with, and (2) free-form feedback couples submit about what
-- to fix or improve. Both are owner-only, append-mostly logs -- nobody
-- needs to edit a past question or a submitted feedback message, just
-- see their own. wedding_id is nullable on both: someone can ask the
-- assistant or leave feedback before they've set up a wedding at all.

create table if not exists assistant_conversations (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid references weddings (id) on delete set null,
  user_id uuid not null default auth.uid(),
  question text not null,
  answer text not null,
  created_at timestamptz not null default now()
);
create index if not exists assistant_conversations_user_id_idx on assistant_conversations (user_id);
create index if not exists assistant_conversations_wedding_id_idx on assistant_conversations (wedding_id);

alter table assistant_conversations enable row level security;

create policy "assistant_conversations_owner_select" on assistant_conversations
  for select using (user_id = auth.uid());

create policy "assistant_conversations_owner_insert" on assistant_conversations
  for insert with check (user_id = auth.uid());

create table if not exists feedback_submissions (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid references weddings (id) on delete set null,
  user_id uuid not null default auth.uid(),
  category text not null default 'idea' check (category in ('bug', 'idea', 'other')),
  message text not null,
  status text not null default 'new' check (status in ('new', 'read', 'resolved')),
  created_at timestamptz not null default now()
);
create index if not exists feedback_submissions_user_id_idx on feedback_submissions (user_id);
create index if not exists feedback_submissions_status_idx on feedback_submissions (status);

alter table feedback_submissions enable row level security;

create policy "feedback_submissions_owner_select" on feedback_submissions
  for select using (user_id = auth.uid());

create policy "feedback_submissions_owner_insert" on feedback_submissions
  for insert with check (user_id = auth.uid());
