import Link from "next/link";
import { TrackedContactLink } from "@/components/tracked-contact-link";
import { ReportListing } from "@/components/report-listing";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Vendor, VendorFaq, Wedding } from "@/lib/supabase/types";
import { VENDOR_PRICE_UNITS } from "@/lib/wedding-options";
import { ChevronDownIcon } from "@/components/icons";
import { PhotoGallery } from "@/components/photo-gallery";
import { SignupPrompt } from "@/components/public-nav";
import { PUBLIC_VENDOR_COLUMNS, isBasicListing, isUuid, vendorHref, verifiedLabel } from "@/lib/public-listings";
import { VendorDetailClient } from "./vendor-detail-client";

/**
 * One vendor's listing: the full page at /vendors/[id] and the panel that
 * opens over the vendor search both render this, so they can't drift apart.
 * Same shape as the venue listing (../../venues/[id]/venue-listing.tsx).
 */

export type VendorListingData = {
  vendor: Vendor;
  /** False for a logged-out visitor: no contact details, a signup prompt. */
  signedIn: boolean;
  wedding: Wedding | null;
  isFavorited: boolean;
  faqs: VendorFaq[];
  similarVendors: Vendor[];
  /** The claim form's preview: nothing that reports, tracks or links away, FAQs open. */
  preview?: boolean;
};

export async function loadVendorListing(
  supabase: SupabaseClient,
  userId: string | null,
  idOrSlug: string,
): Promise<VendorListingData | null> {
  // Logged out, the anon role can only read the public columns (0091).
  const columns = userId ? "*" : PUBLIC_VENDOR_COLUMNS;
  const { data: vendor } = await supabase
    .from("vendors")
    .select(columns)
    .eq(isUuid(idOrSlug) ? "id" : "slug", idOrSlug)
    .eq("active", true)
    .maybeSingle<Vendor>();
  if (!vendor) return null;

  const [{ data: wedding }, { data: faqs }, { data: similarVendors }] = await Promise.all([
    userId
      ? supabase
          .from("weddings")
          .select("*")
          .or(`user_id.eq.${userId},member_ids.cs.{${userId}}`)
          .maybeSingle<Wedding>()
      : Promise.resolve({ data: null }),
    supabase.from("vendor_faqs").select("*").eq("vendor_id", vendor.id).order("sort_order").returns<VendorFaq[]>(),
    vendor.category
      ? supabase
          .from("vendors")
          .select(columns)
          .eq("active", true)
          .eq("category", vendor.category)
          .neq("id", vendor.id)
          .limit(3)
          .returns<Vendor[]>()
      : Promise.resolve({ data: [] as Vendor[] }),
  ]);

  const { data: favorite } = wedding
    ? await supabase
        .from("vendor_favorites")
        .select("vendor_id")
        .eq("wedding_id", wedding.id)
        .eq("vendor_id", vendor.id)
        .maybeSingle()
    : { data: null };

  return {
    vendor,
    signedIn: Boolean(userId),
    wedding: wedding ?? null,
    isFavorited: Boolean(favorite),
    faqs: faqs ?? [],
    similarVendors: similarVendors ?? [],
  };
}

const card = "rounded-lg border border-hairline bg-card p-6 shadow-sm";

