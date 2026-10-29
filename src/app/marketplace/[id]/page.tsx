import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { categoryLabel, formatPrice, milesBetween } from "@/lib/marketplace";
import type { MarketListing, MarketRentalBooking, MarketSet } from "@/lib/supabase/types";
import { joinedYear, loadMarketWedding, type MarketWedding } from "@/lib/marketplace-server";
import { ListingView } from "./listing-view";

const load = cache(async (id: string) => {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return {
      user: null,
      listing: null,
      saved: false,
      threadId: null,
      wedding: null,
      joined: null,
      sellerListings: [],
      similar: [],
      set: null,
      bookings: [],
    };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: listing } = await supabase
    .from("market_listings")
    .select("*")
    .eq("id", id)
    .maybeSingle<MarketListing>();
  let saved = false;
  let threadId: string | null = null;
  let wedding: MarketWedding | null = null;
  if (user && listing) {
    const [{ count }, { data: thread }, ownWedding] = await Promise.all([
      supabase
        .from("market_saves")
        .select("listing_id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("listing_id", id),
      supabase
        .from("market_threads")
        .select("id")
        .eq("listing_id", id)
        .eq("buyer_id", user.id)
        .maybeSingle<{ id: string }>(),
      loadMarketWedding(supabase, user.id),
    ]);
    saved = (count ?? 0) > 0;
    threadId = thread?.id ?? null;
    wedding = ownWedding;
  }
  // Seller details and "more like this", for anyone viewing.
  let joined: number | null = null;
  let sellerListings: MarketListing[] = [];
  let similar: MarketListing[] = [];
  let set: MarketSet | null = null;
  // A rental's booked dates still ahead: the seller manages them, and a
  // couple sees whether their own date is free.
  let bookings: MarketRentalBooking[] = [];
  if (listing?.listing_type === "rent") {
    const { data } = await supabase
      .from("market_rental_bookings")
      .select("*")
      .eq("listing_id", listing.id)
      .gte("ends_on", new Date().toISOString().slice(0, 10))
      .order("starts_on")
      .returns<MarketRentalBooking[]>();
    bookings = data ?? [];
  }
  if (listing) {
    const [year, { data: fromSeller }, { data: sameCategory }, { data: inSet }] = await Promise.all([
      joinedYear(listing.seller_id),
      supabase
        .from("market_listings")
        .select("*")
        .eq("seller_id", listing.seller_id)
        .eq("status", "active")
        .neq("id", listing.id)
        .order("created_at", { ascending: false })
        .limit(6)
        .returns<MarketListing[]>(),
      supabase
        .from("market_listings")
        .select("*")
        .eq("category", listing.category)
        .eq("status", "active")
        .neq("id", listing.id)
        .neq("seller_id", listing.seller_id)
        .order("created_at", { ascending: false })
        .limit(60)
        .returns<MarketListing[]>(),
      listing.set_id
        ? supabase.from("market_sets").select("*").eq("id", listing.set_id).maybeSingle<MarketSet>()
        : Promise.resolve({ data: null }),
    ]);
    set = inSet;
    joined = year;
    sellerListings = fromSeller ?? [];
    similar = nearestFirst(sameCategory ?? [], listing).slice(0, 6);
  }
  return { user, listing, saved, threadId, wedding, joined, sellerListings, similar, set, bookings };
});

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { listing } = await load(id);
  if (!listing) return {};
  const title = `${listing.title} — ${formatPrice(listing.price_cents, listing.listing_type)}`;
  return {
    title,
    description: `${categoryLabel(listing.category)} in ${listing.city}, ${listing.state}, on the You Do, I Do marketplace.`,
    robots: { index: false, follow: false },
    openGraph: { title, images: listing.photo_urls[0] ? [listing.photo_urls[0]] : undefined },
  };
}

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, listing, saved, threadId, wedding, joined, sellerListings, similar, set, bookings } = await load(id);
  const today = new Date().toISOString().slice(0, 10);
  const date = wedding?.weddingDate && wedding.weddingDate >= today ? wedding.weddingDate : null;
  if (!listing) notFound();

  return (
    <ListingView
      listing={listing}
      viewer={user ? { id: user.id, email: user.email ?? "" } : null}
      saved={saved}
      threadId={threadId}
      defaultName={wedding?.firstName ?? ""}
      guestCount={wedding?.guestCount ?? 0}
      joined={joined}
      sellerListings={sellerListings}
      similar={similar}
      set={set}
      bookings={bookings}
      dateStatus={
        listing.listing_type === "rent" && date
          ? bookings.some((b) => b.starts_on <= date && b.ends_on >= date)
            ? "booked"
            : "free"
          : null
      }
    />
  );
}

/** Listings sorted by distance from this one; ones without a pin go last. */
function nearestFirst(listings: MarketListing[], from: MarketListing) {
  if (from.latitude == null || from.longitude == null) return listings;
  const origin = { latitude: from.latitude, longitude: from.longitude };
  const miles = (l: MarketListing) =>
    l.latitude != null && l.longitude != null
      ? milesBetween(origin, { latitude: l.latitude, longitude: l.longitude })
      : Infinity;
  return [...listings].sort((a, b) => miles(a) - miles(b));
}
