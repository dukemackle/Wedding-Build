import "server-only";

import { revalidatePath } from "next/cache";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { isPinned, pinUnpinned, townKey, TOWNS_PER_CALL, withTownPins, type Unpinned } from "@/lib/import-pins";
import { VENDOR_BATCHES } from "@/lib/vendor-batches";
import { parseVendorTable, type VendorImportValues } from "@/lib/vendor-import";
import { VENUE_BATCHES } from "@/lib/venue-batches";
import { importSourceId, parseVenueTable, type VenueImportValues } from "@/lib/venue-import";

// The bundled-batch import, shared by the "Add them" banner on /admin (behind
// requireAdmin) and /api/import-batches (behind BATCH_IMPORT_SECRET, for the
// scheduled batch routine). No auth here -- callers check it -- which is why
// this lives outside the "use server" action files, where every export is
// callable from the browser.

export type BundledResult = { error?: string; imported?: number; remaining?: number };

// Shared by the paste import and the bundled batches, so both stamp the same
// provenance on what they insert.
export async function insertImportedVenues(rows: VenueImportValues[]): Promise<string | null> {
  const admin = createAdminSupabaseClient();
  const pinned = await withTownPins(rows);
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

/** Up to TOWNS_PER_CALL towns' worth of rows, plus every row that already has a pin. */
function thisCall<T extends Unpinned>(rows: T[]): { batch: T[]; towns: number } {
  const towns = new Set<string>();
  const batch = rows.filter((row) => {
    if (isPinned(row)) return true;
    const key = townKey(row);
    if (towns.has(key)) return true;
    if (towns.size >= TOWNS_PER_CALL) return false;
    towns.add(key);
    return true;
  });
  return { batch, towns: towns.size };
}

/** Bundled batch rows (src/lib/venue-batches.ts) whose website isn't in the database yet. */
export async function pendingBundledVenueRows(): Promise<VenueImportValues[]> {
  const rows = VENUE_BATCHES.flatMap((batch) => parseVenueTable(batch.tsv).rows)
    .filter((row) => row.errors.length === 0)
    .map((row) => row.values);
  return notYetListed("venues", rows);
}

/** Bundled batch rows (src/lib/vendor-batches.ts) whose website isn't in the database yet. */
export async function pendingBundledVendorRows(): Promise<VendorImportValues[]> {
  const rows = VENDOR_BATCHES.flatMap((batch) => parseVendorTable(batch.tsv).rows)
    .filter((row) => row.errors.length === 0)
    .map((row) => row.values);
  return notYetListed("vendors", rows);
}

/**
 * Adds the pending bundled venues from up to TOWNS_PER_CALL towns that need a
 * pin looked up (Cloudflare caps the lookups one request can make).
 * `remaining` tells the caller to call again.
 */
export async function addBundledVenueRows(): Promise<BundledResult> {
  const rows = await pendingBundledVenueRows();
  if (rows.length === 0) return { imported: 0, remaining: 0 };

  const { batch, towns } = thisCall(rows);
  const error = await insertImportedVenues(batch);
  if (error) return { error };

  const remaining = rows.length - batch.length;
  if (remaining === 0) {
    // Catches up venues from earlier batches that went in without a pin, with
    // whatever lookups this call has left.
    await pinUnpinned("venues", TOWNS_PER_CALL - towns);
    revalidatePath("/admin/venues");
    revalidatePath("/venues");
  }
  return { imported: batch.length, remaining };
}

/** As addBundledVenueRows, for vendors. */
export async function addBundledVendorRows(): Promise<BundledResult> {
  const rows = await pendingBundledVendorRows();
  if (rows.length === 0) return { imported: 0, remaining: 0 };

  const { batch, towns } = thisCall(rows);
  const pinned = await withTownPins(batch, (row) => row.name);
  const { error } = await createAdminSupabaseClient()
    .from("vendors")
    .insert(
      pinned.map((values) => ({
        ...values,
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

  const remaining = rows.length - batch.length;
  if (remaining === 0) {
    await pinUnpinned("vendors", TOWNS_PER_CALL - towns, true);
    revalidatePath("/admin/vendors");
    revalidatePath("/vendors");
  }
  return { imported: batch.length, remaining };
}
