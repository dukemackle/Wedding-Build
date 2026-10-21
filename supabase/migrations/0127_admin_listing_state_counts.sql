-- Live listings per state, for the Coverage panel on the admin Home page.
-- Counted in the database so the page reads 51 rows rather than paging every
-- venue and vendor into the Worker. Same filters as the public directories:
-- active venues; active vendors that aren't samples. Service role only.
create or replace function admin_listing_state_counts()
returns table (state text, venues bigint, vendors bigint)
language sql
stable
set search_path = public
as $$
  with v as (
    select state, count(*) as n from venues where active and state is not null group by state
  ), d as (
    select state, count(*) as n from vendors where active and not is_sample and state is not null group by state
  )
  select coalesce(v.state, d.state), coalesce(v.n, 0), coalesce(d.n, 0)
  from v full join d on d.state = v.state;
$$;

revoke execute on function admin_listing_state_counts() from public, anon, authenticated;
grant execute on function admin_listing_state_counts() to service_role;
