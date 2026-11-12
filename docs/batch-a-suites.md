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

## Prompt for new suites (2026-11-12)

What a new suite's zip needs, so it builds without guesswork. Paste into ChatGPT with the approved mockup:

```
I need production artwork for a wedding stationery suite called [NAME], matching the attached
mockup exactly (same watercolour style, colours, scene and mood). Make each file as a SEPARATE
image, not a board or mockup, with NO text, letters, numbers, borders, stamps, logos or devices.

1. save-the-date-artwork.png, 1500x2100 portrait. Warm ivory paper (#FAF4E7) across the top
   60%, completely empty for type. The scene painted across the bottom 40%, edge to edge,
   its top edge softly fading into the paper. Nothing in the top corners.
2. invitation-artwork.png, 1500x2100 portrait. Same paper and same scene (or a quieter view of
   it), in the bottom 35% only; the top 65% empty paper.
3. website-background.png, 1600x3200 portrait. The landscape fills only the bottom third,
   edge to edge. The top two-thirds is soft open watercolour sky that grows paler and calmer
   towards the top, almost plain paper at the top edge. No branches, flowers or birds in the
   sky, nothing touching the top or side edges.
4. website-panorama.png, 2400x1000 landscape. The same scene, wide, with clear sky in the top
   third and nothing cut off at the top.

Keep every important element (trees, buildings, boats, flowers) whole and inside the image,
not cut by the edges. Same light and time of day in all four. Export as PNG at full size.
```

Never acceptable: images under 1000px wide, cropped presentation boards, or text-free art cut
from a mockup board (it is too small and doesn't match). Ask for a resend.
