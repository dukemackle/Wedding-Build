# Inspiration library

Where to look before significant design work, and what each source is good for
here. Learn the pattern, then make something original. Never lift another
company's layout, branding, illustrations, photos or copy.

**Access check, 2026-10-19:** each URL was requested from a Claude Code cloud
session (plain HTTP, no login). "Reachable" means the page answered, not that
its gallery could be browsed: most galleries render client-side or need an
account. **Do not say you inspected an example unless you actually opened and
read that page in the current session.** If a site is blocked, say so and work
from principles or from a source that is reachable.

Legend: **I** inspiration only · **C** usable code · **A** assets · **T** templates

## 1. Award galleries and curated sites (visual ambition, marketing pages)

| Resource | Type | Best for / when to consult | Applies to You Do, I Do | Licence / access |
| --- | --- | --- | --- | --- |
| [Awwwards](https://www.awwwards.com) | I | Benchmark for craft on the landing page, hero motion, typography-led layouts. Look at "Sites of the Day" in hospitality, fashion and editorial. | Landing hero, `/estimate` as a showpiece, guest-site templates | Designs belong to their studios. Timed out from the cloud session. |
| [Godly](https://godly.website) | I | Fast scroll of current high-end web aesthetics; good for spotting what's fresh vs. dated. | Landing page, marketing sections | Reachable. Inspiration only. |
| [SiteInspire](https://www.siteinspire.com) | I | Calmer, editorial and typographic sites, filterable by style. Closest to the "premium but calm" tone. | Landing, guest-site typography | Rate-limited (429) from the cloud. |
| [CSS Design Awards](https://www.cssdesignawards.com) | I | UI/UX-scored winners, so usability is weighed, not just looks. | Landing, venue profiles | Reachable. |
| [Land-book](https://land-book.com) | I | Landing-page sections by type (hero, pricing, testimonials, footer). | Landing, future vendor-facing marketing page | Blocked (403) from the cloud. |
| [Lapa Ninja](https://www.lapa.ninja) | I | Same, with many SaaS examples. | Landing sections | Blocked (403) from the cloud. |
| [One Page Love](https://onepagelove.com) | I, T | One-page sites, including a wedding category. **The closest real-world reference set for guest sites.** | Guest-site templates, RSVP-first layouts | Reachable. Some templates are paid; check each. |

## 2. App and UX patterns (dashboards, flows, mobile)

| Resource | Type | Best for / when to consult | Applies to You Do, I Do | Licence / access |
| --- | --- | --- | --- | --- |
| [Mobbin](https://mobbin.com) | I | Real screenshots and full flows from shipped iOS/web apps: onboarding, empty states, settings, search with map. | Onboarding, dashboard, mobile nav, Venues/Vendors map + sheet | Landing reachable; library needs an account, most of it paid. Screenshots are the apps' own IP. |
| [Refero](https://refero.design) | I | Searchable web-app UI by pattern ("empty state", "pricing", "filters"). | Budget, checklist, guest list tables, filters | Reachable; full library paid. |
| [Page Flows](https://pageflows.com) | I | Recorded user journeys (signup, checkout, invite). | Signup → interview → dashboard, RSVP flow, vendor inquiry | Blocked (403); paid. |
| [Behance](https://www.behance.net) | I | Case studies with rationale, brand systems, wedding stationery. | Guest-site aesthetics, stationery-inspired palettes | Blocked (403). Work is the creators'. |
| [Dribbble](https://dribbble.com) | I | Quick visual exploration of a component or screen. Treat as mood, not proof of usability (much is never shipped). | Card styles, icon ideas, Wren moments | Reachable (slow). Work is the creators'. |

## 3. Templates and real built sites

| Resource | Type | Best for / when to consult | Applies to You Do, I Do | Licence / access |
| --- | --- | --- | --- | --- |
| [Framer Marketplace](https://www.framer.com/marketplace/) | I, T | Wedding and event templates, current motion conventions. | Guest-site template ideas (structure, pacing, section order) | Reachable. Templates run only inside Framer and are licensed per purchase. Study, don't port. |
| [Made in Webflow](https://webflow.com/made-in-webflow) | I, T | Real Webflow sites, many wedding/event ones; some are cloneable. | Guest-site sections, interactions | Reachable. Clone licences cover use inside Webflow only. |
| [Figma Community](https://www.figma.com/community) | I, A, T | UI kits, wedding invitation layouts, icon sets. | Mockups before building | Blocked (403) from the cloud. Each file states its own licence; many are CC BY 4.0, which requires attribution. Check before using any asset. |

## 4. Components, code and motion

See [COMPONENT-RESOURCES.md](COMPONENT-RESOURCES.md) for how to use these in
this stack, and [ANIMATION-GUIDELINES.md](ANIMATION-GUIDELINES.md) for when.

| Resource | Type | Best for | Licence / access |
| --- | --- | --- | --- |
| [shadcn/ui](https://ui.shadcn.com) | C | Accessible, copy-in component patterns (dialog, sheet, command, popover). | MIT. Reachable. Built on Radix. |
| [Radix UI](https://www.radix-ui.com) | C | The accessibility behaviour behind those components (focus traps, roving tabindex). | MIT. Reachable. |
| [Aceternity UI](https://ui.aceternity.com) | C | Showy marketing effects (spotlight, parallax cards, text reveals). | Free tier (100+ components) allowed in commercial projects; "All-Access" is paid. Most components need Motion. Reachable. |
| [Magic UI](https://magicui.design) | C | Marketing micro-effects (number tickers, marquees, shimmer borders). | MIT (GitHub licence checked). Site timed out from the cloud. Most components need Motion. |
| [Motion](https://motion.dev) | C | React animation library: layout animation, shared elements, gestures, exit animations. | MIT. Reachable. **Not installed.** |
| [GSAP](https://gsap.com) | C | Timelines, ScrollTrigger, SVG morphing, text splitting. | Free for all, including commercial use (Webflow licence). **Not allowed** inside "tools that allow users to build visual animations without code" competing with Webflow, so **never in the guest-site editor's Motion/Animate tools.** Fine on our own marketing pages. Reachable. |
| [Rive](https://rive.app) | C, A | Interactive, state-machine character animation. | Runtimes are open source (MIT); the editor is freemium. Reachable. |
| [LottieFiles](https://lottiefiles.com) | A | Lightweight vector animations. | Free animations use the Lottie Simple License; check each file. Reachable. |

## 5. Type, colour, imagery, accessibility (added: not in the original brief)

| Resource | Use | Licence / access |
| --- | --- | --- |
| [Google Fonts](https://fonts.google.com) | Current fonts come from here via `next/font`. Guest-site pairings too. | OFL / Apache, free commercially. Reachable. |
| [Fontshare](https://www.fontshare.com) | Higher-end free display faces (Gambetta, Zodiak, Satoshi) if a pairing needs one. | Free for commercial use (ITF Free Font License). Reachable. Self-host; not in `next/font/google`. |
| [Coolors](https://coolors.co) | Contrast checks and palette mixing between the five brand colours. | Free tier. Reachable. |
| [Unsplash](https://unsplash.com/license) | Placeholder/demo photography for the landing previews. | Unsplash License: free commercially, no selling unaltered copies. License page returned 401 to the cloud check. |
| Rijksmuseum, Met Open Access, Wikimedia | Public-domain artwork for guest sites. | Rules already in `docs/site-art-sources.md`; follow them. |
| [Nielsen Norman Group](https://www.nngroup.com) | Evidence for UX arguments (form design, empty states, navigation). | Reachable. |
| [WCAG 2.2 quick reference](https://www.w3.org/WAI/WCAG22/quickref/) | Contrast, target size (24px minimum), focus visible. | Reachable. |

## Wedding-specific references worth studying (patterns only)

Zola, The Knot and Joy are direct competitors (see `docs/competitors.md`); study
their guest-site galleries and RSVP flows for what couples now expect, never
for anything to copy. Stationery houses (Minted, Paperless Post, Shine) show
the typography and paper-texture taste that couples are comparing our
templates against.

## Keeping this current

When a research session finds a source that changed licence, went paid, or a
new one worth adding, edit the row and its date. Remove dead ones.
