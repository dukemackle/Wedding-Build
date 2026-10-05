"use server";

import { revalidatePath } from "next/cache";
import { getResendClient, INQUIRY_FROM_ADDRESS, isUndeliverable, UNDELIVERABLE_MESSAGE } from "@/lib/resend";
import { leadCounts } from "@/lib/listing-leads";
import { inquiryFooter, inquirySubject } from "@/lib/inquiry-footer";
import { ensureVendorClaimLink } from "@/lib/vendor-claim-server";
import { VENDOR_CATEGORY_TO_BUDGET_KEY } from "@/lib/budget-categories";
import { syncBudgetLineFromBooking } from "@/lib/budget-sync";
import type { VendorInquiryStatus } from "@/lib/supabase/types";
import { requireEditableWedding } from "@/lib/wedding-access";

const VALID_STATUSES: VendorInquiryStatus[] = ["sent", "responded", "booked", "declined"];

export async function sendVendorInquiry(formData: FormData): Promise<{ error?: string }> {
  const { supabase, user, wedding, noWedding } = await requireEditableWedding();

  if (!wedding) {
    return { error: noWedding };
  }

  const vendorId = (formData.get("vendor_id") as string) || null;
  const vendorName = formData.get("vendor_name") as string;
  const category = (formData.get("category") as string) || null;
  let recipientEmail = (formData.get("recipient_email") as string)?.trim();
  const message = (formData.get("message") as string)?.trim();

  // A listing's own address is used as stored: couples never see or type it,
  // so the inquiry goes through the app and can't be pointed elsewhere.
  let listing: { is_sample: boolean; contact_email: string | null } | null = null;
  if (vendorId) {
    const { data } = await supabase
      .from("vendors")
      .select("is_sample, contact_email")
      .eq("id", vendorId)
      .maybeSingle<{ is_sample: boolean; contact_email: string | null }>();
    listing = data;
    if (listing?.contact_email) recipientEmail = listing.contact_email;
  }
  const senderPhone = ((formData.get("sender_phone") as string) || "").trim() || null;

  if (!vendorName) {
    return { error: "Missing vendor." };
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

  // Only real listings get a claim link; a sample vendor has no one to claim it.
  const claimUrl = vendorId && listing && !listing.is_sample ? await ensureVendorClaimLink(vendorId) : null;

  // Log the inquiry before sending, so an email never goes out unrecorded:
  // the per-listing lead count is what we'll show vendors. If the send then
  // fails, the row is removed again.
  const { data: logged, error: dbError } = await supabase
    .from("vendor_inquiries")
    .insert({
      wedding_id: wedding.id,
      user_id: user.id,
      vendor_id: vendorId,
      vendor_name: vendorName,
      category,
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
  const couplesSoFar = vendorId ? await leadCounts("vendor", vendorId).then((c) => c.inquiries, () => 0) : 0;

  let sendFailure: string | null = null;
  try {
    const resend = getResendClient();
    const { error: sendError } = await resend.emails.send({
      from: INQUIRY_FROM_ADDRESS,
      to: recipientEmail,
      replyTo: user.email,
      subject: inquirySubject(coupleNames || user.email || "a couple"),
      text: `${message}${phoneNote}${referralNote}${inquiryFooter(vendorName, claimUrl, couplesSoFar)}`,
    });
    if (sendError) sendFailure = sendError.message;
  } catch (err) {
    sendFailure = err instanceof Error ? err.message : "Failed to send the email.";
  }

  if (sendFailure) {
    await supabase.from("vendor_inquiries").delete().eq("id", logged.id);
    return { error: sendFailure };
  }

  revalidatePath("/vendors");
  return {};
}

// Lets a couple mark a catalog vendor booked directly from its card --
// sending an inquiry (and therefore an email) shouldn't be a
// precondition for recording "we already booked this vendor" when the
// booking happened outside the app (in person, by phone, etc). Reuses
// the existing inquiry/status system underneath so it shows up
// alongside real inquiries and still auto-fills the budget.
export async function markVendorBooked(formData: FormData): Promise<{ error?: string }> {
  const { supabase, user, wedding, noWedding } = await requireEditableWedding();

  if (!wedding) {
    return { error: noWedding };
  }

  const vendorId = formData.get("vendor_id") as string;
  const vendorName = formData.get("vendor_name") as string;
  const category = ((formData.get("category") as string) || "").trim() || null;

  if (!vendorId || !vendorName) {
    return { error: "Missing vendor." };
  }

  const { data: existing } = await supabase
    .from("vendor_inquiries")
    .select("id")
    .eq("wedding_id", wedding.id)
    .eq("vendor_id", vendorId)
    .order("sent_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("vendor_inquiries")
      .update({ status: "booked" })
      .eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("vendor_inquiries").insert({
      wedding_id: wedding.id,
      user_id: user.id,
      vendor_id: vendorId,
      vendor_name: vendorName,
      category,
      status: "booked",
    });
    if (error) return { error: error.message };
  }

  const budgetKey = category ? VENDOR_CATEGORY_TO_BUDGET_KEY[category] : undefined;
  if (budgetKey) {
    await syncBudgetLineFromBooking(supabase, wedding, {
      categoryKey: budgetKey,
      purchasedFrom: vendorName,
      vendorId,
    });
    revalidatePath("/budget");
  }

  revalidatePath("/vendors");
  return {};
}

export async function sendVendorFollowUps(
  formData: FormData,
): Promise<{ error?: string; sent?: number; skipped?: number; failed?: number }> {
  const { supabase, user, wedding, noWedding } = await requireEditableWedding();

  if (!wedding) {
    return { error: noWedding };
  }
  if (!process.env.RESEND_API_KEY) {
    return { error: "Email sending isn't configured (missing RESEND_API_KEY)." };
  }

  const inquiryIds = formData.getAll("inquiry_id") as string[];
  if (inquiryIds.length === 0) {
    return { error: "Select at least one inquiry to follow up on." };
  }

  const { data: inquiries, error: fetchError } = await supabase
    .from("vendor_inquiries")
    .select("*")
    .in("id", inquiryIds)
    .eq("wedding_id", wedding.id)
    .eq("status", "sent");

  if (fetchError) {
    return { error: fetchError.message };
  }

  const followable = (inquiries ?? []).filter((i) => i.recipient_email);
  const skipped = inquiryIds.length - followable.length;

  if (followable.length === 0) {
    return { error: "None of the selected inquiries have a recipient email on file.", skipped };
  }

  const coupleNames = [wedding.partner_a_name, wedding.partner_b_name].filter(Boolean).join(" & ");
  const referralNote = wedding.referral_code
    ? `\n\nReferral code: ${wedding.referral_code} (please mention this if you book)`
    : "";
  const resend = getResendClient();

  let sent = 0;
  let failed = 0;
  const sentIds: string[] = [];

  // Follow-ups carry the claim link too, for real (non-sample) listings.
  const listingIds = [...new Set(followable.map((i) => i.vendor_id).filter((id): id is string => !!id))];
  const claimable = new Set<string>();
  if (listingIds.length > 0) {
    const { data: listed } = await supabase
      .from("vendors")
      .select("id, is_sample")
      .in("id", listingIds);
    for (const v of listed ?? []) if (!v.is_sample) claimable.add(v.id);
  }

  for (const inquiry of followable) {
    try {
      const claimUrl =
        inquiry.vendor_id && claimable.has(inquiry.vendor_id)
          ? await ensureVendorClaimLink(inquiry.vendor_id)
          : null;
      const { error: sendError } = await resend.emails.send({
        from: INQUIRY_FROM_ADDRESS,
        to: inquiry.recipient_email!,
        replyTo: user.email,
        subject: inquirySubject(coupleNames || user.email || "a couple", true),
        text: `Hi ${inquiry.vendor_name},\n\nJust following up on the inquiry we sent about ${inquiry.category?.toLowerCase() ?? "our wedding"} — we'd still love to hear back about availability and pricing when you get a chance.\n\nOriginal message:\n${inquiry.message ?? ""}${referralNote}${inquiryFooter(inquiry.vendor_name, claimUrl)}`,
      });

      if (sendError) {
        failed++;
        continue;
      }

      sent++;
      sentIds.push(inquiry.id);
    } catch {
      failed++;
    }
  }

  if (sentIds.length > 0) {
    await supabase
      .from("vendor_inquiries")
      .update({ last_followed_up_at: new Date().toISOString() })
      .in("id", sentIds);
  }

  revalidatePath("/vendors");
  return { sent, skipped, failed };
}

export async function updateInquiryStatus(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();

  if (!wedding) {
    return { error: noWedding };
  }

  const inquiryId = formData.get("inquiry_id") as string;
  const status = formData.get("status") as string;

  if (!VALID_STATUSES.includes(status as VendorInquiryStatus)) {
    return { error: "Invalid status." };
  }

  const { error } = await supabase
    .from("vendor_inquiries")
    .update({ status })
    .eq("id", inquiryId)
    .eq("wedding_id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  if (status === "booked") {
    const { data: inquiry } = await supabase
      .from("vendor_inquiries")
      .select("vendor_id, vendor_name, category, booked_amount")
      .eq("id", inquiryId)
      .maybeSingle();

    const budgetKey = inquiry?.category ? VENDOR_CATEGORY_TO_BUDGET_KEY[inquiry.category] : undefined;
    if (inquiry && budgetKey) {
      await syncBudgetLineFromBooking(supabase, wedding, {
        categoryKey: budgetKey,
        purchasedFrom: inquiry.vendor_name,
        vendorId: inquiry.vendor_id,
        overrideAmount: inquiry.booked_amount,
      });
      revalidatePath("/budget");
    }
  }

  revalidatePath("/vendors");
  return {};
}

export async function updateInquiryBookedAmount(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();

  if (!wedding) {
    return { error: noWedding };
  }

  const inquiryId = formData.get("inquiry_id") as string;
  const amountRaw = (formData.get("booked_amount") as string)?.trim();
  const amount = amountRaw ? Number(amountRaw) : null;

  if (amountRaw && (Number.isNaN(amount) || amount === null || amount < 0)) {
    return { error: "Enter a valid amount." };
  }

  const { error } = await supabase
    .from("vendor_inquiries")
    .update({ booked_amount: amount })
    .eq("id", inquiryId)
    .eq("wedding_id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  const { data: inquiry } = await supabase
    .from("vendor_inquiries")
    .select("vendor_id, vendor_name, category, status")
    .eq("id", inquiryId)
    .maybeSingle();

  const budgetKey = inquiry?.category ? VENDOR_CATEGORY_TO_BUDGET_KEY[inquiry.category] : undefined;
  if (inquiry && inquiry.status === "booked" && budgetKey && amount != null) {
    await syncBudgetLineFromBooking(supabase, wedding, {
      categoryKey: budgetKey,
      purchasedFrom: inquiry.vendor_name,
      vendorId: inquiry.vendor_id,
      overrideAmount: amount,
    });
    revalidatePath("/budget");
  }

  revalidatePath("/vendors");
  return {};
}

export async function toggleVendorFavorite(formData: FormData): Promise<{ error?: string }> {
  const { supabase, user, wedding, noWedding } = await requireEditableWedding();

  if (!wedding) {
    return { error: noWedding };
  }

  const vendorId = formData.get("vendor_id") as string;
  const isFavorited = formData.get("is_favorited") === "true";

  if (isFavorited) {
    const { error } = await supabase
      .from("vendor_favorites")
      .delete()
      .eq("wedding_id", wedding.id)
      .eq("vendor_id", vendorId);

    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("vendor_favorites").insert({
      wedding_id: wedding.id,
      user_id: user.id,
      vendor_id: vendorId,
    });

    if (error) return { error: error.message };
  }

  revalidatePath("/vendors");
  return {};
}

export async function updateVendorFavoriteNotes(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();

  if (!wedding) {
    return { error: noWedding };
  }

  const vendorId = formData.get("vendor_id") as string;
  const notes = (formData.get("notes") as string) ?? "";

  const { error } = await supabase
    .from("vendor_favorites")
    .update({ notes: notes.trim() || null })
    .eq("wedding_id", wedding.id)
    .eq("vendor_id", vendorId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/vendors");
  return {};
}

export async function updateVendorFavoriteContact(
  formData: FormData,
): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();

  if (!wedding) {
    return { error: noWedding };
  }

  const vendorId = formData.get("vendor_id") as string;
  const contactPhone = ((formData.get("contact_phone") as string) || "").trim() || null;

  const { error } = await supabase
    .from("vendor_favorites")
    .update({ contact_phone: contactPhone })
    .eq("wedding_id", wedding.id)
    .eq("vendor_id", vendorId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/bookings");
  return {};
}
