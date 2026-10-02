---
name: add-venues
description: Research and add a batch of wedding venues to the per-state files in src/lib/batches/venues/, checking capacity, price tier and location data, then open and merge the PR once the build is green. Use when asked to add venues, a venue batch, or a new region or metro to the venue catalog.
argument-hint: "[region or metro, e.g. 'Sacramento and Napa']"
---

# Add a venue batch

Adds one PR of venues to the state files in `src/lib/batches/venues/` (e.g.
`ohio.ts`; the older `src/lib/venue-batches.ts` is closed to new batches). The
owner then clicks "Add them" on /admin/venues. A PR that only adds rows to batch files merges
itself once the Cloudflare build is green (CLAUDE.md); anything else in the PR
goes to the owner first.

## 1. Pick the region

Use the argument if one was given. Otherwise run `npm run coverage` and take
the state furthest from its target (the plan's metros and targets are in
`scripts/coverage-plan.mjs`). Each batch goes at the end of its state's file,
and every row's State must match that file; a PR covering several states adds
one batch to each state's file. Aim for **40-60 venues per PR**, across several nearby
towns if one metro runs short: every PR costs a build and a merge whatever its
size. Before researching, grep `src/lib/` for each candidate's domain so you
don't redo a venue that's already in.

## 2. Research each venue from its own website

Only the venue's own site counts. Directories (The Knot, WeddingWire, Zola,
Here Comes the Guide) are fine for finding names, never as the source for a
field. Leave a venue out if it has no working site, is closed, or no longer
hosts weddings. Write descriptions in our own words, one sentence, what makes
the place itself (acreage, buildings, era, water, lodging) -- never copied
marketing copy or reviews, and no superlatives we can't stand behind.

## 3. The row

Start a new batch with this heading row (tab-separated, the same table the
admin import panel accepts):

```
Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
```

- **Address**: required research, because it's what puts the venue in the
  right place on the map. The street line only ("12300 Huber Rd"), where
  the wedding happens, from the venue's own contact/directions page or
  footer, else its Google listing. No town, state or ZIP (those are their
  own columns), never a PO Box or a separate booking office, never guessed.
  The import geocodes it and pins the venue there; a venue with no address
  sits at its town's centre, which on a map of a metro is simply wrong. If
  you truly can't find one, leave it blank and list the venue in the PR body.
- **City / State**: the town in the venue's postal address, so the address
  lookup matches (a Driftwood venue with a Dripping Springs address is
  Dripping Springs); State spelled out ("North Carolina", "District of
  Columbia").
- **Latitude / Longitude**: optional fallback for when the address doesn't
  geocode (rural ranch roads sometimes don't). Fill them only from the
  site's own map embed, never estimated. Both or neither, five decimal
  places, longitude negative.
- **Venue type**: exactly one of `Barn / Rustic`, `Ballroom / Hotel`,
  `Garden / Outdoor`, `Beach / Waterfront`, `Historic / Estate`,
  `Restaurant / Vineyard`. **Setting**: `Indoor`, `Outdoor` or
  `Indoor & Outdoor`. A misspelled value makes the whole row skip.
- **Capacity**: the most guests the venue says it holds for a wedding, as a
  whole number. If it gives seated and standing, use seated; if several
  spaces, the largest single space or the total it says it can host at once,
  whichever the site states. Blank if the site doesn't say -- never guess.
- **Price tier**: `Simple`, `Classic` or `Luxury`, only when the site
  publishes pricing (rental fee, packages or a starting price). Blank when it
  doesn't -- "Contact us for pricing" is blank, and so is "it looks
  expensive". Provisional bands, for a peak Saturday:
  - Venue-only rental: under $6,000 Simple, $6,000-$15,000 Classic, over
    $15,000 Luxury.
  - All-inclusive per guest: under $100 Simple, $100-$200 Classic, over $200
    Luxury.
  - A minimum spend counts as the rental fee.
  Say in the PR body which venues got a tier and from what figure.
- **Email / Phone / Website**: from the site. Website is the de-dupe key, so
  use the venue's own wedding page or home page, `https://`, no tracking
  query string. A venue inside a hotel chain gets that property's URL, not
  the chain's.

Watch the tabs: a stray tab inside a description shifts every later cell.

## 4. Check it

```
npm run check:venues
```

This runs every batch through the real importer and fails on anything
/admin/venues would silently skip, duplicate websites across batches, pins
outside their state (or swapped), and missing City/State/Website. Fix every
ERROR. Warnings (no Setting, a capacity under 20 or over 1000) aren't
blockers, but re-check each one against the site and say in the PR body if
it's right. Every venue in your batch should have an address (a "no Address" warning
on one of yours needs a reason in the PR body). The last line reports what
share of all venues carry a capacity, price tier, street address and pin -- quote it in the PR body so coverage can be tracked.

Then `npm run lint` if node_modules is installed.

## 5. Ship

One commit: `Add <region> venue batch`, body listing anything left out and
why (closed, no site, no longer hosts weddings). Push, open the PR, and once
the Cloudflare build check is green, merge it -- this PR only touches
batch files, so it doesn't wait for the owner. If the build fails with
the Google font errors from CLAUDE.md, that's a flake: say so rather than
changing code. Tell the owner in one line it's merged and to click "Add them"
on /admin/venues.
