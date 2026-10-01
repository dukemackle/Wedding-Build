---
name: deploy-doctor
description: Diagnose a failed Cloudflare Workers build or deploy of this app. Use only when a Cloudflare build/deploy has failed (dashboard build log, "entry-point file ... was not found", "Module not found ... @vercel/turbopack-next/internal/font/google/font", or the owner says the deploy broke). Not for local dev errors or ordinary type/lint failures.
---

# Deploy doctor

Production deploys to Cloudflare Workers run through the Cloudflare dashboard's
Git integration (Settings → Build), not a committed CI config. There is no
GitHub Action to read, so start from the build log the owner pastes (ask for it
if you don't have it — don't guess from the PR alone).

Match the log against the known failures below, in order. If none match, it's a
real code error: reproduce with `npm run cf:build` locally and fix it like any
other bug.

## 1. "entry-point file ... was not found" — the build command isn't sticking

**Symptom:** `next build` succeeds, then the deploy step fails saying
`.open-next/worker.js` (the entry-point file) was not found.

**Cause:** the build ran plain `npm run build` instead of `npm run cf:build`
(`opennextjs-cloudflare build`, which produces `.open-next/worker.js`). The
dashboard defaults to `npm run build`.

**Fix (owner does this in the dashboard):**
1. Workers → the project → Settings → Build. Build command must be
   `npm run cf:build`.
2. If it already says `npm run cf:build` but the log still shows
   `npm run build` running: **disconnect and reconnect the Git repository** in
   Settings. A plain Settings save has not been enough to make it stick
   (hit 2026-09-12).
3. Re-run the build.

Check the first lines of the log for which command actually ran before
suggesting anything else.

## 2. Twenty "Can't resolve '@vercel/turbopack-next/internal/font/google/font'" errors — Google font fetch flake

**Symptom:** the build dies inside `next build` with ~20
`Module not found: Can't resolve '@vercel/turbopack-next/internal/font/google/font'`
errors, all pointing at `src/app/layout.tsx`.

**Cause:** `next/font/google` failed to download the woff2 files from Google at
build time — a network flake in Cloudflare's builder, not a code error. Don't
change `layout.tsx` in response.

**Fix:** retry the build in the Cloudflare dashboard (hit 2026-09-22, retry
fixed it).

**If it keeps happening** (more than an occasional retry): propose
self-hosting the three fonts with `next/font/local` so the build stops
depending on Google's CDN. That's a code change — confirm with the owner first.

## After fixing

If you find a new failure mode and its fix, add it here as a numbered section
(symptom, cause, fix, date) so the next diagnosis is a lookup.
