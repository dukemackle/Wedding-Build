# Operations automation and engineering standards

## What runs today (2026-10-20)

No Cloudflare cron triggers (`wrangler.jsonc`). Background work runs as
Claude scheduled routines on the owner's account:
- "Venue & vendor batches": `npm run import:batches` -> `/api/batch-sync`.
- "Weekly backup": `npm run backup` (encrypted) to Drive + private repo.
- `/data-refresh` cadences, `/weekly-review` on request.
No error tracking (Sentry etc.), no error-log table, no health check, no
tests, no CI beyond the Cloudflare build. Workers observability is on.

## Automation candidates

For each: trigger, data, benefit, cost, security, failure behaviour, approval.

| Automation | Trigger | Data | Benefit | Cost | Failure | Approval |
| --- | --- | --- | --- | --- | --- | --- |
| Daily digest (needs-action + KPIs) | Daily routine or Worker cron | DB counts | 30-second morning check | Free (Resend 1/day) | Email "digest failed" or skip; never partial numbers | A, owner opts in to email |
| Import run log | Each import run | batch-sync results | See failures without reading logs | Free | Row records error | A |
| Renewal reminders | Daily | `ops_deadlines` | No surprise renewals | Free | Shows on Home regardless | A |
| Free-tier alerts at 70/90% | Daily | weekly-review sources | Avoid surprise bills/outages | Free | "not pulled" flagged | A |
| Listing staleness queue | Weekly | `last_verified_at` | Accuracy | Free | Queue just grows | A (fixes are C) |
| Error summary | Daily | error-log table / Workers logs | Catch breakage before couples do | Free | Silent = alert | A |
| Feedback themes | Weekly | feedback, chat | Hear users | Haiku cents | Skip week | A |
| Vendor follow-up reminders | Daily | `admin_tasks` | Outreach doesn't slip | Free | Shows on Home | A (sending is D) |

Anything that emails someone other than the owner, edits listings, or
spends money is level C/D in security.md.

## Engineering standards for admin work

1. Short plan: files, tables, migrations, what's reused.
2. `requireAdmin()` on every new page, action and route; service-role only
   server-side; select only needed columns; counts via `count`/RPC, never by
   loading rows (1000-row cap).
3. Migrations additive and reversible; check the next free number (there are
   duplicate numbers already -- don't add more). RLS on every new table.
4. Exclude `is_test` weddings and `is_sample` listings from every metric.
5. Verify numbers against a known example (e.g. a hand count in SQL) before
   showing them.
6. Test: `npm run lint`, `npx tsc --noEmit`; render at 375px and ~1440px for
   UI (design-expert). There's no test framework yet; when calculations
   grow (finance, scores), add a small unit-test setup for those first.
7. Ship via `/ship`. Production deploys from `main`; merging is the owner's.
