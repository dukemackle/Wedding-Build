// Checks src/lib/venue-batches.ts before it ships. Run with:
//
//   npm run check:venues
//
// Every batch goes through the real importer (parseVenueTable), because
// /admin/venues silently skips any row the importer rejects -- a bad cell
// means a venue that never appears, with nothing on screen to say why. On
// top of that it checks what the importer doesn't: duplicates across
// batches, pins that land outside their state, and capacities that look
// like typos. Errors exit 1; warnings are worth a look but don't block.
//
// Needs no npm install: Node 22 strips the TypeScript itself, and the hook
// below resolves the "@/..." imports to src/.

import { register } from "node:module";

register(
  "data:text/javascript," +
    encodeURIComponent(`
      export async function resolve(specifier, context, next) {
        if (specifier.startsWith("@/")) {
          const url = new URL("./src/" + specifier.slice(2) + ".ts", ${JSON.stringify(
            new URL("../", import.meta.url).href,
          )});
          return next(url.href, context);
        }
        return next(specifier, context);
      }
    `),
);

const { VENUE_BATCHES } = await import("../src/lib/venue-batches.ts");
const { parseVenueTable, importSourceId } = await import("../src/lib/venue-import.ts");

// Rough [south, north, west, east] per state, padded half a degree so a venue
// on the border doesn't trip it. Meant to catch a swapped or mistyped
// coordinate, or a sign dropped off a longitude, not to be a geocoder.
const BOUNDS = {
  Alabama: [30.1, 35.0, -88.5, -84.9],
  Alaska: [51.2, 71.4, -180, -129.9],
  Arizona: [31.3, 37.0, -114.8, -109.0],
  Arkansas: [33.0, 36.5, -94.6, -89.6],
  California: [32.5, 42.0, -124.5, -114.1],
  Colorado: [37.0, 41.0, -109.1, -102.0],
  Connecticut: [40.9, 42.1, -73.7, -71.8],
  Delaware: [38.4, 39.8, -75.8, -75.0],
  "District of Columbia": [38.8, 39.0, -77.1, -76.9],
  Florida: [24.4, 31.0, -87.6, -80.0],
  Georgia: [30.4, 35.0, -85.6, -80.8],
  Hawaii: [18.9, 22.3, -160.3, -154.8],
  Idaho: [42.0, 49.0, -117.3, -111.0],
  Illinois: [37.0, 42.5, -91.5, -87.0],
  Indiana: [37.8, 41.8, -88.1, -84.8],
  Iowa: [40.4, 43.5, -96.6, -90.1],
  Kansas: [37.0, 40.0, -102.1, -94.6],
  Kentucky: [36.5, 39.1, -89.6, -82.0],
  Louisiana: [28.9, 33.0, -94.0, -88.8],
  Maine: [43.1, 47.5, -71.1, -66.9],
  Maryland: [37.9, 39.7, -79.5, -75.0],
  Massachusetts: [41.2, 42.9, -73.5, -69.9],
  Michigan: [41.7, 48.3, -90.4, -82.4],
  Minnesota: [43.5, 49.4, -97.2, -89.5],
  Mississippi: [30.2, 35.0, -91.7, -88.1],
  Missouri: [36.0, 40.6, -95.8, -89.1],
  Montana: [44.4, 49.0, -116.1, -104.0],
  Nebraska: [40.0, 43.0, -104.1, -95.3],
  Nevada: [35.0, 42.0, -120.0, -114.0],
  "New Hampshire": [42.7, 45.3, -72.6, -70.6],
  "New Jersey": [38.9, 41.4, -75.6, -73.9],
  "New Mexico": [31.3, 37.0, -109.1, -103.0],
  "New York": [40.5, 45.0, -79.8, -71.8],
  "North Carolina": [33.8, 36.6, -84.3, -75.4],
  "North Dakota": [45.9, 49.0, -104.1, -96.6],
  Ohio: [38.4, 42.0, -84.8, -80.5],
  Oklahoma: [33.6, 37.0, -103.0, -94.4],
  Oregon: [42.0, 46.3, -124.6, -116.5],
  Pennsylvania: [39.7, 42.3, -80.5, -74.7],
  "Rhode Island": [41.1, 42.0, -71.9, -71.1],
  "South Carolina": [32.0, 35.2, -83.4, -78.5],
  "South Dakota": [42.5, 45.9, -104.1, -96.4],
  Tennessee: [35.0, 36.7, -90.3, -81.6],
  Texas: [25.8, 36.5, -106.6, -93.5],
  Utah: [37.0, 42.0, -114.1, -109.0],
  Vermont: [42.7, 45.0, -73.4, -71.5],
  Virginia: [36.5, 39.5, -83.7, -75.2],
  Washington: [45.5, 49.0, -124.8, -116.9],
  "West Virginia": [37.2, 40.6, -82.6, -77.7],
  Wisconsin: [42.5, 47.1, -92.9, -86.8],
  Wyoming: [41.0, 45.0, -111.1, -104.1],
};
const PAD = 0.5;

