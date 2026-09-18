"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updatePassword(formData: FormData) {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirm_password") as string;

  if (password.length < 6) {
    redirect(
      "/reset-password?error=" + encodeURIComponent("Password must be at least 6 characters."),
    );
  }

  if (password !== confirmPassword) {
    redirect("/reset-password?error=" + encodeURIComponent("Passwords don't match."));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    // "Auth session missing!" is Supabase's phrasing for a recovery link that
    // expired, was already used, or was opened in a different browser from
    // the one that asked for it. Passed through raw it reads like a fault in
    // the account, and sends people to support instead of to a new link.
    const expired = error.message.toLowerCase().includes("session missing");
    if (expired) {
      redirect(
        "/forgot-password?error=" +
          encodeURIComponent(
            "That reset link has expired or was already used. Here's a fresh one — open it in this same browser.",
          ),
      );
    }
    redirect(`/reset-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard?message=" + encodeURIComponent("Password updated."));
}
