-- The tasks Wren found in a contract, waiting to be looked at.
--
-- Reading now happens when the contract is uploaded rather than when someone
-- presses a button, so the result has to outlive the request that produced
-- it: the couple should open the page later and find the summary and the
-- proposed tasks already there.
--
-- They are NOT checklist items yet, deliberately. These are deadlines with
-- money behind them, read by a model out of a legal document, and a wrong
-- cancellation date the couple never agreed to is worse than no date at all.
-- They become checklist_items only when someone ticks them.
alter table budget_contracts add column if not exists proposed_tasks jsonb;

-- Set when a read finished but Wren wasn't confident about part of it, so the
-- page can say so rather than presenting a guess as a fact.
alter table budget_contracts add column if not exists read_error text;
