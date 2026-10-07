import {
  PREFERRED_VENDOR_CATEGORIES,
  PRICE_BASES,
  SERVICE_LEVELS,
  STATES,
  STYLE_TIERS,
  VENDOR_POLICIES,
  VENUE_SETTINGS,
  VENUE_TYPES,
} from "@/lib/wedding-options";
import type { PriceBasis, PriceOption, ServiceLevel, Venue, VendorPolicy } from "@/lib/supabase/types";

/**
 * What a venue can submit through its claim link, and the checks on it.
 *
 * Shared by the claim form (to show problems as they type) and the server
 * action (which re-checks everything -- the form is a convenience, the link is
 * public, and nothing the browser sends is trusted).
 */

export const MAX_CLAIM_PHOTOS = 10;
export const MAX_CLAIM_PHOTO_BYTES = 10 * 1024 * 1024;
export const CLAIM_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_PREFERRED_VENDORS = 40;
const MAX_FAQS = 20;
const MAX_SPACES = 12;
export const MAX_PRICE_OPTIONS = 8;

/** The venue columns a venue may change. Everything else stays admin-only. */
export type ClaimDetails = {
  name: string;
  city: string | null;
  state: string | null;
  venue_type: string | null;
  setting: string | null;
  address: string | null;
  capacity: number | null;
  capacity_standing: number | null;
  price_tier: string | null;
  price_from: number | null;
  price_note: string | null;
  price_basis: PriceBasis | null;
  /** Amount is null only while a row is half-filled on the form; never stored so. */
  price_options: { label: string; amount: number | null }[];
  service_level: ServiceLevel | null;
  vendor_policy: VendorPolicy | null;
  description: string | null;
  about: string | null;
  included: string | null;
  included_items: string[];
  good_to_know: string | null;
  amenities: string[];
  contact_email: string | null;
  contact_phone: string | null;
  website: string | null;
  lodging_sleeps: number | null;
  parking: string | null;
  wheelchair_accessible: boolean | null;
  pets_allowed: boolean | null;
  instagram_url: string | null;
  facebook_url: string | null;
  pinterest_url: string | null;
  tiktok_url: string | null;
  youtube_url: string | null;
  reviews_url: string | null;
};

export type ClaimSpace = {
  name: string;
  description: string | null;
  capacity: number | null;
  setting: string | null;
  photo_url: string | null;
};

export type ClaimFaq = { question: string; answer: string };

export type ClaimPreferredVendor = {
  category: string;
  name: string;
  website: string | null;
  /** "You must book from these" rather than "we recommend these". Older submissions lack it. */
  required?: boolean;
};

export type ClaimSubmission = {
  details: ClaimDetails;
  faqs: ClaimFaq[];
  preferredVendors: ClaimPreferredVendor[];
  spaces: ClaimSpace[];
  photoUrls: string[];
  submitter: { name: string; email: string; role: string | null; represents: boolean };
};

export const CLAIM_FIELD_LABELS: Record<keyof ClaimDetails, string> = {
  name: "Name",
  city: "Town",
  state: "State",
  venue_type: "Venue type",
  setting: "Setting",
  address: "Street address",
  capacity: "Seated capacity",
  capacity_standing: "Standing capacity",
  price_tier: "Price level",
  price_from: "Starting price",
  price_note: "Price covers",
  price_basis: "Pricing",
  price_options: "Other prices",
  service_level: "What's provided",
  vendor_policy: "Vendor policy",
  description: "Short description",
  about: "About",
  included: "Anything else included",
  included_items: "What's included",
  good_to_know: "Good to know",
  amenities: "Amenities",
  contact_email: "Email",
  contact_phone: "Phone",
  website: "Website",
  lodging_sleeps: "Lodging sleeps",
  parking: "Parking",
  wheelchair_accessible: "Wheelchair accessible",
  pets_allowed: "Pets allowed",
  instagram_url: "Instagram",
  facebook_url: "Facebook",
  pinterest_url: "Pinterest",
  tiktok_url: "TikTok",
  youtube_url: "YouTube",
  reviews_url: "Reviews page",
};

