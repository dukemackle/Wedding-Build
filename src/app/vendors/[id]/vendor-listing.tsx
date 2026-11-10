import Link from "next/link";
import { BookingFactsCard } from "@/components/booking-facts-card";
import {
  ContactPanel,
  IncludedChecklist,
  KeyStats,
  REPLY_SHORT,
  SocialLinks,
  ListingSectionNav,
  SectionHeading,
  listItems,
  listingCard as card,
} from "@/components/listing-parts";
import { ListingProse } from "@/components/listing-prose";
import { ESTIMATE_GUESTS } from "@/lib/area-comparison";
import { businessFactRows } from "@/lib/business-facts";
import { ReportListing } from "@/components/report-listing";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Vendor, VendorFaq, Wedding } from "@/lib/supabase/types";
import { VENDOR_PRICE_UNITS } from "@/lib/wedding-options";
import { ChevronDownIcon } from "@/components/icons";
import { PhotoGallery } from "@/components/photo-gallery";
import { ListingDesktopActions, ListingPhoneBar } from "@/components/listing-actions";
import { VendorFavoriteButton } from "../vendor-card-shared";
import { SignupHeart, SignupPrompt } from "@/components/public-nav";
import type { SignupIntent } from "@/lib/signup-intent";
import { SetupFirst } from "@/components/setup-first";
import {
  PUBLIC_VENDOR_COLUMNS,
  isBasicListing,
  isUnclaimedListing,
  isUuid,
  vendorHref,
  verifiedLabel,
} from "@/lib/public-listings";
import { nearestListings } from "@/lib/listing-seo";
import { vendorAreaComparison, type AreaComparison } from "@/lib/area-comparison";
import { AreaComparisonCard } from "@/components/area-comparison";
import { UnclaimedNote } from "@/components/unclaimed-note";
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
  /** "Compared with the Austin area" (src/lib/area-comparison.ts). */
  comparison: AreaComparison | null;
  /** The claim form's preview: nothing that reports, tracks or links away, FAQs open. */
  preview?: boolean;
  /** What they tapped before signing up, to finish now (signup-sheet.tsx). */
  then?: SignupIntent;
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

  const [{ data: wedding }, { data: faqs }, similarVendors, comparison] = await Promise.all([
    userId
      ? supabase
          .from("weddings")
          .select("*")
          .or(`user_id.eq.${userId},member_ids.cs.{${userId}}`)
          .maybeSingle<Wedding>()
      : Promise.resolve({ data: null }),
    supabase.from("vendor_faqs").select("*").eq("vendor_id", vendor.id).order("sort_order").returns<VendorFaq[]>(),
    // The nearest of the same kind, so each listing links to its own
    // neighbours (src/lib/listing-seo.ts).
    vendor.category
      ? nearestListings<Vendor>(supabase, "vendors", vendor, columns, 3, { category: vendor.category })
      : Promise.resolve([] as Vendor[]),
    vendorAreaComparison(supabase, vendor),
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
    similarVendors,
    comparison,
  };
}

