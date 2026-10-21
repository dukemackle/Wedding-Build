"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { logAdminAction, plural } from "@/lib/admin-audit";
import { restamp } from "@/lib/field-sources";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { createClient } from "@/lib/supabase/server";
import { addBundledVendorRows, pendingBundledVendorRows, type BundledResult } from "@/lib/bundled-import";
import type { VendorImportValues } from "@/lib/vendor-import";

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
  const values = {
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
    contact_phone: str(formData, "contact_phone"),
    website: str(formData, "website"),
    is_sample: formData.get("is_sample") === "on",
  };
  const { error } = await admin.from("vendors").insert({ ...values, field_sources: restamp(null, values, "admin") });

  if (error) return { error: error.message };

  revalidatePath("/admin/vendors");
  revalidatePath("/vendors");
  await logAdminAction("vendor.create", { type: "vendor" }, `Added vendor "${name}"`);
  return {};
}

export async function updateVendor(formData: FormData): Promise<{ error?: string }> {
  await requireAdmin();

  const id = formData.get("id") as string;
  const name = str(formData, "name");
  if (!id || !name) return { error: "Name is required." };

  const values = {
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
    contact_phone: str(formData, "contact_phone"),
    website: str(formData, "website"),
    is_sample: formData.get("is_sample") === "on",
  };
  const admin = createAdminSupabaseClient();
  const { data: current } = await admin.from("vendors").select("*").eq("id", id).maybeSingle();
  const { error } = await admin
    .from("vendors")
    // Only the fields this save changed are stamped as the admin's.
    .update({ ...values, field_sources: restamp(current, values, "admin", { changedOnly: true }) })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/vendors");
  revalidatePath("/vendors");
  await logAdminAction("vendor.update", { type: "vendor", ids: [id] }, `Edited vendor "${name}"`);
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
  await logAdminAction("vendor.set_active", { type: "vendor", ids: [id] }, active ? "Showed a vendor" : "Hid a vendor");
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
  await logAdminAction("vendor.set_active", { type: "vendor", ids }, `${active ? "Showed" : "Hid"} ${plural(ids.length, "vendor")}`);
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
  await logAdminAction("vendor.faq_add", { type: "vendor", ids: [vendorId] }, "Added a vendor FAQ");
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
  await logAdminAction("vendor.faq_delete", { type: "vendor", ids: [vendorId] }, "Deleted a vendor FAQ");
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
  await logAdminAction("vendor.contact_log", { type: "vendor", ids: [vendorId] }, `Logged a ${contactType} for a vendor`);
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
  await logAdminAction("vendor.mark_checked", { type: "vendor", ids }, `Marked ${plural(ids.length, "vendor")} as still right`);
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

  // Names first: once the rows are gone, their ids no longer say what was deleted.
  const { data: doomed } = await createAdminSupabaseClient().from("vendors").select("name").in("id", ids);
  const { error } = await createAdminSupabaseClient().from("vendors").delete().in("id", ids);
  if (error) return { error: error.message };

  revalidatePath("/admin/vendors");
  revalidatePath("/vendors");
  await logAdminAction("vendor.delete", { type: "vendor", ids }, `Deleted ${plural(ids.length, "vendor")}: ${(doomed ?? []).map((row) => row.name).join(", ")}`);
  return {};
}

/** Bundled batch rows (src/lib/vendor-batches.ts) whose website isn't in the database yet. */
export async function pendingBundledVendors(): Promise<VendorImportValues[]> {
  await requireAdmin();
  // A failed lookup hides the banner rather than taking the page down; "Add
  // them" reports the error itself.
  return pendingBundledVendorRows().catch(() => []);
}

/**
 * Adds the pending bundled vendors, as many as one call's pin lookups allow,
 * then moves listed ones onto their addresses. `remaining` tells the banner to call again.
 */
export async function addBundledVendors(): Promise<BundledResult> {
  await requireAdmin();
  const result = await addBundledVendorRows();
  if (result.imported) await logAdminAction("vendor.import", { type: "vendor" }, `Added ${plural(result.imported, "vendor")} from the bundled batches`);
  return result;
}
