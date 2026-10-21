# Marketplace data quality and coverage

Listing accuracy is a retention item (`docs/retention.md`) and a legal one
(`docs/legal-audit.md` R5: say "Checked against their website", never
"verified"). Batches: `add-venues` / `add-vendors`. Sweeps: `data-audit`.
Cadences: `data-refresh` and `src/lib/listing-freshness.ts`.

## Provenance tiers -- keep them distinct, always

| Tier | How we know | Where it's stored |
| --- | --- | --- |
| Imported | Researched from the public web in a batch | `source='import'`, `field_sources[field].by='batch'` |
| Self-listed | Business submitted via /list, admin approved | `source='self-listed'` |
| Claimed | Business submitted via a claim link, admin approved | `*_submissions` approved; fields `by: venue|vendor` |
| Checked | A person or job compared to the business's own site on a date | `last_verified_at`, `verified_by`, `address_checked_at` |

A completeness score measures *presence*, not *truth*. Show it next to the
tier and the last-checked date, never instead of them.

## Useful scores (computed, not stored, until they're slow)

- **Completeness:** photos, price tier, capacity (venues), website, contact,
  description, coordinates, each weighted by how much it affects a couple's
  decision (photos and price highest).
- **Staleness:** days since `last_verified_at` vs the cadence for that field.
- **Opportunity** (what to fix first): demand x gap. Demand = metro's
  couples/inquiries/searches (or plan target when there are no users);
  gap = missing high-weight fields or stale. Rank listings by opportunity.

## Known weaknesses (2026-10-20)

- Duplicate guard is the normalized website only (`src/lib/venue-import.ts`);
  `0121_remove_duplicate_listings.sql` cleaned pairs by hand. Add a name +
  city similarity check to the import script and the data-audit sweep.
- `npm run coverage` counts batch files, not the live DB; rows added by hand,
  self-listed or deactivated aren't reflected. An admin coverage view should
  read the DB.
- `/api/contact-click` is public and unthrottled: treat clicks as soft.
- `batch-sync` inserts spread the row as sent (secret-gated); whitelist
  insert columns like the update path does.
- Claim-form photo uploads go straight to public buckets (legal-audit R8).

## Enrichment, responsibly

Allowed: the business's own website, official social profiles, public
government data (Census geocoder), OSM, the owner's own research. Respect
robots.txt, identify the bot (YouDoIDoBot UA exists), rate-limit, keep the
source per field. Not allowed: scraping The Knot/WeddingWire/Zola listings,
copying their photos or reviews, buying contact lists, guessing emails.
Paid sources (Google Places) are on the "needs payment" list in ROADMAP.md.
