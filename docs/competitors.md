# Competitive landscape

Read this when the conversation is about what a competitor does, what Wren is
missing, or where Wren can win. Kept out of `CLAUDE.md` because it's reference
rather than a rule, and `CLAUDE.md` costs tokens on every single message.

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
`src/app/guests/thank-you-actions.ts`); the couple's photo gallery on the
guest site, and the moderated guest photo wall with a printable table-card QR
code (`/w/[slug]/share`, `guest_posts`, `/guests/table-card`).
