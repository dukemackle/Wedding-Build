# Design system: what exists, and the direction

Audited 2026-10-19 from the code. **"Current"** describes what is there;
**"Direction"** is the recommended convention for new or touched code. Apply
the direction when you're already changing a file. Don't refactor stable
screens just to conform.

Stack: Next.js 16 App Router, React 19, Tailwind v4 (`@theme inline` in
`src/app/globals.css`, no tailwind.config). No component or animation
library.

## Typography

**Current.** `src/app/layout.tsx` loads three Google fonts with `next/font`:
Cormorant 400–700 → `font-display`; IBM Plex Sans 400–600 → `font-body`
(default on `<body>`); IBM Plex Mono 400–500 → `font-mono-numbers` (numbers
and eyebrows). Common headings: h1 `font-display text-3xl font-semibold
text-forest` (~37 uses), h2 `font-display text-xl|2xl font-semibold
text-forest`. Eyebrow: `font-mono-numbers text-[11px] uppercase
tracking-[0.18em] text-brass` (tracking varies 0.18–0.3em).

**Direction.** Scale (rem / px at 16px):

| Role | Classes | Notes |
| --- | --- | --- |
| Display (marketing hero) | `font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.05]` | One per page |
| Page title (app) | `font-display text-3xl font-semibold text-forest` | Existing h1 |
| Section title | `font-display text-2xl font-semibold text-forest` | |
| Card title | `font-display text-xl font-semibold text-forest` | |
| Body | `text-base` (phones ≥ 15px) | Plex Sans |
| Secondary | `text-sm text-ink/70` | |
| Eyebrow | `font-mono-numbers text-[11px] uppercase tracking-[0.18em] text-brass` | Labels only, never sentences |
| Numbers | `font-mono-numbers tabular-nums` | Money, counts, dates |

Muted text: settle on three steps, `text-ink/80` (secondary body),
`text-ink/70` (captions), `text-ink/50` (disabled/placeholder only; it fails
4.5:1 for real text on parchment). Today /40, /50, /60, /70, /80 all appear.

## Colour

**Current tokens** (`:root` in globals.css): `parchment #fcfbf7` page,
`card #fff`, `hairline #ece8df`, `forest #14203d` and `ink #14203d` (same
navy, two names), `brass #e0a100` (Sunshine), `wren #00bffe`,
`wren-soft #e6f8ff`, `wren-deep #0077a8`. Unlayered overrides: `.text-brass`
is `#9a6b00` for contrast; `.bg-forest`, `.bg-brass`, `.bg-wren` are
in-family gradients. Palette for new colours: Lemon `#FFF12F`, Gold
`#FFD301`, Royal `#2243B6`, Sky `#00BFFE`, Aqua `#5AE4FF` (CLAUDE.md).

**Gaps.** About 409 hex literals in .tsx (worst: `site-scene.tsx`,
`landing/feature-previews.tsx`, `brand-rings.tsx`, guest-site editor files;
art and guest themes are legitimately literal) and ~189 stock Tailwind
colours, mostly `red-*` for errors. There are no semantic status tokens.
`cta-card.tsx` and `src/app/page.tsx` hardcode golds (`#9a6b00`, `#d99a00`,
`#fff8e1`).

**Direction.** When the next PR touches errors or status, add semantic
tokens in `:root` + `@theme`: `--color-danger` (text ≥ 4.5:1, e.g. a deep
red), `--color-danger-soft`, `--color-success` (draw from Royal/Aqua or a
green if the owner approves; flag it), `--color-success-soft`,
`--color-warning` = brass family. Replace `red-*` as files are touched.
Literal hex stays acceptable in art, guest themes and the logo.

## Spacing, radius, elevation

- Spacing: Tailwind's 4px scale. Cards `p-5 sm:p-8`; sections `gap-6`/`gap-8`;
  page top padding via `PageShell`.
- Radius tokens: `--radius-md .625rem`, `--radius-lg 1rem`. Usage today:
  `rounded-md` (466) for buttons and inputs, `rounded-full` (452) for chips,
  pills and avatars, `rounded-lg` (254) for cards, `rounded-xl` for
  modals/panels, `rounded-3xl` for the CTA card only. **Keep exactly that
  mapping.**
- Shadow: custom navy-tinted `shadow-sm` is the card shadow (cards separate
  by shadow, borders are hairline). `shadow-lg` for popovers/menus,
  `shadow-2xl` for modals only. Avoid bare `shadow` and `shadow-md`.

## Layout

Widths: READING / STANDARD / WIDE / CANVAS / FULL in `src/lib/layout.ts`,
through `PageShell`. No sixth width, no page-level `max-w-*`. Nav is
full-bleed. Browse screens use `search-shell.tsx`.

Breakpoints in use: `sm` (640) for nav and most stacking, `lg` (1024) for
browse screens and the site editor, `md` used ad hoc. **Direction:** `sm` =
phone vs. not-phone for simple stacking; `lg` = the point where a screen
gets its desktop composition (side panels, map beside list). Avoid `md` as a
layout switch in new code.

