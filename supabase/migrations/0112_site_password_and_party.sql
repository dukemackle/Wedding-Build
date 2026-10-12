-- Two guest-site additions.
--
-- 1. A password on the guest site. The hash lives on weddings and never
--    leaves the database: guests check a guess with unlock_guest_site, which
--    hands back a token the page keeps in a cookie, and guest_site_token_ok
--    checks that token on each visit. The token is derived from the hash, so
--    changing or removing the password signs every guest out.
--
--    This keeps the page itself behind the password. The tables the page
--    reads stay readable through the public API to anyone who knows the
--    wedding's id, as before -- it stops strangers and search engines, not a
--    determined developer.
--
-- 2. The wedding party on the guest site: a photo and a line about each
--    member of the attire party board, and whether they're shown. Guests read
--    them through public_party_members, which carries only those columns --
--    never sizes, notes or order status.

create extension if not exists pgcrypto with schema extensions;

alter table weddings add column if not exists site_password_hash text;

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
    w.site_design,
    v.photo_urls as venue_photo_urls,
    coalesce(v.about, v.description) as venue_about,
    v.address as venue_address,
    (w.site_password_hash is not null) as site_locked
  from weddings w
  left join venues v on v.id = w.venue_id
  where w.public_slug is not null;

grant select on public_weddings to anon, authenticated;

-- Sets (or, with null or '', removes) the password. Only the couple can.
create or replace function set_guest_site_password(target_wedding uuid, new_password text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if not can_edit_wedding(target_wedding) then
    raise exception 'not allowed';
  end if;
  if new_password is not null and new_password <> '' and char_length(new_password) not between 4 and 64 then
    raise exception 'password must be 4 to 64 characters';
  end if;
  update weddings
  set site_password_hash = case
    when new_password is null or new_password = '' then null
    else crypt(new_password, gen_salt('bf'))
  end
  where id = target_wedding;
end;
$$;

revoke all on function set_guest_site_password(uuid, text) from public;
grant execute on function set_guest_site_password(uuid, text) to authenticated;

-- A right guess returns the token for the cookie; a wrong one returns null.
create or replace function unlock_guest_site(site_slug text, attempt text)
returns text
language sql
stable
security definer
set search_path = public, extensions
as $$
  select encode(digest(w.site_password_hash || w.id::text, 'sha256'), 'hex')
  from weddings w
  where w.public_slug = site_slug
    and w.site_password_hash is not null
    and w.site_password_hash = crypt(attempt, w.site_password_hash);
$$;

create or replace function guest_site_token_ok(site_slug text, token text)
returns boolean
language sql
stable
security definer
set search_path = public, extensions
as $$
  select coalesce((
    select encode(digest(w.site_password_hash || w.id::text, 'sha256'), 'hex') = token
    from weddings w
    where w.public_slug = site_slug and w.site_password_hash is not null
  ), false);
$$;

revoke all on function unlock_guest_site(text, text) from public;
revoke all on function guest_site_token_ok(text, text) from public;
grant execute on function unlock_guest_site(text, text) to anon, authenticated;
grant execute on function guest_site_token_ok(text, text) to anon, authenticated;

alter table attire_party_members
  add column if not exists photo_url text,
  add column if not exists site_blurb text check (char_length(site_blurb) <= 280),
  add column if not exists on_site boolean not null default true;

create or replace view public_party_members as
  select m.id, m.wedding_id, m.name, m.role, m.photo_url, m.site_blurb, m.sort_order
  from attire_party_members m
  join weddings w on w.id = m.wedding_id
  where w.public_slug is not null and m.on_site;

grant select on public_party_members to anon, authenticated;
