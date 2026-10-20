# Analytics and conversion

**Owns:** knowing where couples and businesses come from, where they drop off,
and whether a change helped.

**Objectives:** a single weekly funnel the owner trusts: visits → estimator
use → signup → `/start` done → first core tool used → guest site published;
and for businesses: listing viewed → claim started → claim approved.

## What exists (2026-10-20)

First-party only: signups by month and feature adoption (`/admin/growth`),
inquiries, contact taps (`/api/contact-click`), Resend quota,
`scripts/weekly-review.mjs` (Cloudflare account analytics). No page analytics,
no UTM or signup-source capture, `/admin/analytics` is "soon".

## SOP, in order

1. **Cookieless page analytics.** Recommended: Cloudflare Web Analytics (free,
   already our host, no cookies). Still add one Privacy line (`docs/legal.md`).
   Owner steps: Cloudflare dashboard → Analytics & Logs → Web Analytics → Add
   a site → `youdoido.com` → choose automatic setup for the proxied domain, or
   copy the beacon snippet for us to add.
2. **Signup source.** Capture `utm_source/medium/campaign`, `ref` and the first
   landing path in a first-party cookie or sessionStorage, and save them on
   the profile at signup (new nullable columns; migration + Privacy line).
   Small code change; propose it as one PR.
3. **UTM convention** for every link we publish:
   `utm_source=<platform>&utm_medium=<social|email|partner|cpc>&utm_campaign=<yyyy-mm-short-name>`.
   Lower case, hyphens.
4. **Funnel view** on `/admin/growth` (or the "soon" `/admin/analytics`) from
   data we already store plus step 2. Visual change → preview.
5. **Experiments:** one change at a time on a page, a written hypothesis and a
   minimum run (2 weeks or N signups, whichever is later). At our volume, most
   A/B tests can't reach significance; prefer before/after with caution and
   say so.

Always exclude test and sample accounts from counts (`is_sample`, test
weddings), as the admin already does for lead counts.