// Generous, but bounded: the listing page has to hold whatever gets approved.
const LIMITS: Partial<Record<keyof ClaimDetails, number>> = {
  name: 120,
  city: 80,
  address: 200,
  price_note: 80,
  parking: 200,
  description: 200,
  about: 3000,
  included: 2000,
  good_to_know: 2000,
  contact_email: 200,
  contact_phone: 40,
  website: 300,
};

export function detailsFromVenue(venue: Venue): ClaimDetails {
  return {
    name: venue.name,
    city: venue.city,
    state: venue.state,
    venue_type: venue.venue_type,
    setting: venue.setting,
    address: venue.address,
    capacity: venue.capacity,
    capacity_standing: venue.capacity_standing,
    price_tier: venue.price_tier,
    price_from: venue.price_from,
    price_note: venue.price_note,
    price_basis: venue.price_basis,
    price_options: venue.price_options ?? [],
    service_level: venue.service_level,
    vendor_policy: venue.vendor_policy,
    description: venue.description,
    about: venue.about,
    included: venue.included,
    included_items: venue.included_items ?? [],
    good_to_know: venue.good_to_know,
    amenities: venue.amenities,
    contact_email: venue.contact_email,
    contact_phone: venue.contact_phone,
    website: venue.website,
    lodging_sleeps: venue.lodging_sleeps,
    parking: venue.parking,
    wheelchair_accessible: venue.wheelchair_accessible,
    pets_allowed: venue.pets_allowed,
    instagram_url: venue.instagram_url,
    facebook_url: venue.facebook_url,
    pinterest_url: venue.pinterest_url,
    tiktok_url: venue.tiktok_url,
    youtube_url: venue.youtube_url,
    reviews_url: venue.reviews_url,
  };
}

