-- Contracts that aren't tied to a budget line, and what Wren read in them.
--
-- `budget_contracts` already holds the file, the private `contracts` bucket
-- and the RLS that scopes both to a wedding (see 0065). The only thing
-- stopping a contract uploaded from the Checklist page reusing all of it was
-- the one-target check, which insisted every row point at either a category
-- or a custom item. A contract can now point at neither -- a venue contract
-- is worth keeping and reading whether or not the couple has made a budget
-- line for it yet -- while still never pointing at both.
alter table budget_contracts drop constraint if exists budget_contracts_one_target;
alter table budget_contracts add constraint budget_contracts_one_target check (
  category is null or custom_item_id is null
);

-- Wren's read of the contract, kept so it isn't regenerated on every view.
-- Null means nobody has asked for a summary yet, which is the default: a
-- contract is stored because the couple wanted it stored, and sending it to
-- a model is a separate, deliberate act.
alter table budget_contracts add column if not exists summary text;
alter table budget_contracts add column if not exists summarised_at timestamptz;
