"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CloseIcon, WrenBirdIcon } from "@/components/icons";
import { useAssistant } from "@/components/assistant-context";
import {
  Badge,
  DASHBOARD_TAB,
  HELP_TAB,
  NAV_ITEMS,
  isActiveLink,
  isNavGroup,
  type IconType,
  type NavLinkItem,
} from "@/components/nav-links";
import { signOut } from "@/lib/supabase/actions";

/**
 * The navigation, for a phone.
 *
 * Replaces the desktop tab dock below 640px. The menu button opens a drawer
 * from the right, the same side as the button, listing every section with
 * its pages underneath, so any page is one tap away and you can see what
 * each section holds. The account links (email, Admin, Log out) live at the
 * foot of the drawer, which leaves the phone header just the mark and ☰.
 *
 * Fixed and portalled, so opening it never pushes or scrolls the page, and
 * the page behind is held still while it's open.
 */

/** A section's coloured square, small: the same fill as its desktop tile. */
function Tile({ icon: Icon, tile }: { icon: IconType; tile: string }) {
  return (
    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-[10px] ${tile}`}>
      <Icon className="h-[18px] w-[18px]" />
    </span>
  );
}

/** `badges` maps a tab's href to an unread count, e.g. marketplace messages. */
export function MobileNav({
  badges = {},
  email,
  isAdmin = false,
}: {
  badges?: Record<string, number>;
  email: string;
  isAdmin?: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const assistant = useAssistant();
  const hasUnread = Object.values(badges).some(Boolean);

  /**
   * Holds the page still while the drawer is open.
   *
   * Without this the page behind scrolls when the drawer's own list reaches
   * its end, so a flick to reach "Help" carries on into the dashboard and the
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

  /** A one-page section (Dashboard, Marketplace, Help): a single row. */
  const single = (item: NavLinkItem) => {
    const active = pathname.startsWith(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={close}
        aria-current={active ? "page" : undefined}
        className={`flex items-center gap-3 rounded-xl px-2 py-2 ${active ? "bg-parchment" : ""}`}
      >
        <Tile icon={item.icon} tile={item.tile} />
        <span className="font-sans text-[15px] font-semibold text-ink">{item.label}</span>
        <Badge count={badges[item.href]} />
      </Link>
    );
  };

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={hasUnread ? "Open menu (unread messages)" : "Open menu"}
        aria-expanded={open}
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-forest"
      >
        {hasUnread && (
          <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-[#2243B6]" />
        )}
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-6 w-6"
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
          this overlay to the header's strip (so tapping beside the drawer hit
          the page, not the backdrop) and let the header's clear-over-photo
          rules turn the links white on white. */}
      {open && createPortal(
        <div className="fixed inset-0 z-50 sm:hidden">
          {/* Tapping beside the drawer closes it -- the gesture people try
              first, and the reason the drawer is deliberately not full width. */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={close}
            className="absolute inset-0 bg-ink/40"
          />

          <div
            role="dialog"
            aria-label="Menu"
            className="animate-drawer-in absolute inset-y-0 right-0 flex w-[85%] max-w-sm flex-col bg-card shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-hairline px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
              <p className="font-display text-xl font-semibold text-ink">Menu</p>
              <button
                type="button"
                onClick={close}
                aria-label="Close menu"
                className="grid h-10 w-10 place-items-center rounded-full text-ink/70 hover:bg-parchment"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto overscroll-contain px-2 py-2">
              {single(DASHBOARD_TAB)}
              {/* Wren from the menu too: on the editors the floating bird is
                  hidden on phones so it doesn't cover the bottom tools. */}
              <button
                type="button"
                onClick={() => {
                  close();
                  assistant.setOpen(true);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left"
              >
                <Tile icon={WrenBirdIcon} tile="bg-wren-soft text-[#2243B6]" />
                <span className="font-sans text-[15px] font-semibold text-ink">Ask Wren</span>
              </button>
              {NAV_ITEMS.map((item) => {
                if (!isNavGroup(item)) {
                  return (
                    <div key={item.href} className="mt-2 border-t border-hairline pt-2">
                      {single(item)}
                    </div>
                  );
                }
                return (
                  <section key={item.label} className="mt-2 border-t border-hairline pt-2">
                    <h2 className="flex items-center gap-3 px-2 py-1.5">
                      <Tile icon={item.icon} tile={item.tile} />
                      <span className="font-sans text-xs font-semibold uppercase tracking-[0.12em] text-ink/60">
                        {item.label}
                      </span>
                    </h2>
                    {item.links.map((link) => {
                      const LinkIcon = link.icon;
                      const current = isActiveLink(pathname, link.href, item.links);
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={close}
                          aria-current={current ? "page" : undefined}
                          className={`flex items-center gap-3 rounded-xl py-2 pl-[22px] pr-2 ${current ? "bg-parchment" : ""}`}
                        >
                          <LinkIcon className={`h-5 w-5 shrink-0 ${current ? "text-ink" : "text-ink/50"}`} />
                          <span className="min-w-0">
                            <span className="block font-sans text-[15px] font-semibold leading-tight text-ink">
                              {link.label}
                            </span>
                            <span className="block font-sans text-[13px] leading-snug text-ink/60">{link.hint}</span>
                          </span>
                        </Link>
                      );
                    })}
                  </section>
                );
              })}
              <div className="mt-2 border-t border-hairline pt-2">{single(HELP_TAB)}</div>
            </nav>

            <div className="border-t border-hairline px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
              <Link
                href="/account"
                onClick={close}
                className="block truncate font-mono-numbers text-sm text-ink/60"
              >
                {email}
              </Link>
              <div className="mt-2 flex items-center gap-5 font-mono-numbers text-sm">
                {isAdmin && (
                  <a href="https://admin.youdoido.com" className="text-brass hover:underline">
                    Admin
                  </a>
                )}
                <form action={signOut}>
                  <button type="submit" className="text-brass hover:underline">
                    Log out
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
