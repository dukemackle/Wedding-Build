-- Guest sites, one at a time and behind their password.
--
-- Until now the public views (public_weddings and everything that reads it)
-- answered for every published wedding at once. The anon key is public by
-- design, so anyone could list every wedding on the platform with its date,
-- venue and payment handles, and every confirmed guest's name and photo --
-- password or not (0112 said as much). The site's password only kept the page
-- itself closed.
--
-- Now a request sees a guest site only when it names it: the app sends the
-- slug in an x-guest-site header and, for a site with a password, the gate
-- cookie's token in x-guest-site-token (src/lib/supabase/guest-site.ts).
-- PostgREST hands request headers to Postgres as request.headers, so the
-- checks below run inside the views and the row-security policies that read
-- them. The couple and their partner still see their own site, as before,
-- through is_wedding_member.
--
-- Two pages answer by slug alone, without the password: the address
-- collector (couples send it before invitations go out) and the photo-wall
-- page the table cards link to. guest_site_cover gives them, and the
-- password page, only the names, date and look of the site.
--
-- Also: the shipping address a registry claim returns follows the same
-- rule, wrong passwords are rate-limited, new passwords need 8 characters,
-- and guests no longer upload to Storage directly (the app does it after
-- checking the site, so the bucket can't be used as free file hosting).

-- A request header, or null. request.headers is unset outside PostgREST.
create or replace function request_header(header_name text)
returns text
language sql
stable
as $$
  select nullif(current_setting('request.headers', true), '')::json ->> lower(header_name);
$$;

-- This request named this wedding's guest site (the password isn't checked).
create or replace function guest_site_named(wid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from weddings w
    where w.id = wid
      and w.public_slug is not null
      and w.public_slug = request_header('x-guest-site')
  ) or is_wedding_member(wid);
$$;

-- This request may read this wedding's guest site: it named it and, when the
-- site has a password, carries the token unlock_guest_site handed out.
create or replace function guest_site_open(wid uuid)
returns boolean
language sql
stable
security definer
set search_path = public, extensions
as $$
  select exists (
    select 1 from weddings w
    where w.id = wid
      and w.public_slug is not null
      and w.public_slug = request_header('x-guest-site')
      and (
        w.site_password_hash is null
        or encode(digest(w.site_password_hash || w.id::text, 'sha256'), 'hex')
          = request_header('x-guest-site-token')
      )
  ) or is_wedding_member(wid);
$$;

grant execute on function request_header(text) to anon, authenticated;
grant execute on function guest_site_named(uuid) to anon, authenticated;
grant execute on function guest_site_open(uuid) to anon, authenticated;

-- public_weddings as of 0116, limited to the site this request opened.
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
    coalesce(v.name, w.own_venue_name) as venue_name,
    coalesce(v.city, w.own_venue_city) as venue_city,
    coalesce(v.state, w.own_venue_state) as venue_state,
    w.itinerary_published,
    w.site_design,
    coalesce(nullif(w.own_venue_photo_urls, '{}'), v.photo_urls) as venue_photo_urls,
    coalesce(v.about, v.description) as venue_about,
    coalesce(v.address, w.own_venue_address) as venue_address,
    (w.site_password_hash is not null) as site_locked,
    (cardinality(w.own_venue_photo_urls) > 0) as venue_photos_own,
    w.gift_venmo,
    w.gift_paypal,
    w.gift_cashapp,
    w.gift_zelle,
    w.meal_options,
    w.ask_dietary
  from weddings w
  left join venues v on v.id = w.venue_id
  where w.public_slug is not null and guest_site_open(w.id);

grant select on public_weddings to anon, authenticated;

-- public_confirmed_guests, public_guestbook_entries, rsvp_events_for and the
-- guest-site table policies all read public_weddings, so they follow it. These
-- two checked the slug themselves and are rebuilt on guest_site_open.
create or replace view public_party_members as
  select m.id, m.wedding_id, m.name, m.role, m.photo_url, m.site_blurb, m.sort_order
  from attire_party_members m
  join weddings w on w.id = m.wedding_id
  where w.public_slug is not null and m.on_site and guest_site_open(w.id);

grant select on public_party_members to anon, authenticated;

create or replace view public_registry_gifts as
  select
    g.id,
    g.wedding_id,
    g.kind,
    g.title,
    g.url,
    g.image_url,
    g.store,
    g.price,
    g.quantity,
    g.goal,
    g.note,
    g.sort_order,
    g.created_at,
    coalesce(c.claimed, 0)::integer as claimed,
    coalesce(c.raised, 0)::numeric(10, 2) as raised
  from registry_gifts g
  join weddings w on w.id = g.wedding_id
  left join (
    select gift_id, sum(quantity) as claimed, sum(coalesce(amount, 0)) as raised
    from registry_claims
    group by gift_id
  ) c on c.gift_id = g.id
  where (w.public_slug is not null and guest_site_open(g.wedding_id)) or is_wedding_member(g.wedding_id);

grant select on public_registry_gifts to anon, authenticated;

-- The address collector and the photo wall take submissions by slug alone.
drop policy if exists "anyone can submit contact details to a public wedding" on contact_submissions;
create policy "anyone can submit contact details to a public wedding"
  on contact_submissions for insert
  to anon, authenticated
  with check (guest_site_named(contact_submissions.wedding_id));

