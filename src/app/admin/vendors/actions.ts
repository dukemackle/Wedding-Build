"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";

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
    contact_email: str(formData, "contact_email"),
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
      contact_email: str(formData, "contact_email"),
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
