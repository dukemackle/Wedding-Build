-- Remove the placeholder vendors seeded by migrations 0005/0010/0011/0018 and
-- flagged `is_sample` in 0062 ("Birmingham Florals", hello@...example), the
-- vendor twin of 0086. Real vendors now come from src/lib/vendor-batches.ts
-- with is_sample = false and are untouched.
--
-- Everything that points at a vendor either cascades (favourites, FAQs,
-- contact log, claims) or is set null (bookings, budget lines, attire,
-- venue preferred-vendor links). Inquiries key on vendor_name, so a couple's
-- sent inquiry keeps its text.

delete from vendors where is_sample = true;
