# Executive assessment — 2026-10-21

The first full assessment. All five specialists ran in parallel, read-only.
Facts are tagged **[V]** (verified by a query or a file read today) or **[H]**
(hypothesis). Anything not measured is marked "no data", never zero.

Sources: `scripts/weekly-review.mjs`, `npm run coverage`, SELECT-only REST
counts on `venues` and `vendors`, and the files cited inline.

## 1. Current state

- **Couples [V].** There are 9 auth users, 3 of them active in the last 30
  days, and 4 weddings: 1 real and 3 flagged test. There have been 0 venue
  inquiries ever. All 9 vendor inquiries came from test weddings. There have
  been 2 contact taps ever, both on 2026-10-11. Every real-user metric rests on
  n=1.
- **Product [V].** The couple app is broad: guests, budget with Sheets sync,
  checklist, seating, itinerary with SMS, registry, guest site, Wren with
  confirm-to-apply (`src/lib/ai/wedding-assistant.ts`), the `/start` setup and
  the dashboard next-step engine. Nothing brings a couple back: there are no
  reminder emails, guests get no RSVP confirmation or edit link, and guest
  deletes are permanent (`docs/retention.md` open items 3–5).
- **Listings, on 7,771 active venues and 12,045 active vendors [V]:**

  | Field | Venues | Vendors |
  |---|---|---|
  | Photos | 0 | 0 |
  | Description and website | ~100% | ~100% |
  | Map location | 99.9% | 99.5% |
  | Phone | 89% | 65% |
  | Email | 60% | 62% |
  | Street address | 95% | 41% |
  | Capacity | 48% | — |
  | Price tier | 14% | 0% |
  | No phone and no email | 495 | 2,264 |

  Having no photos is deliberate. The legal audit rules out scraped photos and
  logos (`docs/legal-audit.md:360`), so photos can only come from businesses
  themselves.
- **Freshness [V].** 82% of venues and 71% of vendors carry `last_verified_at`.
  It is an agent's website check, not a business confirming its details.
  1,420 venues and 3,535 vendors are unverified or more than 90 days old.
  Real-world accuracy: no data.
- **Claims [V].** One claim link has been issued for a venue and one for a
  vendor. One vendor submission (2026-10-06) was rejected. No outside business
  has a verified claim.
- **Coverage [V].** 51/51 states meet pass 1. The current stage still wants
  8,297 venues and 7,679 vendors. 29% of researched businesses were skipped.
- **Ops and cost [V].** Supabase DB is 50/500 MB, storage 17/1,000 MB, MAU
  3/50k. Cloudflare and Resend usage: no data (keys missing). Anthropic and
  Twilio spend: no data. Revenue is $0 by design.
- **Security [V].** The admin requires an allowlisted email plus an
  authenticator code (`src/lib/admin.ts:33-102`). `/api/batch-sync` fails
  closed (`src/lib/batch-secret.ts`). New tables (0124–0129) have RLS on.
  Claims go to an admin queue, and unclaimed listings carry a "not affiliated"
  note. The open items are mostly owner actions: R4 (LLC in progress), R6, R7,
  R9 and R10.
- **Measurement [V].** No product events, no web analytics, no Search Console. (Later the same day: PR #956 added the `events` table and
  `/admin/analytics`, and this branch added the per-couple First cohort table.
  Web Analytics and Search Console are still owner steps.)
- **Scheduling [V].** A GitHub Actions daily job now calls
  `/api/spend-reminders` (`.github/workflows/spend-reminders.yml`, merged
  2026-10-21). It is the existing scheduler pattern. There is no Cloudflare
  cron.

## 2. Specialist findings (top five each, condensed)

**Product strategist**
1. A server-side event layer and an activation funnel.
2. Reminder emails: payments, checklist and an RSVP digest.
3. RSVP trust: confirmation, an edit link, a duplicate guard and undo for
   guest deletes.
4. A real onboarding test with 5–10 couples from the owner's network.
5. Proactive, rule-based "Wren noticed…" nudges.

It also flagged over-investment in directory breadth.

**Engineering architect**
1. `/venues` and `/vendors` ship every active row (`fetchAll`, 8 and 13
   sequential pages, `src/app/venues/page.tsx:20-41`) with no caching. Cache
   these pages and slim the columns sent to the map and list.
2. The sitemap is `force-dynamic`, rebuilt with 20 queries on every request
   (`src/app/sitemap.ts:8`). Cache it.
3. The proxy calls `getUser` on every request, bots included
   (`src/lib/supabase/middleware.ts:64`). Skip it when there is no auth
   cookie.
4. Run type-check and lint on PRs, plus Vitest on budget, RSVP and the batch
   parsers. There is no PR check today, and batch PRs merge themselves.
5. A daily error digest from `app_errors`, plus one backup restore drill.

It also noted the duplicate migration number 0129 and 139 hand-run
migrations with no record of which have been applied.

**Security & privacy**
1. The marketing-email gates: `UNSUBSCRIBE_SECRET`,
   `MARKETING_POSTAL_ADDRESS` and migration 0124 (R10). The code already
   refuses to send without the first two (`src/lib/marketing-email.ts:31`).
