---
name: data-audit
description: Sweep existing venues and vendors for stale or dead websites, duplicates, missing photos or prices, and businesses that have closed. Use when the owner asks for /data-audit, a data-quality pass, or "are the listings still right?".
---

# /data-audit

A couple who drives to a venue that closed last year stops trusting the
product, so this hunts for listings that are confidently wrong. It reports and
proposes fixes; it never edits the database. Arguments, if any, narrow the run
("vendors", "Austin", "photography").

## 1. Get the data

The container has no Supabase keys, so the live rows come from the owner:

- **Best:** ask for the two CSVs from the **Export** button on /admin/venues and
  /admin/vendors (with no filters set, so every row comes through). These carry
  photos, prices, "Live" and "Last checked", so every check runs.
- **If they'd rather not:** run on the bundled batch files
  (`src/lib/venue-batches.ts`, `src/lib/vendor-batches.ts`). That covers
  websites, duplicates, contacts and closures for everything imported from a
  batch, but not photos, prices, staleness, or rows added by hand or claimed.
  Say which one the report is based on.

## 2. Run the sweep

```
node .claude/skills/data-audit/audit.mjs \
  [--venues venues.csv] [--vendors vendors.csv] \
  --out <scratchpad>/data-audit.md --json <scratchpad>/data-audit.json
```

`--no-web` skips the website checks (offline, seconds); otherwise it loads
every site, eight at a time, about 2-3 minutes for ~1,500 rows — run it in the
background. `--stale-days` defaults to 180. Rows with Live = no are skipped
except in duplicate checks.

What it flags, highest stakes first:

| Check | Means |
|---|---|
| duplicate | Same website (the importer's `source_id`) or same cleaned-up name in one city. A website clash also means the second batch row never imports. |
| site down / site parked | DNS failure, 4xx/5xx after a retry, or a for-sale/expired/suspended page. |
| maybe closed | The site itself says it closed or stopped booking. |
| site moved | Redirects to another domain: rename, sale, or just a new URL. |
| no website / no contact | Can't be re-checked, or couples can't reach them. |
| no photos / no price | Thin card. |
| stale | Not verified within `--stale-days`, or never. |
| shared phone | Sister venues on one sales line; usually fine, worth a glance. |
| site blocked | 403/429/503 from bot protection; the script can't tell, check by hand. |

## 3. Confirm closures before calling anything closed

The script's signals are leads, not verdicts. For every **site down**,
**site parked**, **maybe closed** and **site moved** row:

1. WebFetch the site once yourself (the script can be fooled by slow hosts).
2. WebSearch `"<name>" <city> closed` and `"<name>" <city> wedding`. Look for a
   Google/Yelp "permanently closed" marker, a closing announcement, local news,
   or a new name at the same address.
3. Sort each into: **closed** (two independent sources, or the business saying
   so), **renamed/moved** (give the new name or URL), **alive** (false alarm),
   or **unsure** (say what's missing). Link the evidence.

For **duplicates**, read both rows and say which to keep (the claimed one,
then the one with more photos/details) and whether they're truly the same
business or sister venues that need distinct websites.

Skip the web searches for low-stakes rows (no photos, no price, stale). They
are counts and lists, not research.

## 4. Report

Write the report as `data-audit-<date>.md` in the scratchpad and send it to the
owner, top to bottom: confirmed closures, duplicates, renamed/moved, dead
sites still unsure, then the counts of thin and stale listings (top 15 each,
grouped by metro if that helps them pick a weekend's work). Keep the chat
reply to a few lines plus the file.

## 5. Fixes: who does what

- **Closed or duplicate rows in the database:** the owner hides them on
  /admin (Live off). Don't recommend deleting: a hard delete cascades away any
  couple's venue shortlist, and the batch importer would offer the row again
  since its website is no longer present.
- **Renamed / new website / mark verified:** the owner edits the row on
  /admin, which also stamps "Last checked".
- **Batch files:** a closed or duplicate row can be removed, and a moved URL
  updated, in `src/lib/*-batches.ts`. That's not an add-rows-only PR, so it
  goes to the owner like any other change rather than merging itself.
  Changing a batch row's website makes it look new to the importer, so only
  do that for rows not yet imported, or hide the old DB row first.
- **Missing photos/prices:** don't invent them. List them; filling them is a
  research batch (from each business's own site) or waits for the business to
  claim its listing.