export function VendorListing({ data }: { data: VendorListingData }) {
  const { vendor, signedIn, wedding, isFavorited, faqs, similarVendors, preview } = data;
  // Cover first, no repeats.
  const photos = [...new Set([vendor.image_url, ...vendor.photo_urls].filter((u): u is string => Boolean(u)))];
  const links = [
    ["Website", vendor.website],
    ["Instagram", vendor.instagram_url],
    ["Facebook", vendor.facebook_url],
    ["Pinterest", vendor.pinterest_url],
  ].filter((l): l is [string, string] => Boolean(l[1]));

  return (
    <div>
      <PhotoGallery photos={photos} alt={vendor.name} />

      <div className={`${photos.length ? "mt-6" : ""} grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10`}>
        <div className="lg:col-start-1 lg:row-start-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h1 className="font-display text-3xl font-semibold text-forest">{vendor.name}</h1>
            {vendor.price_tier && (
              <span className="shrink-0 rounded-full border border-hairline px-3 py-1 text-sm text-brass">
                {vendor.price_tier}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm uppercase tracking-wide text-ink/50">
            {[[vendor.city, vendor.state].filter(Boolean).join(", "), vendor.category].filter(Boolean).join(" · ")}
          </p>
          {vendor.service_area && <p className="mt-1 text-sm text-ink/60">Serves {vendor.service_area}</p>}
          {vendor.is_sample && <p className="mt-1 text-[10px] uppercase tracking-wide text-ink/40">Sample listing</p>}
          {verifiedLabel(vendor, "vendor") && (
            <p className="mt-1 text-xs text-forest/80">✓ {verifiedLabel(vendor, "vendor")}</p>
          )}
          {isBasicListing(vendor) && (
            <p className="mt-3 rounded-lg bg-forest/5 p-3 text-sm text-ink/80">
              We found this business on Instagram, but it has no website for us to check details against. Ask about
              dates, pricing and what&apos;s included before you book.{" "}
              <Link href="/list/edit" className="underline hover:text-forest">
                Is this your business? Add your details
              </Link>
            </p>
          )}
          {!vendor.is_sample && !preview && <ReportListing listingType="vendor" listingId={vendor.id} />}
          {vendor.description && <p className="mt-4 text-ink/80">{vendor.description}</p>}
          {links.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {links.map(([label, href]) => (
                <TrackedContactLink
                  key={label}
                  listingType="vendor"
                  listingId={vendor.id}
                  kind={label === "Website" ? "website" : "social"}
                  href={href}
                  className="rounded-full border border-hairline px-3 py-1 text-sm text-ink transition-colors hover:border-forest"
                >
                  {label} ↗
                </TrackedContactLink>
              ))}
            </div>
          )}
        </div>

        <aside className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <div className="lg:sticky lg:top-16">
            {vendor.price_from != null && (
              <div className="mb-3 rounded-lg border border-hairline bg-card px-5 py-4 shadow-sm">
                <p className="font-display text-2xl font-semibold text-forest">
                  From ${vendor.price_from.toLocaleString()}
                  {vendor.price_unit && (
                    <span className="ml-1 font-body text-base font-normal text-ink/60">
                      {VENDOR_PRICE_UNITS[vendor.price_unit]}
                    </span>
                  )}
                </p>
                {vendor.price_note && <p className="text-sm text-ink/60">{vendor.price_note}</p>}
              </div>
            )}
            {!signedIn ? (
              <SignupPrompt noun="vendor" next={vendorHref(vendor)} />
            ) : wedding ? (
              <VendorDetailClient vendor={vendor} isFavorited={isFavorited} />
            ) : (
              <div className={`${card} text-sm text-ink/70`}>
                <Link href="/dashboard" className="text-brass hover:underline">
                  Set up your wedding
                </Link>{" "}
                to save vendors and request quotes.
              </div>
            )}
          </div>
        </aside>

        <div className="flex min-w-0 flex-col gap-6 lg:col-start-1 lg:row-start-2">
          {(vendor.about || vendor.included || vendor.amenities.length > 0) && (
            <div className={card}>
              {vendor.about && (
                <>
                  <h2 className="font-display text-xl font-semibold text-forest">About this vendor</h2>
                  <p className="mt-2 whitespace-pre-line text-ink/80">{vendor.about}</p>
                </>
              )}
              {vendor.included && (
                <div className={vendor.about ? "mt-6 border-t border-hairline pt-6" : ""}>
                  <h2 className="font-display text-xl font-semibold text-forest">What&apos;s included</h2>
                  <p className="mt-2 whitespace-pre-line text-ink/80">{vendor.included}</p>
                </div>
              )}
              {vendor.amenities.length > 0 && (
                <div className={vendor.about || vendor.included ? "mt-6 border-t border-hairline pt-6" : ""}>
                  <h2 className="font-display text-xl font-semibold text-forest">Services &amp; extras</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {vendor.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="rounded-full border border-hairline bg-parchment px-3 py-1 text-sm text-ink"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {vendor.good_to_know && (
            <div className={card}>
              <h2 className="font-display text-xl font-semibold text-forest">Good to know</h2>
              <p className="mt-2 whitespace-pre-line text-ink/80">{vendor.good_to_know}</p>
            </div>
          )}

          {faqs.length > 0 && (
            <div className={card}>
              <h2 className="font-display text-xl font-semibold text-forest">Frequently asked questions</h2>
              <div className="mt-2">
                {faqs.map((faq) => (
                  <details key={faq.id} open={preview} className="group border-b border-hairline py-3 last:border-b-0">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-ink marker:hidden">
                      {faq.question}
                      <ChevronDownIcon className="h-4 w-4 shrink-0 text-ink/40 transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="mt-2 whitespace-pre-line text-sm text-ink/70">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          )}

          {similarVendors.length > 0 && !preview && (
            <div>
              <h2 className="font-display text-xl font-semibold text-forest">
                More {vendor.category?.toLowerCase() ?? "vendors"} like this
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {similarVendors.map((v) => (
                  <Link
                    key={v.id}
                    href={vendorHref(v)}
                    className="rounded-lg border border-hairline bg-card p-4 transition-colors hover:border-forest"
                  >
                    <p className="font-display text-sm font-semibold text-forest">{v.name}</p>
                    <p className="mt-0.5 text-xs text-ink/50">{[v.city, v.state].filter(Boolean).join(", ")}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
