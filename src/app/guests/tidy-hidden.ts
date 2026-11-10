"use client";

import { useEffect, useState } from "react";

/**
 * "Hide" on the list's Needs attention row. It remembers the total it was
 * hidden at and comes back when there's more to do than that (a fresh
 * import, say). The row itself lives in guests-manager.tsx; it replaced the
 * old "Tidy your list" card.
 */

const HIDDEN_KEY = "guests-tidy-hidden-at";

function readHiddenAt() {
  try {
    const raw = window.localStorage.getItem(HIDDEN_KEY);
    return raw == null ? null : Number(raw);
  } catch {
    return null;
  }
}

export function useTidyHidden(total: number) {
  const [hiddenAt, setHiddenAt] = useState<number | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads browser storage once mounted
    setHiddenAt(readHiddenAt());
  }, []);
  const hidden = hiddenAt != null && total <= hiddenAt;
  function hide() {
    setHiddenAt(total);
    try {
      window.localStorage.setItem(HIDDEN_KEY, String(total));
    } catch {
      // Private window: it stays hidden until the page reloads.
    }
  }
  return { hidden, hide };
}
