"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavDropdown } from "@/components/nav-dropdown";

const groups: { label: string; links: { href: string; label: string }[] }[] = [
  {
    label: "Planning",
    links: [
      { href: "/checklist", label: "Checklist" },
      { href: "/itinerary", label: "Itinerary" },
      { href: "/seating", label: "Seating" },
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
    label: "Vendors",
    links: [
      { href: "/venues", label: "Venues" },
      { href: "/vendors", label: "Vendors" },
      { href: "/attire", label: "Attire" },
    ],
  },
];

function PlainLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={`font-mono-numbers text-sm transition-colors hover:text-forest ${
        isActive ? "text-forest" : "text-ink/70"
      }`}
    >
      {label}
    </Link>
  );
}

export function NavLinks() {
  return (
    <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
      <PlainLink href="/dashboard" label="Dashboard" />
      <NavDropdown label={groups[0].label} links={groups[0].links} />
      <PlainLink href="/budget" label="Budget" />
      <NavDropdown label={groups[1].label} links={groups[1].links} />
      <NavDropdown label={groups[2].label} links={groups[2].links} />
    </nav>
  );
}
