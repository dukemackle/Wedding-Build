-- Product events, so the admin can see where couples drop off instead of
-- guessing from row counts. Written by trackEvent() in src/lib/events.ts,
-- from the server actions that do the thing, after the write succeeds; read
-- on /admin/analytics through admin_event_funnels().
--
-- No names, emails, guest details or free text: an event is a fixed name, the
-- wedding / user / listing it's about, and a few small typed props. Row
-- security is on with no policies: service role only, couples never read it.
--
-- `dedupe_key` makes "first time" and "once a day" events idempotent: a
-- second insert with the same key does nothing. Events that count every
-- occurrence leave it null.
--
-- Counting starts when this runs. Nothing is backfilled: everything before
-- it was the owner's own testing.
create table if not exists events (
  id bigint generated always as identity primary key,
  name text not null check (name ~ '^[a-z_]{3,48}$'),
  wedding_id uuid references weddings(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  listing_kind text check (listing_kind in ('venue', 'vendor')),
  listing_id uuid,
  props jsonb not null default '{}'::jsonb check (pg_column_size(props) <= 1024),
  dedupe_key text unique check (char_length(dedupe_key) <= 200),
  created_at timestamptz not null default now()
);
create index if not exists events_name_created_idx on events (name, created_at desc);
create index if not exists events_wedding_idx on events (wedding_id, name);

alter table events enable row level security;

create or replace function log_event(
  p_name text,
  p_wedding_id uuid default null,
  p_user_id uuid default null,
  p_listing_kind text default null,
  p_listing_id uuid default null,
  p_props jsonb default '{}'::jsonb,
  p_dedupe_key text default null
)
returns void
language sql
set search_path = public
as $$
  insert into events (name, wedding_id, user_id, listing_kind, listing_id, props, dedupe_key)
  values (p_name, p_wedding_id, p_user_id, p_listing_kind, p_listing_id, coalesce(p_props, '{}'::jsonb), p_dedupe_key)
  on conflict (dedupe_key) do nothing;
$$;

revoke execute on function log_event(text, uuid, uuid, text, uuid, jsonb, text) from public, anon, authenticated;
grant execute on function log_event(text, uuid, uuid, text, uuid, jsonb, text) to service_role;

-- Everything /admin/analytics shows, in one call (so no 1,000-row cap).
-- Couples are the weddings created since p_since, test weddings left out,
-- followed through each step. Listing pairs are one wedding and one listing.
create or replace function admin_event_funnels(p_since timestamptz)
returns jsonb
language sql
stable
set search_path = public
as $$
  with cohort as (
    select id, created_at from weddings where not is_test and created_at >= p_since
  ),
  had as (
    select c.id, c.created_at, e.name
    from cohort c join events e on e.wedding_id = c.id
    group by c.id, c.created_at, e.name
  ),
  per_wedding as (
    select
      c.id,
      count(*) filter (where h.name in ('guest_added', 'budget_set', 'checklist_item_completed', 'listing_saved')) as tools,
      bool_or(h.name = 'listing_inquiry_sent') as inquired,
      bool_or(h.name = 'guest_site_published') as site,
      bool_or(h.name = 'rsvp_received') as rsvp
    from cohort c left join had h on h.id = c.id
    group by c.id
  ),
  returned as (
    select distinct c.id
    from cohort c join events e on e.wedding_id = c.id
    where e.name = 'dashboard_visited' and e.created_at >= c.created_at + interval '30 days'
  ),
  real_events as (
    select e.*
    from events e left join weddings w on w.id = e.wedding_id
    where e.created_at >= p_since and (e.wedding_id is null or not w.is_test)
  ),
  pairs as (
    select listing_kind, wedding_id, listing_id, array_agg(distinct name) as names
    from real_events
    where listing_id is not null and wedding_id is not null
    group by listing_kind, wedding_id, listing_id
  )
  select jsonb_build_object(
    'couples', jsonb_build_object(
      'created', (select count(*) from cohort),
      'started', (select count(*) from per_wedding where tools >= 1),
      'activated', (select count(*) from per_wedding where tools >= 3),
      'inquired', (select count(*) from per_wedding where inquired),
      'site', (select count(*) from per_wedding where site),
      'rsvp', (select count(*) from per_wedding where rsvp),
      'eligible_for_return', (select count(*) from cohort where created_at <= now() - interval '30 days'),
      'returned', (select count(*) from returned)
    ),
    'listings', coalesce((
      select jsonb_object_agg(kind, counts) from (
        select listing_kind as kind, jsonb_build_object(
          'viewed', count(*) filter (where 'listing_viewed' = any(names)),
          'saved', count(*) filter (where 'listing_saved' = any(names)),
          'inquired', count(*) filter (where 'listing_inquiry_sent' = any(names)),
          'booked', count(*) filter (where 'listing_booked' = any(names))
        ) as counts
        from pairs group by listing_kind
      ) k
    ), '{}'::jsonb),
    'events', coalesce((
      select jsonb_agg(jsonb_build_object(
        'name', name,
        'count', n,
        'weddings', weddings,
        'last_at', last_at
      ) order by n desc) from (
        select name, count(*) as n, count(distinct wedding_id) as weddings, max(created_at) as last_at
        from real_events group by name
      ) t
    ), '[]'::jsonb)
  );
$$;

revoke execute on function admin_event_funnels(timestamptz) from public, anon, authenticated;
grant execute on function admin_event_funnels(timestamptz) to service_role;
