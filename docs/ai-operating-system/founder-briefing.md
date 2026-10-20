# Founder Briefing — 2026-10-20

First run, made during the AI operating system install. Covers 2026-10-13 to
2026-10-20. Sources: `node scripts/weekly-review.mjs` (Supabase counts),
`npm run coverage`, `git log main`, `docs/legal-audit.md` §12,
`docs/retention.md`.

## 1. Executive summary
The directory grew fast this week (+3,571 vendors, +1,257 venues, measured)
and every state meets coverage pass 1. Big product and legal work landed: the
guest-site data exposure was closed, claim links now expire, backups are
encrypted, and first-run setup with Wren shipped. The remaining blockers to
inviting real users are mostly owner-only (entity, DMCA agent, insurance, A2P,
the backup key and plaintext backups in git history). The app still can't
measure traffic or errors.

## 2. Top three priorities
1. **Owner-only legal and data-safety blockers.** Nothing else can stand in
   for these, and R6 (plaintext backups in git history) is live exposure.
2. **Measurement before launch.** Analytics, Search Console and error
   alerting (`integrations.md` 1–3), so launch can be judged on facts.
3. **A reason for couples to come back.** Reminder emails need a scheduled
   job (`risks-and-opportunities.md` O1).

## 3. Product developments (from `git log`, 179 commits incl. batches)
- First-run setup: five skippable questions with Wren, then a budget estimate.
- Guest-site data exposure closed; legal copy fixed from the audit.
- Claim links expire; backups encrypted (once the key is set).
- Accessibility basics: focus ring, skip link, modal focus trap, error/404 pages.
- Marketplace (sell/browse) part 1 and polish; venue pins on the building.
- Wren on a cheaper model with prompt caching and a monthly cap.
- Duplicate listings removed (migration 0121).

## 4. Technical and security concerns
- Legal register: R4 entity, R7 DMCA, R9 insurance **open**. R6 open for git
  history and export. R2 waits on Twilio A2P 10DLC registration (owner).
- Rows marked "fixed in branch" are on `main`. Confirm migrations 0121–0123
  are run in production.
- `scripts/weekly-review.mjs` was failing on every run (it queried a column
  that doesn't exist). Fixed in this PR.
- The `SUPABASE_ACCESS_TOKEN` in the Claude Code environment is rejected
  (401), so DB and storage size are unknown.
- No tests. No error alerting.

## 5. Acquisition and marketplace (measured)
- Listings: **11,335 vendors** (6 inactive, 58 missing map location) and
  **7,336 venues** (15 inactive, 7 missing location).
- Coverage: 51/51 meet pass 1. The current stage still wants 9,000 venues and
  8,761 vendors. 28% of researched businesses were skipped (mostly dead sites
  or no website).
- Inquiries this week: 0 vendor, 0 venue. Feedback queue: 1 new.
- Accounts: 9 total (0 this week, 3 active in 30 days). Weddings: 4.
  **Caveat:** `ADMIN_EMAIL` isn't set in this environment, so the owner's
  test weddings can't be told apart. "4 real" is probably the owner's own
  testing.

## 6. Financial health
Revenue $0 (not monetized, by design). Infra usage vs free tiers: Supabase
MAU 3 of 50,000. DB/storage, Cloudflare requests and Resend volume are **not
connected** (see section 4 and `integrations.md`). No finance system
connected. Anthropic and Twilio spend: check their dashboards.

## 7. Competitors and industry
Nothing new researched since 2026-09-14 (`docs/competitors.md`). A refresh is
due within the month.

## 8. High-value opportunities
- Payment-due and checklist reminder emails. Zola has these and we have none.
- Search discovery: ~18,700 real listings is SEO surface worth checking once
  Search Console is connected.

## 9. Decisions needing you
1. **Launch bar for listings:** pass 1 (met) or the current stage? I'd
   recommend pass 1 plus the legal blockers closed, then keep filling.
2. **Turn on Cloudflare Web Analytics**, with the privacy-policy line?
   I'd recommend yes.
3. **Confirm migrations 0121–0123 are run** so the register can say Fixed.

## 10. Recommended next actions
1. You: set `ADMIN_EMAIL` and a fresh `SUPABASE_ACCESS_TOKEN` in the Claude
   Code environment (steps in the PR description).
2. You: start the entity, DMCA agent and A2P registration. Each is a form.
3. Me, on your yes: Web Analytics plus the privacy line, then a reminder-email
   cron.
4. Run `/launch-readiness` once 1–3 are moving.
