"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Wedding } from "@/lib/supabase/types";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export async function saveWedding(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const guestCountOverrideRaw = formData.get("guest_count_override") as string;

  const { error } = await supabase.from("weddings").upsert(
    {
      user_id: user.id,
      partner_a_name: formData.get("partner_a_name") as string,
      partner_b_name: formData.get("partner_b_name") as string,
      wedding_date: (formData.get("wedding_date") as string) || null,
      region: formData.get("region") as string,
      season: formData.get("season") as string,
      style_tier: formData.get("style_tier") as string,
      venue_type: formData.get("venue_type") as string,
      guest_count_override: guestCountOverrideRaw
        ? Number(guestCountOverrideRaw)
        : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return {};
}

async function requireOwnWedding() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: wedding } = await supabase
    .from("weddings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle<Wedding>();

  return { supabase, wedding };
}

export async function uploadHeroPhoto(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding first." };
  }

  const photo = formData.get("photo") as File | null;
  if (!photo || photo.size === 0) {
    return { error: "Choose a photo to upload." };
  }
  if (!photo.type.startsWith("image/")) {
    return { error: "Photo must be an image file." };
  }
  if (photo.size > MAX_PHOTO_BYTES) {
    return { error: "Photo is too large — please use one under 5MB." };
  }

  const extension = photo.name.includes(".") ? photo.name.split(".").pop() : undefined;
  const path = `${wedding.id}/${randomUUID()}${extension ? `.${extension}` : ""}`;

  const { error: uploadError } = await supabase.storage
    .from("wedding-photos")
    .upload(path, photo, { contentType: photo.type });

  if (uploadError) {
    return { error: "Could not upload your photo — please try again." };
  }

  const photoUrl = supabase.storage.from("wedding-photos").getPublicUrl(path).data.publicUrl;

  const { error } = await supabase
    .from("weddings")
    .update({ hero_photo_url: photoUrl })
    .eq("id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return {};
}

export async function removeHeroPhoto(): Promise<{ error?: string }> {
  const { supabase, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding first." };
  }

  const { error } = await supabase
    .from("weddings")
    .update({ hero_photo_url: null })
    .eq("id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return {};
}
