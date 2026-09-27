import { PREFERRED_VENDOR_CATEGORIES, STATES } from "@/lib/wedding-options";
import type { Vendor } from "@/lib/supabase/types";
import { clean, EMAIL } from "@/lib/venue-claim";

/**
 * What a vendor can submit through its claim link, and the checks on it.
 * The vendor counterpart of venue-claim.ts: shared by the form and the server
 * action, which re-checks everything.
 */

/** The categories a vendor lists under -- the preferred-vendor list minus the two that aren't vendors. */
export const VENDOR_LISTING_CATEGORIES = PREFERRED_VENDOR_CATEGORIES.filter(
  (c) => c !== "Lodging" && c !== "Other",
);

/** Matches what the admin enters and what the /vendors price filter offers. */
export const VENDOR_PRICE_TIERS = {
  $: "$ · Budget-friendly",
  $$: "$$ · Mid-range",
  $$$: "$$$ · High-end",
} as const;

/** The vendor columns a vendor may change. Everything else stays admin-only. */
export type VendorClaimDetails = {
  name: string;
  category: string | null;
  city: string | null;
  state: string | null;
  price_tier: string | null;
  description: string | null;
  about: string | null;
  included: string | null;
  contact_email: string | null;
};

export type VendorClaimSubmission = {
  details: VendorClaimDetails;
  photoUrl: string | null;
  submitter: { name: string; email: string; role: string | null; represents: boolean };
};

const LIMITS: Partial<Record<keyof VendorClaimDetails, [string, number]>> = {
  name: ["Name", 120],
  city: ["Town", 80],
  description: ["Short description", 200],
  about: ["About", 3000],
  included: ["What's included", 2000],
  contact_email: ["Email", 200],
};

export function detailsFromVendor(vendor: Vendor): VendorClaimDetails {
  return {
    name: vendor.name,
    category: vendor.category,
    city: vendor.city,
    state: vendor.state,
    price_tier: vendor.price_tier,
    description: vendor.description,
    about: vendor.about,
    included: vendor.included,
    contact_email: vendor.contact_email,
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
    if (limit && value.length > limit[1]) errors.push(`${limit[0]} is too long (${limit[1]} characters at most).`);
    return value || null;
  };
  const option = (key: keyof VendorClaimDetails, allowed: readonly string[], label: string) => {
    const value = clean(d[key]);
    if (value && !allowed.includes(value)) errors.push(`Pick a ${label} from the list.`);
    return value && allowed.includes(value) ? value : null;
  };

  const name = text("name");
  if (!name) errors.push("Your business needs a name.");
  const category = option("category", VENDOR_LISTING_CATEGORIES, "category");
  if (!category) errors.push("Pick what you do, so couples find you under the right category.");
  const email = text("contact_email");
  if (email && !EMAIL.test(email)) errors.push("The contact email doesn't look like an address.");

  const details: VendorClaimDetails = {
    name: name ?? "",
    category,
    city: text("city"),
    state: option("state", STATES, "state"),
    price_tier: option("price_tier", Object.keys(VENDOR_PRICE_TIERS), "price level"),
    description: text("description"),
    about: text("about"),
    included: text("included"),
    contact_email: email,
  };

  const submitter = {
    name: clean(input.submitter?.name),
    email: clean(input.submitter?.email),
    role: clean(input.submitter?.role) || null,
    represents: input.submitter?.represents === true,
  };
  if (!submitter.name) errors.push("Tell us your name.");
  if (!EMAIL.test(submitter.email)) errors.push("We need an email to reach you about this listing.");
  if (!submitter.represents) errors.push("Confirm you can make changes to this business's listing.");

  const photoUrl = clean(input.photoUrl) || null;

  return { value: { details, photoUrl, submitter }, errors };
}
