-- Remove the placeholder venues seeded by migrations 0004/0006/0007/0017 and
-- flagged `is_sample` in 0060. They were only ever deactivated, so they still
-- filled the admin list (1,389 of 1,413 rows) and buried the real imports.
--
-- Everything that points at a venue either cascades (shortlists, FAQs, claim
-- links, submissions, preferred vendors, spaces) or is set null (a wedding's
-- booked venue, budget lines, inquiries), so this is safe to run as-is.
-- Real venues are imported with is_sample = false and are untouched.

delete from venues where is_sample = true;
