// Which base map every Leaflet map draws under its pins. One setting, so
// moving between tile hosts is a one-line change (data plan Q5).
//
// - "openfreemap": OpenFreeMap's hosted vector tiles. Free, commercial use
//   allowed, no key; donation-funded with no SLA.
// - "youdoido": our own US basemap on Cloudflare R2, served by the
//   tiles.youdoido.com Worker (not built yet).
// - "osm": OpenStreetMap's raster tiles, the old default. Its tile policy is
//   for light use, so it's only the fallback when a browser can't run WebGL.
export type TileHost = "openfreemap" | "youdoido" | "osm";

export const TILE_HOST: TileHost = "openfreemap";

const OSM_CREDIT = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export const VECTOR_STYLES: Record<Exclude<TileHost, "osm">, { style: string; attribution: string }> = {
  openfreemap: {
    // Liberty: full colour (parks, water, roads), chosen over the grey
    // Positron, which read as dreary (owner, 2026-10-21).
    style: "https://tiles.openfreemap.org/styles/liberty",
    attribution: `<a href="https://openfreemap.org">OpenFreeMap</a> &copy; <a href="https://www.openmaptiles.org/">OpenMapTiles</a> ${OSM_CREDIT}`,
  },
  youdoido: {
    style: "https://tiles.youdoido.com/style.json",
    attribution: `<a href="https://protomaps.com">Protomaps</a> ${OSM_CREDIT}`,
  },
};

export const RASTER_FALLBACK = {
  url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution: OSM_CREDIT,
};
