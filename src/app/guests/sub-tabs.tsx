import Link from "next/link";

const TABS = [
  { href: "/guests", label: "Guest list & RSVPs" },
  { href: "/guests/site", label: "Guest site" },
] as const;

/** Guests › the list, or the site guests see. */
export function GuestsSubTabs({ active }: { active: (typeof TABS)[number]["href"] }) {
  return (
    <nav aria-label="Guests" className="flex gap-6 text-sm">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          aria-current={tab.href === active ? "page" : undefined}
          className={`border-b-2 py-2.5 transition-colors ${
            tab.href === active
              ? "border-forest font-semibold text-forest"
              : "border-transparent text-ink/70 hover:text-forest"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
