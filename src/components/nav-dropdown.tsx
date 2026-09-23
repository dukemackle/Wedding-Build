"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState, type ComponentType } from "react";
import { ChevronDownIcon } from "@/components/icons";

const PANEL_WIDTH = 192; // w-48

export function NavDropdown({
  label,
  icon: Icon,
  links,
}: {
  label: string;
  icon: ComponentType<{ className?: string }>;
  links: { href: string; label: string }[];
}) {
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
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - PANEL_WIDTH - 8));
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
        className={`flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 font-display text-lg transition-colors ${
          isActive ? "bg-forest/10 text-forest" : "text-ink/70 hover:text-forest"
        }`}
      >
        <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-forest" : "text-brass"}`} />
        {label}
        <ChevronDownIcon
          className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open &&
        anchor &&
        createPortal(
          <div
            ref={panelRef}
            style={{ position: "fixed", left: anchor.left, top: anchor.top, width: PANEL_WIDTH }}
            className="z-40 overflow-hidden rounded-md border border-hairline bg-card py-1 shadow-sm animate-page-in"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`block px-3 py-2 font-display text-base transition-colors hover:bg-parchment ${
                  pathname.startsWith(link.href) ? "text-forest" : "text-ink/80"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
