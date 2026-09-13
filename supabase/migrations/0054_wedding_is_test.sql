-- Lets the owner mark their own testing (or any other non-real wedding)
-- so admin metrics (growth signups, feature adoption, vendor inquiry
-- counts) can exclude it and reflect real usage only.
alter table weddings add column if not exists is_test boolean not null default false;
