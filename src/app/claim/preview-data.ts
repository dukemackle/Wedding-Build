import type { Vendor, Venue, Wedding } from "@/lib/supabase/types";
import type { FieldSources } from "@/lib/field-sources";
import type { VendorClaimDetails } from "@/lib/vendor-claim";
import type { ClaimDetails, ClaimFaq, ClaimPreferredVendor, ClaimSpace } from "@/lib/venue-claim";
import type { VendorListingData } from "../vendors/[id]/vendor-listing";
import type { VenueListingData } from "../venues/[id]/venue-listing";

// What's on the claim form, shaped as the rows the public listing reads, so
// the preview is drawn by the listing itself rather than a look-alike. It
// shows the page as it will be once approved: confirmed by the business,
// seen by a signed-in couple (save and quote buttons, phone shown).

const now = () => new Date().toISOString();
// The listing only checks a wedding exists to show the couple's buttons.
const couple = { id: "preview", venue_id: null } as unknown as Wedding;

const answered = (faqs: ClaimFaq[]) =>
  faqs
    .filter((f) => f.question.trim() && f.answer.trim())
    .map((f, i) => ({ ...f, id: `faq-${i}`, sort_order: i, created_at: now() }));

export function vendorPreview(
  base: Partial<Vendor>,
  details: VendorClaimDetails,
  amenities: string[],
  photos: string[],
  faqs: ClaimFaq[],
): VendorListingData {
  const vendor = {
    ...base,
    ...details,
    id: base.id ?? "preview",
    amenities,
    image_url: photos[0] ?? null,
    photo_urls: photos,
    is_sample: false,
    source: "claimed",
    last_verified_at: now(),
  } as Vendor;
  return {
    vendor,
    signedIn: true,
    wedding: couple,
    isFavorited: false,
    faqs: answered(faqs).map((f) => ({ ...f, vendor_id: vendor.id })),
    similarVendors: [],
    preview: true,
  };
}

export function venuePreview(
  base: Partial<Venue>,
  details: ClaimDetails,
  photos: string[],
  faqs: ClaimFaq[],
  spaces: ClaimSpace[],
  vendors: ClaimPreferredVendor[],
): VenueListingData {
  const at = now();
  // Every filled-in field gets the "confirmed by the venue" mark it will carry.
  const field_sources: FieldSources = { ...base.field_sources };
  for (const [key, value] of Object.entries(details)) {
    if (value != null && value !== "" && !(Array.isArray(value) && value.length === 0)) {
      field_sources[key] = { by: "venue", at };
    }
  }
  const venue = {
    ...base,
    ...details,
    id: base.id ?? "preview",
    price_options: details.price_options.filter((o) => o.label.trim() && o.amount != null),
    image_url: photos[0] ?? null,
    photo_urls: photos,
    is_sample: false,
    source: "claimed",
    last_verified_at: at,
    field_sources,
  } as Venue;
  return {
    venue,
    signedIn: true,
    wedding: couple,
    shortlistEntry: null,
    faqs: answered(faqs).map((f) => ({ ...f, venue_id: venue.id })),
    spaces: spaces
      .filter((sp) => sp.name.trim())
      .map((sp, i) => ({ ...sp, id: `space-${i}`, venue_id: venue.id, sort_order: i, created_at: at })),
    preferredVendors: vendors
      .filter((v) => v.name.trim() && v.category)
      .map((v, i) => ({
        ...v,
        required: Boolean(v.required),
        id: `vendor-${i}`,
        venue_id: venue.id,
        vendor_id: null,
        sort_order: i,
        created_at: at,
      })),
    similarVenues: [],
    preview: true,
  };
}
