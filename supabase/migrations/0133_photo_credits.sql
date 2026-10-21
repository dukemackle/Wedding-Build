-- Credits for gallery photos the couple picked from the free photo library
-- (Unsplash). The banner's credit is weddings.hero_photo_credit (0132).
-- Unsplash's API terms require the photographer and Unsplash to be credited
-- wherever a photo is shown, so the guest site prints a credits line from
-- this table. Was 0132 on its branch; same contents, safe to run again.
--
-- Keyed by the photo's URL rather than a column on the gallery table, so that
-- table keeps its shape. A credit outlives its photo harmlessly: the site
-- only prints credits for URLs it is actually showing.

create table if not exists wedding_photo_credits (
  wedding_id uuid not null references weddings (id) on delete cascade,
  photo_url text not null,
  photographer text not null,
  profile_url text not null,
  created_at timestamptz not null default now(),
  primary key (wedding_id, photo_url)
);

alter table wedding_photo_credits enable row level security;

drop policy if exists "wedding_photo_credits_editor_all" on wedding_photo_credits;
create policy "wedding_photo_credits_editor_all" on wedding_photo_credits
  for all
  using (can_edit_wedding(wedding_id))
  with check (can_edit_wedding(wedding_id));

drop policy if exists "wedding_photo_credits_member_select" on wedding_photo_credits;
create policy "wedding_photo_credits_member_select" on wedding_photo_credits
  for select
  using (is_wedding_member(wedding_id));

drop policy if exists "public can view photo credits for public weddings" on wedding_photo_credits;
create policy "public can view photo credits for public weddings" on wedding_photo_credits
  for select
  to anon, authenticated
  using (exists (select 1 from public_weddings pw where pw.id = wedding_photo_credits.wedding_id));
