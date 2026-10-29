# Save the Date Studio — plan and prototype (2026-10-29)

Status: **prototype, awaiting owner approval.** Nothing is live: the only
route is `/save-the-date/prototype`, which returns 404 in production.

## What exists and is reused

- **Fonts:** `FONTS` / `fontsHrefFor` in `src/lib/site-design.ts` (60 Google faces, loaded as a
  stylesheet, never at build time).
- **Art:** the public-domain botanical cut-outs in `public/site-art/` (see
  `docs/site-art-sources.md`), plus new line art drawn in code (`src/components/save-the-date/art.tsx`).
- **Export:** the monogram download's font embedding (`fetchFont` in `src/lib/monogram-download.ts`).
- **Calendar:** `downloadIcs` in `src/lib/ics.ts`.
- **Still to wire:** guest codes and personal links (`invite_code`, `personalRsvpPath`), Resend
  sending (`sendBulkRsvpInvites` pattern), the photo library and `shrinkImage`, and the Contact
  Collector for addresses.

## Architecture decisions

1. **One SVG renderer for everything** (`card-svg.tsx`). A card is drawn on a 1000 × 1400
   artboard (5×7). The same drawing serves as the gallery thumbnail, the editor canvas, the guest
   reveal, the PNG (3000 × 4200) and the PDF (5×7 in at 600 dpi). What the couple designs is
   exactly what guests receive. The card is never stored flattened.
2. **Templates are data:** a list of layers bound to the couple's details, colour *roles* and font
   *roles* (`src/lib/save-the-date/templates.ts`). Every colourway and font pairing therefore works
   on every layout. Switching templates keeps everything the couple typed.
3. **The couple's card is template + content + palette + fonts + photo + per-layer overrides**
   (move, size, font, colour, hide). It will save as one jsonb, validated with zod like
   `site_designs`.
4. **Long text shrinks to its layer's width.** It never runs off the card (tested with
   21-character names and a 50-character place).
5. **No new dependencies.** Export draws to a canvas in the browser, and the PDF is written by hand
   (one image on one page). Nothing runs on the Worker, so the 10 ms CPU limit isn't touched.

## Design system for cards

- **Colour roles:** paper, ink, accent, muted, onPhoto, plus optional *metal* (three stops) that
  paints the accent as foil. Each template has three curated colourways.
- **Font roles:** display, script and sans, with three curated pairings per template. Advanced
  mode can set any of the 60 faces on any single text layer.
- **Rules:**
  - one hero element per card (photo, names or artwork, never two competing);
  - small type is never set below 15 units, about 7.5 pt in print;
  - tracking of 0.25–0.45 em on small caps;
  - type on photos gets a scrim, never a box.

## The 24-template lineup (2 per family, distinct compositions)

Names shared with a guest-site template let one choice style both the card and the site.

| Family | Template 1 | Template 2 |
| --- | --- | --- |
| Editorial luxury | **Editorial** ✅ full-bleed photo, oversized didone | Gallery: photo in a white mat with a museum-label caption |
| Romantic florals | **Heirloom Garden** ✅ antique botanicals, scalloped frame | Peony Cameo: oval photo window crowned with flowers |
| Full-bleed photo | Golden Hour: script names across the photo | Contact Sheet: three photos in a strip, typed caption |
| Modern minimalist | Swiss: asymmetric grid, huge date numerals | Whitespace: one centred line, tiny type, lots of air |
| Rustic botanical | Laurel Arch: laurel line-art arch on kraft | Pressed: a single sprig "taped" like a pressed flower |
| Mediterranean | Riviera Tile: painted majolica border with lemons | Postcard: stamp, postmark carrying the date, airmail edge |
| Vintage & retro | Seventies: bold wave bands and a setting sun | Hotel Label: deco luggage-label badge |
| Celestial & black tie | **Midnight Arch** ✅ gold line art, moonlit sea | Deco Gala: Art Deco fan frame, champagne foil |
| Whimsical garden | Wildflower Bow: meadow border tied with a ribbon | Garden Party: gingham with scattered cherries and lemons |
| Coastal & beach | Tide: hand-drawn wave lines, sand palette | Shoreline: photo above a tide-line band, type below |
| Western & ranch | Homestead: wood-type poster | Brand: cattle-brand monogram, rope border, suede tones |
| Classic traditional | Engraved: formal centred serif, crest monogram | Calligraphy: formal script, deckled edge |

## UX

- **Simple mode** (default): pick a design, type details, pick a colourway and lettering, adjust
  the photo. There are no layout controls to get wrong.
- **Advanced mode:** drag anything; size, nudge, font and colour per layer; hide/show layers;
  undo/redo (typing in a field coalesces to one step).
- **Desktop:** designs on the left, the card in the middle, settings on the right. **Phone:** the
  card is the page, with a five-tab tool bar opening sheets, and the card shrinks above an open
  sheet so changes stay visible.
- **Preview as a guest:** a phone or desktop frame with the real reveal.
- **Guest reveal:**
  - an envelope addressed to the guest, sealed with the couple's initials;
  - opening it lifts the flap, slides the card out and settles it;
  - then Add to calendar and See our wedding website;
  - reduced motion opens straight to the card.

## Phases

1. **Prototypes (this branch):** three templates, the editor, export, the reveal. ← approval
   needed.
2. **Library:** the remaining 21 templates in batches of 6–7, each batch previewed. A screenshot
   QA script covers every template × long names × no photo × 375 px / 1440 px / export.
3. **Real data:**
   - a `save_the_dates` table plus RLS, with autosave drafts;
   - names, date and place prefilled from `weddings`;
   - photo library and upload, with crop;
   - nav, dashboard box and landing demo.
4. **Delivery:**
   - guest page `/w/[slug]/s/[code]`, which shows only the card;
   - the website button goes through the existing `/i/[code]` gate;
   - per-guest copy link / share sheet (free);
   - email through Resend with the card image and personal link;
   - an explicit review-and-confirm step, plus resend.
   - Statuses are only what we can know honestly: *sent* and *opened the card* (the guest loaded
     their link). There's no tracking pixel.
5. **Polish:** per-template envelope liners, a social preview image, and save-the-date → invitation
   suite matching.

## Owner decisions needed

- Approve (or redirect) the three directions and the SVG engine.
- **Email volume:** sending to 150 guests at once may exceed Resend's free daily limit. Options:
  send in daily batches, or move to the paid plan when sending launches.
- Should "Made with You Do, I Do" appear under the guest's card?
