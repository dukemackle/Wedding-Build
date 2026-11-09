"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, ReactNode } from "react";
import { NavDropdown } from "@/components/nav-dropdown";
export { isActiveLink } from "@/lib/nav";
import {
  ArchIcon,
  AttireIcon,
  BudgetIcon,
  CalculatorIcon,
  CalendarIcon,
  ChecklistIcon,
  FloorPlanIcon,
  GiftIcon,
  GlobeIcon,
  HeadcountIcon,
  MapPinIcon,
  MailIcon,
  RingsIcon,
  TagIcon,
  VendorsIcon,
  VenueIcon,
  WrenBirdIcon,
} from "@/components/icons";

export type IconType = ComponentType<{ className?: string }>;

/** A page inside a dropdown: its own icon and a few words on what's there. */
export type NavSubLink = { href: string; label: string; icon: IconType; hint: string };
/**
 * `tile` is the section's colour: the fill and icon colour of its square in
 * the tab dock and of its pages' icons in the dropdown. One palette colour
 * per section, so the dock reads as a set of distinct places.
 */
export type NavGroup = { label: string; icon: IconType; tile: string; links: NavSubLink[] };
export type NavLinkItem = { href: string; label: string; icon: IconType; tile: string };

/** A dropdown, or a single tab when a section has only one page. */
export type NavItem = NavGroup | NavLinkItem;

export function isNavGroup(item: NavItem): item is NavGroup {
  return "links" in item;
}


/** Tile fills, from the palette. Navy or Royal on the yellows and blues, never white. */
const TILE = {
  navy: "bg-[#14203d] text-[#FFD301]",
  gold: "bg-[#FFD301] text-[#14203d]",
  royal: "bg-[#2243B6] text-white",
  sky: "bg-[#00BFFE] text-[#14203d]",
  lemon: "bg-[#FFF12F] text-[#14203d]",
  aqua: "bg-[#5AE4FF] text-[#14203d]",
  // Help is Wren's: a white tile with the bird in Royal.
  white: "bg-white text-[#2243B6] border border-hairline",
};

/** Everything between Dashboard and Help, in tab order. */
export const NAV_ITEMS: NavItem[] = [
  {
    label: "Budget",
    icon: BudgetIcon,
    tile: TILE.gold,
    links: [
      { href: "/budget", label: "My Budget", icon: BudgetIcon, hint: "What's spent and what's left" },
      { href: "/budget/estimate", label: "Estimator", icon: CalculatorIcon, hint: "What a wedding like yours costs" },
    ],
  },
  {
    label: "Venues",
    icon: VenueIcon,
    tile: TILE.royal,
    links: [
      { href: "/venues", label: "Venues", icon: VenueIcon, hint: "Browse, compare, tour" },
      { href: "/vendors", label: "Vendors", icon: VendorsIcon, hint: "Photo, music, flowers and more" },
      { href: "/attire", label: "Attire", icon: AttireIcon, hint: "Dresses, suits, rentals" },
      { href: "/cities", label: "Wedding cities", icon: MapPinIcon, hint: "Venues and vendors by city" },
    ],
  },
  {
    label: "Guests",
    icon: HeadcountIcon,
    tile: TILE.sky,
    links: [
      { href: "/guests", label: "Guest list", icon: HeadcountIcon, hint: "Names, RSVPs, plus-ones" },
      { href: "/guests/site", label: "Guest site", icon: GlobeIcon, hint: "Your wedding website" },
      { href: "/guests/save-the-date", label: "Save the date", icon: MailIcon, hint: "Design and send the card" },
      { href: "/guests/invitations", label: "Invitations", icon: MailIcon, hint: "Design and print, with an RSVP card" },
      { href: "/registry", label: "Registry", icon: GiftIcon, hint: "Gifts and funds" },
    ],
  },
  {
    label: "Wedding Plan",
    icon: RingsIcon,
    tile: TILE.lemon,
    links: [
      { href: "/checklist", label: "Checklist", icon: ChecklistIcon, hint: "What to do, month by month" },
      { href: "/itinerary", label: "Itinerary", icon: CalendarIcon, hint: "The day, hour by hour" },
      { href: "/venue-layout", label: "Venue Layout", icon: FloorPlanIcon, hint: "Tables and seating" },
      { href: "/bookings", label: "Bookings", icon: VendorsIcon, hint: "Who's booked and what's due" },
    ],
  },
  { href: "/marketplace", label: "Marketplace", icon: TagIcon, tile: TILE.aqua },
];

