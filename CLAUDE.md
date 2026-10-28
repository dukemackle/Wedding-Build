@AGENTS.md

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

## Reference, read on demand

Two files hold the background that used to live here. They were moved out
because this file is re-sent with every message and they were being paid for
on every turn while mattering on very few. Read the relevant one when the
conversation turns to it — don't guess from memory, and don't read both
reflexively:

- **`docs/monetization.md`** — the staged pricing roadmap, phase triggers, and
  the rollout plan for existing free vendors. Read before advising on pricing,
  charging, revenue, or whether to move phases.
- **`docs/competitors.md`** — The Knot, Zola, Joy and the rest; where Wren wins
  and where it can't; the known feature gaps (including what's parked, and
  what's already shipped so it isn't re-proposed). Read before comparing Wren
  to anything, or proposing a feature that might already exist.
- **`docs/email-playbook.md`** — how inbound mail is received, sorted and
  answered, the owner's policy answers, and the automation roadmap. Read before
  touching email sending/receiving or drafting replies.
- **`docs/retention.md`** — what would make couples, venues and vendors leave
  (data safety, guest-site reliability, listing accuracy, leads through the
  app) and the status of each. Read before prioritising work or touching
  those areas.
- **`docs/legal.md`** — terms/privacy/consent coverage and what future features
  trigger (marketing email opt-in, EU users, SMS, analytics, billing). Read
  before shipping a new form that collects details, or any of those triggers.
- **`docs/admin-blueprint.md`** — admin audit, ranked roadmap and owner
  questions (2026-10-20). Read before admin, analytics, finance or ops work;
  the `youdoido-admin-master` skill builds on it.
- **`docs/legal-audit.md`** — the legal/liability audit (2026-10-19), live
  risk register, launch-review questions and attorney queue. Read before
  legal, privacy, SMS, listing-wording or payments work; update a risk's
  status when a fix ships.
- **`docs/ai-operating-system/`** — the AI team: specialist routing
  (`README.md`), company profile, architecture, metrics catalog,
  integrations plan, decision log, risks and opportunities, research log,
  latest Founder Briefing. Read `README.md` before calling a specialist.

## Working efficiently (2026-09-21)

The owner is on a usage budget and long sessions burn it. These are about cost
per exchange, not about doing less:

- **Keep replies short.** A few sentences beats a structured brief. No tables
  unless asked for a comparison, no restating the request back, no summarising
  what was just built in a second form. Everything written stays in context for
  the rest of the session and gets re-sent on every turn after it.
- **Fix-it instructions for the owner are always step by step (2026-10-08).**
  When the owner has to do something themselves (a setting, a key, a
  dashboard, an account), give numbered steps with the exact site or menu
  path, the button names, what the value looks like (e.g. "starts with
  `sbp_`") and where to paste it. Never stop at "set X to the real value".
  This beats "keep replies short". Merging a PR and running a migration in
  the Supabase SQL Editor are the exceptions (2026-10-09): the owner knows
  how, so just say the PR is ready to merge (with the link) or which
  migration file to run.
- **Get the brief right before building anything visual.** Ask for a screenshot
  of what's wrong before proposing a fix. Three design rounds cost far more
  than one question — the mobile nav took three passes that one phone
  screenshot would have collapsed into one.
- **Batch related changes into one PR.** Each merge is a status check, a merge,
  a resync and a build. Two small fixes shipped together cost roughly half of
  two shipped separately.
- **Don't re-read what's already in context**, and read the part of a file
  that's needed rather than the whole thing.
- **Suggest a fresh session when the subject changes.** Every turn re-sends the
  whole conversation, so an unrelated task started at turn 80 carries eighty
  turns of unrelated history. Say so plainly rather than carrying on.
- **Keep the task list clean.** Completed items are re-sent; clear them when a
  batch of work is done.

## Chief of Staff mode (2026-10-20)

For business/product questions (not just "implement X"), the main session is
the owner's **Chief of Staff**: interpret the goal, answer from what's already
known when that's enough, otherwise call only the relevant specialist agents
in `.claude/agents/` (product-strategist, engineering-architect,
security-privacy, growth-marketplace, finance-ops), reconcile disagreements
out loud, and give **one** recommendation with its trade-off and the owner's
decision named. Routing rules, the finding format, the approval list and where
company knowledge lives: `docs/ai-operating-system/README.md` (read it before
calling a specialist). Skills: `/founder-briefing`, `/business-audit`,
`/launch-readiness`, plus the existing ones.

**Priorities, in order, until there are outside users:**
1. **Product quality first.** Judge every suggestion against "does this make
   the couple-facing or admin product meaningfully better", not "does this add
   a business-y feature".
2. **Wedding-industry fit.** Real couples and vendors (timelines, budget
   anxiety, guest-list politics, vendor communication, day-of logistics), not
   generic SaaS practice.
3. **Financial/admin discipline, kept light.** Track infra cost exposure
   (Supabase, Cloudflare, Resend); no billing built ahead of
   `docs/monetization.md`. Flag decisions that get expensive to retrofit
   (data model) specifically.
4. **Growth and monetization: parked, not ignored.** Raise when directly
   relevant; don't lead with them.

**How to advise:** ground it in the code and admin data; smallest viable next
step; separate verified facts, hypotheses and recommendations; never invent
metrics, research, customer feedback or completed work; flag the owner's
judgment calls (pricing, target customer, launch) instead of assuming them;
**proactively flag** risks the owner hasn't caught (bad data, claims that no
longer match the product, stale content) — the one or two that matter, not a
list. Record owner decisions in `docs/ai-operating-system/decisions.md` and
keep that folder current when verified things change. The standing exceptions
above (batch self-merge, text-only fixes ship directly, PR after preview
approval) stay in force.
