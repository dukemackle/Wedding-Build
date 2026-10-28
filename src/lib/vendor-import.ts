import { STATES, VENDOR_LISTING_CATEGORIES } from "@/lib/wedding-options";
import { mapColumns, readTable } from "@/lib/spreadsheet";
import type { VendorPriceUnit } from "@/lib/supabase/types";

/**
 * Parses a tab-separated table of vendors into rows ready for insert -- the
 * vendor twin of venue-import.ts, read by the bundled batches in
 * vendor-batches.ts. De-duplication uses the same website key as venues
 * (`importSourceId` in venue-import.ts).
 */

export type VendorImportValues = {
  name: string;
  category: string;
  state: string | null;
  city: string | null;
  /** Street line of a studio or shop couples can visit; blank for home-based vendors. */
  address: string | null;
  service_area: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  website: string | null;
  instagram_url: string | null;
  /** The vendor's published starting price, whole dollars. */
  price_from: number | null;
  price_unit: VendorPriceUnit | null;
};

export type VendorImportRow = {
  /** 1-based row number, header excluded. */
  line: number;
  values: VendorImportValues;
  /** Blocking problems. A row with any of these is never inserted. */
  errors: string[];
};

export type VendorImportParse = {
  rows: VendorImportRow[];
  error?: string;
  unknownColumns: string[];
};

const FIELD_ALIASES: Record<string, keyof VendorImportValues> = {
  name: "name",
  vendor: "name",
  vendorname: "name",
  category: "category",
  type: "category",
  state: "state",
  city: "city",
  town: "city",
  address: "address",
  street: "address",
  streetaddress: "address",
  servicearea: "service_area",
  serves: "service_area",
  latitude: "latitude",
  lat: "latitude",
  longitude: "longitude",
  lng: "longitude",
  long: "longitude",
  description: "description",
  summary: "description",
  email: "contact_email",
  contactemail: "contact_email",
  phone: "contact_phone",
  contactphone: "contact_phone",
  website: "website",
  url: "website",
  site: "website",
  instagram: "instagram_url",
  instagramurl: "instagram_url",
  pricefrom: "price_from",
  startingprice: "price_from",
  price: "price_from",
  priceunit: "price_unit",
  priceper: "price_unit",
};

/** How a batch file writes a price unit, to the stored value. */
const PRICE_UNIT_WORDS: Record<string, VendorPriceUnit> = {
  package: "package",
  "per package": "package",
  event: "event",
  "per event": "event",
  hour: "hour",
  "per hour": "hour",
  guest: "guest",
  "per guest": "guest",
  "per person": "guest",
};

function withScheme(url: string) {
  return url && !/^https?:\/\//i.test(url) ? `https://${url}` : url;
}

function coordinate(raw: string, label: string, limit: number, errors: string[]) {
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || Math.abs(n) > limit) {
    errors.push(`${label} "${raw}" isn't a coordinate`);
    return null;
  }
  return n;
}

export function parseVendorTable(text: string): VendorImportParse {
  const table = readTable(text);
  if (table.length === 0) return { rows: [], error: "Nothing pasted yet.", unknownColumns: [] };

  const { columnField, unknownColumns } = mapColumns<keyof VendorImportValues>(table[0], FIELD_ALIASES);
  if (!columnField.includes("name") || !columnField.includes("category")) {
    return { rows: [], error: 'The first row must be headings, with at least Name and Category.', unknownColumns };
  }

  const rows = table.slice(1).map((cells, index) => {
    const cell = (field: keyof VendorImportValues) => {
      const at = columnField.indexOf(field);
      return at === -1 ? "" : (cells[at] ?? "").trim();
    };
    const errors: string[] = [];

    const name = cell("name");
    if (!name) errors.push("Name is required");

    // Refused rather than stored as typed: a category outside the list drops
    // the vendor out of every category filter on /vendors.
    const rawCategory = cell("category");
    const category = VENDOR_LISTING_CATEGORIES.find((c) => c.toLowerCase() === rawCategory.toLowerCase());
    if (!category) errors.push(`Category "${rawCategory}" isn't one we list`);

    const rawState = cell("state");
    const state = STATES.find((s) => s.toLowerCase() === rawState.toLowerCase()) ?? null;
    if (rawState && !state) errors.push(`State "${rawState}" isn't one we recognise`);

    const email = cell("contact_email");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push(`Email "${email}" doesn't look like an address`);
    }

    const rawPrice = cell("price_from");
    const price = rawPrice ? Number(rawPrice.replace(/[$,\s]/g, "")) : null;
    if (price !== null && (!Number.isInteger(price) || price <= 0)) {
      errors.push(`Price from "${rawPrice}" should be whole dollars above zero`);
    }
    const rawUnit = cell("price_unit");
    const priceUnit = rawUnit ? (PRICE_UNIT_WORDS[rawUnit.toLowerCase()] ?? null) : null;
    if (rawUnit && !priceUnit) {
      errors.push(`Price unit "${rawUnit}" isn't one of: package, per event, per hour, per person`);
    }
    // A caterer's $65 and a photographer's $3,200 are both "from" prices;
    // without the unit neither means anything.
    if (rawPrice && !rawUnit) errors.push("Price from needs a Price unit");
    if (rawUnit && !rawPrice) errors.push("Price unit needs a Price from");
    const priced = price !== null && Number.isInteger(price) && price > 0 && priceUnit !== null;

    const values: VendorImportValues = {
      name,
      category: category ?? "",
      state,
      city: cell("city") || null,
      address: cell("address") || null,
      service_area: cell("service_area") || null,
      latitude: coordinate(cell("latitude"), "Latitude", 90, errors),
      longitude: coordinate(cell("longitude"), "Longitude", 180, errors),
      description: cell("description") || null,
      contact_email: email || null,
      contact_phone: cell("contact_phone") || null,
      website: withScheme(cell("website")) || null,
      instagram_url: withScheme(cell("instagram_url")) || null,
      price_from: priced ? price : null,
      price_unit: priced ? priceUnit : null,
    };

    return { line: index + 1, values, errors };
  });

  return { rows, unknownColumns };
}
