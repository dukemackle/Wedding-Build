-- Replaces the wedding-setup form's broad "Region" question (Northeast,
-- Southeast, Midwest, etc.) with a plain "State" question -- fewer/
-- smaller options, and lines up with the cost estimator, which already
-- asks for state, not region. `region` stays on the table and keeps
-- driving the budget-multiplier math unchanged; it's now derived
-- automatically from the chosen state (see saveWedding) instead of
-- asked as its own question.
alter table weddings add column if not exists state text;
