import maplibregl, { type LayerSpecification, type StyleSpecification } from "maplibre-gl";
import { Protocol } from "pmtiles";
import { layers, namedFlavor } from "@protomaps/basemaps";

// The MapLibre style for TILE_HOST "youdoido" (src/lib/map-tiles.ts): our
// own files on R2, all made by `npm run tiles:build` (scripts/build-tiles.mjs).
//
//   world.pmtiles  whole world, zoom 0-6: the zoomed-out views
//   us.pmtiles     the 50 states, zoom 0-13: zoom 7 and in (MapLibre draws
//                  deeper zooms from 13)
//   assets/        the style's fonts and icons, copied from Protomaps
const BASE = "https://tiles.youdoido.com";
const SPLIT_ZOOM = 7; // world.pmtiles stops at 6

let protocolAdded = false;

/** The "light" flavour, drawn from world.pmtiles below SPLIT_ZOOM and us.pmtiles from it. */
export function ownMapStyle(attribution: string): StyleSpecification {
  if (!protocolAdded) {
    maplibregl.addProtocol("pmtiles", new Protocol().tile);
    protocolAdded = true;
  }
  const flavor = namedFlavor("light");
  // The same layers twice, one set per file. Layer ids must be unique.
  const from = (source: string, min: number, max: number): LayerSpecification[] =>
    layers(source, flavor, { lang: "en" })
      .map((layer) => ({
        ...layer,
        id: `${source}-${layer.id}`,
        minzoom: Math.max(layer.minzoom ?? 0, min),
        maxzoom: Math.min(layer.maxzoom ?? 24, max),
      }))
      .filter((layer) => layer.minzoom < layer.maxzoom);

  return {
    version: 8,
    glyphs: `${BASE}/assets/fonts/{fontstack}/{range}.pbf`,
    sprite: `${BASE}/assets/sprites/v4/light`,
    sources: {
      // The Leaflet plugin shows the sources' credits, not the layer option's;
      // one source carries it so it isn't listed twice.
      world: { type: "vector", url: `pmtiles://${BASE}/world.pmtiles`, attribution },
      us: { type: "vector", url: `pmtiles://${BASE}/us.pmtiles` },
    },
    layers: [...from("world", 0, SPLIT_ZOOM), ...from("us", SPLIT_ZOOM, 24)],
  };
}
