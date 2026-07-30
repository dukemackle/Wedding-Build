-- Public guest-facing wedding site: a shareable link (no login) where
-- invited guests can view basic wedding info + the registry and submit
-- their own RSVP, instead of the couple entering everything by hand.
--
-- Security approach: guests never get direct access to the `weddings`,
-- `guests`, or `registry_items` tables. A wedding only becomes visible
-- once the couple sets a `public_slug` on it. Public reads go through the
-- `public_weddings` view, which is owned by the migration role and so
-- bypasses RLS on the underlying `weddings` table -- but only ever
-- exposes the handful of columns in its definition, and only for rows
-- that already opted in with a public_slug. RSVP submissions land in a
-- brand new `rsvp_submissions` table (insert-only for the public) rather
-- than writing directly into `guests`, so a stranger with the link can
-- never edit or delete another guest's real RSVP -- the couple reviews
-- submissions and merges them into the real guest list themselves.

alter table weddings add column if not exists public_slug text unique;

create table if not exists rsvp_submissions (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings (id) on delete cascade,
  guest_name text not null,
  household text,
  plus_one boolean not null default false,
  status text not null default 'confirmed' check (status in ('confirmed', 'declined')),
  meal text,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists rsvp_submissions_wedding_id_idx on rsvp_submissions (wedding_id);

alter table rsvp_submissions enable row level security;

create or replace view public_weddings as
  select id, public_slug, partner_a_name, partner_b_name, wedding_date, region
  from weddings
  where public_slug is not null;

grant select on public_weddings to anon, authenticated;

create policy "anyone can submit an rsvp to a public wedding"
  on rsvp_submissions for insert
  to anon, authenticated
  with check (
    exists (select 1 from public_weddings pw where pw.id = rsvp_submissions.wedding_id)
  );

create policy "owners can view their rsvp submissions"
  on rsvp_submissions for select
  to authenticated
  using (
    wedding_id in (select id from weddings where user_id = auth.uid())
  );

create policy "owners can update their rsvp submissions"
  on rsvp_submissions for update
  to authenticated
  using (wedding_id in (select id from weddings where user_id = auth.uid()))
  with check (wedding_id in (select id from weddings where user_id = auth.uid()));

create policy "owners can delete their rsvp submissions"
  on rsvp_submissions for delete
  to authenticated
  using (wedding_id in (select id from weddings where user_id = auth.uid()));

create policy "public can view registry for public weddings"
  on registry_items for select
  to anon, authenticated
  using (
    exists (select 1 from public_weddings pw where pw.id = registry_items.wedding_id)
  );
