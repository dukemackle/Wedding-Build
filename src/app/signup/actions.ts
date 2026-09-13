"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signup(formData: FormData) {
  const supabase = await createClient();

  // Explicit emailRedirectTo, same reasoning as forgot-password/actions.ts:
  // Supabase's default confirmation email otherwise links back to whatever
  // "Site URL" is set in the dashboard (Authentication -> URL Configuration),
  // which is easy to leave at http://localhost:3000 from local dev. Must
  // also be added to Supabase's Redirect URLs allowlist or this is silently
  // ignored.
  const { data, error } = await supabase.auth.signUp({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    options: {
      emailRedirectTo: "https://wrenwed.com/auth/confirm",
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  if (!data.session) {
    redirect("/login?message=Check your email to confirm your account, then log in.");
  }

  redirect("/dashboard");
}
