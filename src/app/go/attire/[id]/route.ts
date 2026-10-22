import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { outboundUrl, safeUrl } from "@/lib/attire";

// Every attire "Shop" button goes through here: count the click, then send
// the couple on to the retailer (the affiliate link when there is one). Our
// own click count is what we set against the sales a network reports
// (docs/attire-affiliates.md). Anonymous: no user or wedding is recorded.
//
//   GET /go/attire/<item id>[?from=party]

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/**
 * Clicks stored per item per hour. Far above what real couples produce, low
 * enough that a script hitting this public URL can't fill the table. Clicks
 * past it still redirect, they just aren't counted.
 */
const MAX_PER_HOUR = 30;

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const home = new URL("/attire", request.url);
  if (!UUID.test(id)) return NextResponse.redirect(home);

  const admin = createAdminSupabaseClient();
  const { data: item } = await admin
    .from("attire_items")
    .select("*")
    .eq("id", id)
    .maybeSingle<{ id: string; merchant_id: string | null; affiliate_url: string | null; retailer_url: string | null }>();
  const target = item ? outboundUrl(item) : null;
  if (!item || !target) return NextResponse.redirect(home);

  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error } = await admin
    .from("attire_clicks")
    .select("id", { count: "exact", head: true })
    .eq("attire_item_id", id)
    .gte("created_at", since);
  if (!error && (count ?? 0) < MAX_PER_HOUR) {
    await admin.from("attire_clicks").insert({
      attire_item_id: id,
      merchant_id: item.merchant_id,
      affiliate: safeUrl(item.affiliate_url) != null,
      source: new URL(request.url).searchParams.get("from") === "party" ? "party" : "attire",
    });
  }

  const res = NextResponse.redirect(target, 302);
  res.headers.set("X-Robots-Tag", "noindex");
  res.headers.set("Cache-Control", "no-store");
  return res;
}
