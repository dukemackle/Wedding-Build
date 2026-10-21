# Company profile

Last checked 2026-10-20. The rules in `CLAUDE.md` (brand, palette, colour
roles, layout) win over anything here; this file is the business summary.

## Who we are
**You Do, I Do** (formerly Wren; youdoido.com, admin.youdoido.com; wrenwed.com
301s to it). Contact: hello@youdoido.com. Solo founder. **Wren** is the name of
the AI wedding-planning assistant, not the company.

## Mission
Make everything before "I do" a whole lot easier. Everything a couple needs
to plan their own wedding, in one calm, simple place.

Brand feel: welcoming, exciting, intuitive, beautiful, sophisticated,
trustworthy. Exceptional functionality through outstanding simplicity, not a
bloated app.

## Audiences
1. **Engaged couples** (primary): plan the wedding themselves.
2. **Venues**: show their property, manage their listing, get inquiries.
3. **Vendors**: promote services, get inquiries from couples.

## Product (what exists, verified in `src/app`)
Couple app: dashboard, guests and RSVPs, budget (with Google Sheets sync),
checklist, seating and venue layout / floor plan, itinerary (with guest SMS),
registry, attire, wedding party, cost estimator, guest website builder
(`/w/[slug]`, templates and canvas editor), venue and vendor discovery with
maps, inquiries, bookings, and Wren. Admin: couples, venues, vendors, leads,
growth, revenue, listing health, feedback, cost data, claim links, Ask Wren.

## Positioning (see `docs/competitors.md`)
Free, calm, all-in-one planning, with Wren as the differentiator. The
directory's breadth is the weakness against The Knot (300k+ listings), and
the target of the 50-state coverage plan.

## Business model
Not monetized. Revenue is $0 by design. The staged plan (free couples,
vendor listings free first, paid vendor features later) and its triggers are
in `docs/monetization.md`. Don't build billing ahead of the triggers.

## Stage and goals
- **Stage:** pre-launch, no outside users, founder testing solo.
- **Priority order (from `CLAUDE.md`):** product quality → wedding-industry
  fit → lightweight financial/admin discipline → growth and monetization
  (parked, not ignored).
- **Current goals:**
  1. Listings in every state before any marketing (all 50 states + DC meet
     coverage pass 1 as of 2026-10-20; the current stage still targets
     ~9,000 more venues and ~8,800 more vendors — the launch bar is an open
     owner decision, see `decisions.md`).
  2. Close the legal and data-safety blockers in `docs/legal-audit.md`.
  3. Make the couple product worth coming back to (`docs/retention.md`).

No measured traffic, signup or conversion data exists yet beyond admin counts
(see `metrics-catalog.md`).
