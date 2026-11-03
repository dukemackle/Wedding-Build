-- Save the Date Studio (Guests › Save the date): the couple's card.
--
-- One card per wedding for now: `doc` is the whole design (template,
-- colours, fonts, their words, photo, per-layer moves), validated by
-- cardDocSchema in src/lib/save-the-date/schema.ts, so new template options
-- need no migration. The card is always drawn from this, never stored as a
-- flattened image. Sending to guests comes later and gets its own columns.
--
-- Widening to several cards per wedding later is one dropped constraint.
create table if not exists save_the_dates (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null unique references weddings (id) on delete cascade,
  doc jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table save_the_dates enable row level security;

drop policy if exists "save_the_dates_owner_all" on save_the_dates;
create policy "save_the_dates_owner_all" on save_the_dates
  for all
  using (can_edit_wedding(wedding_id))
  with check (can_edit_wedding(wedding_id));

drop policy if exists "save_the_dates_member_select" on save_the_dates;
create policy "save_the_dates_member_select" on save_the_dates
  for select
  using (is_wedding_member(wedding_id));
