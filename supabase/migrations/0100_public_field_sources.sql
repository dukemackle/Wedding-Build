-- Listing pages show which facts the venue confirmed itself, so signed-out
-- visitors need to read field_sources too. It holds only source labels and
-- dates ({"capacity": {"by": "venue", "at": "2026-10-05"}}), nothing private.
-- Anon reads venues and vendors column by column since 0091.
grant select (field_sources) on venues to anon;
grant select (field_sources) on vendors to anon;
