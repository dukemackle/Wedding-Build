-- Any number of people can now plan a wedding, not just the couple's second
-- partner. 0055 gave each wedding one extra slot (`partner_user_id`) and one
-- invite link (`invite_token`); this replaces both with:
--
--   wedding_members -- everyone besides the owner who has accepted an
--                      invite, each with a role: 'edit' (full read/write,
--                      what the partner had) or 'view' (sees everything,
--                      changes nothing -- e.g. a parent).
--   wedding_invites -- outstanding one-shot links, each carrying the role
--                      it grants. Several can be out at once.
--
-- The owner (weddings.user_id) stays the only one who can invite, change
-- roles, remove people, or delete the wedding.
--
-- Every policy that checked `user_id = auth.uid() or partner_user_id =
-- auth.uid()` is rewritten against two helpers: is_wedding_member() for
-- reads and can_edit_wedding() for writes. A child table's single "for all"
-- policy therefore becomes the same policy narrowed to editors plus a
-- separate select policy for every member.
--
-- `member_ids` on weddings is a trigger-kept copy of wedding_members.user_id
-- so the app can keep finding "my wedding" in one query
-- (`.or(user_id.eq.X,member_ids.cs.{X})`) the way it did with
-- partner_user_id.
--
-- partner_user_id and invite_token are copied over and left in place, unused,
-- so code deployed before this migration keeps working; a later migration
-- can drop them.