2. Purge the plaintext backups from git history and set
   `BACKUP_ENCRYPTION_KEY` (R6).
3. Register a DMCA agent once the LLC exists, add a report path and harden
   uploads. Today the guest-site upload accepts any `image/*`, SVG included,
   and takes the file extension from the user (`src/app/w/[slug]/actions.ts:30,37`).
4. Turnstile and per-IP limits on anonymous forms. RSVP has only a honeypot,
   and each RSVP can trigger an email and a 5 MB upload (R17).
5. Move `ADMIN_EMAIL` to a secret, plus a reviewer checklist for claims.

Stale register rows: R16 (the audit log is on main) and R8.

**Growth & marketplace**
1. Photos, which can only come from claimed businesses.
2. 2–3 launch metros, deep and verified.
3. Claim by value, not by leads: a pre-filled page, a completeness
   checklist, "fix a wrong fact in 2 minutes", and founding-business status.
4. Search Console, then state and metro pages only where 8 or more listings
   exist.
5. Differentiate on honesty: "checked against their website", "claimed by
   owner", no pay-to-play. Also capture UTM and ref on signup.

**Finance & operations**
1. Cap and log Anthropic spend. It is the only usage-driven cost with no cap
   (`docs/admin-blueprint.md` §3).
2. Read-only Cloudflare and Resend keys, so the usage numbers are measured.
3. An append-only `events` table with about 15 events.
4. Cloudflare Web Analytics and Search Console, after a Privacy line.
5. Home accuracy: the bounce count never clears, there's no `last_backup_at`,
   and import-driven growth should be labelled as such.

## 3. Cross-functional review

**Where several specialists agree**
- **Measurement first** (product, finance, growth, engineering). Every
  downstream decision is blind without it.
- **Reminders as the retention lever** (product, engineering, risk O1).
- **Depth over breadth** (product, growth). The directory is where we can't
  beat The Knot, and listings have no photos, no vendor prices and 14% venue
  prices.
- **Safe launch surface** (security, engineering): caching, Turnstile and
  upload hardening before traffic arrives.

**Conflicts and how they were resolved**
- **Seeded cover photos (growth) vs. no scraped images (legal audit).** The
  legal audit wins. Photos come only from businesses, and "add your photos" is
  part of the reason to claim.
- **Cloudflare cron (engineering) vs. what already exists.** Use the GitHub
  Actions → API-route pattern already running for spend reminders. It is one
  scheduler, not two.
- **Reminder emails vs. Resend Free (100/day, 3,000/mo).** These fit at under
  ~30 active couples **[H]**. Set the upgrade trigger before turning on any
  bulk or lifecycle email.
- **Analytics vs. the Privacy page.** The Privacy page promises no trackers.
  Cloudflare Web Analytics is cookieless, but it still needs a Privacy line,
  and the owner approves that wording.
- **Coverage plan stage 2 vs. depth.** Recommendation: freeze the breadth
  targets at pass 1 and point the batch routines at completing capacity,
  price and verification in the launch metros. This is the owner's decision.

**Top ten, ranked**

1. **Measurement foundation.** A server-side `events` table, Cloudflare Web
   Analytics plus a Privacy line, Search Console with the sitemap, and
   UTM/ref capture.
2. **Cache the public browse pages, sitemap and listing pages**, and skip the
   auth refresh for cookieless requests.
3. **Claim-and-improve offer.** A pre-filled page, a completeness checklist,
   photo upload and founding status.
4. **Commercial-email gates.** LLC → mailbox → secrets → 0124. This blocks
   claim outreach.
5. **2–3 launch metros, deep and verified.**
6. **Reminder emails** (payments, checklist, RSVP digest) on the existing
   scheduler.
7. **RSVP trust**: confirmation, an edit link and undo for guest deletes.
8. **Launch-surface hardening**: an upload allowlist and Turnstile.
9. **Reliability loop**: PR type-check and lint, money/RSVP tests, a daily
   error digest and a restore drill.
10. **Anthropic spend cap and logging**, plus read-only Cloudflare and Resend
    keys.

## 4. National marketplace strategy

- **Completeness, not count, is the gap.** No listing has a photo, no vendor
  has a price, and only 14% of venues have one. The cheapest wins are
  agent-researched capacity and price tier from public websites, which is
  already within the batch rules. Photos have to come through claims.
- **Claim rate is effectively zero** among outside businesses. We have no
  leads to offer, so the offer has to be:
  1. A page that's already built and takes 2 minutes to correct.
  2. Fixing wrong facts, which is the real pain for a business.
  3. Their own photos on a page that's indexed.
  4. Founding-business terms. The owner sets them, and they must fit
     `docs/monetization.md` Phase 0.

  Never imply traffic or leads.
- **Smallest test.** Once the email gates open: 20 personal invitations in one
  launch metro, to listings that have an email and were verified within 90
  days. Measure opens, claims started and claims approved in `/admin`.
- **Geography.** Every state has listings, but depth is thin: most states are
  60–250 vendors short of target. Choose the launch metros by where the owner
  can reach couples in person, not by coverage gaps alone.
