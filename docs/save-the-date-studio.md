# Save the Date Studio — plan and prototype (2026-10-29)

Status: **approved 2026-11-03; all 24 templates built; the couple's own card saves (phase 3).**
The studio is at Guests › Save the date (`/guests/save-the-date`); it needs migration
`0155_save_the_dates.sql`. `/save-the-date/prototype` (404 in production) keeps the sample
couple and the QA sheets. Sending is not built yet.

## Suites (2026-11-10)

Eight designs are suites (`src/lib/suites.ts`): the save the date, its invitation and a guest-site
template, matched by colourway and font-pairing ids. Invitations and the site editor's Design tab offer
"Match your save the date". Golden Hour's invitation has its own light paper and sun (`OWN` in
`invitations.ts`), since its card is a full-bleed photo.

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
4. **Long text never runs off the card.** Places wrap at about a set number of characters; a
   long pair of names breaks at the "&" onto two lines (growing up, down or both ways, per
   layer); anything still too wide shrinks to its layer's width. Numeral layouts (Swiss) fall back
   to the written date when the couple has none (decorations tied to the numerals hide with
   them). Framed photo templates (Gallery, Peony Cameo) show the couple's initials until a photo
   is added. A photo frame can take its own crop of the couple's one photo (Contact Sheet uses
   three). QA sheets: `?view=gallery`, `gallery-long`,
   `gallery-nophoto` on the prototype route.
5. **No new dependencies.** Export draws to a canvas in the browser, and the PDF is written by hand
   (one image on one page). Nothing runs on the Worker, so the 10 ms CPU limit isn't touched.

## The back of the card (2026-11-04)

Optional, off by default ("Back of the card" in the studio's settings; inside Details on a phone).
One "Details" layout for all designs (`src/lib/save-the-date/back.ts`): initials, the website
(`youdoido.com/w/<slug>`), a QR code to it, an optional travel line (`doc.back.travel`) and the date,
in the front's palette and fonts. `KEEP` lists which front layers each design carries over (its frame,
a corner of art); designs with nothing that frames well get a thin line frame. `CardSvg side="back"`
draws it, so export and fit-to-width work unchanged. The QR code is drawn as an SVG path, dark modules
on the lighter of paper/ink (a tile on dark papers, white when the two are too close), above the grain.
The print PDF is two pages (front, back) once the website is on; with the site off the studio says
so and the PDF prints the front only. The guest reveal gets "Turn it over" and tap-to-turn. QA sheet:
`?view=backs` (all 24 decode with a QR reader); studio on a back: `?view=back`, side by side: `?view=both`. Desktop has Front / Back / Both (the front stays editable in Both; clicking the back opens its settings); a phone has Front / Back.

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
| Editorial luxury | **Editorial** ✅ full-bleed photo, oversized didone | **Gallery** ✅ photo in a wide mat, museum-label caption |
| Romantic florals | **Heirloom Garden** ✅ antique botanicals, scalloped frame | **Peony Cameo** ✅ oval photo window crowned with flowers |
| Full-bleed photo | **Golden Hour** ✅ script names across the photo | **Contact Sheet** ✅ three crops of one photo on a film strip, best one circled |
| Modern minimalist | **Swiss** ✅ asymmetric grid, huge date numerals | **Whitespace** ✅ one centred line, tiny type, lots of air |
| Rustic botanical | **Laurel Arch** ✅ laurel garland arch on kraft, date set like a sign | **Pressed** ✅ a single bay-laurel sprig taped on, herbarium label |
| Mediterranean | **Riviera Tile** ✅ painted majolica border with lemons | **Postcard** ✅ stamp, postmark carrying the date, airmail edge |
| Vintage & retro | **Seventies** ✅ arched lettering, striped sun in rainbow bands | **Hotel Label** ✅ sunburst luggage-label badge, curved type, date on a ribbon |
| Celestial & black tie | **Midnight Arch** ✅ gold line art, moonlit sea | **Deco Gala** ✅ Art Deco fan frame, gold foil |
| Whimsical garden | **Wildflower Bow** ✅ corner meadow posies tied with a ribbon | **Garden Party** ✅ gingham, lemons and cherries round a little card |
| Coastal & beach | **Tide** ✅ staggered script names, sun setting into hand-drawn waves | **Shoreline** ✅ photo cut along a wave, details on sand below |
| Western & ranch | **Homestead** ✅ wood-type poster | **Brand** ✅ initials as a bar brand, rope border, suede tones |
| Classic traditional | **Engraved** ✅ formal wording, laurel crest monogram, notched frame | **Calligraphy** ✅ large formal script names, deckle-edged paper |

