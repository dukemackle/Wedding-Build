"use client";

import { useEffect, useState } from "react";
import { Polygon } from "react-leaflet";
import type { LatLngTuple } from "leaflet";
import { boundarySlug } from "@/lib/boundary-slug";
import { STATE_ABBR } from "@/lib/us-states";

type Outline = LatLngTuple[][][];

/**
 * The picked city's limits, drawn under the pins on the browse maps, so a
 * couple can see what "San Diego" covers. The city filter matches listings by
 * city name, so the line and the results agree. Outlines are the Census
 * Bureau's, one small file per listed city (scripts/build-boundaries.mjs); a
 * city without one simply shows no line.
 */
export function CityOutline({ city, state }: { city: string; state: string }) {
  const abbr = STATE_ABBR[state];
  const src = city !== "all" && abbr ? `/boundaries/${abbr}/${boundarySlug(city)}.json` : null;
  const [loaded, setLoaded] = useState<{ src: string; outline: Outline } | null>(null);

  useEffect(() => {
    if (!src) return;
    let cancelled = false;
    fetch(src)
      .then((res) => (res.ok ? res.json() : null))
      .then((outline: Outline | null) => {
        if (!cancelled && outline) setLoaded({ src, outline });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [src]);

  if (!loaded || loaded.src !== src) return null;
  return (
    <Polygon
      positions={loaded.outline}
      interactive={false}
      pathOptions={{ color: "#2243B6", weight: 2.5, opacity: 0.85, fillColor: "#2243B6", fillOpacity: 0.05 }}
    />
  );
}
