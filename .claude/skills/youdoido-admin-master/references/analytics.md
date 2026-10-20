# Analytics and KPIs

## Current state (2026-10-20, verify before relying on it)

- No analytics provider. The privacy page promises none
  (`src/app/privacy/page.tsx`, "We don't use analytics or third-party
  advertising trackers"). Adding any provider means updating that page and
  `docs/legal.md` first.
- No event table. Metrics are derived from domain rows: Growth's "feature
  adoption" = a wedding has at least one row in a table
  (`src/app/admin/growth/page.tsx`). No timestamps of use, funnels or cohorts.
- Event-like tables that do exist: `listing_contact_clicks`,
  `vendor_inquiries`, `venue_inquiries`, `assistant_conversations`,
  `site_ai_uses`, `listing_reads`, `feedback_submissions`.
- Test data: `weddings.is_test` (exclude everywhere), `vendors.is_sample`.
- **Row cap:** PostgREST returns at most 1000 rows by default. Unpaged
  `select` calls on Overview, Growth, Revenue, Couples and search silently
  undercount past that. Use `count: "exact", head: true`, a SQL view or an
  RPC for every count.

## Metric definition template

Every metric on an admin page needs, in a tooltip or footnote:
definition, source of truth (table/query), date range, refresh (live on page
load / nightly / weekly script), calculation, completeness caveat, who may see
it. If any of those is unknown, the metric isn't ready to show.

## Core metric catalogue

| Metric | Definition | Source | Notes |
| --- | --- | --- | --- |
| Real couples | `weddings` where `is_test = false` | DB, live | Owner's own weddings must be flagged test |
| New couples (period) | real weddings `created_at` in period | DB | Compare to previous equal period |
| Active couples (30d) | real weddings with any write in 30d | needs `updated_at`/events | Not measurable reliably today |
| Planning activated | real weddings with >= 3 core tools used (budget, guests, checklist, vendors) | DB rows | Proxy until events exist |
| Guest site published | weddings with site published flag | DB | |
| Venues / vendors live | `active = true`, not sample | DB | Split by source: import / claimed / self-listed |
| Claimed listings | approved `*_submissions` per listing | DB | Claim rate = claimed / live |
| Coverage | live listings per state vs `scripts/coverage-plan.mjs` targets | DB + plan | `npm run coverage` reads batch files, not DB |
| Inquiries | real vendor + venue inquiries | DB | Exclude test weddings |
| Contact clicks | `listing_contact_clicks` | DB | Public endpoint, inflatable, treat as soft |
| Reported bookings (GMV) | sum `booked_amount` | DB | Couple-reported, NOT company revenue |
| Company revenue | cash received by You Do, I Do | Stripe / books | None yet: show "no revenue yet", never GMV |
| Infra usage | used / free-tier limit per provider | weekly-review script | |

## Funnels to build toward

Couples: visit -> signup -> wedding created -> planning activated -> guest
site published -> returning in month 2 -> (paid, if ever).
Listings: imported -> enriched -> checked -> contacted -> claimed -> profile
completed -> inquiry received -> paying (Phase 1+).
Visits need a provider; everything from signup on can be server-side events.

## Event naming (when the events table is built)

- snake_case `object_verb` past tense, e.g. `wedding_created`,
  `guest_site_published`, `vendor_inquiry_sent`, `listing_claimed`.
  (Mixpanel's object-verb convention; PostHog's guidance is similar.)
- Fired **server-side** in the server action that does the thing, once, after
  the write succeeds, so there's no double counting.
- Properties: `wedding_id` / `listing_id`, `is_test`, small typed props. No
  names, emails, guest data or free text.
- Keep a list of approved event names in code (one constant file) and
  reject unknown names.
- Version the name (`_v2`) if its meaning changes; never silently redefine.

## Recommended architecture

1. Supabase `events` table (append-only, service-role insert, no anon
   access, 13-month retention) for ~15 business events. Free, private,
   consistent with the privacy page.
2. Cloudflare Web Analytics (free, cookieless) for marketing-page traffic,
   after updating the privacy page.
3. PostHog only once there are outside users and a question events can't
   answer, with billing limits on.
