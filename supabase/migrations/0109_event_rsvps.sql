-- RSVPs per event, for weddings that run over several (mehndi, sangeet,
-- ceremony, reception...).
--
-- The couple ticks which schedule events ask guests to RSVP (`rsvp`), and can
-- make some invite-only (`invite_only`), naming who is invited in
-- guest_event_invites. A guest answering on the guest site types their name;
-- rsvp_events_for() returns the RSVP events open to everyone plus the
-- invite-only ones that name is invited to. Answers ride on the submission
-- (`events`: {event id: true/false}) and are copied to the guest
-- (`event_rsvps`) when the couple approves it.
--
-- Invite-only events stay off the public schedule: the anon key is public, so
-- hiding them in the page alone would not keep them private.

alter table itinerary_events add column if not exists rsvp boolean not null default false;
alter table itinerary_events add column if not exists invite_only boolean not null default false;

alter table rsvp_submissions add column if not exists events jsonb;
alter table guests add column if not exists event_rsvps jsonb;

create table if not exists guest_event_invites (
  guest_id uuid not null references guests (id) on delete cascade,
  event_id uuid not null references itinerary_events (id) on delete cascade,
  wedding_id uuid not null references weddings (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (guest_id, event_id)
);
create index if not exists guest_event_invites_event_idx on guest_event_invites (event_id);
create index if not exists guest_event_invites_wedding_idx on guest_event_invites (wedding_id);

alter table guest_event_invites enable row level security;

drop policy if exists "guest_event_invites_owner_all" on guest_event_invites;
create policy "guest_event_invites_owner_all" on guest_event_invites
  for all
  using (can_edit_wedding(wedding_id))
  with check (can_edit_wedding(wedding_id));

drop policy if exists "guest_event_invites_member_select" on guest_event_invites;
create policy "guest_event_invites_member_select" on guest_event_invites
  for select
  using (is_wedding_member(wedding_id));

-- The public schedule leaves out invite-only events.
drop policy if exists "public can view published itineraries" on itinerary_events;
create policy "public can view published itineraries" on itinerary_events
  for select
  to anon, authenticated
  using (
    not itinerary_events.invite_only
    and exists (
      select 1 from public_weddings pw
      where pw.id = itinerary_events.wedding_id
        and pw.itinerary_published
    )
  );

-- The RSVP events a guest of this name should answer: every open RSVP event,
-- plus the invite-only ones a guest of exactly this name (ignoring case and
-- spacing) is invited to. Security definer because guests and invites are
-- private; it returns only event details, never anyone's guest record.
create or replace function rsvp_events_for(p_wedding uuid, p_name text)
returns table (
  id uuid,
  title text,
  event_date date,
  start_time time,
  location text,
  invite_only boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select e.id, e.title, e.event_date, e.start_time, e.location, e.invite_only
  from itinerary_events e
  where e.wedding_id = p_wedding
    and e.rsvp
    and exists (select 1 from public_weddings pw where pw.id = p_wedding)
    and (
      not e.invite_only
      or exists (
        select 1
        from guest_event_invites gi
        join guests g on g.id = gi.guest_id
        where gi.event_id = e.id
          and g.wedding_id = p_wedding
          and lower(regexp_replace(trim(g.name), '\s+', ' ', 'g'))
            = lower(regexp_replace(trim(coalesce(p_name, '')), '\s+', ' ', 'g'))
      )
    )
  order by e.event_date, e.start_time nulls first;
$$;

grant execute on function rsvp_events_for(uuid, text) to anon, authenticated;
