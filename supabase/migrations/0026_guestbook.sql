-- Guestbook: lets guests attach a photo and a public well-wish message
-- when they RSVP, since a lot of wedding sites do this and it's a nice
-- personal touch. Photos land in a new public `guest-photos` storage
-- bucket (anon upload allowed, same trust model as rsvp_submissions
-- insert -- a stranger can only add a new photo, never touch another
-- guest's). Photo + message travel with the RSVP submission and, like
-- every other RSVP field, only become part of the real guest record
-- once the couple approves it on the Guests page (see
-- approveRsvpSubmission). From there they're only shown on the public
-- site via the public_guestbook_entries view below -- same
-- narrow-view-instead-of-table-RLS approach as public_weddings, so a
-- stranger can never read a guest's private notes/email/meal, and the
-- couple can pull an entry back out of the guestbook at any time via
-- `guestbook_hidden` without deleting the guest.

alter table rsvp_submissions add column if not exists photo_url text;
alter table rsvp_submissions add column if not exists message text;

alter table guests add column if not exists photo_url text;
alter table guests add column if not exists message text;
alter table guests add column if not exists guestbook_hidden boolean not null default false;

create or replace view public_guestbook_entries as
  select id, wedding_id, name, photo_url, message, created_at
  from guests
  where (message is not null or photo_url is not null)
    and guestbook_hidden = false
    and wedding_id in (select id from public_weddings);

grant select on public_guestbook_entries to anon, authenticated;

insert into storage.buckets (id, name, public)
values ('guest-photos', 'guest-photos', true)
on conflict (id) do nothing;

create policy "anyone can upload a guest photo"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'guest-photos');

create policy "anyone can view guest photos"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'guest-photos');

create policy "owners can delete their wedding's guest photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'guest-photos'
    and (storage.foldername(name))[1] in (
      select id::text from weddings where user_id = auth.uid()
    )
  );
