import "server-only";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { gateCookie } from "@/lib/site-gate";

/**
 * The client a guest site reads and writes through.
 *
 * The database answers for one guest site at a time, and only the one a
 * request names (0121_guest_site_privacy.sql): the slug goes in x-guest-site,
 * and the gate cookie's token, if the guest has typed the password, in
 * x-guest-site-token. Without them public_weddings and everything built on
 * it come back empty, so a plain createClient() can't read a guest site.
 */
export async function createGuestSiteClient(slug: string) {
  const token = (await cookies()).get(gateCookie(slug))?.value;
  return createClient({
    headers: { "x-guest-site": slug, ...(token ? { "x-guest-site-token": token } : {}) },
  });
}

/**
 * The same, for actions whose form carries the wedding's id rather than its
 * slug. The slug is looked up server-side; the id alone opens nothing.
 */
export async function createGuestSiteClientFor(weddingId: string) {
  const { data } = await createAdminSupabaseClient()
    .from("weddings")
    .select("public_slug")
    .eq("id", weddingId)
    .maybeSingle<{ public_slug: string | null }>();
  return data?.public_slug ? createGuestSiteClient(data.public_slug) : createClient();
}

export type GuestSiteCover = {
  id: string;
  public_slug: string;
  partner_a_name: string | null;
  partner_b_name: string | null;
  wedding_date: string | null;
  hero_photo_url: string | null;
  venue_photo_urls: string[] | null;
  site_design: unknown;
  site_locked: boolean;
};

/** Names, date and look of one site by slug, password or not (guest_site_cover). */
export async function guestSiteCover(slug: string): Promise<GuestSiteCover | null> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("guest_site_cover", { site_slug: slug });
  const row = (Array.isArray(data) ? data[0] : data) as GuestSiteCover | undefined;
  return row ?? null;
}
