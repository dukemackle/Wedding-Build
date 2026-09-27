import "server-only";
import { SERVICE_LEVELS, STATES, STYLE_TIERS, VENDOR_POLICIES, VENDOR_PRICE_UNITS, VENUE_SETTINGS, VENUE_TYPES } from "@/lib/wedding-options";
import type { ListingFields } from "@/lib/ai/listing-reader";

// What "Fill this in for me" may fill on each form, with the limits the
// claim validators enforce -- so a drafted value is one the form accepts.

const shared: ListingFields = {
  name: { spec: { type: "text", max: 120 }, hint: "the business name" },
  city: { spec: { type: "text", max: 80 }, hint: "the town they're based in" },
  state: { spec: { type: "enum", options: STATES }, hint: "US state, spelled out" },
  price_from: { spec: { type: "int", max: 10_000_000 }, hint: "lowest starting price, dollars" },
  price_note: { spec: { type: "text", max: 80 }, hint: 'what that starting price covers, e.g. "Friday, up to 50 guests"' },
  description: { spec: { type: "text", max: 200 }, hint: "one line couples see on the card" },
  about: { spec: { type: "text", max: 3000 }, hint: "a few paragraphs about them, their style and how they work" },
  included: { spec: { type: "text", max: 2000 }, hint: "what's included in their packages or rental" },
  good_to_know: {
    spec: { type: "text", max: 2000 },
    hint: "anything else couples should know: booking lead time, deposit, travel fees, restrictions",
  },
  amenities: { spec: { type: "list" }, hint: "short tags for services, extras or amenities" },
  contact_email: { spec: { type: "email" }, hint: "public contact email" },
  contact_phone: { spec: { type: "text", max: 40 }, hint: "public phone number" },
  website: { spec: { type: "url" }, hint: "their website" },
  instagram_url: { spec: { type: "url" }, hint: "full Instagram URL" },
  facebook_url: { spec: { type: "url" }, hint: "full Facebook URL" },
  pinterest_url: { spec: { type: "url" }, hint: "full Pinterest URL" },
};

export const VENUE_READ_FIELDS: ListingFields = {
  ...shared,
  address: { spec: { type: "text", max: 200 }, hint: "street address, without town and state" },
  venue_type: { spec: { type: "enum", options: VENUE_TYPES }, hint: "the closest kind of venue" },
  setting: { spec: { type: "enum", options: VENUE_SETTINGS }, hint: "where ceremonies/receptions happen" },
  capacity: { spec: { type: "int", max: 5000 }, hint: "maximum seated guests" },
  capacity_standing: { spec: { type: "int", max: 10000 }, hint: "maximum standing guests" },
  price_tier: { spec: { type: "enum", options: STYLE_TIERS }, hint: "overall price level" },
  service_level: {
    spec: { type: "enum", options: Object.keys(SERVICE_LEVELS) },
    hint: `${Object.entries(SERVICE_LEVELS).map(([k, v]) => `${k} = ${v}`).join("; ")}`,
  },
  vendor_policy: {
    spec: { type: "enum", options: Object.keys(VENDOR_POLICIES) },
    hint: `${Object.entries(VENDOR_POLICIES).map(([k, v]) => `${k} = ${v}`).join("; ")}`,
  },
  lodging_sleeps: { spec: { type: "int", max: 1000 }, hint: "how many guests on-site lodging sleeps" },
  parking: { spec: { type: "text", max: 200 }, hint: "parking arrangements" },
  wheelchair_accessible: { spec: { type: "bool" }, hint: "only if stated" },
  pets_allowed: { spec: { type: "bool" }, hint: "only if stated" },
};

export const VENDOR_READ_FIELDS: ListingFields = {
  ...shared,
  service_area: { spec: { type: "text", max: 120 }, hint: 'where they work, e.g. "Austin + 100 miles"' },
  price_unit: {
    spec: { type: "enum", options: Object.keys(VENDOR_PRICE_UNITS) },
    hint: `what the starting price is per: ${Object.entries(VENDOR_PRICE_UNITS).map(([k, v]) => `${k} = ${v}`).join("; ")}`,
  },
  price_tier: { spec: { type: "enum", options: STYLE_TIERS }, hint: "overall price level" },
};
