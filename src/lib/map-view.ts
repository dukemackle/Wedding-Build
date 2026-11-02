/**
 * The visible part of a browse map, as plain numbers so the list beside it can
 * use it without loading MapLibre (which needs a browser).
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
 * little without losing the pins. As MapLibre wants it: [[west, south], [east, north]].
 * West stops short of -180: at exactly the antimeridian MapLibre's clamp
 * throws every view out into the Pacific.
 */
export const US_MAP_BOUNDS: [[number, number], [number, number]] = [
  [-178, -10],
  [-20, 80],
];

/**
 * Zoom levels are MapLibre's (512px tiles), one less than the old Leaflet
 * numbers for the same view: zoom 10 here is what Leaflet called 11.
 */
export const MAP_MIN_ZOOM = 1;
export const MAP_MAX_ZOOM = 17;
