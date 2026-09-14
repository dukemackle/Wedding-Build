"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavDropdown } from "@/components/nav-dropdown";

const groups: { label: string; links: { href: string; label: string }[] }[] = [
  {
    label: "Budget",
    links: [
      { href: "/budget", label: "My Budget" },
      { href: "/budget/estimate", label: "Estimator" },
    ],
  },
  {
    label: "Venues",
    links: [
      { href: "/venues", label: "Venues" },
      { href: "/vendors", label: "Vendors" },
      { href: "/attire", label: "Attire" },
    ],
  },
  {
    label: "People",
    links: [
      { href: "/guests", label: "Guests" },
      { href: "/contacts", label: "Contacts" },
    ],
  },
  {
    label: "Planning",
    links: [
      { href: "/checklist", label: "Checklist" },
      { href: "/itinerary", label: "Itinerary" },
      { href: "/venue-layout", label: "Venue Layout" },
    ],
  },
];

function PlainLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={`rounded-full font-display text-lg transition-colors ${
        isActive
          ? "bg-forest/10 px-3 py-1 text-forest"
          : "px-3 py-1 text-ink/70 hover:text-forest"
      }`}
    >
      {label}
    </Link>
  );
}

export function NavLinks() {
  return (
    <nav className="flex flex-wrap items-center gap-x-1 gap-y-2">
      <PlainLink href="/dashboard" label="Dashboard" />
      <NavDropdown label={groups[0].label} links={groups[0].links} />
      <NavDropdown label={groups[1].label} links={groups[1].links} />
      <NavDropdown label={groups[2].label} links={groups[2].links} />
      <NavDropdown label={groups[3].label} links={groups[3].links} />
      <PlainLink href="/wedding-plan" label="Wedding Plan" />
      <PlainLink href="/help" label="Help" />
    </nav>
  );
}
