Status: draft (plan, waiting on owner OK)

# SEO plan: metro hub pages and state cost pages

## Why
Fact: state and city are only filters on /venues and /vendors today. The
~14.8k listing pages are reached mainly through the sitemap, with few
crawlable links pointing to them (live sitemap.xml, 2026-11-04).
Inference: hub pages give Google a path to the listings and match how couples
search ("wedding venues in Austin"). Unknown until Search Console is live:
which queries already show us.

## Phase 1: launch-metro hubs (one PR, design preview first)
- `/venues/in/<metro>` and `/vendors/in/<metro>` for the launch metros in
  `scripts/coverage-plan.mjs` (Austin, San Diego first), only where 8+
  indexable listings exist; otherwise the page is noindex and left out of the sitemap.
- Each hub: unique H1 and intro built from our data (listing count, capacity
  range, price-tier mix, top vendor categories), a crawlable list of listing
  links, and links to nearby hubs and the cost page.
- Listing pages link back up to their hub (breadcrumb + BreadcrumbList JSON-LD).
- Venues and vendors built as siblings (CLAUDE.md).
- Depth before breadth: hubs follow the launch-metro depth work, not ahead of it.

## Phase 2: "Wedding cost in <state>" pages
- From `regional_cost_data`, each citing its source and date, linking to
  /estimate and the state's hubs. Only states with real data.

## Not doing
Thousands of auto-generated city pages, AI filler text, bought links.

## Success / stop rule
Measure in Search Console 8 weeks after Phase 1: hub impressions and indexed
listing count. If hubs are indexed but get no impressions, stop before
Phase 2 and rethink.
