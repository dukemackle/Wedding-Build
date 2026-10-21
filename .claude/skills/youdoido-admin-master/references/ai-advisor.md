# Admin Wren -- the business advisor

## What exists (2026-10-20)

`/admin/ask` -> `src/lib/ai/admin-assistant.ts` + `admin-assistant-tools.ts`.
- Model `claude-haiku-4-5` via the Anthropic SDK tool runner; 8 model calls
  per question, last 10 turns, 50 questions/admin/day (fails closed since
  2026-10-21), logged to `admin_assistant_log`.
- One read-only `query` tool over an allowlist of 8 tables and columns;
  emails, phones, tokens, guest names and inquiry messages excluded; test
  couples filtered; 300 rows per query.
- Sends couples' first names and feedback free text to Anthropic.
- `chat-themes.ts` summarises couples' Wren conversations for /admin/feedback.

It is a sound, conservative base. Extend it; don't replace it.

## Direction

1. **Approved reports over raw queries.** Add named tools that return
   pre-computed, definition-backed numbers: `kpi_summary(period)`,
   `signups_by_week`, `feature_adoption`, `coverage_by_state`,
   `listing_opportunities(state)`, `spend_and_renewals`, `infra_usage`.
   Each returns its definition and as-of time so answers can cite them.
   The raw `query` tool stays as a fallback.
2. **Answer format:** facts (with the tool/source and period) separated from
   suggestions; "not available" when no tool covers it -- never estimate.
3. **Finance and knowledge tools** only after those tables exist, read-only,
   no secrets columns exposed.
4. **No actions.** Wren drafts; it never sends, edits or deletes. A future
   "propose" tool may create a draft for the owner to approve, logged.
5. **Model choice:** keep Haiku for routine questions; check the `claude-api`
   skill for current model IDs and pricing before changing. Track tokens per
   question in `admin_assistant_log` so monthly cost is visible.
6. **Privacy:** drop first names from the allowlist unless a question needs
   a specific record; summarise feedback text server-side before sending
   when volumes grow. Confirm the privacy policy covers AI processing of
   feedback (`docs/legal.md`).

## Cost and reliability

At owner-only volume (a few questions a day), Haiku costs cents per month.
The real cost risks are elsewhere: couple-facing AI calls without caps
(contract reading and thank-you drafts got caps in `src/lib/ai/allowance.ts`
on 2026-10-21; any new AI feature needs one too).
