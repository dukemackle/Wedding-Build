# You Do, I Do: admin audit and command center blueprint

Written 2026-10-20 by the `youdoido-admin-master` skill. This is the baseline
for all admin work: read it before proposing admin changes, and update the
**Roadmap status** column when something ships or is rejected.

It is built from reading the code: pages, actions, migrations, scripts and
skills. Product research comes from vendors' public docs and pricing pages
(none of the products were logged into). No live database was queried, so the
audit contains no counts of real users, listings or money. Marks used below:

- **[V]** verified in code, with file references.
- **[R]** a research fact from a public source, checked 2026-10-20.
- **[A]** an assumption.
- **[P]** a proposal.

---

## 1. Executive summary

The admin is more capable than its home page suggests. Listing management,
the claim queues, couple records, listing health and a read-only AI analyst
(Ask Wren) are all real and well guarded. What's missing is the layer that
runs the company:

- a home page that says what needs attention;
- trustworthy counts that keep working past 1,000 rows;
- any record of company money (costs, renewals) or of what admins did;
- product analytics beyond "has this couple got rows in this table".

The biggest risks are not exotic:

- admin pages didn't all check admin access (fixed in this branch);
- there is no MFA on an account that can read every couple's data;
- several numbers will undercount without warning as the app grows;
- one couple-facing AI feature has no spending cap.

**Recommendation:** spend the next few sessions on a "trustworthy core":

- security hardening;
- correct counts;
- a Home page that says what needs attention;
- a small Operations area for services, renewals and decisions.

Finance integrations and product analytics wait for their triggers (first
revenue, first outside users). They are designed now so they're cheap to add
later.

---

## 2. Current capabilities [V]

**Stack**
- Next.js 16 (App Router, `src/proxy.ts`) on Cloudflare Workers via OpenNext.
- Supabase: Postgres, Auth and Storage. 61 tables, 132 migrations, RLS on
  every table.
- Resend for email (sending, inbound mail to `inbox_messages`, and the bounce
  webhook).
- Twilio for SMS.
- Anthropic for the AI features.
- Leaflet with OSM maps, and the Census geocoder.

**Admin hosting**
- Served only on admin.youdoido.com (`src/proxy.ts:67-84`).
- Sidebar navigation is in `src/app/admin/admin-nav.tsx`. Notifications,
  Finance and Analytics appear there as "soon" placeholders.

**Admin pages**

| Area | State | Notes |
|---|---|---|
| Overview `/admin` | Thin | 7 stat tiles, no trends, no action queue |
| Venues, Vendors | Strong | URL filters, bulk actions, CSV export, batch import, data-audit apply, claim links, FAQs, contact log (vendors) |
| Venue and vendor claims | Complete | Approve or reject, emails the business |
| Couples, couple detail | Complete | Test flag, tags, notes, bulk email, CSV; detail page reads about 16 tables |
| Listing health | Complete | Listing reports plus email bounces |
| Unlisted bookings, Buy & sell, Photo wall, Attire, Cost data | Complete | Moderation and catalogue tools |
| Feedback | Complete | Includes AI "chat themes" |
| Growth | Partial | Signups by month, feature adoption (rows per table), at-risk couples, a static free-tier panel |
| Revenue | Misleading | Sums couple-reported `booked_amount`, which is GMV, not income |
| Ask Wren | Good base | Haiku, read-only allowlisted query tool, 50 questions a day, logged |
| Search | Good | Pages, couples, listings, claims, feedback |

**Data provenance**
- Each listing records its source: `source`, `source_id`, a per-field
  `field_sources`, `last_verified_at` and `address_checked_at` (migrations
  `0075`, `0099`).
- Claims and self-listings each go through their own approval queue.

**Operations**
- Encrypted weekly backups. The restore drill passed on 2026-10-09.
- Venue and vendor batches import through a routine (see `CLAUDE.md`).
- Skills already in place: `/weekly-review`, `/pricing-check`, `/data-audit`,
  `/data-refresh`.

