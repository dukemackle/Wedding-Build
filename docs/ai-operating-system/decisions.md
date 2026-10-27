# Decision log

Business and product decisions by the owner. Design decisions live in
`.claude/skills/design-expert/DECISIONS.md`; standing rules stay in
`CLAUDE.md`. Newest first. One entry per decision:

```
## YYYY-MM-DD — <decision>
- Decided: <what>
- Why: <reason>
- Alternatives: <what else was considered>
- Revisit: <trigger or date, if any>
- Outcome: <filled in later>
```

Earlier decisions with dates are in `CLAUDE.md` (rebrand, palette, shipping
rules, batch self-merge, 50-state coverage, page widths) and
`docs/legal-audit.md` "Owner answers (2026-10-19)". They aren't copied here.

## Pending owner decisions
- None open.

## 2026-10-22 — When a launch metro is "done"
- Decided: every core vendor category at its target; at least 90% of the
  metro's venues show capacity and price tier; every listing's website
  re-checked within 90 days. Photos are not part of the bar (separate
  project, San Diego and Austin first). San Diego goes first: 150+ venues.
- Why: the owner saw San Diego County thin on the map (~53 venues in view
  against several hundred real ones).
- Revisit: once San Diego and Austin meet it.
- Outcome:

## 2026-10-22 — Founding businesses: notice and an unnamed discount
- Decided: outreach says "Listing is free today. If we ever introduce paid
  plans, founding businesses get at least 60 days' notice and a founding
  discount." The discount's size and length stay unnamed until there's a price.
- Why: replaces "free listing for life" (withdrawn 2026-10-21, could block
  monetization); matches the 60-day notice and early-bird rate already in
  `docs/monetization.md`.
- Alternatives: name the discount now (e.g. 50% off year one), more persuasive
  but commits early; promise nothing beyond "free today".
- Revisit: when Phase 1 pricing is set; have the attorney check the sentence
  before the first invitation.
- Outcome:

## 2026-10-22 — "Booked by couples who married here" on venue pages (parked)
- Decided: once real weddings have happened, venue pages show vendors past
  couples booked there, kept apart from the venue's own preferred list and
  worded as history, not a recommendation. Categories where the venue
  requires its own vendors (`venue_preferred_vendors.required`) are hidden
  automatically, and claimed venues can turn the section off. It's off for
  unclaimed venues. Only weddings whose date has passed count, and a vendor
  shows only after 2–3 couples have booked them, so no single couple's
  choices can be worked out. The same data adds "Worked at: <venue>" to
  vendor profiles.
- Why: "vendors who've worked this room" is a signal competitors don't
  have, and the data is already captured (booked venue, 0051; booked
  vendors linked via budget lines, 0052). Hiding categories the venue
  requires, plus the off switch, avoids fights with venues that pick
  vendors for couples.
- Alternatives: on by default everywhere (risks upsetting venues); merge it
  into the venue's own list (blurs whose recommendation it is).
- Revisit: when enough real weddings have passed to fill the lists. Before
  building, check that the privacy terms cover this use, and keep booked
  vendors linked by ID, not by typed-in names.

## 2026-10-21 — Launch metros: Austin, San Diego and seven large markets
- Decided: `LAUNCH_METROS` in `scripts/coverage-plan.mjs`, in priority order:
  Austin, San Diego, Dallas–Fort Worth, Houston, San Antonio, New York City,
  Los Angeles, Chicago, Miami. Owner asked for 5–10 top US metros with Austin,
  then added San Diego (home city, so the easiest place to reach couples and
  vendors in person); the rest are the largest markets that already have the
  most vendors (119–176 each).
- Why: widens the "2–3 deep metros" bar below. Four are in one Texas region
  reachable from Austin; the other four are the biggest national markets.
- Alternatives: 2–3 metros only (less spread); Atlanta, Nashville, Denver
  (big wedding markets but 76–97 vendors and wide gaps).
- Revisit: if depth work in 8 metros is too slow, cut back to the Texas four.
- Outcome:

## 2026-10-21 — Map tiles from our own files on Cloudflare R2
- Decided: the maps read our own Protomaps files at `tiles.youdoido.com` (R2 bucket `youdoido-tiles`), not OpenFreeMap.
- Why: no third party can rate-limit, change or retire the base map before launch; fits R2's free tier.
- Alternatives: keep OpenFreeMap Liberty (more colourful, donation-funded, no SLA) with R2 as a backup.
- Revisit: if R2 reads leave the free tier, or the map's look needs more colour.
- Outcome:

## 2026-10-21 — Launch bar: pass 1 everywhere plus 2–3 deep launch metros
- Decided: coverage pass 1 in all 50 states + DC counts as "every state has
  listings". Breadth targets beyond pass 1 are frozen; batch work moves to
  depth (capacity, price tier, re-verification) in 2–3 launch metros.
- Why: 1 real couple and 0 outside claims against 19,800 listings; no photos,
  no vendor prices (executive assessment 2026-10-21).
- Alternatives: keep filling the stage-2 targets (~16,000 more listings).
- Revisit: when the first cohort's data is in.

