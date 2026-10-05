"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";

/** Closes a couple's listing report as fixed or dismissed. */
export async function setReportStatus(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = formData.get("id") as string;
  const status = formData.get("status") as string;
  if (!id || (status !== "fixed" && status !== "dismissed")) return;

  const admin = createAdminSupabaseClient();
  const { error } = await admin
    .from("listing_reports")
    .update({ status, resolved_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/listing-health");
}
