"use server";

import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import type { RsvpStatus } from "@/lib/supabase/types";

const VALID_STATUSES: RsvpStatus[] = ["confirmed", "declined"];
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export async function submitRsvp(formData: FormData): Promise<{ error?: string }> {
  const weddingId = formData.get("wedding_id") as string;
  const guestName = (formData.get("guest_name") as string)?.trim();
  const status = formData.get("status") as string;

  if (!weddingId) {
    return { error: "Missing wedding." };
  }
  if (!guestName) {
    return { error: "Your name is required." };
  }
  if (!VALID_STATUSES.includes(status as RsvpStatus)) {
    return { error: "Please choose whether you'll be attending." };
  }

  const supabase = await createClient();

  let photoUrl: string | null = null;
  const photo = formData.get("photo") as File | null;
  if (photo && photo.size > 0) {
    if (!photo.type.startsWith("image/")) {
      return { error: "Photo must be an image file." };
    }
    if (photo.size > MAX_PHOTO_BYTES) {
      return { error: "Photo is too large — please use one under 5MB." };
    }

    const extension = photo.name.includes(".") ? photo.name.split(".").pop() : undefined;
    const path = `${weddingId}/${randomUUID()}${extension ? `.${extension}` : ""}`;

    const { error: uploadError } = await supabase.storage
      .from("guest-photos")
      .upload(path, photo, { contentType: photo.type });

    if (uploadError) {
      return { error: "Could not upload your photo — please try again." };
    }

    photoUrl = supabase.storage.from("guest-photos").getPublicUrl(path).data.publicUrl;
  }

  const { error } = await supabase.from("rsvp_submissions").insert({
    wedding_id: weddingId,
    guest_name: guestName,
    household: ((formData.get("household") as string) || "").trim() || null,
    plus_one: formData.get("plus_one") === "on",
    status: status as RsvpStatus,
    meal: ((formData.get("meal") as string) || "").trim() || null,
    notes: ((formData.get("notes") as string) || "").trim() || null,
    photo_url: photoUrl,
    message: ((formData.get("message") as string) || "").trim() || null,
  });

  if (error) {
    return { error: "Could not submit your RSVP — please try again." };
  }

  return {};
}
