"use client";

import { useState } from "react";

/** Past this many characters the rest folds behind "Read more". */
const FOLD_AT = 520;

/**
 * A listing's long text (About, Good to know): the first sentence as a
 * slightly larger lead-in, the rest at a comfortable line length, and long
 * text folded so the page's other sections stay in reach.
 */
export function ListingProse({ text, open = false }: { text: string; open?: boolean }) {
  const [expanded, setExpanded] = useState(open);
  const trimmed = text.trim();
  // The lead-in is the first sentence of the first paragraph, when it's a sensible length.
  const match = trimmed.match(/^([^\n]{20,240}?[.!?])\s+(?=[A-Z“"‘'(])/);
  const lede = match ? match[1] : null;
  const rest = lede ? trimmed.slice(match![0].length) : trimmed;
  const foldable = rest.length > FOLD_AT;

  return (
    <div className="mt-4 max-w-prose">
      {lede && <p className="text-lg leading-relaxed text-ink">{lede}</p>}
      {rest && (
        <p
          className={`${lede ? "mt-3" : ""} whitespace-pre-line leading-relaxed text-ink/75 ${
            foldable && !expanded ? "line-clamp-5" : ""
          }`}
        >
          {rest}
        </p>
      )}
      {foldable && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          className="mt-2 text-sm font-medium text-brass hover:underline"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}
