"use server";

import { requireAdmin } from "@/lib/admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { getResendClient, INQUIRY_FROM_ADDRESS } from "@/lib/resend";
import type { Wedding } from "@/lib/supabase/types";

export async function emailCouples(
  formData: FormData,
): Promise<{ error?: string; sent?: number; failed?: number }> {
  await requireAdmin();

  const weddingIds = formData.getAll("wedding_id") as string[];
  const subject = ((formData.get("subject") as string) || "").trim();
  const message = ((formData.get("message") as string) || "").trim();

  if (weddingIds.length === 0) return { error: "Select at least one couple." };
  if (!subject || !message) return { error: "Subject and message are required." };

  const admin = createAdminSupabaseClient();

  const { data: weddings, error: weddingsError } = await admin
    .from("weddings")
    .select("id, user_id, partner_a_name, partner_b_name")
    .in("id", weddingIds)
    .returns<Pick<Wedding, "id" | "user_id" | "partner_a_name" | "partner_b_name">[]>();

  if (weddingsError) return { error: weddingsError.message };

  const resend = getResendClient();
  let sent = 0;
  let failed = 0;

  for (const wedding of weddings ?? []) {
    const { data: userData, error: userError } = await admin.auth.admin.getUserById(
      wedding.user_id,
    );
    const email = userData?.user?.email;
    if (userError || !email) {
      failed++;
      continue;
    }

    const names = [wedding.partner_a_name, wedding.partner_b_name].filter(Boolean).join(" & ");
    try {
      const { error: sendError } = await resend.emails.send({
        from: INQUIRY_FROM_ADDRESS,
        to: email,
        subject,
        text: `Hi ${names || "there"},\n\n${message}`,
      });
      if (sendError) {
        failed++;
        continue;
      }
      sent++;
    } catch {
      failed++;
    }
  }

  return { sent, failed };
}
