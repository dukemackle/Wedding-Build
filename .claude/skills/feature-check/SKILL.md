---
name: feature-check
description: Before building a feature idea, check whether You Do, I Do already has it, what The Knot, Zola and Joy do, and the smallest version worth shipping. Use when the owner types /feature-check <idea>, or proposes a new couple-facing or admin feature ("should we add…", "what about a…") before any code is written.
---

# /feature-check

The idea is in the arguments (if none, ask for it in one line). This is a
read-and-advise pass: write no code, open no branch.

## 1. Does it already exist?

- Read `docs/competitors.md`, especially **Known feature gaps** (some are
  parked by the owner — say so and stop unless they asked anyway) and
  **Shipped since this list was written**.
- Search the code, not just the doc: `grep -ri` the idea's nouns across
  `src/app`, `src/lib`, `src/components` and `supabase/migrations`. Check the
  dashboard boxes in `src/app/dashboard/feature-grid.tsx` and the guest site
  under `src/app/w/[slug]`.
- Classify: **exists** (name the route/file), **partly exists** (say what's
  there and what's missing), or **new**. Partial is the common case — a
  helper, a column or a print route that a new feature can build on.

## 2. What do The Knot, Zola and Joy do?

- Start from `docs/competitors.md`. If it doesn't cover this idea, or the
  note is more than ~2 months old, do one round of `WebSearch` (standard
  mode, the three searches in one turn). Don't trust memory for features or
  prices.
- For each: has it or not, free or paid (and price), and what's notably good
  or bad about theirs. One line each.
- Then the angle: where could ours be better, given what we already have
  (deeper budget, actually free, Wren the assistant)? If the honest answer is
  "it can't be better, it's table stakes", say that.

## 3. Smallest version worth shipping

- One version, not a roadmap: what a couple would actually use, built on the
  pieces found in step 1. Name the files it touches.
- Flag costs and triggers: recurring spend (SMS, AI calls, email volume),
  anything that needs `docs/legal.md` (new form collecting details, SMS,
  analytics), new tables/RLS, and whether a landing demo in
  `src/components/landing/feature-previews.tsx` needs updating.
- Say whether it's a visual change (needs a 375px + ~1440px preview first)
  or can ship directly.
- Flag owner judgment calls (pricing, send caps, what's free) rather than
  assuming them.

## Reply

Short — the owner is on a usage budget. Three labelled paragraphs
(**Exists?**, **Competitors**, **Smallest version**) and a one-line verdict:
build it / build the smaller version / skip. No tables.

## Keep the doc current

If the check turned up something `docs/competitors.md` doesn't say (a
competitor's feature or price, a gap that's now shipped, a stale claim),
update the doc in the same change set that ships the feature — or, if the
verdict is skip, mention the correction and offer to commit it.
