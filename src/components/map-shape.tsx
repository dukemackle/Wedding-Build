"use client";

import { useEffect, useId } from "react";
import type { GeoJSONSource } from "maplibre-gl";
import { useGlMap, whenStyleReady } from "@/components/gl-map";

/** An outline or area drawn on the map under the pins, never clickable. */
export function MapShape({
  data,
  color,
  weight,
  opacity = 1,
  fillColor = color,
  fillOpacity,
}: {
  data: GeoJSON.Feature | GeoJSON.FeatureCollection;
  color: string;
  weight: number;
  opacity?: number;
  fillColor?: string;
  fillOpacity: number;
}) {
  const map = useGlMap();
  const id = `shape-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    let added = false;
    const undo = whenStyleReady(map, () => {
      const existing = map.getSource(id) as GeoJSONSource | undefined;
      if (existing) {
        existing.setData(data);
        return;
      }
      map.addSource(id, { type: "geojson", data });
      map.addLayer({
        id: `${id}-fill`,
        type: "fill",
        source: id,
        paint: { "fill-color": fillColor, "fill-opacity": fillOpacity },
      });
      map.addLayer({
        id: `${id}-line`,
        type: "line",
        source: id,
        paint: {
          "line-color": color,
          "line-width": weight,
          "line-opacity": opacity,
        },
        layout: { "line-join": "round" },
      });
      added = true;
    });
    return () => {
      undo();
      if (!added || !map.getStyle()) return;
      for (const layer of [`${id}-line`, `${id}-fill`])
        if (map.getLayer(layer)) map.removeLayer(layer);
      if (map.getSource(id)) map.removeSource(id);
    };
  }, [map, id, data, color, weight, opacity, fillColor, fillOpacity]);

  return null;
}

/** A circle `radius` metres round a point, as a polygon. */
export function circleFeature(
  lat: number,
  lng: number,
  radius: number,
  steps = 64,
): GeoJSON.Feature {
  const ring: [number, number][] = [];
  const dLat = radius / 111_320;
  const dLng = radius / (111_320 * Math.cos((lat * Math.PI) / 180));
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * 2 * Math.PI;
    ring.push([lng + dLng * Math.cos(a), lat + dLat * Math.sin(a)]);
  }
  return {
    type: "Feature",
    properties: {},
    geometry: { type: "Polygon", coordinates: [ring] },
  };
}
