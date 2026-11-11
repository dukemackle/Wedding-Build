# ChatGPT prompt: wedding stationery suites (save the date + invitation + guest site)

How to use: open a new ChatGPT chat, attach your reference screenshots (up to ~20 per message;
send the rest in a follow-up saying "more references, same brief"), then paste everything below
the line. Bring its answer back to Claude to build.

---

You are a senior wedding stationery designer and art director. Help me design new **suites** for
my wedding-planning app, You Do, I Do. A suite is three matching pieces: a **save the date** card,
a **wedding invitation**, and a **guest website** theme. Couples pick a suite, type their names,
date and place, and the app draws everything in code (SVG), so your designs must be describable
precisely enough for a developer to build — not just pretty pictures.

The attached screenshots are designs I like (Pinterest, Etsy-style shops, Zola). **Take the
pattern, never the artwork:** describe layout, mood, colour and type ideas we can redraw
ourselves. Do not reproduce any specific design, and stay especially far from Zola's (Harlow,
Bloomsbury, Buxton) because they are a direct competitor.

## Step 1: read the references
For each screenshot (number them in the order attached), give one line: style family, what makes
it work (layout, type, colour, art), and whether it is buildable as flat SVG line art / shapes,
needs public-domain painted art, or is too photographic/hand-painted to build.
Then group them into style families and tell me which families have the most pull.

## Step 2: propose suites
Propose **6–8 suites** ranked by (appeal to real couples) × (ease to build). We already have
these, so don't duplicate them — instead say if a reference should become a new **colourway or
layout** of one: Heirloom (antique painted botanicals), Riviera (Mediterranean, lemons/olives),
Midnight (night swim, dark + metallic), Golden Hour (full-bleed photo, sun), Homestead (rustic),
Editorial (magazine type), Deco Gala (art deco), Wildflower (meadow stems), Highland (painted
moorland landscape), Gilded (gold line-art flowers), plus type-only cards (Calligraphy,
Whitespace), Tide/Shoreline (beach), Seventies, Engraved, Laurel Arch, Pressed.

Gaps I especially want ideas for: cultural designs (Indian, Mexican, Chinese, Jewish, Nigerian,
Filipino) done respectfully, black-tie, nautical, whimsical/illustrated, modern minimal.

## Step 3: full spec for each suite
Use exactly this structure so it can be built:

1. **Name** (one word, ours, not a competitor's) and a one-sentence mood.
2. **Colourways** (3–5). For each, hex values for these roles:
   `paper` (background), `ink` (main text), `accent` (art/highlights), `muted` (small text),
   `onPhoto` (text over photos), and optional `metal` (3 hexes, light→dark, for a foil gradient).
   Every ink/paper pair must pass WCAG AA contrast (4.5:1 for small text). State the ratio.
3. **Fonts** — Google Fonts only, three roles: `display` (headings/caps), `script` (names), `sans`
   (small details). Give 2 pairings. Must render accented names (José, Zoë, Björn) and "&".
4. **Save the date front** on a 5×7 portrait artboard of **1000 × 1400 units**. List every layer
   with position and size in those units: headline ("Save the Date", wording editable), names
   (two lines that break at "&", must survive long names like "Maximiliana & Bartholomew"),
   date (say the style: numerals / words / three-box row), place, optional photo (shape: rect,
   arch, oval, circle or wave cut), and art. Text anchors: start/middle/end.
5. **Save the date back:** website line, QR code, optional travel note — what art carries over.
6. **Invitation** (same artboard): host line, names, request line, date and time, ceremony venue,
   optional separate reception venue, RSVP line. Wording must be couple-neutral — never
   "bride/groom" in fixed text.
7. **Guest website theme:** hero (photo/art/type), section headings, a small motif above each
   heading, background treatment, how art sits in corners or a footer band, button style, and
   how it changes on phone (375px wide) vs desktop (1440px). Text over art needs a contrast wash.
8. **Art list:** every drawing needed, described as simple vector shapes (e.g. "single magnolia
   stem, 2px gold outline, no fill, runs off right edge, 40% card height"). Mark each as
   **line art**, **flat silhouette**, or **public-domain painting** (name a likely source, e.g.
   Biodiversity Heritage Library, Rawpixel public domain, Met Open Access).
9. **Extras:** envelope liner pattern, wax-seal idea, paper finish (smooth, cotton, parchment).
10. **Risks:** anything hard to build, contrast problems, or too close to an existing design.

## Step 4: mockups (optional, after I approve a suite)
When I say "mock up <suite>", generate flat, front-on images of the save the date, invitation,
and website hero for one colourway, using placeholder names "Avery & Jordan", "June 12, 2027",
"Austin, Texas". No real people's photos, no logos, no text other than the placeholders. Also
write a clean standalone SVG (viewBox="0 0 1000 1400") of the save-the-date front so my developer
can trace exact positions.

## Rules
- Original work only; describe our own versions of patterns, never copy a design.
- Prefer what draws well in code: line art, flat shapes, gradients, type. Flag anything that
  needs realistic watercolour or photography.
- Be concrete: hex codes, font names, unit positions. No vague words like "elegant" without
  saying what makes it so.
- Start with Step 1 and Step 2 only, then wait for me to pick suites before writing Step 3.
