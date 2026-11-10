import Image from "next/image";
import Link from "next/link";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Venue,
  VenueFaq,
  VenuePreferredVendor,
  VenueShortlistEntry,
  VenueSpace,
  VenueSpacePlan,
  Wedding,
} from "@/lib/supabase/types";
import { ALCOHOL_POLICIES, SERVICE_LEVELS, venueTypeImage } from "@/lib/wedding-options";
import { ArrowUpRightIcon, ChevronDownIcon } from "@/components/icons";
import { PhotoGallery } from "@/components/photo-gallery";
import { ListingDesktopActions, ListingPhoneBar } from "@/components/listing-actions";
import { ShortlistButton } from "../venue-card-shared";
import { SignupHeart } from "@/components/public-nav";
import { SignupPrompt } from "@/components/public-nav";
import type { SignupIntent } from "@/lib/signup-intent";
import { SetupFirst } from "@/components/setup-first";
import { ReportListing } from "@/components/report-listing";
import { ConfirmedChip, ConfirmedMark } from "@/components/confirmed-badge";
import { UnclaimedNote } from "@/components/unclaimed-note";
import {
  PUBLIC_VENUE_COLUMNS,
  confirmedByOwner,
  isUuid,
  vendorHref,
  venueHref,
  verifiedLabel,
  isUnclaimedListing,
} from "@/lib/public-listings";
import { VenueDetailClient, VenueMapEmbed } from "./venue-detail-client";
import { VenueGoodToKnow, venueLinks, VenueKeyFacts, VenueSpaces } from "./listing-sections";
import { BookingFactsCard } from "@/components/booking-facts-card";
import {
  ContactPanel,
  IncludedChecklist,
  SocialLinks,
  ListingSectionNav,
  SectionHeading,
  listItems,
  listingCard as card,
} from "@/components/listing-parts";
import { ListingProse } from "@/components/listing-prose";
import { businessFactRows } from "@/lib/business-facts";
import { nearestListings } from "@/lib/listing-seo";
import { venueAreaComparison, type AreaComparison } from "@/lib/area-comparison";
import { AreaComparisonCard } from "@/components/area-comparison";
import { priceCheckedNote, priceHeadline, priceOptionAmount } from "@/lib/venue-pricing";

/**
 * One venue's listing: everything below the nav on /venues/[id], and the same
 * content inside the panel that opens over the search results. Both routes
 * load through `loadVenueListing` and render `VenueListing`, so the page and
 * the panel can't drift apart.
 */

export type VenueListingData = {
  venue: Venue;
  /** False for a logged-out visitor: no contact details, a signup prompt. */
  signedIn: boolean;
  wedding: Wedding | null;
  shortlistEntry: VenueShortlistEntry | null;
  faqs: VenueFaq[];
  spaces: VenueSpace[];
  /** Published floor plans, by space ("Design my wedding here"). */
  plans?: VenueSpacePlan[];
  preferredVendors: VenuePreferredVendor[];
  similarVenues: Venue[];
  /** "Compared with the Austin area" (src/lib/area-comparison.ts). */
  comparison: AreaComparison | null;
  /** The claim form's preview: nothing that reports, tracks or links away, FAQs open. */
  preview?: boolean;
  /** What they tapped before signing up, to finish now (signup-sheet.tsx). */
  then?: SignupIntent;
};

