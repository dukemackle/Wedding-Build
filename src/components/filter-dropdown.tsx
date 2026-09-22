"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon, CloseIcon } from "@/components/icons";

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
  const isActive = value !== "all";
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

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
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className={`flex items-center gap-1.5 py-1.5 ${isActive ? "" : "pl-3"}`}
        >
          {isActive ? selected?.label ?? label : label}
          <ChevronDownIcon
            className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 max-h-72 w-56 overflow-y-auto rounded-md border border-hairline bg-card py-1 shadow-sm animate-page-in">
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
        </div>
      )}
    </div>
  );
}
