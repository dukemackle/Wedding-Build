# Design decisions and preferences

Durable choices the owner has explicitly approved or rejected, so future work
builds on them instead of re-asking. Record only explicit approvals or
rejections, not passing remarks. Newest first within each section. Each
entry: date, decision, reason, and where it's applied.

Brand-level rules already in `CLAUDE.md` (palette, colour roles, widths,
two designs per screen size, Venues/Vendors full-bleed) are decisions too.
They're summarised here only by reference; CLAUDE.md is the source.

## Approved directions

- **2026-10-22 (latest):** Venues without photos show a category
  drawing, not a stock photo: one drawing per category (15), navy line art
  on an Aqua sky with white buildings and one Gold accent. Rejected: real
  stock photos per category (couples could mistake them for the venue, and
  they take away a reason to claim). Files: `public/venue-types/`, mapped
  in `VENUE_TYPE_DRAWINGS` (`src/lib/wedding-options.ts`).
- **2026-10-22 (later):** Venue map pins are "badge pins": every venue gets
  its category icon in a gold disc on a navy pill, then its capacity when
  known, with a tail pointing at the spot (no more bare dots for venues
  without a capacity). Hovered pins turn Royal blue; saved ones show a gold
  heart. Below city zoom, dots on all maps are small rings (coloured band,
  gold centre). The Venue type filter shows the same icons and is
  multi-select. Rejected alongside: teardrop pins (crowd in dense areas) and
  photo pins (most listings lack photos). Icons: `src/lib/venue-type-icons.ts`.
- **2026-10-22:** Venue categories: 15 replace the six venue types, in
  this order: Barn & Farm; Ranch; Historic Mansion & Estate; Chapel &
  Church; Ballroom; Hotel & Resort; Garden & Park; Lake & River; Mountain &
  Lodge; Beach & Coast; Vineyard & Winery; Restaurant & Brewery; Country Club
  & Golf; Industrial Loft & Warehouse; Museum, Gallery & Rooftop. Every venue
  re-sorted (`src/lib/venue-category.ts`, migration 0137); ocean-front
  hotels count as Beach & Coast. Guest sites get "layout families": 8
  families, each shared by related categories, each its own page layout
  plus per-category colours, fonts, photos and art. First four mocked and
  approved: Field Notes (Barn & Farm, Ranch), Grand (Ballroom, Hotel &
  Resort), Shoreline (Lake & River, Beach & Coast), Gallery (Industrial Loft
  & Warehouse; Museum, Gallery & Rooftop). Mockup:
  https://claude.ai/artifact/HCim7sNFtMsZ9wdj6oRiyZ
- **2026-10-22:** Planning pages (budget, guests, checklist, itinerary,
  layout, registry) keep their layouts but get livelier: a `PageHeader` with
  the landing box's photo (slow drift), a headline with an italic royal-blue
  end, and one line; no couple names, countdown or headline stat (owner cut
  those). Drawn icons replace emojis, the main "Add …" action is a gold pill
  with navy outlines for the rest, bolder headings, rows rise in, and Wren
  cheers small wins (paid in full, everyone seated, RSVP milestones).
  Mockup: https://claude.ai/artifact/LP1zF42bXSm1SKy9aF5KBE
- **2026-10-22:** Public nav's business link is a thin outlined "List your
  business" pill (was "For businesses"), and the hero carries "Venue or
  vendor? Claim or list your business free" under Start planning. Logged-out
  Save / Request a quote on venues and vendors open a sign-up sheet over the
  page (bottom sheet on phones, centred on desktop) and the listing finishes
  the action after signup (`?then=`, via /start for a new account).
  Browsing stays open; no sign-up wall. (`signup-sheet.tsx`, `public-nav.tsx`)
- **2026-10-22:** Landing closes with a full-width photo band (lawn table,
  "Ready when *you are.*", yellow Start planning) in place of the gold
  CtaCard, and the landing feature boxes open with real Unsplash wedding
  photos instead of the dashboard drawings (the dashboard keeps its own art;
  each box still opens its demo). Not adding more boxes: they mirror the
  dashboard's ten. Estimator's "See the full breakdown" link is back.
