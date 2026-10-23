"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Listings a couple has ruled out with "Hide", kept on this device. Hidden
 * ones drop out of the search results until "Show hidden" brings them back.
 * Device-only on purpose: it's a tidy-up, not something worth a table.
 */
export function useHiddenListings(storageKey: string) {
  const [hidden, setHidden] = useState<Set<string>>(() => new Set());

  // After mount: the server can't see localStorage.
  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(storageKey) ?? "[]");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- storage only exists after mount
      if (Array.isArray(saved)) setHidden(new Set(saved.filter((id) => typeof id === "string")));
    } catch {
      // Private window or blocked storage: nothing hidden.
    }
  }, [storageKey]);

  const write = useCallback(
    (next: Set<string>) => {
      setHidden(next);
      try {
        window.localStorage.setItem(storageKey, JSON.stringify([...next]));
      } catch {
        // Still hidden for this visit.
      }
    },
    [storageKey],
  );

  const hide = useCallback((id: string) => write(new Set(hidden).add(id)), [hidden, write]);
  const unhide = useCallback(
    (id: string) => {
      const next = new Set(hidden);
      next.delete(id);
      write(next);
    },
    [hidden, write],
  );

  return { hidden, hide, unhide };
}
