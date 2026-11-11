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

## Missing-assets manifest (for print-ready fidelity)

Ask for each as a **transparent PNG, no text, no paper texture, no deckle edge**, at the size given
(5x7 at 300dpi plus 1/8" bleed = 1575x2175; card art below is at that scale).

| File | Size (px) | Placement | Notes |
|---|---|---|---|
| highland-std.png | 1575x2175 | Save the date, full card | Sprig + small peaks top-centre; lake, pines, wildflowers from ~50% down. Nothing between 14% and 48% height. |
| highland-inv.png | 1575x2175 | Invitation, full card | Sprig top-centre; small peaks at ~39%; scene from ~58% down, clouds at the sides only. |
| highland-panorama.png | 3000x1050 | Site, under the names | Wide alpine lake, sky fading to transparent at the top. |
| highland-sprig.png, highland-peaks.png, highland-forest.png | 800 wide | Ornaments, card backs | Separate small elements. |
| heirloom-std.png, heirloom-inv.png | 1575x2175 | Cards, full | Peony clusters top-left and bottom-right, central 60% clear. |
| heirloom-corner-top.png, heirloom-corner-bottom.png | 1400 wide | Site corners, card backs | Each cluster on its own. |
| heirloom-sprig.png | 300 wide | Divider ornament | Small gold leaf sprig. |
| wildflower-frame.png | 1575x2175 | Cards, full | Drawn at 5x7 (the mockup card was narrower). Side columns, meadow + peaks along the bottom, clear centre. |
| wildflower-left.png, wildflower-right.png | 600x2400 | Site sides | Columns with soft inner edges. |
| wildflower-meadow.png | 3000x1100 | Site, under the names | Meadow and far peaks, fading to transparent at the top. |

Drop the finals into `public/site-art/batch-a/` (WebP with alpha, same names) and update the
`batchA(...)` sizes in `art.tsx`; nothing else changes.

## Known gaps

- Save the date fronts follow the mockups: Highland and Heirloom show names and date only (no place
  line), as the references do.
- Downstream site sections use the existing "invitation" and "evening" page styles. The mockups'
  painted section dividers (mist band, lavender sprigs, pines) are cut but not placed yet.
- Card colourways change the ink only; the watercolours keep their own colours.
