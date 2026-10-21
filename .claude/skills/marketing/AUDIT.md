# Marketing systems audit and implementation plan

Audited 2026-10-20 from the code (`main` at branch point). Re-run with
`/marketing audit`. Status: **Exists**, **Partial**, **Missing**.

## Stack
Next.js 16 on Cloudflare Workers (OpenNext), Supabase (auth, Postgres,
storage), Resend (send only), Twilio (guest SMS), Anthropic (Wren and admin
AI), Leaflet/OSM maps, US Census geocoder, Google Drive Picker/Sheets sync.
No analytics, CRM, ESP for marketing, or ad platform.

## Systems

| System | Status | Where / notes |
| --- | --- | --- |
| Public pages | Exists | `/`, `/estimate`, `/venues`, `/vendors`, `/marketplace`, `/list`, `/help`, `/privacy`, `/terms` |
| Couple signup + onboarding | Exists | `src/app/signup/actions.ts`, `/start` wizard (`src/app/start/actions.ts`) |
| Signup source / UTM capture | Missing | nothing stores where a signup came from |
| Referral codes | Partial | `weddings.referral_code` (migration 0040) tags vendor inquiries only; "informal tracking" in Terms |
| Business self-listing | Exists | `/list` (`src/app/list/actions.ts`), private edit links, honeypot |
| Claim flow + admin approval | Exists | `/claim/[token]`, `/claim/vendor/[token]`, admin claim actions; 90-day links (R8) |
| Inquiries to businesses | Exists | Resend email with attribution footer + claim link (`src/lib/inquiry-footer.ts`) |
| Business lead dashboard | Missing | lead counts only as a helper (`src/lib/listing-leads.ts`) |
| Guest website + publishing | Exists | editor `src/app/guests/site/`, public `/w/<slug>`, dynamic OG tags, noindex when locked |
| Guest-site viral footer | Missing | no "Made with" link |
| Social share buttons | Missing | copy-link only; `navigator.share` only on marketplace |
| QR codes | Exists | table cards, photo wall |
| Transactional email | Exists | ~19 inline plain-text sends from hello@ (`src/lib/resend.ts`), bounce check |
| Inbound email | Partial | Workspace owns MX; Resend webhook records bounces/complaints; received-mail branch dormant |
| Marketing email, opt-in, unsubscribe | Missing | `outreach_opt_outs` table exists (0103) but unused by the app; no postal address |
| Lifecycle / drip / cron | Missing | no scheduled jobs |
| In-app notifications | Missing | `/admin/notifications` "soon" |
| CRM / lead tracking | Partial | `listing_leads`, `vendor_contact_log`, `listing_contact_clicks`, couple notes/tags; no contacts CRM or campaign log |
| Analytics | Partial | Cloudflare Web Analytics (automatic setup, outside the code, found 2026-10-21); admin growth + feature adoption, contact taps, Cloudflare account stats via script; no page analytics; `/admin/analytics` "soon" |
| SEO basics | Exists | sitemap, robots, canonicals, EventVenue/LocalBusiness/FAQ JSON-LD |
| SEO local/content pages | Missing | no state/city pages, guides, blog |
| AI-search hygiene | Missing | no `llms.txt`, Organization/WebSite JSON-LD |
| Pricing / partner / blog pages | Missing | by design in Phase 0 |
| Admin dashboard | Exists | 14 sections: overview, growth, revenue (referral lookup), couples (bulk email), leads, listing health, claims, feedback, AI |
| Brand guidelines | Exists | CLAUDE.md palette and roles, `/design-expert` files, `/wren-voice` |
| Claude skills | Exists | 13 before this one; `/vendor-outreach`, `/weekly-review`, `/feature-check`, `/data-refresh` overlap with marketing and are reused, not duplicated |

## Risks found while auditing
- ROADMAP.md says West Virginia is short; `npm run coverage` says 51/51 meet
  pass 1. One of them is stale.
- `wrangler.jsonc` commits an admin allowlist that includes a personal Gmail
  (legal-audit R16). Not a marketing issue, but it's public if the repo is.
- `/admin/couples` bulk email exists: anything promotional sent through it
  would be commercial email without unsubscribe or address. Use it only for
  service messages until the gate opens.

## Implementation plan

**Done in this change (no credentials, no app code):** `/marketing` skill
(CMO + 11 specialist playbooks), live state, backlog, experiments and
decisions logs, templates, a `marketing-researcher` subagent, a CLAUDE.md
pointer.

**Next, in backlog order, each its own small step:**
1. Owner: Search Console + Cloudflare Web Analytics (free, ~20 minutes).
2. Owner decision: postal address option → then code: unsubscribe link,
   List-Unsubscribe header, opt-out check, marketing opt-in at signup.
3. Code PR: signup source capture + Privacy line.
4. Owner: connect Gmail; first inbox digest validates the draft flow.
5. Copy pass on inquiry footer, claim and `/list` pages.
6. Design proposals: guest-site footer link, estimator state pages.