## UX

- **One editor, no modes** (Simple mode removed 2026-11-04: couples want to make it their own).
  Pick a design, type details, pick a colourway and lettering, adjust the photo, and drag
  anything on the card. Dragging snaps edges and centres to the card's centre lines and to the
  other pieces (⌥ turns it off), with a Sky guide line.
- **Toolbar over the card** for whatever is picked (docked above the card on desktop, above the
  tool bar on a phone): Edit words, font, size, colour, bold, italic, all caps, letter spacing,
  and a More menu with Centre on the card, Hide and Reset. Double-click words to retype them.
  Retyping names, place, headline or closing line edits the detail itself; dates, monograms and
  fixed lines keep their own wording per layer (`LayerOverride.text`).
- Layers panel lists every piece to pick, hide or show. Undo/redo (typing coalesces to one step).
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
2. **Library:** ✅ all 24 built and previewed in four batches, each checked with the sample
   couple, long names / a written date / a long place, and no photo (`?view=gallery*`).
3. **Real data:** ✅ built 2026-11-03, awaiting migration 0155 and the owner's review:
   - a `save_the_dates` table plus RLS, with autosave drafts;
   - names, date and place prefilled from `weddings`;
   - photo library (banner, dashboard and gallery photos) and upload straight to Storage, with
     focal point / zoom (no free crop yet);
   - a "Save the date" link under Guests; the dashboard box and landing demo wait for sending,
     so the landing page doesn't advertise a card guests can't receive yet;
   - style filter chips on the design list.
4. **Delivery:** ✅ built 2026-11-03 (needs migration `0156_save_the_date_sending.sql`):
   - **Guest page** `/w/[slug]/s/[code]`: the envelope addressed to the household, which opens
     to the card. It shows only what's on the card. "See our wedding website" goes through
     `/i/[code]?to=site`, so a password-protected site opens too, without jumping to RSVP.
   - **Group link** `/w/[slug]/s`: addressed "For you", for group chats. It's off when the site
     has a password (it goes to the gate instead).
   - **Send page** `/guests/save-the-date/send`:
     - every guest with their status;
     - per-guest Copy link, and Share on phones (free);
     - email to the chosen guests after a confirm step that shows the count, subject, reply-to
       address, and how many get it again;
     - the Send button in the studio header leads here.
   - **Email:** Resend's batch API sends up to 100 in one request (`MAX_PER_SEND`), from
     "<names> via You Do, I Do", with replies going to the couple. It has the card picture and a
     button, plus a text part. Bounced addresses are skipped in one query.
   - **Card picture:** made in the couple's browser from the same drawing (1200×1680 JPEG) and
     stored on `save_the_dates.image_url`. It's remade once per card version. The email and
     link previews (`og:image`) use it.
   - **Statuses:** *Emailed* (`guests.std_sent_at`) and *Opened* (`std_opened_at`, stamped the
     first time the guest taps Open on the envelope). Page loads don't count, because chat
     apps load links to draw previews, and nor do the couple's own taps. There's no tracking
     pixel.
5. **Several designs:** built 2026-11-04 (needs migration `0157_save_the_date_designs.sql`):
   - **Home** `/guests/save-the-date`: the couple's designs (up to `MAX_CARDS`, 6) with a menu
     each (open, send this one, show at guests' links, rename, duplicate, delete), and all
     templates below, drawn with their own names, date and photo. Picking one makes a new design
     and opens it at `/guests/save-the-date/edit/[id]`.
   - One card is `chosen`: the one guests' links show. Sending a card makes it the chosen one;
     the first card made starts chosen.
6. **Polish:** per-template envelope liners, a social preview image, and save-the-date → invitation
   suite matching.

## Owner decisions needed

- Approve (or redirect) the three directions and the SVG engine.
- **Email volume:** Resend's free plan is 100 emails a day for the *whole account*, shared by
  every couple plus logins and RSVPs. One couple's send of 100 would use the day. This needs the
  paid plan (about $20/month, per docs/email-playbook.md) before outside couples send; until then, sends are capped
  at 100 per click.
- Should "Made with You Do, I Do" appear under the guest's card?
