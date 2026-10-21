/**
 * Where the maps' base tiles come from (plan Q5, data-intelligence-plan.md).
 *
 * tile.openstreetmap.org is for light use, not a product's main map, so the
 * maps read one Protomaps file (all 50 states, zoom 0-13, ~4.6 GB) straight
 * out of a public R2 bucket with HTTP range requests. No Worker sits in the
 * path, so it costs no Worker CPU; R2's free tier covers 10 GB stored and
 * 10M reads a month. `npm run tiles:build` makes and uploads the file.
 *
 * Null until the bucket is live; the maps fall back to OSM tiles meanwhile.
 * NEXT_PUBLIC_MAP_TILES_URL overrides it (local previews).
 */
export const PMTILES_URL: string | null =
  process.env.NEXT_PUBLIC_MAP_TILES_URL?.trim() || null;

/** Highest zoom baked into the file; the map draws deeper zooms from it. */
export const PMTILES_MAX_ZOOM = 13;

export const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
