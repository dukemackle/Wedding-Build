import { normalizeInviteCode } from "@/lib/invite-codes";
import { isCouple, loadGuestInvitation } from "@/lib/save-the-date/guest-card";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { createClient } from "@/lib/supabase/server";

// A guest opened the envelope on their invitation (as /api/save-the-date/opened):
//
//   POST {"slug": "...", "code": "K7M2QX"}
//
// Stamps guests.inv_opened_at the first time only, so it's at most one write
// per guest, ever. The couple opening their own links doesn't count.
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!origin || !host || new URL(origin).host !== host) return new Response(null, { status: 403 });

  let body: { slug?: unknown; code?: unknown };
  try {
    body = JSON.parse(await request.text());
  } catch {
    return new Response(null, { status: 400 });
  }
  const code = normalizeInviteCode(typeof body.code === "string" ? body.code : null);
  const card = typeof body.slug === "string" ? await loadGuestInvitation(body.slug) : null;
  if (!code || !card) return new Response(null, { status: 204 });

  const { data: auth } = await (await createClient()).auth.getClaims();
  if (isCouple(card.wedding, auth?.claims.sub)) return new Response(null, { status: 204 });

  await createAdminSupabaseClient()
    .from("guests")
    .update({ inv_opened_at: new Date().toISOString() })
    .eq("wedding_id", card.wedding.id)
    .eq("invite_code", code)
    .is("inv_opened_at", null);
  return new Response(null, { status: 204 });
}
