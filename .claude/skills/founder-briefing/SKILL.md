---
name: founder-briefing
description: The owner's Founder Briefing for You Do, I Do — executive summary, top three priorities, product and technical developments, security, marketplace growth, finances, competitors, opportunities, decisions waiting on the owner, and next actions, from real repo and admin data. Use when the owner says /founder-briefing, "give me my Founder Briefing", "what should I focus on today/this week", or "where do things stand".
---

# /founder-briefing

A business report the owner can read in two or three minutes. Every number is
measured or marked missing. Never invent traffic, signups, revenue,
conversion or behaviour. Read-only: no emails, no PRs, no data changes.

## 1. Gather (one pass, in parallel where possible)

- **What changed:** `git log --since="<last briefing date or 7 days>" --oneline main`
  (the date is at the top of `docs/ai-operating-system/founder-briefing.md`).
  Group into product, listings (batch PRs), fixes, infra.
- **Numbers:** `node scripts/weekly-review.mjs` (signups, real vs test
  weddings, listings, inquiries, queues, Supabase/Cloudflare/Resend usage vs
  free tiers). Anything under `unavailable` is reported as "not connected".
- **Coverage:** `npm run -s coverage | tail -6`.
- **Risks:** the register in `docs/legal-audit.md` §12 (open and
  owner-action items), `docs/retention.md` "Open, in order", and
  `docs/ai-operating-system/risks-and-opportunities.md`.
- **Backlog and decisions:** `ROADMAP.md` "Free to build now",
  `docs/ai-operating-system/decisions.md` (anything pending).
- **Competitors:** `docs/competitors.md` and `research-log.md`. Only search
  the web if the owner asks for fresh competitor news or the latest research
  entry is over ~30 days old (one round, standard mode, dated).

Use a specialist agent only if something in the data needs explaining (e.g.
`finance-ops` for a cost jump). The default run uses none.

## 2. Write the briefing

Sections, in this order, each short (bullets, no filler):

1. **Executive summary**: three sentences at most.
2. **Top three priorities**: ranked, each with why now.
3. **Product developments**: what shipped since last briefing.
4. **Technical and security concerns**: open Critical/High items first.
5. **Acquisition and marketplace**: coverage, listings, claims, inquiries.
6. **Financial health**: infra usage vs free tiers; revenue is $0 by design
   until monetization starts. Say "no finance system connected" for anything
   else.
7. **Competitors and industry**: only what's new; "nothing new since <date>"
   is fine.
8. **High-value opportunities**: one to three.
9. **Decisions needing the owner**: each with a recommended answer.
10. **Recommended next actions**: numbered, smallest first step.

Label every figure **measured** (with source) or **estimate** (with the
assumption). Missing data is a line in the report, not a guess.

## 3. Save and reply

- Overwrite `docs/ai-operating-system/founder-briefing.md` with the briefing,
  dated at the top. It holds counts only, no names, emails or keys.
- Reply in chat with sections 1, 2, 9 and 10 plus "full briefing saved". The
  owner is on a usage budget.
- Don't commit just for the briefing. Commit it with the next PR, or when the
  owner asks.
