-- Fixes "new row violates row-level security policy for table weddings" on a
-- brand-new account's first Save.
--
-- The dashboard creates the wedding with an upsert (INSERT ... ON CONFLICT DO
-- UPDATE). Postgres checks that statement's new row against the SELECT and
-- UPDATE policies as well as INSERT. 0093 rewrote those two as
-- is_wedding_member(id) / can_edit_wedding(id), which look the row up in
-- weddings by id -- and a row that hasn't been inserted yet isn't there, so
-- both come back false. Accounts that already had a wedding never hit it.
--
-- Checking the row's own user_id first, inline, passes for the owner without
-- a lookup; the helpers still cover invited members.

drop policy if exists "weddings_member_select" on weddings;
create policy "weddings_member_select" on weddings
  for select
  using (user_id = auth.uid() or is_wedding_member(id));

drop policy if exists "weddings_member_update" on weddings;
create policy "weddings_member_update" on weddings
  for update
  using (user_id = auth.uid() or can_edit_wedding(id))
  with check (user_id = auth.uid() or can_edit_wedding(id));
