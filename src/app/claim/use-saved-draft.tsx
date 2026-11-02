"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** The server's copy of their unsent form, from the page. */
export type ServerDraft = { data: unknown; savedAt: number } | null;

// How long typing has to pause before the server copy is updated.
const SAVE_DELAY = 1500;

/**
 * Keeps what a venue or vendor has typed on the claim form, so nothing they
 * do -- a crash, a refresh, closing the tab, opening the emailed link on
 * another device or in Gmail's own browser, a replaced or expired link --
 * makes them start over. Two copies: this browser's (instant, works offline)
 * and the server's (saved after a short pause, and right away when the tab is
 * hidden, which is the last moment a phone reliably gives us).
 *
 * The newest copy wins when the page opens. The one thing newer than a draft
 * is a submission they sent after it (`submittedAt`): then the page's own
 * starting point -- built from that submission -- stands. Drafts are matched
 * by time, not by what the listing looked like, so an edit to the listing in
 * the meantime no longer throws their work away.
 */
export function useSavedDraft<T>(
  token: string,
  server: ServerDraft,
  submittedAt: number,
  snapshot: T,
  restore: (saved: Partial<T>) => void,
  saveRemote: (token: string, draft: T) => Promise<{ error?: string }>,
): { restored: boolean; clear: () => void } {
  const key = `claim-draft:${token}`;
  const [restored, setRestored] = useState(false);
  const loaded = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unsent = useRef<T | null>(null);

  useEffect(() => {
    rememberLink(window.location.pathname);
    let local: { savedAt: number; data: unknown } | null = null;
    try {
      const raw = window.localStorage.getItem(key);
      const parsed = raw ? (JSON.parse(raw) as { savedAt?: number; data: unknown }) : null;
      // Drafts from before this kept a time count as oldest.
      if (parsed?.data) local = { savedAt: parsed.savedAt ?? 0, data: parsed.data };
    } catch {
      // Private window or blocked storage: the server copy still works.
    }
    const best = [local, server]
      .filter((d): d is { savedAt: number; data: unknown } => Boolean(d && d.data && d.savedAt > submittedAt))
      .sort((a, b) => b.savedAt - a.savedAt)[0];
    if (best && typeof best.data === "object") {
      restore(best.data as Partial<T>);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reads browser storage once mounted
      setRestored(true);
    }
    // Once per link: `restore` is a fresh closure every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Sends whatever hasn't reached the server yet.
  const flush = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const draft = unsent.current;
    if (!draft) return;
    unsent.current = null;
    // Best effort: the browser copy is already safe, and the next change retries.
    saveRemote(token, draft)
      .then((r) => {
        if (r.error && !unsent.current) unsent.current = draft;
      })
      .catch(() => {
        if (!unsent.current) unsent.current = draft;
      });
  }, [token, saveRemote]);

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") flush();
    };
    const onLeave = () => flush();
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onLeave);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onLeave);
      flush();
    };
  }, [flush]);

  const json = JSON.stringify(snapshot);
  useEffect(() => {
    // Skip the first pass: it still holds the untouched form, and would
    // overwrite the draft the effect above is restoring.
    if (!loaded.current) {
      loaded.current = true;
      return;
    }
    const data = JSON.parse(json) as T;
    try {
      window.localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), data }));
    } catch {
      // Full or blocked storage: the server copy still works.
    }
    unsent.current = data;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, SAVE_DELAY);
  }, [key, json, flush]);

  return {
    restored,
    // After a successful send (the server drops its copy as it saves the submission).
    clear: () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
      unsent.current = null;
      try {
        window.localStorage.removeItem(key);
      } catch {}
    },
  };
}

/**
 * Claim links this browser has opened, newest first, so "List your business"
 * can send someone back to the listing they already started instead of
 * making a second, empty one.
 */
export const STARTED_LINKS_KEY = "claim-links";

function rememberLink(path: string) {
  try {
    const known = JSON.parse(window.localStorage.getItem(STARTED_LINKS_KEY) ?? "[]") as string[];
    const next = [path, ...known.filter((p) => p !== path)].slice(0, 10);
    window.localStorage.setItem(STARTED_LINKS_KEY, JSON.stringify(next));
  } catch {}
}

/** Shown once a saved draft has been put back. */
export function SavedNote() {
  return (
    <p className="rounded-md border border-hairline bg-card px-4 py-3 text-sm text-ink/70">
      Welcome back -- we kept everything you&apos;d filled in. Pick up where you left off.
    </p>
  );
}
