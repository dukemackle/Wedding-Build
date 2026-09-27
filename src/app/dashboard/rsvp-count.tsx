"use client";

import { useEffect, useState } from "react";

/**
 * The dashboard's "N yes" count. The page isn't live, so "a new yes came in"
 * means "more than last time this browser looked": the last count seen is
 * kept per wedding in localStorage, and when it's gone up the number pops and
 * a "+N" floats beside it. No `seenKey` (the landing page's sample) means no
 * memory and no bump.
 */
export function RsvpYesCount({ count, seenKey }: { count: number; seenKey?: string }) {
  const [gained, setGained] = useState(0);

  useEffect(() => {
    if (!seenKey) return;
    const key = `wren-rsvp-yes-${seenKey}`;
    let last: number | null = null;
    try {
      const stored = localStorage.getItem(key);
      last = stored == null ? null : Number(stored);
      localStorage.setItem(key, String(count));
    } catch {
      return;
    }
    // First visit on this browser: nothing to compare against.
    if (last == null || !(count > last)) return;
    // Reads storage, so it can only be decided after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGained(count - last);
    const t = setTimeout(() => setGained(0), 3200);
    return () => clearTimeout(t);
  }, [count, seenKey]);

  return (
    <span className="relative inline-flex items-baseline gap-1">
      <span className={gained ? "wren-bump inline-block" : "inline-block"}>{count}</span> yes
      {gained > 0 && (
        <span className="wren-float-up absolute bottom-full left-0 mb-1 whitespace-nowrap rounded-full bg-forest px-1.5 font-semibold text-parchment">
          +{gained} new
        </span>
      )}
    </span>
  );
}
