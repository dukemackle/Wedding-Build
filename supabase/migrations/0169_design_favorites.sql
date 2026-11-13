-- Hearted templates: a couple's shortlist of looks to compare, before they
-- make a design from one. One table for every kind of design (guest site
-- now; save-the-dates and invitations later) so a matched suite can be
-- suggested from a heart. Belongs to the wedding, so both partners see the
-- same shortlist.
create table if not exists design_favorites (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings (id) on delete cascade,
  kind text not null check (kind in ('site', 'save_the_date', 'invitation')),
  template_id text not null check (char_length(template_id) between 1 and 60),
  -- The colourway showing when it was hearted; null is the template's own.
  palette text check (palette is null or char_length(palette) <= 60),
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  constraint design_favorites_one_per_template unique (wedding_id, kind, template_id)
);

alter table design_favorites enable row level security;

drop policy if exists "design_favorites_owner_all" on design_favorites;
create policy "design_favorites_owner_all" on design_favorites
  for all
  using (can_edit_wedding(wedding_id))
  with check (can_edit_wedding(wedding_id));

drop policy if exists "design_favorites_member_select" on design_favorites;
create policy "design_favorites_member_select" on design_favorites
  for select
  using (is_wedding_member(wedding_id));