create table if not exists wedding_members (
  wedding_id uuid not null references weddings (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'edit' check (role in ('edit', 'view')),
  created_at timestamptz not null default now(),
  primary key (wedding_id, user_id)
);
create index if not exists wedding_members_user_id_idx on wedding_members (user_id);

create table if not exists wedding_invites (
  token uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings (id) on delete cascade,
  role text not null default 'edit' check (role in ('edit', 'view')),
  created_at timestamptz not null default now()
);
create index if not exists wedding_invites_wedding_id_idx on wedding_invites (wedding_id);

alter table weddings add column if not exists member_ids uuid[] not null default '{}';
create index if not exists weddings_member_ids_idx on weddings using gin (member_ids);

create or replace function sync_wedding_member_ids()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  wid uuid := coalesce(new.wedding_id, old.wedding_id);
begin
  update weddings
  set member_ids = coalesce(
    (select array_agg(user_id order by created_at) from wedding_members where wedding_id = wid),
    '{}'
  )
  where id = wid;
  return null;
end;
$$;

drop trigger if exists wedding_members_sync_ids on wedding_members;
create trigger wedding_members_sync_ids
  after insert or update or delete on wedding_members
  for each row execute function sync_wedding_member_ids();

-- Bring the existing partner and any outstanding link across. Both had full
-- access under 0055, so both become 'edit'.
insert into wedding_members (wedding_id, user_id, role)
select id, partner_user_id, 'edit' from weddings where partner_user_id is not null
on conflict do nothing;

insert into wedding_invites (token, wedding_id, role)
select invite_token, id, 'edit' from weddings where invite_token is not null
on conflict do nothing;

-- security definer so a policy on weddings can call these without the
-- lookup re-entering weddings' own RLS.
create or replace function is_wedding_member(wid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from weddings where id = wid and user_id = auth.uid())
      or exists (select 1 from wedding_members where wedding_id = wid and user_id = auth.uid());
$$;

create or replace function can_edit_wedding(wid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from weddings where id = wid and user_id = auth.uid())
      or exists (
        select 1 from wedding_members
        where wedding_id = wid and user_id = auth.uid() and role = 'edit'
      );
$$;

alter table wedding_members enable row level security;
alter table wedding_invites enable row level security;

-- Everyone on a wedding can see who else is on it; only the owner changes it.
-- (Accepting an invite goes through the service-role client, since the
-- invitee isn't a member yet.)
drop policy if exists "wedding_members_member_select" on wedding_members;
create policy "wedding_members_member_select" on wedding_members
  for select
  using (is_wedding_member(wedding_id));

drop policy if exists "wedding_members_owner_write" on wedding_members;
create policy "wedding_members_owner_write" on wedding_members
  for all
  using (wedding_id in (select id from weddings where user_id = auth.uid()))
  with check (wedding_id in (select id from weddings where user_id = auth.uid()));

drop policy if exists "wedding_invites_owner_all" on wedding_invites;
create policy "wedding_invites_owner_all" on wedding_invites
  for all
  using (wedding_id in (select id from weddings where user_id = auth.uid()))
  with check (wedding_id in (select id from weddings where user_id = auth.uid()));

-- weddings itself
drop policy if exists "weddings_member_select" on weddings;
create policy "weddings_member_select" on weddings
  for select
  using (is_wedding_member(id));

drop policy if exists "weddings_member_update" on weddings;
create policy "weddings_member_update" on weddings
  for update
  using (can_edit_wedding(id))
  with check (can_edit_wedding(id));

drop policy if exists "guests_owner_all" on guests;
create policy "guests_owner_all" on guests
  for all
  using (can_edit_wedding(wedding_id))
  with check (can_edit_wedding(wedding_id));
drop policy if exists "guests_member_select" on guests;
create policy "guests_member_select" on guests
  for select
  using (is_wedding_member(wedding_id));

drop policy if exists "budget_line_items_owner_all" on budget_line_items;
create policy "budget_line_items_owner_all" on budget_line_items
  for all
  using (can_edit_wedding(wedding_id))
  with check (can_edit_wedding(wedding_id));
drop policy if exists "budget_line_items_member_select" on budget_line_items;
create policy "budget_line_items_member_select" on budget_line_items
  for select
  using (is_wedding_member(wedding_id));

drop policy if exists "venue_shortlist_owner_all" on venue_shortlist;
create policy "venue_shortlist_owner_all" on venue_shortlist
  for all
  using (can_edit_wedding(wedding_id))
  with check (can_edit_wedding(wedding_id));
drop policy if exists "venue_shortlist_member_select" on venue_shortlist;
create policy "venue_shortlist_member_select" on venue_shortlist
  for select
  using (is_wedding_member(wedding_id));

drop policy if exists "vendor_inquiries_owner_all" on vendor_inquiries;
create policy "vendor_inquiries_owner_all" on vendor_inquiries
  for all
  using (can_edit_wedding(wedding_id))
  with check (can_edit_wedding(wedding_id));
drop policy if exists "vendor_inquiries_member_select" on vendor_inquiries;
create policy "vendor_inquiries_member_select" on vendor_inquiries
  for select
  using (is_wedding_member(wedding_id));

drop policy if exists "registry_items_owner_all" on registry_items;
create policy "registry_items_owner_all" on registry_items
  for all
  using (can_edit_wedding(wedding_id))
  with check (can_edit_wedding(wedding_id));
drop policy if exists "registry_items_member_select" on registry_items;
create policy "registry_items_member_select" on registry_items
  for select
  using (is_wedding_member(wedding_id));

drop policy if exists "attire_shortlist_owner_all" on attire_shortlist;
create policy "attire_shortlist_owner_all" on attire_shortlist
  for all
  using (can_edit_wedding(wedding_id))
  with check (can_edit_wedding(wedding_id));
drop policy if exists "attire_shortlist_member_select" on attire_shortlist;
create policy "attire_shortlist_member_select" on attire_shortlist
  for select
  using (is_wedding_member(wedding_id));

drop policy if exists "owners can view their rsvp submissions" on rsvp_submissions;
create policy "owners can view their rsvp submissions" on rsvp_submissions
  for select
  using (is_wedding_member(wedding_id));

drop policy if exists "owners can update their rsvp submissions" on rsvp_submissions;
create policy "owners can update their rsvp submissions" on rsvp_submissions
  for update
  using (can_edit_wedding(wedding_id))
  with check (can_edit_wedding(wedding_id));

drop policy if exists "owners can delete their rsvp submissions" on rsvp_submissions;
create policy "owners can delete their rsvp submissions" on rsvp_submissions
  for delete
  using (can_edit_wedding(wedding_id));

drop policy if exists "itinerary_events_owner_all" on itinerary_events;
create policy "itinerary_events_owner_all" on itinerary_events
  for all
  using (can_edit_wedding(wedding_id))
  with check (can_edit_wedding(wedding_id));
drop policy if exists "itinerary_events_member_select" on itinerary_events;
create policy "itinerary_events_member_select" on itinerary_events
  for select
  using (is_wedding_member(wedding_id));

drop policy if exists "vendor_favorites_owner_all" on vendor_favorites;
create policy "vendor_favorites_owner_all" on vendor_favorites
  for all
  using (can_edit_wedding(wedding_id))
  with check (can_edit_wedding(wedding_id));
drop policy if exists "vendor_favorites_member_select" on vendor_favorites;
create policy "vendor_favorites_member_select" on vendor_favorites
  for select
  using (is_wedding_member(wedding_id));

drop policy if exists "budget_custom_items_owner_all" on budget_custom_items;
create policy "budget_custom_items_owner_all" on budget_custom_items
  for all
  using (can_edit_wedding(wedding_id))
  with check (can_edit_wedding(wedding_id));
drop policy if exists "budget_custom_items_member_select" on budget_custom_items;
create policy "budget_custom_items_member_select" on budget_custom_items
  for select
  using (is_wedding_member(wedding_id));

drop policy if exists "owners can delete their wedding's guest photos" on storage.objects;
create policy "owners can delete their wedding's guest photos" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'guest-photos'
    and exists (
      select 1 from public.weddings w
      where w.id::text = (storage.foldername(name))[1] and public.can_edit_wedding(w.id)
    )
  );

drop policy if exists "owners can upload their wedding's hero photo" on storage.objects;
create policy "owners can upload their wedding's hero photo" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'wedding-photos'
    and exists (
      select 1 from public.weddings w
      where w.id::text = (storage.foldername(name))[1] and public.can_edit_wedding(w.id)
    )
  );

