# Animation guidelines

Motion earns its place by doing a job: **confirm** (a tick, a saved state),
**orient** (where something came from or went), **reveal** (content arriving
in a readable order), or **celebrate** (a real milestone: venue booked, site
published, first RSVP). Anything else is decoration and needs a reason.

## Budget by surface

| Surface | Allowed | Not allowed |
| --- | --- | --- |
| Landing / marketing | Hero entrance, scroll reveals, one showpiece (e.g. rings drawing, estimator counting) | Scroll-jacking, parallax on body text, loops behind copy |
| Planning tools | Feedback (check pop, strike-through, value bump), panel open/close, skeleton → content | Entrance animation on every card, looping motion, anything > 300ms blocking input |
| Guest sites | Whatever the couple chose in Motion/Animate, rendered in CSS | Motion that ignores the guest's reduced-motion setting |
| Wren | The bird's moods (`wren-*` classes): think, cheer, wave, hop; one at a time | Wren animating while the couple types |
| Admin | None beyond state changes | |

## Timing

- Micro feedback 120–200ms; panels and sheets 200–300ms; page entrance
  300–450ms; celebration up to ~1.2s, once.
- Easing: entrances `cubic-bezier(0.22, 1, 0.36, 1)` (already used);
  playful lifts `cubic-bezier(0.34, 1.56, 0.64, 1)` (`btn-motion`); exits
  faster than entrances.
- Animate `transform` and `opacity` only. Never width/height/top/left on
  scroll.

## Tools, in order

1. **CSS** keyframes/transitions in `globals.css`, `motion-safe:` /
   `motion-reduce:` utilities. Covers nearly everything here today.
2. **Scroll-driven CSS** (`animation-timeline: view()`) with an
   IntersectionObserver or on-load fallback, as the guest site already does.
3. **View Transitions** (`document.startViewTransition`, or Next's support
   if the version in `node_modules/next/dist/docs/` documents it) for
   shared-element moves such as a dashboard tile expanding into its page.
   Check the docs first (AGENTS.md: this Next differs from training data).
4. **SVG** stroke-draw (`stroke-dasharray`) for the rings, line art,
   ornaments (`orn-draw` exists).
5. **Motion (motion.dev)**: only with approval, when layout/exit animation
   across React state is needed repeatedly. MIT.
6. **GSAP + ScrollTrigger**: marketing showpiece only, with approval. Its
   licence forbids use in no-code visual animation builders competing with
   Webflow, so **never in the guest-site editor or anything couples use to
   build animations.**
7. **Lottie / Rive**: only for a character moment the CSS bird can't do.
8. **three.js**: already used for the 3D venue layout; keep it to that.

## Non-negotiables

- `prefers-reduced-motion: reduce` gets the still, finished state, not a
  slower version. Every new keyframe gets a reduce rule or a `motion-safe:`
  gate. JS motion checks `matchMedia` (see `animated-counter.tsx`,
  `site-motion.tsx`'s `useReducedMotion`).
- Nothing animates focus away or moves a control while it's being used.
- No layout shift: reserve space before content animates in.
- Keep JS off the guest page unless needed (its bundle was cut from 139 to
  51 KB gzipped; don't undo that).
- Test on a mid phone: if it drops frames, cut it.

## Ideas worth trying (not approved)

- Dashboard tile → page shared-element transition (View Transitions).
- Milestone moments in the brand's gold (venue booked, site live, all RSVPs
  in), using the existing `milestone-bird` pattern, once each.
- Wren "typing" state that matches the bird's think animation.
- Landing hero: the rings drawing in once, then still.

Log any that ship or get rejected in [DECISIONS.md](DECISIONS.md).
