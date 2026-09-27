import {
  PREFERRED_VENDOR_CATEGORIES,
  STATES,
  STYLE_TIERS,
  VENUE_SETTINGS,
  VENUE_TYPES,
} from "@/lib/wedding-options";
import type { Venue } from "@/lib/supabase/types";

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
const MAX_PREFERRED_VENDORS = 40;
const MAX_FAQS = 20;

/** The venue columns a venue may change. Everything else stays admin-only. */
export type ClaimDetails = {
  name: string;
  city: string | null;
  state: string | null;
  venue_type: string | null;
  setting: string | null;
  capacity: number | null;
  price_tier: string | null;
  description: string | null;
  about: string | null;
  included: string | null;
  amenities: string[];
  contact_email: string | null;
  contact_phone: string | null;
  website: string | null;
};

export type ClaimFaq = { question: string; answer: string };

export type ClaimPreferredVendor = { category: string; name: string; website: string | null };

export type ClaimSubmission = {
  details: ClaimDetails;
  faqs: ClaimFaq[];
  preferredVendors: ClaimPreferredVendor[];
  photoUrls: string[];
  submitter: { name: string; email: string; role: string | null; represents: boolean };
};

export const CLAIM_FIELD_LABELS: Record<keyof ClaimDetails, string> = {
  name: "Name",
  city: "Town",
  state: "State",
  venue_type: "Venue type",
  setting: "Setting",
  capacity: "Capacity",
  price_tier: "Price level",
  description: "Short description",
  about: "About",
  included: "What's included",
  amenities: "Amenities",
  contact_email: "Email",
  contact_phone: "Phone",
  website: "Website",
};

// Generous, but bounded: the listing page has to hold whatever gets approved.
const LIMITS: Partial<Record<keyof ClaimDetails, number>> = {
  name: 120,
  city: 80,
  description: 200,
  about: 3000,
  included: 2000,
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
    capacity: venue.capacity,
    price_tier: venue.price_tier,
    description: venue.description,
    about: venue.about,
    included: venue.included,
    amenities: venue.amenities,
    contact_email: venue.contact_email,
    contact_phone: venue.contact_phone,
    website: venue.website,
  };
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function normaliseWebsite(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function isUrl(value: string) {
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

  let capacity: number | null = null;
  if (d.capacity !== null && d.capacity !== undefined && String(d.capacity).trim() !== "") {
    capacity = Number(d.capacity);
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 10000) {
      errors.push("Capacity should be a whole number of guests.");
      capacity = null;
    }
  }

  const email = text("contact_email");
  if (email && !EMAIL.test(email)) errors.push("The contact email doesn't look like an address.");

  const website = normaliseWebsite(clean(d.website));
  if (website && !isUrl(website)) errors.push("The website doesn't look like a web address.");

  const amenities = (Array.isArray(d.amenities) ? d.amenities : [])
    .map(clean)
    .filter(Boolean)
    .slice(0, 30);

  const details: ClaimDetails = {
    name: name ?? "",
    city: text("city"),
    state: option("state", STATES),
    venue_type: option("venue_type", VENUE_TYPES),
    setting: option("setting", VENUE_SETTINGS),
    capacity,
    price_tier: option("price_tier", STYLE_TIERS),
    description: text("description"),
    about: text("about"),
    included: text("included"),
    amenities,
    contact_email: email,
    contact_phone: text("contact_phone"),
    website,
  };

  const faqs = (Array.isArray(input.faqs) ? input.faqs : [])
    .map((f) => ({ question: clean(f?.question), answer: clean(f?.answer) }))
    .filter((f) => f.question || f.answer);
  if (faqs.length > MAX_FAQS) errors.push(`Keep it to ${MAX_FAQS} questions.`);
  if (faqs.some((f) => !f.question || !f.answer)) errors.push("Each question needs an answer.");
  if (faqs.some((f) => f.question.length > 300 || f.answer.length > 2000)) {
    errors.push("One of the questions or answers is too long.");
  }

  const preferredVendors = (Array.isArray(input.preferredVendors) ? input.preferredVendors : [])
    .map((v) => ({
      category: clean(v?.category),
      name: clean(v?.name),
      website: normaliseWebsite(clean(v?.website)),
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
    value: { details, faqs, preferredVendors, photoUrls, submitter },
    errors: [...new Set(errors)],
  };
}
