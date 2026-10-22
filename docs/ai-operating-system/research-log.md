# Research log

External research the AI team relied on. Newest first. Competitor facts also
go into `docs/competitors.md`; legal research into `docs/legal-audit.md`.

```
## YYYY-MM-DD — <question>
- Sources: <URL (accessed date)>, …
- Finding: <what the sources say>
- Confidence: verified (primary source) / likely / uncertain
- Open questions: <what's still unknown>
- Used for: <decision, PR or briefing>
```

## 2026-10-21 — External data sources for cost, listings, weather, demand
- Sources: provider docs and terms pages listed in `data-intelligence-plan.md` §2 (accessed 2026-10-21).
- Finding: public-domain federal data (BEA RPP, BLS CPI, Census ACS/CBP, CDC/NCHS, NOAA normals) and open place data (Overture CDLA/Apache/CC0, FSQ OS Places Apache 2.0) are safe to store and display; The Knot, Zola and The Wedding Report terms bar SaaS/storage use; Google/Yelp bar storage beyond IDs.
- Confidence: verified for terms quoted; unverified items marked in the plan.
- Open questions: attorney on single attributed Knot/Zola figures and Google place_id live checks; map-tile hosting costs.
- Used for: `docs/ai-operating-system/data-intelligence-plan.md`.

## 2026-10-22 — How couples shop and filter venues on price
- Sources: Zola "how much do venues cost" guide and Zola venue search; Wedding Spot "how it works" (opened 2026-10-22 by the product-strategist agent). The Knot's cost page returned 403; Joy not checked; Knot/WeddingWire forum views seen only in search snippets.
- Finding: Wedding Spot estimates a budget from the couple's guest count and options ("Spot Estimates"); Zola's venue search has no price filter or starting prices, only an "Affordable" style category; Zola notes Saturday evenings cost most and weekday/winter dates can save 20-30%, and that what's included varies.
- Confidence: likely (two primary pages; the rest unverified).
- Open questions: The Knot's and WeddingWire's actual venue price filters.
- Used for: the 2026-10-22 venue price decision (`decisions.md`).

Earlier research: competitor landscape 2026-09-14 (`docs/competitors.md`);
legal audit 2026-10-19 (`docs/legal-audit.md`, sources inline).
