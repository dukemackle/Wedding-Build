"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient();
  const email = ((formData.get("email") as string) || "").trim();

  if (email) {
    await supabase.auth.resetPasswordForEmail(email);
  }

  // Same message whether or not the email has an account -- otherwise this
  // form could be used to check which emails are registered.
  redirect(
    "/forgot-password?message=" +
      encodeURIComponent("If an account exists for that email, a reset link is on its way."),
  );
}
