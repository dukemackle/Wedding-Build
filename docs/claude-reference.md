# CLAUDE.md background (moved 2026-11-04)

The full wording of the CLAUDE.md rules, with their history and reasoning, moved here to cut what every turn re-sends. CLAUDE.md keeps the rules; read this when a rule's detail matters.

# Business Advisor Mode: Wren

**Rebrand (2026-09-27):** the product is now **You Do, I Do** (wordmark "You do,
*I do*", two linked rings with a diamond in `src/components/brand-rings.tsx`;
navy `#14203d` + "Sunshine" yellow `#e0a100`, deeper `#9a6b00` for small text).
**Wren** stays as the name of the AI assistant (the bird), so copy where Wren
reads, drafts or answers keeps "Wren"; copy naming the company or site says
"You Do, I Do". The domain is youdoido.com (bought 2026-10-01); wrenwed.com 301s to it.

**Colour palette (2026-09-28): use these for every new or changed colour.**
Lemon `#FFF12F`, Gold `#FFD301`, Royal blue `#2243B6`, Sky `#00BFFE`, Aqua
`#5AE4FF`. When a change needs shades (e.g. tiers, bar charts), draw them from
these, or mix between them, rather than inventing new hexes. Existing
navy/Sunshine screens stay as they are until they're touched. Contrast: the two
yellows, Sky and Aqua are too light for white text or for small text on white.
Put navy or Royal-blue text on them, and use them as fills, never as body text.

You Do, I Do (formerly Wren, wrenwed.com; now youdoido.com) is a wedding-planning SaaS: a couple-facing app (guest list,
budget, seating/venue layout, itinerary, checklist, vendor/venue discovery) plus
an admin panel (admin.youdoido.com) for tracking couples, vendors, venues,
revenue, and growth. Current stage: **pre-launch, not yet monetized, no outside
users** — the owner is still building and testing solo.

**Design expert (2026-10-19):** use the project's `design-expert` skill
(`.claude/skills/design-expert/`, or `/design-expert`) whenever work involves
website design, user interfaces, frontend features, layouts, navigation, user
journeys, styling, animation or visual presentation. Treat design quality and
usability as part of the product work. Briefly recommend high-value design
improvements relevant to the current work, even unasked. For a major visual
change, propose a recommended direction before building. Never start a large
redesign nobody asked for, and never deploy without approval. Its backlog is
`DESIGN-OPPORTUNITIES.md` and its log of approved/rejected directions is
`DECISIONS.md`, both in that folder.

**Marketing department (2026-10-20):** use the `/marketing` skill
(`.claude/skills/marketing/`) for any marketing, growth, SEO, social, ads,
partnership, lifecycle or hello@ inbox work. It acts as CMO, keeps the live
picture in `STATE.md` and a ranked `BACKLOG.md`, and loads one specialist
playbook at a time. Drafts only: nothing is sent, posted, spent or published
without the owner's approval. It reuses `/vendor-outreach`, `/wren-voice` and
`/weekly-review` rather than duplicating them.

**Workflow note (2026-09-13, amended 2026-09-14):** for any visual/UI
change (icons, layout, colors, mascot art, etc.) or any bigger/riskier
change, render a preview (screenshot or generated image) and/or confirm
the plan with the owner before committing/pushing — don't ship-then-show.
Simple text-only or logic-only fixes (copy edits, a stat/label swap,
small server-action tweaks, migrations, RLS) can just be shipped directly
— no need to check in first for those.

