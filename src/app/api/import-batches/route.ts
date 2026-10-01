import { addBundledVendorRows, addBundledVenueRows } from "@/lib/bundled-import";

// The "Add them" button on /admin/venues and /admin/vendors, for the scheduled
// batch routine: once a batch PR is merged and deployed, it POSTs here so the
// new listings go live without the owner clicking. Guarded by a shared secret
// (BATCH_IMPORT_SECRET, set in Cloudflare and in the routine's environment)
// rather than an admin login, which the routine doesn't have.
//
//   curl -X POST https://wrenwed.com/api/import-batches \
//     -H "Authorization: Bearer $BATCH_IMPORT_SECRET"
//
// Like the button, each call adds a few towns' worth (Cloudflare caps the pin
// lookups one request can make), so call again until `done` is true.

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

  // Venues first, then vendors: one table's chunk per call keeps each request
  // inside the lookup cap.
  const venues = await addBundledVenueRows();
  if (venues.error) return Response.json({ table: "venues", ...venues }, { status: 500 });
  if (venues.remaining || venues.imported) {
    return Response.json({ table: "venues", imported: venues.imported, done: false });
  }

  const vendors = await addBundledVendorRows();
  if (vendors.error) return Response.json({ table: "vendors", ...vendors }, { status: 500 });
  return Response.json({ table: "vendors", imported: vendors.imported, done: !vendors.remaining && !vendors.imported });
}
