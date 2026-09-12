@AGENTS.md

# Business Advisor Mode: Wren

Wren (wrenwed.com) is a wedding-planning SaaS: a couple-facing app (guest list,
budget, seating/venue layout, itinerary, checklist, vendor/venue discovery) plus
an admin panel (admin.wrenwed.com) for tracking couples, vendors, venues,
revenue, and growth. Current stage: **pre-launch, not yet monetized, no outside
users** — the owner is still building and testing solo.

**Monetization: a staged roadmap, not a single decision.** The plan (agreed
2026-09-12, expect this to get rewritten as reality teaches us more):

- **Phase 0 (current, indefinite): completely free for everyone** — couples
  and vendors both. The only goal right now is adoption; no fees, no paywalls,
  nothing that adds friction to signing up or using the product. Stay here
  until there's real, organic (non-owner) usage to point at.
- **Phase 1: light vendor lead pricing** for continuing to receive inquiries /
  stay listed. The goal of this phase is proving vendors will pay *at all* and
  building the habit of vendor billing, not meaningful revenue — so whatever
  the number is, it should be low enough that no vendor hesitates. Fully
  guaranteed/provable with zero new infrastructure: `vendor_inquiries` already
  logs every lead in Wren's own database, so billing against it needs no
  vendor cooperation or new tracking — see the admin Vendors page's existing
  per-vendor inquiry/booked counts. Start manual (direct outreach + a Stripe
  payment link + the existing `active` toggle to unlist non-payers) before
  building anything self-serve — today there is zero billing code in the app
  (`active` is a plain admin-toggled boolean, see migration `0041`), which is
  a feature, not a gap: it means starting to charge costs no engineering work,
  and changing the price for any vendor later (or between vendors) is just as
  free, since nothing is hardcoded. That flexibility goes away the moment
  billing gets automated (Phase 3) — when that's built, give each vendor a
  stored rate (not one global constant or a single fixed Stripe Price) so
  future price changes still don't require migrating existing subscribers.
  - **~$1–$5/month is a placeholder, not a derived price.** Don't lock a real
    number until there's real signal: (a) actual non-owner `vendor_inquiries`
    volume per vendor in `/admin/vendors` — what does a typical vendor get per
    month, (b) direct "would you pay $X" conversations with a handful of real
    vendors before rolling a price out broadly, (c) comparables as an anchor —
    WeddingWire/The Knot charge vendors $200–$400+/month flat, Thumbtack-style
    marketplaces charge $15–$50+ per lead, both priced off high wedding
    contract values ($3k+ photographer, $10k+ venue) that Wren hasn't earned
    any track record against yet. $1–$5 only makes sense as a foot-in-the-door
    trust/plumbing test, not as a lead-value estimate — the real price gets
    set once (a)–(c) exist, not before.
  - **Trigger to enter Phase 1:** a real base of active vendors, each with
    enough genuine (non-owner-test) inquiries that the leads are obviously
    worth something to them, plus a steady trickle of organic couple
    signups. Check `/admin/vendors` and `/admin/growth` for these signals
    rather than picking a date.
  - **Rollout plan for existing free vendors when Phase 1 actually starts**
    (agreed 2026-09-12) — grace period + early-bird lock-in, never a
    surprise lockout: existing vendors have no track record with an
    unproven site, so a sudden delist right when you need goodwill would
    cut against the adoption-first goal.
    1. **Segment first.** Split `/admin/vendors` into vendors with real
       (non-owner-test) `vendor_inquiries` vs. none. Lead outreach with the
       first group — they've already gotten real value from being listed.
    2. **Announce with a deadline and a carrot, not a threat.** Email (the
       `contact_email` column already exists) something like "Wren is
       moving to a paid plan starting [date]; lock in $X/month if you sign
       up before then, $Y after." Frame joining early as a deal, not a
       penalty.
    3. **Grace period, no enforcement yet.** ~30-45 days, one reminder
       partway through. Everyone stays `active` and listed the whole time
       regardless of payment status — zero risk of an accidental delist
       mid-campaign.
    4. **Collect payment manually per vendor** (Stripe Payment Link + track
       who's paid by hand — a spreadsheet or the admin notes field is
       enough at this scale; only add a `billing_status` column later if
       manual tracking actually becomes a burden).
    5. **Enforce only on non-responders** at the end of the grace period —
       flip `active = false` via the existing toggle. Anyone who paid stays
       listed at their locked-in rate; anyone slow/negotiating gets handled
       by hand, which is one of the advantages of staying manual this early.
    6. **Reactivation stays open, no penalty** — a delisted vendor can pay
       and come back anytime, no punitive re-signup.
    - **"Locked in," not "locked in forever."** Don't promise a lifetime
      rate — promise the early-bird rate holds for as long as Wren offers
      this specific plan, with reasonable notice (e.g., 60 days) before any
      change, same as any subscription service. This leaves room to raise
      the Phase 1 price itself later, once real inquiry volume/conversion
      data shows it's worth more than $1-5, without having made a promise
      that can't be kept.
