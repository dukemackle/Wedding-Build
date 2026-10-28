import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/app-nav";
import { PublicNav } from "@/components/public-nav";
import { MARKET_CATEGORIES, MARKET_DISTANCES } from "@/lib/marketplace";
import { loadBookedOn, loadLiveSets, loadMarketWedding, loadPassItOn, unreadThreadCount, type MarketWedding } from "@/lib/marketplace-server";
import { inPassItOnWindow, type PassItOnDraft } from "@/lib/pass-it-on";
import type { MarketListing } from "@/lib/supabase/types";
import { MarketplaceBrowser } from "./marketplace-browser";

export const metadata: Metadata = {
  title: "Wedding marketplace",
  description: "Buy and sell wedding decor, signs, dresses and more, left over from real weddings near you.",
  // Kept out of search until it opens, so it isn't found empty.
  robots: { index: false, follow: false },
};

/** Whether the day is behind them (today counts as not yet). */
function weddingPassed(date: string) {
  return date < new Date().toISOString().slice(0, 10);
}

/** Newest first; enough for a launch-sized marketplace before it needs paging server-side. */
const BROWSE_LIMIT = 1000;

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; near?: string; view?: string }>;
}) {
  const { category, near, view } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: listings }, sets] = await Promise.all([
    supabase
      .from("market_listings")
      .select("*")
      .in("status", ["active", "pending"])
      .order("created_at", { ascending: false })
      .limit(BROWSE_LIMIT)
      .returns<MarketListing[]>(),
    loadLiveSets(supabase),
  ]);

  let mine: MarketListing[] = [];
  let savedIds: string[] = [];
  let wedding: MarketWedding | null = null;
  let unread = 0;
  let passItOn: PassItOnDraft[] | null = null;
  let bookedIds: string[] = [];
  if (user) {
    const [{ data: own }, { data: saves }, ownWedding, unreadCount] = await Promise.all([
      supabase
        .from("market_listings")
        .select("*")
        .eq("seller_id", user.id)
        .neq("status", "removed")
        .order("created_at", { ascending: false })
        .returns<MarketListing[]>(),
      supabase.from("market_saves").select("listing_id").eq("user_id", user.id).returns<{ listing_id: string }[]>(),
      loadMarketWedding(supabase, user.id),
      unreadThreadCount(user.id),
    ]);
    mine = own ?? [];
    savedIds = (saves ?? []).map((s) => s.listing_id);
    wedding = ownWedding;
    unread = unreadCount;
    // After the wedding, the sell card turns into the couple's own drafts.
    if (wedding && inPassItOnWindow(wedding.weddingDate)) {
      passItOn = await loadPassItOn(supabase, wedding.weddingId);
    }
    // Before the wedding, which rentals are already out on the day.
    if (wedding?.weddingDate && !weddingPassed(wedding.weddingDate)) {
      bookedIds = await loadBookedOn(supabase, wedding.weddingDate);
    }
  }

  return (
    // Full-bleed, like Venues and Vendors.
    <main className="flex flex-1 flex-col px-6 py-16">
      {user ? <AppNav email={user.email ?? ""} /> : <PublicNav next="/marketplace" />}
      <h1 className="sr-only">Wedding marketplace</h1>
      <MarketplaceBrowser
        listings={listings ?? []}
        mine={mine}
        savedIds={savedIds}
        signedIn={Boolean(user)}
        origin={wedding?.origin ?? null}
        unread={unread}
        guestCount={wedding?.guestCount ?? 0}
        // "Shop your wedding" is for planning: only before the day.
        weddingDate={wedding?.weddingDate && !weddingPassed(wedding.weddingDate) ? wedding.weddingDate : null}
        paletteColor={wedding?.colorFamily ?? null}
        pickedColors={wedding?.pickedColors ?? []}
        bookedIds={bookedIds}
        planning={Boolean(wedding) && !(wedding?.weddingDate && weddingPassed(wedding.weddingDate))}
        passItOn={passItOn}
        sets={sets}
        // A link with filters, or to Saved/Selling, goes straight to browsing.
        startBrowsing={Boolean(category || near || view)}
        initial={{
          // From the budget page's "on the marketplace near you" links.
          category: MARKET_CATEGORIES.some((c) => c.value === category) ? category : undefined,
          distance: near && MARKET_DISTANCES.some((d) => String(d) === near) ? near : undefined,
        }}
      />
    </main>
  );
}
