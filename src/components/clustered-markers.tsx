"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import maplibregl from "maplibre-gl";
import Supercluster from "supercluster";
import { useGlMap } from "@/components/gl-map";
import type { MapView } from "@/lib/map-view";

/**
 * Venues and Vendors run to thousands of listings, and a pin is a DOM node,
 * so drawing every one at a national zoom would lag. So, the way Zillow does
 * it, the map has three levels:
 *
 * - zoomed out, nearby listings group into one numbered circle; tapping it
 *   flies in on them;
 * - closer in, the ones that separate are small rings, a coloured band
 *   round a gold centre (like the logo's rings), which hold up on green
 *   parkland and grey streets where a plain dot got lost;
 * - at city level (LABEL_ZOOM and up), they get their label back.
 *
 * Groups split and merge while the zoom is still moving, not after it stops,
 * and pins fade in and out rather than blinking. Only what is on screen (plus
 * a margin) is ever drawn.
 */

/** From this (MapLibre) zoom up a lone pin carries its label. */
export const LABEL_ZOOM = 9;
/** Past this (MapLibre) zoom nothing groups, so every pin can be reached. */
const CLUSTER_MAX_ZOOM = 12;
/** Supercluster counts zoom in 256px tiles; MapLibre's are 512px. */
const TILE_OFFSET = 1;
const FADE_MS = 160;

export type PinnedListing = { id: string; latitude: number; longitude: number };

/** A pin's look: `html` is drawn as-is, and `key` changes whenever it does. */
export type PinLook = {
  key: string;
  html: string;
  /** Where the pin touches its spot. */
  anchor: "bottom" | "center";
  /** How far above the spot a popup opens. */
  popupOffset: number;
};

function clusterLook(count: number): PinLook {
  const size = count < 10 ? 32 : count < 100 ? 38 : count < 1000 ? 44 : 50;
  const label =
    count < 1000
      ? String(count)
      : `${(count / 1000).toFixed(count < 10000 ? 1 : 0)}k`;
  return {
    key: `${size}:${label}`,
    html: `<div style="
      display:flex;align-items:center;justify-content:center;
      width:${size}px;height:${size}px;border-radius:50%;
      background:#14203D;border:3px solid #fff;box-sizing:border-box;
      box-shadow:0 0 0 4px rgba(20,32,61,.18),0 1px 5px rgba(0,0,0,.3);
      color:#fff;font:700 13px ui-sans-serif,system-ui,sans-serif;
      cursor:pointer;
    ">${label}</div>`,
    anchor: "center",
    popupOffset: size / 2,
  };
}

/** A small ring for a listing seen from too far out to read a label. */
export function dotLook(band: string, active = false): PinLook {
  const size = active ? 16 : 14;
  return {
    key: `dot:${band}:${active}`,
    html: `<div style="width:${size}px;height:${size}px;box-sizing:border-box;border-radius:50%;background:#FFD301;border:3px solid ${band};box-shadow:0 0 0 2px #fff,0 1px 5px rgba(0,0,0,.35);cursor:pointer;"></div>`,
    anchor: "center",
    popupOffset: size / 2 + 2,
  };
}

type Drawn = {
  marker: maplibregl.Marker;
  inner: HTMLDivElement;
  look: string;
  anchor: PinLook["anchor"];
};

