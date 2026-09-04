-- Lets the couple record who paid for a given budget item (bride's
-- parents, groom's parents, the couple themselves, etc.), since it's
-- common for costs to be split across family members. Free text rather
-- than a fixed list, since every family's arrangement is different.
alter table budget_line_items add column if not exists paid_by text;
alter table budget_custom_items add column if not exists paid_by text;
