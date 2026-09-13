"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signup(formData: FormData) {
  const supabase = await createClient();

  // Only ever redirect to a relative path -- next comes from a query param
  // a link could set to anything, so this guards against it pointing
  // off-site.
  const requestedNext = (formData.get("next") as string) || "";
  const next =
    requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/dashboard";

  // Explicit emailRedirectTo, same reasoning as forgot-password/actions.ts:
  // Supabase's default confirmation email otherwise links back to whatever
  // "Site URL" is set in the dashboard (Authentication -> URL Configuration),
  // which is easy to leave at http://localhost:3000 from local dev. Must
  // also be added to Supabase's Redirect URLs allowlist or this is silently
  // ignored. `next` rides along as a query param so /auth/confirm forwards
  // it (e.g. an invite link -- signup requires email confirmation, so the
  // invite-accept destination has to survive that round trip).
  const { data, error } = await supabase.auth.signUp({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    options: {
      emailRedirectTo: `https://wrenwed.com/auth/confirm?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  if (!data.session) {
    redirect(
      `/login?message=${encodeURIComponent("Check your email to confirm your account, then log in.")}&next=${encodeURIComponent(next)}`,
    );
  }

  redirect(next);
}
