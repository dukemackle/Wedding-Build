import { addBundledVendorRows, addBundledVenueRows } from "@/lib/bundled-import";
import { findAddresses } from "@/lib/address-finder";
import { refuseBatchCaller } from "@/lib/batch-secret";
import { newBudget, pinUnpinned } from "@/lib/import-pins";

// The "Add them" button on /admin/venues and /admin/vendors, for a caller
// with no admin login. The batch routine used to POST here; it now runs
// scripts/import-batches.mjs, which does this work off-Worker and writes
// through /api/batch-sync, because a few listings per call against Workers
// Free's CPU limit kept failing with error 1102. Kept as a fallback. Guarded by a shared secret
// (BATCH_IMPORT_SECRET, set in Cloudflare and in the routine's environment)
// rather than an admin login, which the routine doesn't have.
//
//   curl -X POST https://youdoido.com/api/import-batches \
//     -H "Authorization: Bearer $BATCH_IMPORT_SECRET"
//
// Like the button, each call adds or re-pins a few listings (Cloudflare caps the pin
// lookups one request can make), so call again until `done` is true.
// `remaining` is what's left in the current table and `found` how many
// listings were moved onto a street address: a call that imports nothing is
// still progress while `remaining` falls.

export async function POST(request: Request) {
  const refused = refuseBatchCaller(request);
  if (refused) return refused;

  // New listings first, venues then vendors, spending from one budget: both
  // run in the same Worker invocation, so each assuming the whole allowance
  // went over Cloudflare's cap. Reading addresses off listings' own websites
  // is slow (a few per call, over a thousand to go), so it comes after both,
  // and a newly merged vendor batch never waits behind it. The town-pin
  // catch-up goes last, on what's left.
  const budget = newBudget();
  const venues = await addBundledVenueRows(budget, false, false);
  if (venues.error) return Response.json({ table: "venues", ...venues }, { status: 500 });
  if (venues.remaining || venues.imported) {
    return Response.json({ table: "venues", imported: venues.imported, found: 0, remaining: venues.remaining, done: false });
  }

  const vendors = await addBundledVendorRows(budget, false, false);
  if (vendors.error) return Response.json({ table: "vendors", ...vendors }, { status: 500 });
  if (vendors.remaining || vendors.imported) {
    return Response.json({ table: "vendors", imported: vendors.imported, found: 0, remaining: vendors.remaining, done: false });
  }

  let found = 0;
  for (const table of ["venues", "vendors"] as const) {
    const finder = await findAddresses(table, budget);
    if (finder.error) return Response.json({ table, error: finder.error }, { status: 500 });
    found += finder.found;
    if (finder.remaining) {
      return Response.json({ table, imported: 0, found, remaining: finder.remaining, done: false });
    }
  }

  // Split, so a venue town that never pins can't starve the vendors' turn.
  const venueShare = { left: Math.floor(budget.left / 2) };
  budget.left -= venueShare.left;
  await pinUnpinned("venues", venueShare);
  await pinUnpinned("vendors", budget, true);
  return Response.json({ table: "vendors", imported: 0, found, remaining: 0, done: true });
}