drop policy if exists "owners can replace their wedding's hero photo" on storage.objects;
create policy "owners can replace their wedding's hero photo" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'wedding-photos'
    and exists (
      select 1 from public.weddings w
      where w.id::text = (storage.foldername(name))[1] and public.can_edit_wedding(w.id)
    )
  )
  with check (
    bucket_id = 'wedding-photos'
    and exists (
      select 1 from public.weddings w
      where w.id::text = (storage.foldername(name))[1] and public.can_edit_wedding(w.id)
    )
  );

drop policy if exists "owners can delete their wedding's hero photo" on storage.objects;
create policy "owners can delete their wedding's hero photo" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'wedding-photos'
    and exists (
      select 1 from public.weddings w
      where w.id::text = (storage.foldername(name))[1] and public.can_edit_wedding(w.id)
    )
  );

drop policy if exists "checklist_items_owner_all" on checklist_items;
create policy "checklist_items_owner_all" on checklist_items
  for all
  using (can_edit_wedding(wedding_id))
  with check (can_edit_wedding(wedding_id));
drop policy if exists "checklist_items_member_select" on checklist_items;
create policy "checklist_items_member_select" on checklist_items
  for select
  using (is_wedding_member(wedding_id));

drop policy if exists "seating_tables_owner_all" on seating_tables;
create policy "seating_tables_owner_all" on seating_tables
  for all
  using (can_edit_wedding(wedding_id))
  with check (can_edit_wedding(wedding_id));
drop policy if exists "seating_tables_member_select" on seating_tables;
create policy "seating_tables_member_select" on seating_tables
  for select
  using (is_wedding_member(wedding_id));

drop policy if exists "venue_layout_items_owner_all" on venue_layout_items;
create policy "venue_layout_items_owner_all" on venue_layout_items
  for all
  using (can_edit_wedding(wedding_id))
  with check (can_edit_wedding(wedding_id));
drop policy if exists "venue_layout_items_member_select" on venue_layout_items;
create policy "venue_layout_items_member_select" on venue_layout_items
  for select
  using (is_wedding_member(wedding_id));

drop policy if exists "venue_rooms_owner_all" on venue_rooms;
create policy "venue_rooms_owner_all" on venue_rooms
  for all
  using (can_edit_wedding(wedding_id))
  with check (can_edit_wedding(wedding_id));
drop policy if exists "venue_rooms_member_select" on venue_rooms;
create policy "venue_rooms_member_select" on venue_rooms
  for select
  using (is_wedding_member(wedding_id));

drop policy if exists "venue_inquiries_owner_all" on venue_inquiries;
create policy "venue_inquiries_owner_all" on venue_inquiries
  for all
  using (can_edit_wedding(wedding_id))
  with check (can_edit_wedding(wedding_id));
drop policy if exists "venue_inquiries_member_select" on venue_inquiries;
create policy "venue_inquiries_member_select" on venue_inquiries
  for select
  using (is_wedding_member(wedding_id));

drop policy if exists "wedding_faqs_owner_all" on wedding_faqs;
create policy "wedding_faqs_owner_all" on wedding_faqs
  for all
  using (can_edit_wedding(wedding_id))
  with check (can_edit_wedding(wedding_id));
drop policy if exists "wedding_faqs_member_select" on wedding_faqs;
create policy "wedding_faqs_member_select" on wedding_faqs
  for select
  using (is_wedding_member(wedding_id));

drop policy if exists "wedding_accommodations_owner_all" on wedding_accommodations;
create policy "wedding_accommodations_owner_all" on wedding_accommodations
  for all
  using (can_edit_wedding(wedding_id))
  with check (can_edit_wedding(wedding_id));
