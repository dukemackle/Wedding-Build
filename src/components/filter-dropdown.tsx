"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ChevronDownIcon, CloseIcon } from "@/components/icons";

/** Matches the menu's w-56. */
const MENU_WIDTH = 224;

type Option = { value: string; label: string; icon?: ReactNode };

/**
 * A filter pill with a menu. By default it picks one value ("all" for none).
 * With `multiple`, the menu stays open and ticks any number of values; the
 * value is then the picks joined with MULTI_SEPARATOR, or "all" for none.
 */
export const MULTI_SEPARATOR = "|";

export function splitMulti(value: string): string[] {
  return value === "all" || !value ? [] : value.split(MULTI_SEPARATOR);
}

export function FilterDropdown({
  label,
  allLabel,
  value,
  options,
  onChange,
  emptyMessage,
  multiple = false,
  searchPlaceholder,
  note,
}: {
  label: string;
  allLabel: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  emptyMessage?: string;
  multiple?: boolean;
  /** Adds a type-to-narrow box above the options, for long lists like cities. */
  searchPlaceholder?: string;
  /** A short line under the options, e.g. what the filter does with blanks. */
  note?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  /**
   * Where the open menu sits, in viewport pixels. The menu is portalled to
   * <body> and fixed there: on a phone the pills live in a sideways-scrolling
   * row, and a scrolling box clips anything hanging below it, so a menu
   * positioned inside the row opened invisibly.
   */
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const picked = multiple ? splitMulti(value) : value === "all" ? [] : [value];
  const isActive = picked.length > 0;
  const pillLabel =
    picked.length === 1
      ? options.find((o) => o.value === picked[0])?.label ?? picked[0]
      : `${label} · ${picked.length}`;

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
      // A phone's keyboard opening for the search box resizes or scrolls the
      // page; that shouldn't close the menu being typed into.
      if (searchRef.current && document.activeElement === searchRef.current) return;
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
    setQuery("");
    setOpen(!open);
  }

  // Focus the search box on desktop only: on a phone, opening the keyboard
  // unasked would cover the list the couple is about to look at.
  useEffect(() => {
    if (open && searchPlaceholder && window.matchMedia("(pointer: fine)").matches) {
      searchRef.current?.focus();
    }
  }, [open, searchPlaceholder]);

  // Names that start with the query come first ("Aus" -> Austin before
  // Lake Austin), then any that contain it.
  const q = query.trim().toLowerCase();
  const shown = q
    ? [
        ...options.filter((o) => o.label.toLowerCase().startsWith(q)),
        ...options.filter((o) => !o.label.toLowerCase().startsWith(q) && o.label.toLowerCase().includes(q)),
      ]
    : options;

  function handleSelect(next: string) {
    if (multiple && next !== "all") {
      // Kept in the options' order, so the same picks always save the same way.
      const nextPicked = picked.includes(next) ? picked.filter((p) => p !== next) : [...picked, next];
      const ordered = options.map((o) => o.value).filter((v) => nextPicked.includes(v));
      onChange(ordered.length ? ordered.join(MULTI_SEPARATOR) : "all");
      return;
    }
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
          {isActive ? pillLabel : label}
          <ChevronDownIcon
            className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>
      {open && pos && createPortal(
        <div
          ref={menuRef}
          style={{ top: pos.top, left: pos.left }}
          role={multiple ? "listbox" : undefined}
          aria-multiselectable={multiple || undefined}
          className={`fixed z-40 max-h-72 w-56 overflow-y-auto rounded-md border border-hairline bg-card shadow-md animate-page-in ${searchPlaceholder ? "pb-1" : "py-1"}`}
        >
          {searchPlaceholder && (
            <div className="sticky top-0 z-10 border-b border-hairline bg-card p-2">
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && shown[0]) handleSelect(shown[0].value);
                }}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="w-full rounded-md border border-hairline bg-parchment/60 px-2.5 py-1.5 text-base text-ink placeholder:text-ink/40 focus:border-forest focus:outline-none sm:text-sm"
              />
            </div>
          )}
          {!q && (
            <button
              type="button"
              onClick={() => handleSelect("all")}
              className={`block w-full px-3 py-2 text-left text-sm transition-colors hover:bg-parchment ${
                !isActive ? "text-forest" : "text-ink/80"
              }`}
            >
              {allLabel}
            </button>
          )}
          {options.length === 0 && emptyMessage ? (
            <p className="px-3 py-2 text-left text-sm text-ink/40">{emptyMessage}</p>
          ) : q && shown.length === 0 ? (
            <p className="px-3 py-2 text-left text-sm text-ink/40">No match for &ldquo;{query.trim()}&rdquo;</p>
          ) : (
            shown.map((opt) => {
              const on = picked.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  role={multiple ? "option" : undefined}
                  aria-selected={multiple ? on : undefined}
                  onClick={() => handleSelect(opt.value)}
                  className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-parchment ${
                    on ? "text-forest" : "text-ink/80"
                  }`}
                >
                  {multiple && (
                    <span
                      aria-hidden
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] leading-none ${
                        on ? "border-forest bg-forest text-parchment" : "border-hairline bg-card"
                      }`}
                    >
                      {on ? "\u2713" : ""}
                    </span>
                  )}
                  {opt.icon}
                  <span className="min-w-0 flex-1">{opt.label}</span>
                </button>
              );
            })
          )}
          {note && <p className="mt-1 border-t border-hairline px-3 pb-1 pt-2 text-xs leading-snug text-ink/50">{note}</p>}
        </div>,
        document.body,
      )}
    </div>
  );
}
