-- Lets a couple's second partner get full read/write access to the same
-- wedding instead of sharing one login. `partner_user_id` is a second,
-- optional auth.users row on the wedding (nullable -- most weddings never
-- fill it in); `invite_token` is a one-shot shareable link the owner
-- generates from the Dashboard ("Invite my partner"), and regenerating it
-- invalidates whatever link was out there before. The partner opens
-- /join-wedding?token=..., logs in or signs up, and their auth.uid() gets
-- written into partner_user_id -- see join-wedding/actions.ts.
--
-- Every RLS policy that used to check only `user_id = auth.uid()` has to
-- become a wedding-membership check instead: a row's own user_id records
-- who created it, not who's allowed to touch it, so OR-ing partner_user_id
-- onto the row-level check wouldn't let the partner see rows the owner
-- created before the invite existed. Every wedding-scoped table now checks
-- membership via a join back to weddings on wedding_id.

alter table weddings add column if not exists partner_user_id uuid references auth.users (id) on delete set null;
alter table weddings add column if not exists invite_token uuid unique;

drop policy if exists "weddings_owner_all" on weddings;

-- Insert stays owner-only (you can't create a wedding "as" someone else's
-- partner) -- it's the rest of the row's lifecycle that needs to open up.
create policy "weddings_insert_own" on weddings
  for insert
  with check (user_id = auth.uid());

create policy "weddings_member_select" on weddings
  for select
  using (user_id = auth.uid() or partner_user_id = auth.uid());

create policy "weddings_member_update" on weddings
  for update
  using (user_id = auth.uid() or partner_user_id = auth.uid())
  with check (user_id = auth.uid() or partner_user_id = auth.uid());

-- Deleting the wedding itself stays owner-only, same reasoning as insert.
create policy "weddings_owner_delete" on weddings
  for delete
  using (user_id = auth.uid());

-- Every child table: same "for all" shape, now checked through a join to
-- weddings instead of the row's own user_id.
drop policy if exists "guests_owner_all" on guests;
create policy "guests_owner_all" on guests
  for all
  using (wedding_id in (select id from weddings where user_id = auth.uid() or partner_user_id = auth.uid()))
  with check (wedding_id in (select id from weddings where user_id = auth.uid() or partner_user_id = auth.uid()));

drop policy if exists "budget_line_items_owner_all" on budget_line_items;
create policy "budget_line_items_owner_all" on budget_line_items
  for all
  using (wedding_id in (select id from weddings where user_id = auth.uid() or partner_user_id = auth.uid()))
  with check (wedding_id in (select id from weddings where user_id = auth.uid() or partner_user_id = auth.uid()));

drop policy if exists "venue_shortlist_owner_all" on venue_shortlist;
create policy "venue_shortlist_owner_all" on venue_shortlist
  for all
  using (wedding_id in (select id from weddings where user_id = auth.uid() or partner_user_id = auth.uid()))
  with check (wedding_id in (select id from weddings where user_id = auth.uid() or partner_user_id = auth.uid()));

drop policy if exists "vendor_inquiries_owner_all" on vendor_inquiries;
create policy "vendor_inquiries_owner_all" on vendor_inquiries
  for all
  using (wedding_id in (select id from weddings where user_id = auth.uid() or partner_user_id = auth.uid()))
  with check (wedding_id in (select id from weddings where user_id = auth.uid() or partner_user_id = auth.uid()));

drop policy if exists "registry_items_owner_all" on registry_items;
create policy "registry_items_owner_all" on registry_items
  for all
  using (wedding_id in (select id from weddings where user_id = auth.uid() or partner_user_id = auth.uid()))
  with check (wedding_id in (select id from weddings where user_id = auth.uid() or partner_user_id = auth.uid()));

drop policy if exists "attire_shortlist_owner_all" on attire_shortlist;
create policy "attire_shortlist_owner_all" on attire_shortlist
  for all
  using (wedding_id in (select id from weddings where user_id = auth.uid() or partner_user_id = auth.uid()))
  with check (wedding_id in (select id from weddings where user_id = auth.uid() or partner_user_id = auth.uid()));

drop policy if exists "itinerary_events_owner_all" on itinerary_events;
create policy "itinerary_events_owner_all" on itinerary_events
  for all
  using (wedding_id in (select id from weddings where user_id = auth.uid() or partner_user_id = auth.uid()))
  with check (wedding_id in (select id from weddings where user_id = auth.uid() or partner_user_id = auth.uid()));

drop policy if exists "vendor_favorites_owner_all" on vendor_favorites;
create policy "vendor_favorites_owner_all" on vendor_favorites
  for all
  using (wedding_id in (select id from weddings where user_id = auth.uid() or partner_user_id = auth.uid()))
  with check (wedding_id in (select id from weddings where user_id = auth.uid() or partner_user_id = auth.uid()));

