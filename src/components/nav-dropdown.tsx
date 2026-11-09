"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "@/components/icons";
import { NavTileFace, navTabClass, type NavGroup } from "@/components/nav-links";
import { isActiveLink } from "@/lib/nav";

const PANEL_WIDTH = 304;

export function NavDropdown({ group }: { group: NavGroup }) {
  const { label, icon, tile, links } = group;
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<{ left: number; top: number } | null>(null);
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isActive = links.some((l) => pathname.startsWith(l.href));

  /**
   * The panel is positioned against the viewport and rendered through a
   * portal, for two separate reasons:
   *
   * - The nav is a horizontally scrollable strip so every tab stays on one
   *   row, and a scroll container clips on both axes, so an absolutely
   *   positioned panel would be cut off at the strip's edge.
   * - The header applies a transform to slide itself out of the way on
   *   scroll, and a transformed ancestor becomes the containing block for
   *   `position: fixed` children. Left in place, the panel's viewport
   *   coordinates would resolve against the header and land far to the
   *   right of the tab. The portal takes it out of that subtree entirely.
   */
  function place() {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    // Centred under the tile, kept on screen.
    const centre = rect.left + rect.width / 2 - PANEL_WIDTH / 2;
    const left = Math.max(8, Math.min(centre, window.innerWidth - PANEL_WIDTH - 8));
    setAnchor({ left, top: rect.bottom + 8 });
  }

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node;
      // The panel is portalled out of `ref`, so it has to be checked
      // separately -- otherwise clicking a link inside it counts as an
      // outside click, and the panel unmounts before the click lands.
      if (ref.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    // A fixed panel doesn't travel with the button, so rather than tracking
    // it, close on anything that would move it.
    function onMove() {
      setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
    };
  }, [open]);

  return (
    <div ref={ref} className="shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          if (!open) place();
          setOpen((v) => !v);
        }}
        aria-expanded={open}
        className={navTabClass(isActive)}
      >
        <NavTileFace
          icon={icon}
          tile={tile}
          label={label}
          active={isActive}
          chevron={
            <ChevronDownIcon
              className={`h-3 w-3 shrink-0 opacity-70 transition-transform ${open ? "rotate-180" : ""}`}
            />
          }
        />
      </button>
      {open &&
        anchor &&
        createPortal(
          <div
            ref={panelRef}
            style={{ position: "fixed", left: anchor.left, top: anchor.top, width: PANEL_WIDTH }}
            className="z-40 overflow-hidden rounded-2xl border border-hairline bg-card p-1.5 shadow-xl animate-page-in"
          >
            {links.map((link) => {
              const LinkIcon = link.icon;
              const current = isActiveLink(pathname, link.href, links);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={current ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-xl px-2.5 py-2 transition-colors hover:bg-parchment ${
                    current ? "bg-parchment" : ""
                  }`}
                >
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-[10px] ${tile}`}>
                    <LinkIcon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-sans text-[15px] font-semibold leading-tight text-ink">{link.label}</span>
                    <span className="block font-sans text-[13px] leading-snug text-ink/60">{link.hint}</span>
                  </span>
                </Link>
              );
            })}
          </div>,
          document.body,
        )}
    </div>
  );
}
