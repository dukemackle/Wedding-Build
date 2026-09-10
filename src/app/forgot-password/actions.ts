"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient();
  const email = ((formData.get("email") as string) || "").trim();

  if (email) {
    // Explicit redirectTo so Supabase's default reset-password email --
    // which we can't customize without setting up custom SMTP -- still
    // lands the visitor on our /reset-password page instead of the bare
    // site root. Must also be added to Supabase's Redirect URLs allowlist
    // (Authentication -> URL Configuration) or Supabase silently ignores it.
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://wrenwed.com/reset-password",
    });
  }

  // Same message whether or not the email has an account -- otherwise this
  // form could be used to check which emails are registered.
  redirect(
    "/forgot-password?message=" +
      encodeURIComponent("If an account exists for that email, a reset link is on its way."),
  );
}
