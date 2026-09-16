"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const isActive = links.some((l) => pathname.startsWith(l.href));

  /**
   * The panel is positioned against the viewport rather than the button.
   *
   * The nav is a horizontally scrollable strip so every tab stays on one
   * row, and a scroll container clips on both axes -- an absolutely
   * positioned panel inside it would be cut off at the strip's edge.
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
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
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
        className={`flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-1 font-display text-lg transition-colors ${
          isActive ? "bg-forest/10 text-forest" : "text-ink/70 hover:text-forest"
        }`}
      >
        <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-forest" : "text-brass"}`} />
        {label}
        <ChevronDownIcon
          className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && anchor && (
        <div
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
        </div>
      )}
    </div>
  );
}
