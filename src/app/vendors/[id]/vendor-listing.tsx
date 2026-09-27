import Link from "next/link";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Vendor, VendorFaq, Wedding } from "@/lib/supabase/types";
import { ChevronDownIcon } from "@/components/icons";
import { PhotoGallery } from "@/components/photo-gallery";
import { VendorDetailClient } from "./vendor-detail-client";

/**
 * One vendor's listing: the full page at /vendors/[id] and the panel that
 * opens over the vendor search both render this, so they can't drift apart.
 * Same shape as the venue listing (../../venues/[id]/venue-listing.tsx).
 */

export type VendorListingData = {
  vendor: Vendor;
  wedding: Wedding | null;
  isFavorited: boolean;
  faqs: VendorFaq[];
  similarVendors: Vendor[];
};

export async function loadVendorListing(
  supabase: SupabaseClient,
  userId: string,
  id: string,
): Promise<VendorListingData | null> {
  const { data: vendor } = await supabase
    .from("vendors")
    .select("*")
    .eq("id", id)
    .eq("active", true)
    .maybeSingle<Vendor>();
  if (!vendor) return null;

  const [{ data: wedding }, { data: faqs }, { data: similarVendors }] = await Promise.all([
    supabase
      .from("weddings")
      .select("*")
      .or(`user_id.eq.${userId},partner_user_id.eq.${userId}`)
      .maybeSingle<Wedding>(),
    supabase.from("vendor_faqs").select("*").eq("vendor_id", vendor.id).order("sort_order").returns<VendorFaq[]>(),
    vendor.category
      ? supabase
          .from("vendors")
          .select("*")
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
    wedding: wedding ?? null,
    isFavorited: Boolean(favorite),
    faqs: faqs ?? [],
    similarVendors: similarVendors ?? [],
  };
}

const card = "rounded-lg border border-hairline bg-card p-6 shadow-sm";

export function VendorListing({ data }: { data: VendorListingData }) {
  const { vendor, wedding, isFavorited, faqs, similarVendors } = data;
  const photos = vendor.image_url ? [vendor.image_url] : [];

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
          {vendor.is_sample && <p className="mt-1 text-[10px] uppercase tracking-wide text-ink/40">Sample listing</p>}
          {vendor.description && <p className="mt-4 text-ink/80">{vendor.description}</p>}
        </div>

        <aside className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <div className="lg:sticky lg:top-16">
            {wedding ? (
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

          {faqs.length > 0 && (
            <div className={card}>
              <h2 className="font-display text-xl font-semibold text-forest">Frequently asked questions</h2>
              <div className="mt-2">
                {faqs.map((faq) => (
                  <details key={faq.id} className="group border-b border-hairline py-3 last:border-b-0">
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

          {similarVendors.length > 0 && (
            <div>
              <h2 className="font-display text-xl font-semibold text-forest">
                More {vendor.category?.toLowerCase() ?? "vendors"} like this
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {similarVendors.map((v) => (
                  <Link
                    key={v.id}
                    href={`/vendors/${v.id}`}
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
