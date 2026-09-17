import { STATES, STYLE_TIERS, VENUE_SETTINGS, VENUE_TYPES } from "@/lib/wedding-options";
import { mapColumns, readTable } from "@/lib/spreadsheet";

/**
 * Parses a pasted spreadsheet of venues into rows ready for insert.
 *
 * Shared by the admin paste box and the server action behind it. The client
 * preview is a convenience; the action re-parses the same text with this
 * module rather than trusting what the browser sends.
 */

export type VenueImportValues = {
  name: string;
  state: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  venue_type: string | null;
  setting: string | null;
  capacity: number | null;
  price_tier: string | null;
  description: string | null;
  about: string | null;
  included: string | null;
  amenities: string[];
  image_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  website: string | null;
};

export type VenueImportRow = {
  /** 1-based row number as the pasting human counts them, header excluded. */
  line: number;
  values: VenueImportValues;
  /** Blocking problems. A row with any of these is never inserted. */
  errors: string[];
};

export type VenueImportParse = {
  rows: VenueImportRow[];
  /** Set when nothing could be parsed at all -- bad header, empty paste. */
  error?: string;
  /** Header columns that matched no known field, so the paster can spot a typo. */
  unknownColumns: string[];
};

/**
 * Column headings we accept, normalised. Aliases exist because the heading a
 * spreadsheet already has ("zip", "max guests") is rarely our column name,
 * and making someone rename columns to import is most of the friction.
 */
const FIELD_ALIASES: Record<string, keyof VenueImportValues> = {
  name: "name",
  venue: "name",
  venuename: "name",
  state: "state",
  city: "city",
  town: "city",
  latitude: "latitude",
  lat: "latitude",
  longitude: "longitude",
  lng: "longitude",
  long: "longitude",
  venuetype: "venue_type",
  type: "venue_type",
  setting: "setting",
  capacity: "capacity",
  maxguests: "capacity",
  guests: "capacity",
  pricetier: "price_tier",
  price: "price_tier",
  tier: "price_tier",
  description: "description",
  summary: "description",
  about: "about",
  included: "included",
  includes: "included",
  amenities: "amenities",
  features: "amenities",
  imageurl: "image_url",
  image: "image_url",
  photo: "image_url",
  contactemail: "contact_email",
  email: "contact_email",
  contactphone: "contact_phone",
  phone: "contact_phone",
  website: "website",
  url: "website",
  site: "website",
};

function optionError(label: string, value: string, allowed: readonly string[]) {
  // Short lists are worth spelling out; the 50 states are not, and printing
  // them turns one bad cell into a wall of text in the preview.
  if (allowed.length > 8) return `${label} "${value}" isn't one we recognise`;
  return `${label} "${value}" isn't one of: ${allowed.join(", ")}`;
}

function toNumber(raw: string) {
  // Tolerate what spreadsheets produce: "1,200", "$1200", " 120 ".
  const cleaned = raw.replace(/[$,\s]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : NaN;
}

export function parseVenueTable(text: string): VenueImportParse {
  const table = readTable(text);
  if (table.length === 0) {
    return { rows: [], error: "Nothing pasted yet.", unknownColumns: [] };
  }

  const { columnField, unknownColumns } = mapColumns<keyof VenueImportValues>(
    table[0],
    FIELD_ALIASES,
  );

  if (!columnField.includes("name")) {
    return {
      rows: [],
      error:
        'No "name" column found. The first row must be headings — at minimum a Name column.',
      unknownColumns,
    };
  }

  const body = table.slice(1);
  if (body.length === 0) {
    return {
      rows: [],
      error: "Found headings but no venues underneath them.",
      unknownColumns,
    };
  }

  const rows = body.map((cells, index) => {
    const cell = (field: keyof VenueImportValues) => {
      const at = columnField.indexOf(field);
      return at === -1 ? "" : (cells[at] ?? "").trim();
    };

    const errors: string[] = [];

    const name = cell("name");
    if (!name) errors.push("Name is required");

    function numeric(field: keyof VenueImportValues, label: string) {
      const raw = cell(field);
      if (!raw) return null;
      const n = toNumber(raw);
      if (n === null) return null;
      if (Number.isNaN(n)) {
        errors.push(`${label} "${raw}" isn't a number`);
        return null;
      }
      return n;
    }

    function option(field: keyof VenueImportValues, label: string, allowed: readonly string[]) {
      const raw = cell(field);
      if (!raw) return null;
      const match = allowed.find((a) => a.toLowerCase() === raw.toLowerCase());
      if (!match) {
        // Not a warning: an unrecognised value silently drops the venue out
        // of that filter on /venues, which is worse than refusing the row.
        errors.push(optionError(label, raw, allowed));
        return null;
      }
      return match;
    }

    const capacity = numeric("capacity", "Capacity");
    if (capacity !== null && (capacity <= 0 || !Number.isInteger(capacity))) {
      errors.push(`Capacity "${cell("capacity")}" should be a whole number above zero`);
    }

    const latitude = numeric("latitude", "Latitude");
    if (latitude !== null && (latitude < -90 || latitude > 90)) {
      errors.push(`Latitude ${latitude} is outside -90 to 90`);
    }
    const longitude = numeric("longitude", "Longitude");
    if (longitude !== null && (longitude < -180 || longitude > 180)) {
      errors.push(`Longitude ${longitude} is outside -180 to 180`);
    }

    const email = cell("contact_email");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push(`Contact email "${email}" doesn't look like an address`);
    }

    let website = cell("website") || null;
    if (website && !/^https?:\/\//i.test(website)) website = `https://${website}`;

    const values: VenueImportValues = {
      name,
      state: option("state", "State", STATES),
      city: cell("city") || null,
      latitude,
      longitude,
      venue_type: option("venue_type", "Venue type", VENUE_TYPES),
      setting: option("setting", "Setting", VENUE_SETTINGS),
      capacity,
      price_tier: option("price_tier", "Price tier", STYLE_TIERS),
      description: cell("description") || null,
      about: cell("about") || null,
      included: cell("included") || null,
      amenities: cell("amenities")
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
      image_url: cell("image_url") || null,
      contact_email: email || null,
      contact_phone: cell("contact_phone") || null,
      website,
    };

    return { line: index + 1, values, errors };
  });

  return { rows, unknownColumns };
}

/** The heading row to hand someone starting from a blank sheet. */
export const VENUE_IMPORT_TEMPLATE = [
  "Name",
  "City",
  "State",
  "Venue type",
  "Setting",
  "Capacity",
  "Price tier",
  "Description",
  "Amenities",
  "Email",
  "Phone",
  "Website",
].join("\t");
