"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";

/**
 * Fits the map to the pinned listings whenever that set changes.
 *
 * Without this the map opens at a continental zoom and every pin in one state
 * lands on the same few pixels -- which got worse once pins carried a label
 * instead of being 16px dots.
 */
export function FitToPins({ points }: { points: [number, number][] }) {
  const map = useMap();
  // Cheap stable key: refitting on every render would fight the user panning.
  const key = points.map((p) => p.join()).join("|");

  useEffect(() => {
    if (points.length === 0) return;
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
