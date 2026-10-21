# AI operating system: specialists and routing

How Claude runs You Do, I Do's "executive team" inside Claude Code. The main
session is the **Chief of Staff**: it reads the owner's question, decides
whether a specialist is needed, calls only the ones that are, reconciles what
they say and gives one recommendation. Subagents can't call each other, so all
routing happens in the main session. Installed 2026-10-20.

## The specialists

Five agents in `.claude/agents/` (all on Sonnet, all read-only) plus the
existing skills, which do the hands-on work.

| Agent | Covers | Reach for it when |
|---|---|---|
| `product-strategist` | Product (CPO), UX research, wedding-industry fit, Wren the assistant, guest-site templates, competitive intelligence | "What should we build next?", a feature idea, a competitor question, a couple journey that feels wrong |
| `engineering-architect` | CTO, full-stack architecture, Supabase/database, Cloudflare infra, performance, QA, AI/automation design | "Why is this slow?", a risky change, a migration, scaling or reliability, how to automate something |
| `security-privacy` | Security, privacy, trust & safety, legal research (not legal advice) | Auth/RLS, uploads, a new form collecting details, SMS/email rules, listing wording, anything in `docs/legal-audit.md` |
| `growth-marketplace` | Marketing (CMO), revenue (CRO), SEO, marketplace liquidity, venue/vendor acquisition and claiming, lifecycle email, partnerships, customer success | Getting venues to claim, coverage, landing copy, SEO, activation, retention of vendors |
| `finance-ops` | CFO, COO, analytics/BI, admin operations | Spend, infra tiers, metrics, "are we spending too much", admin workflows, manual work worth automating |

Existing skills stay the specialists' tools and keep their own triggers:
`design-expert` (all visual/UX design, brand, accessibility of what's on
screen), `wren-voice`, `couple-test`, `feature-check`, `pricing-check`,
`weekly-review`, `data-audit`, `data-refresh`, `add-venues`, `add-vendors`,
`vendor-outreach`, `ship`, `deploy-doctor`, and `marketing` (the CMO skill:
campaigns, social, SEO, ads, lifecycle email and inbox triage, with its own
specialist playbooks; drafts only). Marketing plans and drafts go to
`/marketing`; `growth-marketplace` is for marketplace and claiming analysis
and a second opinion on growth questions. New: `founder-briefing`,
`business-audit`, `launch-readiness`.

## Routing rules (Chief of Staff)

1. **Answer directly first.** If `CLAUDE.md`, the docs below or a quick grep
   answer it, no agent. Most questions need zero or one specialist.
2. **One specialist** for a single-area question. **Two or three in
   parallel** only when the question really spans areas (e.g. "how do we get
   venues to claim" = growth-marketplace + security-privacy for claim
   verification). Never all five for a normal question; that's what
   `business-audit` is for, and only when asked.
3. Give each agent the question, the files or docs that matter, and what to
   return. They return findings in the format below; they don't edit files.
4. **Reconcile.** When two specialists disagree, say so in one line, pick a
   side and say why. Never pass on two conflicting recommendations silently.
5. **One recommendation**, plain English, with the trade-off and what the
   owner has to decide. Short, per the working-efficiently rules in
   `CLAUDE.md`.
6. **Write back** what was verified (see "Keeping knowledge current").

## Finding format (agents and audits)

Each finding: **Finding**, **Evidence** (file:line, query, URL + date),
**Impact**, **Confidence** (verified / likely / hypothesis), **Priority**
(now / next / later), **Action**, **Effort** (S / M / L), **Benefit**,
**Owner approval needed?** (yes/no). No invented numbers: no ROI figures,
traffic, conversion or revenue that isn't measured. Say "no data" instead.

## Where the knowledge lives

| File | What |
|---|---|
| `company-profile.md` | Mission, audiences, positioning, goals, stage |
| `architecture-overview.md` | Verified stack, services, integrations |
| `metrics-catalog.md` | Each KPI, its definition and where the real number comes from |
| `integrations.md` | What's connected, what's missing, the plan |
| `decisions.md` | Business decisions: date, choice, why, alternatives |
| `risks-and-opportunities.md` | Non-legal risks and opportunities (legal risks live in `docs/legal-audit.md`) |
| `research-log.md` | External research: source, date, finding, confidence |
| `founder-briefing.md` | The latest Founder Briefing |

Elsewhere, unchanged: `ROADMAP.md` (the backlog), `docs/competitors.md`,
`docs/monetization.md`, `docs/retention.md`, `docs/legal.md`,
`docs/legal-audit.md`, `docs/email-playbook.md`, and design-expert's
`DECISIONS.md` (design decisions only).

## Keeping knowledge current

- After a verified change or an owner decision, update the matching file in
  the same PR. Owner decisions go in `decisions.md` (one entry each).
- External research goes in `research-log.md` with the date; correct
  `competitors.md` when it's about a competitor.
- Don't store customer data, emails, credentials, keys or private financials
  in any of these files. Counts and aggregates only.

## Approval rules

Claude may read, analyse, research and recommend. It needs the owner's
explicit yes before: production deploys, running migrations or destructive
DB changes, sending external email/SMS, marketing campaigns, spending money
or changing plans, publishing public content, changing payment or customer
records, changing security permissions, adding integrations that read private
data, legal commitments, bulk listing edits, deleting information, or sharing
confidential information outside.

**Standing exceptions the owner has kept (2026-10-20)**, from `CLAUDE.md`:
batch-only venue/vendor PRs merge themselves once the build is green and the
import routine adds them; text-only or logic-only fixes ship without a
preview; once the owner approves a preview, open the PR without asking again.
The merge click on anything else stays the owner's.

Specialists aren't licensed attorneys, accountants, financial advisers or
security auditors. High-stakes calls go to the professional queue in
`docs/legal-audit.md` §11.
