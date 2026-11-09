-- Invitations (Guests › Invitations): the couple's invitation designs.
--
-- Same shape as save_the_dates (0155, 0157): `doc` is the whole design,
-- validated by cardDocSchema in src/lib/save-the-date/schema.ts, drawn from
-- an invitation template (src/lib/save-the-date/invitations.ts). Kept in
-- their own table so save-the-date sending, the chosen card and guests'
-- personal links are untouched. `chosen` marks the one they'll print or send.
create table if not exists invitations (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings (id) on delete cascade,
  name text not null default 'My invitation',
  chosen boolean not null default false,
  doc jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists invitations_one_chosen on invitations (wedding_id) where chosen;
create index if not exists invitations_wedding on invitations (wedding_id);

alter table invitations enable row level security;

drop policy if exists "invitations_owner_all" on invitations;
create policy "invitations_owner_all" on invitations
  for all
  using (can_edit_wedding(wedding_id))
  with check (can_edit_wedding(wedding_id));

drop policy if exists "invitations_member_select" on invitations;
create policy "invitations_member_select" on invitations
  for select
  using (is_wedding_member(wedding_id));
