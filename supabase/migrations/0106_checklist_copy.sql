-- Checklist copy pass on rows seeded from src/lib/checklist-template.ts:
-- drops the "parents have opinions" line (some couples value their parents'
-- input, and some parents are doing the planning) and moves British spellings
-- and words to US ones. Only rows still carrying the original wording are
-- touched, so a couple's own edits are left alone.
update checklist_items set notes = 'Big or small, formal or relaxed, near or far. Worth getting on the same page early — it shapes every choice after this.'
where notes = 'Big or small, formal or relaxed, near or far. Worth saying out loud before anyone''s parents have opinions.';

update checklist_items set notes = 'Whoever signs the license. If it''s a friend, check what your state requires of them.'
where notes = 'Whoever signs the licence. If it''s a friend, check what your state requires of them.';

update checklist_items set title = 'Settle your colors and overall look'
where title = 'Settle your colours and overall look';

update checklist_items set notes = 'Book the tasting when you inquire; the good bakeries schedule those out too.'
where notes = 'Book the tasting when you enquire; the good bakeries schedule those out too.';

update checklist_items set title = 'Apply for your marriage license'
where title = 'Apply for your marriage licence';

update checklist_items set title = 'Put tips and final payments in labeled envelopes'
where title = 'Put tips and final payments in labelled envelopes';

update checklist_items set notes = 'Safety pins, stain remover, painkillers, bandages, a phone charger, flat shoes.'
where notes = 'Safety pins, stain remover, painkillers, plasters, a phone charger, flat shoes.';

update checklist_items set notes = 'Suits, linens, anything rented. Usually due within a couple of days.'
where notes = 'Suits, linens, anything hired. Usually due within a couple of days.';

update checklist_items set notes = 'Social security first, then driver''s license, then passport and banks.'
where notes = 'Social security first, then licence, then passport and banks.';
