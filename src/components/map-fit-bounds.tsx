"use client";

import { useEffect, useRef } from "react";
import { LngLatBounds } from "maplibre-gl";
import { useGlMap } from "@/components/gl-map";

/**
 * Where the map was left, and which set of pins it was showing then. `v` is
 * the zoom scale: views saved under Leaflet's (one higher) are ignored.
 */
type RememberedView = {
  v: 2;
  lat: number;
  lng: number;
  zoom: number;
  pins: string;
};

/** A short fingerprint of the pin set; the full key runs to hundreds of KB. */
function fingerprint(key: string) {
  let hash = 5381;
  for (let i = 0; i < key.length; i++)
    hash = ((hash << 5) + hash + key.charCodeAt(i)) | 0;
  return `${key.length}:${hash}`;
}

function readView(storageKey: string): RememberedView | null {
  try {
    const saved = JSON.parse(
      window.sessionStorage.getItem(storageKey) ?? "null",
    );
    return saved && saved.v === 2 && typeof saved.zoom === "number"
      ? saved
      : null;
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
  const map = useGlMap();
  // Cheap stable key: refitting on every render would fight the user panning.
  const key = points.map((p) => p.join()).join("|");
  const pins = fingerprint(key);
  const pinsRef = useRef(pins);
  // The remembered view is used for the pin set it was left on, until the
  // filters move on to another one.
  // undefined until read: storage only exists in the browser.
  const pending = useRef<RememberedView | null | undefined>(undefined);
  const restored = useRef(false);
  // The first fit jumps; later ones (the filters changed) glide.
  const fitted = useRef(false);
  // The last fit, redone if the map changes size before anyone moves it.
  const refit = useRef<(() => void) | null>(null);
  const touched = useRef(false);

  // On a phone the map is laid out before the screen's height is measured, so
  // the first fit happens in a box of the wrong size and the pins end up under
  // the results sheet. Redo the fit on every resize until the user pans,
  // zooms or the view was restored.
  useEffect(() => {
    const onMoveStart = (e: { originalEvent?: unknown }) => {
      if (e.originalEvent) touched.current = true;
    };
    const onResize = () => {
      if (!touched.current && !restored.current) refit.current?.();
    };
    map.on("movestart", onMoveStart);
    map.on("resize", onResize);
    return () => {
      map.off("movestart", onMoveStart);
      map.off("resize", onResize);
    };
  }, [map]);

  useEffect(() => {
    if (!rememberAs) return;
    const save = () => {
      const { lat, lng } = map.getCenter();
      const view: RememberedView = {
        v: 2,
        lat,
        lng,
        zoom: map.getZoom(),
        pins: pinsRef.current,
      };
      try {
        window.sessionStorage.setItem(rememberAs, JSON.stringify(view));
      } catch {
        // Private window or blocked storage: the map just refits next time.
      }
    };
    map.on("moveend", save);
    return () => {
      map.off("moveend", save);
    };
  }, [map, rememberAs]);

  useEffect(() => {
    pinsRef.current = pins;
    if (pending.current === undefined)
      pending.current = rememberAs ? readView(rememberAs) : null;
    if (points.length === 0) return;
    const remembered = pending.current;
    if (remembered && remembered.pins === pins) {
      // Kept rather than cleared: React can run this effect twice on mount.
      restored.current = true;
      map.jumpTo({
        center: [remembered.lng, remembered.lat],
        zoom: remembered.zoom,
      });
      fitted.current = true;
      return;
    }
    // The filters changed after the restore, so it's a fresh fit from here.
    if (restored.current) pending.current = null;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const animate = fitted.current && !reduced;
    fitted.current = true;
    touched.current = false;

    const fit = (duration: number) => {
      // On a phone the results sheet covers the lower half of the map and the
      // search field floats over the top, so fitting to the full container
      // would drop most pins behind one or the other.
      const narrow = window.innerWidth < 1024;
      const height = map.getContainer().clientHeight;
      const topInset = narrow ? 120 : 56;
      const bottomInset = narrow ? Math.round(height * 0.52) : 56;

      if (points.length === 1) {
        map.easeTo({
          center: [points[0][1], points[0][0]],
          zoom: 10,
          offset: [0, (topInset - bottomInset) / 2],
          duration,
        });
        return;
      }

      const bounds = new LngLatBounds();
      for (const [lat, lng] of points) bounds.extend([lng, lat]);
      map.fitBounds(bounds, {
        padding: { top: topInset, bottom: bottomInset, left: 40, right: 40 },
        maxZoom: 12,
        duration,
      });
    };
    refit.current = () => fit(0);
    fit(animate ? 700 : 0);
    // points is rebuilt each render; key captures its contents.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);

  return null;
}