export function ClusteredMarkers<T extends PinnedListing>({
  items,
  pin,
  popup,
  popupWidth = 200,
  onHover,
  onViewChange,
}: {
  items: T[];
  /** One listing's pin; `labelled` is false below LABEL_ZOOM. */
  pin: (item: T, labelled: boolean) => PinLook;
  /** What opens when a pin is tapped. */
  popup?: (item: T) => ReactNode;
  popupWidth?: number;
  onHover?: (id: string | null) => void;
  /** The visible area, after every pan and zoom. */
  onViewChange?: (view: MapView) => void;
}) {
  const map = useGlMap();
  const drawn = useRef(new Map<string, Drawn>());
  // The open popup: which listing, and the box React draws its contents in.
  const [open, setOpen] = useState<{ id: string; node: HTMLDivElement } | null>(
    null,
  );

  // Latest props for the map's event handlers, which are bound once.
  const latest = useRef({ items, pin, onHover, onViewChange });
  useLayoutEffect(() => {
    latest.current = { items, pin, onHover, onViewChange };
  });

  const byId = useMemo(
    () => new Map(items.map((item) => [item.id, item])),
    [items],
  );

  const index = useMemo(() => {
    const cluster = new Supercluster<{ index: number }>({
      // In supercluster units (half a screen pixel): groups pins within ~40px,
      // so the numbered circles (32-50px) rarely overlap.
      radius: 80,
      maxZoom: CLUSTER_MAX_ZOOM + TILE_OFFSET,
    });
    cluster.load(
      items.map((item, index) => ({
        type: "Feature" as const,
        properties: { index },
        geometry: {
          type: "Point" as const,
          coordinates: [item.longitude, item.latitude],
        },
      })),
    );
    return cluster;
  }, [items]);

  // Draws what the current view needs: adds new pins, restyles changed ones,
  // fades out the rest. Cheap enough to run on every frame of a zoom.
  const sync = useRef<() => void>(() => {});
  useLayoutEffect(() => {
    sync.current = () => {
      const { items, pin } = latest.current;
      const bounds = map.getBounds();
      const latPad = (bounds.getNorth() - bounds.getSouth()) * 0.25;
      const lngPad = (bounds.getEast() - bounds.getWest()) * 0.25;
      const zoom = map.getZoom();
      const labelled = zoom >= LABEL_ZOOM;
      const features = index.getClusters(
        [
          Math.max(-180, bounds.getWest() - lngPad),
          Math.max(-85, bounds.getSouth() - latPad),
          Math.min(180, bounds.getEast() + lngPad),
          Math.min(85, bounds.getNorth() + latPad),
        ],
        Math.round(zoom + TILE_OFFSET),
      );

      const wanted = new Set<string>();
      for (const feature of features) {
        const [lng, lat] = feature.geometry.coordinates;
        const props = feature.properties as {
          cluster?: boolean;
          cluster_id?: number;
          point_count?: number;
          index?: number;
        };
        let id: string;
        let look: PinLook;
        let onClick: () => void;
        if (props.cluster && props.cluster_id != null) {
          const clusterId = props.cluster_id;
          id = `cluster:${clusterId}`;
          look = clusterLook(props.point_count ?? 0);
          onClick = () => {
            const target = Math.min(
              index.getClusterExpansionZoom(clusterId) - TILE_OFFSET,
              CLUSTER_MAX_ZOOM + 1,
            );
            map.flyTo({
              center: [lng, lat],
              zoom: Math.max(target, map.getZoom() + 1),
              speed: 1.6,
              curve: 1.3,
            });
          };
        } else {
          const item = items[props.index!];
          id = item.id;
          look = pin(item, labelled);
          onClick = () =>
            setOpen({ id: item.id, node: document.createElement("div") });
        }
        wanted.add(id);

        const existing = drawn.current.get(id);
        if (existing && existing.anchor === look.anchor) {
          if (existing.look !== look.key) {
            existing.inner.innerHTML = look.html;
            existing.look = look.key;
          }
          existing.inner.classList.remove("ydid-pin-out");
          continue;
        }
        // A ring turning into a labelled pin sits on its spot differently.
        if (existing) existing.marker.remove();

        const el = document.createElement("div");
        el.className = "ydid-pin";
        const inner = document.createElement("div");
        inner.className = "ydid-pin-in";
        inner.innerHTML = look.html;
        el.appendChild(inner);
        el.addEventListener("click", (event) => {
          event.stopPropagation();
          onClick();
        });
        if (!id.startsWith("cluster:")) {
          el.addEventListener("mouseenter", () => latest.current.onHover?.(id));
          el.addEventListener("mouseleave", () =>
            latest.current.onHover?.(null),
          );
        }
        const marker = new maplibregl.Marker({
          element: el,
          anchor: look.anchor,
        })
          .setLngLat([lng, lat])
          .addTo(map);
        drawn.current.set(id, {
          marker,
          inner,
          look: look.key,
          anchor: look.anchor,
        });
      }

      for (const [id, entry] of drawn.current) {
        if (wanted.has(id) || entry.inner.classList.contains("ydid-pin-out"))
          continue;
        entry.inner.classList.add("ydid-pin-out");
        window.setTimeout(() => {
          // Came back while fading: keep it.
          if (!entry.inner.classList.contains("ydid-pin-out")) return;
          entry.marker.remove();
          if (drawn.current.get(id) === entry) drawn.current.delete(id);
        }, FADE_MS);
      }
    };
  });

  useEffect(() => {
    let frame = 0;
    const onMove = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        sync.current();
      });
    };
    const report = () => {
      const b = map.getBounds();
      latest.current.onViewChange?.({
        south: b.getSouth(),
        west: b.getWest(),
        north: b.getNorth(),
        east: b.getEast(),
      });
    };
    map.on("move", onMove);
    map.on("moveend", report);
    // The first view, before anyone has moved the map.
    report();
    const pins = drawn.current;
    return () => {
      cancelAnimationFrame(frame);
      map.off("move", onMove);
      map.off("moveend", report);
      for (const entry of pins.values()) entry.marker.remove();
      pins.clear();
    };
  }, [map]);

  // New listings or new looks (hover, saved): redraw now, not on the next move.
  useEffect(() => {
    sync.current();
  });

  // The popup: one at a time, its contents rendered by React.
  const openItem = open ? byId.get(open.id) : undefined;
  useEffect(() => {
    if (!open || !openItem || !popup) return;
    const look = latest.current.pin(openItem, map.getZoom() >= LABEL_ZOOM);
    // Clear of the pin whichever side the popup opens on.
    const h = look.popupOffset;
    const offset: maplibregl.Offset =
      look.anchor === "bottom"
        ? {
            center: [0, -h / 2],
            bottom: [0, -h],
            top: [0, 0],
            left: [12, -h / 2],
            right: [-12, -h / 2],
            "top-left": [0, 0],
            "top-right": [0, 0],
            "bottom-left": [0, -h],
            "bottom-right": [0, -h],
          }
        : {
            center: [0, 0],
            bottom: [0, -h],
            top: [0, h],
            left: [h, 0],
            right: [-h, 0],
            "top-left": [0, h],
            "top-right": [0, h],
            "bottom-left": [0, -h],
            "bottom-right": [0, -h],
          };
    const instance = new maplibregl.Popup({
      closeButton: true,
      closeOnClick: true,
      maxWidth: `${popupWidth + 24}px`,
      offset,
      className: "ydid-popup",
      // Focusing the first link drew a focus ring round the card on every tap.
      focusAfterOpen: false,
    })
      .setLngLat([openItem.longitude, openItem.latitude])
      .setDOMContent(open.node)
      .addTo(map);
    instance.on("close", () =>
      setOpen((current) => (current === open ? null : current)),
    );
    return () => {
      instance.remove();
    };
    // Reopen only when a different listing is picked.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, openItem?.id, map]);

  return open && openItem && popup
    ? createPortal(popup(openItem), open.node)
    : null;
}