- **2026-10-21:** Landing hero is now direction B: full-width wedding
  photographs as a slow crossfade slideshow (four bright reception tables and
  the sunset couple, all Unsplash, each credited on the photo) with the nav
  clear and white over it, headline "Wedding planning, *made easy.*" (the
  owner's line; "The easy way to *I do*" was the step before), "Everything
  you need to plan your wedding. Free for couples." and one "Start planning"
  button; the estimator sits under it with Style as
  three buttons and one "Use this as my budget" button. Nav simplified to
  Venues · Vendors · For businesses · Log in (signing up moved to the page's
  own buttons; a menu on phones). Replaces the 2026-10-20 direction A below,
  which the owner felt didn't read as a wedding site and had too many words.
  Rejected: an invitation-style hero with the site-art florals. Mockup:
  https://claude.ai/artifact/Nk7e6ynP1YcrYgQvUdSKS4
- **2026-10-21 (later):** Maps moved to our own tiles on R2 with the Protomaps
  **light** style, the closest of Protomaps' styles to full colour (blue
  water, green parks, road shields). The owner chose our own files over
  Liberty knowing it's a bit greyer. Liberty is one line away in
  `src/lib/map-tiles.ts` if it ever needs to come back.
- **2026-10-21:** Maps use the full-colour OpenFreeMap **Liberty** style.
  The grey Positron was rejected as "depressing and untrustworthy". When the
  maps move to our own Cloudflare-hosted tiles, pick the closest full-colour
  style. Applied in `src/lib/map-tiles.ts`.
- **2026-10-21:** Guest-site editor simplified: one Design tab (templates +
  colours, no Theme grid), Wren removed from the builder, Sections second in
  the rail with Edit buttons, template flowers/extras optional (off by
  default, photo-first), and a "Finish your site" step list. Recommended
  options picked by the owner; see docs/guest-site-editor.md.
- **2026-10-21:** Art review result: keep 13 pieces (the painted rose,
  white roses, wild roses, mallow, sweet pea and lemons; the eucalyptus and
  lavender engravings; the diamond, heart and laurel dividers, rings and
  corner flourish), cut the other 38, including every simple icon-style
  drawing. Templates that used cut art now have none (Garden Party moved to
  the eucalyptus engraving). Applied in `SITE_ART` and `site-templates.ts`.
- **2026-10-21:** Guest-site signature templates: build fewer, better
  templates, each laying out the whole page its own way rather than
  recolouring one skeleton. First three from the mockup
  (https://claude.ai/artifact/7PfnLaRR3YrcaxYqVwm8ax): Heirloom (invitation
  page style, painted roses), Editorial (magazine page style) and Riviera
  (postcard page style). Same day, the owner approved free stock photos
  (template samples and an in-editor photo search, after a licence check)
  and a keep-or-cut review of the existing art
  (https://claude.ai/artifact/2qpGBE5DeeCzKbskYx1MnG). Applied in
  `PAGE_STYLES` (`src/lib/site-design.ts`), `section-layout.tsx` and
  `site-templates.ts`.
- **2026-10-21:** `/data-sources` page in the Privacy page's style (READING
  width, eyebrow + display heading, one bordered list of sources), linked
  from the footer as "Data sources". Applied in `src/app/data-sources/`.
- **2026-10-21:** Estimator extras: service charge, sales tax, tips and a
  cushion for surprises sit apart from the vendor bar chart in a
  gold-bordered "On top of vendor prices" box, with how each was worked
  out. Reason: these are what couples leave out of a budget. Applied in
  `src/app/estimate/estimator.tsx`.
- **2026-10-20:** Landing hero is direction A, "the product is the hero":
  headline "Everything before “I do,” made a whole lot easier." (the brand
  line), the live estimator as the gold card, a dashboard glimpse behind it
  on desktop, and a facts row (live venue/vendor counts, 50 states and DC,
  free for couples) instead of the count-up stats. Rejected: an editorial
  stock-photo hero (B, looks like The Knot/Zola and needs licensing) and a
  typographic rings-first hero (C, says least about the product). Mockup:
  https://claude.ai/artifact/QyvNJE735cjYK7Rf8XDWzi
