-- A plus-one's own meal choice.
--
-- Until now only the invited guest picked a meal, so the meal tally the
-- couple hands their caterer was short one plate per plus-one ("Plus-ones: 6"
-- with no idea what they eat). Asked on the household RSVP form next to the
-- plus-one's name, and editable on the guest list. Null = not chosen yet.
alter table guests add column if not exists plus_one_meal text;
