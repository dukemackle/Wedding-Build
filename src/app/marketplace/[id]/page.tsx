import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { categoryLabel, formatPrice } from "@/lib/marketplace";
import type { MarketListing } from "@/lib/supabase/types";
import { ListingView } from "./listing-view";

const load = cache(async (id: string) => {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { user: null, listing: null, saved: false };
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
  if (user && listing) {
    const { count } = await supabase
      .from("market_saves")
      .select("listing_id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("listing_id", id);
    saved = (count ?? 0) > 0;
  }
  return { user, listing, saved };
});

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { listing } = await load(id);
  if (!listing) return {};
  const title = `${listing.title} — ${formatPrice(listing.price_cents)}`;
  return {
    title,
    description: `${categoryLabel(listing.category)} in ${listing.city}, ${listing.state}, on the You Do, I Do marketplace.`,
    robots: { index: false, follow: false },
    openGraph: { title, images: listing.photo_urls[0] ? [listing.photo_urls[0]] : undefined },
  };
}

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, listing, saved } = await load(id);
  if (!listing) notFound();

  return <ListingView listing={listing} viewer={user ? { id: user.id, email: user.email ?? "" } : null} saved={saved} />;
}
