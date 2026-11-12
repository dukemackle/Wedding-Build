# Batch A suites (2026-11-11)

Four suites built from the owner's approved reference pack (`youdoido_batch_a_claude_reference_pack.zip`,
ChatGPT mockups): **Highland Lake**, **Heirloom Peony**, **Wildflower Meadow**, **Modern Black-Tie**.
Each is a save the date (front and back), an invitation (front and RSVP back) and a guest-site template,
linked as a suite in `src/lib/suites.ts`. Status: **built on a branch, awaiting the owner's visual OK.**

## Where it lives

- Cards: `TEMPLATES` in `src/lib/save-the-date/templates.ts` (`highland-lake`, `heirloom-peony`,
  `wildflower-meadow`, `black-tie`); invitations laid out per design in `LAID_OUT`,
  `src/lib/save-the-date/invitations.ts`; backs in `BACK_ART`, `src/lib/save-the-date/back.ts`.
  Art keys (`highlandStd`, `sprigRule`, `doubleFrame`...) in `src/components/save-the-date/art.tsx`.
  Two new date styles, `formalDay` and `yearWords` (`format.ts`).
- Site: templates in `src/lib/site-templates.ts`; palettes, font pairings `ee` and `pe`, hero layouts
  `stationery` and `formal`, scenes `alpine-lake`, `peonies`, `painted-wildflowers` in
  `src/lib/site-design.ts`; drawn in `src/app/w/[slug]/wedding-hero.tsx` and `src/components/site-scene.tsx`.
- QA: `/save-the-date/prototype?view=batch-a` (and `batch-a-long`: accented long names) shows every
  front, back and colourway. `/save-the-date/prototype/site?t=<template>&c=<palette>&long=1&photo=0`
  shows a guest site with a sample couple. Both are off in production.

Every word is live text from the couple's details. The existing Heirloom Garden, Wildflower Bow and
Highland (moorland) designs are untouched; these are new designs beside them.

## Art: what's interim

The watercolours in `public/site-art/batch-a/` were cut from the reference PNGs: type removed
(masked and inpainted), the paper colour keyed to transparency, so the art sits on the app's own paper.
It's the approved painting, but:

1. **Resolution.** Cut from 1060px mockups (Wildflower from a ~700px card in a composite), so the 3000x4200
   PNG and print PDF are upscaled about 3x and will print soft. Fine on screen.
2. **Wildflower** was cropped about 10% and stretched about 9% horizontally to reach 5x7.
3. **Site pieces** (Highland panorama, Wildflower meadow) are upscaled 1.5-2x on a 1440px screen.
4. Modern Black-Tie needs no art (vector only). Its site uses the couple's photo in black and white.

## Final art: one painting per suite (owner, 2026-11-11)

The owner sends one text-free card painting per suite (ChatGPT, tall 1024x1536). Claude keys out
its paper and deckle and builds everything from it: save the date, invitation (the painting set a
little lower), both backs, and the guest site (the painting's scene under the names, full width on a
phone, centred with fading sides on a wide screen). No sprigs, motifs or other small images at the
top or between lines: fine rules only (owner, 2026-11-11).