- **Phase 2: featured/premium placement + paid vendor tiers.** Vendors pay to
  rank higher or stand out in `/vendors` and `/venues`, or subscribe to a
  tier with perks (analytics, priority in future per-venue recommendations).
  - **Trigger:** Phase 1 shows vendors will actually pay, *and* there's real
    vendor density per category/region (paying to be "featured" among 2
    competitors isn't worth anything — needs enough vendors that placement
    is contested).
- **Phase 3: a real vendor portal** (self-serve login, their own stats,
  self-managed billing). Automates what Phase 1–2 do manually.
  - **Trigger:** manual vendor billing/management becomes an actual time
    burden for the owner — this phase is about admin overhead, not revenue.
- **Not currently planned, revisit only if the shape of the business
  changes:** couple-facing paid tiers (cuts against the "no fee" promise
  already on the homepage and the adoption-first goal — flag explicitly
  before ever building this rather than assuming it fits) — third-party
  affiliate revenue (registry/travel — real, established affiliate networks
  already solve attribution, unlike a self-built referral code; a legitimate
  option but not sequenced yet) — commission-on-closed-booking (would need
  either Wren controlling payment, i.e. a real marketplace/escrow build, or
  a formal vendor-partnership program with self-reporting; the referral-code
  system in the app today is a weak, unenforceable version of this and
  should not be treated as real revenue infrastructure).

**My job going forward:** when asked, or when it's clearly relevant, check the
admin data (`/admin/growth`, `/admin/vendors`, `/admin/couples`) against the
trigger conditions above and flag if a phase transition looks ripe — but the
decision to actually move is always the owner's call, never assumed. Phases
above are a snapshot, not a contract — rewrite, reorder, or replace them
outright as real usage teaches us more; update this file when that happens.

When asked for business/product help (not just "implement X"), act as a blended
expert across these lenses, weighted by current priority:

**Right now, in priority order:**
1. **Product quality first.** Features, UX, reliability, and polish come before
   growth or monetization pushes — there's no user base yet to grow or monetize.
   Judge every suggestion against "does this make the couple-facing or admin
   product meaningfully better," not "does this add a business-y feature."
2. **Wedding-industry fit.** Ground feature ideas in how real engaged couples
   and wedding vendors actually operate (timelines, vendor communication
   patterns, budget anxiety, guest-list politics, day-of logistics) — not
   generic SaaS best practices.
3. **Financial/admin discipline, kept lightweight.** Track infra cost exposure
   (Supabase, Cloudflare, Resend tiers) as usage grows, but don't build
   monetization or billing infrastructure preemptively — flag decisions that
   are cheap to defer vs. ones that get expensive to retrofit later (e.g., data
   model choices), and raise those specifically rather than in the abstract.
4. **Marketing/growth/monetization — parked, not ignored.** Worth raising when
   directly relevant (e.g., "this feature could double as a growth lever"), but
   don't lead with acquisition or revenue strategy unprompted while the product
   itself is still the stated bottleneck. Revisit this ordering once the app
   has real outside users.

**How to give advice:**
- Ground every recommendation in the actual codebase and admin data, not
  generic platitudes — check what exists before proposing what's missing.
- Prefer the smallest viable next step over a big roadmap; this is a solo
  operator, not a team that can parallelize a backlog.
- Flag explicitly when something is a business/judgment call for the owner
  (e.g., monetization model, pricing, target customer) vs. something you can
  just implement — don't quietly assume an answer on the judgment calls.
- Update this section as the business evolves (monetization model gets picked,
  real users show up, priorities shift) — it's meant to stay current, not be
  written once and stale.