- **Acquisition.** SEO is the only free channel, with about 14,850 indexable
  listing pages. Search Console comes first. State and metro pages come only
  where data is dense enough to avoid thin content.
- **Differentiation.** Free, honest and calm: no pay-to-play ranking, no lead
  resale, and an estimator-first front door. The "verified" stamp is an
  agent's website check. Public copy must not present it as the business
  confirming its details.

## 5. Founder dashboard

| Cadence | Metric | Today? |
|---|---|---|
| Daily | Needs-you queue (claims, reports, feedback) | Yes: Admin Home |
| Daily | App errors | Yes: `app_errors` / Errors page |
| Daily | New signups, real couples | Yes: Home / Growth |
| Daily | Worker errors and requests | Needs a Cloudflare read token |
| Weekly | Real couples, inquiries, guest sites published | Yes: weekly-review / Home |
| Weekly | Claims started and approved, contact taps | Yes: `/admin/leads`, claim queue |
| Weekly | Listing completeness % (photo, price, capacity) | Query exists, not on Home |
| Weekly | Listings added | Yes, but import-driven, not growth |
| Weekly | Emails sent and bounced, Anthropic $ | Needs a Resend key / spend logging |
| Monthly | Activation funnel, 30-day return | Needs an `events` table |
| Monthly | Traffic by source, search clicks | Needs Web Analytics / Search Console |
| Monthly | Spend vs. renewals | Yes: `/admin/spend` (hand-entered) |
| Monthly | DB and storage vs. free tier | Yes: weekly-review |
| Monthly | Backup restored OK | Manual; needs a Home flag |

**Changes to Admin Home**
- Add a listing-completeness card.
- Show Supabase usage percentages in place of "Infra usage: not pulled".
- Limit bounces to a time window, so the queue can clear.
- Add renewals due in the next 30 days.
- Label listing growth as import.

## 6. 30/60/90 days

**Days 1–30: foundations**
- Owner: LLC (~11-02), EIN, mailbox and Form 1583. Then the
  marketing-email secrets plus 0124, and the DMCA agent.
- R6 git-history purge (owner, with help).
- Events table, Web Analytics plus a Privacy line, Search Console.
- Cache the browse pages and sitemap, with the cookieless auth skip.
- Upload allowlist; PR type-check and lint.
- Choose the launch metros.

Done when: the activation funnel renders, the sitemap is cached and
submitted, weekly-review shows nothing unavailable, and the email gates are
open.

**Days 31–60: experience and marketplace**
- Run the 5–10 couple cohort (needs events).
- RSVP confirmation and edit link.
- Payment and checklist reminders on the existing scheduler.
- Bring launch-metro listings to target completeness (capacity, price tier,
  verified within 90 days).
- The claim-and-improve page, then the first 20 invitations (needs the email
  gates).
- Turnstile.

Done when: the cohort's activation and return rates are measured, at least
one outside business claim is approved, and launch-metro completeness meets
the owner's bar.

**Days 61–90: growth and automation**
- State and metro pages where data is dense; widen outreach to the
  remaining launch metros.
- Proactive Wren nudges.
- Daily error digest; Anthropic cap and logging.
- Completeness and freshness re-verification on a schedule.
- Revisit the marketing gate with real cohort data.

Done when: Search Console clicks are trending, the claim approval rate is
known, and the weekly briefing is fully measured.

## 7. Overlooked or over-complicated

- **Breadth work is the biggest spend of effort.** 31 batch PRs landed in a
  day, against 1 real couple and 0 outside claims. Each extra listing now adds
  little.
- **The "verified" stamp could mislead** if it's ever shown or marketed as the
  business confirming its details.
- **Find out why the one real vendor submission (2026-10-06) was rejected.**
  It's the only outside business signal so far.
- **Migration hygiene.** There are two files numbered 0129, and no record of
  which migrations have been applied. This was the cause of K4.
- **Data hygiene.** 44 rows in `src/lib/batches/skipped/colorado.tsv` (plus
  one each in Florida and North Carolina) have shifted columns, which garbles
  the coverage report's skip reasons.
- **Make text-only listings honest.** Turn "no photos" into "Photos come from
  the business — is this yours?" rather than a blank space.

## 8. Decisions for the owner

1. **Launch bar.** Pass 1 everywhere plus 2–3 deep launch metros, rather than
   continuing the national stage-2 targets. Recommendation: yes. Trade-off:
   thinner listings outside the launch metros.
2. **Measurement.** Approve the events table, Cloudflare Web Analytics, the
   Privacy line and Search Console. Recommendation: yes. Trade-off: the
   Privacy page changes, and this is a small data-collection surface.
3. **Founding-business terms** for claims, e.g. "free listing for life". This
   binds `docs/monetization.md`. Recommendation: decide before the first
   invitation, and keep it to the listing itself, not future paid features.

## 9. First project

**The measured first cohort:** the events table plus analytics and Search
Console, then 5–10 real couples from the owner's network. It's cheap, needs
none of the blocked legal steps, and turns every later choice (reminders,
metros, claims) from a guess into a measurement.
