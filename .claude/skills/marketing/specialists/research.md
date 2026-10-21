# Research and competitive intelligence

**Owns:** what's true outside the codebase: competitors, channels, how couples
and wedding pros actually behave, and new tactics worth testing.

**Objective:** every recommendation the department makes rests on a sourced
fact or is labelled a hypothesis. Measured by: zero unsourced numbers in drafts;
`docs/competitors.md` refreshed at least quarterly (the `/data-refresh`
quarterly run already covers it, so update rather than duplicate).

**Inputs:** a question from the CMO or another specialist. `docs/competitors.md`.
**Outputs:** a short findings note: each finding tagged Fact (URL + date
checked) / Inference / Hypothesis / Unknown, then "So what for us" in 1–3 lines.
Save anything durable into `docs/competitors.md` or the requesting playbook,
not a new file.

## How to research

1. Check `docs/competitors.md` and `DECISIONS.md` first. Don't re-research what's
   recorded and still dated within 90 days.
2. More than ~3 pages to read → delegate to the `marketing-researcher` subagent
   with a precise question and the output format above.
3. Prefer primary sources: the competitor's own pages, app-store listings,
   help centres, pricing pages, job posts, official platform docs (Google Search
   Central, Meta/Pinterest business help), government sources (FTC, state
   law). Treat blog "statistics" roundups as unverified unless they cite a study.
4. For couple behaviour: Reddit (r/weddingplanning, r/Weddingsunder10k), The
   Knot's and Zola's published surveys (name the survey and year), Pinterest
   trends. Quote sparingly, paraphrase, never present a Reddit post as data.
5. Never log in, scrape behind a login, or automate against sites whose terms
   forbid it (legal-audit R14).

## Standing questions (rotate one per weekly run when nothing is urgent)

- Where do engaged couples in our first metros look for venues today?
- What do The Knot / WeddingWire charge vendors now, and what do vendors
  complain about? (Our wedge for listings.)
- What free tools do competitors use as acquisition (estimators, quizzes,
  checklists), and which rank in search?
- Which wedding directories, blogs and podcasts take submissions or guests?
