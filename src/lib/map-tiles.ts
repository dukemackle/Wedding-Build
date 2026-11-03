import type { StyleSpecification } from "maplibre-gl";

// Which base map every map draws under its pins. One setting, so
// moving between tile hosts is a one-line change (data plan Q5).
//
// - "openfreemap": OpenFreeMap's hosted vector tiles. Free, commercial use
//   allowed, no key; donation-funded with no SLA.
// - "youdoido": our own Protomaps files on Cloudflare R2 at
//   tiles.youdoido.com, read with range requests (no Worker, no CPU). Built
//   and uploaded by `npm run tiles:build`; the style is in own-map-style.ts.
//   Our own copy, so no third party can rate-limit or retire it (owner,
//   2026-10-21).
// - "osm": OpenStreetMap's raster tiles, the old default. Its tile policy is
//   for light use, so don't make it the default again.
export type TileHost = "openfreemap" | "youdoido" | "osm";

export const TILE_HOST: TileHost = "youdoido";

const OSM_CREDIT = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/** A style URL, or a loader for a style built in code. */
type StyleSource = string | (() => Promise<StyleSpecification>);

const OWN_CREDIT = `<a href="https://protomaps.com">Protomaps</a> ${OSM_CREDIT}`;

export const VECTOR_STYLES: Record<Exclude<TileHost, "osm">, { style: StyleSource; attribution: string }> = {
  openfreemap: {
    // Liberty: full colour (parks, water, roads), chosen over the grey
    // Positron, which read as dreary (owner, 2026-10-21).
    style: "https://tiles.openfreemap.org/styles/liberty",
    attribution: `<a href="https://openfreemap.org">OpenFreeMap</a> &copy; <a href="https://www.openmaptiles.org/">OpenMapTiles</a> ${OSM_CREDIT}`,
  },
  youdoido: {
    // Loaded on demand with MapLibre, so pages without a map don't pay for it.
    style: () => import("./own-map-style").then((m) => m.ownMapStyle(OWN_CREDIT)),
    attribution: OWN_CREDIT,
  },
};

const RASTER_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      maxzoom: 19,
      attribution: OSM_CREDIT,
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }],
};

/** The MapLibre style for TILE_HOST, resolved. */
export async function loadMapStyle(): Promise<StyleSpecification | string> {
  if (TILE_HOST === "osm") return RASTER_STYLE;
  const { style } = VECTOR_STYLES[TILE_HOST];
  return typeof style === "string" ? style : style();
}
