import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { allowGuestWrite } from "@/lib/guest-rate-limit";
import { findHousehold } from "@/lib/households";
import { inviteCookie, normalizeInviteCode } from "@/lib/invite-codes";
import { gateCookie } from "@/lib/site-gate";

// A guest's personal RSVP link, from their invitation or the couple's email:
//
//   GET /w/<slug>/i/<code>
//
// A real code remembers the household on this browser and, being proof of
// an invitation, opens a password-protected site too (owner decision
// 2026-10-27). Then it's the ordinary site, at the RSVP. A wrong code just
// lands on the site, where typing a name still works.

const YEAR = 60 * 60 * 24 * 365;

export async function GET(request: Request, { params }: { params: Promise<{ slug: string; code: string }> }) {
  const { slug, code: rawCode } = await params;
  const site = new URL(`/w/${encodeURIComponent(slug)}`, request.url);
  const code = normalizeInviteCode(rawCode);
  if (!code) return NextResponse.redirect(site);

  const { data: wedding } = await createAdminSupabaseClient()
    .from("weddings")
    .select("id, site_password_hash")
    .eq("public_slug", slug)
    .maybeSingle<{ id: string; site_password_hash: string | null }>();
  if (!wedding || !(await allowGuestWrite(wedding.id, "invite"))) return NextResponse.redirect(site);

  const household = await findHousehold(wedding.id, code);
  if (!household) return NextResponse.redirect(site);

  site.hash = "rsvp";
  const response = NextResponse.redirect(site);
  const cookie = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: `/w/${slug}`,
    maxAge: YEAR,
  };
  response.cookies.set(inviteCookie(slug), code, cookie);
  if (wedding.site_password_hash) {
    // The same token the password gives (unlock_guest_site, 0121).
    const token = createHash("sha256").update(wedding.site_password_hash + wedding.id).digest("hex");
    response.cookies.set(gateCookie(slug), token, cookie);
  }
  return response;
}
