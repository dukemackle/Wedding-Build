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

## Several designs (built 2026-10-11)
Approved from mockups on 2026-10-11 (Canva's "Continue designing" / template gallery as the model).
- `/guests/site` is now **Your designs**: a card per design (live one first, gold **Live** badge),
  each with a ⋯ menu (open, make live, rename, duplicate, "Use my shared wording", delete), then
  a row of templates. Up to 10 designs (`MAX_DESIGNS`). The live design can't be deleted.
- `/guests/site/templates` is the gallery: tag filters, every template drawn in the couple's names
  (`site-thumb.tsx`, drawn not rendered). A tapped template opens the real guest site in that look
  (`/guests/site/preview?look=1`, sent the design by postMessage), three colour options, and
  **Customize this template**, which makes a new design (template over the live design) and opens it.
- The editor moved to `/guests/site/edit/[id]`. Publish there copies the design to
  `weddings.site_design` and sets `weddings.live_design_id`; on a design guests don't see the
  button reads "Make this live".
- Data (`0111_site_designs.sql`): one `site_designs` row per design. `site_design_draft` is no
  longer written. **Shared wording** is the headings' words (the `text` slots): designs with
  `shared_wording` on read and write them in `weddings.site_wording`; off, the design keeps its own.
  Story, FAQ, schedule, photos and RSVPs live in their own tables, so they're shared by every design.

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

## Editor v2: Canva-style editing (decided 2026-10-08)

The owner reversed the "no free-form canvas" rule above, **within sections**:
each section becomes a canvas where text, photos, art and shapes can be placed
freely on a snapping grid, with its own phone layout edited at real phone size
(Canva's phone editor just shrinks the desktop page; ours doesn't). Colours and
fonts default to the site palette so a site still looks designed. Functional
sections (RSVP, schedule, registry, FAQ) move and restyle as whole blocks.

Approved mockup (desktop 1440 and phone 390): https://claude.ai/artifact/NTyvaB5B6VAdyV2sFx4abw

Phases, one PR each:
1. **Click-to-edit text** (shipped first): click a heading, the invitation
   line or the names in the preview to restyle them (font, size, colour, bold,
   italic, alignment) and retype headings in place; undo/redo. Stored as
   `text` in the design jsonb, keyed by slot (`TEXT_SLOTS` in
   `src/lib/site-design.ts`); rendered by `SiteText` (`src/components/site-text.tsx`).
   The element layout format arrives with phase 2, where it's first used.
2. **Desktop canvas inside sections** (built 2026-10-08): select, drag,
   resize, rotate, snap, the floating bar and right-click menu, the Position
   panel (Arrange and Layers); add text, line art, shapes and the couple's
   photos from the Elements tab. Stored as `canvas` in the design jsonb
   (`src/lib/site-canvas.ts`, `v: 1`): per section a reference width `w`, its
   elements back to front, a whole-section `style` (card, plain, tinted,
   outlined) and a `phone` frame that for now stacks the elements in reading
   order under the section. Elements go in the hero and custom blocks; the
   other sections move (up/down in their column), hide and restyle as whole
   blocks. Guests get `SiteSection` (`src/components/site-section.tsx`), plain
   positioned HTML scaled with container units; the dragging lives in
   `preview/canvas-editing.tsx`, which only the editor's preview frame loads.
   The hero's own names, date and buttons stay theme-laid-out for now.
3. Phone editor, in two PRs (decided 2026-10-08).
   **3a, separate phone layouts** (built 2026-10-08): each section's `phone`
   frame stays "stack" until the couple moves something in the Phone preview
   (from a computer or on a phone). That first move switches the section to
   "free", starting from the stack as it was laid out, with boxes in the
   section's phone width (`phone.w`). An element added on the computer later
   goes under the rest. "Back to stacked" undoes it, and Hide on the phone
   layout hides an element on phones only (`phone.hidden`). The editing code
   is shared with the computer frame; the preview's width picks which one it
   edits.
   **3b, the phone editor itself** (built 2026-10-08, from the mockup's Phone
   artboard): a header with back, undo/redo, Preview (hides the tools so
   the couple sees and can try the site as guests do), More (site on/off,
   status, replay, open live) and a gold Publish; a Computer / Phone layout
   switch; the site filling the screen; a bottom bar of tabs (Theme, Style,
   Motion, Sections, Elements), each opening a slide-up sheet; and while
   something is picked, its tools in that bar instead with ✓ to finish
   (`phone-tools.tsx`). Words get font, size, colour, bold, italic and
   align. Placed elements also get edit, position, lock, copy and delete.
   Sections get style, move up/down, hide and restack. On touch screens
   only the corner handles show, and a tap on a form inside a section picks
   the section rather than opening the form.
4. In three PRs (decided 2026-10-08).
   **4a, look panels** (built 2026-10-08): the computer editor's tabs became
   the mockup's side rail (Theme, Style, Colour, Fonts, Background, Motion,
   Sections, Elements); the phone's bottom bar has the same. Colour holds
   the palettes and fine-tuning (moved from Theme) plus colours read from
   the couple's photos in the browser (a tap makes one the accent, or "Make
   a palette from my photos"). Fonts holds the pairs, the library with a
   search and kind filter, and body text (moved from Style). While words or
   a placed element are picked, Colour and Fonts change that instead of the
   whole site. Background sets the page colour, a pattern (dots, stripes,
   lattice) and a texture (linen, paper, watercolour wash), drawn in the
   site's own colours as CSS layers (`background` in the design,
   `backgroundLayers` in site-design.ts), on every section or the top only.
   **4b, photos and motion** (built 2026-10-08): a placed photo has a crop
   (focus point and zoom), a frame (rounded, circle, arch, polaroid, border)
   and a filter (warm, cool, vivid, faded, vintage, black & white), plus alt
   text, from the Photo panel ("Crop, frame & filter" on its bar; Crop,
   Frame and Filter tools on a phone). The banner photo gets a focus point
   and filter in Style › Banner photo (`heroPhoto` in the design). Every
   placed element can animate (rise, fade, pan, pop, wipe, drift) from the
   Animate panel: CSS only, tied to scrolling where the browser supports
   scroll-driven animations and played on load elsewhere, still for guests
   who turn motion off.
   **4c, a lean guest page and the Elements library** (built 2026-10-08):
   the page was already rendered as HTML on the server; what it carried was
   editor code. The zod schemas moved to `site-design-schema.ts` and
   `site-canvas-schema.ts` (server and editor only; the guest page reads
   designs parsed on the server), and click-to-edit words moved to
   `site-text-edit.tsx`, loaded on demand only in the preview. The guest
   page's own JavaScript went from 139 KB to 51 KB gzipped (545 to 161 KB
   raw, measured from the production build's client manifest for
   `/w/[slug]`). The canvas editing code was already kept out of it. Turning
   the hero and sections into server components is possible later but saves
   little now: the countdown, RSVP form, motion and theme context need the
   browser anyway. The Elements tab became a library: a search, filter chips
   (Text, Shapes, Line art, Watercolours, Your photos), line art grouped by
   kind, the painted watercolours, and a "Suits your theme" row.
