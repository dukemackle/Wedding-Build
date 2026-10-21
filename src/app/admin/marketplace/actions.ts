"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { logAdminAction } from "@/lib/admin-audit";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { getResendClient, INQUIRY_FROM_ADDRESS } from "@/lib/resend";
import { NOT_ALLOWED } from "@/lib/marketplace";

/**
 * Takes a listing off the marketplace (status 'removed', which its seller
 * can't undo), closes every open report on it and tells the seller why.
 */
export async function takeDownListing(formData: FormData): Promise<void> {
  await requireAdmin();
  const listingId = formData.get("listing_id") as string;
  const reason = ((formData.get("reason") as string) ?? "").trim();
  if (!listingId) return;

  const admin = createAdminSupabaseClient();
  const { data: listing } = await admin
    .from("market_listings")
    .update({ status: "removed", updated_at: new Date().toISOString() })
    .eq("id", listingId)
    .select("title, seller_id")
    .maybeSingle<{ title: string; seller_id: string }>();
  await admin
    .from("market_reports")
    .update({ status: "removed", resolved_at: new Date().toISOString() })
    .eq("listing_id", listingId)
    .eq("status", "open");

  if (listing && process.env.RESEND_API_KEY) {
    try {
      const { data } = await admin.auth.admin.getUserById(listing.seller_id);
      if (data.user?.email) {
        await getResendClient().emails.send({
          from: INQUIRY_FROM_ADDRESS,
          to: data.user.email,
          replyTo: process.env.ADMIN_EMAIL?.split(",")[0]?.trim(),
          subject: `Your listing "${listing.title}" was taken down`,
          text: `Hi,\n\nWe've taken your marketplace listing "${listing.title}" down${reason ? ` because ${reason}` : " after a report"}.\n\nThe marketplace doesn't allow: ${NOT_ALLOWED.join(", ")}, or anything misleading.\n\nIf you think this was a mistake, reply to this email.\n\nYou Do, I Do`,
        });
      }
    } catch {
      // The listing is down either way.
    }
  }

  await logAdminAction("market.take_down", { type: "market_listing", ids: [listingId] }, `Took down a marketplace listing${reason ? `: ${reason}` : ""}`);
  revalidatePath("/admin/marketplace");
  revalidatePath("/marketplace");
  revalidatePath(`/marketplace/${listingId}`);
}

export async function dismissReport(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) return;
  await createAdminSupabaseClient()
    .from("market_reports")
    .update({ status: "dismissed", resolved_at: new Date().toISOString() })
    .eq("id", id);
  await logAdminAction("market.dismiss_report", { type: "market_report", ids: [id] }, "Dismissed a marketplace report");
  revalidatePath("/admin/marketplace");
}
