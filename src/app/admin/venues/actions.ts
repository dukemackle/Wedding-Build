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

export async function createVenue(formData: FormData): Promise<{ error?: string }> {
  await requireAdmin();

  const name = str(formData, "name");
  if (!name) return { error: "Name is required." };

  const admin = createAdminSupabaseClient();
  const { error } = await admin.from("venues").insert({
    name,
    region: str(formData, "region"),
    state: str(formData, "state"),
    city: str(formData, "city"),
    latitude: num(formData, "latitude"),
    longitude: num(formData, "longitude"),
    venue_type: str(formData, "venue_type"),
    capacity: num(formData, "capacity"),
    price_tier: str(formData, "price_tier"),
    description: str(formData, "description"),
    image_url: str(formData, "image_url"),
    contact_email: str(formData, "contact_email"),
    contact_phone: str(formData, "contact_phone"),
    website: str(formData, "website"),
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
      region: str(formData, "region"),
      state: str(formData, "state"),
      city: str(formData, "city"),
      latitude: num(formData, "latitude"),
      longitude: num(formData, "longitude"),
      venue_type: str(formData, "venue_type"),
      capacity: num(formData, "capacity"),
      price_tier: str(formData, "price_tier"),
      description: str(formData, "description"),
      image_url: str(formData, "image_url"),
      contact_email: str(formData, "contact_email"),
      contact_phone: str(formData, "contact_phone"),
      website: str(formData, "website"),
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
