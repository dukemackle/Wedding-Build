"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient();
  const email = ((formData.get("email") as string) || "").trim();

  if (email) {
    // Points at the route handler rather than straight at /reset-password:
    // only a Route Handler can write the session cookies that turn the
    // emailed token into a usable session. Sending people directly to the
    // page meant the session was verified and then silently discarded.
    // Must also be added to Supabase's Redirect URLs allowlist
    // (Authentication -> URL Configuration) or Supabase ignores it.
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://wrenwed.com/auth/confirm?next=/reset-password",
    });
  }

  // Same message whether or not the email has an account -- otherwise this
  // form could be used to check which emails are registered.
  redirect(
    "/forgot-password?message=" +
      encodeURIComponent("If an account exists for that email, a reset link is on its way."),
  );
}