drop policy if exists "budget_custom_items_owner_all" on budget_custom_items;
create policy "budget_custom_items_owner_all" on budget_custom_items
  for all
  using (wedding_id in (select id from weddings where user_id = auth.uid() or partner_user_id = auth.uid()))
  with check (wedding_id in (select id from weddings where user_id = auth.uid() or partner_user_id = auth.uid()));

drop policy if exists "checklist_items_owner_all" on checklist_items;
create policy "checklist_items_owner_all" on checklist_items
  for all
  using (wedding_id in (select id from weddings where user_id = auth.uid() or partner_user_id = auth.uid()))
  with check (wedding_id in (select id from weddings where user_id = auth.uid() or partner_user_id = auth.uid()));

drop policy if exists "seating_tables_owner_all" on seating_tables;
create policy "seating_tables_owner_all" on seating_tables
  for all
  using (wedding_id in (select id from weddings where user_id = auth.uid() or partner_user_id = auth.uid()))
  with check (wedding_id in (select id from weddings where user_id = auth.uid() or partner_user_id = auth.uid()));

drop policy if exists "venue_layout_items_owner_all" on venue_layout_items;
create policy "venue_layout_items_owner_all" on venue_layout_items
  for all
  using (wedding_id in (select id from weddings where user_id = auth.uid() or partner_user_id = auth.uid()))
  with check (wedding_id in (select id from weddings where user_id = auth.uid() or partner_user_id = auth.uid()));

drop policy if exists "venue_rooms_owner_all" on venue_rooms;
create policy "venue_rooms_owner_all" on venue_rooms
  for all
  using (wedding_id in (select id from weddings where user_id = auth.uid() or partner_user_id = auth.uid()))
  with check (wedding_id in (select id from weddings where user_id = auth.uid() or partner_user_id = auth.uid()));

drop policy if exists "venue_inquiries_owner_all" on venue_inquiries;
create policy "venue_inquiries_owner_all" on venue_inquiries
  for all
  using (wedding_id in (select id from weddings where user_id = auth.uid() or partner_user_id = auth.uid()))
  with check (wedding_id in (select id from weddings where user_id = auth.uid() or partner_user_id = auth.uid()));

-- rsvp_submissions: same idea, but the existing policies were already
-- written as wedding_id-in-subquery rather than a row-level user_id, so
-- only the subquery's where-clause needs the partner OR'd in.
drop policy if exists "owners can view their rsvp submissions" on rsvp_submissions;
create policy "owners can view their rsvp submissions"
  on rsvp_submissions for select
  using (
    wedding_id in (select id from weddings where user_id = auth.uid() or partner_user_id = auth.uid())
  );

drop policy if exists "owners can update their rsvp submissions" on rsvp_submissions;
create policy "owners can update their rsvp submissions"
  on rsvp_submissions for update
  using (wedding_id in (select id from weddings where user_id = auth.uid() or partner_user_id = auth.uid()))
  with check (wedding_id in (select id from weddings where user_id = auth.uid() or partner_user_id = auth.uid()));

drop policy if exists "owners can delete their rsvp submissions" on rsvp_submissions;
create policy "owners can delete their rsvp submissions"
  on rsvp_submissions for delete
  using (wedding_id in (select id from weddings where user_id = auth.uid() or partner_user_id = auth.uid()));

-- Storage: guest-photos and wedding-photos policies key off the wedding id
-- in the object path's first folder segment, so the same OR needs to land
-- in each of those subqueries too.
drop policy if exists "owners can delete their wedding's guest photos" on storage.objects;
create policy "owners can delete their wedding's guest photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'guest-photos'
    and (storage.foldername(name))[1] in (
      select id::text from weddings where user_id = auth.uid() or partner_user_id = auth.uid()
    )
  );

drop policy if exists "owners can upload their wedding's hero photo" on storage.objects;
create policy "owners can upload their wedding's hero photo"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'wedding-photos'
    and (storage.foldername(name))[1] in (
      select id::text from weddings where user_id = auth.uid() or partner_user_id = auth.uid()
    )
  );

drop policy if exists "owners can replace their wedding's hero photo" on storage.objects;
create policy "owners can replace their wedding's hero photo"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'wedding-photos'
    and (storage.foldername(name))[1] in (
      select id::text from weddings where user_id = auth.uid() or partner_user_id = auth.uid()
    )
  )
  with check (
    bucket_id = 'wedding-photos'
    and (storage.foldername(name))[1] in (
      select id::text from weddings where user_id = auth.uid() or partner_user_id = auth.uid()
    )
  );

drop policy if exists "owners can delete their wedding's hero photo" on storage.objects;
create policy "owners can delete their wedding's hero photo"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'wedding-photos'
    and (storage.foldername(name))[1] in (
      select id::text from weddings where user_id = auth.uid() or partner_user_id = auth.uid()
    )
  );
