-- How the guest site looks: theme, accent and, later, fonts, hero layout,
-- motion and section order. One jsonb per copy rather than a column per
-- option, validated in code (src/lib/site-design.ts), so new options don't
-- need migrations. See docs/guest-site-editor.md.
--
-- Two copies so the couple can try things without guests watching:
-- the editor writes site_design_draft, Publish copies it to site_design.
-- Null in either means "the default theme".
alter table weddings
  add column if not exists site_design jsonb,
  add column if not exists site_design_draft jsonb;

-- Only the published copy is exposed to guests. The draft stays behind the
-- owner policies on weddings.
-- Appending only: `create or replace view` can add columns but cannot rename
-- or reorder the ones already there.
create or replace view public_weddings as
  select
    w.id,
    w.public_slug,
    w.partner_a_name,
    w.partner_b_name,
    w.wedding_date,
    w.region,
    w.hero_photo_url,
    w.rsvp_deadline,
    w.dress_code,
    w.travel_notes,
    v.name as venue_name,
    v.city as venue_city,
    v.state as venue_state,
    w.itinerary_published,
    w.site_design
  from weddings w
  left join venues v on v.id = w.venue_id
  where w.public_slug is not null;

grant select on public_weddings to anon, authenticated;