## Components

| Need | Use | Status |
| --- | --- | --- |
| Page frame | `PageShell` | Good |
| Planning-page header | `PageHeader` (`page-header.tsx`): eyebrow, headline with an italic royal-blue end, one line, actions, landing feature photo; optional full-width `toolbar` row (layout tools, guests' stage panel, itinerary publish bar); one header per page, never a second titled card under it | Budget, guests, checklist, itinerary, layout, registry |
| Page's main action | `btn-primary` (gold pill, navy text, `PlusIcon` for "Add …") | One per page |
| Its other actions | `btn-secondary` (navy 2px outline pill) | Planning pages |
| Primary button | `rounded-md bg-forest px-4 py-2 text-sm font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60` (+ `btn-motion` on marketing) | ~6 near-duplicate variants; no shared component |
| Secondary | `rounded-md border border-hairline px-3 py-2 text-sm text-ink hover:border-forest disabled:opacity-60` | |
| Chip / filter | `rounded-full border border-hairline bg-card px-3 py-1 text-sm` | |
| Submit with pending | `PendingSubmit` | Use it |
| Input | `rounded-md border border-hairline bg-card px-3 py-2 text-ink focus:border-forest` | bg split parchment vs card; use **card** |
| Card | `rounded-lg border border-hairline bg-card p-5 sm:p-8 shadow-sm` | |
| Gold moment card | `CtaCard` (`gold-flow-border`, `gold-shine`, `gold-twinkle`) | One per page max |
| Dialog | `listing-modal.tsx` (intercepted route) | No focus trap; only dialog |
| Checklist journey | `checklist-ui.tsx`: `ProgressRing`, `StageNode`/`StageLine` timeline, `TaskTick` (gold + sparks), `DueChip` (urgency colours), `StageIcon`, `StageConfetti` | Checklist page and its landing demo |
| Empty state | `BirdEmptyState` (`wren-moments.tsx`) | Good; pair with one action |
| Loading | `PageSkeleton` + `loading.tsx` (11 routes) | Good |
| Error page | none (`error.tsx`, `not-found.tsx` missing) | **Gap** |
| Inline error | `border-red-300 bg-red-50 text-red-800` | Move to tokens |
| Icons | `icons.tsx` | Add here, no icon packs |

**Direction:** when a PR next touches several buttons, extract
`src/components/button.tsx` (variants primary / secondary / quiet / danger,
sizes sm / md) using the strings above, and adopt it file by file. Same for
`field.tsx` (label + input + hint + error, wired with `aria-describedby`).
This needs the owner's go-ahead as a small refactor; propose it, don't
slip it in.

## Navigation

`PageShell` → `PublicNav` (logged out) or `AppNav` (two rows: mark +
account; tab strip from `nav-links.tsx` with dropdowns), wrapped in
`AutoHideHeader`. Below 640px `mobile-nav.tsx` gives a corner panel. Tile
names on the dashboard and labels in the nav should match (they don't fully
today, see the backlog).

## Motion

CSS keyframes in globals.css (page-in, stagger words, link underline,
btn-motion, Wren bird set, `wren-*` micro-feedback, `ydid-*` logo, guest-site
`site-*`/`el-*` with `animation-timeline: view()`, planning pages'
`page-photo-drift`, `rise-in`, `rise-stagger` for list rows, `paid-glow` /
`paid-pop`). Celebrations use `BirdCheer`: a line paid in full, a checklist
stage done, the last guest seated, RSVP milestones (`rsvp-milestone.tsx`). See
[ANIMATION-GUIDELINES.md](ANIMATION-GUIDELINES.md).

## Accessibility conventions

**Current:** `aria-label` widely used (221); `sr-only` 24; `focus-visible:`
only 16 uses, and inputs use `outline-none` with just a border change; no
skip link; modal lacks a focus trap; images mostly have alt (53 decorative
`alt=""`).

**Direction (required on new or touched code):**
- Focus ring: `focus-visible:outline-2 focus-visible:outline-offset-2
  focus-visible:outline-brass` on navy-on-white controls; on navy fills use
  `outline-wren`. Inputs keep the border change *and* add a ring.
- A global skip link in `layout.tsx` (`#main`), when the next layout PR runs.
- Dialogs: trap focus, restore focus on close, Escape closes.
- Touch targets ≥ 44px for primary phone actions.
- Status never by colour alone (add an icon or word).

## Guest sites

A separate, much richer system: `src/lib/site-design.ts` (themes, palettes,
fonts, pairings, hero layouts, ornaments, art, backgrounds, motion),
`site-templates.ts` (28 templates, 8 tags; three "Signature" ones with their own page styles), `site-canvas*.ts`,
`guest-site-theme.tsx` (CSS variables via `designCssVars`), and the `.guest-site`
remap in globals.css. Editor at `src/app/guests/site/`. The approved design
and its history are in `docs/guest-site-editor.md`; read it before changing
anything there.
