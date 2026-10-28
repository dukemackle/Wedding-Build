---
name: batch-builder
description: The shared instructions for the four scheduled "Batch builder" routines (West, Central, South, Northeast). Each routine's prompt names its region and launch metros and points here. Not for hand-run batches; use /add-venues or /add-vendors for those.
---

# Batch builder run

You are running unattended. Your scheduled prompt gives YOUR REGION (a list of
states) and YOUR LAUNCH METROS in priority order. Add batches toward the
coverage plan for ONE state in your region, as one PR of 40-60 rows. Finish
within 100 minutes (the next run in your region starts 3 hours after this one).
Three other builders cover the other regions at the same time. Never touch a
state outside your region, so you can never collide with them.

1. Run `npm ci` if node_modules is missing, then `npm run coverage` and
   `npm run coverage -- launch`. The plan (metros, targets and LAUNCH_METROS)
   is `scripts/coverage-plan.mjs`; `npm run coverage -- <State>` shows a
   state's metros.
2. List open PRs. Skip any state that already has an open PR touching its file
   in `src/lib/batches/`.
3. Pick this run's KIND, then where to work. Runs alternate between venues and
   vendors (2026-10-20: vendor-only runs had left venues far behind). Take the
   current UTC hour, divide by 3 and round down: if that number is EVEN, this
   is a VENUE run; if ODD, a VENDOR run.
   - **Launch metros first (owner, 2026-10-22).** Take the first of your
     launch metros that isn't dry for this run's kind and whose state has no
     open PR, and work that metro for the whole run instead of a state pick:
     - VENUE run: new venues in and around that metro (its city, suburbs and
       the destination towns its couples use), aiming for 150+ venues in the
       metro, with Capacity and Price tier filled from the venue's own site
       wherever it shows them. Rows go in that metro's own state's files only.
       Before researching, list what the state's batch and skipped files
       already hold for those towns so nothing is repeated.
     - VENDOR run: that metro's gaps from `npm run coverage -- launch`, then
       more vendors in its core categories beyond the target (named
       "<Metro>: <categories>" as `/add-vendors` says).
     - A launch metro is DRY for a kind when the subagents bring back fewer
       than 10 new usable rows for it. Say "<Metro> dry for <kind>" in the PR
       body and report. Before picking, search this repo's PRs from the last 7
       days (open and merged) for "<Metro> dry for <kind>"; if found, that
       metro is dry for that kind, so take the next launch metro.
     - Only when every launch metro is dry for this kind (or blocked by an
       open PR) fall back to the state pick below.
   - **State pick (fallback):** in your region only, the state with the most of
     that kind still needed (venues short of target, or vendors still needed).
     Work a whole state per run, not one metro: small batches waste a run.
   - **Map fill (pass 4, stage 1), state pick only:** if
     `npm run coverage -- <State>` shows "Map fill, <Town>" lines, research
     those towns before anything else in that state, venues and vendors both,
     in one PR, whatever the run's kind. Each row's City must be the town or
     one of the places listed with it. A town with nothing usable is done once
     5 businesses found there are logged in the skipped file with that City.
   - VENUE run (state pick): fill the state toward its venue target with
     `/add-venues`, spread across the metros that are furthest short.
   - VENDOR run (state pick): cover EVERY metro in that state with gaps, one
     batch entry per metro in the state's file, in a single PR.
   - If this run's kind gives under 40 rows and you have more than 40 minutes
     left, add the other kind for the SAME metro or state in the same PR.
4. Research in parallel: spawn 3 general-purpose subagents at once, splitting
   the work by metro, town or category. Give each the skill's column list and
   rules, the towns to cover, and the names/websites already in that state's
   batch and skipped files so they don't repeat them. Each returns TSV rows
   confirmed on the business's own site plus a LEFT OUT list (name, reason,
   best link). Search beyond directories: venues' preferred-vendor pages, local
   wedding guides and magazines, chamber of commerce member lists, then confirm
   each business on its own site.
   A row is complete when its own site (or, for an Instagram-only Basic
   listing, its profile, per the skill) is live, shows wedding work and names
   its town or service area. Email, phone, address, service area and Instagram
   are OPTIONAL: leave them blank when the site doesn't publish them. Never
   drop a real business just for blanks.
5. Follow `/add-venues` or `/add-vendors` exactly for writing and checking:
   the vendor check script or `npm run check:venues`, eslint, then
   `npm run verify:batches` with no `--all` (it checks only the rows new since
   origin/main; `--all` re-visits every site in the state and burns the run).
   Fix every FAIL. A file that doesn't load is a FAIL: never open a PR while
   either check reports one. `check:venues` fails on a venue already listed in
   the state under the same name and site: drop that row. Real businesses
   only: never invent or guess a business, website, phone or price to fill a
   quota. Left-out businesses go in `src/lib/batches/skipped/<state>.tsv`.
   Commit only batch files on a new branch named `batch/<state>-<YYYYMMDDHH>`
   and open the PR with counts per metro and category, sources, and what was
   left out and why.
6. Stalls: only after the subagents have come back with fewer than 10 usable
   rows, move on: a dry launch metro goes to the next launch metro, then the
   state pick; a dry state goes to the other kind for that state, then the
   next state in your region. At most 3 picks per run. Name every stalled pick
   and why in the PR body and report.
7. Do NOT merge and do NOT run the import: the "Batches" GitHub Action merges
   batch-only PRs once their Workers Builds check is green and puts them live.
   If the build fails on your PR, fix it within this run if you can.
8. Never touch any file outside `src/lib/batches/`. If your region has nothing
   left in the plan and every launch metro is dry, change nothing and end at
   once with one line saying so.

Finish with a three-line report: the PR link, this run's kind and row counts by
metro (or map-fill town) and category, and what's still thin there (for a
launch metro, roughly how many venues it now has). Add a fourth line listing
any stalled or dry picks and why.
