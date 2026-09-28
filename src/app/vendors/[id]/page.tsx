import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/page-shell";
import { JsonLd, faqJsonLd } from "@/components/json-ld";
import { SITE_URL, isIndexable, metaDescription, vendorHref } from "@/lib/public-listings";
import { loadVendorListing, VendorListing, type VendorListingData } from "./vendor-listing";

// The full-page listing: what a shared link, a refresh, a search result or a
// link from outside /vendors opens. From the vendor search the same listing
// opens in a panel instead -- see ../@modal/(.)[id].
//
// Public, like the venue listing: a logged-out visitor gets a signup prompt
// in place of save / quote. `[id]` is a slug; old uuid links are
// redirected to it in src/proxy.ts.

const load = cache(async (idOrSlug: string) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const data = await loadVendorListing(supabase, user?.id ?? null, idOrSlug);
  return { user, data };
});

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { data } = await load(id);
  if (!data) return {};
  const { vendor } = data;
  const place = [vendor.city, vendor.state].filter(Boolean).join(", ");
  const what = vendor.category ? `wedding ${vendor.category.toLowerCase()}` : "wedding vendor";
  const title = place ? `${vendor.name}, ${place} — ${what}` : `${vendor.name} — ${what}`;
  const description = metaDescription(
    [vendor.category, vendor.service_area ? `serves ${vendor.service_area}` : null, vendor.price_tier],
    vendor.description,
  );
  const image = vendor.image_url ?? vendor.photo_urls[0];
  return {
    title,
    description,
    alternates: { canonical: vendorHref(vendor) },
    robots: isIndexable(vendor) ? undefined : { index: false, follow: true },
    openGraph: { title, description, url: vendorHref(vendor), type: "website", images: image ? [image] : undefined },
  };
}

function vendorJsonLd({ vendor, faqs }: VendorListingData) {
  const url = `${SITE_URL}${vendorHref(vendor)}`;
  const images = [...new Set([vendor.image_url, ...vendor.photo_urls].filter(Boolean))];
  const business = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": url,
    name: vendor.name,
    url,
    description: vendor.description ?? undefined,
    image: images.length ? images : undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: vendor.city ?? undefined,
      addressRegion: vendor.state ?? undefined,
      addressCountry: "US",
    },
    geo:
      vendor.latitude != null && vendor.longitude != null
        ? { "@type": "GeoCoordinates", latitude: vendor.latitude, longitude: vendor.longitude }
        : undefined,
    areaServed: vendor.service_area ?? undefined,
    knowsAbout: vendor.category ? `Wedding ${vendor.category.toLowerCase()}` : undefined,
    sameAs: [vendor.website, vendor.instagram_url, vendor.facebook_url, vendor.pinterest_url].filter(Boolean),
  };
  return [business, ...faqJsonLd(faqs)];
}

export default async function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, data } = await load(id);
  if (!data) notFound();

  return (
    <PageShell email={user ? (user.email ?? "") : null} width="wide">
      <JsonLd data={vendorJsonLd(data)} />
      <Link href="/vendors" className="mb-4 inline-block text-sm text-brass hover:underline">
        &larr; {user ? "Back to vendors" : "Browse wedding vendors"}
      </Link>
      <VendorListing data={data} />
    </PageShell>
  );
}
