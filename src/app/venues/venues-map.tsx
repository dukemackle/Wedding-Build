"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { FitToPins } from "@/components/map-fit-bounds";
import { ClusteredMarkers, dotIcon } from "@/components/clustered-markers";
import type { MapView } from "@/lib/map-view";
import type { Venue } from "@/lib/supabase/types";
import { ShortlistButton } from "./venue-card-shared";
import { venueHref } from "@/lib/public-listings";

const VENUE_TYPE_IMAGES: Record<string, string> = {
  "Barn / Rustic": "/venue-types/barn-rustic.svg",
  "Ballroom / Hotel": "/venue-types/ballroom-hotel.svg",
  "Garden / Outdoor": "/venue-types/garden-outdoor.svg",
  "Beach / Waterfront": "/venue-types/beach-waterfront.svg",
  "Historic / Estate": "/venue-types/historic-estate.svg",
  "Restaurant / Vineyard": "/venue-types/restaurant-vineyard.svg",
};
const DEFAULT_VENUE_IMAGE = "/venue-types/historic-estate.svg";

/**
 * Up close, pins carry the venue's capacity, the same number the card leads
 * with, so the map reads as the listings rather than as anonymous dots; further
 * out they group and shrink (see ClusteredMarkers). A venue with no capacity on
 * file is a plain dot at every zoom.
 */
const capacityIcons = new Map<string, L.DivIcon>();

function capacityIcon(
  capacity: number | null,
  active: boolean,
  shortlisted: boolean,
  labelled: boolean,
) {
  const background = shortlisted ? "#E0A100" : active ? "#E0A100" : "#14203D";
  if (capacity == null || !labelled) return dotIcon(background, active);

  const key = `${capacity}:${background}:${active}`;
  const cached = capacityIcons.get(key);
  if (cached) return cached;
  const scale = active ? "transform:scale(1.12);" : "";

  const label = String(capacity);
  // Roughly 7px a digit plus the padding, so the anchor lands on the middle.
  const width = 22 + label.length * 7;
  const icon = L.divIcon({
    className: "",
    html: `<div style="
      display:flex;align-items:center;justify-content:center;
      height:26px;padding:0 9px;border-radius:13px;
      background:${background};border:2px solid #fff;
      box-shadow:0 1px 5px rgba(0,0,0,.32);
      color:#fff;font:700 12px ui-sans-serif,system-ui,sans-serif;
      white-space:nowrap;${scale}
    ">${label}</div>`,
    iconSize: [width, 26],
    iconAnchor: [width / 2, 13],
  });
  capacityIcons.set(key, icon);
  return icon;
}

const CONTINENTAL_US_CENTER: [number, number] = [39.8, -98.6];

export function VenuesMap({
  venues,
  shortlistedIds,
  hoveredVenueId,
  onHoverVenue,
  onViewChange,
  center,
  zoom,
  heightClassName,
  signedIn = true,
}: {
  venues: Venue[];
  shortlistedIds: Set<string>;
  hoveredVenueId?: string | null;
  onHoverVenue?: (venueId: string | null) => void;
  onViewChange?: (view: MapView) => void;
  center?: [number, number];
  zoom?: number;
  heightClassName?: string;
  /** False for a logged-out visitor: the popup has no save button. */
  signedIn?: boolean;
}) {
  const pinned = useMemo(
    () =>
      venues.filter(
        (v): v is Venue & { latitude: number; longitude: number } =>
          v.latitude != null && v.longitude != null,
      ),
    [venues],
  );
  const points = useMemo(
    () => pinned.map((p) => [p.latitude, p.longitude] as [number, number]),
    [pinned],
  );

  return (
    <div
      className={
        heightClassName ?? "h-[360px] w-full overflow-hidden rounded-md border border-hairline"
      }
    >
      <MapContainer
        center={center ?? CONTINENTAL_US_CENTER}
        zoom={zoom ?? 4}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitToPins points={points} />
        <ClusteredMarkers
          items={pinned}
          onViewChange={onViewChange}
          renderPin={(venue, labelled) => (
          <Marker
            key={venue.id}
            position={[venue.latitude, venue.longitude]}
            icon={capacityIcon(
              venue.capacity,
              hoveredVenueId === venue.id,
              shortlistedIds.has(venue.id),
              labelled,
            )}
            eventHandlers={{
              mouseover: () => onHoverVenue?.(venue.id),
              mouseout: () => onHoverVenue?.(null),
            }}
          >
            <Popup minWidth={200}>
              <div className="w-[200px]">
                <Link href={venueHref(venue)} className="block">
                  <Image
                    src={
                      venue.image_url ||
                      (venue.venue_type && VENUE_TYPE_IMAGES[venue.venue_type]) ||
                      DEFAULT_VENUE_IMAGE
                    }
                    alt={venue.venue_type ? `${venue.venue_type} illustration` : "Venue illustration"}
                    width={200}
                    height={125}
                    className="aspect-[8/5] w-full rounded-md border border-hairline object-cover"
                  />
                  <div className="pt-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-forest">{venue.name}</p>
                      {venue.price_tier && (
                        <span className="shrink-0 rounded-full border border-hairline px-2 py-0.5 text-[11px] text-brass">
                          {venue.price_tier}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-ink/60">
                      {[venue.city, venue.state].filter(Boolean).join(", ")}
                    </p>
                    <p className="mt-1 text-xs text-ink/70">
                      {[venue.setting, venue.venue_type].filter(Boolean).join(" · ")}
                    </p>
                    {venue.capacity && (
                      <p className="text-xs text-ink/70">Up to {venue.capacity} guests</p>
                    )}
                    {venue.is_sample && (
                      <p className="mt-1 text-[10px] uppercase tracking-wide text-ink/40">
                        Sample listing
                      </p>
                    )}
                    <p className="mt-1.5 text-xs font-medium text-brass">View details &rarr;</p>
                  </div>
                </Link>
                {signedIn && (
                  <div className="pb-1 pt-2">
                    <ShortlistButton
                      venueId={venue.id}
                      isShortlisted={shortlistedIds.has(venue.id)}
                    />
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
          )}
        />
      </MapContainer>
    </div>
  );
}
