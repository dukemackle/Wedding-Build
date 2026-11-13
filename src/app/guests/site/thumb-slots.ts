"use client";

/**
 * Who gets a live frame. Every SitePageThumb is a whole guest-site page in an
 * iframe, and a phone can't hold a dozen of those at once: iOS Safari ran out
 * of memory on /guests/site and showed "A problem repeatedly occurred"
 * (owner, 2026-11-06). So frames are rationed: only cards on or near the
 * screen get one, at most a few at a time (fewer on phones), a couple start
 * at once rather than all together, and a card that scrolls away gives its
 * frame back. Desktop holds a whole "See more" page of twelve: at eight the
 * bottom row stayed blank (owner, 2026-11-12, "templates load super slow").
 */

type Entry = { el: HTMLElement; near: boolean; listener: () => void };

const entries = new Map<number, Entry>();
const live = new Set<number>();
/** Frames still loading, each with a timer so one that never says it's ready can't hold up the rest. */
const loading = new Map<number, ReturnType<typeof setTimeout>>();
let nextId = 1;

function isPhone() {
  return window.matchMedia("(max-width: 639px), (pointer: coarse)").matches;
}

function cap() {
  if (typeof window === "undefined") return 0;
  return isPhone() ? 4 : 12;
}

/** How many frames may load at once: one at a time made a dozen cards take a dozen round trips. */
function parallel() {
  return isPhone() ? 2 : 3;
}

/** Cards that want a frame, in page order (top of the page first). */
function wanted(): number[] {
  return [...entries.entries()]
    .filter(([, e]) => e.near && e.el.isConnected)
    .sort(([, a], [, b]) => (a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
    .map(([id]) => id)
    .slice(0, cap());
}

function clearLoading(id: number) {
  clearTimeout(loading.get(id));
  loading.delete(id);
}

function pump() {
  const keep = new Set(wanted());
  const changed = new Set<number>();
  for (const id of [...live]) {
    if (!keep.has(id)) {
      live.delete(id);
      changed.add(id);
      clearLoading(id);
    }
  }
  for (const next of keep) {
    if (loading.size >= parallel()) break;
    if (live.has(next)) continue;
    live.add(next);
    changed.add(next);
    loading.set(
      next,
      setTimeout(() => {
        clearLoading(next);
        pump();
      }, 4000),
    );
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
  clearLoading(id);
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
  if (!loading.has(id)) return;
  clearLoading(id);
  pump();
}

export function thumbIsLive(id: number) {
  return live.has(id);
}