// Below this is an elopement spot or a typo; above it is a convention centre
// or a stray zero. Neither is wrong, both are worth a second look.
const CAPACITY_LOW = 20;
const CAPACITY_HIGH = 1000;

const errors = [];
const warnings = [];
const seenSite = new Map();
const seenName = new Map();
let total = 0;
let withCapacity = 0;
let withTier = 0;
let withPin = 0;

for (const batch of VENUE_BATCHES) {
  const parsed = parseVenueTable(batch.tsv);
  const where = (row) => `${batch.name}, row ${row.line} (${row.values.name || "no name"})`;

  if (parsed.error) {
    errors.push(`${batch.name}: ${parsed.error}`);
    continue;
  }
  if (parsed.unknownColumns.length) {
    errors.push(`${batch.name}: unrecognised columns ${parsed.unknownColumns.join(", ")} -- they'd be dropped`);
  }

  // A row with more cells than headings has a stray tab in it, which shifts
  // every later cell into the wrong column without failing the parse.
  const lines = batch.tsv.trim().split("\n");
  const width = lines[0].split("\t").length;
  lines.slice(1).forEach((line, i) => {
    const cells = line.split("\t").length;
    if (cells !== width) {
      errors.push(`${batch.name}, row ${i + 1}: ${cells} cells under ${width} headings (stray or missing tab)`);
    }
  });

  for (const row of parsed.rows) {
    total++;
    const v = row.values;
    for (const e of row.errors) errors.push(`${where(row)}: ${e} -- /admin/venues would skip this row`);

    if (!v.city) errors.push(`${where(row)}: no City -- it can't be pinned or filtered`);
    if (!v.state) errors.push(`${where(row)}: no State`);
    if (!v.website) errors.push(`${where(row)}: no Website -- it can't be de-duplicated and will import again`);
    if (!v.venue_type) warnings.push(`${where(row)}: no Venue type, so it drops out of the type filter`);
    if (!v.setting) warnings.push(`${where(row)}: no Setting`);

    const site = importSourceId(v.website);
    if (site) {
      if (seenSite.has(site)) errors.push(`${where(row)}: same website as ${seenSite.get(site)} -- only the first imports`);
      else seenSite.set(site, where(row));
    }
    const nameKey = `${v.name.toLowerCase()}|${(v.city ?? "").toLowerCase()}`;
    if (seenName.has(nameKey)) warnings.push(`${where(row)}: same name and city as ${seenName.get(nameKey)}`);
    else seenName.set(nameKey, where(row));

    if ((v.latitude === null) !== (v.longitude === null)) {
      errors.push(`${where(row)}: has only one of Latitude/Longitude -- give both or neither`);
    } else if (v.latitude !== null) {
      withPin++;
      const box = BOUNDS[v.state];
      if (v.longitude > 0) {
        errors.push(`${where(row)}: Longitude ${v.longitude} is positive -- US longitudes are negative`);
      } else if (box) {
        const [s, n, w, e] = box;
        const inside = (lat, lng) => lat >= s - PAD && lat <= n + PAD && lng >= w - PAD && lng <= e + PAD;
        if (!inside(v.latitude, v.longitude)) {
          const swapped = inside(v.longitude, v.latitude) ? " (looks swapped)" : "";
          errors.push(`${where(row)}: pin ${v.latitude}, ${v.longitude} is outside ${v.state}${swapped} -- fix it or leave both blank`);
        }
      }
    }

    if (v.capacity !== null) {
      withCapacity++;
      if (v.capacity < CAPACITY_LOW || v.capacity > CAPACITY_HIGH) {
        warnings.push(`${where(row)}: capacity ${v.capacity} -- check it's the seated wedding maximum`);
      }
    }
    if (v.price_tier) withTier++;
  }
}

for (const w of warnings) console.log(`warn   ${w}`);
for (const e of errors) console.log(`ERROR  ${e}`);
const pct = (n) => `${total ? Math.round((n / total) * 100) : 0}%`;
console.log(
  `\n${VENUE_BATCHES.length} batches, ${total} venues. Capacity on ${pct(withCapacity)}, ` +
    `price tier on ${pct(withTier)}, pinned on ${pct(withPin)}. ` +
    `${errors.length} errors, ${warnings.length} warnings.`,
);
process.exit(errors.length ? 1 : 0);
