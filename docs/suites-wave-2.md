# Suites, wave 2: proposal (2026-11-10)

Status: **Proposed**, waiting on the owner. Source: about 60 Pinterest, Etsy-style and Zola
references the owner sent on 2026-11-10. This builds on wave 1 (8 suites, DESIGN-OPPORTUNITIES
row 28, PR open on `claude/ecstatic-noether-sgudgf`), so nothing here starts until that merges.

Rule for every suite: our own drawings, or public-domain paintings logged in
`docs/site-art-sources.md` (as Heirloom does). Take the pattern, never the artwork. Zola's designs
(Harlow, Bloomsbury, Buxton) are a direct competitor's, so keep further from them than from the rest.

## What we already have (checked in code)

- 24 save-the-date templates, some close to the references: Tide (waves on sand), Shoreline
  (photo cut along a wave), Seventies (retro), Calligraphy and Whitespace (type only),
  Engraved (laurel crest monogram), Laurel Arch, Pressed (herbarium), Heirloom (antique painted
  botanicals).
- Card engine: text on a curve, arch/oval/wave photo shapes, a paper grain filter, every fixed
  line's wording editable per layer, long names shrink to fit, optional back with details and an
  RSVP QR code. One shape only: 5x7 portrait.
- Guest site: tabs or one long page, password gate, countdown, monogram, dress code (text only).
- Not there: hashtag field, dress-code colours, a phone-shaped card, right-to-left languages,
  any cultural design.

## Recommended suites (card + matching site), in build order

1. **Highland** (the Landscape family; the owner's favourite). A muted moorland: olive and brown
   hills, golden grass in loose strokes, and a painted sky gradient that runs behind the whole
   site. Later scenes reuse the same parts: pine forest, vineyard hills with cypress, alpine lake,
   city skyline, outdoor ceremony arch. Three placements: footer band, full scene (art fills
   about 2/3 of the card), small vignette above the names. Seasonal colourways (summer, autumn,
   winter). **Build first as the test**: the sky texture and grass strokes are the hard parts
   every other scene reuses.
2. **Gilded.** Gold line-art flowers (magnolia, orchid, blossom branch) that run off one edge, with
   a framed or left-aligned text panel. One set of drawings, many colourways: gold on white or
   cream; gold on sage, terracotta, chocolate or emerald; white lines on dark; blue ink on cream.
   Line art is what we draw best. Replaces both "Magnolia" and "Gold engraved trees".
3. **Wildflower, upgraded** (existing suite). Draw single stems once (poppy, cornflower, cosmos,
   lavender, daisy) and let the layout arrange them: wreath, side arcs, corner, top garland,
   scatter, all-over pattern behind a panel. Two moods from the same stems: soft vintage and bright
   bold (the bright one had the most saves of anything sent).
4. **Signature.** Type only: big script or tall condensed serif names, small spaced capitals, a
   stacked or three-box date row, optional "text behind a stem" layering. Cheapest: mostly a
   matching site for the existing Calligraphy and Whitespace cards.
5. **Desert Arch.** A solid arch panel holding the text, dried flowers overlapping one side.
   Terracotta, dusty blue and sage arches (same flowers, so colourways are cheap). Check that white
   text on the paler arches passes contrast. Must look clearly different from Laurel Arch and
   Golden Hour.
6. **Silhouette.** Big flat botanical shapes in one colour (black, sage, terracotta, navy) on a light
   card, or reversed on dark. Modern, striking, very cheap to draw.
7. **Eucalyptus.** Soft watercolour greenery, sage and white. The best-selling look in the market;
   uses public-domain greenery paintings like the existing site art.

**Folded into existing suites, not new ones:**
- "Conservatory" (detailed painted flowers, cream or emerald) becomes new colourways of
  **Heirloom**, which already uses antique painted botanicals. Emerald + gold is the black-tie gap.
- The beach references become a **Tide** suite (card exists; add a site with a brushstroke sea
  footer). Lemons and olives go into **Riviera** as art options.

## Add-ons, ranked by value for the effort

1. **Flat-lay opening** (the Canva site): after the envelope opens, the couple's suite lies on a
   table (invitation, save the date, details and RSVP cards, stamps), and each piece is a real,
   labelled link to that part of the site. Phones get their own stacked or swipe layout. This joins
   the cards and the site better than anything competitors do.
2. **Envelope liners and wax seal:** a patterned liner per suite instead of the one stripe, and a
   wax seal with the couple's monogram (the monogram already exists).
3. **Paper finishes:** smooth, cotton, aged parchment, on any suite (the grain filter exists).
4. **Site details:** a small motif from the suite above each section heading; art pinned to the
   corners and fading into the page; a dark wash behind text on art-heavy sites (contrast); photo
   strip of three as a hero option.
5. **Dress-code colour swatches**, filled from the suite's colours; a **hashtag** field.
6. **Other events from a suite:** engagement party, shower, rehearsal dinner, confirmation. Wording
   is already editable per layer, so this is mostly an "event" preset.
7. **Phone-shaped card (9:16)** for texting and posting. Bigger: every template is laid out for 5x7.
8. **Small checks:** a separate reception venue on the card; never "bride/groom" in fixed wording
   or field labels; test new fonts with accented names (José, Zoë) and symbols.

## Parked

- Venue sketch from the couple's photo: a paid custom option, which conflicts with Phase 0
  "completely free" in `docs/monetization.md`. Owner's call, later.
- Music on the save-the-date site: tap-to-play only, plus file hosting cost. Owner's call.
- Realistic watercolour landscapes (alpine peaks, aerial surf): beyond what we can draw; the
  stylised versions above stand in.
- Right-to-left languages (Arabic, Hebrew): don't build now, but keep the card wording editor free
  of left-to-right assumptions so it can be added later. Expensive to retrofit.

## Still missing from the research

Cultural designs (Indian, Mexican, Chinese, Jewish, Nigerian, Filipino) are the biggest gap, then
the other printed pieces (details card, menu, place cards, program, welcome sign), whimsical
couple-portrait styles, and nautical.

## Decisions for the owner

1. Approve the list and order (or cut any).
2. OK to build a Highland card + site as the first preview, after wave 1 merges.
3. The two parked calls (venue sketch, music) can wait.
