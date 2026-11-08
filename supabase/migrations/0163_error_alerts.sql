-- log_app_error() now says whether the error is new today, so the app can
-- email the admins the first time each distinct error appears
-- (src/lib/error-log.ts). Repeats only bump the count, as before. The return
-- type changes, so the function is dropped and recreated; code deployed
-- before this runs ignores the result and sends no alerts.
drop function if exists log_app_error(text, text, text, text);

create function log_app_error(p_area text, p_source text, p_message text, p_digest text default null)
returns boolean
language plpgsql
set search_path = public
as $$
declare
  v_new boolean;
begin
  insert into app_errors (area, source, message, digest)
  values (left(p_area, 32), left(p_source, 200), left(p_message, 500), left(p_digest, 64))
  on conflict (day, area, source, message)
  do update set count = app_errors.count + 1, last_at = now(), digest = coalesce(excluded.digest, app_errors.digest)
  returning (xmax = 0) into v_new;
  return v_new;
end;
$$;

revoke execute on function log_app_error(text, text, text, text) from public, anon, authenticated;
grant execute on function log_app_error(text, text, text, text) to service_role;
