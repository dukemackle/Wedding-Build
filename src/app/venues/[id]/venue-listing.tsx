import Image from "next/image";
import Link from "next/link";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Venue,
  VenueFaq,
  VenuePreferredVendor,
  VenueShortlistEntry,
  VenueSpace,
  Wedding,
} from "@/lib/supabase/types";
import { SERVICE_LEVELS } from "@/lib/wedding-options";
import { ChevronDownIcon } from "@/components/icons";
import { PhotoGallery } from "@/components/photo-gallery";
import { SignupPrompt } from "@/components/public-nav";
import { PUBLIC_VENUE_COLUMNS, isUuid, vendorHref, venueHref, verifiedLabel } from "@/lib/public-listings";
import { VenueDetailClient, VenueMapEmbed } from "./venue-detail-client";
import { VenueGoodToKnow, VenueKeyFacts, VenueSpaces } from "./listing-sections";

/**
 * One venue's listing: everything below the nav on /venues/[id], and the same
 * content inside the panel that opens over the search results. Both routes
 * load through `loadVenueListing` and render `VenueListing`, so the page and
 * the panel can't drift apart.
 */

export const VENUE_TYPE_IMAGES: Record<string, string> = {
  "Barn / Rustic": "/venue-types/barn-rustic.svg",
  "Ballroom / Hotel": "/venue-types/ballroom-hotel.svg",
  "Garden / Outdoor": "/venue-types/garden-outdoor.svg",
  "Beach / Waterfront": "/venue-types/beach-waterfront.svg",
  "Historic / Estate": "/venue-types/historic-estate.svg",
  "Restaurant / Vineyard": "/venue-types/restaurant-vineyard.svg",
};
const DEFAULT_VENUE_IMAGE = "/venue-types/historic-estate.svg";

