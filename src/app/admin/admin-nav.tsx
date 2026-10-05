"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { pageWidthClass, type PageWidth } from "@/lib/layout";
import { AdminSearch } from "./admin-search";

/** Claim submissions waiting for review, per list. */
export type PendingClaims = { venues: number; vendors: number };

// `keywords` are other words the search box should find the page by.
type NavLink = { href: string; label: string; badge?: number; soon?: boolean; keywords?: string };

function groups(claims: PendingClaims): { title?: string; links: NavLink[] }[] {
  return [
    {
      links: [
        { href: "/admin", label: "Overview", keywords: "home dashboard stats summary" },
        { href: "/admin/ask", label: "Ask Wren", keywords: "ai assistant question chat" },
        { href: "/admin/notifications", label: "Notifications", soon: true },
      ],
    },
    {
      title: "Marketplace",
      links: [
        { href: "/admin/venues", label: "Venues", keywords: "listings import batches export audit map" },
        { href: "/admin/vendors", label: "Vendors", keywords: "listings import batches export audit photographers florists caterers" },
        { href: "/admin/venues/claims", label: "Venue claims", keywords: "submissions approve review", badge: claims.venues },
        { href: "/admin/vendors/claims", label: "Vendor claims", keywords: "submissions approve review", badge: claims.vendors },
        { href: "/admin/leads", label: "Leads", keywords: "couples booked unlisted purchased from missing businesses research" },
      ],
    },
    {
      title: "Customers",
      links: [
        { href: "/admin/couples", label: "Couples", keywords: "users accounts weddings signups customers" },
        { href: "/admin/feedback", label: "Feedback", keywords: "help bugs messages chat themes" },
        { href: "/admin/photo-wall", label: "Photo wall", keywords: "photos gallery images uploads" },
      ],
    },
    {
      title: "Business",
      links: [
        { href: "/admin/revenue", label: "Revenue", keywords: "money referrals payments income" },
        { href: "/admin/finance", label: "Finance", soon: true },
        { href: "/admin/growth", label: "Growth", keywords: "signups funnel coverage states" },
        { href: "/admin/analytics", label: "Analytics", soon: true },
      ],
    },
    {
      title: "Content",
      links: [
        { href: "/admin/attire", label: "Attire", keywords: "dresses suits rings catalog" },
        { href: "/admin/cost-data", label: "Cost data", keywords: "budget estimator prices regional csv" },
      ],
    },
  ];
}

// Every built page, for the search box's "Pages" group.
function searchablePages(claims: PendingClaims) {
  return groups(claims)
    .flatMap((g) => g.links)
    .filter((l) => !l.soon)
    .map((l) => ({ href: l.href, title: l.label, keywords: l.keywords }));
}

// The most specific link that contains the current path, so the Claims page
// lights up Claims rather than Venues too.
function activeHref(pathname: string, links: NavLink[]) {
  return links
    .filter((l) => pathname === l.href || (l.href !== "/admin" && pathname.startsWith(`${l.href}/`)))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
}

function NavList({ pendingClaims, onNavigate }: { pendingClaims: PendingClaims; onNavigate?: () => void }) {
  const pathname = usePathname();
  const all = groups(pendingClaims);
  const active = activeHref(pathname, all.flatMap((g) => g.links));

  return (
    <nav className="flex flex-col">
      {all.map((group, i) => (
        <div key={group.title ?? i} className={i > 0 ? "mt-5" : ""}>
          {group.title && (
            <p className="mb-1.5 px-2 font-mono-numbers text-[10.5px] uppercase tracking-[0.12em] text-ink/45">
              {group.title}
            </p>
          )}
          {group.links.map((link) =>
            link.soon ? (
              <span
                key={link.href}
                title="Not built yet"
                className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-ink/35"
              >
                {link.label}
                <span className="rounded-full border border-hairline px-1.5 text-[10px]">soon</span>
              </span>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                onClick={onNavigate}
                className={`flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors ${
                  active === link.href
                    ? "bg-forest/10 font-medium text-forest"
                    : "text-ink/75 hover:bg-parchment hover:text-forest"
                }`}
              >
                {link.label}
                {!!link.badge && (
                  <span className="rounded-full bg-brass px-1.5 font-mono-numbers text-[11px] text-ink">
                    {link.badge}
                  </span>
                )}
              </Link>
            ),
          )}
        </div>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <Link href="/admin" className="flex items-center gap-2">
      <Image src="/icon.png" alt="You Do, I Do" width={28} height={28} className="h-7 w-7 shrink-0" />
      <span className="rounded-full bg-brass/10 px-2 py-0.5 font-mono-numbers text-xs uppercase tracking-wide text-brass">
        Admin
      </span>
    </Link>
  );
}

const backToApp = (
  <a href="https://youdoido.com/dashboard" className="font-mono-numbers text-sm text-brass hover:underline">
    &larr; Back to app
  </a>
);

/**
 * The admin menu: a sidebar on a wide screen, a top bar with a menu button on
 * a phone. Grouped rather than one long strip, because the panel keeps growing
 * and a strip of eleven links wraps into a paragraph.
 */
export function AdminNav({ pendingClaims }: { pendingClaims: PendingClaims }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col overflow-y-auto border-r border-hairline bg-card px-3 py-5 lg:flex">
        <div className="mb-4 px-2">
          <Brand />
        </div>
        <AdminSearch pages={searchablePages(pendingClaims)} />
        <div className="mt-2.5 mb-5 px-2">{backToApp}</div>
        <NavList pendingClaims={pendingClaims} />
      </aside>

      <div className="sticky top-0 z-30 border-b border-hairline bg-card lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Brand />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="relative rounded-md border border-hairline px-3 py-1.5 text-sm text-ink"
          >
            {open ? "Close" : "Menu"}
            {!open && pendingClaims.venues + pendingClaims.vendors > 0 && (
              <span className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-brass" />
            )}
          </button>
        </div>
        <div className="px-4 pb-3">
          <AdminSearch pages={searchablePages(pendingClaims)} onNavigate={() => setOpen(false)} />
          <div className="mt-2 px-1">{backToApp}</div>
        </div>
        {open && (
          <div className="max-h-[calc(100vh-57px)] overflow-y-auto border-t border-hairline px-3 py-4">
            <NavList pendingClaims={pendingClaims} onNavigate={() => setOpen(false)} />
          </div>
        )}
      </div>
    </>
  );
}

// Pages composed for the room a wide screen gives them. Everything else keeps
// the width it was designed at until it gets the same treatment.
const WIDTH_BY_PATH: Record<string, PageWidth> = {
  "/admin/venues": "canvas",
  "/admin/vendors": "canvas",
  "/admin/ask": "wide",
};

export function AdminContent({ children }: { children: React.ReactNode }) {
  const width = WIDTH_BY_PATH[usePathname()] ?? "standard";
  return <div className={`mx-auto w-full ${pageWidthClass(width)}`}>{children}</div>;
}
