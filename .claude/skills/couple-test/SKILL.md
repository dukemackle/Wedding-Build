---
name: couple-test
description: Walk a You Do, I Do feature the way a realistic engaged couple would — a 150-guest Austin wedding on a $30k budget, divorced parents at seating time, the week-of timeline — and report where it breaks down. Use when the owner says /couple-test, asks to "test this like a couple would", or wants a reality check on a couple-facing feature before or after shipping it.
---

# /couple-test

Play a real couple using one feature end to end, then report the moments it
fails them. This is not a unit test or a code review: the question is "would a
stressed, busy couple get what they need here?", judged against how weddings
actually go.

Argument: a feature (`budget`, `guests`, `seating`, `itinerary`, `checklist`,
`venues`, `vendors`, `bookings`, `attire`, `venue-layout`, `guests/site`, …)
and optionally a scenario name or a free-text scenario. No feature → ask which
one in one line. No scenario → pick the one or two from the list below that
stress that feature hardest, and say which you picked.

## 1. Learn what the feature actually does

Read the route under `src/app/<feature>/` (`page.tsx`, the `*-manager.tsx` /
panels, `actions.ts`) and its tables in `supabase/migrations/`. Only what's
needed: the inputs a couple fills in, the limits and validation, what's
computed, what's shown back, and what's shared with partners or guests. Check
`docs/competitors.md` only if a gap might already be parked or shipped.

If the app can run (`.env` has Supabase keys), use the `run` skill to start it
and drive the scenario in Chromium at **375px and ~1440px** — the two layouts
are separate designs and can fail separately. If it can't run, walk it from the
code and say so in the report; don't claim you clicked anything you didn't.

## 2. Build the couple

Make them specific: names, date, city, guest count, budget, who's paying, the
family situation, how organised each partner is. Write their real data (actual
guest names with plus-ones and kids, actual budget lines, actual timeline
times) — testing with "Guest 1" and round numbers hides the problems.

Stock scenarios (adapt, combine, or invent one closer to the feature):

- **Austin, 150 guests, $30k.** October Saturday, Hill Country venue. Venue +
  catering eat ~50%; Austin per-head catering runs $85–150, so the budget is
  tight. Parents contribute fixed amounts with strings attached. 150 invited
  → ~120 attend; plus-ones, kids, a few vegetarian/GF meals. Deposits due
  months apart; final headcount due 2–3 weeks out.
- **Divorced parents at seating.** Bride's parents divorced and remarried; mom
  and stepdad mustn't sit near dad and his new wife; grandma wants both sides
  close; a step-sibling and half-siblings; a plus-one nobody's met; one couple
  that broke up after RSVPing. Two family "head" tables or none.
- **The week-of timeline.** Rehearsal Friday, ceremony 4:30 Saturday, sunset
  ~6:45. Hair & makeup for 6 people starting 9am, photographer arrives 1pm,
  first look, a vendor running 30 minutes late, a rain plan, the timeline
  shared with the planner, DJ, photographer and the wedding party — some on
  phones in a parking lot.
- **Two partners, two styles.** One plans in spreadsheets, one only on their
  phone; they edit the same list on the same evening.
- **The late change.** Venue moved, date moved, or guest count cut from 180
  to 120 three months out — what has to be redone by hand?
- **Bulk reality.** Importing a messy 200-row spreadsheet from mom: duplicate
  households, missing emails, "The Garcias (4)" in one cell.

## 3. Walk it

Go step by step in the order the couple would, not the order the code is
written. At each step note what they're trying to do, what they see, and
whether it works. Push on the places real weddings get messy:

- **Numbers:** totals, per-head math, deposits vs balance, money already
  paid, rounding, over-budget states, who-pays splits.
- **People:** households vs individuals, plus-ones, kids, dietary needs,
  RSVP changes after the fact, guests who must stay apart.
- **Time:** timezone, overnight/next-day events, overlaps, late changes,
  deadlines that should surface before they're missed.
- **Sharing:** partner edits, what a vendor or guest sees, privacy of family
  notes ("dad's wife — keep away from mom" must never reach a guest page).
- **Scale and edge:** 0 items, 1 item, 300 items, long names, emoji, a
  mistake that needs undoing (deleting the wrong guest), an empty field.
- **Phone in hand:** can it be done one-handed at 375px, on a slow
  connection, the morning of?

## 4. Report

Short — the owner is on a usage budget. Lead with the couple in one line, then
the breakdowns ranked by how badly they'd hurt a real couple:

- **Blocks** — they can't do the thing, lose data, or something wrong/private
  is shown to someone else.
- **Hurts** — they can, but with workarounds, wrong numbers, or re-entering
  data.
- **Rough** — friction, confusing copy, missing nudge.

Each item: the moment in the scenario, what happens, `file:line` where it
comes from, and the smallest fix. Say whether it's from running the app or
from reading code, and which width (375 / 1440) when it's layout. End with a
one-line verdict ("ready for this couple" / "fix the Blocks first").

Don't fix anything as part of the test. Offer to fix the top items in one
batched PR; visual fixes still get a preview before shipping (see CLAUDE.md).
If a finding is a judgment call (e.g. whether to support a second head table),
flag it as the owner's call rather than proposing it as a bug.
