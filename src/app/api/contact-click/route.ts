import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";

// Counts a couple tapping a listing's phone, website or social link, sent by
// TrackedContactLink with navigator.sendBeacon. These taps are leads we'd
// otherwise never see, and they're part of the count we show the vendor
// (src/lib/listing-leads.ts). Anonymous on purpose: listings are public.
//
//   POST {"type":"vendor"|"venue", "id":"<uuid>", "kind":"phone"|"website"|"social"}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TYPES = ["venue", "vendor"];
const KINDS = ["phone", "website", "social"];

export async function POST(request: Request) {
  let body: { type?: unknown; id?: unknown; kind?: unknown };
  try {
    body = JSON.parse(await request.text());
  } catch {
    return new Response(null, { status: 400 });
  }
  const { type, id, kind } = body;
  if (
    typeof type !== "string" || !TYPES.includes(type) ||
    typeof kind !== "string" || !KINDS.includes(kind) ||
    typeof id !== "string" || !UUID.test(id)
  ) {
    return new Response(null, { status: 400 });
  }

  const admin = createAdminSupabaseClient();
  // Only count taps on listings that exist, so the table can't be filled with junk.
  const { data: listing } = await admin
    .from(type === "venue" ? "venues" : "vendors")
    .select("id")
    .eq("id", id)
    .maybeSingle();
  if (!listing) return new Response(null, { status: 404 });

  await admin.from("listing_contact_clicks").insert({ listing_type: type, listing_id: id, kind });
  return new Response(null, { status: 204 });
}
