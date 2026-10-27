-- Limits on the guest site's anonymous forms. Until now an RSVP, a photo-wall
-- post or an address submission could be sent as often as anyone liked: a
-- script could fill a wedding's inbox, the storage quota, or send the couple
-- an email per fake RSVP.
--
-- RUN THIS AFTER THE APP CHANGE IS LIVE. It removes the policies that let a
-- browser insert directly; the app now writes these rows itself, after
-- checking the limits below, so an older deploy would stop taking RSVPs.

-- 1. Every write goes through the app. These let the anon key insert rows
--    straight through the REST API, around any limit the app applies.
drop policy if exists "anyone can submit an rsvp to a public wedding" on rsvp_submissions;
drop policy if exists "anyone can post to a public wedding" on guest_posts;
drop policy if exists "anyone can submit contact details to a public wedding" on contact_submissions;

-- 2. The counter. ip_hash is a daily-rotated keyed hash, never the IP itself.
create table if not exists guest_writes (
  id bigint generated always as identity primary key,
  wedding_id uuid not null references weddings (id) on delete cascade,
  kind text not null,
  ip_hash text,
  at timestamptz not null default now()
);
create index if not exists guest_writes_wedding_idx on guest_writes (wedding_id, kind, at);
create index if not exists guest_writes_ip_idx on guest_writes (ip_hash, kind, at) where ip_hash is not null;
alter table guest_writes enable row level security;
-- No policies: only allow_guest_write touches it.

-- Per visitor per hour across every wedding, and per wedding per day. Set so
-- a real wedding never meets them: a reception on one venue Wi-Fi posting
-- photos, a family RSVPing one by one from the same house. rsvp_email is the
-- couple's "New RSVP" email: one per two minutes, 30 a day.
create or replace function allow_guest_write(p_wedding uuid, p_kind text, p_ip_hash text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  per_visitor integer;
  per_wedding integer;
  gap interval;
begin
  select l.per_visitor, l.per_wedding, l.gap into per_visitor, per_wedding, gap
  from (values
    ('rsvp', 20, 300, null::interval),
    ('post', 60, 400, null),
    ('contact', 10, 300, null),
    ('claim', 20, 200, null),
    ('unlock', 20, null, null),
    ('rsvp_email', null, 30, interval '2 minutes')
  ) as l(kind, per_visitor, per_wedding, gap)
  where l.kind = p_kind;
  if not found then
    return false;
  end if;

  if random() < 0.02 then
    delete from guest_writes where at < now() - interval '2 days';
  end if;

  if gap is not null and exists (
    select 1 from guest_writes
    where wedding_id = p_wedding and kind = p_kind and at > now() - gap
  ) then
    return false;
  end if;
  if per_wedding is not null and (
    select count(*) from guest_writes
    where wedding_id = p_wedding and kind = p_kind and at > now() - interval '1 day'
  ) >= per_wedding then
    return false;
  end if;
  if per_visitor is not null and p_ip_hash is not null and (
    select count(*) from guest_writes
    where ip_hash = p_ip_hash and kind = p_kind and at > now() - interval '1 hour'
  ) >= per_visitor then
    return false;
  end if;

  insert into guest_writes (wedding_id, kind, ip_hash) values (p_wedding, p_kind, p_ip_hash);
  return true;
end;
$$;

revoke all on function allow_guest_write(uuid, text, text) from public, anon, authenticated;
grant execute on function allow_guest_write(uuid, text, text) to service_role;

-- 3. The password gate. Its limit was 20 wrong guesses per site in 15
--    minutes, so one stranger could lock every guest out. The app now limits
--    each visitor first (20 tries an hour) and calls this with the service
--    role; the per-site limit stays as a backstop against many machines at
--    once, raised so it can't be tripped casually. Body otherwise as in 0121.
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
  if recent >= 100 then
    raise exception 'too_many_attempts';
  end if;

  if site.site_password_hash = crypt(coalesce(attempt, ''), site.site_password_hash) then
    return encode(digest(site.site_password_hash || site.id::text, 'sha256'), 'hex');
  end if;

  insert into guest_site_unlock_failures (wedding_id) values (site.id);
  return null;
end;
$$;

revoke all on function unlock_guest_site(text, text) from public, anon, authenticated;
grant execute on function unlock_guest_site(text, text) to service_role;