**Colour roles (2026-09-28):** blue (`--color-wren`, #00bffe) belongs to Wren,
the assistant, and a few Wren-adjacent spots, and sits on navy. Gold
(`--color-brass` and the `gold-*` classes in globals.css) is You Do, I Do's
own, marks what matters most on a page, and sits on white — gold highlights
go on white or cream, not navy. Highlight and animate the important moments in those colours,
but keep it to one or two per page — if everything shines, nothing does.

**Keep the landing previews current, unasked (2026-09-28):** the landing page
shows the dashboard's own boxes (same order) and each opens a demo in
`src/components/landing/feature-previews.tsx`. Whenever a PR adds or changes a
couple-facing feature, update the matching demo and blurb in the same PR —
don't wait to be asked. Boxes and blurbs come from `buildFeatures` in
`src/app/dashboard/feature-grid.tsx` plus `BLURBS` in `landing-features.tsx`. Keep each blurb to one short sentence;
the demo shows the feature, so new capabilities go in the demo, not the blurb.

**Shipping (2026-09-22):** once the owner says the preview looks good, open
the pull request without asking again — pushing to a branch isn't shipping,
production deploys from `main`. The merge click stays the owner's.

**Venue and vendor batches merge themselves (2026-09-27, vendors 2026-09-28):**
a PR that only adds rows to the per-state batch files in `src/lib/batches/`
(or the older `src/lib/venue-batches.ts` / `vendor-batches.ts`) doesn't wait for the owner — merge it once the
Cloudflare build is green. The "Batches" GitHub Action
(`.github/workflows/batches.yml`, 2026-10-28) merges them and runs
`npm run import:batches`; the "Venue & vendor batches" routine now only
unsticks failed builds and conflicts. The script parses,
geocodes and reads websites on the runner and only writes through
`/api/batch-sync` (`BATCH_IMPORT_SECRET`), because doing that work in the
Worker ran Workers Free past 10 ms CPU per request (error 1102). "Add them" on
/admin/venues or /admin/vendors does the same by hand, a few at a time. Anything else in the PR (code, UI) still goes through the
owner. How to research, write and check a vendor batch lives in the
`/add-vendors` skill (`.claude/skills/add-vendors/`).

**50-state coverage (2026-10-02):** no marketing until every state has listings.
New batches go only in `src/lib/batches/venues/<state>.ts` or
`src/lib/batches/vendors/<state>.ts`, one file per state (businesses left out
go in `src/lib/batches/skipped/<state>.tsv`, which counts as a batch file), so several batch PRs
can run at once without conflicts; the two older files are closed. The plan
(metros per state and targets) is `scripts/coverage-plan.mjs`; `npm run
coverage` shows what's left. Name vendor batches after the plan's metro.

**Desktop and mobile are two designs, not one that stretches (2026-09-20,
restated 2026-09-20 — supersedes the earlier "desktop is settled" note):**
each screen size gets an arrangement composed for it. Neither is the other's
fallback.

The failure this exists to prevent runs in both directions. Squeezing a
desktop arrangement onto 375px gives you a seven-tab strip scrolling sideways.
Letting desktop inherit the mobile arrangement gives you what the app has
today: a single column of stacked full-width cards, centred on a 1440px screen
with empty margins either side — a phone layout with more whitespace, not a
desktop layout. A wide screen wants columns, side-by-side panels and denser
tables; a phone wants one column and a menu.

So: never adjust a shared value until both are tolerable (a shrunk font that
"works on both" is a regression on one of them). Use breakpoints to give each
its own arrangement, and check every new screen at both 375px and ~1440px
before showing it, saying in the preview which parts belong to which.

**Venues and Vendors are the exception to the width rule (2026-09-22):** both
are full-bleed browse screens modelled on Zillow -- a filter bar across the
top, map and results side by side on desktop, and on a phone the map as the
page with the results in a sheet dragged up from the bottom. They deliberately
have no `max-w-*` cap, so don't "fix" them back into a centred column. The
shared layout lives in `src/components/search-shell.tsx`.

**Venues and vendors are siblings (2026-10-23):** whenever a change touches
venues (browse page, filters, map pins, cards, listing page, claim form, admin),
check whether vendors need the same and say so in the PR: do it in the same PR,
or name why it doesn't apply (e.g. venue-only data like capacity). Same the
other way round. Shared pieces (`search-shell`, `filter-dropdown`,
`clustered-markers`) carry both; the gaps open up in the per-page files.

**Page widths are a fixed scale (2026-09-22):** five names in
`src/lib/layout.ts` — READING (2xl), STANDARD (4xl), WIDE (6xl), CANVAS
(1600px), FULL — and a rule in that file for which pages use which. Signed-in
pages go through `PageShell`, which takes a width name. The nav is not on the
scale: it spans the whole screen on every page (the Venues look), so it never
changes width as you navigate and is never too narrow for the tab strip. Don't
add a sixth width or hardcode a `max-w-*` on a page — that is how the previous
nine caps happened.

**Deployment (2026-09-12):** production deploys to Cloudflare Workers via the
dashboard's Git integration; the Build command must be `npm run cf:build`. When
a Cloudflare build fails, use the `/deploy-doctor` skill — it holds the known
fixes.

