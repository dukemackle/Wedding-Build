/**
 * The visible part of a browse map, as plain numbers so the list beside it can
 * use it without loading Leaflet (which can't run on the server).
 */
export type MapView = { south: number; west: number; north: number; east: number };

/**
 * Whether a listing sits inside the map's view. A listing with no coordinates
 * is never on the map, so it is never "in view" either.
 */
export function isInView(
  listing: { latitude: number | null; longitude: number | null },
  view: MapView,
) {
  const { latitude: lat, longitude: lng } = listing;
  if (lat == null || lng == null) return false;
  return lat >= view.south && lat <= view.north && lng >= view.west && lng <= view.east;
}

/** A short stable string for a view, for keys and memo dependencies. */
export function viewKey(view: MapView | null) {
  return view ? [view.south, view.west, view.north, view.east].map((n) => n.toFixed(4)).join(",") : "";
}

/**
 * How far the browse maps can pan and zoom out: the US with Alaska and Hawaii
 * plus some sea around it. Without a limit Leaflet repeats the world sideways
 * forever and a swipe left carries the pins off into a copy of the Pacific.
 */
export const US_MAP_BOUNDS: [[number, number], [number, number]] = [
  [5, -180],
  [75, -50],
];
export const MAP_MIN_ZOOM = 3;
