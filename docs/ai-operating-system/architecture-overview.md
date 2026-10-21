# Architecture overview

Verified in the repo on 2026-10-20. Update when a service or major dependency
changes.

## Stack
- **App:** Next.js 16 (App Router, React 19.2, TypeScript, Tailwind 4).
  `AGENTS.md`: this Next.js has breaking changes; read
  `node_modules/next/dist/docs/` before relying on memory.
- **Hosting:** Cloudflare Workers via OpenNext (`@opennextjs/cloudflare`),
  deployed from `main` by Cloudflare's Git integration. Build command
  `npm run cf:build`. Config `wrangler.jsonc` (worker `wedding-build`,
  observability enabled, no cron triggers, no R2/KV/D1). The account is on
  **Workers Paid** ($5/month + usage; confirmed by the owner 2026-10-21): 10M
  requests a month included, then $0.30 per million, and up to 5 min CPU per
  request. Batch imports were moved off-Worker when the account was on Workers
  Free (10 ms CPU cap, error 1102); they stay off-Worker because geocoding and
  site reading are slow, not because of the cap.
- **Database, auth, storage:** Supabase (Postgres + RLS + Storage), 132
  migrations in `supabase/migrations/`. Clients in `src/lib/supabase/`.
  Migrations are run by hand by the owner in the Supabase SQL Editor.
- **Email:** Resend (`src/lib/resend.ts`), webhook at
  `src/app/api/resend-webhook` (bounces, inbound). See
  `docs/email-playbook.md`.
- **SMS:** Twilio (`src/lib/sms.ts`, consent in `src/lib/sms-consent.ts`),
  for itinerary texts to guests.
- **AI:** Anthropic SDK (`@anthropic-ai/sdk`, `src/lib/ai/`) for Wren and
  admin Ask Wren.
- **Google:** Sheets sync for budget/guests (`src/lib/google-sheets.ts`),
  Drive picker, Drive as the backup mirror (`scripts/backup.mjs`).
- **Maps:** Leaflet + react-leaflet + supercluster; Three.js for the 3D
  venue layout.

## Server endpoints (`src/app/api`)
`batch-sync` and `import-batches` (listing imports, guarded by
`BATCH_IMPORT_SECRET`), `contact-click` (counts listing contact taps),
`resend-webhook`. Most writes are server actions next to their pages.

## Scripts (`scripts/`, run locally or by routines)
`import-batches.mjs` (geocode and read sites, then write via
`/api/batch-sync`), `coverage.mjs` + `coverage-plan.mjs`,
`verify-batches.mjs`, `check-venue-batches.mjs`, `weekly-review.mjs`
(read-only metrics), `backup.mjs` / `restore.mjs` (AES-256-GCM with
`BACKUP_ENCRYPTION_KEY`).

## Quality gates
`npm run lint` and the Cloudflare build. **No automated tests.** No CI in
`.github/` beyond what Cloudflare and the GitHub app run.

## Known gaps
No product analytics, no error alerting beyond Workers logs, no scheduled
jobs (so no reminder emails), no tests. See `integrations.md` and
`risks-and-opportunities.md`.
