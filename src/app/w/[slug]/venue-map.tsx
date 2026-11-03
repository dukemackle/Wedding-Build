"use client";

import maplibregl from "maplibre-gl";
import { useEffect } from "react";
import { GlMap, useGlMap } from "@/components/gl-map";

/**
 * The venue on a map, for the guest site's Venue section: one pin at about
 * town level, so a guest sees where it is relative to the town and their
 * hotel. It doesn't pan or zoom (on a phone a draggable map catches the
 * thumb that's scrolling the page); the whole map is a link to directions,
 * like the button beside it.
 */
export function VenueMap({
  lat,
  lng,
  name,
  directions,
  className,
}: {
  lat: number;
  lng: number;
  name: string;
  directions: string;
  className: string;
}) {
  return (
    <a
      href={directions}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${name} on a map: get directions`}
      className={`relative block overflow-hidden rounded-lg border border-ink/10 bg-ink/5 ${className}`}
    >
      <GlMap center={[lat, lng]} zoom={12} interactive={false} bounded={false} className="h-full w-full">
        <Pin lat={lat} lng={lng} />
      </GlMap>
      {/* Above the canvas, so a click lands on the link, not the map. */}
      <span className="absolute inset-0" aria-hidden />
    </a>
  );
}

function Pin({ lat, lng }: { lat: number; lng: number }) {
  const map = useGlMap();
  useEffect(() => {
    const el = document.createElement("div");
    // The site's own colour (forest follows the couple's palette).
    el.className = "text-forest drop-shadow";
    el.innerHTML =
      '<svg width="30" height="40" viewBox="0 0 30 40" aria-hidden="true"><path d="M15 39c-1-6-14-14-14-24a14 14 0 0 1 28 0c0 10-13 18-14 24z" fill="currentColor"/><circle cx="15" cy="15" r="5.5" fill="#fff"/></svg>';
    const marker = new maplibregl.Marker({ element: el, anchor: "bottom" }).setLngLat([lng, lat]).addTo(map);
    return () => void marker.remove();
  }, [map, lat, lng]);
  return null;
}