/** The two tabs either side of NAV_ITEMS. */
export const DASHBOARD_TAB: NavLinkItem = { href: "/dashboard", label: "Dashboard", icon: ArchIcon, tile: TILE.navy };
export const HELP_TAB: NavLinkItem = { href: "/help", label: "Help", icon: WrenBirdIcon, tile: TILE.white };

/** An unread count beside a tab, in Royal blue so it reads as news, not as the brand's gold. */
export function Badge({ count }: { count?: number }) {
  if (!count) return null;
  return (
    <span className="ml-0.5 rounded-full bg-[#2243B6] px-1.5 py-px font-sans text-[11px] font-semibold leading-4 text-white">
      {count > 9 ? "9+" : count}
      <span className="sr-only"> unread</span>
    </span>
  );
}

/**
 * One square in the tab dock: a coloured tile with the label under it.
 * Shared by plain tabs and dropdown buttons so they line up exactly.
 */
export function NavTileFace({
  icon: Icon,
  tile,
  label,
  active,
  badge,
  chevron,
}: {
  icon: IconType;
  tile: string;
  label: string;
  active: boolean;
  badge?: number;
  chevron?: ReactNode;
}) {
  return (
    <>
      <span className={`nav-tile relative grid h-11 w-11 place-items-center rounded-[14px] sm:h-9 sm:w-9 sm:rounded-xl xl:h-10 xl:w-10 ${tile}`}>
        <Icon className="h-6 w-6 sm:h-5 sm:w-5" />
        {badge ? (
          <span className="absolute -right-2 -top-1.5">
            <Badge count={badge} />
          </span>
        ) : null}
      </span>
      <span className={`nav-tab-label flex items-center gap-0.5 whitespace-nowrap font-sans text-[13px] font-semibold leading-tight sm:text-xs xl:text-[13px] ${active ? "text-ink" : "text-ink/80"}`}>
        {label}
        {chevron}
      </span>
    </>
  );
}

/** Classes for a tab in the dock; `nav-tab-on` draws the ring and gold dot (globals.css). */
export function navTabClass(active: boolean) {
  return `nav-tab flex min-w-[84px] shrink-0 flex-col items-center gap-1 rounded-2xl px-1.5 py-1.5 sm:min-w-[76px] sm:gap-0.5 sm:py-1 xl:min-w-[84px] ${
    active ? "nav-tab-on" : ""
  }`;
}

function PlainLink({ item, badge }: { item: NavLinkItem; badge?: number }) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(item.href);
  return (
    <Link href={item.href} aria-current={isActive ? "page" : undefined} className={navTabClass(isActive)}>
      <NavTileFace icon={item.icon} tile={item.tile} label={item.label} active={isActive} badge={badge} />
    </Link>
  );
}

export function NavLinks({ badges = {} }: { badges?: Record<string, number> }) {
  return (
    // One row, always: the tabs never wrap under each other. Past the point
    // where they stop fitting the strip scrolls sideways instead.
    // Centred with auto margins on the end tabs rather than justify-center,
    // which would push the first tabs off the left edge, out of scroll reach,
    // once the strip overflows. Vertical padding leaves room for a tile's
    // hover lift and the active ring, which overflow-x would otherwise clip.
    <nav className="-mx-1 flex [&>*:first-child]:ml-auto [&>*:last-child]:mr-auto w-full items-start gap-1 overflow-x-auto px-1 pb-0.5 pt-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <PlainLink item={DASHBOARD_TAB} />
      {NAV_ITEMS.map((item) =>
        isNavGroup(item) ? (
          <NavDropdown key={item.label} group={item} />
        ) : (
          <PlainLink key={item.href} item={item} badge={badges[item.href]} />
        ),
      )}
      <PlainLink item={HELP_TAB} />
    </nav>
  );
}
