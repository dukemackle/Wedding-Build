/**
 * Where the maps' base tiles come from (plan Q5, data-intelligence-plan.md).
 *
 * tile.openstreetmap.org is for light use, not a product's main map, so the
 * maps read two Protomaps files straight out of a public R2 bucket with HTTP
 * range requests. No Worker sits in the path, so they cost no Worker CPU;
 * R2's free tier covers 10 GB stored and 10M reads a month.
 * `npm run tiles:build` makes and uploads them.
 *
 *   world.pmtiles  whole world, zoom 0-6 (~45 MB): the zoomed-out views
 *   us.pmtiles     the 50 states, zoom 0-13 (~4.6 GB): zoom 7 and in
 *
 * The bucket is youdoido-tiles, served at tiles.youdoido.com (its CORS rule
 * lists the origins allowed to read it). NEXT_PUBLIC_MAP_TILES_BASE overrides
 * the address for local previews; set it to "" to fall back to OSM's tiles.
 */
const TILES_BASE = (process.env.NEXT_PUBLIC_MAP_TILES_BASE ?? "https://tiles.youdoido.com").trim();

export const PMTILES = TILES_BASE
  ? {
      world: { url: `${TILES_BASE}/world.pmtiles`, maxDataZoom: 6 },
      us: { url: `${TILES_BASE}/us.pmtiles`, maxDataZoom: 13 },
    }
  : null;

export const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
