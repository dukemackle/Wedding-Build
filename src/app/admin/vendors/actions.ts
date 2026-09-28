"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { createClient } from "@/lib/supabase/server";
import { isPinned, pinUnpinned, townKey, TOWNS_PER_CALL, withTownPins } from "@/lib/import-pins";
import { VENDOR_BATCHES } from "@/lib/vendor-batches";
import { parseVendorTable, type VendorImportValues } from "@/lib/vendor-import";
import { importSourceId } from "@/lib/venue-import";

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

function list(formData: FormData, key: string): string[] {
  const raw = (formData.get(key) as string)?.trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export async function createVendor(formData: FormData): Promise<{ error?: string }> {
  await requireAdmin();

  const name = str(formData, "name");
  if (!name) return { error: "Name is required." };

  const admin = createAdminSupabaseClient();
  const { error } = await admin.from("vendors").insert({
    name,
    category: str(formData, "category"),
    region: str(formData, "region"),
    state: str(formData, "state"),
    city: str(formData, "city"),
    latitude: num(formData, "latitude"),
    longitude: num(formData, "longitude"),
    price_tier: str(formData, "price_tier"),
    description: str(formData, "description"),
    about: str(formData, "about"),
    included: str(formData, "included"),
    amenities: list(formData, "amenities"),
    image_url: str(formData, "image_url"),
    contact_email: str(formData, "contact_email"),
    is_sample: formData.get("is_sample") === "on",
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/vendors");
  revalidatePath("/vendors");
  return {};
}

export async function updateVendor(formData: FormData): Promise<{ error?: string }> {
  await requireAdmin();

  const id = formData.get("id") as string;
  const name = str(formData, "name");
  if (!id || !name) return { error: "Name is required." };

  const admin = createAdminSupabaseClient();
  const { error } = await admin
    .from("vendors")
    .update({
      name,
      category: str(formData, "category"),
      region: str(formData, "region"),
      state: str(formData, "state"),
      city: str(formData, "city"),
      latitude: num(formData, "latitude"),
      longitude: num(formData, "longitude"),
      price_tier: str(formData, "price_tier"),
      description: str(formData, "description"),
      about: str(formData, "about"),
      included: str(formData, "included"),
      amenities: list(formData, "amenities"),
      image_url: str(formData, "image_url"),
      contact_email: str(formData, "contact_email"),
      is_sample: formData.get("is_sample") === "on",
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/vendors");
  revalidatePath("/vendors");
  return {};
}

export async function setVendorActive(formData: FormData): Promise<{ error?: string }> {
  await requireAdmin();

  const id = formData.get("id") as string;
  const active = formData.get("active") === "true";

  const admin = createAdminSupabaseClient();
  const { error } = await admin.from("vendors").update({ active }).eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/vendors");
  revalidatePath("/vendors");
  return {};
}

export async function bulkSetVendorActive(formData: FormData): Promise<{ error?: string }> {
  await requireAdmin();

  const ids = formData.getAll("id") as string[];
  const active = formData.get("active") === "true";
  if (ids.length === 0) return { error: "Select at least one vendor." };

  const admin = createAdminSupabaseClient();
  const { error } = await admin.from("vendors").update({ active }).in("id", ids);

  if (error) return { error: error.message };

  revalidatePath("/admin/vendors");
  revalidatePath("/vendors");
  return {};
}

export async function addVendorFaq(formData: FormData): Promise<{ error?: string }> {
  await requireAdmin();

  const vendorId = formData.get("vendor_id") as string;
  const question = str(formData, "question");
  const answer = str(formData, "answer");

  if (!vendorId || !question || !answer) {
    return { error: "A question and an answer are both required." };
  }

  const admin = createAdminSupabaseClient();
  const { error } = await admin.from("vendor_faqs").insert({
    vendor_id: vendorId,
    question,
    answer,
    sort_order: num(formData, "sort_order") ?? 0,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/vendors");
  revalidatePath(`/vendors/${vendorId}`);
  return {};
}

export async function deleteVendorFaq(formData: FormData): Promise<{ error?: string }> {
  await requireAdmin();

  const id = formData.get("id") as string;
  const vendorId = formData.get("vendor_id") as string;

  const admin = createAdminSupabaseClient();
  const { error } = await admin.from("vendor_faqs").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/vendors");
  revalidatePath(`/vendors/${vendorId}`);
  return {};
}

export async function addVendorContactLog(formData: FormData): Promise<{ error?: string }> {
  await requireAdmin();

  const vendorId = formData.get("vendor_id") as string;
  const contactType = (formData.get("contact_type") as string) || "note";
  const note = str(formData, "note");
  if (!vendorId || !note) return { error: "A note is required." };

  const admin = createAdminSupabaseClient();
  const { error } = await admin
    .from("vendor_contact_log")
    .insert({ vendor_id: vendorId, contact_type: contactType, note });

  if (error) return { error: error.message };

  revalidatePath("/admin/vendors");
  return {};
}

/** "Still right" for one or many vendors -- a person looked and the details hold. */
export async function markVendorsVerified(formData: FormData): Promise<{ error?: string }> {
  await requireAdmin();

  const ids = formData.getAll("id") as string[];
  if (ids.length === 0) return { error: "Select at least one vendor." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await createAdminSupabaseClient()
    .from("vendors")
    .update({ last_verified_at: new Date().toISOString(), verified_by: user?.email ?? "admin" })
    .in("id", ids);
  if (error) return { error: error.message };

  revalidatePath("/admin/vendors");
  return {};
}

/**
 * Deletes for good. Favorites, FAQs and the contact log go with the vendor;
 * budget lines, attire and a venue's preferred-vendor entries keep their row but
 * lose the link. Hiding is the reversible option.
 */
export async function bulkDeleteVendors(formData: FormData): Promise<{ error?: string }> {
  await requireAdmin();

  const ids = formData.getAll("id") as string[];
  if (ids.length === 0) return { error: "Select at least one vendor." };

  const { error } = await createAdminSupabaseClient().from("vendors").delete().in("id", ids);
  if (error) return { error: error.message };

  revalidatePath("/admin/vendors");
  revalidatePath("/vendors");
  return {};
}

/** Bundled batch rows (src/lib/vendor-batches.ts) whose website isn't in the database yet. */
export async function pendingBundledVendors(): Promise<VendorImportValues[]> {
  await requireAdmin();

  const rows = VENDOR_BATCHES.flatMap((batch) => parseVendorTable(batch.tsv).rows)
    .filter((row) => row.errors.length === 0)
    .map((row) => row.values);
  const ids = rows.map((values) => importSourceId(values.website)).filter((id): id is string => !!id);
  if (ids.length === 0) return rows;

  // Matched on source_id across every source, so a vendor that has since
  // claimed its listing still counts as present.
  const { data } = await createAdminSupabaseClient()
    .from("vendors")
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
 * Adds the pending bundled vendors from up to TOWNS_PER_CALL towns that need
 * a pin looked up. `remaining` tells the banner to call again.
 */
export async function addBundledVendors(): Promise<{ error?: string; imported?: number; remaining?: number }> {
  await requireAdmin();

  const rows = await pendingBundledVendors();
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
    await pinUnpinned("vendors", TOWNS_PER_CALL - towns.size, true);
    revalidatePath("/admin/vendors");
    revalidatePath("/vendors");
  }
  return { imported: batch.length, remaining };
}
