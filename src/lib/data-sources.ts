// Every outside source of data the product stores or shows, with its terms.
// The rule (docs/ai-operating-system/data-intelligence-plan.md §3): nothing
// from a new source is imported or displayed until it has an entry here, with
// its terms read and dated. /data-sources renders the public half of this
// list, so attribution lives in one place.
//
// Kept in code rather than a table: a new source only arrives with new import
// code, so it gets reviewed in the same PR.

export type DataSource = {
  id: string;
  name: string;
  url: string;
  /** Where its licence or terms are, when it publishes any. */
  termsUrl?: string;
  licence: string;
  /** The day someone last read the terms (YYYY-MM-DD). Re-read quarterly. */
  termsCheckedAt: string;
  /** Credit line exactly as the source asks for it, if it asks. */
  attribution?: string;
  /** What we use it for, written for couples and businesses. */
  usedFor: string;
  /** What its terms let us do with it. */
  may: { store: boolean; display: boolean; derive: boolean };
  /** Internal only: limits, caveats, open questions. Not shown publicly. */
  notes?: string;
};

export const DATA_SOURCES = [
  {
    id: "business-websites",
    name: "Businesses' own websites",
    url: "https://youdoido.com/venues",
    licence: "Each business's own content; we record facts and write descriptions ourselves",
    termsCheckedAt: "2026-10-21",
    usedFor:
      "Names, addresses, contact details, prices and what's included on venue and vendor listings. Each fact comes from the business's own site, not from other directories.",
    may: { store: true, display: true, derive: true },
    notes:
      "Directories (The Knot, WeddingWire, Zola, Here Comes the Guide) may only be used to find names; their terms forbid copying. Crawlers identify as YouDoIDoBot.",
  },
  {
    id: "business-submitted",
    name: "Businesses that claim their listing",
    url: "https://youdoido.com/claim",
    licence: "Submitted by the business under our Terms",
    termsCheckedAt: "2026-10-21",
    usedFor: "Details, photos and prices a venue or vendor adds or corrects after claiming its listing.",
    may: { store: true, display: true, derive: true },
  },
  {
    id: "couple-quotes",
    name: "Couples' own quotes (in aggregate)",
    url: "https://youdoido.com/privacy",
    licence: "Our Privacy Policy; only totals of five or more quotes, never one couple's figure",
    termsCheckedAt: "2026-10-21",
    usedFor: "Where enough couples in a state have entered real quotes, the estimate for that category uses them.",
    may: { store: true, display: true, derive: true },
    notes: "Minimum 5 quotes per state and category (src/app/admin/cost-data/actions.ts MIN_SAMPLES).",
  },
  {
    id: "youdoido-baseline",
    name: "You Do, I Do cost estimates",
    url: "https://youdoido.com/estimate",
    licence: "Our own",
    termsCheckedAt: "2026-10-21",
    usedFor:
      "The starting national figure for each budget category, adjusted for region, season, style and guest count, plus the 20% service charge and 5% cushion assumptions. Estimates, not quotes.",
    may: { store: true, display: true, derive: true },
    notes:
      "Placeholders with no written methodology yet (src/lib/budget-categories.ts). Replacing them with dated, sourced benchmarks is roadmap step 4.",
  },
  {
    id: "tax-foundation-sales-tax",
    name: "Tax Foundation, State and Local Sales Tax Rates (July 2026)",
    url: "https://taxfoundation.org/data/all/state/2026-sales-tax-rates-midyear/",
    licence: "© Tax Foundation; we use the published average rates, with credit",
    termsCheckedAt: "2026-10-21",
    attribution: "Sales tax rates: Tax Foundation, State and Local Sales Tax Rates, Midyear 2026.",
    usedFor: "The average sales tax rate for each state on the budget's Sales Tax line.",
    may: { store: true, display: true, derive: true },
    notes:
      "Page states no reuse licence beyond its copyright notice; we hold 51 rate figures (facts) and credit the source. Refresh each January and July (src/lib/estimate-add-ons.ts).",
  },
  {
    id: "us-census-geocoder",
    name: "U.S. Census Bureau Geocoder and TIGERweb",
    url: "https://geocoding.geo.census.gov/geocoder/",
    licence: "U.S. government work",
    termsCheckedAt: "2026-10-21",
    usedFor: "Placing venues and vendors on the map from their street address or town.",
    may: { store: true, display: true, derive: true },
    notes:
      "No explicit public-domain statement found on the geocoder page. Interpolated street-segment points, not rooftop. If the Census Data API is used later, its required notice must be added as attribution.",
  },
  {
    id: "openstreetmap",
    name: "OpenStreetMap",
    url: "https://www.openstreetmap.org",
    termsUrl: "https://www.openstreetmap.org/copyright",
    licence: "Open Database License (ODbL)",
    termsCheckedAt: "2026-10-21",
    attribution: "© OpenStreetMap contributors",
    usedFor:
      "The map data under every map (streets, parks, water, place names), and finding a venue's spot when the Census can't.",
    may: { store: true, display: true, derive: true },
    notes:
      "Nominatim: max 1 request/second, real User-Agent, no heavy bulk use (capped at 500 lookups per import run). Tiles from tile.openstreetmap.org are for light use; they're now only the no-WebGL fallback (src/lib/map-tiles.ts). Don't merge OSM fields into listing rows (share-alike).",
  },
] as const satisfies readonly DataSource[];

export type DataSourceId = (typeof DATA_SOURCES)[number]["id"];

export function dataSource(id: DataSourceId): DataSource {
  return DATA_SOURCES.find((source) => source.id === id)!;
}
