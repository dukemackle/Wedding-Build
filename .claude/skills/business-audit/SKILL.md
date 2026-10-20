---
name: business-audit
description: Run one or more on-demand audits of You Do, I Do — product, website experience, technical, security, marketing, financial, marketplace, competitive intelligence, or admin operations — and report prioritized findings with evidence. Use when the owner says /business-audit [area], "audit the …", "what are we missing", "review the whole business", or asks for a health check of an area.
---

# /business-audit [area …]

Areas: `product`, `website`, `technical`, `security`, `marketing`,
`financial`, `marketplace`, `competitive`, `admin`, or `all`. If none is
given, ask which in one line and recommend one based on the latest
`docs/ai-operating-system/founder-briefing.md`. `all` is expensive (up to five
agents), so confirm before running it.

Read-only. Audits find and recommend; fixes go through the normal workflow
after the owner picks them.

## 1. Route each area

| Area | Agent | Existing tools it should use |
|---|---|---|
| product | `product-strategist` | `couple-test` persona, `docs/retention.md`, `docs/competitors.md` gaps |
| website | `design-expert` skill (run in the main session) + `engineering-architect` for performance | design-expert's `UX-REVIEW.md`, 375px and ~1440px |
| technical | `engineering-architect` | `npm run lint`, `npx tsc --noEmit`, `wrangler.jsonc`, recent `git log` |
| security | `security-privacy` | `docs/legal-audit.md` register, RLS migrations, `npm audit --omit=dev` |
| marketing | `growth-marketplace` | landing page, sitemap/robots, metadata, `docs/email-playbook.md` |
| financial | `finance-ops` | `scripts/weekly-review.mjs`, `pricing-check` metrics, `docs/monetization.md` |
| marketplace | `growth-marketplace` | `npm run coverage`, `data-audit` (`audit.mjs`), `/admin/listing-health`, claim flow |
| competitive | `product-strategist` | `docs/competitors.md`, dated web research |
| admin | `finance-ops` | `src/app/admin/*`, manual steps in `CLAUDE.md` and skills, `docs/retention.md` |

Run the selected agents in parallel in one message. Give each the area, the
tools above, and the finding format from `docs/ai-operating-system/README.md`
(Finding, Evidence, Impact, Confidence, Priority, Action, Effort, Benefit,
Owner approval needed). Ask for at most 7 findings per area, ranked.

## 2. Reconcile

- Drop duplicates and anything without evidence.
- When agents conflict (e.g. growth wants a public form, security says it
  needs consent wording), state the conflict and your call.
- No invented numbers or ROI. Benefits are described, not priced.

## 3. Report and record

- Reply: the top 5 findings across all areas, each in the finding format
  (compact), then "decisions for you" and "what I'd do first".
- Append confirmed risks or opportunities to
  `docs/ai-operating-system/risks-and-opportunities.md`; legal or security
  items update the `docs/legal-audit.md` register instead. External research
  goes in `research-log.md`.
- Don't fix anything in the same run unless the owner says so.
