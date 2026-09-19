"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { createClient } from "@/lib/supabase/server";
import { parseVenueTable } from "@/lib/venue-import";

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

  const admin = createAdminSupabaseClient();
  const { error } = await admin.from("venues").insert(
    parsed.rows.map((row) => ({
      ...row.values,
      // Imports are how real venues get in. Sample data is seeded elsewhere,
      // so defaulting this to false keeps /admin/venues honest about which
      // listings are real -- the distinction the Phase 1 triggers rely on.
      is_sample: false,
    })),
  );

  if (error) return { error: error.message };

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
