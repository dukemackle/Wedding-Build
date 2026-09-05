-- Guest wall: shows "N people going" with a grid of confirmed guests'
-- avatars on the public wedding site, Partiful-style social proof.
-- Same narrow-view-instead-of-table-RLS approach as public_weddings
-- and public_guestbook_entries -- exposes only name + photo_url for
-- confirmed guests on weddings that have opted into a public site,
-- never the rest of the guests row (email, notes, meal, priority...).

create or replace view public_confirmed_guests as
  select id, wedding_id, name, photo_url, created_at
  from guests
  where status = 'confirmed'
    and wedding_id in (select id from public_weddings);

grant select on public_confirmed_guests to anon, authenticated;