## 3. Weaknesses and technical debt [V]

1. **Admin pages relied on the layout's admin check.**
   - 13 pages read every couple's data through the service-role client
     without calling `requireAdmin()`, against the rule in
     `src/lib/admin.ts:48`.
   - **Fixed in this branch:** each page now checks.
2. **No MFA, single role, no audit log of admin actions.**
   - Nothing records who approved a claim, bulk-deleted listings, emailed
     couples or changed a test flag.
   - Admin emails are committed in `wrangler.jsonc`.
3. **Counts break past 1,000 rows.**
   - Overview, Growth, Revenue, Couples and Search load whole tables with
     unpaged `select` calls. Supabase returns at most 1,000 rows by default.
   - Example: `growth/page.tsx:97-110` loads every `budget_line_items` row.
     About 20 real couples' budgets would pass 1,000 rows, and from then on
     adoption figures quietly undercount.
   - `listUsers` is capped at 1,000 per page in the same way.
4. **"Revenue" is GMV.** `/admin/revenue` totals what couples say they paid
   vendors. There is no company income, expense or renewal data anywhere.
5. **No product analytics.**
   - There are no events. Adoption is measured as "has rows", with no
     funnels, retention or active users.
   - The privacy page promises no analytics trackers, so any provider needs
     a policy update first.
6. **Uncapped AI cost.** Each contract upload runs a stronger model
   (`src/app/budget/contract-actions.ts:100`, `src/lib/ai/contract-reader.ts`)
   with no daily cap. A looping user could run up the Anthropic bill. Thank-you
   drafts are uncapped too.
7. **No monitoring.** No error tracking, error log, health check, tests or CI.
   Breakage is found by a person.
8. **Security headers missing.** No CSP, HSTS, frame-ancestors or
   Referrer-Policy. Public inserts (contact-click, RSVP, reports) have no
   rate limits.
9. **Smaller items:**
   - Bulk couple email has no cap and no consent check, and its `replyTo`
     breaks when `ADMIN_EMAIL` lists more than one address
     (`couples/actions.ts:52`).
   - The Ask Wren daily cap fails open.
   - `batch-sync` inserts accept any column.
   - 9 duplicate migration numbers.
   - `.env.example` is missing about 6 variables.
   - `StatTile` is duplicated, and there is no chart component.
   - The referral lookup sends every wedding to the browser.

## 4. Missing features

- An action-first home page.
- Spend and renewals tracking.
- An admin audit log.
- MFA.
- An events table and funnels.
- A coverage view from the live database (`npm run coverage` reads the batch
  files, not the database).
- Listing "opportunity" ranking.
- A unified record timeline.
- Follow-up tasks.
- A knowledge base (services, deadlines, decisions, documents).
- Saved views and a Cmd+K palette.
- An automation run log.
- Alerts.

## 5. Confusing or inefficient workflows

- **Revenue page:** the label suggests income. It should read "Reported
  bookings (GMV)" until real revenue exists.
- **Morning routine:** the owner opens 4 or 5 pages (claims, listing health,
  photo wall, feedback, leads) to find out whether anything needs them. Badges
  exist in the layout, but no single queue.
- **Infra usage** lives in a script the owner runs on request. The Growth
  page's panel is static text.
- **Coverage progress** lives in a CLI command, not the admin.

## 6. Reusable pieces

- `_listing/` (toolbar, URL filters, paging, bulk actions, audit panel).
- `ExportCsvButton`.
- `admin-search` / `search-actions`.
- The Ask Wren tool runner and allowlist.
- `scripts/weekly-review.mjs` (Supabase, Cloudflare and Resend usage).
- `field_sources`.
- `listing-freshness.ts`.
- `PageShell` and `layout.ts` widths.
- `globals.css` tokens.

---

## 7. What best-in-class admins do, adapted [R] / [P]

