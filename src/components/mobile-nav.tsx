"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  DASHBOARD_TAB,
  HELP_TAB,
  NAV_ITEMS,
  NavTileFace,
  isActiveLink,
  isNavGroup,
  navTabClass,
  type NavGroup,
} from "@/components/nav-links";

/**
 * The navigation, for a phone.
 *
 * Replaces the desktop tab dock below 640px. The menu button opens a sheet
 * from the bottom (where a thumb is) holding the same coloured tiles as the
 * desktop dock, four to a row. A plain tile goes straight to its page; a
 * section tile (Budget, Venues, Guests, Wedding Plan) opens its pages in a
 * list under the grid, starting with the section you're in.
 *
 * Fixed and portalled, so opening it never pushes or scrolls the page, and
 * the page behind is held still while it's open.
 */

/** `badges` maps a tab's href to an unread count, e.g. marketplace messages. */
export function MobileNav({ badges = {} }: { badges?: Record<string, number> }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const groups = NAV_ITEMS.filter(isNavGroup);
  const currentGroup = groups.find((g) => g.links.some((l) => pathname.startsWith(l.href)));
  const [section, setSection] = useState<NavGroup | null>(null);
  const shown = section ?? currentGroup ?? null;

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

  const close = () => {
    setOpen(false);
    setSection(null);
  };

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={Object.values(badges).some(Boolean) ? "Open menu (unread messages)" : "Open menu"}
        aria-expanded={open}
        className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-forest"
      >
        {Object.values(badges).some(Boolean) && (
          <span className="absolute right-0.5 top-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-[#2243B6]" />
        )}
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

      {/* Portalled to <body>: the header's transform and backdrop-blur make
          it the containing block for anything fixed inside it, which shrank
          this overlay to the header's strip (so tapping beside the panel hit
          the page, not the backdrop) and let the header's clear-over-photo
          rules turn the links white on white. */}
      {open && createPortal(
        <div className="fixed inset-0 z-50 sm:hidden">
          {/* Tapping beside the panel closes it -- the gesture people try
              first, and the reason the panel is deliberately not full width. */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={close}
            className="absolute inset-0 bg-ink/40"
          />

          <div
            role="dialog"
            aria-label="Menu"
            className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto overscroll-contain rounded-t-3xl bg-card px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 shadow-2xl animate-page-in"
          >
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-hairline" aria-hidden="true" />
            <nav className="grid grid-cols-4 gap-y-2 [&_.nav-tab-label]:whitespace-normal [&_.nav-tab-label]:text-center [&_.nav-tab]:min-w-0">
              <Link
                href={DASHBOARD_TAB.href}
                onClick={close}
                className={`${navTabClass(pathname.startsWith(DASHBOARD_TAB.href))} w-auto`}
              >
                <NavTileFace {...DASHBOARD_TAB} active={pathname.startsWith(DASHBOARD_TAB.href)} />
              </Link>
              {NAV_ITEMS.map((item) => {
                if (!isNavGroup(item)) {
                  const active = pathname.startsWith(item.href);
                  return (
                    <Link key={item.href} href={item.href} onClick={close} className={`${navTabClass(active)} w-auto`}>
                      <NavTileFace {...item} active={active} badge={badges[item.href]} />
                    </Link>
                  );
                }
                const active = item === currentGroup;
                return (
                  <button
                    key={item.label}
                    type="button"
                    aria-expanded={shown === item}
                    onClick={() => setSection(item)}
                    className={`${navTabClass(active)} w-auto ${shown === item && !active ? "bg-parchment" : ""}`}
                  >
                    <NavTileFace icon={item.icon} tile={item.tile} label={item.label} active={active} />
                  </button>
                );
              })}
              <Link
                href={HELP_TAB.href}
                onClick={close}
                className={`${navTabClass(pathname.startsWith(HELP_TAB.href))} w-auto`}
              >
                <NavTileFace {...HELP_TAB} active={pathname.startsWith(HELP_TAB.href)} />
              </Link>
            </nav>

            {shown && (
              <div className="mt-3 border-t border-hairline pt-3">
                <p className="px-1 pb-1 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-ink/50">
                  {shown.label}
                </p>
                {shown.links.map((link) => {
                  const LinkIcon = link.icon;
                  const current = isActiveLink(pathname, link.href, shown.links);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={close}
                      aria-current={current ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-xl px-2 py-2 ${current ? "bg-parchment" : ""}`}
                    >
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-[10px] ${shown.tile}`}>
                        <LinkIcon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-sans text-[15px] font-semibold leading-tight text-ink">{link.label}</span>
                        <span className="block font-sans text-[13px] leading-snug text-ink/60">{link.hint}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
