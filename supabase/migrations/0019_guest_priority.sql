-- Guest priority tiers: lets a couple flag each guest as "must invite",
-- "would like to invite", or "if there's room" so they can trim the list
-- down to what their venue's capacity actually allows without deleting
-- anyone outright.
alter table guests add column if not exists priority text not null default 'must_invite'
  check (priority in ('must_invite', 'would_like', 'if_room'));
