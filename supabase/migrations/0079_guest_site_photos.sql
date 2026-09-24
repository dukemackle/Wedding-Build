-- More photos on the guest site: the couple's own gallery, and a photo wall
-- guests can post to at any time -- after they RSVP, or from their phone at
-- the reception via the table-card QR code.
--
-- Until now a guest could leave one photo and message, and only inside the
-- RSVP form. That's the only moment most guests visit, but it's the least
-- photogenic one: the good pictures happen on the day. So posts are their own
-- table, not a column on the guest, and one person can post as often as they
-- like.
--
-- Every post waits for the couple's approval before it's public. A wedding
-- site is shared well beyond the guest list, and anon insert means anyone
-- holding the link can post -- approval is what keeps one bad upload from
-- sitting on the page until the couple happens to notice it.

-- ---------------------------------------------------------------------------
-- The couple's gallery
-- ---------------------------------------------------------------------------

create table if not exists wedding_gallery_photos (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings (id) on delete cascade,
  photo_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists wedding_gallery_photos_wedding_id_idx
  on wedding_gallery_photos (wedding_id, sort_order);

alter table wedding_gallery_photos enable row level security;

drop policy if exists "wedding_gallery_photos_owner_all" on wedding_gallery_photos;
create policy "wedding_gallery_photos_owner_all" on wedding_gallery_photos
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

drop policy if exists "public can view gallery for public weddings" on wedding_gallery_photos;
create policy "public can view gallery for public weddings" on wedding_gallery_photos
  for select
  to anon, authenticated
  using (exists (select 1 from public_weddings pw where pw.id = wedding_gallery_photos.wedding_id));

-- ---------------------------------------------------------------------------
-- Guest posts
-- ---------------------------------------------------------------------------

create table if not exists guest_posts (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings (id) on delete cascade,
  name text not null,
  message text,
  photo_url text,
  -- pending until the couple approves; hidden pulls an approved post back
  -- off the site without deleting it.
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'hidden')),
  created_at timestamptz not null default now(),
  check (message is not null or photo_url is not null)
);
create index if not exists guest_posts_wedding_id_idx on guest_posts (wedding_id, created_at);

alter table guest_posts enable row level security;

-- Insert only, only to a public wedding, and only as pending: a stranger
-- can't approve their own post. No anon select -- the public reads through
-- the view below.
drop policy if exists "anyone can post to a public wedding" on guest_posts;
create policy "anyone can post to a public wedding"
  on guest_posts for insert
  to anon, authenticated
  with check (
    status = 'pending'
    and exists (select 1 from public_weddings pw where pw.id = guest_posts.wedding_id)
  );

drop policy if exists "couples can read their guest posts" on guest_posts;
create policy "couples can read their guest posts"
  on guest_posts for select
  to authenticated
  using (
    wedding_id in (
      select id from weddings where user_id = auth.uid() or partner_user_id = auth.uid()
    )
  );

drop policy if exists "couples can update their guest posts" on guest_posts;
create policy "couples can update their guest posts"
  on guest_posts for update
  to authenticated
  using (
    wedding_id in (
      select id from weddings where user_id = auth.uid() or partner_user_id = auth.uid()
    )
  )
  with check (
    wedding_id in (
      select id from weddings where user_id = auth.uid() or partner_user_id = auth.uid()
    )
  );

drop policy if exists "couples can delete their guest posts" on guest_posts;
create policy "couples can delete their guest posts"
  on guest_posts for delete
  to authenticated
  using (
    wedding_id in (
      select id from weddings where user_id = auth.uid() or partner_user_id = auth.uid()
    )
  );

-- The guest site's wall reads this one view, so RSVP messages (approved with
-- the RSVP, see 0026) and standalone posts land in the same feed. Same
-- columns as before, so nothing reading it needs to change.
create or replace view public_guestbook_entries as
  select id, wedding_id, name, photo_url, message, created_at
  from guests
  where (message is not null or photo_url is not null)
    and guestbook_hidden = false
    and wedding_id in (select id from public_weddings)
  union all
  select id, wedding_id, name, photo_url, message, created_at
  from guest_posts
  where status = 'approved'
    and wedding_id in (select id from public_weddings);

grant select on public_guestbook_entries to anon, authenticated;
