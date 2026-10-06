"use server";

import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { getResendClient, INQUIRY_FROM_ADDRESS } from "@/lib/resend";
import { SITE_URL } from "@/lib/public-listings";
import type { GuestSide, RsvpStatus } from "@/lib/supabase/types";

const VALID_STATUSES: RsvpStatus[] = ["confirmed", "declined"];
const VALID_SIDES: GuestSide[] = ["a", "b", "both"];
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

type Supabase = Awaited<ReturnType<typeof createClient>>;

/** Validates and stores a guest's photo. No file is fine -- photos are optional. */
async function uploadGuestPhoto(
  supabase: Supabase,
  weddingId: string,
  photo: File | null,
): Promise<{ photoUrl: string | null } | { error: string }> {
  if (!photo || photo.size === 0) {
    return { photoUrl: null };
  }
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

  return { photoUrl: supabase.storage.from("guest-photos").getPublicUrl(path).data.publicUrl };
}

/** Trimmed text field, capped so an anonymous form can't store a novel. */
function field(formData: FormData, key: string, max: number): string | null {
  const value = ((formData.get(key) as string) || "").trim();
  return value ? value.slice(0, max) : null;
}

/**
 * Tells the couple an RSVP is waiting, so it doesn't sit unseen on /guests.
 * Best effort: the RSVP is already saved, so a failed email never fails it.
 */
async function notifyCoupleOfRsvp(weddingId: string, guestName: string, status: RsvpStatus) {
  try {
    if (!process.env.RESEND_API_KEY) return;
    const admin = createAdminSupabaseClient();
    const { data: wedding } = await admin
      .from("weddings")
      .select("user_id")
      .eq("id", weddingId)
      .maybeSingle<{ user_id: string }>();
    if (!wedding) return;
    const { data: owner } = await admin.auth.admin.getUserById(wedding.user_id);
    const to = owner?.user?.email;
    if (!to) return;
    const answer = status === "confirmed" ? "is coming" : "can't make it";
    await getResendClient().emails.send({
      from: INQUIRY_FROM_ADDRESS,
      to,
      subject: `New RSVP: ${guestName} ${answer}`,
      text: `${guestName} just RSVPed on your wedding website: ${answer}.\n\nIt's waiting for you to approve on your guest list, which also matches it to the right guest:\n${SITE_URL}/guests\n\nYou Do, I Do`,
    });
  } catch {
    // Never let a notification problem reach the guest.
  }
}

export async function submitRsvp(formData: FormData): Promise<{ error?: string }> {
  // Hidden from people, filled in by bots: pretend it worked and store nothing.
  if (((formData.get("website") as string) || "").trim()) {
    return {};
  }

  const weddingId = formData.get("wedding_id") as string;
  const guestName = field(formData, "guest_name", 120);
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

  const upload = await uploadGuestPhoto(supabase, weddingId, formData.get("photo") as File | null);
  if ("error" in upload) {
    return { error: upload.error };
  }
  const photoUrl = upload.photoUrl;

  const { error } = await supabase.from("rsvp_submissions").insert({
    wedding_id: weddingId,
    guest_name: guestName,
    household: field(formData, "household", 120),
    side: VALID_SIDES.includes(formData.get("side") as GuestSide)
      ? (formData.get("side") as GuestSide)
      : null,
    plus_one: formData.get("plus_one") === "on",
    plus_one_name: field(formData, "plus_one_name", 120),
    status: status as RsvpStatus,
    meal: field(formData, "meal", 80),
    notes: field(formData, "notes", 1000),
    photo_url: photoUrl,
    message: field(formData, "message", 1000),
    song_request: field(formData, "song_request", 200),
    phone: field(formData, "phone", 30),
    sms_opt_in: formData.get("sms_opt_in") === "on",
  });

  if (error) {
    return { error: "Could not submit your RSVP — please try again." };
  }

  await notifyCoupleOfRsvp(weddingId, guestName, status as RsvpStatus);
  return {};
}

const MAX_MESSAGE_LENGTH = 500;

/**
 * A post to the photo wall, separate from an RSVP.
 *
 * Anyone with the link can post, as often as they like -- that's the point of
 * the table-card QR code. Every post lands as pending (the insert policy
 * refuses anything else) and only appears once the couple approves it.
 */
export async function submitGuestPost(formData: FormData): Promise<{ error?: string }> {
  const weddingId = formData.get("wedding_id") as string;
  const name = ((formData.get("name") as string) || "").trim();
  const message = ((formData.get("message") as string) || "").trim() || null;
  const photo = formData.get("photo") as File | null;

  if (!weddingId) {
    return { error: "Missing wedding." };
  }
  if (!name) {
    return { error: "Your name is required." };
  }
  if (!message && (!photo || photo.size === 0)) {
    return { error: "Add a photo or a message." };
  }
  if (message && message.length > MAX_MESSAGE_LENGTH) {
    return { error: `Please keep your message under ${MAX_MESSAGE_LENGTH} characters.` };
  }

  const supabase = await createClient();

  const upload = await uploadGuestPhoto(supabase, weddingId, photo);
  if ("error" in upload) {
    return { error: upload.error };
  }

  const { error } = await supabase.from("guest_posts").insert({
    wedding_id: weddingId,
    name: name.slice(0, 120),
    message,
    photo_url: upload.photoUrl,
  });

  if (error) {
    return { error: "Could not post that — please try again." };
  }

  return {};
}