export type VenueListingData = {
  venue: Venue;
  /** False for a logged-out visitor: no contact details, a signup prompt. */
  signedIn: boolean;
  wedding: Wedding | null;
  shortlistEntry: VenueShortlistEntry | null;
  faqs: VenueFaq[];
  spaces: VenueSpace[];
  preferredVendors: VenuePreferredVendor[];
  similarVenues: Venue[];
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

  const similarityFilters = [
    venue.venue_type ? `venue_type.eq.${venue.venue_type}` : null,
    venue.state ? `state.eq.${venue.state}` : null,
  ].filter((f): f is string => Boolean(f));

  const [{ data: wedding }, { data: faqs }, { data: spaces }, { data: preferredVendors }, { data: similarVenues }] =
    await Promise.all([
      userId
        ? supabase
            .from("weddings")
            .select("*")
            .or(`user_id.eq.${userId},partner_user_id.eq.${userId}`)
            .maybeSingle<Wedding>()
        : Promise.resolve({ data: null }),
      supabase.from("venue_faqs").select("*").eq("venue_id", venue.id).order("sort_order").returns<VenueFaq[]>(),
      supabase.from("venue_spaces").select("*").eq("venue_id", venue.id).order("sort_order").returns<VenueSpace[]>(),
      supabase
        .from("venue_preferred_vendors")
        .select("*")
        .eq("venue_id", venue.id)
        .order("sort_order")
        .returns<VenuePreferredVendor[]>(),
      similarityFilters.length
        ? supabase
            .from("venues")
            .select(columns)
            .eq("active", true)
            .eq("is_sample", false)
            .neq("id", venue.id)
            .or(similarityFilters.join(","))
            .limit(3)
            .returns<Venue[]>()
        : Promise.resolve({ data: [] as Venue[] }),
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
    preferredVendors: preferredVendors ?? [],
    similarVenues: similarVenues ?? [],
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
  return [(venue.venue_type && VENUE_TYPE_IMAGES[venue.venue_type]) || DEFAULT_VENUE_IMAGE];
}

const card = "rounded-lg border border-hairline bg-card p-6 shadow-sm";

export function VenueListing({ data }: { data: VenueListingData }) {
  const { venue, signedIn, wedding, shortlistEntry, faqs, spaces, preferredVendors, similarVenues } = data;

  const preferredByCategory = new Map<string, VenuePreferredVendor[]>();
  for (const v of preferredVendors) {
    preferredByCategory.set(v.category, [...(preferredByCategory.get(v.category) ?? []), v]);
  }

  return (
    <div>
      <PhotoGallery photos={photosOf(venue)} alt={venue.name} />

      {/* Header, then the action box, then the details. On a wide screen the
          box moves up beside the header and stays in view while the details
          scroll; on a phone it sits between them, right where the facts end. */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
        <div className="lg:col-start-1 lg:row-start-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h1 className="font-display text-3xl font-semibold text-forest">{venue.name}</h1>
            {venue.price_tier && (
              <span className="shrink-0 rounded-full border border-hairline px-3 py-1 text-sm text-brass">
                {venue.price_tier}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm uppercase tracking-wide text-ink/50">
            {[[venue.city, venue.state].filter(Boolean).join(", "), venue.setting, venue.venue_type]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {venue.address && <p className="mt-1 text-sm text-ink/60">{venue.address}</p>}
          {venue.is_sample && <p className="mt-1 text-[10px] uppercase tracking-wide text-ink/40">Sample listing</p>}
          {verifiedLabel(venue, "venue") && (
            <p className="mt-1 text-xs text-forest/80">✓ {verifiedLabel(venue, "venue")}</p>
          )}
          {venue.description && <p className="mt-4 text-ink/80">{venue.description}</p>}
          <VenueKeyFacts venue={venue} />
          <a
            href={directionsHref(venue)}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block text-sm text-brass hover:underline"
          >
            Get directions &rarr;
          </a>
        </div>

        <aside className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <div className="lg:sticky lg:top-16">
            {(venue.price_from != null || venue.service_level) && (
              <div className="mb-3 rounded-lg border border-hairline bg-card px-5 py-4 shadow-sm">
                {venue.price_from != null ? (
                  <p className="font-display text-2xl font-semibold text-forest">
                    From ${venue.price_from.toLocaleString()}
                  </p>
                ) : null}
                <p className="text-sm text-ink/60">
                  {[venue.price_note, venue.service_level && SERVICE_LEVELS[venue.service_level]]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
            )}
            {!signedIn ? (
              <SignupPrompt noun="venue" next={venueHref(venue)} website={venue.website} />
            ) : wedding ? (
              <VenueDetailClient
                venue={venue}
                isShortlisted={Boolean(shortlistEntry)}
                isBooked={wedding.venue_id === venue.id}
                shortlistEntry={shortlistEntry}
              />
            ) : (
              <div className={`${card} text-sm text-ink/70`}>
                <Link href="/dashboard" className="text-brass hover:underline">
                  Set up your wedding
                </Link>{" "}
                to save venues and contact them.
              </div>
            )}
          </div>
        </aside>

        <div className="flex min-w-0 flex-col gap-6 lg:col-start-1 lg:row-start-2">
          {(venue.about || venue.included || venue.amenities.length > 0) && (
            <div className={card}>
              {venue.about && (
                <>
                  <h2 className="font-display text-xl font-semibold text-forest">About this venue</h2>
                  <p className="mt-2 whitespace-pre-line text-ink/80">{venue.about}</p>
                </>
              )}
              {venue.included && (
                <div className={venue.about ? "mt-6 border-t border-hairline pt-6" : ""}>
                  <h2 className="font-display text-xl font-semibold text-forest">What&apos;s included</h2>
                  <p className="mt-2 whitespace-pre-line text-ink/80">{venue.included}</p>
                </div>
              )}
              {venue.amenities.length > 0 && (
                <div className={venue.about || venue.included ? "mt-6 border-t border-hairline pt-6" : ""}>
                  <h2 className="font-display text-xl font-semibold text-forest">Amenities</h2>
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
            </div>
          )}

          {venue.good_to_know && (
            <div className={card}>
              <h2 className="font-display text-xl font-semibold text-forest">Good to know</h2>
              <p className="mt-2 whitespace-pre-line text-ink/80">{venue.good_to_know}</p>
            </div>
          )}

          <VenueSpaces spaces={spaces} />

          {preferredByCategory.size > 0 && (
            <div className={card}>
              <h2 className="font-display text-xl font-semibold text-forest">Preferred vendors</h2>
              <p className="mt-1 text-sm text-ink/60">
                Vendors {venue.name} recommends and who know their way around the property.
              </p>
              <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                {[...preferredByCategory].map(([category, list]) => (
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
                            <a
                              href={v.website}
                              target="_blank"
                              rel="noopener noreferrer nofollow"
                              className="text-ink hover:text-brass"
                            >
                              {v.name} <span className="text-ink/40">↗</span>
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
            </div>
          )}

          <VenueGoodToKnow venue={venue} />

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

          {venue.latitude != null && venue.longitude != null && (
            <VenueMapEmbed
              venue={venue as Venue & { latitude: number; longitude: number }}
              isShortlisted={Boolean(shortlistEntry)}
              signedIn={signedIn}
            />
          )}

          {similarVenues.length > 0 && (
            <div>
              <h2 className="font-display text-xl font-semibold text-forest">More venues like this</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {similarVenues.map((v) => (
                  <Link
                    key={v.id}
                    href={venueHref(v)}
                    className="flex flex-col overflow-hidden rounded-lg border border-hairline bg-card transition-colors hover:border-forest"
                  >
                    <Image
                      src={v.image_url || (v.venue_type && VENUE_TYPE_IMAGES[v.venue_type]) || DEFAULT_VENUE_IMAGE}
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
        </div>
      </div>
    </div>
  );
}
