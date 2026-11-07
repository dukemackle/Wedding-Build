"use client";

/**
 * Who gets a live frame. Every SitePageThumb is a whole guest-site page in an
 * iframe, and a phone can't hold a dozen of those at once: iOS Safari ran out
 * of memory on /guests/site and showed "A problem repeatedly occurred"
 * (owner, 2026-11-06). So frames are rationed: only cards on or near the
 * screen get one, at most a few at a time (fewer on phones), they start one
 * after another rather than all together, and a card that scrolls away gives
 * its frame back.
 */

type Entry = { el: HTMLElement; near: boolean; listener: () => void };

const entries = new Map<number, Entry>();
const live = new Set<number>();
let loading: number | null = null;
let loadingTimer: ReturnType<typeof setTimeout> | undefined;
let nextId = 1;

function cap() {
  if (typeof window === "undefined") return 0;
  const phone = window.matchMedia("(max-width: 639px), (pointer: coarse)").matches;
  return phone ? 4 : 8;
}

/** Cards that want a frame, in page order (top of the page first). */
function wanted(): number[] {
  return [...entries.entries()]
    .filter(([, e]) => e.near && e.el.isConnected)
    .sort(([, a], [, b]) => (a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
    .map(([id]) => id)
    .slice(0, cap());
}

function clearLoading() {
  loading = null;
  clearTimeout(loadingTimer);
}

function pump() {
  const keep = new Set(wanted());
  const changed = new Set<number>();
  for (const id of [...live]) {
    if (!keep.has(id)) {
      live.delete(id);
      changed.add(id);
      if (loading === id) clearLoading();
    }
  }
  if (loading === null) {
    const next = [...keep].find((id) => !live.has(id));
    if (next !== undefined) {
      live.add(next);
      changed.add(next);
      loading = next;
      // A frame that never says it's ready mustn't hold up the rest.
      loadingTimer = setTimeout(() => {
        if (loading === next) {
          clearLoading();
          pump();
        }
      }, 4000);
    }
  }
  for (const id of changed) entries.get(id)?.listener();
}

export function registerThumb(el: HTMLElement, listener: () => void) {
  const id = nextId++;
  entries.set(id, { el, near: false, listener });
  return id;
}

export function unregisterThumb(id: number) {
  entries.delete(id);
  live.delete(id);
  if (loading === id) clearLoading();
  pump();
}

export function setThumbNear(id: number, near: boolean) {
  const entry = entries.get(id);
  if (!entry || entry.near === near) return;
  entry.near = near;
  pump();
}

/** The frame has loaded and shown its look; let the next one start. */
export function thumbReady(id: number) {
  if (loading !== id) return;
  clearLoading();
  pump();
}

export function thumbIsLive(id: number) {
  return live.has(id);
}
