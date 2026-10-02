---
name: ship
description: Pre-PR checklist for You Do, I Do. Runs lint and typecheck, updates the landing demo when a couple-facing feature changed, checks new forms against docs/legal.md, then commits, pushes and opens the pull request. Use when the owner says "ship it", "/ship", or approves a preview.
---

# /ship

Run these in order. Stop and report if a step fails; don't open a PR on red.
Keep the final reply to a few lines (see "Working efficiently" in CLAUDE.md).

## 1. See what's changing

```
git fetch origin main
git diff --stat origin/main...HEAD
git status --short
```

Uncommitted work counts too. If the diff only adds rows to
the per-state batch files in `src/lib/batches/` (or the older
`src/lib/venue-batches.ts` / `vendor-batches.ts`), it's a batch PR:
skip steps 3–4 (still run step 2), and after opening the PR merge it yourself
once the Cloudflare build is green.

## 2. Lint and typecheck

```
npm run lint
npx tsc --noEmit
```

Fix errors in files this diff touches. Errors that are already on `main` in
untouched files aren't this PR's: mention them, don't widen the PR.

## 3. Landing demo (couple-facing changes only)

A change is couple-facing if it touches anything under `src/app/dashboard/`
or a screen a signed-in couple sees (guest list, budget, seating, itinerary,
checklist, venues, vendors, Wren). Admin-only (`src/app/admin/`), server
plumbing, migrations and docs aren't.

If it is:
- Check `buildFeatures` in `src/app/dashboard/feature-grid.tsx` — a new or
  renamed box needs the same box on the landing page (same order).
- Update the matching demo in `src/components/landing/feature-previews.tsx`
  so it shows what the feature now does.
- Update its blurb in `BLURBS` in `src/components/landing/landing-features.tsx`
  (find it with grep if it has moved) so the copy doesn't claim something
  the product no longer does, or miss what it now does.

A demo change is visual: if the owner hasn't seen it, render a 375px and
~1440px screenshot and show it before opening the PR.

## 4. Forms vs. docs/legal.md

Look for new or changed forms in the diff: `<form`, `<input`, `<textarea`,
server actions that insert user-entered fields, new Supabase columns holding
personal details (phone, email, address, dates of birth, kids' names).

For each, read `docs/legal.md` and check:
- **In place:** a form collecting a new kind of personal detail needs the
  consent line next to its submit button and a line in the Privacy Policy's
  "Information we collect"; bump the policy's "Last updated" date.
- **Triggers:** marketing email, SMS beyond schedule texts, EU/UK users,
  analytics or ad pixels, payments, children's data. If the diff crosses one,
  build what that section lists in this PR, or stop and ask the owner.

Copy changes that make a privacy claim (e.g. "private", "never shared") must
still be true after the diff. Flag anything that isn't.

## 5. Commit, push, open the PR

- Commit on the session's branch (never `main`), with a plain message
  saying what changed and why. Follow the attribution lines from the system
  reminder.
- `git push -u origin <branch>` (retry on network errors with backoff).
- Open the PR with the GitHub MCP `create_pull_request` tool against `main`.
  Body: what changed, the checklist result (lint/typecheck pass, landing
  demo updated or "not couple-facing", forms checked or "no new forms"),
  and anything flagged for the owner.
- Don't merge — the merge click is the owner's (batch PRs excepted, above).
- Offer to watch the PR for CI and review comments.
