"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { normalizeEmail } from "@/lib/unsubscribe";
import { trackEvent } from "@/lib/events";

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
  const email = ((formData.get("email") as string) || "").trim();

  const { data, error } = await supabase.auth.signUp({
    email,
    password: formData.get("password") as string,
    options: {
      emailRedirectTo: `https://youdoido.com/auth/confirm?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  // Supabase answers a repeat signup with a stand-in user with no
  // identities; only a real new account counts.
  if (data.user?.identities?.length) trackEvent("account_created", { userId: data.user.id });

  // Record the tick, not its absence: an unticked box writes nothing, so a
  // returning user who once opted in isn't silently opted out by signing up
  // again. sendMarketingEmail only counts it once this address is confirmed.
  if (formData.get("marketing_opt_in") === "on" && data.user) {
    const now = new Date().toISOString();
    await createAdminSupabaseClient()
      .from("marketing_consents")
      .upsert(
        {
          email: normalizeEmail(email),
          user_id: data.user.id,
          opted_in: true,
          opted_in_at: now,
          opted_out_at: null,
          source: "signup",
          updated_at: now,
        },
        { onConflict: "email" },
      );
  }

  if (!data.session) {
    // Naming the address matters more than it looks. "Check your email" after
    // a typo sends someone to an inbox that will never receive anything, and
    // nothing on screen hints why -- they wait, then give up. Showing what we
    // sent to makes a wrong address obvious in the one moment it's still easy
    // to fix.
    redirect(
      `/login?message=${encodeURIComponent(
        `Check ${email} to confirm your account, then log in. Wrong address? Sign up again with the right one.`,
      )}&next=${encodeURIComponent(next)}`,
    );
  }

  redirect(next);
}
