"use server";

import { revalidatePath } from "next/cache";
import { getResendClient, INQUIRY_FROM_ADDRESS, isUndeliverable, UNDELIVERABLE_MESSAGE } from "@/lib/resend";
import { leadCounts } from "@/lib/listing-leads";
import { inquiryFooter, inquirySubject } from "@/lib/inquiry-footer";
import { ensureClaimLink } from "@/lib/venue-claim-server";
import { syncBudgetLineFromBooking } from "@/lib/budget-sync";
import { requireEditableWedding } from "@/lib/wedding-access";

export async function toggleShortlist(formData: FormData): Promise<{ error?: string }> {
  const { supabase, user, wedding, noWedding } = await requireEditableWedding();

  if (!wedding) {
    return { error: noWedding };
  }

  const venueId = formData.get("venue_id") as string;
  const isShortlisted = formData.get("is_shortlisted") === "true";

  if (isShortlisted) {
    const { error } = await supabase
      .from("venue_shortlist")
      .delete()
      .eq("wedding_id", wedding.id)
      .eq("venue_id", venueId);

    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("venue_shortlist").insert({
      wedding_id: wedding.id,
      user_id: user.id,
      venue_id: venueId,
    });

    if (error) return { error: error.message };
  }

  revalidatePath("/venues");
  return {};
}

// The venue actually booked -- distinct from the shortlist (favorites,
// many possible). Toggling a different venue overwrites the previous
// choice since weddings.venue_id is a single column, keeping it
// mutually exclusive by construction.
export async function setBookedVenue(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();

  if (!wedding) {
    return { error: noWedding };
  }

  const venueId = formData.get("venue_id") as string;
  const isCurrentlyBooked = formData.get("is_booked") === "true";
  const newVenueId = isCurrentlyBooked ? null : venueId;

  const { error } = await supabase
    .from("weddings")
    .update({ venue_id: newVenueId })
    .eq("id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  if (newVenueId) {
    const { data: venue } = await supabase
      .from("venues")
      .select("name")
      .eq("id", newVenueId)
      .maybeSingle();

    if (venue) {
      await syncBudgetLineFromBooking(supabase, wedding, {
        categoryKey: "venue",
        purchasedFrom: venue.name,
        venueId: newVenueId,
      });
    }
  }

  revalidatePath("/venues");
  revalidatePath("/dashboard");
  revalidatePath("/budget");
  revalidatePath("/bookings");
  return {};
}

export async function sendVenueInquiry(formData: FormData): Promise<{ error?: string }> {
  const { supabase, user, wedding, noWedding } = await requireEditableWedding();

  if (!wedding) {
    return { error: noWedding };
  }

  const venueId = (formData.get("venue_id") as string) || null;
  const venueName = formData.get("venue_name") as string;
  let recipientEmail = (formData.get("recipient_email") as string)?.trim();
  const message = (formData.get("message") as string)?.trim();

  // A listing's own address is used as stored: couples never see or type it,
  // so the inquiry goes through the app and can't be pointed elsewhere.
  let listing: { is_sample: boolean; contact_email: string | null } | null = null;
  if (venueId) {
    const { data } = await supabase
      .from("venues")
      .select("is_sample, contact_email")
      .eq("id", venueId)
      .maybeSingle<{ is_sample: boolean; contact_email: string | null }>();
    listing = data;
    if (listing?.contact_email) recipientEmail = listing.contact_email;
  }
  const senderPhone = ((formData.get("sender_phone") as string) || "").trim() || null;

  if (!venueName) {
    return { error: "Missing venue." };
  }
  if (!recipientEmail) {
    return { error: "Enter a recipient email." };
  }
  if (!message) {
    return { error: "Write a message before sending." };
  }

  const coupleNames = [wedding.partner_a_name, wedding.partner_b_name]
    .filter(Boolean)
    .join(" & ");

  if (!process.env.RESEND_API_KEY) {
    return { error: "Email sending isn't configured (missing RESEND_API_KEY)." };
  }
  if (await isUndeliverable(recipientEmail)) {
    return { error: UNDELIVERABLE_MESSAGE };
  }

  const referralNote = wedding.referral_code
    ? `\n\nReferral code: ${wedding.referral_code} (please mention this if you book)`
    : "";
  const phoneNote = senderPhone ? `\n\nPhone: ${senderPhone}` : "";

  // Only real listings get a claim link; a sample venue has no one to claim it.
  const claimUrl = venueId && listing && !listing.is_sample ? await ensureClaimLink(venueId) : null;

  // Log first so an email never goes out unrecorded (see vendors/actions.ts).
  const { data: logged, error: dbError } = await supabase
    .from("venue_inquiries")
    .insert({
      wedding_id: wedding.id,
      user_id: user.id,
      venue_id: venueId,
      venue_name: venueName,
      message,
      recipient_email: recipientEmail,
      sender_phone: senderPhone,
      status: "sent",
      referral_code: wedding.referral_code,
    })
    .select("id")
    .single<{ id: string }>();

  if (dbError || !logged) {
    return { error: dbError?.message ?? "Couldn't save the inquiry." };
  }

  // Includes the row just logged. Counting is never worth failing an inquiry over.
  const couplesSoFar = venueId ? await leadCounts("venue", venueId).then((c) => c.inquiries, () => 0) : 0;

  let sendFailure: string | null = null;
  try {
    const resend = getResendClient();
    const { error: sendError } = await resend.emails.send({
      from: INQUIRY_FROM_ADDRESS,
      to: recipientEmail,
      replyTo: user.email,
      subject: inquirySubject(coupleNames || user.email || "a couple"),
      text: `${message}${phoneNote}${referralNote}${inquiryFooter(venueName, claimUrl, couplesSoFar)}`,
    });
    if (sendError) sendFailure = sendError.message;
  } catch (err) {
    sendFailure = err instanceof Error ? err.message : "Failed to send the email.";
  }

  if (sendFailure) {
    await supabase.from("venue_inquiries").delete().eq("id", logged.id);
    return { error: sendFailure };
  }

  revalidatePath(`/venues/${venueId}`);
  revalidatePath("/venues");
  return {};
}

export async function updateShortlistNotes(
  formData: FormData,
): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();

  if (!wedding) {
    return { error: noWedding };
  }

  const venueId = formData.get("venue_id") as string;
  const notes = (formData.get("notes") as string) ?? "";

  const { error } = await supabase
    .from("venue_shortlist")
    .update({ notes: notes.trim() || null })
    .eq("wedding_id", wedding.id)
    .eq("venue_id", venueId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/venues");
  return {};
}

export async function updateShortlistContact(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();

  if (!wedding) {
    return { error: noWedding };
  }

  const venueId = formData.get("venue_id") as string;
  const contactEmail = ((formData.get("contact_email") as string) || "").trim() || null;
  const contactPhone = ((formData.get("contact_phone") as string) || "").trim() || null;

  const { error } = await supabase
    .from("venue_shortlist")
    .update({ contact_email: contactEmail, contact_phone: contactPhone })
    .eq("wedding_id", wedding.id)
    .eq("venue_id", venueId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/bookings");
  return {};
}
