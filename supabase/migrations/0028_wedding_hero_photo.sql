-- Couple's hero photo: a real photo of the couple (not a placeholder
-- illustration) shown at the top of the public wedding site. Reuses
-- the Supabase Storage approach from the guestbook migration, but this
-- bucket is owner-upload-only -- unlike guest-photos, which anyone
-- with the invite link can add to, only the couple should ever be
-- able to set/replace their own hero photo.

alter table weddings add column if not exists hero_photo_url text;

-- public_weddings needs to expose the new column for the public site
-- to read it -- same narrow view as before, just one more column.
create or replace view public_weddings as
  select id, public_slug, partner_a_name, partner_b_name, wedding_date, region, hero_photo_url
  from weddings
  where public_slug is not null;

insert into storage.buckets (id, name, public)
values ('wedding-photos', 'wedding-photos', true)
on conflict (id) do nothing;

create policy "owners can upload their wedding's hero photo"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'wedding-photos'
    and (storage.foldername(name))[1] in (
      select id::text from weddings where user_id = auth.uid()
    )
  );

create policy "anyone can view wedding photos"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'wedding-photos');

create policy "owners can replace their wedding's hero photo"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'wedding-photos'
    and (storage.foldername(name))[1] in (
      select id::text from weddings where user_id = auth.uid()
    )
  )
  with check (
    bucket_id = 'wedding-photos'
    and (storage.foldername(name))[1] in (
      select id::text from weddings where user_id = auth.uid()
    )
  );

create policy "owners can delete their wedding's hero photo"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'wedding-photos'
    and (storage.foldername(name))[1] in (
      select id::text from weddings where user_id = auth.uid()
    )
  );
