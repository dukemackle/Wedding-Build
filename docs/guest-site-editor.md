# Guest site editor — agreed design (2026-09-27)

The mockup was approved on 2026-09-27: https://claude.ai/artifact/XR8AQDdZnMSokSc9sqZLDk
(desktop editor at 1440px, phone editor at 390px, and the Garden and Midnight themes at both widths).

**Why:** the guest site is the part of Wren that guests actually see. If it isn't
great, couples leave for Zola or Joy. The goal is Canva-like freedom without a
free-form canvas: free-form breaks on phones and lets couples make ugly sites.
Couples get as many choices as possible, and every combination still looks designed.

## Where it lives
- A new sub-tab, **Guests › Guest site** (`/guests/site`), next to "Guest list & RSVPs" and
  "From your guests". The "Your guest site" card on `/guests` moves here.
- **Desktop:** a 400px editor panel on the left and a live preview on the right, with a
  Computer/Phone toggle, "Replay motion", "Open live site" and **Publish changes**.
  Edits are saved as a draft; guests only see them after Publish.
- **Phone:** the preview fills the screen and the editor is a sheet dragged up from the bottom.
- Editor tabs: **Theme · Style · Motion · Sections**.

## Theme tab
There are eight themes, running from soft to bold. Each theme sets the background, surface,
ink, muted, photo placeholder colour, display and body fonts, italic names or not,
button radius and 4 accent swatches:
Garden (soft), Midnight (navy and gold), Terracotta, Botanical (deep green), Riviera
(cobalt and lemon), Blush, Modern (monochrome) and Black tie. Couples can also pick a
custom accent colour. Switching theme keeps all the content.
The exact values are in `THEMES` in the mockup's `Main.dc.html`.

## Style tab
- Font pairing: "theme default" or one of 5 pairings.
- Hero layout: full photo (a card overlapping the photo), side by side, or framed (an arched photo).

## Motion tab
- **Overall:** None / Subtle / Lively. Each fills in the settings below; changing any of them afterwards shows "Custom".
- **When the page opens:** straight in · envelope opens · names write in · photo reveal.
- **As guests scroll:** none · fade up · slide in · zoom. This must use IntersectionObserver
  on the real site; the mockup just plays it on load.
- **Main photo:** still · slow zoom.
- **Extras:** falling petals · live countdown (to the second) · confetti on RSVP.
- **Speed:** slow · normal · fast.
- Always honour `prefers-reduced-motion`, which means guests get the still version.

## Sections tab
- A "before you share" checklist (e.g. no hotel yet, RSVP deadline not set).
- Sections are drag-to-reorder, each with a show/hide switch and a status line:
  Our story, The weekend (from the itinerary), Travel & stays, Photos, FAQ, Registry, RSVP,
  Photo wall.
- "Add a section" lets couples add a photo, story or quote block.

## Data model (decide once, before phase 1)
- Settings live as `site_design jsonb` on `weddings`: theme id, accent, fonts, layout and motion
  settings. Validate it with a zod schema in code, not with columns, so new options don't need migrations.
- Keep a draft and a published copy (`site_design_draft` and `site_design`) so Publish is a simple copy.
- Section order and visibility is an ordered array in the same jsonb. Custom blocks (photo,
  story, quote) need their own table once they exist.
- Existing section content is already stored by `0063_guest_site_sections.sql` and so on. That
  content stays where it is; only presentation moves into the jsonb.

## Section order on a computer (decided 2026-09-27)
The desktop site keeps two columns: what guests act on (RSVP, photos, the weekend,
photo wall) in the wide main column, reference material (who's coming, travel & stays,
FAQ, registry) in the sidebar. The couple's order applies within each column; a phone
shows one column in the full order. "Our story" waits for custom blocks (phase 4),
since there's no story content to show yet.

## Build phases
1. The `/guests/site` sub-tab and editor shell with live preview, the draft/publish flow, the Theme
   tab (all 8 themes and the accents), and `/w/[slug]` rendered from `site_design`.
2. The Style tab (fonts and hero layouts) plus the Sections tab (reorder, hide, checklist).
3. The Motion tab.
4. Custom blocks (photo, story, quote). Stored in `site_blocks` (migration 0088); each sits in
   the design's section list as a `block:<id>` entry, in the main column on a computer.

Open judgment call (for the owner, not urgent): whether premium themes later become a paid tier.
