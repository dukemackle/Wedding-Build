"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { Venue } from "@/lib/supabase/types";
import { ShortlistButton } from "./venue-card-shared";

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
}: {
  venues: Venue[];
  shortlistedIds: Set<string>;
  hoveredVenueId?: string | null;
  onHoverVenue?: (venueId: string | null) => void;
}) {
  const pinned = venues.filter(
    (v): v is Venue & { latitude: number; longitude: number } =>
      v.latitude != null && v.longitude != null,
  );

  return (
    <div className="h-[360px] w-full overflow-hidden rounded-md border border-hairline lg:h-[640px]">
      <MapContainer
        center={CONTINENTAL_US_CENTER}
        zoom={4}
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
            <Popup>
              <div className="min-w-[180px]">
                <p className="font-semibold text-forest">{venue.name}</p>
                <p className="text-xs text-ink/60">
                  {[venue.city, venue.state].filter(Boolean).join(", ")}
                </p>
                <p className="mt-1 text-xs text-ink/70">
                  {[venue.venue_type, venue.price_tier].filter(Boolean).join(" · ")}
                </p>
                {venue.capacity && (
                  <p className="text-xs text-ink/70">Up to {venue.capacity} guests</p>
                )}
                <div className="mt-2">
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
