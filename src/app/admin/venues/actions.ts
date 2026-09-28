"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { createClient } from "@/lib/supabase/server";
import { VENUE_BATCHES } from "@/lib/venue-batches";
import { pinForTown } from "@/lib/listing-pin";
import { importSourceId, parseVenueTable, type VenueImportValues } from "@/lib/venue-import";

const MAX_IMPORT_ROWS = 200;

function num(formData: FormData, key: string): number | null {
  const raw = (formData.get(key) as string)?.trim();
  if (!raw) return null;
  const n = Number(raw);
  return Number.isNaN(n) ? null : n;
}

function str(formData: FormData, key: string): string | null {
  const raw = (formData.get(key) as string)?.trim();
  return raw || null;
}

// Amenities come in as one comma-separated field rather than a repeating
// input -- it's a handful of short tags per venue, typed by hand.
function list(formData: FormData, key: string): string[] {
  const raw = (formData.get(key) as string)?.trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export async function createVenue(formData: FormData): Promise<{ error?: string }> {
  await requireAdmin();

  const name = str(formData, "name");
  if (!name) return { error: "Name is required." };

  const admin = createAdminSupabaseClient();
  const { error } = await admin.from("venues").insert({
    name,
    state: str(formData, "state"),
    city: str(formData, "city"),
    latitude: num(formData, "latitude"),
    longitude: num(formData, "longitude"),
    venue_type: str(formData, "venue_type"),
    setting: str(formData, "setting"),
    capacity: num(formData, "capacity"),
    price_tier: str(formData, "price_tier"),
    description: str(formData, "description"),
    about: str(formData, "about"),
    included: str(formData, "included"),
    amenities: list(formData, "amenities"),
    image_url: str(formData, "image_url"),
    contact_email: str(formData, "contact_email"),
    contact_phone: str(formData, "contact_phone"),
    website: str(formData, "website"),
    is_sample: formData.get("is_sample") === "on",
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/venues");
  revalidatePath("/venues");
  return {};
}

export async function updateVenue(formData: FormData): Promise<{ error?: string }> {
  await requireAdmin();

  const id = formData.get("id") as string;
  const name = str(formData, "name");
  if (!id || !name) return { error: "Name is required." };

  const admin = createAdminSupabaseClient();
  const { error } = await admin
    .from("venues")
    .update({
      name,
      state: str(formData, "state"),
      city: str(formData, "city"),
      latitude: num(formData, "latitude"),
      longitude: num(formData, "longitude"),
      venue_type: str(formData, "venue_type"),
      setting: str(formData, "setting"),
      capacity: num(formData, "capacity"),
      price_tier: str(formData, "price_tier"),
      description: str(formData, "description"),
      about: str(formData, "about"),
      included: str(formData, "included"),
      amenities: list(formData, "amenities"),
      image_url: str(formData, "image_url"),
      contact_email: str(formData, "contact_email"),
      contact_phone: str(formData, "contact_phone"),
      website: str(formData, "website"),
      is_sample: formData.get("is_sample") === "on",
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/venues");
  revalidatePath("/venues");
  return {};
}

export async function setVenueActive(formData: FormData): Promise<{ error?: string }> {
  await requireAdmin();

  const id = formData.get("id") as string;
  const active = formData.get("active") === "true";

  const admin = createAdminSupabaseClient();
  const { error } = await admin.from("venues").update({ active }).eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/venues");
  revalidatePath("/venues");
  return {};
}

export async function addVenueFaq(formData: FormData): Promise<{ error?: string }> {
  await requireAdmin();

  const venueId = formData.get("venue_id") as string;
  const question = str(formData, "question");
  const answer = str(formData, "answer");

  if (!venueId || !question || !answer) {
    return { error: "A question and an answer are both required." };
  }

  const admin = createAdminSupabaseClient();
  const { error } = await admin.from("venue_faqs").insert({
    venue_id: venueId,
    question,
    answer,
    sort_order: num(formData, "sort_order") ?? 0,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/venues");
  revalidatePath(`/venues/${venueId}`);
  return {};
}

export async function deleteVenueFaq(formData: FormData): Promise<{ error?: string }> {
  await requireAdmin();

  const id = formData.get("id") as string;
  const venueId = formData.get("venue_id") as string;

  const admin = createAdminSupabaseClient();
  const { error } = await admin.from("venue_faqs").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/venues");
  revalidatePath(`/venues/${venueId}`);
  return {};
}

/**
 * Bulk-inserts venues from a pasted spreadsheet.
 *
 * Re-parses the raw text server-side rather than trusting the preview the
 * browser built, and refuses the whole batch if any row is invalid -- a
 * half-applied import is worse than none, because working out which of 40
 * venues landed is harder than pasting again.
 */
export async function importVenues(
  formData: FormData,
): Promise<{ error?: string; imported?: number }> {
  await requireAdmin();

  const text = (formData.get("table") as string) ?? "";
  const parsed = parseVenueTable(text);

  if (parsed.error) return { error: parsed.error };
  if (parsed.rows.length === 0) return { error: "No venues found to import." };
  if (parsed.rows.length > MAX_IMPORT_ROWS) {
    return { error: `That's ${parsed.rows.length} rows — import at most ${MAX_IMPORT_ROWS} at a time.` };
  }

  const invalid = parsed.rows.filter((row) => row.errors.length > 0);
  if (invalid.length > 0) {
    return {
      error: `${invalid.length} ${invalid.length === 1 ? "row still needs" : "rows still need"} fixing — nothing was imported.`,
    };
  }

  const error = await insertImportedVenues(parsed.rows.map((row) => row.values));
  if (error) return { error };

  revalidatePath("/admin/venues");
  revalidatePath("/venues");
  return { imported: parsed.rows.length };
}

/**
 * Records that someone looked at a listing and it was still true.
 *
 * A button rather than something automatic, because "verified" has to mean a
 * person checked. A job that stamps the date without looking produces a
 * directory that claims freshness it doesn't have, which is worse than one
 * that admits it's never been checked.
 */
export async function markVenueVerified(formData: FormData): Promise<{ error?: string }> {
  await requireAdmin();

  const id = formData.get("id") as string;
  if (!id) return { error: "Missing venue." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await createAdminSupabaseClient()
    .from("venues")
    .update({ last_verified_at: new Date().toISOString(), verified_by: user?.email ?? "admin" })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/venues");
  return {};
}

// The three bulk actions on the admin list. Each takes the selected ids as
// repeated `id` fields.

export async function bulkSetVenueActive(formData: FormData): Promise<{ error?: string }> {
  await requireAdmin();

  const ids = formData.getAll("id") as string[];
  if (ids.length === 0) return { error: "Select at least one venue." };

  const { error } = await createAdminSupabaseClient()
    .from("venues")
    .update({ active: formData.get("active") === "true" })
    .in("id", ids);
  if (error) return { error: error.message };

  revalidatePath("/admin/venues");
  revalidatePath("/venues");
  return {};
}

export async function bulkMarkVenuesVerified(formData: FormData): Promise<{ error?: string }> {
  await requireAdmin();

  const ids = formData.getAll("id") as string[];
  if (ids.length === 0) return { error: "Select at least one venue." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await createAdminSupabaseClient()
    .from("venues")
    .update({ last_verified_at: new Date().toISOString(), verified_by: user?.email ?? "admin" })
    .in("id", ids);
  if (error) return { error: error.message };

  revalidatePath("/admin/venues");
  return {};
}

/**
 * Deletes for good. Shortlists, FAQs, spaces and claim links go with the venue;
 * a wedding that booked it, and past inquiries, keep their row but lose the link
 * (see the foreign keys in migrations 0051-0085). Hiding is the reversible option.
 */
export async function bulkDeleteVenues(formData: FormData): Promise<{ error?: string }> {
  await requireAdmin();

  const ids = formData.getAll("id") as string[];
  if (ids.length === 0) return { error: "Select at least one venue." };

  const { error } = await createAdminSupabaseClient().from("venues").delete().in("id", ids);
  if (error) return { error: error.message };

  revalidatePath("/admin/venues");
  revalidatePath("/venues");
  return {};
}

// Shared by the paste import and the bundled batches, so both stamp the same
// provenance on what they insert.
async function insertImportedVenues(rows: VenueImportValues[]): Promise<string | null> {
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

type Unpinned = { city: string | null; state: string | null; latitude: number | null; longitude: number | null };

/**
 * Fills blank coordinates with the town's pin, looking each town up once. A
 * venue without coordinates is missing from the /venues map entirely, and
 * finding them by hand was the slowest part of researching a batch.
 */
async function withTownPins<T extends Unpinned>(rows: T[]): Promise<T[]> {
  const pins = new Map<string, Promise<Awaited<ReturnType<typeof pinForTown>>>>();
  return Promise.all(
    rows.map(async (row) => {
      if (isPinned(row)) return row;
      const key = townKey(row);
      if (!pins.has(key)) pins.set(key, pinForTown(row.city, row.state));
      const pin = await pins.get(key);
      return pin ? { ...row, ...pin } : row;
    }),
  );
}

const isPinned = (row: Unpinned) => row.latitude != null && row.longitude != null;
const townKey = (row: Unpinned) => `${row.city ?? ""}|${row.state ?? ""}`.toLowerCase();

/**
 * How many towns one "Add them" click looks up. Cloudflare allows a Worker 50
 * outbound requests per invocation, and each town can take four (two Census
 * layers, then two table lookups) -- 42 towns in one go blew the limit. The
 * banner calls again until everything is in.
 */
const TOWNS_PER_CALL = 6;

/**
 * Gives venues already in the database a town pin if they were added without
 * one, a few towns at a time (see TOWNS_PER_CALL), one update per town.
 */
async function pinUnpinnedVenues(maxTowns: number): Promise<void> {
  if (maxTowns <= 0) return;
  const admin = createAdminSupabaseClient();
  const { data } = await admin
    .from("venues")
    .select("id, city, state, latitude, longitude")
    .or("latitude.is.null,longitude.is.null")
    .returns<(Unpinned & { id: string })[]>();
  const towns = new Map<string, { city: string | null; state: string | null; ids: string[] }>();
  for (const row of data ?? []) {
    const key = townKey(row);
    if (!towns.has(key)) {
      if (towns.size >= maxTowns) continue;
      towns.set(key, { city: row.city, state: row.state, ids: [] });
    }
    towns.get(key)!.ids.push(row.id);
  }
  await Promise.all(
    [...towns.values()].map(async (town) => {
      const pin = await pinForTown(town.city, town.state);
      if (pin) await admin.from("venues").update(pin).in("id", town.ids);
    }),
  );
}

/** Bundled batch rows whose website isn't in the database yet. */
export async function pendingBundledVenues(): Promise<VenueImportValues[]> {
  await requireAdmin();

  const rows = VENUE_BATCHES.flatMap((batch) => parseVenueTable(batch.tsv).rows)
    .filter((row) => row.errors.length === 0)
    .map((row) => row.values);
  const ids = rows.map((values) => importSourceId(values.website)).filter((id): id is string => !!id);
  if (ids.length === 0) return rows;

  // Matched on source_id across every source, so a venue that has since been
  // claimed or re-sourced still counts as present.
  const { data } = await createAdminSupabaseClient()
    .from("venues")
    .select("source_id")
    .in("source_id", ids)
    .returns<{ source_id: string }[]>();
  const present = new Set((data ?? []).map((row) => row.source_id));
  return rows.filter((values) => {
    const id = importSourceId(values.website);
    return !id || !present.has(id);
  });
}

/**
 * Adds the pending bundled venues from up to TOWNS_PER_CALL towns that need a
 * pin looked up. `remaining` tells the banner to call again.
 */
export async function addBundledVenues(): Promise<{ error?: string; imported?: number; remaining?: number }> {
  await requireAdmin();

  const rows = await pendingBundledVenues();
  if (rows.length === 0) return { imported: 0, remaining: 0 };

  const towns = new Set<string>();
  const batch = rows.filter((row) => {
    if (isPinned(row)) return true;
    const key = townKey(row);
    if (towns.has(key)) return true;
    if (towns.size >= TOWNS_PER_CALL) return false;
    towns.add(key);
    return true;
  });

  const error = await insertImportedVenues(batch);
  if (error) return { error };

  const remaining = rows.length - batch.length;
  if (remaining === 0) {
    // Catches up venues from earlier batches that went in without a pin, with
    // whatever lookups this call has left.
    await pinUnpinnedVenues(TOWNS_PER_CALL - towns.size);
    revalidatePath("/admin/venues");
    revalidatePath("/venues");
  }
  return { imported: batch.length, remaining };
}
