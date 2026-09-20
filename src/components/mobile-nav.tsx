"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArchIcon, RingsIcon, WrenBirdIcon } from "@/components/icons";
import { NAV_GROUPS } from "@/components/nav-links";

/**
 * The navigation, for a phone.
 *
 * The tab strip this replaces below 640px is the desktop design squeezed onto
 * a 375px screen: seven tabs that need roughly 800px, scrolling sideways. In
 * practice four are visible, chopped at both edges, and the three past the
 * fold -- Planning, Wedding Plan, Help -- have nothing to indicate they exist.
 * Nobody swipes a nav bar they don't know is swipeable.
 *
 * So a phone gets a different arrangement rather than a smaller one: a bar
 * that names where you are, and a menu listing every destination at once. It
 * shows fourteen places instead of four, including the sub-pages that sit two
 * taps deep behind a dropdown on desktop.
 *
 * Desktop is untouched -- this whole component renders only below `sm`, and
 * nothing it does reaches the tab strip.
 */

const TOP_LEVEL = [
  { href: "/dashboard", label: "Dashboard", icon: ArchIcon },
  { href: "/wedding-plan", label: "Wedding Plan", icon: RingsIcon },
  { href: "/help", label: "Help", icon: WrenBirdIcon },
];

/** What the closed bar says: the page you're on, not a generic "Menu". */
function currentLabel(pathname: string): string {
  for (const group of NAV_GROUPS) {
    for (const link of group.links) {
      if (pathname.startsWith(link.href)) return link.label;
    }
  }
  for (const item of TOP_LEVEL) {
    if (pathname.startsWith(item.href)) return item.label;
  }
  return "Menu";
}

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Closed on the tap that navigates rather than by watching the path: an
  // effect that fires on every render to set state is both heavier than it
  // needs to be and the thing React tells you not to do. Leaving it open
  // across a page change would cover the page just arrived at.
  const close = () => setOpen(false);

  const itemClass = (active: boolean) =>
    `flex items-center gap-2.5 rounded-md px-3 py-2.5 font-display text-lg ${
      active ? "bg-forest/10 font-semibold text-forest" : "text-ink/80"
    }`;

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-md border border-hairline bg-parchment px-3 py-2 font-mono-numbers text-sm text-forest"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {open ? <path d="m6 15 6-6 6 6" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
        {open ? "Close" : currentLabel(pathname)}
      </button>

      {open && (
        <nav className="mt-2 flex flex-col gap-0.5 border-t border-hairline pt-2">
          <Link
            href="/dashboard"
            onClick={close}
            className={itemClass(pathname.startsWith("/dashboard"))}
          >
            <ArchIcon className="h-4 w-4 shrink-0 text-brass" />
            Dashboard
          </Link>

          {NAV_GROUPS.map((group) => {
            const Icon = group.icon;
            return (
              <div key={group.label}>
                {/* The group is a heading, not a tap target. On desktop it's a
                    dropdown you open; here its children are already visible,
                    so making it look tappable would promise a second step
                    that doesn't exist. */}
                <p className="flex items-center gap-2 px-3 pb-0.5 pt-3 font-mono-numbers text-[10px] uppercase tracking-[0.18em] text-brass">
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  {group.label}
                </p>
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={close}
                    className={`${itemClass(pathname.startsWith(link.href))} pl-9`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            );
          })}

          <div className="mt-2 border-t border-hairline pt-2">
            {TOP_LEVEL.slice(1).map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  className={itemClass(pathname.startsWith(item.href))}
                >
                  <Icon className="h-4 w-4 shrink-0 text-brass" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
