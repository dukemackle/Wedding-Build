"use client";

import { useEffect, useRef } from "react";
import { useMap, useMapEvents } from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";

/** Where the map was left, and which set of pins it was showing then. */
type RememberedView = { lat: number; lng: number; zoom: number; pins: string };

/** A short fingerprint of the pin set; the full key runs to hundreds of KB. */
function fingerprint(key: string) {
  let hash = 5381;
  for (let i = 0; i < key.length; i++) hash = ((hash << 5) + hash + key.charCodeAt(i)) | 0;
  return `${key.length}:${hash}`;
}

function readView(storageKey: string): RememberedView | null {
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(storageKey) ?? "null");
    return saved && typeof saved.zoom === "number" ? saved : null;
  } catch {
    return null;
  }
}

/**
 * Fits the map to the pinned listings whenever that set changes.
 *
 * Without this the map opens at a continental zoom and every pin in one state
 * lands on the same few pixels -- which got worse once pins carried a label
 * instead of being 16px dots.
 *
 * With `rememberAs`, the map also keeps where it was left for the rest of the
 * browser session: leave Venues for the dashboard and come back, and it opens
 * where you were rather than on the whole country. A different set of pins
 * (the filters changed) still gets a fresh fit.
 */
export function FitToPins({
  points,
  rememberAs,
}: {
  points: [number, number][];
  /** sessionStorage key for the last view; leave out to always fit. */
  rememberAs?: string;
}) {
  const map = useMap();
  // Cheap stable key: refitting on every render would fight the user panning.
  const key = points.map((p) => p.join()).join("|");
  const pins = fingerprint(key);
  const pinsRef = useRef(pins);
  // The remembered view is used for the pin set it was left on, until the
  // filters move on to another one.
  // undefined until read: storage only exists in the browser.
  const pending = useRef<RememberedView | null | undefined>(undefined);
  const restored = useRef(false);

  useMapEvents({
    moveend: () => {
      if (!rememberAs) return;
      const { lat, lng } = map.getCenter();
      const view: RememberedView = { lat, lng, zoom: map.getZoom(), pins: pinsRef.current };
      try {
        window.sessionStorage.setItem(rememberAs, JSON.stringify(view));
      } catch {
        // Private window or blocked storage: the map just refits next time.
      }
    },
  });

  useEffect(() => {
    pinsRef.current = pins;
    if (pending.current === undefined) pending.current = rememberAs ? readView(rememberAs) : null;
    if (points.length === 0) return;
    const remembered = pending.current;
    if (remembered && remembered.pins === pins) {
      // Kept rather than cleared: React can run this effect twice on mount.
      restored.current = true;
      map.setView([remembered.lat, remembered.lng], remembered.zoom, { animate: false });
      return;
    }
    // The filters changed after the restore, so it's a fresh fit from here.
    if (restored.current) pending.current = null;

    // On a phone the results sheet covers the lower half of the map and the
    // search field floats over the top, so fitting to the full container would
    // drop most pins behind one or the other.
    const narrow = window.innerWidth < 1024;
    const height = map.getSize().y;
    const topInset = narrow ? 120 : 56;
    const bottomInset = narrow ? Math.round(height * 0.52) : 56;

    if (points.length === 1) {
      map.setView(points[0], 11);
      map.panBy([0, (bottomInset - topInset) / 2], { animate: false });
      return;
    }

    map.fitBounds(points as LatLngBoundsExpression, {
      paddingTopLeft: [40, topInset],
      paddingBottomRight: [40, bottomInset],
      maxZoom: 13,
    });
    // points is rebuilt each render; key captures its contents.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);

  return null;
}
