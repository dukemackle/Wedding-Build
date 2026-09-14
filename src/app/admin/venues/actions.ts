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
