# Marketing state

Last updated: 2026-10-20 (installation). Keep this under ~80 lines; it's read on
every run.

## Stage

Pre-launch, solo owner, no outside users, Phase 0 (free for couples and
vendors). Marketing is parked in CLAUDE.md until the product is ready; this
department prepares so that launch is fast and safe when the owner says go.

## Gates

| Gate | Status | What opens it |
| --- | --- | --- |
| 50-state coverage ("no marketing until every state has listings") | **Met at pass 1** — `npm run coverage` 2026-10-20: 51/51 states meet pass 1; pass 4 targets still open. ROADMAP.md line 9 still says West Virginia is short, so it's stale | Owner decides whether pass 1 is enough to start |
| Commercial email (vendor outreach, newsletters) | **Shut, opening** — owner is getting a PO box (2026-10-20); no address yet, no unsubscribe link or List-Unsubscribe header, `outreach_opt_outs` not read by the app | PO box in hand → its address in the footer; code adds unsubscribe, List-Unsubscribe, opt-out check, signup opt-in |
| Analytics / ad pixels | **Shut** — nothing installed, not disclosed in Privacy | Choose a cookieless tool (Cloudflare Web Analytics is free and on the stack) and add a Privacy line |
| Paid ads | **Shut** — no tracking to measure them and no budget set | Analytics first, then an owner-set test budget |
| Gmail access for inbox work | **Connected** 2026-10-20 as hello@youdoido.com; draft-only by rule (the connector can send) | — |
| Entity / insurance (legal-audit R4, R9) | Open | Owner + attorney; matters before paid or partner deals |

## Verified claims (checked against code, 2026-10-20)

Safe to say: free to plan, no credit card needed; free wedding website at
`youdoido.com/w/<slug>` with templates and themes; regional budget estimator at
`/estimate` (no signup); guest list with RSVPs; seating and floor plan;
checklist, itinerary, registry links, attire; venue and vendor search with
in-app inquiries; free business listings (`/list`) and claim links; listings in
all 50 states + DC (pass 1). Recount numbers ("25 templates", "15+ tools")
from the code before reusing them.

Not true, don't imply: verified vendors, reviews, booking or payments through
the app, a mobile app in the stores, partnerships, user counts, a newsletter,
"AI planner" (Wren is an assistant and says it can be wrong).

## Funnel instrumentation

Signup source / UTM: none. Referral codes exist per wedding but only tag vendor
inquiries. Page analytics: none. Admin has signups by month and feature
adoption (`/admin/growth`), inquiries and contact taps. So today we can count
signups and activity but not where anyone came from.

## In flight

Nothing yet. Top of `BACKLOG.md` is the next proposal.
