"use client";

import { useEffect } from "react";
import { TileLayer, useMap } from "react-leaflet";
import { leafletLayer } from "protomaps-leaflet";
import { OSM_ATTRIBUTION, PMTILES_MAX_ZOOM, PMTILES_URL } from "@/lib/map-tiles";

/**
 * The base map under every Leaflet map: our own Protomaps file on R2 when
 * it's set up, otherwise OSM's raster tiles. See src/lib/map-tiles.ts.
 */
export function BaseTiles({ attribution = true }: { attribution?: boolean }) {
  if (!PMTILES_URL) {
    return (
      <TileLayer
        attribution={attribution ? OSM_ATTRIBUTION : undefined}
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
    );
  }
  return <ProtomapsLayer url={PMTILES_URL} attribution={attribution} />;
}

function ProtomapsLayer({ url, attribution }: { url: string; attribution: boolean }) {
  const map = useMap();
  useEffect(() => {
    const layer = leafletLayer({
      url,
      flavor: "light",
      lang: "en",
      maxDataZoom: PMTILES_MAX_ZOOM,
      attribution: attribution
        ? `<a href="https://protomaps.com">Protomaps</a> ${OSM_ATTRIBUTION}`
        : undefined,
    });
    layer.addTo(map);
    return () => {
      layer.remove();
    };
  }, [map, url, attribution]);
  return null;
}
