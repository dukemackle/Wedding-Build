# Security, permissions and compliance

The admin reads every couple's data through the service-role client
(`src/lib/supabase/admin-client.ts`), which bypasses RLS. Treat every admin
code path as privileged. `docs/legal-audit.md` is the live risk register;
update it when a fix ships.

## How admin access works (2026-10-20)

- `ADMIN_EMAIL` comma-separated allowlist (committed in `wrangler.jsonc`
  vars) + confirmed email (`src/lib/admin.ts`). One all-powerful tier.
- `requireAdmin()` at the top of every admin page, layout, server action and
  route handler. Pages got this on 2026-10-20; keep it that way. A layout is
  not an auth boundary.
- Admin only routes on admin.youdoido.com (`src/proxy.ts`); a hidden URL is
  not security, the server checks are.
- `requireAdmin()` and `currentAdmin()` also require an authenticator code
  (`aal2`); `/login/mfa` sets it up on first sign-in. Lost device: remove
  the factor in Supabase (Authentication > Users) and sign in again.
- Baseline headers in `next.config.ts` (HSTS, frame-ancestors 'self',
  nosniff, Referrer-Policy, Permissions-Policy).
- Every admin action that changes data calls `logAdminAction()`
  (`src/lib/admin-audit.ts`) after it succeeds; read it at /admin/audit-log.
  New admin actions must do the same.
- Gaps: no roles, no full CSP, rate limits only on contact-click and the AI
  features.

## Approval levels

| Level | Examples | Who decides |
| --- | --- | --- |
| A. Read-only | Reports, audits, queries, drafts in the scratchpad | Run freely |
| B. Code change | New page, migration file, fix | PR; owner merges (logic-only fixes may ship per CLAUDE.md) |
| C. Production data | Bulk edits, deletes, applying audit fixes, imports outside batch PRs | Owner's explicit yes, verified backup first |
| D. Outward / money / access | Sending email/SMS, charging, refunds, billing settings, changing admins, rotating credentials, DNS | Owner's explicit yes for that exact action |

Level C/D actions, once built into the admin, write an audit-log row.

## Secrets

- Values live only in Cloudflare Worker secrets, Supabase, GitHub secrets,
  the routine environment, and a password manager (Bitwarden's free plan is
  enough). Never in tables, logs, analytics, AI prompts, reports or commits.
- The knowledge base stores metadata only: name, where it lives, what uses
  it, owner, created/rotated dates, what breaks if it expires.
- `.env.example` is missing several vars (`BATCH_IMPORT_SECRET`,
  `RESEND_WEBHOOK_SECRET`, `TWILIO_*`, `BACKUP_ENCRYPTION_KEY`, backup
  Google vars): keep it complete with placeholder values.

## Privacy

- Reports and AI prompts: aggregates; no guest names, emails, phones or
  messages. Ask Wren currently sends couples' first names and feedback free
  text to Anthropic -- acceptable under the privacy policy only if the
  policy says so; check `docs/legal.md` before widening.
- Exports containing contact data are admin-only downloads; don't commit or
  paste them anywhere.
- Backups: weekly, encrypted (`scripts/backup.mjs`); restore drill passed
  2026-10-09. Repeat the drill quarterly.

## Review triggers

Recommend a professional (security reviewer, attorney, accountant) before:
taking payments, adding a second admin, storing financial account data,
entering the EU, or any SMS/marketing-email expansion.