- **Home = action items + a few KPI cards.**
  - [R] Stripe's Home combines charts with items that need action, such as
    unresolved disputes. Widgets are customisable.
  - [R] Shopify's analytics cards each open their full report.
  - [P] Home lists the needs-action queue first, then 5–7 cards, each with
    the change against the previous period and a link to its detail page.
    No revenue card until revenue exists.
- **Record pages with a timeline.**
  - [R] HubSpot records: properties on the left, activity timeline in the
    middle, linked records on the right. Each property keeps its change
    history.
  - [P] Use this layout for vendor and venue pages. Build the timeline from
    `field_sources`, claims, inquiries, emails and notes.
- **Saved views and a keyboard palette.**
  - [R] Linear saves filtered views with shareable URLs and lets you pin
    them.
  - [R] Stripe lists its shortcuts on `?`.
  - [P] Filters already live in the URL, so saved views only need a name
    attached to that URL.
- **Spend thresholds.**
  - [R] Vercel alerts at 50%, 75% and 100% of a spend budget.
  - [R] PostHog stops ingesting at a hard billing cap.
  - [P] Apply the same thresholds to each free tier.
- **Event naming.**
  - [R] Mixpanel and PostHog both recommend snake_case object-verb names,
    with key events tracked on the server and internal users filtered out.
- **Finance.**
  - [R] QuickBooks Online's API has a free "Builder" tier for reads. Calls
    past the limit are blocked, not billed.
  - [R] Xero moved to tiered pricing on 2026-03-02. Its free Starter tier
    allows 5 connections and 1,000 calls per day per organisation.
  - [R] Stripe Financial Connections is for reading your *customers'* bank
    data.
  - [P] Keep the books in QuickBooks or Xero, with an accountant seat there,
    and show a read-only summary in the admin.
- **Secrets.**
  - [R] Bitwarden Secrets Manager is free for 2 users.
  - [P] Keep secrets in a password manager and store only metadata about
    them in the admin.

## 8. Financial management and integration strategy [P]

Full detail is in `.claude/skills/youdoido-admin-master/references/finance.md`.

| Stage | Trigger | What to build |
|---|---|---|
| 1 | Now | A **Spend & renewals** page from `ops_services`: plan, monthly cost, renewal date, free-tier limit, account owner. Entered by hand, owner-only. Reminders 14 days ahead. Rename Revenue to "Reported bookings (GMV)". |
| 2 | First vendor payment (monetization Phase 1) | Stripe payment links, as planned. A read-only Stripe sync of charges, fees, refunds and payouts, with revenue split by stream. |
| 3 | Books exist | Read-only QuickBooks or Xero monthly P&L and cash cards, each showing a "last synced" time and reconciliation status. The accountant works inside QuickBooks or Xero. |
| — | Never by default | Moving money, refunds, billing changes, writing to the books. |

**Owner decision:** QuickBooks Online or Xero. QuickBooks is the more common
choice among US bookkeepers [A]; both have a free API tier for one company
[R].

## 9. Analytics and KPI strategy [P]

Full detail is in `references/analytics.md`.

- **Now:** make every count correct, using `count: exact, head: true` or SQL
  views. Put a definition on every card, and state the test-account
  exclusion.
- **Before the first outside users:**
  - An append-only `events` table with about 15 server-side events, named
    `object_verb` past tense (`wedding_created`, `guest_site_published`,
    `vendor_inquiry_sent`, `listing_claimed`, …).
  - Funnels for couples (signup → wedding → planning activated → site
    published → month-2 return) and for listings (imported → checked →
    claimed → profile complete → inquiry).
- **Marketing traffic:** Cloudflare Web Analytics, which is free and
  cookieless [R]. Only after the privacy page is updated; that is the owner's
  call.
- **Later:** PostHog, with billing limits, once there's a question events
  can't answer.

## 10. Secure business information strategy [P]

Full detail is in `references/knowledge-ops.md` and `references/security.md`.

