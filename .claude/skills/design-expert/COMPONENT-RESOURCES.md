# Component resources: what to reuse, what to borrow, what to avoid

The stack is **Next.js 16 (App Router), React 19, Tailwind CSS v4, TypeScript**,
deployed to Cloudflare Workers (Workers Paid since about 2026-10; server
work and bundle size still matter for speed and cost). No component library and no animation
library is installed. Three.js / react-three-fiber are installed for specific
3D pieces (`src/components/three/`).

## Order of preference

1. **An existing component in `src/components/`.** Check first. Examples:
   `page-shell.tsx` (page widths), `search-shell.tsx` (map + results browse),
   `listing-modal.tsx`, `photo-gallery.tsx`, `framed-photo.tsx`, `cta-card.tsx`,
   `page-skeleton.tsx`, `pending-submit.tsx`, `filter-dropdown.tsx`,
   `fade-in-section.tsx`, `stagger-words.tsx`, `animated-counter.tsx`,
   `confirmed-badge.tsx`, `caution.tsx`, `icons.tsx`, `brand-rings.tsx`,
   `wren-mark.tsx`. Inventory and gaps in [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md).
2. **A class or keyframe already in `src/app/globals.css`** (`btn-motion`,
   `link-underline`, `animate-page-in`, `gold-*`, the `site-*` guest-site
   classes). Extend there rather than inventing a parallel one.
3. **A pattern copied in from shadcn/ui or Radix's source, rewritten in our
   tokens.** Their accessibility behaviour (focus trap, Escape to close,
   `aria-*` wiring, roving focus) is the valuable part; their styling is not.
   Copying a single component's source in is fine (MIT). Adding the Radix
   packages is a dependency and needs the owner's approval.
4. **An effect from Aceternity UI or Magic UI.** Most require Motion (`motion`
   package). Reimplement in CSS if the effect is simple (marquee, shimmer,
   number ticker, spotlight); propose Motion only when several effects would
   need it. Marketing pages only, never inside planning tools.

## Dependencies: the rule

Never add a package silently. When one is genuinely useful, tell the owner:
what it does that we can't do in CSS or ~50 lines, its size (gzipped), the
licence, and which pages load it. Candidates that have come up, with a
default answer:

| Package | Default | Why |
| --- | --- | --- |
| `motion` | Not yet. Propose if shared-element/layout animation or exit animations become a repeated need (e.g. dashboard card → page morph). | ~ tens of KB; CSS covers most current needs. |
| `gsap` | Only for a marketing showpiece. Never in the guest-site editor (licence, see INSPIRATION-LIBRARY). | Powerful timelines, but heavy for app pages. |
| `@radix-ui/*` | Reasonable if dialogs/menus keep being hand-rolled with gaps in focus handling. | Accessibility done right. |
| `lottie-web` / `@rive-app/react-canvas` | Only for a Wren character moment the CSS/SVG bird can't do. | Large runtimes for one animation. |
| Icon packs | No. `icons.tsx` holds our own set; add to it. | Consistency of stroke and size. |

## Borrowing rules

- Licence check before anything is copied: MIT/Apache/OFL are fine; "free for
  personal use" is not; CC BY needs attribution; paid tiers need the owner.
- Rename and restyle to our tokens; no `bg-zinc-900` or shadcn's neutral greys
  leaking in. See the palette rules in CLAUDE.md.
- Keep client components small. A copied component that drags a provider tree
  onto a server page is a regression on the 10 ms CPU budget and bundle size.
