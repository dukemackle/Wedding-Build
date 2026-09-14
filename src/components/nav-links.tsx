"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { NavDropdown } from "@/components/nav-dropdown";
import {
  ArchIcon,
  BudgetIcon,
  ChecklistIcon,
  HeadcountIcon,
  RingsIcon,
  VenueIcon,
  WrenBirdIcon,
} from "@/components/icons";

type IconType = ComponentType<{ className?: string }>;

const groups: { label: string; icon: IconType; links: { href: string; label: string }[] }[] = [
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
  {
    label: "People",
    icon: HeadcountIcon,
    links: [
      { href: "/guests", label: "Guests" },
      { href: "/contacts", label: "Contacts" },
    ],
  },
  {
    label: "Planning",
    icon: ChecklistIcon,
    links: [
      { href: "/checklist", label: "Checklist" },
      { href: "/itinerary", label: "Itinerary" },
      { href: "/venue-layout", label: "Venue Layout" },
    ],
  },
];

function PlainLink({ href, label, icon: Icon }: { href: string; label: string; icon: IconType }) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-display text-lg transition-colors ${
        isActive ? "bg-forest/10 text-forest" : "text-ink/70 hover:text-forest"
      }`}
    >
      <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-forest" : "text-brass"}`} />
      {label}
    </Link>
  );
}

export function NavLinks() {
  return (
    <nav className="flex flex-wrap items-center gap-x-1 gap-y-2">
      <PlainLink href="/dashboard" label="Dashboard" icon={ArchIcon} />
      {groups.map((group) => (
        <NavDropdown
          key={group.label}
          label={group.label}
          icon={group.icon}
          links={group.links}
        />
      ))}
      <PlainLink href="/wedding-plan" label="Wedding Plan" icon={RingsIcon} />
      <PlainLink href="/help" label="Help" icon={WrenBirdIcon} />
    </nav>
  );
}
