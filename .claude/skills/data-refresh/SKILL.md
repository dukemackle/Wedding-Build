---
name: data-refresh
description: Keep every piece of You Do, I Do's data current on a schedule — cost-estimator numbers, venue and vendor listings, attire links, AI model IDs, infra pricing, competitor notes, legal pages. Use when the owner runs /data-refresh [daily|weekly|monthly|quarterly|semiannual|yearly|due], asks "is our data up to date?", or a scheduled routine fires it.
---

# /data-refresh

Different data goes stale at different speeds. This is the calendar for all of
it, and the steps for each run. The argument is the cadence to run. With no
argument, or `due`, run every cadence whose window has come up (see the log
at the end). Higher cadences don't include lower ones: the routines run each
cadence on its own schedule.

Ground rules for every run:
- **Sessions have no database key.** Anything that writes to the live tables
  produces a file or a list of clicks for the owner, or goes through an
  route that already exists for that (`npm run import:batches`). Never invent
  numbers, photos or prices; leave a gap and list it instead.
- **Code and doc changes go in one PR per run**, not one per item, and go to
  the owner for the merge like any other change. Batch-file-only PRs still
  merge themselves (CLAUDE.md).
- **Report in a few lines**: what changed, what the owner needs to click, and
  what's due next. The file goes in the scratchpad and is sent to the owner.

## The calendar

| Cadence | What | How |
|---|---|---|
| Daily | Merged venue/vendor batches go live, pins move to street addresses | Already done hourly by the "Venue & vendor batches" routine. Only check it's still succeeding (`list_triggers`, `last_run`). |
| Weekly | Signups, listings, infra usage vs free tiers | `/weekly-review` |
| Monthly | Listing contacts, websites, closures, duplicates | `/data-audit` (matches `REVIEW_INTERVAL_DAYS` = 30 in `src/lib/listing-freshness.ts`) |
| Monthly | Attire catalog links and prices | §Monthly below |
| Monthly | Cost estimator from real couples' quotes | §Monthly below |
| Monthly | Security updates in dependencies | §Monthly below |
| Quarterly | Listing price tiers | §Quarterly |
| Quarterly | AI model IDs in `src/lib/ai/` | §Quarterly |
| Quarterly | Supabase / Cloudflare / Resend / Anthropic pricing and free-tier limits | §Quarterly |
| Quarterly | Whether to move pricing phases | `/pricing-check` |
| Twice a year | Listing descriptions and photos | §Semiannual |
| Twice a year | `docs/competitors.md` | §Semiannual |
| Twice a year | Checklist template, suggested vendor/venue questions | §Semiannual |
| Yearly (Mar) | Cost estimator base numbers, all states and categories | §Yearly |
| Yearly (Mar) | Region, season and style multipliers | §Yearly |
| Yearly | Venue capacity, amenities, setting | §Yearly |
| Yearly | Terms, privacy, `docs/legal.md` | §Yearly |

March for the cost data because the big annual cost studies (The Knot Real
Weddings Study, Zola's First Look report) come out in Feb–Mar.

## Monthly

1. Run `/data-audit` and follow it to the end (report + fixes file).
2. **Attire links.** Ask the owner for an export of `attire_items` with a
   `retailer_url` (or skip if they decline). HEAD each URL; list the dead ones
   and any whose page shows a different price than `buy_price`/`rent_price`.
   Report only; the owner edits them.
3. **Customer-quote recompute.** Tell the owner to press "Recompute from
   customer quotes" on /admin/cost-data. It only overwrites a cell with ≥5
   real (non-test) quotes, so it's safe to press every month and a no-op until
   real couples exist. Skip saying so while there are no outside users.
4. **Dependencies.** `npm ci && npm audit --omit=dev`. Patch-level fixes for
   high/critical advisories go in this run's PR after `npm run lint` and
   `npx tsc --noEmit` pass. A major-version bump (Next, React, Supabase) is
   its own PR for the owner, with the changelog's breaking changes listed.

## Quarterly

1. **Price tiers.** Pick ~30 listings, weighted to the metros with the most
   rows (`npm run coverage`), and check each one's tier against its own
   website's current pricing. Wrong tiers on batch rows not yet imported are
   fixed in the batch file; imported rows are listed for the owner to change
   on /admin.
2. **AI models.** List every `MODEL` constant in `src/lib/ai/`. Load the
   `claude-api` skill and check each against current model IDs and
   deprecation dates. A retiring model gets swapped for its named successor
   in this run's PR; a newer model that's merely available is a suggestion,
   not a change (cost differs, the owner decides).
3. **Infra pricing.** WebSearch the current free-tier limits and paid prices
   for Supabase, Cloudflare Workers, Resend and the Anthropic API. Where they
   differ from what `docs/monetization.md` or `scripts/weekly-review.mjs`
   assume, update those in the PR and flag the change in the report.
4. Run `/pricing-check`.

## Semiannual

1. **Descriptions and photos.** From the `/data-audit` CSVs, list listings
   with no photos, one photo, or a description under ~40 words, grouped by
   metro. Filling them is a research batch from each business's own site
   (same rules as `/add-venues` / `/add-vendors`), not invention.
2. **Competitors.** Re-check The Knot, Zola, Joy and the others in
   `docs/competitors.md`: new features, pricing, shutdowns. Update the file
   and its "researched" date. Don't re-propose anything it marks parked or
   shipped.
3. **Planning content.** Re-read `src/lib/checklist-template.ts` and the
   suggested questions in `src/lib/wedding-options.ts` against current
   wedding-planning advice (lead times, booking windows, new norms). Copy
   edits ship in the PR; anything that changes what couples see structurally
   goes to the owner first.

## Yearly

1. **Cost estimator numbers.** For each category in `BUDGET_CATEGORIES`
   (`src/lib/budget-categories.ts`), research Simple / Classic / Luxury
   costs per state from that year's cost studies, BLS regional price data,
   and state-level reports. Per-guest categories are per-guest amounts.
   Write one CSV per category to the scratchpad in the import format:

   ```
   State,Simple ($),Classic ($),Luxury ($),Source,Notes
   Texas,4200,9800,24000,The Knot Real Weddings Study 2027; ...,
   ```

   `State` is the full state name as in `STATES`. Every row needs a real
   `Source`; a state with no source of its own uses its region's figure with
   `Notes: "regional estimate"`, never a made-up number. Send the CSVs; the
   owner uploads each on /admin/cost-data under its category. Before
   uploading, compare against the current rows there and call out any cell
   that moved more than ~25%.
2. **Multipliers.** Re-derive `REGION_MULTIPLIERS`, `SEASON_MULTIPLIERS` and
   `STYLE_TIER_MULTIPLIERS` in `src/lib/budget-categories.ts` from the same
   sources (they still drive every cell without sourced data). Ship in the
   PR with the source in a comment.
3. **Capacity and amenities.** Same sample approach as price tiers: check
   capacity, setting and amenities against the venue's own site.
4. **Legal.** Read `docs/legal.md` and check for new US state privacy laws or
   changes to CAN-SPAM/TCPA that touch what the app collects. Flag; don't
   rewrite the terms or privacy page without the owner.
5. **Coverage plan.** Re-check the targets in `scripts/coverage-plan.mjs`
   against how many listings each metro actually has; suggest changes.

## Log

Append one line per run here, newest last, in the run's PR (or tell the
owner the line when the run had no PR). `due` reads it to decide what's up.

| Date | Cadence | Result |
|---|---|---|
