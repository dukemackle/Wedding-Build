"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import L from "leaflet";
import { Marker, useMap, useMapEvents } from "react-leaflet";
import Supercluster from "supercluster";
import type { MapView } from "@/lib/map-view";

/**
 * Venues and Vendors run to thousands of listings, and a Leaflet marker is a
 * DOM node -- drawing every one at a national zoom is what made the map lag.
 * So, the way Zillow does it, the map has three levels:
 *
 * - zoomed out, nearby listings group into one numbered circle; tapping it
 *   zooms in on them;
 * - closer in, the ones that separate are small plain dots;
 * - at city level (LABEL_ZOOM and up), they get their label back.
 *
 * Only what is on screen (plus a margin) is ever drawn.
 */

/** From this zoom up a lone pin carries its label (category, capacity). */
export const LABEL_ZOOM = 11;
/** Past this zoom nothing groups, so every pin can be reached. */
const CLUSTER_MAX_ZOOM = 13;

export type PinnedListing = { id: string; latitude: number; longitude: number };

const clusterIcons = new Map<string, L.DivIcon>();
const dotIcons = new Map<string, L.DivIcon>();

function clusterIcon(count: number) {
  const size = count < 10 ? 32 : count < 100 ? 38 : count < 1000 ? 44 : 50;
  const label = count < 1000 ? String(count) : `${(count / 1000).toFixed(count < 10000 ? 1 : 0)}k`;
  const key = `${size}:${label}`;
  let icon = clusterIcons.get(key);
  if (!icon) {
    icon = L.divIcon({
      className: "",
      html: `<div style="
        display:flex;align-items:center;justify-content:center;
        width:${size}px;height:${size}px;border-radius:50%;
        background:#14203D;border:3px solid #fff;
        box-shadow:0 0 0 4px rgba(20,32,61,.18),0 1px 5px rgba(0,0,0,.3);
        color:#fff;font:700 13px ui-sans-serif,system-ui,sans-serif;
        cursor:pointer;
      ">${label}</div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
    clusterIcons.set(key, icon);
  }
  return icon;
}

export function ClusteredMarkers<T extends PinnedListing>({
  items,
  renderPin,
  onViewChange,
}: {
  items: T[];
  /** One listing's marker; `labelled` is false below LABEL_ZOOM. */
  renderPin: (item: T, labelled: boolean) => ReactNode;
  /** The visible area, after every pan and zoom. */
  onViewChange?: (view: MapView) => void;
}) {
  const map = useMap();
  const [view, setView] = useState(() => ({ bounds: map.getBounds(), zoom: map.getZoom() }));

  function report(bounds: L.LatLngBounds) {
    onViewChange?.({
      south: bounds.getSouth(),
      west: bounds.getWest(),
      north: bounds.getNorth(),
      east: bounds.getEast(),
    });
  }

  useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      setView({ bounds, zoom: map.getZoom() });
      report(bounds);
    },
  });
  // The first view, before anyone has moved the map.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => report(view.bounds), []);

  const index = useMemo(() => {
    const cluster = new Supercluster<{ index: number }>({ radius: 60, maxZoom: CLUSTER_MAX_ZOOM });
    cluster.load(
      items.map((item, index) => ({
        type: "Feature" as const,
        properties: { index },
        geometry: { type: "Point" as const, coordinates: [item.longitude, item.latitude] },
      })),
    );
    return cluster;
  }, [items]);

  // A margin past the edges, so pins don't pop in as a pan begins.
  const padded = view.bounds.pad(0.25);
  const zoom = Math.round(view.zoom);
  const features = index.getClusters(
    [
      Math.max(-180, padded.getWest()),
      Math.max(-85, padded.getSouth()),
      Math.min(180, padded.getEast()),
      Math.min(85, padded.getNorth()),
    ],
    zoom,
  );
  const labelled = zoom >= LABEL_ZOOM;

  return (
    <>
      {features.map((feature) => {
        const [lng, lat] = feature.geometry.coordinates;
        const props = feature.properties as { cluster?: boolean; cluster_id?: number; point_count?: number; index?: number };
        if (props.cluster && props.cluster_id != null) {
          const clusterId = props.cluster_id;
          return (
            <Marker
              key={`cluster-${clusterId}`}
              position={[lat, lng]}
              icon={clusterIcon(props.point_count ?? 0)}
              eventHandlers={{
                click: () => {
                  const target = Math.min(index.getClusterExpansionZoom(clusterId), CLUSTER_MAX_ZOOM + 1);
                  map.flyTo([lat, lng], target, { duration: 0.6 });
                },
              }}
            />
          );
        }
        return renderPin(items[props.index!], labelled);
      })}
    </>
  );
}

/** A plain dot for a listing seen from too far out to read a label. */
export function dotIcon(background: string, active = false) {
  const key = `${background}:${active}`;
  let icon = dotIcons.get(key);
  if (!icon) {
    const size = active ? 16 : 12;
    icon = L.divIcon({
      className: "",
      html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${background};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.3);"></div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
    dotIcons.set(key, icon);
  }
  return icon;
}
