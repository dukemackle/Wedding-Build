# Design decisions and preferences

Durable choices the owner has explicitly approved or rejected, so future work
builds on them instead of re-asking. Record only explicit approvals or
rejections, not passing remarks. Newest first within each section. Each
entry: date, decision, reason, and where it's applied.

Brand-level rules already in `CLAUDE.md` (palette, colour roles, widths,
two designs per screen size, Venues/Vendors full-bleed) are decisions too.
They're summarised here only by reference; CLAUDE.md is the source.

## Approved directions

- **2026-10-19:** First-run setup is Direction A: Wren asks five questions,
  one per screen, only the names required; the desktop shows the dashboard
  filling in beside the question; it ends on the couple's budget estimate as
  the page's gold moment plus three ordered first steps. "Roughly when" is
  season only (no year column). The dashboard's existing form stays for
  editing. Rejected alternatives: a shorter single form (B), no setup at all
  (C). Mockup: https://claude.ai/artifact/MKwFy2KT4NiNuEYcZDVH9T
- **2026-10-19:** Keyboard focus is a deep-gold ring (`#9a6b00`, bright Gold
  on navy fills, soft gold halo on fields); 404 and error pages are a
  centred card with Wren idling, a mono eyebrow, a display heading and two
  actions (`src/components/lost-page.tsx`). PR #896.
- **2026-10-11:** Guest site "Your designs" gallery + template gallery
  modelled on Canva's "Continue designing" (docs/guest-site-editor.md).
- **2026-10-08:** Guest-site Editor v2: free placement *within* sections on
  a snapping grid, separate phone layouts, reversing the earlier "no
  free-form canvas" rule. Mockup:
  https://claude.ai/artifact/NTyvaB5B6VAdyV2sFx4abw
- **2026-09-28:** New palette (Lemon, Gold, Royal, Sky, Aqua); gold = You Do,
  I Do's highlights on white, blue = Wren on navy; one or two highlights per
  page. (CLAUDE.md)
- **2026-09-27:** Rebrand to You Do, I Do: wordmark, linked rings with a
  diamond, navy + Sunshine. Wren remains the assistant. (CLAUDE.md)
- **2026-09-27:** Guest-site editor: desktop panel + live preview, phone
  sheet; draft and publish. Mockup:
  https://claude.ai/artifact/XR8AQDdZnMSokSc9sqZLDk
- **2026-09-22:** Venues/Vendors as Zillow-style full-bleed browse;
  five-width page scale. (CLAUDE.md)
- **2026-09-20:** Desktop and mobile are two designs, not one that
  stretches. (CLAUDE.md)

## Rejected

_None recorded yet._

## Typography preferences

- Cormorant (display), IBM Plex Sans (body), IBM Plex Mono (numbers,
  eyebrows). In place since before this log; no explicit re-approval needed
  to keep them, approval needed to change them.

## Animation preferences

- Subtle, short, CSS-first; reduced motion always honoured (existing code
  and docs/guest-site-editor.md).

## Component conventions

- Cards separate from the page by shadow, with hairline borders, on a warm
  white base (globals.css header comment).

## Copy and voice

- See the `wren-voice` skill.
