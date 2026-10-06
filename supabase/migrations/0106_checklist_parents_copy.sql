-- Softens a seeded checklist note: some couples value their parents' input,
-- and some parents are doing the planning. Only rows still carrying the
-- original wording are touched, so a couple's own edits are left alone.
update checklist_items
set notes = 'Big or small, formal or relaxed, near or far. Worth getting on the same page early — it shapes every choice after this.'
where notes = 'Big or small, formal or relaxed, near or far. Worth saying out loud before anyone''s parents have opinions.';
