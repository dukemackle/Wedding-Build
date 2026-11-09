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
  - `Social only`: no website, and either only on Facebook or Google, or an
    Instagram that misses the Instagram-only bar in the add-vendors skill.
  - `No website`: no website or active social profile found.
  - `Site dead`: website down or parked, and nothing else to confirm it.
  - `Site blocks automated visits, unconfirmed`: the site turns our checker
    away (401/403/429/502/503/520), so the business is probably real but needs a
    second source before it can be listed. Never disguise the checker to get
    past it.
  - `Site back up`: was `Site dead`, loaded on a later `npm run
    recheck:skipped`; research it into a batch again.
  - `Confirmed on Google, site blocks us`: `npm run places:check` found it
    open on Google (answers kept in `src/lib/batches/places/`). Add it to a
    batch; leave phone, email and capacity blank. Never copy Google's address
    or details (its terms forbid it): take the address from elsewhere and the
    checker compares it with Google's.
  - `Not on Google, site blocks us`: blocked and not on Google either. Leave
    it until it lists itself or can be confirmed by hand.
  - `Inactive`: nothing posted or updated for about two years.
  - `Closed`: says it has closed or stopped doing weddings.
  - `Franchise`: a franchise, or a directory posing as a business.
- **Link**: the best link found (Instagram, Facebook, Google listing or the
  dead site), so it can be checked again later. Blank if none.
- **Date**: when it was skipped, `YYYY-MM-DD`.

`npm run recheck:skipped` revisits every `Site dead` row (one honest visit
each) and, with `-- --write`, moves it to one of the two reasons above.

Don't add duplicates of businesses already in the batches, or ones skipped
only because the metro was already full.
