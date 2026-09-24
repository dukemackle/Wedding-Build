"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { NavDropdown } from "@/components/nav-dropdown";
import {
  ArchIcon,
  BudgetIcon,
  HeadcountIcon,
  RingsIcon,
  VenueIcon,
  WrenBirdIcon,
} from "@/components/icons";

export type IconType = ComponentType<{ className?: string }>;

export type NavGroup = { label: string; icon: IconType; links: { href: string; label: string }[] };
export type NavLinkItem = { href: string; label: string; icon: IconType };

/** A dropdown, or a single tab when a section has only one page. */
export type NavItem = NavGroup | NavLinkItem;

export function isNavGroup(item: NavItem): item is NavGroup {
  return "links" in item;
}

/** Everything between Dashboard and Help, in tab order. */
export const NAV_ITEMS: NavItem[] = [
  {
    label: "Budget",
    icon: BudgetIcon,
    links: [
      { href: "/budget", label: "My Budget" },
      { href: "/budget/estimate", label: "Estimator" },
    ],
  },
  {
    label: "Venues",
    icon: VenueIcon,
    links: [
      { href: "/venues", label: "Venues" },
      { href: "/vendors", label: "Vendors" },
      { href: "/attire", label: "Attire" },
    ],
  },
  { href: "/guests", label: "Guests", icon: HeadcountIcon },
  {
    label: "Wedding Plan",
    icon: RingsIcon,
    links: [
      { href: "/checklist", label: "Checklist" },
      { href: "/itinerary", label: "Itinerary" },
      { href: "/venue-layout", label: "Venue Layout" },
      { href: "/bookings", label: "Bookings" },
    ],
  },
];

function PlainLink({ href, label, icon: Icon }: { href: string; label: string; icon: IconType }) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={`flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 font-display text-lg transition-colors xl:text-xl ${
        isActive ? "bg-forest/10 text-forest" : "text-ink/70 hover:text-forest"
      }`}
    >
      <Icon className={`h-4 w-4 shrink-0 xl:h-5 xl:w-5 ${isActive ? "text-forest" : "text-brass"}`} />
      {label}
    </Link>
  );
}

export function NavLinks() {
  return (
    // One row, always: the tabs never wrap under each other. Past the point
    // where they stop fitting (phones) the strip scrolls sideways instead.
    // The negative margin lets a tab's rounded highlight reach the gutter
    // without the padding that keeps it from being clipped mid-scroll.
    // Centred with auto margins on the end tabs rather than justify-center,
    // which would push the first tabs off the left edge, out of scroll reach,
    // once the strip overflows.
    <nav className="-mx-1 flex [&>*:first-child]:ml-auto [&>*:last-child]:mr-auto w-full items-center gap-0.5 overflow-x-auto px-1 py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <PlainLink href="/dashboard" label="Dashboard" icon={ArchIcon} />
      {NAV_ITEMS.map((item) =>
        isNavGroup(item) ? (
          <NavDropdown key={item.label} label={item.label} icon={item.icon} links={item.links} />
        ) : (
          <PlainLink key={item.href} href={item.href} label={item.label} icon={item.icon} />
        ),
      )}
      <PlainLink href="/help" label="Help" icon={WrenBirdIcon} />
    </nav>
  );
}
