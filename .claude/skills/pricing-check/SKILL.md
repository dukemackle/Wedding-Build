---
name: pricing-check
description: Answers "is it time to move monetization phases?" by loading docs/monetization.md and checking each phase trigger against real (non-test) admin data. Use when the owner runs /pricing-check or asks whether to start charging vendors, move to Phase 1/2/3, or whether the numbers justify pricing.
---

# /pricing-check

Answer one question: **is the next monetization phase's trigger met yet?**
The decision to move is always the owner's. This skill reports evidence and a
verdict, never starts charging, emails vendors, or flips `active`.

## 1. Load the roadmap

Read `docs/monetization.md` in full. It is the source of truth for which phase
is current and what each trigger says. If it's been rewritten since this skill
was written, follow the file, not the summary below.

Summary at time of writing: Phase 0 (free) → Phase 1 (light vendor lead
pricing) when there's a real base of active vendors each getting genuine
inquiries plus a steady trickle of organic couple signups → Phase 2
(featured placement/tiers) when Phase 1 proved vendors pay *and* placement is
contested (real density per category/region) → Phase 3 (vendor portal) when
manual billing is a time burden.

## 2. Get the real numbers

Run the read-only snapshot from the repo root:

```
node --env-file=.env.local .claude/skills/pricing-check/metrics.mjs
```

It needs `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (and
`ADMIN_EMAIL`, optional, to catch the owner's own unflagged weddings). It
excludes `is_test` weddings and `is_sample` vendors everywhere.

If the env isn't available (cloud sessions usually don't have it), don't
guess. Ask the owner for these from the admin panel, in one message:
- `/admin/growth`: real signups in the last 30 and 90 days, and by month
- `/admin/vendors`: listed vendors, and how many have real inquiries (and how many)
- whether all of their own test weddings are marked as test

## 3. Check data quality before judging

Garbage in, garbage out. Flag before the verdict:
- `owner_weddings_not_flagged_test > 0` → owner testing is counted as real
  usage. Say so and say the numbers are inflated until those are flagged.
- Inquiries concentrated in one or two weddings → probably one couple (or the
  owner) testing, not demand.
- Many vendor rows but few listed/non-sample → seeded catalogue, not vendors
  who chose to be there. Seeded batches (`src/lib/vendor-batches.ts`) count
  as supply for density, but not as vendors who'd notice a bill.

## 4. Judge the current phase's trigger

Score each condition of the *next* trigger as **met / not met / unknown**,
with the number behind it. Working thresholds for Phase 0 → 1 (the doc
deliberately sets no hard numbers, so present these as a lens, not a rule):
- **Organic couples:** real signups in each of the last ~3 months, not one
  burst. Roughly 10+/month reads as "a steady trickle"; 0–2 is still the
  owner's circle.
- **Vendor leads worth something:** a meaningful group (≈10+) of listed
  vendors with 3+ real inquiries in 90 days, so the leads are obviously worth
  paying for. `booked` status is the strongest evidence.
- **Active vendor base:** enough listed, non-sample vendors that outreach to
  the inquiry-receiving segment is worth running.

For Phase 1 → 2, also check `densest_category_city`: placement only sells
where a category in one metro has enough competitors (≈8+) that ranking
matters. For Phase 2 → 3 there's no data signal; ask the owner how much time
manual billing takes.

## 5. Answer

Short, per CLAUDE.md. Lead with the verdict in one line — **"Not yet"**,
**"Getting close"**, or **"Trigger looks met — your call"** — then one line
per condition with its number, then the single thing that would move the
needle most (usually a product or supply action, not a pricing one). If the
trigger looks met, point to the rollout plan in `docs/monetization.md`
(segment first, announce with a carrot, grace period) and stop there.

If the run shows the roadmap itself is out of date (e.g. a phase was
effectively entered, or a trigger proved wrong), offer to update
`docs/monetization.md` rather than editing it unasked.
