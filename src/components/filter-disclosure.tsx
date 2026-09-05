"use client";

import { useState } from "react";
import type { ReactNode } from "react";

export function FilterDisclosure({
  activeCount,
  children,
}: {
  activeCount: number;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition-colors ${
          open
            ? "border-forest bg-forest text-parchment"
            : "border-hairline bg-parchment text-ink hover:border-forest"
        }`}
      >
        {open ? "Hide filters" : "Filters"}
        {activeCount > 0 && (
          <span
            className={`rounded-full px-1.5 py-0.5 font-mono-numbers text-xs ${
              open ? "bg-parchment text-forest" : "bg-forest text-parchment"
            }`}
          >
            {activeCount}
          </span>
        )}
      </button>
      {open && <div className="mt-4 flex flex-col gap-4">{children}</div>}
    </div>
  );
}
