import "server-only";
import { ALCOHOL_POLICIES, AMENITY_OPTIONS, MUSIC_END_TIMES, INCLUDED_OPTIONS, PRICE_BASES, SERVICE_LEVELS, STATES, STYLE_TIERS, VENDOR_POLICIES, VENDOR_PRICE_UNITS, VENUE_SETTINGS, VENUE_TYPES } from "@/lib/wedding-options";
import type { ListingFields } from "@/lib/ai/listing-reader";
import { CANCELLATION_POLICY_MAX, REPLY_TIMES } from "@/lib/business-facts";

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
    hint: "anything else couples should know that the other fields don't cover: travel fees, restrictions",
  },
  founded_year: { spec: { type: "int", max: 2100 }, hint: 'the year they started, only if stated ("since 2012")' },
  weddings_per_year: { spec: { type: "int", max: 2000 }, hint: "weddings they do a year, only if stated" },
  booking_lead_months: { spec: { type: "int", max: 48 }, hint: "how many months ahead couples usually book them, only if stated" },
  reply_time: {
    spec: { type: "enum", options: Object.keys(REPLY_TIMES) },
    hint: `how fast they reply to inquiries, only if stated: ${Object.entries(REPLY_TIMES).map(([k, v]) => `${k} = ${v}`).join("; ")}`,
  },
  deposit_percent: { spec: { type: "int", max: 100 }, hint: "deposit to book, as a percentage of the total; only if stated as one" },
  balance_due_days: { spec: { type: "int", max: 365 }, hint: "days before the wedding the balance is due; 0 = on the day" },
  cancellation_policy: { spec: { type: "text", max: CANCELLATION_POLICY_MAX }, hint: "their cancellation or postponement terms, in a sentence or two" },
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
  price_basis: {
    spec: { type: "enum", options: Object.keys(PRICE_BASES) },
    hint: `what price_from is: ${Object.entries(PRICE_BASES).map(([k, v]) => `${k} = ${v}`).join("; ")}. Only if stated`,
  },
  included_items: {
    spec: { type: "list" },
    hint: `what the rental includes, using these exact names where they fit: ${INCLUDED_OPTIONS.join(", ")}`,
  },
  amenities: {
    spec: { type: "list" },
    hint: `the venue's amenities, using these exact names where they fit: ${AMENITY_OPTIONS.join(", ")}`,
  },
  tiktok_url: { spec: { type: "url" }, hint: "full TikTok URL" },
  youtube_url: { spec: { type: "url" }, hint: "full YouTube channel URL" },
  lodging_sleeps: { spec: { type: "int", max: 1000 }, hint: "how many guests on-site lodging sleeps" },
  parking: { spec: { type: "text", max: 200 }, hint: "parking arrangements" },
  wheelchair_accessible: { spec: { type: "bool" }, hint: "only if stated" },
  pets_allowed: { spec: { type: "bool" }, hint: "only if stated" },
  music_until: { spec: { type: "enum", options: MUSIC_END_TIMES }, hint: "when amplified music has to stop, only if stated" },
  rain_plan: { spec: { type: "text", max: 300 }, hint: "where an outdoor ceremony moves if it rains" },
  alcohol_policy: {
    spec: { type: "enum", options: Object.keys(ALCOHOL_POLICIES) },
    hint: `${Object.entries(ALCOHOL_POLICIES).map(([k, v]) => `${k} = ${v}`).join("; ")}. Only if stated`,
  },
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
