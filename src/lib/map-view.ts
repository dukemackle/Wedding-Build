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
 * How far the browse maps can pan and zoom out: North America with Alaska and
 * Hawaii and a generous margin of sea, so there's room to zoom out and drag a
 * little without losing the pins. Without a limit Leaflet lets a swipe carry
 * the pins off into an endless copy of the Pacific.
 */
export const US_MAP_BOUNDS: [[number, number], [number, number]] = [
  [-10, -180],
  [80, -20],
];
export const MAP_MIN_ZOOM = 2;

/**
 * How the browse maps zoom. Leaflet's defaults move a whole zoom level (twice
 * as close) per mouse-wheel notch and snap to whole levels, which reads as a
 * jump rather than a zoom; trackpads stutter between those steps too. Quarter
 * steps and a slower wheel make it glide.
 */
export const MAP_ZOOM_FEEL = {
  zoomSnap: 0.25,
  zoomDelta: 0.5,
  wheelPxPerZoomLevel: 120,
  wheelDebounceTime: 20,
} as const;
