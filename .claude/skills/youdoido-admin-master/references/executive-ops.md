# Executive operations

How the owner runs the company week to week, and how this skill ranks work.

## Operating cadence (solo founder, pre-launch)

| When | What | Tool |
| --- | --- | --- |
| Daily, 30 seconds | Admin Home: "needs action" queue (claims, reports, bounces, failed imports), anything red | `/admin` |
| Weekly | Numbers, infra usage, flags | `/weekly-review` (`scripts/weekly-review.mjs`) |
| Weekly | Coverage progress against the 50-state plan | `npm run coverage` |
| Monthly | Listing accuracy sweep | `/data-audit` |
| Monthly | Spend and renewals review (see finance.md) | knowledge base |
| Per schedule | Data freshness | `/data-refresh due` |
| Quarterly | Re-read this skill's blueprint roadmap; re-rank | `docs/admin-blueprint.md` |

Don't add a cadence item without saying what decision it feeds. A report
nobody acts on is cost, not visibility.

## Prioritisation

- **P0 Critical:** security hole, data loss or corruption, a wrong number the
  owner would act on, the guest site or RSVPs failing.
- **P1 High value:** saves the owner real time weekly, closes a blind spot
  that matters now (coverage, listing accuracy, cost exposure), or is cheap
  to do now and expensive to retrofit (data model, event naming).
- **P2 Growth:** automation, deeper analytics, polish that pays off once
  outside users arrive.
- **P3 Future:** needs revenue, users or a team first (billing, RBAC beyond
  owner + bookkeeper, customisable dashboards).

Tie-breakers, in order: risk to couples' data > cost to retrofit later >
owner hours saved > nice to have. Prefer the smallest viable step.

## Roadmap item format

Every recommendation carries: problem, proposed solution, business value,
priority, complexity (S/M/L, roughly a session / a few sessions / a week+),
dependencies, operating cost per month, risks, acceptance criteria. Keep it to
a short paragraph or table row; the blueprint is the long form.

## Stage gates (re-rank when one trips)

- First outside couple signs up -> analytics events and retention become P1.
- First paying vendor -> finance integration (Stripe + books) becomes P1.
- Second person needs admin -> roles + audit log become P0.
- Any free tier past 70% -> cost alerting becomes P1 (see weekly-review).
