"use client";

import { useEffect } from "react";
import { TileLayer, useMap } from "react-leaflet";
import { leafletLayer } from "protomaps-leaflet";
import { OSM_ATTRIBUTION, PMTILES } from "@/lib/map-tiles";

/**
 * The base map under every Leaflet map: our own Protomaps files on R2 (the
 * world file zoomed out, the US file from zoom 7), or OSM's raster tiles if
 * they're switched off. See src/lib/map-tiles.ts.
 */
export function BaseTiles({ attribution = true }: { attribution?: boolean }) {
  if (!PMTILES) {
    return (
      <TileLayer
        attribution={attribution ? OSM_ATTRIBUTION : undefined}
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
    );
  }
  return <ProtomapsLayers attribution={attribution} />;
}

function ProtomapsLayers({ attribution }: { attribution: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (!PMTILES) return;
    const { world, us } = PMTILES;
    const shared = { flavor: "light", lang: "en" };
    const layers = [
      // "" not undefined: the library adds its own credit when it's missing.
      leafletLayer({ ...shared, url: world.url, maxDataZoom: world.maxDataZoom, maxZoom: world.maxDataZoom, attribution: "" }),
      leafletLayer({
        ...shared,
        url: us.url,
        maxDataZoom: us.maxDataZoom,
        minZoom: world.maxDataZoom + 1,
        // Leaflet takes the map's zoom limit from its layers; 18 is what the
        // OSM layer allowed.
        maxZoom: 18,
        attribution: attribution ? `<a href="https://protomaps.com">Protomaps</a> ${OSM_ATTRIBUTION}` : "",
      }),
    ];
    for (const layer of layers) layer.addTo(map);
    return () => {
      for (const layer of layers) layer.remove();
    };
  }, [map, attribution]);
  return null;
}
