import type { AdminIconName } from "./admin-icons";

/** Claim submissions waiting for review, per list. */
export type PendingClaims = { venues: number; vendors: number; reports: number; market: number };

// `keywords` are other words the search box should find the page by.
export type AdminPage = { href: string; label: string; icon: AdminIconName; badge?: number; soon?: boolean; keywords?: string };

/**
 * Each menu group has its own colour, shown as a dot in the menu and as the
 * icon tile on that group's page headers, so a page says which part of the
 * business it belongs to. `dot` sits on the navy menu; `tile` on white.
 */
export type AdminGroup = { title?: string; dot: string; tile: string; links: AdminPage[] };

export function adminGroups(claims: PendingClaims): AdminGroup[] {
  return [
    {
      dot: "bg-white",
      tile: "bg-forest text-white",
      links: [
        { href: "/admin", label: "Home", icon: "home", keywords: "overview dashboard stats summary needs attention queue coverage health" },
        { href: "/admin/ask", label: "Ask Wren", icon: "wren", keywords: "ai assistant question chat" },
        { href: "/admin/notifications", label: "Notifications", icon: "bell", soon: true },
      ],
    },
    {
      title: "Marketplace",
      dot: "bg-[#FFD301]",
      tile: "bg-[#FFF6BF] text-forest",
      links: [
        { href: "/admin/coverage", label: "Coverage", icon: "map", keywords: "states gaps targets 50-state plan thin missing categories opportunity ranking" },
        { href: "/admin/venues", label: "Venues", icon: "venue", keywords: "listings import batches export audit map" },
        { href: "/admin/vendors", label: "Vendors", icon: "vendor", keywords: "listings import batches export audit photographers florists caterers" },
        { href: "/admin/venues/claims", label: "Venue claims", icon: "claim", keywords: "submissions approve review", badge: claims.venues },
        { href: "/admin/vendors/claims", label: "Vendor claims", icon: "claim", keywords: "submissions approve review", badge: claims.vendors },
        { href: "/admin/leads", label: "Unlisted bookings", icon: "search", keywords: "couples booked unlisted purchased from missing businesses research" },
        { href: "/admin/listing-health", label: "Listing health", icon: "flag", keywords: "reports wrong closed bounces accuracy problems", badge: claims.reports },
        { href: "/admin/marketplace", label: "Buy & sell", icon: "tag", keywords: "marketplace resale listings reports moderation take down scams", badge: claims.market },
      ],
    },
    {
      title: "Customers",
      dot: "bg-[#00BFFE]",
      tile: "bg-wren-soft text-wren-deep",
      links: [
        { href: "/admin/couples", label: "Couples", icon: "heart", keywords: "users accounts weddings signups customers" },
        { href: "/admin/feedback", label: "Feedback", icon: "chat", keywords: "help bugs messages chat themes" },
        { href: "/admin/photo-wall", label: "Photo wall", icon: "photo", keywords: "photos gallery images uploads" },
      ],
    },
    {
      title: "Business",
      dot: "bg-[#7D97FF]",
      tile: "bg-[#E8ECFA] text-[#2243B6]",
      links: [
        { href: "/admin/revenue", label: "Reported bookings", icon: "dollar", keywords: "revenue money referrals payments income gmv booked" },
        { href: "/admin/spend", label: "Spend & renewals", icon: "card", keywords: "expenses costs bills subscriptions renewals domain workspace llc finance burn" },
        { href: "/admin/growth", label: "Growth", icon: "trend", keywords: "signups funnel coverage states" },
        { href: "/admin/analytics", label: "Funnels", icon: "funnel", keywords: "analytics events activation retention drop off conversion couples listings" },
        { href: "/admin/audit-log", label: "Admin log", icon: "log", keywords: "audit history who changed deleted approved activity accountability" },
        { href: "/admin/errors", label: "Errors", icon: "alert", keywords: "app errors crashes broken failures bugs health logs" },
      ],
    },
    {
      title: "Content",
      dot: "bg-[#5AE4FF]",
      tile: "bg-[#5AE4FF]/30 text-forest",
      links: [
        { href: "/admin/attire", label: "Attire", icon: "dress", keywords: "dresses suits rings catalog" },
        { href: "/admin/cost-data", label: "Cost data", icon: "calc", keywords: "budget estimator prices regional csv" },
      ],
    },
  ];
}

// The most specific link that contains the current path, so the Claims page
// lights up Claims rather than Venues too.
export function activePage(pathname: string, links: AdminPage[]) {
  return links
    .filter((l) => pathname === l.href || (l.href !== "/admin" && pathname.startsWith(`${l.href}/`)))
    .sort((a, b) => b.href.length - a.href.length)[0];
}

/** The page and its group for a path, for page headers. */
export function pageFor(pathname: string) {
  const all = adminGroups({ venues: 0, vendors: 0, reports: 0, market: 0 });
  const page = activePage(pathname, all.flatMap((g) => g.links));
  const group = page && all.find((g) => g.links.includes(page));
  return page && group ? { page, group } : null;
}
