# Integrations

What the AI team can read, what's missing, and the plan. Never paste keys
into a chat or commit them. Keys go in the Cloudflare dashboard (Workers →
wedding-build → Settings → Variables and Secrets), the Claude Code environment
settings, or `.env.local` (gitignored). Checked 2026-10-20.

## Connected now
| Integration | What it gives | Access | Notes |
|---|---|---|---|
| GitHub (Claude GitHub app, MCP) | PRs, CI checks, commits | Repo-scoped | Working |
| Supabase (service role + access token in the Claude Code environment) | Admin counts, DB size via `weekly-review.mjs` | **Full** (service role) | Works, but more access than a briefing needs; see plan item 4 |
| Gmail, Google Drive (claude.ai connectors) | Inbox, backups folder | Owner's account | Available in sessions; use read-only unless asked |
| Cloudflare Workers observability | Worker logs in the dashboard | — | On (`wrangler.jsonc`); nothing reads it automatically |
| Cloudflare Web Analytics | Page views, referrers, country; no cookies | Dashboard only | On through the dashboard's automatic setup since about 2026-09-30, so it isn't in the code: Cloudflare injects `static.cloudflareinsights.com/beacon.min.js` into pages (seen 2026-10-21). Disclosed in the Privacy Policy. Nothing reads it automatically; see item 5 |
| First-party usage events | Funnels and the First cohort table | `events` table (0130, PR #956) | /admin/analytics, /admin/growth; disclosed in the Privacy Policy |

## Not available in this environment
- `CLOUDFLARE_API_TOKEN` / account ID: Worker request and error counts in
  `weekly-review` show as unavailable.
- `RESEND_API_KEY` (full access): email volume and bounces unavailable.

## Missing, in priority order
| # | Integration | Business value | Data / scope | Privacy and security risk | Effort | Approval | How to verify |
|---|---|---|---|---|---|---|---|
| 1 | ~~Cloudflare Web Analytics~~ | Done: connected, see above | | | | | |
| 2 | **Google Search Console** | Which searches find listings, indexing errors, sitemap health | Query and page stats for youdoido.com | Low; read-only | S: verify the domain via DNS TXT in Cloudflare | Yes | Sitemap shows "Success"; data appears in 2–3 days |
| 3 | **Error alerting** (Workers Logs alerts, or Sentry free tier) | Know when couples hit errors before they leave | Error messages, stack traces, URLs | Medium: traces can carry user data. Scrub PII; Sentry is a new sub-processor for the Privacy Policy | S–M | Yes | Throw a test error; an alert arrives |
| 4 | **Read-only metrics access** for briefings (a Postgres role limited to counts, or a Cloudflare token scoped to Analytics: Read) | Briefings without full service-role or account-wide power | Aggregate counts only | Reduces risk compared to today | M | Yes | `weekly-review.mjs` runs with the new key; writes fail |
| 5 | **Cloudflare API token, Analytics Read only** in the Claude Code environment | Worker requests and errors in briefings | Account analytics | Low | S | Yes | `weekly-review` no longer lists Cloudflare under `unavailable` |

## Deliberately not now
- **CRM:** the admin panel is the CRM at this stage; revisit with real vendors.
- **Financial systems** (Stripe, QuickBooks): nothing to read until
  monetization or an entity and bank account exist.
- **Support desk:** hello@youdoido.com and `/admin/feedback` are enough
  before launch.
