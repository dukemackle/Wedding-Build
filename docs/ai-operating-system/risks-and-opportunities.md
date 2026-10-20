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
| K4 | Legal register rows say "fixed in branch" for code already on `main` | Migrations 0122 and 0123 are on `main`; R2, R3, R5 rows | The owner may think fixes are live when the migration isn't run, or the reverse | Verified (code); production state unknown | Now | Owner confirms 0121–0123 are run; update the rows | Open |
| O2 | Launch bar for listings is undefined | All 51 meet pass 1; stage targets still far off (`npm run coverage`) | Marketing could wait on a moving target | Verified | Now | Owner decision (`decisions.md`) | Open |
| K5 | Owner's test weddings may count as "real" in briefings | `ADMIN_EMAIL` unset in the Claude Code environment; 4 weddings, 0 flagged test (weekly-review 2026-10-20) | Inflated couple counts, misleading monetization triggers | Likely | Now | Owner sets `ADMIN_EMAIL` in the environment, or flags test weddings in admin | Open |
| K6 | `weekly-review.mjs` failed every run (queried `vendor_inquiries.created_at`, which doesn't exist) | Run on 2026-10-20 | `/weekly-review` had no Supabase numbers | Verified | Now | Use `sent_at` | Done (2026-10-20, this PR) |
