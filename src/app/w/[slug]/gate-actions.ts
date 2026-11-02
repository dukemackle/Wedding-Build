"use server";

import { cookies } from "next/headers";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { allowGuestWrite } from "@/lib/guest-rate-limit";
import { gateCookie } from "@/lib/site-gate";

/**
 * Checks a guest's guess at the site's password. A right one leaves a cookie
 * for this site's pages, good until the couple changes the password.
 */
export async function unlockGuestSite(slug: string, password: string): Promise<{ error?: string }> {
  const attempt = password.trim();
  if (!attempt) return { error: "Type the password from your invitation." };

  // Each visitor gets 20 tries an hour, so one stranger guessing can't lock
  // every guest out (the database's per-site limit is only a backstop, 0140).
  const admin = createAdminSupabaseClient();
  const { data: site } = await admin.from("weddings").select("id").eq("public_slug", slug).maybeSingle<{ id: string }>();
  if (site && !(await allowGuestWrite(site.id, "unlock"))) {
    return { error: "Too many tries. Wait a while, then try again." };
  }

  const { data: token, error } = await admin.rpc("unlock_guest_site", { site_slug: slug, attempt });
  if (error?.message.includes("too_many_attempts")) {
    return { error: "Too many tries. Wait 15 minutes, then try again." };
  }
  if (typeof token !== "string" || !token) {
    return { error: "That's not it. Check your invitation and try again." };
  }

  (await cookies()).set(gateCookie(slug), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: `/w/${slug}`,
    maxAge: 60 * 60 * 24 * 365,
  });
  return {};
}
