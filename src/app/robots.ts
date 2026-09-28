import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/public-listings";

// Search engines get the public side of the site -- the landing page, the
// venue and vendor listings, the estimator -- and nothing a couple's account
// or a private link opens. Pages behind login redirect anyway; listing them
// here keeps crawlers from spending their visits on those redirects.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/account",
        "/auth",
        "/claim",
        "/party",
        "/w/",
        "/join-wedding",
        "/dashboard",
        "/budget",
        "/guests",
        "/seating",
        "/venue-layout",
        "/floor-plan",
        "/itinerary",
        "/checklist",
        "/bookings",
        "/attire",
        "/help",
        "/list/edit",
        "/reset-password",
        "/forgot-password",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