- **2026-10-21:** Dashboard next-step card becomes a status, not an order:
  "Your planning path / 3 of 6 done", what's open as quiet links ("Still to
  book: Photographer · DJ or band", filtered Vendors), same six-step tracker.
  Rejected: the command headline ("Book your photographer"), the "why" advice
  line and the big action button; the owner found them bossy. Supersedes the
  2026-10-20 entry's copy, not its placement or gold.
- **2026-10-20:** Dashboard "Your next step": one gold-bordered card above
  the tiles (the page's only gold; the gold tile ring was removed), naming
  the step and why it comes now. Path: venue, date, guest list, key vendors
  (caterer, photographer, DJ or band), guest site, RSVPs; basics (state and
  headcount) come first, the checklist after. Not dismissable. Rejected:
  a reason line on the gold tile; reordering tiles by stage. Mockup:
  https://claude.ai/artifact/UMLSoXHjivMK76zVXgR5yZ
- **2026-10-19:** First-run setup is Direction A: Wren asks five questions,
  one per screen, only the names required; the desktop shows the dashboard
  filling in beside the question; it ends on the couple's budget estimate as
  the page's gold moment plus three ordered first steps. "Roughly when" is
  season only (no year column). The dashboard's existing form stays for
  editing. Rejected alternatives: a shorter single form (B), no setup at all
  (C). Mockup: https://claude.ai/artifact/MKwFy2KT4NiNuEYcZDVH9T
- **2026-10-19:** Keyboard focus is a deep-gold ring (`#9a6b00`, bright Gold
  on navy fills, soft gold halo on fields); 404 and error pages are a
  centred card with Wren idling, a mono eyebrow, a display heading and two
  actions (`src/components/lost-page.tsx`). PR #896.
- **2026-10-11:** Guest site "Your designs" gallery + template gallery
  modelled on Canva's "Continue designing" (docs/guest-site-editor.md).
- **2026-10-08:** Guest-site Editor v2: free placement *within* sections on
  a snapping grid, separate phone layouts, reversing the earlier "no
  free-form canvas" rule. Mockup:
  https://claude.ai/artifact/NTyvaB5B6VAdyV2sFx4abw
- **2026-09-28:** New palette (Lemon, Gold, Royal, Sky, Aqua); gold = You Do,
  I Do's highlights on white, blue = Wren on navy; one or two highlights per
  page. (CLAUDE.md)
- **2026-09-27:** Rebrand to You Do, I Do: wordmark, linked rings with a
  diamond, navy + Sunshine. Wren remains the assistant. (CLAUDE.md)
- **2026-10-21:** Admin Home: "Needs you" queue first (empty queues on one
  "All clear" line), then KPI cards with definitions; coverage and health
  in a right column on desktop (WIDE width), one column on a phone.
- **2026-09-27:** Guest-site editor: desktop panel + live preview, phone
  sheet; draft and publish. Mockup:
  https://claude.ai/artifact/XR8AQDdZnMSokSc9sqZLDk
- **2026-09-22:** Venues/Vendors as Zillow-style full-bleed browse;
  five-width page scale. (CLAUDE.md)
- **2026-09-20:** Desktop and mobile are two designs, not one that
  stretches. (CLAUDE.md)

## Rejected

_None recorded yet._

## Typography preferences

- Cormorant (display), IBM Plex Sans (body), IBM Plex Mono (numbers,
  eyebrows). In place since before this log; no explicit re-approval needed
  to keep them, approval needed to change them.

## Animation preferences

- Subtle, short, CSS-first; reduced motion always honoured (existing code
  and docs/guest-site-editor.md).

## Component conventions

- Cards separate from the page by shadow, with hairline borders, on a warm
  white base (globals.css header comment).

## Copy and voice

- See the `wren-voice` skill.