export function VendorListing({ data }: { data: VendorListingData }) {
  const { vendor, signedIn, wedding, isFavorited, faqs, similarVendors, comparison, preview, then } = data;
  // Cover first, no repeats.
  const photos = [...new Set([vendor.image_url, ...vendor.photo_urls].filter((u): u is string => Boolean(u)))];
  const links = [
    ["Website", vendor.website],
    ["Instagram", vendor.instagram_url],
    ["Facebook", vendor.facebook_url],
    ["Pinterest", vendor.pinterest_url],
  ].filter((l): l is [string, string] => Boolean(l[1]));
  const included = listItems(vendor.included);
  const years = vendor.founded_year ? new Date().getFullYear() - vendor.founded_year : 0;
  const stats = [
    years > 0 && { value: String(years), label: years === 1 ? "year in business" : "years in business" },
    vendor.weddings_per_year && { value: `~${vendor.weddings_per_year}`, label: "weddings a year" },
    vendor.booking_lead_months != null &&
      vendor.booking_lead_months > 0 && { value: `${vendor.booking_lead_months} mo`, label: "booked ahead" },
    vendor.reply_time && { value: REPLY_SHORT[vendor.reply_time], label: "to reply" },
  ].filter((s): s is { value: string; label: string } => Boolean(s));
  const hasPolicies = businessFactRows(vendor).length > 0 || Boolean(vendor.cancellation_policy);
  const sections = (
    [
      ["about", "About", Boolean(vendor.about || vendor.included || vendor.amenities.length > 0)],
      ["included", "What's included", Boolean(vendor.included)],
      ["policies", "Policies", hasPolicies],
      ["compare", "Compare", Boolean(comparison && !preview)],
      ["faq", "FAQ", faqs.length > 0],
    ] as [string, string, boolean][]
  )
    .filter(([, , has]) => has)
    .map(([id, label]): [string, string] => [id, label]);
  // "From $165 per guest" is about $16,500 for the estimator's 100 guests.
  const ownEstimate =
    vendor.price_from == null
      ? null
      : vendor.price_unit === "guest"
        ? { total: vendor.price_from * ESTIMATE_GUESTS, how: `At $${vendor.price_from.toLocaleString()} a guest` }
        : vendor.price_unit === "event"
          ? { total: vendor.price_from, how: "From its starting price" }
          : null;

  const heart = (glass: boolean) =>
    !signedIn ? (
      <SignupHeart name={vendor.name} next={vendorHref(vendor)} />
    ) : wedding ? (
      <VendorFavoriteButton vendorId={vendor.id} isFavorited={isFavorited} glass={glass} />
    ) : undefined;
  const actions = {
    name: vendor.name,
    href: vendorHref(vendor),
    fallbackHref: "/vendors",
    contactId: "listing-contact",
  };

  return (
    <div>
      <ListingPhoneBar {...actions} save={heart(true)} overPhoto={photos.length > 0} />
      <PhotoGallery photos={photos} alt={vendor.name} />

      <div className={`${photos.length ? "mt-6" : ""} grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10`}>
        <div className="lg:col-start-1 lg:row-start-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h1 className="font-display text-3xl font-semibold text-forest">{vendor.name}</h1>
            <div className="flex shrink-0 items-center gap-2">
              {vendor.price_tier && (
                <span className="shrink-0 rounded-full border border-hairline px-3 py-1 text-sm text-brass">
                  {vendor.price_tier}
                </span>
              )}
              <ListingDesktopActions {...actions} save={heart(false)} />
            </div>
          </div>
          <p className="mt-1 text-sm uppercase tracking-wide text-ink/50">
            {[[vendor.city, vendor.state].filter(Boolean).join(", "), vendor.category].filter(Boolean).join(" · ")}
          </p>
          {vendor.service_area && <p className="mt-1 text-sm text-ink/60">Serves {vendor.service_area}</p>}
          {vendor.is_sample && <p className="mt-1 text-[10px] uppercase tracking-wide text-ink/40">Sample listing</p>}
          {verifiedLabel(vendor, "vendor") && (
            <p className="mt-1 text-xs text-forest/80">✓ {verifiedLabel(vendor, "vendor")}</p>
          )}
          {isUnclaimedListing(vendor) ? (
            <UnclaimedNote name={vendor.name} />
          ) : (
            isBasicListing(vendor) && (
              <p className="mt-2 text-sm text-ink/60">
                <Link href="/list/edit" className="underline hover:text-forest">
                  Is this your business? Add your details
                </Link>
              </p>
            )
          )}
          {vendor.description && <p className="mt-4 text-ink/80">{vendor.description}</p>}
          <KeyStats stats={stats} />
          <SocialLinks listingType="vendor" listingId={vendor.id} links={links} className="mt-5" />
        </div>

        <aside id="listing-contact" className="scroll-mt-16 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <div className="lg:sticky lg:top-16">
            <ContactPanel
              listingType="vendor"
              listingId={vendor.id}
              website={vendor.website}
              phone={signedIn ? vendor.contact_phone : null}
              price={
                vendor.price_from != null && (
                  <>
                    <p className="font-display text-3xl font-semibold text-forest">
                      From ${vendor.price_from.toLocaleString()}
                      {vendor.price_unit && (
                        <span className="ml-1.5 font-body text-base font-normal text-ink/60">
                          {VENDOR_PRICE_UNITS[vendor.price_unit]}
                        </span>
                      )}
                    </p>
                    {vendor.price_note && <p className="mt-1 text-sm text-ink/60">{vendor.price_note}</p>}
                    <p className="mt-2 text-xs text-ink/50">Prices change. Confirm with the vendor before you book.</p>
                  </>
                )
              }
            >
              {!signedIn ? (
                <SignupPrompt noun="vendor" name={vendor.name} next={vendorHref(vendor)} />
              ) : wedding ? (
                <VendorDetailClient vendor={vendor} isFavorited={isFavorited} then={then} />
              ) : (
                <SetupFirst name={vendor.name} href={vendorHref(vendor)} then={then} noun="vendors" />
              )}
            </ContactPanel>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col gap-6 lg:col-start-1 lg:row-start-2">
          <ListingSectionNav sections={sections} />
          {(vendor.about || vendor.included || vendor.amenities.length > 0) && (
            <section id="about" className={card}>
              {vendor.about && (
                <>
                  <SectionHeading eyebrow="Overview" title="About this vendor" />
                  <ListingProse text={vendor.about} open={preview} />
                </>
              )}
              {vendor.included && (
                <div id="included" className={`scroll-mt-24 ${vendor.about ? "mt-8 border-t border-hairline pt-8" : ""}`}>
                  <SectionHeading eyebrow="The package" title="What's included" />
                  {included ? (
                    <IncludedChecklist items={included} />
                  ) : (
                    <p className="mt-4 max-w-prose whitespace-pre-line leading-relaxed text-ink/75">{vendor.included}</p>
                  )}
                </div>
              )}
              {vendor.amenities.length > 0 && (
                <div className={vendor.about || vendor.included ? "mt-8 border-t border-hairline pt-8" : ""}>
                  <SectionHeading eyebrow="Extras" title="Services & extras" />
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
            </section>
          )}

          {vendor.good_to_know && (
            <section className={card}>
              <SectionHeading eyebrow="Details" title="Good to know" />
              <ListingProse text={vendor.good_to_know} open={preview} />
            </section>
          )}

          <BookingFactsCard facts={vendor} />

          {comparison && !preview && <AreaComparisonCard data={comparison} kind="vendor" ownEstimate={ownEstimate} />}

          {faqs.length > 0 && (
            <section id="faq" className={card}>
              <SectionHeading eyebrow="Questions" title="Frequently asked questions" />
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
            </section>
          )}

          {similarVendors.length > 0 && !preview && (
            <div>
              <SectionHeading eyebrow="Keep looking" title={`More ${vendor.category?.toLowerCase() ?? "vendors"} nearby`} />
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

          {/* At the foot of the page rather than beside the name (see venue-listing.tsx). */}
          {!vendor.is_sample && !preview && <ReportListing listingType="vendor" listingId={vendor.id} />}
        </div>
      </div>
    </div>
  );
}