5. In two PRs (decided 2026-10-08).
   **5a, templates** (built 2026-10-08, since grown to 28): 14 finished looks in
   `src/lib/site-templates.ts`, each a combination of what the editor
   already has (theme, palette, font pair, hero layout, artwork, background,
   motion), filtered by Beach, Garden, Rustic, Line art, Traditions and
   Modern. Templates is the first tab and opens by default. Switching keeps
   the couple's words, section order, photos and placed elements; one-off
   fonts and colours on retyped headings give way to the new look. The design
   records the template it started from (`template`), shown as picked.
   **5b, AI** (built 2026-10-08): "Describe your ideal site" (top of
   Templates) turns a sentence into a template, palette, artwork, background
   and motion, every field checked against its list on the server and applied
   as an ordinary draft change, so undo puts it back. "Wren, write this" (top
   of Sections) drafts their story, FAQ, travel notes or a welcome line from
   their details and notes. The couple edits the draft, then "Use this" saves
   it: the story becomes a story section, FAQs are added after theirs, travel
   notes are replaced, and the welcome line goes on the hero as text. Both
   share a cap of 3 calls per wedding per day (`site_ai_uses`, migration
   0110), and the Privacy Policy lists what's sent. They run on
   `claude-haiku-5-5` (`src/lib/ai/site-wren.ts`; switched from Opus 5.5 on
   2026-10-09 for cost).

## Signature templates (decided 2026-10-21)

The owner found the templates "beginner level": every one was the same page of
cards with a different colour, font and corner art. Approved from mockups
(https://claude.ai/artifact/7PfnLaRR3YrcaxYqVwm8ax, desktop 1440 and phone
390): fewer, better templates, each laying out the whole page its own way.

- Three new page styles in `PAGE_STYLES`, laid out in `section-layout.tsx`
  and dressed in `globals.css` (`.site-invitation`, `.site-magazine`,
  `.site-postcard`):
  **invitation**, one centred column in the couple's exact order, a flourish
  between sections, the RSVP in a double-ruled paper panel, travel as framed
  cards; **magazine**, a contents line, then numbered rows under heavy rules
  with the number and name in the margin, big tight headings, travel as
  roman-numbered columns, questions two to a row; **postcard**, the
  storybook bands in the theme's second colour, always with an edge (wave
  unless another is picked), each section its own band, travel as postcards
  with a stamp box.
- Two new schedule layouts, which those styles use when the couple hasn't
  picked one (`defaultWeekendLayout`): **centre** (events either side of a
  line, a left rail on phones) and **tickets** (a coloured stub per event).
- Templates **Heirloom** (invitation, painted roses, Cormorant · Jost),
  **Editorial** (magazine, poster names, Bodoni · Jost, RSVP band) and
  **Riviera** (postcard, side-by-side photo, lemons, DM Serif · Jost, RSVP
  band), tagged Signature and listed first. A template can now set the
  RSVP layout (`rsvp`); others reset it to the card.
- Still to do: sample photos (Pexels, people-free, after the licence check),
  an in-editor photo search, the art keep-or-cut review, and a shorter first
  RSVP step (DESIGN-OPPORTUNITIES rows 16-19).
