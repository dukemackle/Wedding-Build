@AGENTS.md

# Business Advisor Mode: Wren

Wren (wrenwed.com) is a wedding-planning SaaS: a couple-facing app (guest list,
budget, seating/venue layout, itinerary, checklist, vendor/venue discovery) plus
an admin panel (admin.wrenwed.com) for tracking couples, vendors, venues,
revenue, and growth. Current stage: **pre-launch, not yet monetized, no outside
users** — the owner is still building and testing solo.

**Workflow note (2026-09-13, amended 2026-09-14):** for any visual/UI
change (icons, layout, colors, mascot art, etc.) or any bigger/riskier
change, render a preview (screenshot or generated image) and/or confirm
the plan with the owner before committing/pushing — don't ship-then-show.
Simple text-only or logic-only fixes (copy edits, a stat/label swap,
small server-action tweaks, migrations, RLS) can just be shipped directly
— no need to check in first for those.

**Deployment note (2026-09-12):** production deploys to Cloudflare Workers
run through the Cloudflare dashboard's Git integration (Settings → Build),
not a committed CI config. The Build command must be `npm run cf:build`
(runs `opennextjs-cloudflare build`, producing `.open-next/worker.js`) —
the dashboard default of plain `npm run build` looks fine in Settings but
leaves that file missing, so the deploy step fails with "entry-point file
... was not found." Hit a case where the Settings page showed the correct
`npm run cf:build` but every actual build still ran `npm run build`
underneath — fixed by disconnecting and reconnecting the Git repository in
Settings (a plain Settings save wasn't enough to make it stick). If deploys
silently fail with that error again, check this first.

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

## Competitive landscape (researched 2026-09-14)

Standing instruction from the owner: know these products well, and while we
build, proactively flag what Wren is missing, what a competitor does better,
and where Wren can beat them. Don't wait to be asked. Treat the notes below as
a living snapshot — correct them when research or real usage contradicts them,
and re-research rather than trusting these details indefinitely.

**The Knot / WeddingWire** (same parent, The Knot Worldwide). 300k+ US vendor
listings — the largest directory, and the real moat. Planning tools are free
loss-leaders; revenue is vendor advertising (~$200–400+/mo per vendor).
Registry auto-syncs ~10 named retail partners. Strongest in small markets where
they're the only directory with coverage.

**Zola.** Registry-first, expanded into the cleanest all-in-one. Free: website,
guest list (addresses, RSVP, meals, song requests), budget tracker with
allocation suggestions and automatic payment reminders, checklist, vendor
directory (smaller than The Knot's, urban-concentrated). Paid: seating chart
(~$15), guest texting (~$80). Has "Predictive Planning" (warns you'll overspend
based on guest count vs. budget) and an AI thank-you-note writer. Their
**Contact Collector** is the sharpest idea in the category: a shareable link
guests use to fill in their own mailing address and contact info, so the couple
never chases addresses.

**Joy (withjoy.com).** Best genuinely-free guest-facing package; no ad-funded
product wrapped around it. Strong on the guest side specifically:
Accommodations page, hotel blocks with booking links, a free concierge that
negotiates group hotel rates, a weekend Schedule page, guest email by tag, and
paid SMS ("Messaging Plus").

**Minted.** Paper/invitations first, free website attached.

**Wedding Spot.** Venue search with price estimates — the closest thing to a
direct competitor for Wren's estimator.

**Google Sheets / Excel — the real incumbent.** Most couples still run budget
and guest list in a spreadsheet. Notably, the common advice in 2026 roundups is
"use Zola or The Knot *plus* a spreadsheet for budget," which means every big
platform's budget tool is weak enough that people leave it. That is Wren's
opening.

**Where Wren genuinely wins today:** the budget (regional/seasonal/style-tier
estimates, actual-vs-paid per line, per-payer splits, due dates, hideable
categories) is already deeper than what the big players ship, because for them
it's a funnel, not a product. Wren also takes nothing from couples *or*
registries — Zola's "free" is funded by a registry cut, so "actually free" is a
claim Wren can make honestly and they can't.

**Where Wren cannot win right now:** vendor/venue discovery. That's the
marketplaces' strongest ground and their moat is 15+ years of vendor density,
not software. With no real vendors listed, head-to-head venue search loses on
inventory regardless of filter quality. Treat listings as a supporting feature
for couples already using Wren, not the front door. The front door is the free
estimator — the one thing that gets a stranger to enter real details before
committing to anything.

**Known feature gaps, roughly by value-per-effort** (re-check before acting;
some may have shipped since this was written):
- *Guest messaging* — **parked by the owner 2026-09-17; don't re-propose it
  unprompted.** `src/lib/sms.ts` and guest SMS opt-in already exist but only
  fire on itinerary changes. Competitors charge ~$80 for broadcast texting and
  Wren could include it, but it's the one gap on this list with a real
  recurring cost: Twilio bills per ~160-character segment, so a 200-character
  message to 150 guests is 300 segments — a genuine charge against an app with
  no revenue, behind a button someone presses the night before a wedding.
  Before it could ever ship it needs (a) confirmation that Twilio is
  configured in production and off a trial account (trial accounts only text
  verified numbers, so a broadcast would silently fail for nearly every
  guest), and (b) an owner-chosen send cap plus a visible "this will send N
  segments to M guests" confirmation. Both are the owner's calls, not
  assumptions to make.
- *Seating chart PDF export* — Zola charges for this. `/itinerary/print` is
  already a working print-route pattern to copy.
- *Registry retailer sync* — big integration lift, low strategic value; skip.
- *Hotel-block concierge* — an operations business, not software; skip.

**Shipped since this list was written** (2026-09-15) — don't re-propose these:
guest-site travel/accommodations, dress code, directions/parking and FAQ
sections (all on `/w/[slug]`); the Contact Collector (`/w/[slug]/contact` plus
the approval panel on `/guests`); the gift log and AI thank-you drafting
(`guests.gift_description` / `thank_you_note`, drafted through
`src/app/guests/thank-you-actions.ts`).

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
- **Proactively flag risks before the owner has to catch them** (2026-09-14):
  data-quality problems (e.g., garbage-in-garbage-out on anything crowdsourced
  or user-submitted), copy/claims that no longer match what the product
  actually does (e.g., a "100% private" claim after adding an aggregate-data
  feature), and stale or redundant content — don't wait to be asked, and don't
  wait for the owner to spot it first.
- Update this section as the business evolves (monetization model gets picked,
  real users show up, priorities shift) — it's meant to stay current, not be
  written once and stale.
