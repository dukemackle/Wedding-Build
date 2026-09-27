import { STATES, STYLE_TIERS, VENDOR_PRICE_UNITS } from "@/lib/wedding-options";
import type { Vendor, VendorPriceUnit } from "@/lib/supabase/types";
import { clean, EMAIL, isUrl, MAX_CLAIM_PHOTOS, normaliseWebsite, type ClaimFaq } from "@/lib/venue-claim";

/**
 * What a vendor can submit through its claim link, and the checks on it --
 * the vendor counterpart of venue-claim.ts, re-run on the server because the
 * link is public and nothing the browser sends is trusted.
 */

export type VendorClaimDetails = {
  name: string;
  city: string | null;
  state: string | null;
  service_area: string | null;
  price_tier: string | null;
  price_from: number | null;
  price_unit: VendorPriceUnit | null;
  price_note: string | null;
  description: string | null;
  about: string | null;
  included: string | null;
  good_to_know: string | null;
  amenities: string[];
  contact_email: string | null;
  contact_phone: string | null;
  website: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  pinterest_url: string | null;
};

export type VendorClaimSubmission = {
  details: VendorClaimDetails;
  faqs: ClaimFaq[];
  photoUrls: string[];
  submitter: { name: string; email: string; role: string | null; represents: boolean };
};

export const VENDOR_CLAIM_FIELD_LABELS: Record<keyof VendorClaimDetails, string> = {
  name: "Business name",
  city: "Based in",
  state: "State",
  service_area: "Area served",
  price_tier: "Price level",
  price_from: "Starting price",
  price_unit: "Priced",
  price_note: "Price covers",
  description: "Short description",
  about: "About",
  included: "What's included",
  good_to_know: "Good to know",
  amenities: "Services & extras",
  contact_email: "Email",
  contact_phone: "Phone",
  website: "Website",
  instagram_url: "Instagram",
  facebook_url: "Facebook",
  pinterest_url: "Pinterest",
};

const LIMITS: Partial<Record<keyof VendorClaimDetails, number>> = {
  name: 120,
  city: 80,
  service_area: 120,
  price_note: 80,
  description: 200,
  about: 3000,
  included: 2000,
  good_to_know: 2000,
  contact_email: 200,
  contact_phone: 40,
};

export function vendorDetailsFrom(vendor: Vendor): VendorClaimDetails {
  return {
    name: vendor.name,
    city: vendor.city,
    state: vendor.state,
    service_area: vendor.service_area,
    price_tier: vendor.price_tier,
    price_from: vendor.price_from,
    price_unit: vendor.price_unit,
    price_note: vendor.price_note,
    description: vendor.description,
    about: vendor.about,
    included: vendor.included,
    good_to_know: vendor.good_to_know,
    amenities: vendor.amenities,
    contact_email: vendor.contact_email,
    contact_phone: vendor.contact_phone,
    website: vendor.website,
    instagram_url: vendor.instagram_url,
    facebook_url: vendor.facebook_url,
    pinterest_url: vendor.pinterest_url,
  };
}

export function validateVendorClaim(input: VendorClaimSubmission): {
  value: VendorClaimSubmission;
  errors: string[];
} {
  const errors: string[] = [];
  const d = input.details ?? ({} as VendorClaimDetails);

  const text = (key: keyof VendorClaimDetails) => {
    const value = clean(d[key]);
    const limit = LIMITS[key];
    if (limit && value.length > limit) {
      errors.push(`${VENDOR_CLAIM_FIELD_LABELS[key]} is too long (${limit} characters at most).`);
    }
    return value || null;
  };
  const option = <T extends string>(key: keyof VendorClaimDetails, allowed: readonly string[]) => {
    const value = clean(d[key]);
    if (value && !allowed.includes(value)) {
      errors.push(`Pick a ${VENDOR_CLAIM_FIELD_LABELS[key].toLowerCase()} from the list.`);
      return null;
    }
    return (value || null) as T | null;
  };
  const link = (key: keyof VendorClaimDetails) => {
    const url = normaliseWebsite(clean(d[key]));
    if (url && !isUrl(url)) errors.push(`The ${VENDOR_CLAIM_FIELD_LABELS[key]} link doesn't look like a web address.`);
    return url;
  };

  const name = text("name");
  if (!name) errors.push("Your business needs a name.");

  let priceFrom: number | null = null;
  if (d.price_from !== null && d.price_from !== undefined && String(d.price_from).trim() !== "") {
    priceFrom = Number(d.price_from);
    if (!Number.isInteger(priceFrom) || priceFrom < 0 || priceFrom > 10_000_000) {
      errors.push("The starting price should be a whole number of dollars.");
      priceFrom = null;
    }
  }

  const email = text("contact_email");
  if (email && !EMAIL.test(email)) errors.push("The contact email doesn't look like an address.");

  const details: VendorClaimDetails = {
    name: name ?? "",
    city: text("city"),
    state: option("state", STATES),
    service_area: text("service_area"),
    price_tier: option("price_tier", STYLE_TIERS),
    price_from: priceFrom,
    price_unit: option<VendorPriceUnit>("price_unit", Object.keys(VENDOR_PRICE_UNITS)),
    price_note: text("price_note"),
    description: text("description"),
    about: text("about"),
    included: text("included"),
    good_to_know: text("good_to_know"),
    amenities: (Array.isArray(d.amenities) ? d.amenities : []).map(clean).filter(Boolean).slice(0, 30),
    contact_email: email,
    contact_phone: text("contact_phone"),
    website: link("website"),
    instagram_url: link("instagram_url"),
    facebook_url: link("facebook_url"),
    pinterest_url: link("pinterest_url"),
  };
  if (details.price_from != null && !details.price_unit) errors.push("Say what the starting price is per.");

  // Unanswered suggested questions are dropped, as on the venue form.
  const faqs = (Array.isArray(input.faqs) ? input.faqs : [])
    .map((f) => ({ question: clean(f?.question), answer: clean(f?.answer) }))
    .filter((f) => f.answer);
  if (faqs.length > 20) errors.push("Keep it to 20 questions.");
  if (faqs.some((f) => !f.question)) errors.push("One of your answers is missing its question.");
  if (faqs.some((f) => f.question.length > 300 || f.answer.length > 2000)) {
    errors.push("One of the questions or answers is too long.");
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
  if (!submitter.represents) errors.push("Confirm that you represent this business.");

  return { value: { details, faqs, photoUrls, submitter }, errors: [...new Set(errors)] };
}
