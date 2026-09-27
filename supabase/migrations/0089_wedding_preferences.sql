-- What Wren has learned about a couple from its planning interview: ceremony,
-- vibe, priorities, budget comfort, guest-list sensitivities. One row per
-- wedding; answers is keyed by question id (src/lib/ai/planning-profile.ts) so
-- questions can be added later without a migration. Fed into every assistant
-- conversation so Wren doesn't have to re-ask.
create table if not exists wedding_preferences (
  wedding_id uuid primary key references weddings (id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  -- Question ids the couple chose to skip, so Wren doesn't keep asking.
  skipped text[] not null default '{}',
  updated_at timestamptz not null default now()
);

alter table wedding_preferences enable row level security;

drop policy if exists "wedding_preferences_owner_all" on wedding_preferences;
create policy "wedding_preferences_owner_all" on wedding_preferences
  for all
  using (
    wedding_id in (
      select id from weddings
      where user_id = auth.uid() or partner_user_id = auth.uid()
    )
  )
  with check (
    wedding_id in (
      select id from weddings
      where user_id = auth.uid() or partner_user_id = auth.uid()
    )
  );
