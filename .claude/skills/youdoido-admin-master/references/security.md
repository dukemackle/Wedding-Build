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
- Gaps: no MFA (Supabase supports TOTP; enforce `aal2` in `requireAdmin`),
  no admin audit log, no roles, no security headers (CSP, HSTS,
  frame-ancestors), no general rate limiting.

## Approval levels

| Level | Examples | Who decides |
| --- | --- | --- |
| A. Read-only | Reports, audits, queries, drafts in the scratchpad | Run freely |
| B. Code change | New page, migration file, fix | PR; owner merges (logic-only fixes may ship per CLAUDE.md) |
| C. Production data | Bulk edits, deletes, applying audit fixes, imports outside batch PRs | Owner's explicit yes, verified backup first |
| D. Outward / money / access | Sending email/SMS, charging, refunds, billing settings, changing admins, rotating credentials, DNS | Owner's explicit yes for that exact action |

Level C/D actions, once built into the admin, write an audit-log row.

## Audit log (to build)

`admin_audit_log`: id, at, actor email, action (`listing.bulk_delete`,
`claim.approve`, `couple.email`, `couple.test_flag` ...), target type + ids,
summary of change (no secrets, minimal PII), request id. Insert-only via
service role; no update/delete policy. One helper `logAdminAction()` called
from each mutating action after it succeeds.

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