export async function loadVenueListing(
  supabase: SupabaseClient,
  userId: string | null,
  idOrSlug: string,
): Promise<VenueListingData | null> {
  // Logged out, the anon role can only read the public columns (0091).
  const columns = userId ? "*" : PUBLIC_VENUE_COLUMNS;
  const { data: venue } = await supabase
    .from("venues")
    .select(columns)
    .eq(isUuid(idOrSlug) ? "id" : "slug", idOrSlug)
    .eq("active", true)
    .maybeSingle<Venue>();
  if (!venue) return null;

  const [{ data: wedding }, { data: faqs }, { data: spaces }, { data: plans }, { data: preferredVendors }, similarVenues, comparison] =
    await Promise.all([
      userId
        ? supabase
            .from("weddings")
            .select("*")
            .or(`user_id.eq.${userId},member_ids.cs.{${userId}}`)
            .maybeSingle<Wedding>()
        : Promise.resolve({ data: null }),
      supabase.from("venue_faqs").select("*").eq("venue_id", venue.id).order("sort_order").returns<VenueFaq[]>(),
      supabase.from("venue_spaces").select("*").eq("venue_id", venue.id).order("sort_order").returns<VenueSpace[]>(),
      // RLS returns published plans only.
      supabase.from("venue_space_plans").select("*").eq("venue_id", venue.id).returns<VenueSpacePlan[]>(),
      supabase
        .from("venue_preferred_vendors")
        .select("*")
        .eq("venue_id", venue.id)
        .order("sort_order")
        .returns<VenuePreferredVendor[]>(),
      // The nearest venues, so each listing links to its own neighbours
      // (src/lib/listing-seo.ts).
      nearestListings<Venue>(supabase, "venues", venue, columns, 3),
      venueAreaComparison(supabase, venue),
    ]);

  const { data: shortlistEntry } = wedding
    ? await supabase
        .from("venue_shortlist")
        .select("*")
        .eq("wedding_id", wedding.id)
        .eq("venue_id", venue.id)
        .maybeSingle<VenueShortlistEntry>()
    : { data: null };

  return {
    venue,
    signedIn: Boolean(userId),
    wedding: wedding ?? null,
    shortlistEntry: shortlistEntry ?? null,
    faqs: faqs ?? [],
    spaces: spaces ?? [],
    plans: plans ?? [],
    preferredVendors: preferredVendors ?? [],
    similarVenues,
    comparison,
  };
}

