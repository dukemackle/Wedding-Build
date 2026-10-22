"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Keeps what a venue or vendor has typed on the claim form in this browser,
 * so a crash, a refresh or closing the tab doesn't cost them their work. It
 * saves on every change, restores once on load, and is cleared when they send.
 *
 * `initial` is what the server handed the form. A saved draft is only restored
 * over the same starting point: if the listing or their pending submission has
 * changed since (sent from another device, say), the server's copy wins.
 */
export function useSavedDraft<T>(
  token: string,
  initial: unknown,
  snapshot: T,
  restore: (saved: T) => void,
): { restored: boolean; clear: () => void } {
  const key = `claim-draft:${token}`;
  const base = fingerprint(JSON.stringify(initial));
  const [restored, setRestored] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      const saved = raw ? (JSON.parse(raw) as { base: string; data: T }) : null;
      if (saved && saved.base === base) {
        restore(saved.data);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- reads browser storage once mounted
        setRestored(true);
      }
    } catch {
      // Private window or blocked storage: the form still works, just unsaved.
    }
    // Once per link: `restore` is a fresh closure every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, base]);

  const json = JSON.stringify(snapshot);
  useEffect(() => {
    // Skip the first pass: it still holds the untouched form, and would
    // overwrite the draft the effect above is restoring.
    if (!loaded.current) {
      loaded.current = true;
      return;
    }
    try {
      window.localStorage.setItem(key, JSON.stringify({ base, data: JSON.parse(json) }));
    } catch {
      // Full or blocked storage: nothing to do.
    }
  }, [key, base, json]);

  return {
    restored,
    clear: () => {
      try {
        window.localStorage.removeItem(key);
      } catch {}
    },
  };
}

/** Shown once a saved draft has been put back. */
export function SavedNote() {
  return (
    <p className="rounded-md border border-hairline bg-card px-4 py-3 text-sm text-ink/70">
      Welcome back -- we kept what you&apos;d filled in on this device. Pick up where you left off.
    </p>
  );
}

function fingerprint(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return `${s.length}:${h}`;
}
