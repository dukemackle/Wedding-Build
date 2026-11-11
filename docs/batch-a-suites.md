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

## Final art: decided, in progress

Owner decision 2026-11-11: final art before the PR (print-ready at launch). ChatGPT images top out
at 1024x1536, below 300dpi for 5x7, so the plan is: generate text-free originals at ChatGPT's
largest size, then Claude upscales them 1.5-2x and cuts the small pieces (corners, columns, sprigs,
peaks, pines) from them. Seven files:

| # | File | ChatGPT size | Attach | Becomes |
|---|---|---|---|---|
| 1 | highland-std.png | 1024x1536 tall | 01 | **Done 2026-11-11**: one painting for both Highland cards (the invitation sets it 110 units lower) |
| 2 | ~~highland-inv.png~~ | | | Not needed: file 1 serves both cards. Owner dropped the sprig and peaks at the top (2026-11-11) |
| 3 | highland-panorama.png | 1536x1024 wide | 03 | Site band under the names |
| 4 | heirloom-std.png | 1024x1536 tall | 04 | Save the date art; sprig cut from it |
| 5 | heirloom-inv.png | 1024x1536 tall | 05 | Invitation art; site corners cut from it |
| 6 | wildflower-frame.png | 1024x1536 tall | 07 | Both cards; site columns cut from it |
| 7 | wildflower-meadow.png | 1536x1024 wide | 07 | Site band under the names |

### How

- One ChatGPT chat per suite (Highland: files 1-3, Heirloom: 4-5, Wildflower: 6-7). Attach the
  approved reference named in the table, then paste the piece's prompt and the Rules block.
- After the first image in a chat, start each prompt with "Same artist, same style, same palette
  as the previous image."
- Compare each result with the approved mockup before keeping it: ChatGPT repaints rather than
  copies, so peonies or peaks can drift. Regenerate until it's the same painting in spirit.
- Download as PNG with the name above and send them to Claude.

### Prompts

1. **highland-std.png**: Repaint the artwork from the attached save the date as a single
   illustration with no text. Same watercolour alpine lake, snowy peaks, tall pines on the left,
   lupines, daisies and paintbrush flowers and rocks in the foreground, filling the bottom 52% of
   the canvas edge to edge. At the top centre, the same small olive sprig with a tiny ink mountain
   motif under it. Everything between them stays empty. Tall 1024x1536.
2. **highland-inv.png**: Repaint the artwork from the attached invitation with no text. The same
   lake, peaks and wildflower foreground filling the bottom 42% edge to edge, soft clouds only at
   the far left and right just above it. A small olive sprig at the top centre and a tiny ink
   mountain motif at 38% down, centred. Everything else empty. Tall 1024x1536.
3. **highland-panorama.png**: Repaint the landscape from the attached website as a wide panorama
   with no text: snowy peaks across the full width, pines on both sides, the lake in the middle,
   wildflowers and rocks along the bottom edge. The sky is faint and fades to fully transparent at
   the top. Wide 1536x1024, scene in the lower two thirds.
4. **heirloom-std.png**: Repaint the flowers from the attached save the date with no text. The
   same burgundy peony, blush garden rose, mauve hellebore, berries and sage leaves as one cluster
   running off the top-left corner with a trailing stem of buds down the left edge; a second
   cluster (cream peony, blush rose, burgundy peony, berries) running off the bottom-right corner
   with a leafy spray reaching left. The centre 60% stays empty. Tall 1024x1536.
5. **heirloom-inv.png**: Repaint the flowers from the attached invitation with no text: the
   top-left cluster with cream hydrangea and the stem down the left edge, the bottom-right cluster
   with the spray climbing the right edge. The centre stays empty. Tall 1024x1536.
6. **wildflower-frame.png**: Repaint the flower frame from the attached invitation with no text,
   as a 5x7 card: orange poppies, blue delphiniums, yellow daisies, pink cosmos and small white
   daisies climbing both side edges, a light garland across the top corners, and a meadow with
   distant snowy peaks across the bottom 25%. The centre column (middle 55% of the width) stays
   empty from top to the meadow. Tall 1024x1536.
7. **wildflower-meadow.png**: Same artist and flowers as the previous image: a wide meadow
   panorama with distant snowy peaks and pines, a big orange poppy cluster on the left and blue
   delphiniums and yellow daisies on the right, fading to fully transparent at the top. Wide
   1536x1024.

### Rules block (paste after every prompt)

> Soft, detailed hand-painted watercolour, as in the reference. Transparent background (PNG with
> alpha): no paper colour, no paper texture, no deckled edge, no border, no shadow. Absolutely no
> text, letters, numbers, lines or rules anywhere. Leave the empty areas fully transparent.

## Known gaps

- Save the date fronts follow the mockups: Highland and Heirloom show names and date only (no place
  line), as the references do.
- Downstream site sections use the existing "invitation" and "evening" page styles. The mockups'
  painted section dividers (mist band, lavender sprigs, pines) are cut but not placed yet.
- Card colourways change the ink only; the watercolours keep their own colours.
