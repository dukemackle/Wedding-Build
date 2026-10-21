# Risks and opportunities

Non-legal risks and the biggest opportunities. Legal, privacy and liability
risks live in the register in `docs/legal-audit.md` §12. Retention-specific
items live in `docs/retention.md`. This file points to them and doesn't copy
them. Status values: Open, In progress, Done (date, PR), Accepted (reason).

| ID | Item | Evidence | Impact | Confidence | Priority | Action | Status |
|---|---|---|---|---|---|---|---|
| O1 | No scheduled email to couples (payment due dates, checklist nudges) | No cron in `wrangler.jsonc`; `docs/retention.md` open item 3; Zola sends payment reminders (`docs/competitors.md`) | Couples have no reason to come back between sessions | Verified | Next | One Cloudflare cron trigger for payment-due and checklist reminders, with an unsubscribe | Open |
| K1 | No product analytics or error alerting | No analytics code in `src/`; Workers observability on but unwatched | Can't see where couples drop off or when the app breaks; briefings can't report traffic | Verified | Now (before launch) | `integrations.md` items 1–3 | Open |
| K2 | No automated tests | `package.json` has only `lint` | Regressions in budget, RSVP or guest-site code reach production unnoticed | Verified | Later (add with the next risky change) | Smallest useful tests on money and RSVP logic | Open |
| K3 | Briefing metrics use the Supabase service-role key | `scripts/weekly-review.mjs` header | A leaked environment means full database access | Verified | Next | `integrations.md` item 4 | Open |
| K4 | Legal register rows say "fixed in branch" for code already on `main` | Migrations 0122 and 0123 are on `main`; R2, R3, R5 rows | The owner may think fixes are live when the migration isn't run, or the reverse | Verified | Now | Owner ran 0123; rows marked Fixed | Done (2026-10-21) |
| O2 | Launch bar for listings is undefined | All 51 meet pass 1; stage targets still far off (`npm run coverage`) | Marketing could wait on a moving target | Verified | Now | Owner decision (`decisions.md`) | Open |
| K5 | Owner's test weddings may count as "real" in briefings | `ADMIN_EMAIL` unset in the Claude Code environment; 4 weddings, 0 flagged test (weekly-review 2026-10-20) | Inflated couple counts, misleading monetization triggers | Likely | Now | Owner sets `ADMIN_EMAIL` in the environment, or flags test weddings in admin | Done (2026-10-21, owner); recheck counts in the next briefing |
| K6 | `weekly-review.mjs` failed every run (queried `vendor_inquiries.created_at`, which doesn't exist) | Run on 2026-10-20 | `/weekly-review` had no Supabase numbers | Verified | Now | Use `sent_at` | Done (2026-10-20, this PR) |
| K7 | No listing has a photo; no vendor has a price; venues 14% price tier, 48% capacity | SELECT counts 2026-10-21 (19,816 active rows); no scraped photos by policy (`docs/legal-audit.md:360`) | Text-only directory loses side-by-side comparison to The Knot / Wedding Spot | Verified | Next | Photos via claims; agent-researched capacity/price in launch metros | Open |
| K8 | Public browse pages and sitemap uncached; `/venues` and `/vendors` send every active row | `src/app/venues/page.tsx:20-41`, `src/app/sitemap.ts:8` (`force-dynamic`) | Likeliest next 1102 / slow phone load once traffic or crawlers arrive | Verified (code), CPU unmeasured | Now (before launch) | Cache pages + sitemap; slim map/list columns; skip auth refresh without a cookie | Open |
| K9 | Anthropic spend uncapped and unlogged | `docs/admin-blueprint.md` §3; metrics catalog "no data" | Only usage-driven surprise bill | Verified | Next | Daily caps + token log + Home card | Open |
| K10 | Admin Home bounce item counts all-time rows, never clears | `src/app/admin/page.tsx` (finance-ops 2026-10-21) | Queue never reads "nothing needs you" | Likely | Next | Time-window it | Open |
| K11 | Two migrations numbered 0129; no applied-migration record | `supabase/migrations/0129_*` | Owner loses track of what's run (cause of K4) | Verified | Later | Reserve numbers per branch or adopt `supabase db push` | Open |
| K12 | 46 skipped-batch rows have shifted columns (44 Colorado, 1 FL, 1 NC) | awk column check 2026-10-21 | Garbles coverage skip breakdown | Verified | Later | Fix rows in a batch-only PR | Open |
| K13 | No outside business has a verified claim; the one real vendor submission (2026-10-06) was rejected | SELECT 2026-10-21 | No proof yet that the claim flow converts | Verified | Next | Review why it was rejected; claim-and-improve offer | Open |
| O3 | Existing scheduler: GitHub Actions daily → `/api/spend-reminders` | `.github/workflows/spend-reminders.yml` | Reminders and error digest can reuse it; no Cloudflare cron needed | Verified | Next | Reuse for O1 | Open |
