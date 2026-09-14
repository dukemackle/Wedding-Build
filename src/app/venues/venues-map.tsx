"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Image from "next/image";
import Link from "next/link";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { Venue } from "@/lib/supabase/types";
import { ShortlistButton } from "./venue-card-shared";

const VENUE_TYPE_IMAGES: Record<string, string> = {
  "Barn / Rustic": "/venue-types/barn-rustic.svg",
  "Ballroom / Hotel": "/venue-types/ballroom-hotel.svg",
  "Garden / Outdoor": "/venue-types/garden-outdoor.svg",
  "Beach / Waterfront": "/venue-types/beach-waterfront.svg",
  "Historic / Estate": "/venue-types/historic-estate.svg",
  "Restaurant / Vineyard": "/venue-types/restaurant-vineyard.svg",
};
const DEFAULT_VENUE_IMAGE = "/venue-types/historic-estate.svg";

const pinIcon = L.divIcon({
  className: "",
  html: `<div style="
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #1F3D2E;
    border: 2px solid #A9843C;
    box-shadow: 0 0 0 1px rgba(0,0,0,0.2);
  "></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const pinIconActive = L.divIcon({
  className: "",
  html: `<div style="
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #A9843C;
    border: 2px solid #1F3D2E;
    box-shadow: 0 0 0 3px rgba(169,132,60,0.25);
  "></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const CONTINENTAL_US_CENTER: [number, number] = [39.8, -98.6];

export function VenuesMap({
  venues,
  shortlistedIds,
  hoveredVenueId,
  onHoverVenue,
  center,
  zoom,
  heightClassName,
}: {
  venues: Venue[];
  shortlistedIds: Set<string>;
  hoveredVenueId?: string | null;
  onHoverVenue?: (venueId: string | null) => void;
  center?: [number, number];
  zoom?: number;
  heightClassName?: string;
}) {
  const pinned = venues.filter(
    (v): v is Venue & { latitude: number; longitude: number } =>
      v.latitude != null && v.longitude != null,
  );

  return (
    <div
      className={
        heightClassName ??
        "h-[360px] w-full overflow-hidden rounded-md border border-hairline lg:h-[640px]"
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
        {pinned.map((venue) => (
          <Marker
            key={venue.id}
            position={[venue.latitude, venue.longitude]}
            icon={hoveredVenueId === venue.id ? pinIconActive : pinIcon}
            eventHandlers={{
              mouseover: () => onHoverVenue?.(venue.id),
              mouseout: () => onHoverVenue?.(null),
            }}
          >
            <Popup minWidth={200}>
              <div className="w-[200px]">
                <Link href={`/venues/${venue.id}`} className="block">
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
                <div className="pb-1 pt-2">
                  <ShortlistButton
                    venueId={venue.id}
                    isShortlisted={shortlistedIds.has(venue.id)}
                  />
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
