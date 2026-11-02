-- Who each schedule event is for. One schedule, three audiences:
--
--   guests   on the guest site (once published) and every run sheet
--   party    the wedding party and family: hair and makeup, family photos,
--            rehearsal call times. On the wedding-party run sheet, never
--            on the guest site.
--   private  the couple and their vendors: load-in, first look, planner
--            notes. Only on the full run sheet.
--
-- Existing events default to 'guests', so nothing already on a published
-- guest site disappears; couples retag what shouldn't be there.
--
-- invite_only stays: it narrows a guest event to chosen guests, which is a
-- question of which guests, not of audience.

alter table itinerary_events
  add column if not exists audience text not null default 'guests';

alter table itinerary_events drop constraint if exists itinerary_events_audience_check;
alter table itinerary_events
  add constraint itinerary_events_audience_check
  check (audience in ('guests', 'party', 'private'));

-- Guests can only RSVP to events they can see.
update itinerary_events set rsvp = false, invite_only = false where audience <> 'guests';
alter table itinerary_events drop constraint if exists itinerary_events_rsvp_guests_check;
alter table itinerary_events
  add constraint itinerary_events_rsvp_guests_check
  check (audience = 'guests' or (not rsvp and not invite_only));

-- THE GATE, as in 0066: the anon key is public, so the guest page leaving
-- these out would not keep them private. Only guest events of a published
-- schedule are readable by anyone but the couple.
drop policy if exists "public can view published itineraries" on itinerary_events;
create policy "public can view published itineraries" on itinerary_events
  for select
  to anon, authenticated
  using (
    itinerary_events.audience = 'guests'
    and not itinerary_events.invite_only
    and exists (
      select 1 from public_weddings pw
      where pw.id = itinerary_events.wedding_id
        and pw.itinerary_published
    )
  );
