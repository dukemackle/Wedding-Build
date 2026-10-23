"use client";

import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * The ••• menu on a venue or vendor -- on result cards, saved cards and the
 * listing page -- plus the share helpers behind it.
 *
 * Two looks, one menu: frosted dark over the map on a phone (the way a phone's
 * own long-press menus look), a plain white dropdown on desktop.
 */

export type ListingMenuItem = {
  label: string;
  icon: ReactNode;
  /** May return a message to flash, like "Link copied". */
  onSelect: () => void | string | Promise<void | string>;
};

function absoluteUrl(path: string) {
  return new URL(path, window.location.origin).toString();
}

export async function copyLink(path: string): Promise<string> {
  try {
    await navigator.clipboard.writeText(absoluteUrl(path));
    return "Link copied";
  } catch {
    return "Couldn't copy the link";
  }
}

/**
 * The phone's share sheet (Messages, WhatsApp, email). A computer has no
 * useful one, so there the link is copied instead.
 */
export async function shareLink(title: string, path: string): Promise<string | void> {
  const touch = window.matchMedia("(pointer: coarse)").matches;
  if (touch && navigator.share) {
    try {
      await navigator.share({ title, url: absoluteUrl(path) });
      return;
    } catch (e) {
      // Dismissing the sheet isn't a failure.
      if (e instanceof DOMException && e.name === "AbortError") return;
    }
  }
  return copyLink(path);
}

/** A short message at the bottom of the screen. */
export function useFlash() {
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 2000);
    return () => clearTimeout(t);
  }, [message]);
  const node =
    message &&
    createPortal(
      <div
        role="status"
        className="fixed bottom-6 left-1/2 z-[1100] -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-sm text-parchment shadow-lg"
      >
        {message}
      </div>,
      document.body,
    );
  return [node, setMessage] as const;
}

/**
 * Press and hold a card to open its menu, as on a phone's home screen. The
 * click that ends the press is swallowed so the card's link doesn't open too.
 */
export function useLongPress(onLongPress: () => void) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fired = useRef(false);
  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  return {
    onTouchStart: () => {
      fired.current = false;
      cancel();
      timer.current = setTimeout(() => {
        fired.current = true;
        navigator.vibrate?.(10);
        onLongPress();
      }, 500);
    },
    onTouchMove: cancel,
    onTouchEnd: cancel,
    onTouchCancel: cancel,
    onClickCapture: (e: MouseEvent) => {
      if (fired.current) {
        e.preventDefault();
        e.stopPropagation();
        fired.current = false;
      }
    },
    onContextMenu: (e: MouseEvent) => {
      // The browser's own long-press menu (copy link, open in tab) would cover ours.
      if (fired.current || timer.current) e.preventDefault();
    },
  };
}

export function ListingMenu({
  name,
  items,
  open,
  onOpenChange,
  buttonClassName = "flex h-8 w-8 items-center justify-center rounded-full text-[#2243B6] hover:bg-ink/5",
}: {
  /** The listing's name, for the button's label. */
  name: string;
  items: ListingMenuItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buttonClassName?: string;
}) {
  const button = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const [place, setPlace] = useState<{ top: number; right: number } | null>(null);
  const [flash, setFlash] = useFlash();

  // Fixed to the screen and portalled out, so a card's rounded corners or the
  // results sheet can't clip it. Opens upward when there's no room below.
  useLayoutEffect(() => {
    if (!open || !button.current) return;
    const r = button.current.getBoundingClientRect();
    const height = items.length * 48 + 12;
    const below = r.bottom + 6 + height < window.innerHeight;
    setPlace({
      top: below ? r.bottom + 6 : Math.max(8, r.top - 6 - height),
      right: Math.max(8, window.innerWidth - r.right),
    });
  }, [open, items.length]);

  useEffect(() => {
    if (!open) return;
    menu.current?.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true });
    function onDown(e: PointerEvent) {
      const t = e.target as Node;
      if (!menu.current?.contains(t) && !button.current?.contains(t)) onOpenChange(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        // Close the menu, not the listing panel behind it.
        e.stopImmediatePropagation();
        onOpenChange(false);
        button.current?.focus();
      }
    }
    const onScroll = () => onOpenChange(false);
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, onOpenChange]);

  async function select(item: ListingMenuItem) {
    onOpenChange(false);
    const message = await item.onSelect();
    if (message) setFlash(message);
  }

  return (
    <>
      <button
        ref={button}
        type="button"
        aria-label={`More options for ${name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onOpenChange(!open);
        }}
        className={buttonClassName}
      >
        <DotsIcon />
      </button>
      {open &&
        place &&
        createPortal(
          <div
            ref={menu}
            role="menu"
            style={{ top: place.top, right: place.right }}
            className="fixed z-[1000] min-w-52 overflow-hidden rounded-2xl bg-ink/85 p-1.5 text-parchment shadow-2xl ring-1 ring-white/10 backdrop-blur-xl motion-safe:animate-[menu-in_120ms_ease-out] lg:rounded-xl lg:bg-card lg:p-1 lg:text-ink lg:shadow-lg lg:ring-hairline lg:backdrop-blur-none"
          >
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                onClick={() => select(item)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[15px] outline-none hover:bg-white/10 focus-visible:bg-white/10 lg:rounded-lg lg:py-2 lg:text-sm lg:hover:bg-ink/5 lg:focus-visible:bg-ink/5"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center opacity-90 lg:text-[#2243B6]">
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
      {flash}
    </>
  );
}

const icon = {
  viewBox: "0 0 24 24",
  className: "h-5 w-5",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function DotsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <circle cx="5" cy="12" r="1.9" />
      <circle cx="12" cy="12" r="1.9" />
      <circle cx="19" cy="12" r="1.9" />
    </svg>
  );
}

export function ShareIcon() {
  return (
    <svg {...icon}>
      <path d="M12 3v12M7.5 7.5 12 3l4.5 4.5M6 11H5v9.5h14V11h-1" />
    </svg>
  );
}

export function LinkIcon() {
  return (
    <svg {...icon}>
      <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" />
    </svg>
  );
}

export function HideIcon() {
  return (
    <svg {...icon}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M6 18 18 6" />
    </svg>
  );
}

export function ShowIcon() {
  return (
    <svg {...icon}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  );
}

export function SimilarIcon() {
  return (
    <svg {...icon}>
      <path d="M3 10.5 6.5 7l3.5 3.5V14H3zM14 10.5 17.5 7l3.5 3.5V14h-7zM3 20.5 6.5 17l3.5 3.5M14 20.5 17.5 17l3.5 3.5" />
    </svg>
  );
}

export function UnsaveIcon() {
  return (
    <svg {...icon}>
      <path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z" />
      <path d="M4 4l16 16" />
    </svg>
  );
}

export function DirectionsIcon() {
  return (
    <svg {...icon}>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.3" />
    </svg>
  );
}

export function QuoteIcon() {
  return (
    <svg {...icon}>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </svg>
  );
}
