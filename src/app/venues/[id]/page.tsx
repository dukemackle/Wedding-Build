import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/page-shell";
import { JsonLd, faqJsonLd } from "@/components/json-ld";
import { SITE_URL, isIndexable, metaDescription, venueHref } from "@/lib/public-listings";
import { loadVenueListing, VenueListing, type VenueListingData } from "./venue-listing";

// The full-page listing: what a shared link, a refresh, a search result or a
// link from outside /venues opens. Clicking a venue in the search results
// opens the same listing in a panel instead -- see ../@modal/(.)[id].
//
// Public: a logged-out visitor sees the listing with a signup prompt in place
// of save / contact. `[id]` is a slug; old uuid links are
// redirected to it in src/proxy.ts.

const load = cache(async (idOrSlug: string) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const data = await loadVenueListing(supabase, user?.id ?? null, idOrSlug);
  return { user, data };
});

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { data } = await load(id);
  if (!data) return {};
  const { venue } = data;
  const place = [venue.city, venue.state].filter(Boolean).join(", ");
  const title = place ? `${venue.name}, ${place} — wedding venue` : `${venue.name} — wedding venue`;
  const description = metaDescription(
    [venue.venue_type, venue.capacity ? `up to ${venue.capacity} guests` : null, venue.price_tier],
    venue.description,
  );
  const image = venue.image_url ?? venue.photo_urls[0];
  return {
    title,
    description,
    alternates: { canonical: venueHref(venue) },
    robots: isIndexable(venue) ? undefined : { index: false, follow: true },
    openGraph: { title, description, url: venueHref(venue), type: "website", images: image ? [image] : undefined },
  };
}

function venueJsonLd({ venue, faqs }: VenueListingData) {
  const url = `${SITE_URL}${venueHref(venue)}`;
  const images = [...new Set([venue.image_url, ...venue.photo_urls].filter(Boolean))];
  const business = {
    "@context": "https://schema.org",
    "@type": "EventVenue",
    "@id": url,
    name: venue.name,
    url,
    description: venue.description ?? undefined,
    image: images.length ? images : undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: venue.address ?? undefined,
      addressLocality: venue.city ?? undefined,
      addressRegion: venue.state ?? undefined,
      addressCountry: "US",
    },
    geo:
      venue.latitude != null && venue.longitude != null
        ? { "@type": "GeoCoordinates", latitude: venue.latitude, longitude: venue.longitude }
        : undefined,
    maximumAttendeeCapacity: venue.capacity ?? undefined,
    amenityFeature: venue.amenities.length
      ? venue.amenities.map((name) => ({ "@type": "LocationFeatureSpecification", name, value: true }))
      : undefined,
    sameAs: [venue.website, venue.instagram_url, venue.facebook_url, venue.pinterest_url].filter(Boolean),
  };
  return [business, ...faqJsonLd(faqs)];
}

export default async function VenueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, data } = await load(id);
  if (!data) notFound();

  return (
    <PageShell email={user ? (user.email ?? "") : null} width="wide">
      <JsonLd data={venueJsonLd(data)} />
      <Link href="/venues" className="mb-4 inline-block text-sm text-brass hover:underline">
        &larr; {user ? "Back to venues" : "Browse wedding venues"}
      </Link>
      <VenueListing data={data} />
    </PageShell>
  );
}
