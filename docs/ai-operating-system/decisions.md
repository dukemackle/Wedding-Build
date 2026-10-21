# Decision log

Business and product decisions by the owner. Design decisions live in
`.claude/skills/design-expert/DECISIONS.md`; standing rules stay in
`CLAUDE.md`. Newest first. One entry per decision:

```
## YYYY-MM-DD — <decision>
- Decided: <what>
- Why: <reason>
- Alternatives: <what else was considered>
- Revisit: <trigger or date, if any>
- Outcome: <filled in later>
```

Earlier decisions with dates are in `CLAUDE.md` (rebrand, palette, shipping
rules, batch self-merge, 50-state coverage, page widths) and
`docs/legal-audit.md` "Owner answers (2026-10-19)". They aren't copied here.

## Pending owner decisions
- **Which launch metros** (2–3), and the completeness bar they must meet.
- **Who counts as a founding business** (e.g. claim approved before a date or
  before Phase 1 starts). Settle before the first claim invitation.

## 2026-10-21 — Launch bar: pass 1 everywhere plus 2–3 deep launch metros
- Decided: coverage pass 1 in all 50 states + DC counts as "every state has
  listings". Breadth targets beyond pass 1 are frozen; batch work moves to
  depth (capacity, price tier, re-verification) in 2–3 launch metros.
- Why: 1 real couple and 0 outside claims against 19,800 listings; no photos,
  no vendor prices (executive assessment 2026-10-21).
- Alternatives: keep filling the stage-2 targets (~16,000 more listings).
- Revisit: when the first cohort's data is in.

## 2026-10-21 — Measurement: first-party usage events and Web Analytics
- Decided: `usage_events` table (migration 0130) logging 12 fixed milestone
  names per account and day, a "First cohort" table on /admin/growth, a
  Privacy line, Cloudflare Web Analytics and Google Search Console.
- Why: activation and retention can't be measured after the fact; the first
  5–10 couples need to be measured from day one.
- Alternatives: third-party product analytics (more data, more privacy
  surface); no measurement until launch.
- Revisit: add events as new questions come up; nothing a couple types is
  ever logged.

## 2026-10-21 — Founding businesses keep a free listing for life
- Decided: businesses that claim during the founding period keep their basic
  listing free for life. It covers the listing only: lead pricing and future
  paid features still apply to them (`docs/monetization.md`).
- Why: a reason to claim now, while there are no inquiries to offer.
- Alternatives: no promise; free paid features for founders (too binding).
- Open: the cutoff that defines "founding" (see pending).

## 2026-10-21 — Form a California LLC and get a public mailing address
- Decided: "You Do, I Do LLC", California, member-managed, single member,
  filed through Northwest Registered Agent (agent included the first year,
  then $125/yr; Northwest files the first Statement of Information). Order
  placed 2026-10-21, approval expected about 2026-11-02. Public business
  address: an Anytime Mailbox virtual mailbox in Encinitas, CA (Bronze,
  ~$110/yr), with USPS Form 1583 completed once the LLC is approved.
- Why: R4 (personal liability) in `docs/legal-audit.md`; DMCA agent filing
  and CAN-SPAM footers need a public postal address. Reverses the 2026-10-19
  "no PO box or virtual mailbox" answer.
- Alternatives: DIY on bizfile (home address public); Wyoming/Delaware (still
  pay California's $800/yr); Northwest Virtual Office ($20/mo); USPS PO box.
- Next: EIN at irs.gov, business bank account, Form 1583, then the entity
  name and address in Terms, Privacy and email footers, DMCA agent ($6),
  insurance quotes, Twilio A2P registration.

## 2026-10-20 — Install the AI operating system
- Decided: five read-only Sonnet specialist agents (`.claude/agents/`), with
  the main session as Chief of Staff; new skills `founder-briefing`,
  `business-audit`, `launch-readiness`; knowledge in
  `docs/ai-operating-system/`.
- Why: consistent company context and routing without paying for unused
  agents; existing skills kept as the specialists' tools.
- Alternatives: the 30-role catalog as separate agents (too much overlap and
  token cost); a chief-of-staff subagent (subagents can't call each other).
- Standing exceptions kept: batch-only PRs self-merge, text/logic-only fixes
  ship directly, PR opens once a preview is approved.
- Revisit: when there are outside users, or if an agent is never used.

## 2026-10-21 — Admin Home replaces Overview
- Decided: the owner approved the Home preview (blueprint #6) and asked for
  the sidebar link to read "Home". The queue comes first, then six KPI cards,
  each with its definition. There's no revenue card until revenue exists.
- Why: one page answers "does anything need me?" instead of four or five.
- Revisit: when the error log (#8) and spend page (#9) fill the "not tracked"
  health rows.
