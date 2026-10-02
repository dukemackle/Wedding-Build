import { addBundledVendorRows, addBundledVenueRows } from "@/lib/bundled-import";
import { newBudget, pinUnpinned } from "@/lib/import-pins";

// The "Add them" button on /admin/venues and /admin/vendors, for the scheduled
// batch routine: once a batch PR is merged and deployed, it POSTs here so the
// new listings go live without the owner clicking. Guarded by a shared secret
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

/** Constant-time compare, so the secret can't be guessed a character at a time. */
function matches(given: string, expected: string): boolean {
  if (given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < given.length; i++) diff |= given.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

export async function POST(request: Request) {
  const secret = process.env.BATCH_IMPORT_SECRET;
  // Unset means switched off, not open to anyone.
  if (!secret || secret.length < 32) {
    return Response.json({ error: "Batch import isn't switched on." }, { status: 503 });
  }
  const given = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!matches(given, secret)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  // Venues first, then vendors, spending from one budget: both run in the same
  // Worker invocation, so each assuming the whole allowance went over
  // Cloudflare's cap. The town-pin catch-up goes last, on what's left.
  const budget = newBudget();
  const venues = await addBundledVenueRows(budget, false);
  if (venues.error) return Response.json({ table: "venues", ...venues }, { status: 500 });
  if (venues.remaining || venues.imported) {
    return Response.json({
      table: "venues",
      imported: venues.imported,
      found: venues.found,
      remaining: venues.remaining,
      done: false,
    });
  }

  const vendors = await addBundledVendorRows(budget, false);
  if (vendors.error) return Response.json({ table: "vendors", ...vendors }, { status: 500 });
  if (!vendors.remaining && !vendors.imported) {
    // Split, so a venue town that never pins can't starve the vendors' turn.
    const venueShare = { left: Math.floor(budget.left / 2) };
    budget.left -= venueShare.left;
    await pinUnpinned("venues", venueShare);
    await pinUnpinned("vendors", budget, true);
  }
  return Response.json({
    table: "vendors",
    imported: vendors.imported,
    found: vendors.found,
    remaining: vendors.remaining,
    done: !vendors.remaining && !vendors.imported,
  });
}
