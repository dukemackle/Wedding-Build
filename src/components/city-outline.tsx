"use client";

import { useEffect, useMemo, useState } from "react";
import { MapShape } from "@/components/map-shape";
import { boundarySlug } from "@/lib/boundary-slug";
import { STATE_ABBR } from "@/lib/us-states";

/** Polygons of rings of [lat, lng] points. */
type Outline = [number, number][][][];

/**
 * The picked city's limits, drawn under the pins on the browse maps, so a
 * couple can see what "San Diego" covers. The city filter matches listings by
 * city name, so the line and the results agree. Outlines are the Census
 * Bureau's, one small file per listed city (scripts/build-boundaries.mjs); a
 * city without one simply shows no line.
 */
export function CityOutline({ city, state }: { city: string; state: string }) {
  const abbr = STATE_ABBR[state];
  const src =
    city !== "all" && abbr
      ? `/boundaries/${abbr}/${boundarySlug(city)}.json`
      : null;
  const [loaded, setLoaded] = useState<{
    src: string;
    outline: Outline;
  } | null>(null);

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

  const outline = loaded && loaded.src === src ? loaded.outline : null;
  const data = useMemo<GeoJSON.Feature | null>(
    () =>
      outline && {
        type: "Feature",
        properties: {},
        geometry: {
          type: "MultiPolygon",
          coordinates: outline.map((polygon) =>
            polygon.map((ring) => ring.map(([lat, lng]) => [lng, lat])),
          ),
        },
      },
    [outline],
  );

  if (!data) return null;
  return (
    <MapShape
      data={data}
      color="#2243B6"
      weight={2.5}
      opacity={0.85}
      fillOpacity={0.05}
    />
  );
}
