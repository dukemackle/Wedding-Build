"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/** The three run sheets, widest first: each is everything its readers need. */
const RUN_SHEETS = [
  { key: "all", label: "Full run sheet", help: "Everything. The one for you and your vendors." },
  { key: "party", label: "Wedding party & family", help: "Their call times plus the guest schedule." },
  { key: "guests", label: "Guests", help: "What's on your guest site, on paper." },
] as const;

export function RunSheetMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function close(e: MouseEvent | KeyboardEvent) {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
        className="btn-secondary"
      >
        Print run sheet
        <svg viewBox="0 0 12 12" aria-hidden="true" className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-hairline bg-card shadow-lg">
          {RUN_SHEETS.map((sheet) => (
            <Link
              key={sheet.key}
              href={sheet.key === "all" ? "/itinerary/print" : `/itinerary/print?for=${sheet.key}`}
              onClick={() => setOpen(false)}
              className="block border-b border-hairline px-4 py-3 last:border-b-0 hover:bg-parchment focus-visible:bg-parchment focus-visible:outline-none"
            >
              <span className="block text-sm font-semibold text-ink">{sheet.label}</span>
              <span className="mt-0.5 block text-xs text-ink/60">{sheet.help}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
