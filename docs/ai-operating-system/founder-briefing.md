# Founder Briefing — 2026-10-21

Covers 2026-10-20 to 2026-10-21 (previous briefing: 2026-10-20).
Sources: `node scripts/weekly-review.mjs`,
`npm run coverage`, `git log main`, open PRs.

## 1. Executive summary
Listings keep climbing (12,013 vendors, 7,641 venues, measured) and every state
still meets pass 1. Yesterday's product work landed: the "Your next step"
dashboard card, the new inquiry form, the product-led landing hero and the
marketing-email plumbing (opt-in, unsubscribe). Still no outside users, and
traffic/errors/email volume still can't be measured.

## 2. Top three priorities
1. **Owner-only legal/data blockers** (entity R4, DMCA R7, insurance R9, A2P for
   SMS, plaintext backups in git history R6) — unchanged since yesterday.
2. **Measurement before launch** — Cloudflare Web Analytics, Search Console,
   error alerting.
3. **Clean numbers:** mark your test weddings as test so growth counts mean
   something.

## 3. Product developments (since 2026-10-20)
- Dashboard "Your next step" card with the planning path.
- Inquiry form: date + headcount, ask-with-chips, auto-written message.
- Landing hero redone: the product is the hero.
- Marketing email: signup opt-in, /account toggle, unsubscribe + one-click header.
- `/marketing` CMO skill installed; Gmail connected (draft-only).
- 31 venue/vendor batch PRs merged.

## 4. Technical and security concerns
- `ADMIN_EMAIL` and the new `SUPABASE_ACCESS_TOKEN` now work in the Claude
  Code environment; the AI operating system (PR #924) is merged.
- Migration 0124 (marketing email) plus `UNSUBSCRIBE_SECRET` and
  `MARKETING_POSTAL_ADDRESS` in Cloudflare still to do before commercial email.
- 1 owner wedding not marked test (skews growth numbers).
- No tests, no error alerting.

## 5. Acquisition and marketplace (measured)
- Vendors 12,013 (+4,249 this week; 6 inactive; 58 missing map location).
- Venues 7,641 (+1,562 this week; 15 inactive; 8 missing location).
- Coverage: 51/51 pass 1; current stage still wants 8,442 venues, 7,717 vendors.
  29% of researched businesses skipped (mostly dead sites / no website).
- Inquiries this week: 0 vendor, 0 venue. Submissions pending: 0.
  Feedback: 1 new.
- Accounts 9 (0 this week, 3 active in 30 days); weddings 4, all likely yours.
- Open batch PRs: #937 (Georgia vendors), #938 (New York venues).

## 6. Financial health
Revenue $0 by design. Supabase DB 49/500 MB, storage 17/1,000 MB, MAU 3/50,000
(measured). Cloudflare and Resend **not connected** (keys missing). No finance
system connected.

## 7. Competitors and industry
Nothing new since 2026-09-14; a refresh is due.

## 8. High-value opportunities
- Reminder emails (payment due / checklist) — the main reason couples return.
- Search Console + sitemap: ~19,600 listings is real SEO surface, 10 min of DNS.

## 9. Decisions needing you
1. Is pass 1 coverage enough to lift the "no marketing" gate? Recommend yes,
   once the legal blockers are moving.
2. Turn on Cloudflare Web Analytics with a Privacy line? Recommend yes.

## 10. Recommended next actions
1. Mark your wedding as test on /admin/couples.
2. Run migration 0124; set the two marketing-email secrets once the PO box exists.
3. Add Cloudflare + Resend keys to the Claude Code environment so the next
   briefing has infra numbers.
4. Me, on your yes: Web Analytics + Privacy line.