- Secrets stay in the password manager and the platform secret stores. The
  admin stores only their names, where each lives and when it was rotated.
- Documents stay in a Google Drive "Company" folder. The admin stores links
  and expiry dates.
- Four owner-only tables:
  - `ops_services` (tech inventory and subscriptions);
  - `ops_deadlines`;
  - `ops_decisions` (the decision log);
  - `ops_documents`.
- Save validation rejects anything that looks like a key.

## 11. Proposed admin navigation [P]

1. **Home:** needs-action queue, KPI cards, coverage progress, system health.
2. **People:** Couples, Vendors, Venues, Claims.
3. **Marketplace:** Listing health, Coverage, Unlisted bookings, Buy & sell,
   Photo wall, Attire, Cost data.
4. **Insights:** Growth & funnels, Feedback themes, Ask Wren.
5. **Money:** Spend & renewals now; Revenue and Books later.
6. **Operations:** Knowledge base, Automations log, Audit log.

This regroups the existing pages; nothing is removed. The visual design goes
through `design-expert`, with a preview before any build.

---

## 12. The 15 highest-value improvements, ranked

| # | Pri | Improvement | Why it matters | Size | Running cost | Roadmap status |
|---|---|---|---|---|---|---|
| 1 | P0 | `requireAdmin()` on every admin page | Every couple's data sat behind a layout-only check | S | 0 | **Done in branch** |
| 2 | P0 | Admin MFA (Supabase TOTP, require `aal2` in `requireAdmin`) | One stolen password exposes every couple | S–M | 0 | Live (Phase A, 2026-10-21): `/login/mfa` |
| 3 | P0 | Daily cap on contract reading and thank-you drafts | An uncapped AI loop is an open-ended bill | S | 0 | Live (Phase A, 2026-10-21): 10 contract reads, 40 thank-you drafts per wedding per day (migration 0125) |
| 4 | P0 | Correct counts past 1,000 rows (Overview, Growth, Revenue, Couples) | Wrong numbers lead to wrong decisions, and fail silently | M | 0 | Live (Phase A, 2026-10-21): `selectAll`/`listAllUsers` page past 1,000 |
| 5 | P1 | Admin audit log (`admin_audit_log` + `logAdminAction`) | Accountability for bulk deletes, claim approvals and emails; prerequisite for a second admin | M | 0 | In PR: `admin_audit_log` (migration 0126), `logAdminAction` in every changing admin action, /admin/audit-log |
| 6 | P1 | Home redesign: needs-action queue + 5–7 defined KPI cards + coverage | Understand the company in 30 seconds; fewer page visits | M | 0 | In PR (2026-10-21): /admin is now Home — needs-you queue, 6 defined KPI cards (30 days vs the 30 before), coverage from live listings (migration 0127), system health |
| 7 | P1 | Security headers (CSP, HSTS, frame-ancestors) + rate limits on public inserts | Cheap protection against clickjacking, spam and inflated counts | S–M | 0 | Partly live (Phase A, 2026-10-21): HSTS, frame-ancestors, nosniff, Referrer/Permissions-Policy; contact-click capped at 10/hour per listing. Full CSP open |
| 8 | P1 | Error log table + daily error summary | Catch breakage before couples do (guest site, RSVPs) | M | 0 | Proposed |
| 9 | P1 | Spend & renewals page (`ops_services`, `ops_deadlines`) | Know what you pay for and when it renews | M | 0 | Proposed |
| 10 | P1 | Rename Revenue to "Reported bookings (GMV)" + definitions on every card | Stops GMV being mistaken for income | S | 0 | Relabel live (Phase A, 2026-10-21); card definitions on Home in PR (#6) |
| 11 | P1 | Live-DB coverage view + listing opportunity ranking | Points the 50-state work at the gaps that matter most | M | 0 | Proposed |
| 12 | P1 | Server-side `events` table, 15 events, couple + listing funnels | Can't learn where couples drop off without it; cheap now, painful to backfill | M | 0 | Proposed |
| 13 | P2 | Ask Wren approved report tools + token tracking + fail-closed cap | Trustworthy, cited answers; visible AI cost | M | Cents | Proposed |
| 14 | P2 | Vendor/venue record timeline + follow-up tasks | Outreach and accuracy history in one place | M–L | 0 | Proposed |
| 15 | P2 | Cmd+K palette + saved views; decision log + documents | Speed; institutional memory | M | 0 | Proposed |

**Later (P3):**
- Stripe sync and QuickBooks/Xero summary, at first revenue.
- Roles (owner and bookkeeper), when a second person needs access.
- PostHog.
- Customisable dashboards.
- Budget and forecast.

Each item's acceptance criteria get written in its PR plan. Engineering
standards are in `references/operations-engineering.md`.

## 13. Phased roadmap

- **Phase A: Trustworthy core (1–2 sessions).** Items 2, 3, 4, 7 and 10,
  plus the small fixes from §3.9:
  - bulk-email reply-to and cap;
  - Ask Wren cap failing closed;
  - batch-sync insert column whitelist;
  - `.env.example`.

  Logic-only changes; no visual redesign.
- **Phase B: Command center (2–3 sessions).** Items 5, 6, 8 and 9. The Home
  page gets a design preview before it's built.
- **Phase C: Marketplace intelligence (2 sessions).** Items 11 and 14, plus
  name and city duplicate detection in the import script and `/data-audit`.
- **Phase D: Insight (before launch marketing).** Items 12, 13 and 15, and
  the privacy page update for any analytics provider.
- **Phase E: Money (at the Phase 1 monetization trigger).** Stripe sync,
  then a books integration.

---

## 14. Top five immediate priorities

1. Merge the `requireAdmin` page fix (done in this branch).
2. Turn on admin MFA.
3. Cap the uncapped AI features.
4. Make admin counts correct past 1,000 rows.
5. Add the admin audit log.

## 15. Recommended first implementation project

**Phase A, "Trustworthy core":**
- MFA;
- AI caps;
- paged and exact counts;
- security headers and public rate limits;
- the GMV relabel;
- the small fixes from §3.9.

It's all logic, so there's no design round, and it makes every later
dashboard number trustworthy. Difficulty: **low to moderate**, about 1–2
sessions in one PR. The MFA part needs the owner to enrol an authenticator
app once.

## 16. Major risks

- **Admin account compromise:** no MFA, single role, no audit trail.
- **Silent wrong numbers** once tables pass 1,000 rows.
- **Open-ended AI spend** from uncapped features.
- **No monitoring:** a guest-site or RSVP failure is found by a couple.
- **Legal items still open** from `docs/legal-audit.md`: entity (R4),
  insurance (R9), DMCA (R7), CAN-SPAM address (R10). These matter more than
  any dashboard.

## 17. Questions for the owner

1. Is there a legal entity and a business bank account yet? That decides
   whether QuickBooks or Xero is needed now.
2. QuickBooks Online or Xero, or neither until revenue?
3. Which password manager do you use, if any? (Bitwarden's free plan is
   enough.)
4. Will anyone else need admin access in the next 6 months (bookkeeper,
   VA, cofounder)?
5. Are you OK updating the privacy page to allow cookieless Cloudflare Web
   Analytics on the marketing pages?
6. Should the daily digest be emailed to you, or only shown on Home?
7. What monthly spend would worry you? That number sets the alert
   thresholds.

## 18. Professional recommendation

Don't build a QuickBooks inside the admin. You have no revenue, so the
highest return is making the admin **safe and correct**, then **calm and
action-first**:

- MFA, caps and correct counts this week;
- a Home page that tells you what needs you;
- a small Operations area so renewals and decisions stop living in memory.

Instrument the couple funnel before marketing starts, because that data can't
be backfilled. Connect Stripe and your books when the first vendor pays, and
not before.
