"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { FeedbackCategory, Wedding } from "@/lib/supabase/types";

const VALID_CATEGORIES: FeedbackCategory[] = ["bug", "idea", "other"];

export async function submitFeedback(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const categoryRaw = (formData.get("category") as string) || "idea";
  const category = (
    VALID_CATEGORIES.includes(categoryRaw as FeedbackCategory) ? categoryRaw : "idea"
  ) as FeedbackCategory;

  const message = ((formData.get("message") as string) || "").trim();
  if (!message) {
    return { error: "Let us know what's on your mind before sending." };
  }

  const { data: wedding } = await supabase
    .from("weddings")
    .select("*")
    .or(`user_id.eq.${user.id},partner_user_id.eq.${user.id}`)
    .maybeSingle<Wedding>();

  const { error } = await supabase.from("feedback_submissions").insert({
    wedding_id: wedding?.id ?? null,
    user_id: user.id,
    category,
    message,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/help");
  return {};
}
