import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/app-nav";
import { PublicNav } from "@/components/public-nav";
import { unreadThreadCount } from "@/lib/marketplace-server";
import type { MarketListing } from "@/lib/supabase/types";
import { MarketplaceBrowser, type MarketOrigin } from "./marketplace-browser";

export const metadata: Metadata = {
  title: "Wedding marketplace",
  description: "Buy and sell wedding decor, signs, dresses and more, left over from real weddings near you.",
  // Kept out of search until it opens, so it isn't found empty.
  robots: { index: false, follow: false },
};

/** Newest first; enough for a launch-sized marketplace before it needs paging server-side. */
const BROWSE_LIMIT = 1000;

export default async function MarketplacePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: listings } = await supabase
    .from("market_listings")
    .select("*")
    .in("status", ["active", "pending"])
    .order("created_at", { ascending: false })
    .limit(BROWSE_LIMIT)
    .returns<MarketListing[]>();

  let mine: MarketListing[] = [];
  let savedIds: string[] = [];
  let origin: MarketOrigin | null = null;
  let unread = 0;
  if (user) {
    const [{ data: own }, { data: saves }, { data: wedding }, unreadCount] = await Promise.all([
      supabase
        .from("market_listings")
        .select("*")
        .eq("seller_id", user.id)
        .neq("status", "removed")
        .order("created_at", { ascending: false })
        .returns<MarketListing[]>(),
      supabase.from("market_saves").select("listing_id").eq("user_id", user.id).returns<{ listing_id: string }[]>(),
      // A couple's venue is where "within X miles" starts from.
      supabase
        .from("weddings")
        .select("venue:venues(city, latitude, longitude)")
        .or(`user_id.eq.${user.id},member_ids.cs.{${user.id}}`)
        .maybeSingle<{ venue: { city: string | null; latitude: number | null; longitude: number | null } | null }>(),
      unreadThreadCount(user.id),
    ]);
    const venue = wedding?.venue;
    if (venue?.latitude != null && venue.longitude != null) {
      origin = { latitude: venue.latitude, longitude: venue.longitude, label: venue.city ?? "your venue" };
    }
    unread = unreadCount;
    mine = own ?? [];
    savedIds = (saves ?? []).map((s) => s.listing_id);
  }

  return (
    // Full-bleed, like Venues and Vendors.
    <main className="flex flex-1 flex-col px-6 py-16">
      {user ? <AppNav email={user.email ?? ""} /> : <PublicNav next="/marketplace" />}
      <h1 className="sr-only">Wedding marketplace</h1>
      <MarketplaceBrowser listings={listings ?? []} mine={mine} savedIds={savedIds} signedIn={Boolean(user)} origin={origin} unread={unread} />
    </main>
  );
}