| Suite | Painting | Status |
|---|---|---|
| Highland Lake | lake, peaks, pines, wildflowers in the bottom half | **Done** (owner's painting, 2026-11-11) |
| Heirloom Peony | peony clusters top-left and bottom-right, centre clear | Waiting; interim art cut from the mockup in place |
| Wildflower Meadow | flowers up both sides, meadow and peaks along the bottom, centre clear | Waiting; interim art in place |
| Modern Black-Tie | none (type only) | Done |
| Golden Barn | barn with lights, pond, peaks at golden hour; id `golden-barn` (owner's "Homestead" zip; that name is taken by a live template) | **Done** (2026-11-12) |
| Starlit Terrace | lantern-lit stone terrace over moonlit hills under a starry navy sky; dark suite, ivory type; id `starlit-terrace` (owner's "Midnight" zip; that name is taken by a live template). Sky mottle smoothed (stars kept), a clipped flower at the panorama's right edge painted out | **Done** (2026-11-12) |
| Golden Hills | oak-dotted hills under a champagne-gold sunset; id `golden-hills` (owner's "Golden Hour" zip; that name is taken by a live template). Site foot cut from the tall background (the panorama has a clipped overhanging branch and fence post) | **Done** (2026-11-12) |
| Blush Garden | blush peony, rose and anemone bouquet gathered in the corner on textured cream paper; id `blush-garden`. The loose sprig on the left painted out (no sprigs); site foot cut from the tall background (the panorama has two more floating sprigs). ChatGPT notes the collage is adapted from an existing botanical study: owner to confirm it reads distinct from Heirloom | **Done** (2026-11-12) |
| Pressed Botanicals | pressed lavender, anemone, hydrangea and wild sprays in the two lower corners; id `pressed-botanicals` (owner's "Pressed" zip; that name is taken by a live template). Built from the panorama, keyed off its pasted paper patch onto clean paper; the zip's own card art cropped the flower heads. Phones show the whole width (`foot(..., whole)`), smaller, rather than a zoomed crop that loses a corner | **Done** (2026-11-12) |
| Greenery Arch | slender watercolour leaf arch on cream; id `greenery-arch` (owner's "Laurel Arch" zip; that name is taken by the live vector Laurel Arch on kraft). Arch keyed off its mottled paper into a transparent layer (`gr-arch.webp`) so each card places it: names under it on the front and invitation, initials and website under it on the back. On the site it sits alone at the foot | **Done** (2026-11-12) |
| Golden Magnolia | ivory magnolias with gold centres and olive leaves rising from the lower-left corner; id `golden-magnolia`. The zip pasted the flowers on peach panels with visible edges and a sliced leaf; the magnolia was cut out (GrabCut) onto flat paper, set flush to the card edge, and the site foot uses it twice (mirrored, smaller on the right) since the panorama cut-outs came out patchy | **Done** (2026-11-12) |
| Tuscan Engraving | sepia engraving-style Tuscan villa, cypresses and vineyard hills; id `tuscan-engraving`. The zip's card and tall background had a hard-edged pasted panel; the card is cut from the panorama (villa side, faded in from paper) and the site uses the panorama with its thin panel edge trimmed | **Done** (2026-11-12) |
| Vineyard Etching | olive-charcoal etching of vineyard rows, cypresses and a hilltop villa; id `vineyard-etching` (owner's "Engraved" zip; that name is taken by a live template). Built at the owner's request although its subject is close to Tuscan Engraving (owner, 2026-11-12). Paper wash ramped in more gently; site foot cut from the tall background (the panorama has an overhanging branch) | **Done** (2026-11-12) |
| Deco Fan | champagne-gold Art Deco fanburst on midnight navy; dark suite, ivory type; id `deco-fan` (owner's "Deco Gala" zip; that name is taken by a live template). The small stepped corner marks beside the fan painted out (no small motifs); the back uses a smaller, edge-feathered fan (`df-back.webp`) so its rays clear the type | **Done** (2026-11-12) |
| Portico | pale stone arch opening onto a watercolour lake and hills; id `portico`. Arch and view keyed off the mottled paper (its sky panel dropped away to paper) into a transparent layer (`pt-arch.webp`); the leaf sprigs at both column bases removed (no sprigs). Names and date sit inside the arch on the front, the invitation's details too; a small arch closes the back | **Done** (2026-11-12) |
| Iris Garden | watercolour border of charcoal and lavender bearded irises on warm cream; id `iris-garden`. The owner's redo of "Editorial" (the zip was a single flat sprig, declined); one 1942×809 image only, so the card is cut from it (right two-thirds, enlarged ~1.27×: needs a larger master before print) | **Done** (2026-11-12) |
| Gold Flourish | gold calligraphy flourishes, sepia washes, leaves and a soft peony along the foot; id `gold-flourish` (the owner's redo of "Calligraphy"; that name is taken by a live template, and the zip was a single hairline, declined). Sent as three images, not a zip; ~1000-1900px, so a larger master is needed before print | **Done** (2026-11-12) |
| Misty Ridge | pale misty mountain ridges and a low sunrise; id `misty-ridge` (owner's "Whitespace" zip; that name is taken by a live template). Built from the panorama, top mottle flattened to plain paper; the zip's card art had a pasted panel with dark edges | **Done** (2026-11-12) |
| Boho Sunset | rolling terracotta, mustard and rose hills under a banded sun with daisies and grasses; id `boho-sunset`. Sent as images; card and panorama used as delivered (~1000-1900px: larger master before print) | **Done** (2026-11-12) |
| Rose Ribbon | peach garden roses, blush blossoms and greenery wound with a blue ribbon; id `rose-ribbon`. The owner's redo of "Fable" (the zip was flat clip-art with a blue songbird that read as Wren, declined). Used as delivered (~1000-1900px: larger master before print) | **Done** (2026-11-12) |
| Papel | Mexican courtyard with papel picado banners, magenta bougainvillea, terracotta arch, marigolds and clay pots; id `papel-courtyard` (the plain `papel` id is the live papel picado strip scene). Used as delivered | **Done** (2026-11-12) |
| Canopy | open chuppah of draped fabric on four wooden poles with cream roses over green hills; id `canopy`. Used as delivered; phones show the whole canopy (`foot(..., whole)`) so no pole is cropped. No religious symbols added (per the brief) | **Done** (2026-11-12) |
| Jharokha | carved sandstone jharokha with jali screens over a terrace, bougainvillea and marigolds; id `jharokha`. Used as delivered; phones centre on the jharokha; back type lifted 250 to clear the dome | **Done** (2026-11-12) |
| Plum Lattice | carved cinnabar-red and gold window lattice (bubujin) woven with plum blossom; id `plum-lattice` (the owner's redo of "Lattice"; the zip was flat digital art with sprigs, declined; `lattice` is a live background pattern id). Front and invitation type set high to clear the blossoms; the back uses a feathered-top crop (`pl-back.webp`) low under the type | **Done** (2026-11-12) |
| Meadow Vista | golden hills, oaks, winding path, lupine; id `meadow-vista` | **Done** (owner's zip, 2026-11-12) |
| Evergreen | pines, misty ridges, snowy peaks, sunset; id `evergreen-ridge` | **Done** (owner's zip in the new format, 2026-11-12) |
| Palm Shore | palm beach at golden hour (cards, site foot); id `palm-shore` ("Shoreline" is an older photo save the date) | **Done** (owner's three-image set, 2026-11-12; two hibiscus painted out, owner) |
| Regatta | lighthouse, granite, hydrangeas (cards), sailboat on the bay (invitation, site band) | **Done** (owner's zip, 2026-11-12) |
| French Riviera | terrace, villas, sea and bougainvillea (cards), open sea (invitation), arch terrace band (site) | **Done** (owner's zip, 2026-11-12) |
| Postmark | Tuscan villa and cypresses (cards, site), vineyards (invitation); airmail edge | **Done** (owner's zip, 2026-11-12; olive leaves painted out, owner) |
| Sonoran Desert | saguaros, sandstone mountain, sage and ocotillo; full-bleed sky | **Done** (owner's zip, 2026-11-12) |
| Garden Arch | rose-hung stone arch over an Italian lake, villa, cypresses | **Done** (owner's zip, 2026-11-12) |
| Joshua Tree Sunset | Joshua tree, boulders, purple mountains, sunset in the bottom third; text-free art supplied | **Done** (owner's zip with text-free artwork, 2026-11-12) |
| Bougainvillea Terrace | terracotta arch, bougainvillea, potted olive and geraniums, hills; full-bleed | **Done** (owner's painting and website mockup, 2026-11-12) |
| Coastal Sunset | Big Sur cliffs, sea, sun and poppies in the bottom half | **Done** (owner's painting and website mockup, 2026-11-12) |

Coastal Sunset (added 2026-11-12) also has its own website painting, cut from the owner's website
mockup with the type inpainted away (`coastal-panorama.webp`). It fills the whole hero, edge to edge,
with the names on its sky; phones keep the height and trim the sides. The card backs carry a strip of
the poppies along the foot (`coastal-foot.webp`).

Prompt that worked for Highland: attach the approved mockup and ask ChatGPT to repaint its artwork
with no text at all, same watercolour style, leaving the text area as empty paper; tall 1024x1536.
Print sharpness: 1024px is below 300dpi at 5x7, so the finals get upscaled together before printing.

## Known gaps

- Save the date fronts follow the mockups: Highland and Heirloom show names and date only (no place
  line), as the references do.
- Downstream site sections use the existing "invitation" and "evening" page styles. The mockups'
  painted section dividers (mist band, lavender sprigs, pines) are cut but not placed yet.
- Card colourways change the ink only; the watercolours keep their own colours.

Bougainvillea Terrace (2026-11-12) is a full-bleed painting with the type set on it (sky and terrace
floor), so nothing is keyed: the words are inpainted away (`terrace-std.webp`, `terrace-panorama.webp`).
Its backs lay a paper panel over the whole painting for the QR code. Names are italic, not script.

Joshua Tree Sunset (2026-11-12) came as a zip with text-free paintings (`*-artwork.png`, 1500x2100
and a 1600x595 website panorama), so nothing was inpainted: the ivory is keyed out
(`jt-save-the-date.webp`, `jt-invitation.webp`) and the panorama used as is (`jt-panorama.webp`).
On a phone the website painting sits under the type, so the tree never crosses the names.
Still waiting: Tuscany vineyard (owner: no olive leaves at the top) and the Tucson desert arch;
both were sent mid-turn and never reached the session's files, so they need resending.

Sonoran Desert (2026-11-12): the zip's text-free card art faded the big saguaro out at the top, so the
cards use the lettered references with the type removed by `skyfill.py` (a sky-only, wide-across
normalized fill plus paper grain): `sd-std.webp`, `sd-inv.webp`; the website panorama is the zip's.
Garden Arch (2026-11-12): the zip's text-free art keyed onto the paper (`ga-*.webp`); the website lake
terrace is busy all over, so it is a full-width band under the names rather than behind them.

Postmark (2026-11-12) is the Tuscany suite. The owner disliked the olive leaves hanging over the top, so
they are painted out of the sky (`tools/deleaf.py`); the stamp and postmark are left off (no small
images at the top). The airmail edge is vector (`airmailSoft`, accent and muted stripes).

French Riviera (2026-11-12): id `french-riviera`, separate from the older vector "Riviera Tile". The website
painting has bougainvillea across its sky, so it is a full-width band under the names.
Mediterranean (Amalfi, cobalt tiles and lemons) is waiting: its zip's art is 498x265 and the card
previews 458px wide, too small to look sharp; needs the artwork at 1000px+ like the other zips.

Website layout (owner, 2026-11-12): the couple's photo is framed at the top of every painted suite's
site; the painting is a `foot` scene (site-scene.tsx `PAINTED_BANDS` via `foot()`), and the page
deepens to its sky (`PAINTED_SKY`, applied in guest-site-theme.tsx). Paintings are pickable on every
template (editor-tabs.tsx `SCENE_GROUPS`, "Paintings"). For a new suite: add the panorama with
`foot(file, w, h, phoneX)` and its sky colour, and give the scene `place: "foot"`.

## What each new suite needs (owner's 40+ suite plan, 2026-11-12)

The first prompt (four images at fixed pixel sizes in one request) made things worse: ChatGPT
can't hit exact sizes and merges requests into boards. One image per message works.

Per suite, one zip named after it (e.g. `Shoreline.zip`):

1. From ChatGPT, one image per message, no text:
   - `card.png`, tall portrait: "Paint the artwork for this design with no text at all, as one
     image. Tall portrait. Watercolour on warm cream paper. Keep the top 60% plain empty paper and
     paint the scene across the bottom 40%, edge to edge, fading softly into the paper at its top.
     Nothing in the top corners."
   - `website.png`, wide: "Now the same scene as one wide landscape image for a website. Same
     style and colours, no text, no border. Clear sky in the top third, and nothing important cut
     off at any edge."
   - `sky.png` (optional), tall: "Now the same scene as one tall portrait image: the landscape in
     the bottom third only, and soft, plain watercolour sky above it that fades to almost blank
     paper at the top. No text."
   - If it makes a board or adds lettering: "just the painting, one image, no text."
2. A brief (from the design Claude): suite name; family; one-line mood; three ink colourways
   (hex); paper hex; names style (script/capitals/italic); save-the-date wording order;
   invitation wording order; website (sky behind the page, or painting at the bottom only);
   anything to avoid.

Never usable: images under ~1000px wide, crops of a presentation board.

Evergreen (2026-11-12) arrived in the right format: save-the-date-artwork 1500x2100, website-background
1600x3200 (scene in the bottom third, plain paper above), website-panorama 2400x1000. The site uses the
bottom of the tall background (`ev-foot.webp`) on the page's own paper colour, so it is seamless.

**Standing rule (owner, 2026-11-12):** every suite's website painting fades in at the top and the page
takes the painting's own background (sky colour, wall, paper), so they read as one picture. Sample the
top-edge colour from the file for `PAINTED_SKY`; use `PAINTED_TEXTURE` for walls. Check the join at
1440 and 375 before sending a preview.
