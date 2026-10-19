# UX review checklist

Use for a design review, before showing a preview, and after building. Pick
the sections that apply; don't paste the whole list back to the owner. Report
findings as: what, where (`file:line`), why it matters to a couple, and
severity (P0–P3, defined in DESIGN-OPPORTUNITIES.md).

## Journey

- [ ] What is the couple trying to do here, and is that the most prominent
      thing on screen?
- [ ] Is the next step obvious? Is there exactly one primary action?
- [ ] Does it work for a couple with no date, venue or budget yet?
- [ ] Where do they arrive from and go next? Any dead ends ("set up first"
      with no way to do it in place)?
- [ ] Naming matches elsewhere (nav label = tile label = page title; "You Do,
      I Do" for the company, "Wren" only for the assistant).

## Hierarchy and composition

- [ ] One display-type moment; headings step down clearly.
- [ ] Alignment is consistent within each block (no centred mark over a
      left-aligned stack).
- [ ] Spacing follows the scale; related things are closer than unrelated.
- [ ] At most one or two gold highlights.
- [ ] Desktop at ~1440px uses the width (columns, side panels), not a phone
      column with margins. Phone at 375px is one column, no sideways scroll,
      thumb-reachable primary action.

## States

- [ ] Empty: explains purpose, offers one action, no fake data presented as
      real (samples labelled).
- [ ] Loading: skeleton matches final layout (no jump).
- [ ] Error: says what happened and what to do, keeps the couple's input.
- [ ] Success: confirms in place; milestone moments celebrated once.
- [ ] Long content: long names, 300 guests, $1,234,567, 40-character venue
      names, missing photos.

## Forms

- [ ] Only what's needed now is required; the rest can come later.
- [ ] Visible labels (not placeholder-only), hints for formats, errors next
      to the field and announced (`aria-describedby`, `aria-invalid`).
- [ ] Right input types/modes on phones (`inputmode`, `type=email|tel|date`).
- [ ] Known data is prefilled (wedding date, guest count, location).
- [ ] No hidden affordances (e.g. "press Tab to…" doesn't exist on phones).
- [ ] New form that collects details? Check `docs/legal.md`.

## Accessibility

- [ ] Keyboard: every control reachable, visible focus, logical order,
      Escape closes overlays, focus returns.
- [ ] Contrast ≥ 4.5:1 text, 3:1 large text and UI edges; no light yellows,
      Sky or Aqua as text on white.
- [ ] Targets ≥ 24px, primary touch actions ≥ 44px.
- [ ] Images: meaningful alt or `alt=""` + decorative.
- [ ] Motion: reduced-motion gives the finished still state.
- [ ] Headings form an outline; landmarks present.

## Performance

- [ ] No new client component where a server component would do.
- [ ] Images sized and lazy below the fold (`next/image`).
- [ ] No new dependency without approval; guest page bundle not grown.
- [ ] No layout shift from fonts, images or animated entrances.

## Visual verification

Use Playwright with the preinstalled Chromium
(`executablePath: '/opt/pw-browsers/chromium'` if versions mismatch; never
`playwright install`). Screenshot at 375×812 and 1440×900 (and 768 if the
layout changes there), check the console for errors, tab through once. Signed-in
pages need a test account; if that isn't available, say which screens were
reviewed from code only.
