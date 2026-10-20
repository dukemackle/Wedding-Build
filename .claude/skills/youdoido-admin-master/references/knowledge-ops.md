# Business knowledge and operations records

Goal: one place the owner looks for "when does X renew, who has the login,
why did we decide Y" -- without becoming a password vault.

## Where things live

| Kind | Home | Why |
| --- | --- | --- |
| Passwords, API keys, tokens | Password manager (e.g. Bitwarden) + Cloudflare/Supabase/GitHub secret stores | Purpose-built, encrypted, audited |
| Contracts, registrations, insurance PDFs | Google Drive (a "Company" shared drive) | Already used for backups; access-controlled |
| Structured records (inventory, renewals, decisions, deadlines) | Admin "Operations" tables, owner-only | Searchable, remindable |
| Engineering decisions and policies | `docs/` in the repo | Versioned, read by Claude sessions |

## Tables to build (owner-only RLS, service-role writes behind requireAdmin)

- **`ops_services`** (tech inventory): name, category (hosting, email,
  domain, AI, storage, SMS, analytics, banking, SaaS), purpose, plan, monthly
  cost, billing cycle, renewal date, payment method label (e.g. "Visa ending
  in 1234", nothing more), account owner, login location ("Bitwarden: item
  name"), secrets used (names only), free-tier limit, status page URL,
  depends-on, notes.
- **`ops_deadlines`**: title, kind (renewal, filing, insurance, legal), due
  date, recurrence, linked service or document, done_at.
- **`ops_decisions`**: date, decision, context, options considered, reasoning,
  data used, expected result, review date, actual outcome. This is the
  company's decision log; design decisions stay in design-expert's
  DECISIONS.md, pricing in monetization.md.
- **`ops_documents`**: title, type, Drive link, expiry date. Links, not files.

Known services to seed (names only; owner fills the rest): Cloudflare
(Workers, DNS, domains youdoido.com + wrenwed.com), Supabase, Resend,
Anthropic, Twilio, GitHub, Google Workspace/Drive, OpenStreetMap tiles,
US Census geocoder.

## Rules

- No column ever holds a secret value. Validate on save: reject anything
  that looks like a key (long high-entropy strings, `sk_`, `sbp_`, `re_`,
  `eyJ` prefixes).
- Renewal and deadline reminders go on Home's needs-action list 14 days
  ahead; an email digest only once the owner opts in.
- Company/legal facts (entity, registrations, insurance) are owner-supplied;
  never infer them. `docs/legal-audit.md` R4/R9 track entity and insurance.
