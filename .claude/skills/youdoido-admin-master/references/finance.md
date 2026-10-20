# Finance and accounting

## Current state (2026-10-20)

- No payment, billing, invoice or expense code. No Stripe. Phase 0 is free
  for everyone (`docs/monetization.md`).
- `/admin/revenue` totals `vendor_inquiries.booked_amount`: what couples say
  they paid vendors. That is marketplace GMV, not company income. Label it so.
- `/admin/cost-data` is couple-facing wedding-cost estimates
  (`regional_cost_data`), not company expenses.
- Company costs live only in the weekly-review script's free-tier usage and
  the providers' own dashboards.

## Principles

- **Connect to a book of record, don't build one.** QuickBooks Online or Xero
  holds the ledger, reconciliation and tax categories; the admin shows a
  read-only summary with a "last synced" time and a link out.
- **Keep the words straight:** revenue (earned), cash collected (received),
  profit (revenue minus expenses), cash flow (money in minus out in a
  period), GMV (bookings couples report). Never sum across them.
- **Every finance number shows** its source, as-of time, and whether the
  period is reconciled. Unreconciled = "provisional". Internal estimates are
  labelled estimates and never called official books.
- **Never** move money, issue refunds, change billing settings, create or
  edit books entries, or file anything without the owner's explicit yes for
  that action. Read-only OAuth scopes wherever the provider offers them.

## Provider notes (researched 2026-10-20; re-check before building)

- QuickBooks Online API: OAuth2 developer app; Intuit's App Partner Program
  free "Builder" tier with a monthly read-call allowance (calls over it are
  blocked, not billed). A single company connection fits the free tier.
- Xero API: tiered pricing since March 2026; free Starter tier (5
  connections, 1,000 calls/day per org) covers one company.
- Stripe: needed for vendor billing in Phase 1 (payment links first, per
  monetization.md). Stripe's API gives charges, fees, refunds and payouts
  read-only; no paid add-on (Sigma, Revenue Recognition) needed at this size.
- Bank data: let QuickBooks/Xero bank feeds do it. Stripe Financial
  Connections and Plaid are for reading *customers'* accounts; don't use them
  for the company's own books.
- Accountant access: add the bookkeeper as a user inside QuickBooks/Xero,
  not as an admin-panel user.

## What to build, staged

1. **Now (no revenue):** a Spend & renewals page from the knowledge base's
   subscription list (provider, plan, monthly cost, renewal date, card
   owner, free-tier limit), plus infra usage. Manual entry, owner-only.
   Reminder 14 days before each renewal.
2. **First revenue (Phase 1):** Stripe read-only sync of charges, fees,
   refunds, payouts; revenue by stream (vendor leads, later placements).
   Reconcile Stripe payouts against the bank in QuickBooks/Xero, not here.
3. **When the books exist:** QuickBooks/Xero read-only monthly P&L and cash
   balance cards; export for the accountant.
4. **Later:** budget vs actual, forecast, AR/AP views if invoicing vendors.

## Quick checks for any finance feature

Does it show freshness? Does it say what's missing? Could a reader mistake
GMV or an estimate for revenue? Is every write action owner-approved and
logged? Are provider tokens stored as Worker secrets, never in tables?
