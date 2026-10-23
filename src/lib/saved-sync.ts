"use client";

import { useEffect, useRef } from "react";

/**
 * Keeps every heart for one listing in step. A listing page has two (the one
 * over the photo and the one in the side box) and a card can be unsaved from
 * its ••• menu, so a save anywhere is announced and each heart follows it.
 */
const EVENT = "youdoido:saved";

export type SavedKind = "venue" | "vendor";

type Detail = { kind: SavedKind; id: string; saved: boolean };

export function announceSaved(kind: SavedKind, id: string, saved: boolean) {
  window.dispatchEvent(new CustomEvent<Detail>(EVENT, { detail: { kind, id, saved } }));
}

export function useSavedSync(kind: SavedKind, id: string, onChange: (saved: boolean) => void) {
  const latest = useRef(onChange);
  useEffect(() => {
    latest.current = onChange;
  });
  useEffect(() => {
    function handle(e: Event) {
      const d = (e as CustomEvent<Detail>).detail;
      if (d.kind === kind && d.id === id) latest.current(d.saved);
    }
    window.addEventListener(EVENT, handle);
    return () => window.removeEventListener(EVENT, handle);
  }, [kind, id]);
}
