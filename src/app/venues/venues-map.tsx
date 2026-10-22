"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { MapContainer, Marker, Popup } from "react-leaflet";
import { BaseMapLayer } from "@/components/base-map-layer";
import { FitToPins } from "@/components/map-fit-bounds";
import { ClusteredMarkers, dotIcon } from "@/components/clustered-markers";
import { MAP_MIN_ZOOM, US_MAP_BOUNDS, type MapView } from "@/lib/map-view";
import { ShortlistButton } from "./venue-card-shared";
import { venueHref, type VenueListing } from "@/lib/public-listings";
import { venueTypeImage } from "@/lib/wedding-options";
import { SAVED_ICON, venueTypeIconPaths } from "@/lib/venue-type-icons";

/**
 * Up close, every venue gets a badge pin: its category's icon in a gold disc,
 * then its capacity (the number the card leads with) when we have one, and a
 * tail that points at the spot. So the map reads as the listings rather than
 * as anonymous dots, and a couple can tell a barn from a ballroom at a glance.
 * Further out they group and shrink to rings (see ClusteredMarkers).
 */
const venueIcons = new Map<string, L.DivIcon>();

const PIN_HEIGHT = 30;
const TAIL = 7;

function venueIcon(
  venueType: string | null,
  capacity: number | null,
  active: boolean,
  shortlisted: boolean,
  labelled: boolean,
) {
  if (!labelled) return dotIcon(active ? "#2243B6" : shortlisted ? "#E0A100" : "#14203D", active);

  const key = `${venueType}:${capacity}:${active}:${shortlisted}`;
  const cached = venueIcons.get(key);
  if (cached) return cached;

  const background = active ? "#2243B6" : "#14203D";
  const label = capacity == null ? "" : String(capacity);
  // Wide enough for the badge at its hovered size; the badge centres in it,
  // so the tail lands on the venue whatever the font's real digit width.
  const width = label ? 60 + label.length * 9 : 40;
  const height = PIN_HEIGHT + TAIL + 4;
  const glyph = shortlisted ? SAVED_ICON : venueTypeIconPaths(venueType);
  const icon = L.divIcon({
    className: "",
    html: `<div style="display:flex;justify-content:center;align-items:flex-end;width:${width}px;height:${height}px;">
      <div style="
        position:relative;display:flex;align-items:center;gap:6px;
        height:${PIN_HEIGHT}px;padding:0 ${label ? 10 : 2}px 0 2px;box-sizing:border-box;margin-bottom:${TAIL}px;
        border-radius:${PIN_HEIGHT / 2}px;background:${background};border:2px solid #fff;
        box-shadow:0 2px 8px rgba(20,32,61,.35);
        color:#fff;font:700 12.5px ui-sans-serif,system-ui,sans-serif;white-space:nowrap;
        ${active ? "transform:scale(1.12);transform-origin:50% 100%;" : ""}
      ">
        <span style="display:flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;background:${shortlisted ? "#fff" : "#FFD301"};">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#14203D" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${glyph}</svg>
        </span>${label}
        <span style="position:absolute;left:50%;bottom:-${TAIL + 1}px;margin-left:-6px;border:6px solid transparent;border-bottom:0;border-top:${TAIL}px solid ${background};filter:drop-shadow(0 2px 0 #fff);"></span>
      </div>
    </div>`,
    iconSize: [width, height],
    iconAnchor: [width / 2, height],
    popupAnchor: [0, -height],
  });
  venueIcons.set(key, icon);
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
  venues: VenueListing[];
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
        (v): v is VenueListing & { latitude: number; longitude: number } =>
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
        minZoom={MAP_MIN_ZOOM}
        maxBounds={US_MAP_BOUNDS}
        maxBoundsViscosity={0.8}
        style={{ height: "100%", width: "100%" }}
      >
        <BaseMapLayer />
        <FitToPins points={points} />
        <ClusteredMarkers
          items={pinned}
          onViewChange={onViewChange}
          renderPin={(venue, labelled) => (
          <Marker
            key={venue.id}
            position={[venue.latitude, venue.longitude]}
            icon={venueIcon(
              venue.venue_type,
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
                    src={venue.image_url || venueTypeImage(venue.venue_type)}
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