function directionsHref(venue: Venue): string {
  if (venue.latitude != null && venue.longitude != null) {
    return `https://www.google.com/maps/search/?api=1&query=${venue.latitude},${venue.longitude}`;
  }
  const query = [venue.name, venue.address, venue.city, venue.state].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Cover first, no repeats; the type illustration when a venue has no photos. */
function photosOf(venue: Venue): string[] {
  const photos = [...new Set([venue.image_url, ...venue.photo_urls].filter((u): u is string => Boolean(u)))];
  if (photos.length > 0) return photos;
  return [venueTypeImage(venue.venue_type)];
}

export function VenueListing({ data }: { data: VenueListingData }) {
  const { venue, signedIn, wedding, shortlistEntry, faqs, spaces, plans = [], preferredVendors, similarVenues, comparison, preview, then } = data;

  // "Must book from these" and "we recommend these" change a couple's budget
  // very differently, so they're shown apart, required first.
  const requiredVendors = preferredVendors.filter((v) => v.required);
  const recommendedVendors = preferredVendors.filter((v) => !v.required);
  // Rows from before 0097 have none of these, so default them.
  const price = priceHeadline({ price_from: venue.price_from, price_basis: venue.price_basis ?? null });
  const priceOptions = venue.price_basis === "ask" ? [] : (venue.price_options ?? []);
  // A pasted bullet list in the free text joins the checklist rather than showing its "•"s.
  const includedText = listItems(venue.included);
  const includedItems = [...(venue.included_items ?? []), ...(includedText ?? [])];
  const includedProse = includedText ? null : venue.included;
  const hasIncluded = includedItems.length > 0 || Boolean(venue.included);
  const links = venueLinks(venue);
  const hasPolicies =
    businessFactRows(venue).length > 0 ||
    Boolean(venue.cancellation_policy || venue.music_until || venue.alcohol_policy || venue.rain_plan);
  const sections = (
    [
      ["about", "About", Boolean(venue.about || hasIncluded || venue.amenities.length > 0)],
      ["included", "What's included", hasIncluded],
      ["policies", "Policies", hasPolicies],
      ["spaces", "Spaces", spaces.length > 0],
      ["compare", "Compare", Boolean(comparison && !preview)],
      ["faq", "FAQ", faqs.length > 0],
    ] as [string, string, boolean][]
  )
    .filter(([, , has]) => has)
    .map(([id, label]): [string, string] => [id, label]);

  const photos = photosOf(venue);
  const isShortlisted = Boolean(shortlistEntry);
  const heart = (glass: boolean) =>
    !signedIn ? (
      <SignupHeart name={venue.name} next={venueHref(venue)} />
    ) : wedding ? (
      <ShortlistButton venueId={venue.id} isShortlisted={isShortlisted} glass={glass} />
    ) : undefined;
  const actions = {
    name: venue.name,
    href: venueHref(venue),
    fallbackHref: "/venues",
    directions: directionsHref(venue),
    contactId: "listing-contact",
    contactLabel: "Request info",
  };

  return (
    <div>
      <ListingPhoneBar {...actions} save={heart(true)} overPhoto={photos.length > 0} />
      <PhotoGallery photos={photos} alt={venue.name} />

      {/* Header, then the action box, then the details. On a wide screen the
          box moves up beside the header and stays in view while the details
          scroll; on a phone it sits between them, right where the facts end. */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
        <div className="lg:col-start-1 lg:row-start-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h1 className="font-display text-3xl font-semibold text-forest">{venue.name}</h1>
            <div className="flex shrink-0 items-center gap-2">
              {venue.price_tier && !price && (
                <span className="shrink-0 rounded-full border border-hairline px-3 py-1 text-sm text-brass">
                  {venue.price_tier}
                </span>
              )}
              <ListingDesktopActions {...actions} save={heart(false)} />
            </div>
          </div>
          <p className="mt-1 text-sm uppercase tracking-wide text-ink/50">
            {[[venue.city, venue.state].filter(Boolean).join(", "), venue.setting, venue.venue_type]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {venue.address && <p className="mt-1 text-sm text-ink/60">{venue.address}</p>}
          {venue.is_sample && <p className="mt-1 text-[10px] uppercase tracking-wide text-ink/40">Sample listing</p>}
          {verifiedLabel(venue, "venue") &&
            (venue.source === "claimed" ? (
              <ConfirmedChip label={verifiedLabel(venue, "venue")!} className="mt-2" />
            ) : (
              <p className="mt-1 text-xs text-forest/80">✓ {verifiedLabel(venue, "venue")}</p>
            ))}
          {isUnclaimedListing(venue) && <UnclaimedNote name={venue.name} />}
          {venue.description && <p className="mt-4 text-ink/80">{venue.description}</p>}
          <VenueKeyFacts venue={venue} />
          <SocialLinks listingType="venue" listingId={venue.id} links={links} className="mt-5" />
        </div>

        <aside id="listing-contact" className="scroll-mt-16 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <div className="lg:sticky lg:top-16">
            <ContactPanel
              listingType="venue"
              listingId={venue.id}
              website={venue.website}
              phone={signedIn ? venue.contact_phone : null}
              directions={{
                href: directionsHref(venue),
                address: [venue.address, venue.city, venue.state].filter(Boolean).join(", ") || null,
              }}
              price={
                (price || venue.service_level) && (
                  <>
                    {price && (
                      <p className="font-display text-3xl font-semibold text-forest">
                        {price}
                        {confirmedByOwner(venue, "price_from") && <ConfirmedMark />}
                      </p>
                    )}
                    <p className="mt-1 text-sm text-ink/60">
                      {[venue.price_note, venue.service_level && SERVICE_LEVELS[venue.service_level]]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    {priceOptions.length > 0 && (
                      <dl className="mt-3 border-t border-hairline pt-2 text-sm">
                        {priceOptions.map((o) => (
                          <div key={o.label} className="flex justify-between gap-4 py-1">
                            <dt className="text-ink/70">{o.label}</dt>
                            <dd className="font-mono-numbers text-ink">{priceOptionAmount(o, venue.price_basis)}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                    {price && (
                      <p className="mt-2 text-xs text-ink/50">
                        {[priceCheckedNote(venue), "Prices change. Confirm with the venue before you book."].filter(Boolean).join(" ")}
                      </p>
                    )}
                  </>
                )
              }
            >
              {!signedIn ? (
                <SignupPrompt noun="venue" name={venue.name} next={venueHref(venue)} />
              ) : wedding ? (
                <VenueDetailClient
                  venue={venue}
                  isShortlisted={Boolean(shortlistEntry)}
                  isBooked={wedding.venue_id === venue.id}
                  shortlistEntry={shortlistEntry}
                  then={then}
                />
              ) : (
                <SetupFirst name={venue.name} href={venueHref(venue)} then={then} noun="venues" />
              )}
            </ContactPanel>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col gap-6 lg:col-start-1 lg:row-start-2">
          <ListingSectionNav sections={sections} />
          {(venue.about || hasIncluded || venue.amenities.length > 0) && (
            <section id="about" className={card}>
              {venue.about && (
                <>
                  <SectionHeading eyebrow="Overview" title="About this venue" />
                  <ListingProse text={venue.about} open={preview} />
                </>
              )}
              {hasIncluded && (
                <div id="included" className={`scroll-mt-24 ${venue.about ? "mt-8 border-t border-hairline pt-8" : ""}`}>
                  <SectionHeading eyebrow="The package" title="What's included" />
                  {includedItems.length > 0 && <IncludedChecklist items={includedItems} />}
                  {includedProse && (
                    <p className="mt-4 max-w-prose whitespace-pre-line leading-relaxed text-ink/75">{includedProse}</p>
                  )}
                </div>
              )}
              {venue.amenities.length > 0 && (
                <div className={venue.about || hasIncluded ? "mt-8 border-t border-hairline pt-8" : ""}>
                  <SectionHeading eyebrow="Extras" title="Amenities" />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {venue.amenities.map((amenity) => (
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

          {venue.good_to_know && (
            <section className={card}>
              <SectionHeading eyebrow="Details" title="Good to know" />
              <ListingProse text={venue.good_to_know} open={preview} />
            </section>
          )}

          <BookingFactsCard
            facts={venue}
            extraRows={[
              ["Music until", venue.music_until],
              ["Alcohol", venue.alcohol_policy && ALCOHOL_POLICIES[venue.alcohol_policy]],
            ]}
            extraNotes={[["If it rains", venue.rain_plan]]}
          />

          <VenueSpaces
            spaces={spaces}
            plans={preview ? [] : plans}
            design={{ venueId: venue.id, signedIn, hasWedding: Boolean(wedding), href: venueHref(venue) }}
          />

          {requiredVendors.length > 0 && (
            <div className={card}>
              <SectionHeading
                eyebrow="Vendor rules"
                title="Required vendors"
                sub={`For these, ${venue.name} asks couples to book from its list. Check prices with them early.`}
              />
              <VendorsByCategory vendors={requiredVendors} />
            </div>
          )}

          {recommendedVendors.length > 0 && (
            <div className={card}>
              <SectionHeading
                eyebrow="Their team"
                title="Preferred vendors"
                sub={`Vendors ${venue.name} recommends and who know their way around the property.`}
              />
              <VendorsByCategory vendors={recommendedVendors} />
            </div>
          )}

          <VenueGoodToKnow venue={venue} />

          {comparison && !preview && <AreaComparisonCard data={comparison} kind="venue" />}

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

          {venue.latitude != null && venue.longitude != null && (
            <VenueMapEmbed
              venue={venue as Venue & { latitude: number; longitude: number }}
              isShortlisted={Boolean(shortlistEntry)}
              signedIn={signedIn}
            />
          )}

          {similarVenues.length > 0 && !preview && (
            <div>
              <SectionHeading eyebrow="Keep looking" title="More venues nearby" />
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {similarVenues.map((v) => (
                  <Link
                    key={v.id}
                    href={venueHref(v)}
                    className="flex flex-col overflow-hidden rounded-lg border border-hairline bg-card transition-colors hover:border-forest"
                  >
                    <Image
                      src={v.image_url || venueTypeImage(v.venue_type)}
                      alt={v.name}
                      width={300}
                      height={225}
                      className="aspect-[4/3] w-full border-b border-hairline object-cover"
                    />
                    <div className="p-3">
                      <p className="font-display text-sm font-semibold text-forest">{v.name}</p>
                      <p className="mt-0.5 text-xs text-ink/50">{[v.city, v.state].filter(Boolean).join(", ")}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* At the foot of the page, not beside the name and verified badge:
              a doubt-raising link shouldn't be the first thing a couple reads. */}
          {!venue.is_sample && !preview && <ReportListing listingType="venue" listingId={venue.id} />}
        </div>
      </div>
    </div>
  );
}

function VendorsByCategory({ vendors }: { vendors: VenuePreferredVendor[] }) {
  const byCategory = new Map<string, VenuePreferredVendor[]>();
  for (const v of vendors) byCategory.set(v.category, [...(byCategory.get(v.category) ?? []), v]);
  return (
    <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
      {[...byCategory].map(([category, list]) => (
        <div key={category}>
          <p className="text-xs font-medium uppercase tracking-wide text-ink/50">{category}</p>
          <ul className="mt-1 space-y-1">
            {list.map((v) => (
              <li key={v.id}>
                {v.vendor_id ? (
                  <Link href={vendorHref({ id: v.vendor_id })} className="text-ink hover:text-brass">
                    {v.name} <span className="text-xs text-brass">on You Do, I Do</span>
                  </Link>
                ) : v.website ? (
                  <a href={v.website} target="_blank" rel="noopener noreferrer nofollow" className="text-ink hover:text-brass">
                    {v.name} <ArrowUpRightIcon className="inline h-3 w-3 text-ink/40" />
                  </a>
                ) : (
                  <span className="text-ink">{v.name}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
