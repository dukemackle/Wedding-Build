"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getResendClient, INQUIRY_FROM_ADDRESS } from "@/lib/resend";
import type { VendorInquiryStatus, Wedding } from "@/lib/supabase/types";

const VALID_STATUSES: VendorInquiryStatus[] = ["sent", "responded", "booked", "declined"];

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

  return { supabase, user, wedding };
}

export async function sendVendorInquiry(formData: FormData): Promise<{ error?: string }> {
  const { supabase, user, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const vendorId = (formData.get("vendor_id") as string) || null;
  const vendorName = formData.get("vendor_name") as string;
  const category = (formData.get("category") as string) || null;
  const recipientEmail = (formData.get("recipient_email") as string)?.trim();
  const message = (formData.get("message") as string)?.trim();

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

  try {
    const resend = getResendClient();
    const { error: sendError } = await resend.emails.send({
      from: INQUIRY_FROM_ADDRESS,
      to: recipientEmail,
      replyTo: user.email,
      subject: `Wedding inquiry from ${coupleNames || user.email}`,
      text: message,
    });

    if (sendError) {
      return { error: sendError.message };
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to send the email." };
  }

  const { error: dbError } = await supabase.from("vendor_inquiries").insert({
    wedding_id: wedding.id,
    user_id: user.id,
    vendor_id: vendorId,
    vendor_name: vendorName,
    category,
    message,
    status: "sent",
  });

  if (dbError) {
    return { error: dbError.message };
  }

  revalidatePath("/vendors");
  return {};
}

export async function updateInquiryStatus(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
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

  revalidatePath("/vendors");
  return {};
}

export async function toggleVendorFavorite(formData: FormData): Promise<{ error?: string }> {
  const { supabase, user, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
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
  const { supabase, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
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
  const { supabase, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
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

  revalidatePath("/contacts");
  return {};
}
