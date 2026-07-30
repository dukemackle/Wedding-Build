"use server";

import { createClient } from "@/lib/supabase/server";
import type { RsvpStatus } from "@/lib/supabase/types";

const VALID_STATUSES: RsvpStatus[] = ["confirmed", "declined"];

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

  const { error } = await supabase.from("rsvp_submissions").insert({
    wedding_id: weddingId,
    guest_name: guestName,
    household: ((formData.get("household") as string) || "").trim() || null,
    plus_one: formData.get("plus_one") === "on",
    status: status as RsvpStatus,
    meal: ((formData.get("meal") as string) || "").trim() || null,
    notes: ((formData.get("notes") as string) || "").trim() || null,
  });

  if (error) {
    return { error: "Could not submit your RSVP — please try again." };
  }

  return {};
}