## 2026-10-21 — Measurement: first-party usage events and Web Analytics
- Decided: the `events` table (migration 0130, PR #956) with
  `/admin/analytics` funnels, a per-couple "First cohort" table on
  /admin/growth, the Privacy line, Cloudflare Web Analytics and Google
  Search Console.
- Why: activation and retention can't be measured after the fact; the first
  5–10 couples need to be measured from day one.
- Alternatives: third-party product analytics (more data, more privacy
  surface); no measurement until launch.
- Revisit: add events as new questions come up; nothing a couple types is
  ever logged.

## 2026-10-27 — LLC approved
- You Do, I Do LLC (California) went through. Entity name now in the Terms,
  Privacy Policy, site footer and marketing-email footer.
- EIN obtained 2026-10-27.
- California $800 LLC tax (FTB 3522) due by 2027-02-15.
- Next (owner): business bank account, Form 1583 for the mailbox, assign
  domain/code/IP to the LLC in writing, DMCA agent ($6), insurance quotes.

## 2026-10-21 — Form a California LLC and get a public mailing address
- Decided: "You Do, I Do LLC", California, member-managed, single member,
  filed through Northwest Registered Agent (agent included the first year,
  then $125/yr; Northwest files the first Statement of Information). Order
  placed 2026-10-21, approval expected about 2026-11-02. Public business
  address: an Anytime Mailbox virtual mailbox in Encinitas, CA (Bronze,
  ~$110/yr), with USPS Form 1583 completed once the LLC is approved.
- Why: R4 (personal liability) in `docs/legal-audit.md`; DMCA agent filing
  and CAN-SPAM footers need a public postal address. Reverses the 2026-10-19
  "no PO box or virtual mailbox" answer.
- Alternatives: DIY on bizfile (home address public); Wyoming/Delaware (still
  pay California's $800/yr); Northwest Virtual Office ($20/mo); USPS PO box.
- Next: EIN at irs.gov, business bank account, Form 1583, then the entity
  name and address in Terms, Privacy and email footers, DMCA agent ($6),
  insurance quotes, Twilio A2P registration.

## 2026-10-20 — Install the AI operating system
- Decided: five read-only Sonnet specialist agents (`.claude/agents/`), with
  the main session as Chief of Staff; new skills `founder-briefing`,
  `business-audit`, `launch-readiness`; knowledge in
  `docs/ai-operating-system/`.
- Why: consistent company context and routing without paying for unused
  agents; existing skills kept as the specialists' tools.
- Alternatives: the 30-role catalog as separate agents (too much overlap and
  token cost); a chief-of-staff subagent (subagents can't call each other).
- Standing exceptions kept: batch-only PRs self-merge, text/logic-only fixes
  ship directly, PR opens once a preview is approved.
- Revisit: when there are outside users, or if an agent is never used.

## 2026-10-21 — Admin Home replaces Overview
- Decided: the owner approved the Home preview (blueprint #6) and asked for
  the sidebar link to read "Home". The queue comes first, then six KPI cards,
  each with its definition. There's no revenue card until revenue exists.
- Why: one page answers "does anything need me?" instead of four or five.
- Revisit: when the error log (#8) and spend page (#9) fill the "not tracked"
  health rows.

## 2026-10-22 — Attire affiliate pilot: build the plumbing
- Decided: the owner approved building the pilot from
  `docs/attire-affiliates.md`: a retailers table, a separate affiliate link,
  a "price checked" date, counted click-outs and the commission disclosure.
  No feed importer, sponsored placements or checkout.
- Why: the attire catalog already existed; this makes it ready for approved
  programs (Revelry, Brilliant Earth, Azazie, The Black Tux first) without
  showing stale prices or undisclosed affiliate links.
- Still the owner's: applying to Awin and Impact, and which programs to join.
- Revisit: 60 days after the first approval, comparing our clicks with
  network-reported sales.

## 2026-10-22 — Venue categories and guest-site layout families
- Decided: the owner approved 15 venue categories in place of the six venue
  types (every venue re-sorted; migration 0137), and guest-site "layout
  families": 8 families shared by related categories, the first four
  (Field Notes, Grand, Shoreline, Gallery) mocked and approved. Detail in
  `.claude/skills/design-expert/DECISIONS.md`.
- Why: finer categories for browsing venues, and a basis for designing guest
  sites per kind of venue.
- Revisit: after the remaining four layout families are mocked.

## 2026-10-22 — Venue price: store the published figure, not a tier
- Decided: the owner approved (1) recording each venue's published price and
  basis (`price_from`, `price_basis`, dated in `field_sources`) in batches,
  with Simple/Classic/Luxury derived from them (`tierFromPrice`) as an
  interim; (2) dropping the tier labels from the public UI once the launch
  metros have figures; (3) a "fits my budget" Price filter that signed-out
  visitors use by typing a guest count and signed-in couples get prefilled.
  Venues with no price stay in results as "Ask for pricing". The vendor price
  filter is removed until vendors carry prices.
- Why: a flat tier merges venue size with luxury (a 40-guest estate at $8k
  read "Classic"), a label like "Luxury" can put couples off a venue they
  could afford, and a sourced figure is easier to defend than our own label
  (legal-audit R5). Couples compare total cost for their guest count.
- Alternatives: relabel or shift the tier bands (keeps the size flaw); a
  separate "style" rating (subjective, no source; venue type and setting
  already cover feel).
- Next: cards show "From $X · basis · checked" in estimate wording; the
  budget filter; re-check the ~1,300 tier-only venues, launch metros first.
- Revisit: when the launch metros' share of venues with a price is known.