drop policy if exists "anyone can post to a public wedding" on guest_posts;
create policy "anyone can post to a public wedding"
  on guest_posts for insert
  to anon, authenticated
  with check (
    status = 'pending'
    and guest_site_named(guest_posts.wedding_id)
  );

-- What the password page, link previews, the address collector and the photo
-- wall need about one site, by its slug: names, date and look. Nothing else.
create or replace function guest_site_cover(site_slug text)
returns table (
  id uuid,
  public_slug text,
  partner_a_name text,
  partner_b_name text,
  wedding_date date,
  hero_photo_url text,
  venue_photo_urls text[],
  site_design jsonb,
  site_locked boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    w.id,
    w.public_slug,
    w.partner_a_name,
    w.partner_b_name,
    w.wedding_date,
    w.hero_photo_url,
    coalesce(nullif(w.own_venue_photo_urls, '{}'), v.photo_urls),
    w.site_design,
    (w.site_password_hash is not null)
  from weddings w
  left join venues v on v.id = w.venue_id
  where w.public_slug = site_slug;
$$;

revoke all on function guest_site_cover(text) from public;
grant execute on function guest_site_cover(text) to anon, authenticated;

-- Wrong passwords: 20 per site in 15 minutes, then nothing is checked until
-- the window passes. Per site rather than per visitor because the database
-- never sees who is asking; a guest locked out waits a few minutes.
create table if not exists guest_site_unlock_failures (
  id bigint generated always as identity primary key,
  wedding_id uuid not null references weddings (id) on delete cascade,
  failed_at timestamptz not null default now()
);
create index if not exists guest_site_unlock_failures_wedding_idx
  on guest_site_unlock_failures (wedding_id, failed_at);
alter table guest_site_unlock_failures enable row level security;
-- No policies: only the functions below touch it.

create or replace function unlock_guest_site(site_slug text, attempt text)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  site weddings%rowtype;
  recent integer;
begin
  select * into site from weddings w
  where w.public_slug = site_slug and w.site_password_hash is not null;
  if not found then
    return null;
  end if;

  delete from guest_site_unlock_failures where failed_at < now() - interval '1 day';
  select count(*) into recent from guest_site_unlock_failures
  where wedding_id = site.id and failed_at > now() - interval '15 minutes';
  if recent >= 20 then
    raise exception 'too_many_attempts';
  end if;

  if site.site_password_hash = crypt(coalesce(attempt, ''), site.site_password_hash) then
    return encode(digest(site.site_password_hash || site.id::text, 'sha256'), 'hex');
  end if;

  insert into guest_site_unlock_failures (wedding_id) values (site.id);
  return null;
end;
$$;

revoke all on function unlock_guest_site(text, text) from public;
grant execute on function unlock_guest_site(text, text) to anon, authenticated;

-- New passwords need 8 characters. Existing shorter ones keep working until
-- the couple changes them.
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
  if new_password is not null and new_password <> '' and char_length(new_password) not between 8 and 64 then
    raise exception 'password must be 8 to 64 characters';
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

-- claim_registry_gift as of 0115, but the gift's site must be open to this
-- request, so the shipping address goes only to someone who could see the
-- registry (past the password, if there is one).
create or replace function claim_registry_gift(
  p_gift uuid,
  p_name text,
  p_quantity integer default 1,
  p_amount numeric default null,
  p_message text default null
)
returns table (token uuid, ship_to text)
language plpgsql
security definer
set search_path = public
as $$
declare
  gift registry_gifts%rowtype;
  taken integer;
  new_token uuid;
  address text;
begin
  -- Locking the gift row makes claims on it take turns, so the count below
  -- can't go stale between reading it and inserting.
  select * into gift from registry_gifts where id = p_gift for update;
  if not found then
    raise exception 'gift_not_found';
  end if;

  select w.gift_ship_to into address from weddings w
  where w.id = gift.wedding_id and w.public_slug is not null and guest_site_open(w.id);
  if not found then
    raise exception 'gift_not_found';
  end if;

  if coalesce(btrim(p_name), '') = '' then
    raise exception 'name_required';
  end if;

  if gift.kind = 'gift' then
    if p_quantity is null or p_quantity < 1 then
      raise exception 'bad_quantity';
    end if;
    select coalesce(sum(quantity), 0) into taken from registry_claims where gift_id = gift.id;
    if taken + p_quantity > gift.quantity then
      raise exception 'already_taken';
    end if;
  elsif p_amount is not null and (p_amount <= 0 or p_amount > 100000) then
    raise exception 'bad_amount';
  end if;

  insert into registry_claims (gift_id, wedding_id, guest_name, quantity, amount, message)
  values (
    gift.id,
    gift.wedding_id,
    left(btrim(p_name), 120),
    case when gift.kind = 'gift' then p_quantity else 1 end,
    case when gift.kind = 'fund' then p_amount end,
    nullif(left(btrim(coalesce(p_message, '')), 500), '')
  )
  returning registry_claims.token into new_token;

  return query select new_token, case when gift.kind = 'gift' then address end;
end;
$$;


grant execute on function claim_registry_gift(uuid, text, integer, numeric, text) to anon, authenticated;

-- Guests' photos go up through the app (service role) after it checks the
-- site, never straight from a browser.
drop policy if exists "anyone can upload a guest photo" on storage.objects;
update storage.buckets
set file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif']
where id = 'guest-photos';
