import type { ListingStatus } from "../_listing/params";

export const VENDOR_STATUSES: ListingStatus[] = [
  "all",
  "live",
  "hidden",
  "unverified",
  "stale",
  "incomplete",
  "no_email",
];

export const VENDOR_LISTING = {
  table: "vendors",
  kindColumn: "category",
  // Missing any of the five things vendorChecks() in admin-vendors-manager.tsx
  // counts: photo, description, category, price tier, email.
  incompleteFilter:
    "image_url.is.null,and(description.is.null,about.is.null),category.is.null," +
    "price_tier.is.null,contact_email.is.null",
  statuses: VENDOR_STATUSES,
} as const;
