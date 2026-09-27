import type { ListingStatus } from "../_listing/params";

export const VENUE_STATUSES: ListingStatus[] = [
  "all",
  "live",
  "hidden",
  "unverified",
  "stale",
  "incomplete",
  "claimed",
];

export const VENUE_LISTING = {
  table: "venues",
  kindColumn: "venue_type",
  // Missing any of the five things venueChecks() in admin-venues-manager.tsx
  // counts: photo, description, capacity, price, a way to contact them.
  incompleteFilter:
    "image_url.is.null,and(description.is.null,about.is.null),capacity.is.null," +
    "and(price_from.is.null,price_tier.is.null)," +
    "and(contact_email.is.null,contact_phone.is.null,website.is.null)",
  statuses: VENUE_STATUSES,
} as const;