drop policy if exists "wedding_accommodations_member_select" on wedding_accommodations;
create policy "wedding_accommodations_member_select" on wedding_accommodations
  for select
  using (is_wedding_member(wedding_id));

drop policy if exists "couples can read their wedding's contracts" on storage.objects;
create policy "couples can read their wedding's contracts" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'contracts'
    and exists (
      select 1 from public.weddings w
      where w.id::text = (storage.foldername(name))[1] and public.is_wedding_member(w.id)
    )
  );

drop policy if exists "couples can upload their wedding's contracts" on storage.objects;
create policy "couples can upload their wedding's contracts" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'contracts'
    and exists (
      select 1 from public.weddings w
      where w.id::text = (storage.foldername(name))[1] and public.can_edit_wedding(w.id)
    )
  );

drop policy if exists "couples can delete their wedding's contracts" on storage.objects;
create policy "couples can delete their wedding's contracts" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'contracts'
    and exists (
      select 1 from public.weddings w
      where w.id::text = (storage.foldername(name))[1] and public.can_edit_wedding(w.id)
    )
  );

drop policy if exists "budget_contracts_owner_all" on budget_contracts;
create policy "budget_contracts_owner_all" on budget_contracts
  for all
  using (can_edit_wedding(wedding_id))
  with check (can_edit_wedding(wedding_id));
drop policy if exists "budget_contracts_member_select" on budget_contracts;
create policy "budget_contracts_member_select" on budget_contracts
  for select
  using (is_wedding_member(wedding_id));

drop policy if exists "couples can read their contact submissions" on contact_submissions;
create policy "couples can read their contact submissions" on contact_submissions
  for select to authenticated
  using (is_wedding_member(wedding_id));

drop policy if exists "couples can update their contact submissions" on contact_submissions;
create policy "couples can update their contact submissions" on contact_submissions
  for update to authenticated
  using (can_edit_wedding(wedding_id))
  with check (can_edit_wedding(wedding_id));

drop policy if exists "couples can delete their contact submissions" on contact_submissions;
create policy "couples can delete their contact submissions" on contact_submissions
  for delete to authenticated
  using (can_edit_wedding(wedding_id));

drop policy if exists "wedding_gallery_photos_owner_all" on wedding_gallery_photos;
create policy "wedding_gallery_photos_owner_all" on wedding_gallery_photos
  for all
  using (can_edit_wedding(wedding_id))
  with check (can_edit_wedding(wedding_id));
drop policy if exists "wedding_gallery_photos_member_select" on wedding_gallery_photos;
create policy "wedding_gallery_photos_member_select" on wedding_gallery_photos
  for select
  using (is_wedding_member(wedding_id));

drop policy if exists "couples can read their guest posts" on guest_posts;
create policy "couples can read their guest posts" on guest_posts
  for select to authenticated
  using (is_wedding_member(wedding_id));

drop policy if exists "couples can update their guest posts" on guest_posts;
create policy "couples can update their guest posts" on guest_posts
  for update to authenticated
  using (can_edit_wedding(wedding_id))
  with check (can_edit_wedding(wedding_id));

drop policy if exists "couples can delete their guest posts" on guest_posts;
create policy "couples can delete their guest posts" on guest_posts
  for delete to authenticated
  using (can_edit_wedding(wedding_id));

drop policy if exists "attire_party_members_owner_all" on attire_party_members;
create policy "attire_party_members_owner_all" on attire_party_members
  for all
  using (can_edit_wedding(wedding_id))
  with check (can_edit_wedding(wedding_id));
drop policy if exists "attire_party_members_member_select" on attire_party_members;
create policy "attire_party_members_member_select" on attire_party_members
  for select
  using (is_wedding_member(wedding_id));

drop policy if exists "site_blocks_owner_all" on site_blocks;
create policy "site_blocks_owner_all" on site_blocks
  for all
  using (can_edit_wedding(wedding_id))
  with check (can_edit_wedding(wedding_id));
drop policy if exists "site_blocks_member_select" on site_blocks;
create policy "site_blocks_member_select" on site_blocks
  for select
  using (is_wedding_member(wedding_id));

drop policy if exists "wedding_preferences_owner_all" on wedding_preferences;
create policy "wedding_preferences_owner_all" on wedding_preferences
  for all
  using (can_edit_wedding(wedding_id))
  with check (can_edit_wedding(wedding_id));
drop policy if exists "wedding_preferences_member_select" on wedding_preferences;
create policy "wedding_preferences_member_select" on wedding_preferences
  for select
  using (is_wedding_member(wedding_id));
