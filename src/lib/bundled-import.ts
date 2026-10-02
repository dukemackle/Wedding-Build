import "server-only";

import { revalidatePath } from "next/cache";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { findAddresses } from "@/lib/address-finder";
import { type Budget, newBudget, pinFromAddresses, pinUnpinned, withinBudget, withPins } from "@/lib/import-pins";
import { VENDOR_BATCHES } from "@/lib/vendor-batches";
import { parseVendorTable, type VendorImportValues } from "@/lib/vendor-import";
import { VENUE_BATCHES } from "@/lib/venue-batches";
import { importSourceId, parseVenueTable, type VenueImportValues } from "@/lib/venue-import";

// The bundled-batch import, shared by the "Add them" banner on /admin (behind
// requireAdmin) and /api/import-batches (behind BATCH_IMPORT_SECRET, for the
// scheduled batch routine). No auth here -- callers check it -- which is why
// this lives outside the "use server" action files, where every export is
// callable from the browser.

/**
 * `found`: listings moved onto a street address this call, so a caller can
 * see progress on calls that import nothing new.
 */
export type BundledResult = { error?: string; imported?: number; remaining?: number; found?: number };

// Shared by the paste import and the bundled batches, so both stamp the same
// provenance on what they insert.
export async function insertImportedVenues(rows: VenueImportValues[]): Promise<string | null> {
  const admin = createAdminSupabaseClient();
  const pinned = await withPins(rows);
  const { error } = await admin.from("venues").insert(
    pinned.map((values) => ({
      ...values,
      // Imports are how real venues get in. Sample data is seeded elsewhere,
      // so defaulting this to false keeps /admin/venues honest about which
      // listings are real -- the distinction the Phase 1 triggers rely on.
      is_sample: false,
      // Recorded now because it can't be recovered later: which rows were
      // pasted in rather than entered or claimed, and from which site. Left
      // unverified until someone actually checks the listing.
      source: "import",
      source_id: importSourceId(values.website),
    })),
  );

  if (!error) return null;
  if (error.code === "23505") {
    return "One of these venues is already imported (same website) — nothing was imported.";
  }
  return error.message;
}

/**
 * Rows whose website isn't in `table` yet. Rows with no website are dropped:
 * nothing would mark them as added, so every call would insert them again.
 */
async function notYetListed<T extends { website: string | null }>(table: "venues" | "vendors", rows: T[]): Promise<T[]> {
  const ids = rows.map((values) => importSourceId(values.website)).filter((id): id is string => !!id);
  if (ids.length === 0) return [];

  // Across every source, so a listing that has since been claimed or
  // re-sourced still counts as present.
  const { data } = await createAdminSupabaseClient()
    .from(table)
    .select("source_id")
    .in("source_id", ids)
    .returns<{ source_id: string }[]>();
  const present = new Set((data ?? []).map((row) => row.source_id));
  return rows.filter((values) => {
    const id = importSourceId(values.website);
    return !!id && !present.has(id);
  });
}

/** Bundled batch rows (src/lib/venue-batches.ts) whose website isn't in the database yet. */
export async function pendingBundledVenueRows(): Promise<VenueImportValues[]> {
  return notYetListed("venues", bundledVenueRows());
}

function bundledVenueRows(): VenueImportValues[] {
  return VENUE_BATCHES.flatMap((batch) => parseVenueTable(batch.tsv).rows)
    .filter((row) => row.errors.length === 0)
    .map((row) => row.values);
}

function bundledVendorRows(): VendorImportValues[] {
  return VENDOR_BATCHES.flatMap((batch) => parseVendorTable(batch.tsv).rows)
    .filter((row) => row.errors.length === 0)
    .map((row) => row.values);
}

/** Batch rows keyed by website, for matching to listings already in the database. */
function keyed<T extends { website: string | null }>(rows: T[]): (T & { source_id: string })[] {
  return rows.flatMap((row) => {
    const source_id = importSourceId(row.website);
    return source_id ? [{ ...row, source_id }] : [];
  });
}

/** Bundled batch rows (src/lib/vendor-batches.ts) whose website isn't in the database yet. */
export async function pendingBundledVendorRows(): Promise<VendorImportValues[]> {
  return notYetListed("vendors", bundledVendorRows());
}

/**
 * Adds the pending bundled venues, as many as `budget` allows (Cloudflare caps
 * the requests one call can make, database reads and writes included). Once
 * all are in, moves listed venues whose batch row has since gained an address
 * onto it. `remaining` tells the caller to call again. `catchUp: false` leaves
 * the town-pin catch-up to the caller, which runs it once both tables are done.
 */
export async function addBundledVenueRows(budget: Budget = newBudget(), catchUp = true): Promise<BundledResult> {
  budget.left -= 1;
  const rows = await pendingBundledVenueRows();
  // One request is kept back for the insert.
  const { batch, spent } = withinBudget(rows, budget.left - 1);
  if (batch.length > 0) {
    budget.left -= spent + 1;
    const error = await insertImportedVenues(batch);
    if (error) return { error };
  }

  let remaining = rows.length - batch.length;
  let found = 0;
  if (remaining === 0) {
    const moved = await pinFromAddresses("venues", keyed(bundledVenueRows()), budget);
    if (moved.error) return { error: moved.error };
    remaining = moved.remaining;
    if (remaining === 0) {
      // Then listings whose batch row has no address: read it off their own site.
      const finder = await findAddresses("venues", budget);
      if (finder.error) return { error: finder.error };
      remaining = finder.remaining;
      found = finder.found;
    }
    // Catches up venues from earlier batches that went in without a pin,
    // with whatever this call has left.
    if (remaining === 0 && catchUp) await pinUnpinned("venues", budget);
    revalidatePath("/admin/venues");
    revalidatePath("/venues");
  }
  return { imported: batch.length, remaining, found };
}

/** As addBundledVenueRows, for vendors. */
export async function addBundledVendorRows(budget: Budget = newBudget(), catchUp = true): Promise<BundledResult> {
  budget.left -= 1;
  const rows = await pendingBundledVendorRows();
  const { batch, spent } = withinBudget(rows, budget.left - 1);
  if (batch.length > 0) {
    budget.left -= spent + 1;
    // Vendors without a studio address share their town's pin, so each is
    // nudged apart (spreadPin) to stay clickable.
    const pinned = await withPins(batch, (row) => row.name);
    const { error } = await createAdminSupabaseClient()
      .from("vendors")
      .insert(
        // A blank address is left out rather than sent as null, so vendor
        // batches keep importing on a database without migration 0092.
        pinned.map(({ address, ...values }) => ({
          ...values,
          ...(address ? { address } : {}),
          is_sample: false,
          source: "import",
          source_id: importSourceId(values.website),
        })),
      );
    if (error) {
      return {
        error:
          error.code === "23505"
            ? "One of these vendors is already listed (same website) — nothing was added."
            : error.message,
      };
    }
  }

  let remaining = rows.length - batch.length;
  let found = 0;
  if (remaining === 0) {
    const moved = await pinFromAddresses("vendors", keyed(bundledVendorRows()), budget);
    if (moved.error) return { error: moved.error };
    remaining = moved.remaining;
    if (remaining === 0) {
      // Then listings whose batch row has no address: read it off their own site.
      const finder = await findAddresses("vendors", budget);
      if (finder.error) return { error: finder.error };
      remaining = finder.remaining;
      found = finder.found;
    }
    if (remaining === 0 && catchUp) await pinUnpinned("vendors", budget, true);
    revalidatePath("/admin/vendors");
    revalidatePath("/vendors");
  }
  return { imported: batch.length, remaining, found };
}
