"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { logAdminAction } from "@/lib/admin-audit";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";

function str(formData: FormData, key: string): string | null {
  const raw = (formData.get(key) as string | null)?.trim();
  return raw || null;
}

function num(formData: FormData, key: string): number | null {
  const raw = str(formData, key);
  if (!raw) return null;
  const n = Number(raw.replace(/[$,]/g, ""));
  return Number.isNaN(n) ? null : n;
}

/** Comma- or newline-separated; photo URLs are split on newlines/whitespace only. */
function list(formData: FormData, key: string, splitter = /[,\n]/): string[] {
  const raw = str(formData, key);
  if (!raw) return [];
  return raw
    .split(splitter)
    .map((v) => v.trim())
    .filter(Boolean);
}

function fields(formData: FormData) {
  const buy = num(formData, "buy_price");
  const rent = num(formData, "rent_price");
  return {
    name: str(formData, "name"),
    category: str(formData, "category"),
    style: str(formData, "style"),
    designer: str(formData, "designer"),
    description: str(formData, "description"),
    image_urls: list(formData, "image_urls", /\s+/).filter((u) => /^https:\/\//i.test(u)),
    retailer_url: str(formData, "retailer_url"),
    affiliate_url: str(formData, "affiliate_url"),
    merchant_id: str(formData, "merchant_id"),
    price_checked_at: str(formData, "price_checked_at"),
    vendor_id: str(formData, "vendor_id"),
    buy_price: buy,
    rent_price: rent,
    // Kept in step for the budget page and anything else still reading the
    // original two columns.
    price_from: buy ?? rent,
    buy_or_rent: buy != null && rent != null ? "Buy or Rent" : rent != null ? "Rent" : buy != null ? "Buy" : null,
    price_tier: str(formData, "price_tier"),
    silhouette: str(formData, "silhouette"),
    neckline: str(formData, "neckline"),
    sleeves: str(formData, "sleeves"),
    length: str(formData, "length"),
    fabric: str(formData, "fabric"),
    colors: list(formData, "colors"),
    size_range: str(formData, "size_range"),
    badge: str(formData, "badge"),
    is_featured: formData.get("is_featured") === "on",
    is_active: formData.get("is_active") === "on",
  };
}

function refresh() {
  revalidatePath("/admin/attire");
  revalidatePath("/attire");
}

export async function saveAttireItem(formData: FormData): Promise<{ error?: string }> {
  await requireAdmin();
  const values = fields(formData);
  if (!values.name || !values.category) return { error: "Name and category are required." };

  const admin = createAdminSupabaseClient();
  const id = str(formData, "id");
  const { error } = id
    ? await admin.from("attire_items").update(values).eq("id", id)
    : await admin.from("attire_items").insert(values);
  if (error) return { error: error.message };

  refresh();
  await logAdminAction("attire.save", { type: "attire_item", ids: [id] }, `${id ? "Edited" : "Added"} attire item "${values.name}"`);
  return {};
}

export async function deleteAttireItem(formData: FormData): Promise<{ error?: string }> {
  await requireAdmin();
  const admin = createAdminSupabaseClient();
  const { error } = await admin.from("attire_items").delete().eq("id", formData.get("id") as string);
  if (error) return { error: error.message };
  refresh();
  await logAdminAction("attire.delete", { type: "attire_item", ids: [formData.get("id") as string] }, "Deleted an attire item");
  return {};
}

function merchantFields(formData: FormData) {
  return {
    name: str(formData, "name"),
    website: str(formData, "website"),
    network: str(formData, "network"),
    status: str(formData, "status") ?? "Not applied",
    commission_note: str(formData, "commission_note"),
    image_rights_note: str(formData, "image_rights_note"),
    contact: str(formData, "contact"),
    approved_at: str(formData, "approved_at"),
    notes: str(formData, "notes"),
  };
}

export async function saveAttireMerchant(formData: FormData): Promise<{ error?: string }> {
  await requireAdmin();
  const values = merchantFields(formData);
  if (!values.name) return { error: "Name is required." };

  const admin = createAdminSupabaseClient();
  const id = str(formData, "id");
  const { error } = id
    ? await admin.from("attire_merchants").update(values).eq("id", id)
    : await admin.from("attire_merchants").insert(values);
  if (error) return { error: error.message };

  revalidatePath("/admin/attire");
  await logAdminAction("attire.merchant_save", { type: "attire_merchant", ids: [id] }, `${id ? "Edited" : "Added"} retailer "${values.name}"`);
  return {};
}

export async function deleteAttireMerchant(formData: FormData): Promise<{ error?: string }> {
  await requireAdmin();
  const id = formData.get("id") as string;
  const admin = createAdminSupabaseClient();
  const { error } = await admin.from("attire_merchants").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/attire");
  await logAdminAction("attire.merchant_delete", { type: "attire_merchant", ids: [id] }, "Deleted a retailer");
  return {};
}
