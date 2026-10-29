-- Cocktail hour no longer gets its own layout tab: guests stand and wander,
-- the venue sets out the bar and high-tops, and a tab there read as one more
-- seating chart to fill in. New weddings start with Ceremony and Reception;
-- a couple who does want it drawn adds it with "+ Add event".
--
-- Existing cocktail phases go, and their tables and items with them
-- (phase_id cascades). Checked before writing: only the owner's test wedding
-- had anything there, with no guests seated, and they asked for it deleted.
-- 'cocktail' stays allowed in the kind check so old rows never fail it.
create or replace function create_default_layout_phases()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into layout_phases (wedding_id, user_id, kind, name, sort_order)
  values
    (new.id, new.user_id, 'ceremony', 'Ceremony', 0),
    (new.id, new.user_id, 'reception', 'Reception', 2)
  on conflict do nothing;
  return new;
end;
$$;

delete from layout_phases where kind = 'cocktail';
