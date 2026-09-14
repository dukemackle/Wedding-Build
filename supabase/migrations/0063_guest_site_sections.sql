-- Guest-site sections every competitor treats as essential and Wren was
-- missing: travel/accommodations, an FAQ, a dress code, and directions or
-- parking notes. Without an FAQ in particular, couples field the same
-- question by text forty times over.

alter table weddings add column if not exists dress_code text;
alter table weddings add column if not exists travel_notes text;

-- The guest site reads through this view (never the weddings table), so a
-- new guest-facing column is invisible until it's added here.
create or replace view public_weddings as
  select
    id, public_slug, partner_a_name, partner_b_name, wedding_date, region,
    hero_photo_url, rsvp_deadline, dress_code, travel_notes
  from weddings
  where public_slug is not null;

grant select on public_weddings to anon, authenticated;

create table if not exists wedding_faqs (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings (id) on delete cascade,
  user_id uuid not null default auth.uid(),
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists wedding_faqs_wedding_id_idx on wedding_faqs (wedding_id, sort_order);

create table if not exists wedding_accommodations (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings (id) on delete cascade,
  user_id uuid not null default auth.uid(),
  name text not null,
  address text,
  booking_url text,
  notes text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists wedding_accommodations_wedding_id_idx
  on wedding_accommodations (wedding_id, sort_order);

alter table wedding_faqs enable row level security;
alter table wedding_accommodations enable row level security;

-- Couple (or their partner) manages their own rows; anyone can read them
-- once the guest site is turned on, same shape as itinerary_events.
drop policy if exists "wedding_faqs_owner_all" on wedding_faqs;
create policy "wedding_faqs_owner_all" on wedding_faqs
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

drop policy if exists "public can view faqs for public weddings" on wedding_faqs;
create policy "public can view faqs for public weddings" on wedding_faqs
  for select
  to anon, authenticated
  using (exists (select 1 from public_weddings pw where pw.id = wedding_faqs.wedding_id));

drop policy if exists "wedding_accommodations_owner_all" on wedding_accommodations;
create policy "wedding_accommodations_owner_all" on wedding_accommodations
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

drop policy if exists "public can view accommodations for public weddings" on wedding_accommodations;
create policy "public can view accommodations for public weddings" on wedding_accommodations
  for select
  to anon, authenticated
  using (
    exists (select 1 from public_weddings pw where pw.id = wedding_accommodations.wedding_id)
  );
