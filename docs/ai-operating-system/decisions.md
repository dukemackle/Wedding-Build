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
- **Launch bar for listings.** All 50 states + DC meet coverage pass 1
  (2026-10-20); the current stage wants ~9,000 more venues and ~8,800 more
  vendors. Which level counts as "every state has listings" before marketing
  starts?

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
