"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArchIcon, RingsIcon, WrenBirdIcon } from "@/components/icons";
import { NAV_GROUPS } from "@/components/nav-links";

/**
 * The navigation, for a phone.
 *
 * Replaces the desktop tab strip below 640px. Seven tabs need roughly 800px;
 * on a 375px screen four are visible, chopped at both edges, and the rest sit
 * past the fold with nothing indicating they exist.
 *
 * A panel that slides in from the side, rather than a list that opens in the
 * header. The difference is not decoration: an inline list is part of the
 * document, so opening it pushes the page down, and scrolling it means
 * scrolling the page -- which on a header that hides itself on scroll fights
 * the thing you're trying to read. A fixed panel sits above the page, scrolls
 * on its own, and leaves what's underneath exactly where it was.
 *
 * The trigger lives in the existing header row instead of claiming a row of
 * its own, which is a whole line of vertical space back on a small screen.
 *
 * Desktop is untouched -- everything here renders under `sm:hidden`.
 */

const EXTRA_LINKS = [
  { href: "/wedding-plan", label: "Wedding Plan", icon: RingsIcon },
  { href: "/help", label: "Help", icon: WrenBirdIcon },
];

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  /**
   * Holds the page still while the panel is open.
   *
   * Without this the page behind scrolls when the panel's own list reaches its
   * end, so a flick to reach "Help" carries on into the dashboard and the
   * couple loses their place in both at once.
   */
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  const rowClass = (active: boolean) =>
    `block rounded-md px-3 py-2 text-[15px] ${
      active ? "bg-forest/10 font-medium text-forest" : "text-ink/80"
    }`;

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-forest"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Tapping beside the panel closes it -- the gesture people try
              first, and the reason the panel is deliberately not full width. */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={close}
            className="absolute inset-0 bg-ink/30"
          />

          <div className="relative flex h-full w-[78%] max-w-[290px] flex-col border-l border-hairline bg-card shadow-lg">
            <div className="flex items-center justify-between border-b border-hairline px-3 py-2.5">
              <span className="font-mono-numbers text-[11px] uppercase tracking-[0.18em] text-brass">
                Go to
              </span>
              <button
                type="button"
                onClick={close}
                aria-label="Close menu"
                className="flex h-7 w-7 items-center justify-center rounded-md text-ink/60"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            {/* Scrolls inside itself, not with the page. */}
            <nav className="flex-1 overflow-y-auto overscroll-contain p-2">
              <Link
                href="/dashboard"
                onClick={close}
                className={`${rowClass(pathname.startsWith("/dashboard"))} flex items-center gap-2`}
              >
                <ArchIcon className="h-4 w-4 shrink-0 text-brass" />
                Dashboard
              </Link>

              {NAV_GROUPS.map((group) => (
                <div key={group.label} className="mt-1">
                  {/* A heading, not a tap target: on desktop this opens a
                      dropdown, but here its children are already listed, so
                      looking tappable would promise a step that isn't there. */}
                  <p className="px-3 pb-0.5 pt-2 font-mono-numbers text-[10px] uppercase tracking-[0.16em] text-ink/40">
                    {group.label}
                  </p>
                  {group.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={close}
                      className={rowClass(pathname.startsWith(link.href))}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              ))}

              <div className="mt-2 border-t border-hairline pt-2">
                {EXTRA_LINKS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={close}
                      className={`${rowClass(pathname.startsWith(item.href))} flex items-center gap-2`}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-brass" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
