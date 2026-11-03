"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import type { PublicWedding } from "@/lib/supabase/types";
import { bannerPhoto } from "@/lib/site-design";
import { SiteText } from "@/components/site-text";
import { useSiteDesign, useTextEditing } from "@/components/guest-site-theme";

// MapLibre is heavy and browser-only; it loads after the words.
const VenueMap = dynamic(() => import("./venue-map").then((m) => m.VenueMap), { ssr: false });

/**
 * Where the wedding is: the venue's own photos, its write-up and the way
 * there. A couple who picks a venue gets this without writing a word.
 *
 * Two arrangements: on a phone the words, the map, then the photos as a
 * row you swipe; from lg up the photos make a spread to the left of the
 * words, with the map under the words. A venue with no photos gives the
 * map that column instead (it would otherwise sit empty).
 */
export function VenueView({ wedding, card }: { wedding: PublicWedding; card: string }) {
  const own = useSiteDesign().text;
  const ownPlace = own["venue.place"]?.text;
  const ownAbout = own["venue.about"]?.text;
  const { editable } = useTextEditing();
  const banner = bannerPhoto(wedding);
  // The cover already fills the banner when the couple has no photo of
  // their own, so it isn't shown twice.
  const photos = (wedding.venue_photo_urls ?? []).filter((url) => url !== banner).slice(0, 5);
  const place = [wedding.venue_city, wedding.venue_state].filter(Boolean).join(", ");
  const where = wedding.venue_address
    ? [wedding.venue_name, wedding.venue_address, place].filter(Boolean).join(", ")
    : [wedding.venue_name, place].filter(Boolean).join(", ");
  const directions = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(where)}`;
  // Postgres numerics can arrive as strings.
  const lat = wedding.venue_latitude == null ? null : Number(wedding.venue_latitude);
  const lng = wedding.venue_longitude == null ? null : Number(wedding.venue_longitude);
  const map = (className: string) =>
    lat != null && lng != null ? (
      <VenueMap lat={lat} lng={lng} name={wedding.venue_name ?? "The venue"} directions={directions} className={className} />
    ) : null;
  const sideMap = photos.length === 0 && lat != null && lng != null;

  return (
    <div className={`${card} overflow-hidden`}>
      <div
        className={
          photos.length > 0
            ? "lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-8"
            : sideMap
              ? "lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-10"
              : ""
        }
      >
        <div>
          <SiteText slot="venue.title" className="font-display text-2xl font-semibold text-forest">
            Where we&apos;re celebrating
          </SiteText>
          <SiteText slot="venue.name" as="p" className="mt-4 font-display text-xl text-forest">
            {wedding.venue_name}
          </SiteText>
          {(place || ownPlace || editable) && (
            <SiteText slot="venue.place" as="p" className="mt-0.5 text-sm text-ink/60">
              {place || "Add the town"}
            </SiteText>
          )}
          {(wedding.venue_about || ownAbout || editable) && (
            <SiteText
              slot="venue.about"
              as="p"
              // The venue's own write-up can run long; words the couple wrote show in full.
              className={`mt-4 whitespace-pre-line text-ink/80 ${ownAbout ? "" : "line-clamp-6"}`}
            >
              {wedding.venue_about || "Add a few words about the venue"}
            </SiteText>
          )}
          <a
            href={directions}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-motion mt-6 inline-block rounded-md bg-forest px-4 py-2 text-sm font-medium text-parchment transition-colors hover:bg-forest/90"
          >
            Get directions
          </a>
          {(wedding.venue_photo_urls?.length ?? 0) > 0 && !wedding.venue_photos_own && (
            <p className="mt-4 text-xs text-ink/50">Photos courtesy of {wedding.venue_name}</p>
          )}
          {map(sideMap ? "mt-6 h-52 lg:hidden" : "mt-6 h-52 lg:h-56")}
        </div>
        {sideMap && map("hidden min-h-72 lg:block")}
        {photos.length > 0 && (
          <div className="lg:order-first">
            {/* Phone: swipe row running to the card edge. */}
            <div className="-mx-6 mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-2 lg:hidden">
              {photos.map((url) => (
                <Image
                  key={url}
                  src={url}
                  alt={wedding.venue_name ?? ""}
                  width={640}
                  height={480}
                  className="aspect-[4/3] w-[85%] shrink-0 snap-center rounded-lg object-cover"
                />
              ))}
            </div>
            {/* Computer: one large and the rest beside it. */}
            <div className="hidden grid-cols-2 gap-3 lg:grid">
              {photos.map((url, i) => (
                <Image
                  key={url}
                  src={url}
                  alt={wedding.venue_name ?? ""}
                  width={i === 0 ? 800 : 400}
                  height={i === 0 ? 600 : 300}
                  className={`w-full rounded-lg object-cover ${
                    i === 0 ? "col-span-2 aspect-[16/10]" : "aspect-[4/3]"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
