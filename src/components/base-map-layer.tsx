"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import L from "leaflet";
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { RASTER_FALLBACK, TILE_HOST, VECTOR_STYLES } from "@/lib/map-tiles";

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * The base map under a Leaflet map's pins, from the one setting in
 * src/lib/map-tiles.ts. Vector tiles are drawn by MapLibre inside Leaflet,
 * so markers, popups and clustering stay plain Leaflet.
 */
export function BaseMapLayer() {
  const map = useMap();

  // Leaflet measures its box once and then only on window resizes. Safari
  // measured the browse screens' map mid-layout (~4,400px tall), centred the
  // pins and tiles below the visible part, and left it grey. Re-measure
  // whenever the box itself changes size.
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);

  useEffect(() => {
    let layer: L.Layer | null = null;
    let cancelled = false;

    if (TILE_HOST === "osm" || !supportsWebGL()) {
      layer = L.tileLayer(RASTER_FALLBACK.url, { attribution: RASTER_FALLBACK.attribution }).addTo(map);
    } else {
      const { style, attribution } = VECTOR_STYLES[TILE_HOST];
      // Loaded on demand: MapLibre is large and only map pages need it.
      void Promise.all([
        import("@maplibre/maplibre-gl-leaflet"),
        typeof style === "string" ? style : style(),
      ]).then(([{ maplibreGL }, resolved]) => {
        if (cancelled) return;
        // Leaflet reads the credit from the layer's `attribution` option; the
        // plugin's types leave it out.
        const options = { style: resolved, attribution } as Parameters<typeof maplibreGL>[0];
        layer = maplibreGL(options).addTo(map);
      });
    }

    return () => {
      cancelled = true;
      if (layer) map.removeLayer(layer);
    };
  }, [map]);

  return null;
}
