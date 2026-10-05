# Skipped businesses

Real venues and vendors that research found but left out of a batch, one
tab-separated file per state (`texas.tsv`), so the gap between what exists and
what we list can be counted (`npm run coverage` totals them) and the ones worth
inviting can be invited to /list later.

Nothing here is imported or shown on the site. A business stays out of the
catalog until it meets the batch rules or lists itself.

Header row, then one line per business, newest at the end:

```
Kind	Name	Category	City	State	Reason	Link	Date
```

- **Kind**: `Venue` or `Vendor`.
- **Category**: the vendor category (as in the vendor batches); blank for venues.
- **Reason**, exactly one of:
  - `Social only`: active on Instagram, Facebook or a Google listing, but no website.
  - `No website`: no website or active social profile found.
  - `Site dead`: website down, parked or blocking us, and nothing else to confirm it.
  - `Inactive`: nothing posted or updated for about two years.
  - `Closed`: says it has closed or stopped doing weddings.
  - `Franchise`: a franchise, or a directory posing as a business.
- **Link**: the best link found (Instagram, Facebook, Google listing or the
  dead site), so it can be checked again later. Blank if none.
- **Date**: when it was skipped, `YYYY-MM-DD`.

Don't add duplicates of businesses already in the batches, or ones skipped
only because the metro was already full.
