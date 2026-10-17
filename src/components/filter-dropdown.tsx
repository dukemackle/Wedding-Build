"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDownIcon, CloseIcon } from "@/components/icons";

/** Matches the menu's w-56. */
const MENU_WIDTH = 224;

export function FilterDropdown({
  label,
  allLabel,
  value,
  options,
  onChange,
  emptyMessage,
}: {
  label: string;
  allLabel: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  emptyMessage?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  /**
   * Where the open menu sits, in viewport pixels. The menu is portalled to
   * <body> and fixed there: on a phone the pills live in a sideways-scrolling
   * row, and a scrolling box clips anything hanging below it, so a menu
   * positioned inside the row opened invisibly.
   */
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const isActive = value !== "all";
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (ref.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    }
    // A fixed menu would drift away from its pill, so moving anything closes it.
    function onScroll(e: Event) {
      if (menuRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open]);

  function toggle() {
    if (!open) {
      const rect = ref.current?.getBoundingClientRect();
      if (rect) {
        const left = Math.min(Math.max(rect.left, 8), window.innerWidth - MENU_WIDTH - 8);
        setPos({ top: rect.bottom + 8, left });
      }
    }
    setOpen(!open);
  }

  function handleSelect(next: string) {
    onChange(next);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative shrink-0">
      <div
        className={`flex items-center gap-1 whitespace-nowrap rounded-full border pr-3 text-sm shadow-md transition-colors lg:shadow-none ${
          isActive
            ? "border-forest bg-forest text-parchment"
            : "border-hairline bg-card text-ink hover:border-forest"
        }`}
      >
        {/* An active pill clears from the pill itself, the way a search
            filter chip does -- reopening the menu to pick "all" is a step. */}
        {isActive && (
          <button
            type="button"
            onClick={() => onChange("all")}
            aria-label={`Clear ${label} filter`}
            className="pl-2 text-parchment/80 transition-colors hover:text-parchment"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          className={`flex items-center gap-1.5 py-1.5 ${isActive ? "" : "pl-3"}`}
        >
          {isActive ? selected?.label ?? label : label}
          <ChevronDownIcon
            className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>
      {open && pos && createPortal(
        <div
          ref={menuRef}
          style={{ top: pos.top, left: pos.left }}
          className="fixed z-40 max-h-72 w-56 overflow-y-auto rounded-md border border-hairline bg-card py-1 shadow-md animate-page-in"
        >
          <button
            type="button"
            onClick={() => handleSelect("all")}
            className={`block w-full px-3 py-2 text-left text-sm transition-colors hover:bg-parchment ${
              value === "all" ? "text-forest" : "text-ink/80"
            }`}
          >
            {allLabel}
          </button>
          {options.length === 0 && emptyMessage ? (
            <p className="px-3 py-2 text-left text-sm text-ink/40">{emptyMessage}</p>
          ) : (
            options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`block w-full px-3 py-2 text-left text-sm transition-colors hover:bg-parchment ${
                  value === opt.value ? "text-forest" : "text-ink/80"
                }`}
              >
                {opt.label}
              </button>
            ))
          )}
        </div>,
        document.body,
      )}
    </div>
  );
}
