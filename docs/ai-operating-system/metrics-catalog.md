# Metrics catalog

What each number means and where the real value comes from. If a metric has
no source, it's reported as "no data", never estimated. Last checked
2026-10-21. Real couples are n=1 (9 accounts, 4 weddings, 3 flagged test).

Sources: **WR** = `node scripts/weekly-review.mjs` (JSON; a missing key shows
up under `unavailable`). **PC** = `node .claude/skills/pricing-check/metrics.mjs`.
**Cov** = `npm run coverage`.

## Couples
| Metric | Definition | Source |
|---|---|---|
| Accounts | Supabase auth users, total and this week | WR `signups.authUsers*` |
| Real weddings | Weddings not flagged test and not owned by `ADMIN_EMAIL` | WR `signups.weddingsReal`, PC `couples.real_weddings` |
| Test weddings | Flagged test or owner-owned | WR `signups.weddingsTest` |
| Real signups by month | Real weddings by created month | PC `couples.real_signups_by_month` |
| Couples who inquired | Real weddings with ≥1 vendor inquiry | PC `couples.real_weddings_with_a_vendor_inquiry` |
| Couple funnel | Real weddings created in a period → started planning → activated (3 of guest/budget/task/save) → inquired → guest site live → first RSVP; plus returned 30+ days after signup | `/admin/analytics`, `admin_event_funnels()` on `events` (0130). Counts from when 0130 ran, no backfill |
| Listing funnel | Wedding × listing pairs: opened → saved → inquired → booked, venues and vendors | `/admin/analytics` |
| First cohort, per couple | Each real couple's days active, last seen, and the day (from signup) each milestone first happened | `/admin/growth` "First cohort", from `events` (0130) |
| Website traffic | Visits, referrers, pages | Cloudflare Web Analytics (once the owner turns it on); Search Console for search |

## Marketplace
| Metric | Definition | Source |
|---|---|---|
| Venues / vendors listed | Active, non-sample rows; added this week; missing geo | WR `venues.*`, `vendors.*`; PC `vendors.*` |
| Coverage | Per-state venues/vendors vs plan targets | Cov |
| Skipped businesses | Researched but left out, by reason | Cov (bottom line) |
| Inquiries | Vendor and venue inquiries from real weddings, week / all time / by status | WR `inquiriesThisWeek`, PC `*_inquiries_real` |
| Contact taps | Phone/website/social taps on listings | `listing_contact_clicks` table, `/admin/leads` |
| Claims | Claimed listings | `/admin/venues`, `/admin/vendors` |
| Listing completeness | % active listings with photo, price tier, capacity, phone/email, verified ≤90 days (2026-10-21: photos 0%, vendor price 0%, venue price 14%, venue capacity 48%) | SELECT counts; not yet on Admin Home |
| Listing reports | "Something wrong with this listing?" + bounces | `/admin/listing-health` |
| Vendor response rate | — | **No data**: replies go straight to the couple (`docs/retention.md`) |

## Operations and cost
| Metric | Definition | Free-tier limit | Source |
|---|---|---|---|
| Supabase DB / storage size | MB | 500 MB / 1 GB | WR (needs `SUPABASE_ACCESS_TOKEN`) |
| Supabase MAU | Monthly active auth users | 50,000 | WR |
| Worker requests / errors | This week, peak day | 100,000 req/day | WR (needs `CLOUDFLARE_API_TOKEN` + account ID) |
| Emails sent / bounced | This week | 100/day, 3,000/mo | WR (needs full-access `RESEND_API_KEY`) |
| App errors | Server errors logged | — | `app_errors`, `/admin/errors` |
| Spend and renewals | Hand-entered services, renewal dates | — | `/admin/spend` (`ops_services`) |
| Queues | New feedback, contact messages, pending guest posts | — | WR `queues` |
| Anthropic / Twilio spend | — | — | **No data**: check their dashboards by hand |

## Revenue
$0 by design (not monetized). Referral lookup on `/admin/revenue`. Phase
triggers in `docs/monetization.md`, checked by the `pricing-check` skill.

## Website
Traffic, sources, search rankings, conversion: **no data** until analytics
and Search Console are connected (`integrations.md`).
