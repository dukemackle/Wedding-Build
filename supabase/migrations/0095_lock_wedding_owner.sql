-- Stops someone with edit access taking a wedding over.
--
-- weddings_member_update (0094) lets an editor update the row, and its WITH
-- CHECK passes once user_id is the editor's own id -- so an editor calling
-- Supabase directly could set user_id to themselves, leaving the real owner
-- neither owner nor member and locked out. RLS can't compare old and new
-- values, so this trigger guards the columns that decide who's on a wedding:
--
--   user_id           -- only the current owner may change it
--   member_ids        -- only the wedding_members sync trigger may change it
--   partner_user_id,  -- legacy (0055), unused since 0093; frozen
--   invite_token
--
-- Service-role writes (the invite accept path, admin tools, the SQL editor)
-- carry no auth.uid() and pass through.

create or replace function guard_wedding_ownership()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new;
  end if;

  if new.user_id is distinct from old.user_id and auth.uid() is distinct from old.user_id then
    raise exception 'Only the wedding owner can change who owns it.' using errcode = '42501';
  end if;

  -- pg_trigger_depth() > 1 means this update came from sync_wedding_member_ids
  -- (an owner adding or removing someone), not straight from a client.
  if pg_trigger_depth() = 1 and (
       new.member_ids is distinct from old.member_ids
    or new.partner_user_id is distinct from old.partner_user_id
    or new.invite_token is distinct from old.invite_token
  ) then
    raise exception 'Who is on a wedding changes through invites, not directly.' using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists weddings_guard_ownership on weddings;
create trigger weddings_guard_ownership
  before update on weddings
  for each row execute function guard_wedding_ownership();
