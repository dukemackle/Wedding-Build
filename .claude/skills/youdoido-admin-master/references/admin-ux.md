# Admin UX

Visual decisions belong to the `design-expert` skill (and its DECISIONS.md);
this file covers what admin screens must do. Admin follows the page-width
scale in `src/lib/layout.ts` and the colour roles in `CLAUDE.md`.

## Current shape (2026-10-20)

- Served only on admin.youdoido.com (`src/proxy.ts`); sidebar nav in
  `src/app/admin/admin-nav.tsx`, with "soon" placeholders for Notifications,
  Finance and Analytics.
- Lists: shared `_listing/` toolbar with URL-stored filters, 50 per page,
  bulk actions, CSV export. Good base; reuse it for any new list.
- Search: `admin-search.tsx` searches pages, couples, listings, claims,
  feedback. No keyboard palette, no saved views.
- No chart library; Growth uses CSS bars. `StatTile` is duplicated in
  `admin/page.tsx` and `revenue/page.tsx`: extract before adding a third.

## Proposed navigation (owner to approve)

1. **Home** -- needs-action queue, 5-7 KPI cards with change vs previous
   period, coverage progress, system health.
2. **People** -- Couples, Vendors, Venues (record pages), Claims.
3. **Marketplace** -- Listing health, Coverage, Unlisted bookings, Buy & sell,
   Photo wall, Attire, Cost data.
4. **Insights** -- Growth & funnels, Feature adoption, Feedback themes,
   Ask Wren.
5. **Money** -- Spend & renewals now; Revenue (Stripe) and Books later.
6. **Operations** -- Knowledge base (company, tech inventory, decisions),
   Automations & run log, Audit log.

## Patterns to apply

- Home leads with what needs a decision, then numbers. Every card links to
  its detail page and states its definition (see analytics.md).
- Empty states say why ("No revenue yet -- Phase 0 is free") rather than 0.
- Bulk actions: show the count, confirm destructive ones, log them.
- Cmd/Ctrl+K palette over the existing search action; `?` lists shortcuts.
- Saved views = named URLs of the existing filters, stored per admin.
- Desktop: dense tables, side panels. Phone: triage only (queue, record
  view, approve/reject), not full tables. Check both widths.
- Charts: load the `dataviz` skill first; a small dependency-free SVG
  sparkline/bar set is preferred over a chart library at this size.
