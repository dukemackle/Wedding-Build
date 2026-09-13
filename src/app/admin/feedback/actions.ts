"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import type { FeedbackStatus } from "@/lib/supabase/types";

const VALID_STATUSES: FeedbackStatus[] = ["new", "read", "resolved"];

export async function setFeedbackStatus(formData: FormData): Promise<{ error?: string }> {
  await requireAdmin();

  const feedbackId = formData.get("feedback_id") as string;
  const status = formData.get("status") as string;

  if (!feedbackId) return { error: "Missing feedback id." };
  if (!VALID_STATUSES.includes(status as FeedbackStatus)) return { error: "Invalid status." };

  const admin = createAdminSupabaseClient();
  const { error } = await admin
    .from("feedback_submissions")
    .update({ status })
    .eq("id", feedbackId);

  if (error) return { error: error.message };

  revalidatePath("/admin/feedback");
  return {};
}