export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function normaliseWebsite(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

const SOCIAL_HOSTS = {
  instagram_url: "https://www.instagram.com/",
  facebook_url: "https://www.facebook.com/",
  pinterest_url: "https://www.pinterest.com/",
  tiktok_url: "https://www.tiktok.com/@",
  youtube_url: "https://www.youtube.com/@",
} as const;

/**
 * Turns "@thebarn", "thebarn" or "instagram.com/thebarn" into a full link.
 * Business owners know their handle far better than their profile URL.
 */
export function socialUrl(network: keyof typeof SOCIAL_HOSTS, raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  if (/^@?[\w.-]+$/.test(value) && !/\.(com|net|org|co)$/i.test(value)) {
    return SOCIAL_HOSTS[network] + value.replace(/^@/, "");
  }
  return normaliseWebsite(value);
}

export function isUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

/**
 * Checks and tidies a submission. Returns the cleaned copy and a list of
 * problems; a submission with any problem is never stored.
 */
export function validateClaim(input: ClaimSubmission): { value: ClaimSubmission; errors: string[] } {
  const errors: string[] = [];
  const d = input.details ?? ({} as ClaimDetails);

  const text = (key: keyof ClaimDetails) => {
    const value = clean(d[key]);
    const limit = LIMITS[key];
    if (limit && value.length > limit) {
      errors.push(`${CLAIM_FIELD_LABELS[key]} is too long (${limit} characters at most).`);
    }
    return value || null;
  };
  const option = (key: keyof ClaimDetails, allowed: readonly string[]) => {
    const value = clean(d[key]);
    if (value && !allowed.includes(value)) errors.push(`Pick a ${CLAIM_FIELD_LABELS[key].toLowerCase()} from the list.`);
    return value || null;
  };

  const name = text("name");
  if (!name) errors.push("Your venue needs a name.");

  const whole = (raw: unknown, label: string, max: number) => {
    if (raw === null || raw === undefined || String(raw).trim() === "") return null;
    const n = Number(raw);
    if (!Number.isInteger(n) || n < 0 || n > max) {
      errors.push(`${label} should be a whole number.`);
      return null;
    }
    return n;
  };
  const yesNo = (raw: unknown) => (raw === true ? true : raw === false ? false : null);
  const link = (key: keyof ClaimDetails) => {
    const url = normaliseWebsite(clean(d[key]));
    if (url && !isUrl(url)) errors.push(`The ${CLAIM_FIELD_LABELS[key]} link doesn't look like a web address.`);
    return url;
  };

  const social = (key: keyof typeof SOCIAL_HOSTS) => {
    const url = socialUrl(key, clean(d[key]));
    if (url && !isUrl(url)) errors.push(`The ${CLAIM_FIELD_LABELS[key]} link doesn't look like a web address.`);
    return url;
  };

  const capacity = whole(d.capacity, "Seated capacity", 10000);
  const capacityStanding = whole(d.capacity_standing, "Standing capacity", 10000);
  const priceFrom = whole(d.price_from, "Starting price", 10_000_000);
  const lodgingSleeps = whole(d.lodging_sleeps, "Lodging", 1000);

  const email = text("contact_email");
  if (email && !EMAIL.test(email)) errors.push("The contact email doesn't look like an address.");

  const website = normaliseWebsite(clean(d.website));
  if (website && !isUrl(website)) errors.push("The website doesn't look like a web address.");

  const tags = (raw: unknown) =>
    [...new Set((Array.isArray(raw) ? raw : []).map(clean).filter(Boolean))].map((t) => t.slice(0, 60)).slice(0, 30);
  const amenities = tags(d.amenities);
  const includedItems = tags(d.included_items);

  const priceBasis = option("price_basis", Object.keys(PRICE_BASES)) as PriceBasis | null;
  const priceOptions: PriceOption[] = [];
  for (const o of Array.isArray(d.price_options) ? d.price_options : []) {
    const label = clean(o?.label);
    const amount = whole(o?.amount, "Each price", 10_000_000);
    if (!label && amount === null) continue;
    if (!label) errors.push("Each extra price needs a name, like “Saturday” or “Extra day”.");
    else if (label.length > 40) errors.push(`“${label.slice(0, 20)}…” is too long a price name.`);
    if (amount === null) errors.push(`Add a price for ${label || "each extra price"}.`);
    if (label && amount !== null) priceOptions.push({ label, amount });
  }
  if (priceOptions.length > MAX_PRICE_OPTIONS) errors.push(`Keep it to ${MAX_PRICE_OPTIONS} extra prices.`);
  // "Ask us" means no number goes on the listing, whatever was typed before.
  const askOnly = priceBasis === "ask";

  const details: ClaimDetails = {
    name: name ?? "",
    city: text("city"),
    state: option("state", STATES),
    venue_type: option("venue_type", VENUE_TYPES),
    setting: option("setting", VENUE_SETTINGS),
    address: text("address"),
    capacity,
    capacity_standing: capacityStanding,
    price_tier: option("price_tier", STYLE_TIERS),
    price_from: askOnly ? null : priceFrom,
    price_note: text("price_note"),
    price_basis: priceBasis,
    price_options: askOnly ? [] : priceOptions,
    service_level: option("service_level", Object.keys(SERVICE_LEVELS)) as ServiceLevel | null,
    vendor_policy: option("vendor_policy", Object.keys(VENDOR_POLICIES)) as VendorPolicy | null,
    description: text("description"),
    about: text("about"),
    included: text("included"),
    included_items: includedItems,
    good_to_know: text("good_to_know"),
    amenities,
    contact_email: email,
    contact_phone: text("contact_phone"),
    website,
    lodging_sleeps: lodgingSleeps,
    parking: text("parking"),
    wheelchair_accessible: yesNo(d.wheelchair_accessible),
    pets_allowed: yesNo(d.pets_allowed),
    instagram_url: social("instagram_url"),
    facebook_url: social("facebook_url"),
    pinterest_url: social("pinterest_url"),
    tiktok_url: social("tiktok_url"),
    youtube_url: social("youtube_url"),
    reviews_url: link("reviews_url"),
  };

  const faqs = (Array.isArray(input.faqs) ? input.faqs : [])
    .map((f) => ({ question: clean(f?.question), answer: clean(f?.answer) }))
    // A question with no answer is dropped rather than refused: the form
    // starts with suggested questions, and skipping one is expected.
    .filter((f) => f.answer);
  if (faqs.length > MAX_FAQS) errors.push(`Keep it to ${MAX_FAQS} questions.`);
  if (faqs.some((f) => !f.question)) errors.push("One of your answers is missing its question.");
  if (faqs.some((f) => f.question.length > 300 || f.answer.length > 2000)) {
    errors.push("One of the questions or answers is too long.");
  }

  const preferredVendors = (Array.isArray(input.preferredVendors) ? input.preferredVendors : [])
    .map((v) => ({
      category: clean(v?.category),
      name: clean(v?.name),
      website: normaliseWebsite(clean(v?.website)),
      required: v?.required === true,
    }))
    .filter((v) => v.name || v.website);
  if (preferredVendors.length > MAX_PREFERRED_VENDORS) {
    errors.push(`Keep it to ${MAX_PREFERRED_VENDORS} preferred vendors.`);
  }
  for (const v of preferredVendors) {
    if (!v.name) errors.push("Each preferred vendor needs a name.");
    else if (v.name.length > 120) errors.push(`“${v.name.slice(0, 30)}…” is too long a name.`);
    if (!(PREFERRED_VENDOR_CATEGORIES as readonly string[]).includes(v.category)) {
      errors.push(`Pick a category for ${v.name || "each preferred vendor"}.`);
    }
    if (v.website && !isUrl(v.website)) errors.push(`${v.name}'s website doesn't look like a web address.`);
  }

  const spaces = (Array.isArray(input.spaces) ? input.spaces : [])
    .map((sp) => ({
      name: clean(sp?.name),
      description: clean(sp?.description) || null,
      capacity: whole(sp?.capacity, "A space's capacity", 10000),
      setting: clean(sp?.setting) || null,
      photo_url: typeof sp?.photo_url === "string" && sp.photo_url ? sp.photo_url : null,
    }))
    .filter((sp) => sp.name || sp.description || sp.photo_url);
  if (spaces.length > MAX_SPACES) errors.push(`Keep it to ${MAX_SPACES} spaces.`);
  for (const sp of spaces) {
    if (!sp.name) errors.push("Each event space needs a name.");
    if (sp.name.length > 80 || (sp.description?.length ?? 0) > 1000) errors.push("One of the event spaces is too long.");
    if (sp.setting && !(VENUE_SETTINGS as readonly string[]).includes(sp.setting)) sp.setting = null;
  }

  const photoUrls = (Array.isArray(input.photoUrls) ? input.photoUrls : []).filter(
    (u): u is string => typeof u === "string",
  );
  if (photoUrls.length > MAX_CLAIM_PHOTOS) errors.push(`Keep it to ${MAX_CLAIM_PHOTOS} photos.`);

  const submitter = {
    name: clean(input.submitter?.name),
    email: clean(input.submitter?.email),
    role: clean(input.submitter?.role) || null,
    represents: input.submitter?.represents === true,
  };
  if (!submitter.name) errors.push("Tell us your name.");
  if (!EMAIL.test(submitter.email)) errors.push("We need an email to reach you about this listing.");
  if (!submitter.represents) errors.push("Confirm that you represent this venue.");

  return {
    value: { details, faqs, preferredVendors, spaces, photoUrls, submitter },
    errors: [...new Set(errors)],
  };
}
