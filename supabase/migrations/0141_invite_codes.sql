-- Personal RSVP links. Each guest gets a short invite code; their link
-- (/w/<slug>/i/<code>) opens their whole household -- everyone sharing the
-- `household` text the couple already fills in -- so one person answers for
-- the family, and answers land on the guest list without the typed-name
-- approval queue. Typing a name on the site keeps working as before.

-- 1. Codes: 6 characters with no look-alikes (no 0/O, 1/I/L), easy to read
--    off a paper invitation. Unique within a wedding.
create or replace function new_invite_code()
returns text
language sql
volatile
as $$
  select string_agg(substr('ABCDEFGHJKMNPQRSTUVWXYZ23456789', 1 + floor(random() * 31)::int, 1), '')
  from generate_series(1, 6);
$$;

alter table guests add column if not exists invite_code text;
update guests set invite_code = new_invite_code() where invite_code is null;
-- On the rare clash, draw again until every code in a wedding is distinct.
do $$
begin
  while exists (
    select 1 from guests group by wedding_id, invite_code having count(*) > 1
  ) loop
    update guests g set invite_code = new_invite_code()
    where g.id in (
      select id from (
        select id, row_number() over (partition by wedding_id, invite_code order by created_at) as n
        from guests
      ) d where d.n > 1
    );
  end loop;
end $$;
alter table guests alter column invite_code set default new_invite_code();
alter table guests alter column invite_code set not null;
create unique index if not exists guests_wedding_invite_code_key on guests (wedding_id, invite_code);

-- 2. "Allowed a plus-one" apart from "bringing one". plus_one stays the
--    headcount everything else reads (budget, seating, catering); a guest
--    answering "just me" now clears plus_one without losing the allowance.
--    Starts as today's plus_one, and ticking plus_one keeps it allowed.
alter table guests add column if not exists plus_one_allowed boolean not null default false;
update guests set plus_one_allowed = true where plus_one and not plus_one_allowed;

create or replace function keep_plus_one_allowed()
returns trigger
language plpgsql
as $$
begin
  if new.plus_one then
    new.plus_one_allowed := true;
  end if;
  return new;
end;
$$;
drop trigger if exists guests_keep_plus_one_allowed on guests;
create trigger guests_keep_plus_one_allowed
  before insert or update of plus_one on guests
  for each row execute function keep_plus_one_allowed();

-- 3. When a guest last answered through their link, so the couple sees
--    "changed their answer" on the list.
alter table guests add column if not exists rsvp_changed_at timestamptz;

-- 4. The personal link's lookups count against the guest-site limits too.
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
    ('invite', 30, null, null),
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
