"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Keeps what a couple types into a form on their device until it saves, so a
 * failed save, a reload or a crashed page never takes their words with it.
 *
 * Put `ref` on the form (or any element holding the fields), `onInput={keep}`
 * on it too, call `done()` once the save works, and show `<KeptNotice />`
 * when `restored`. Only named text fields are kept; hidden fields, files and
 * checkboxes aren't.
 */
export function useKeptWords<T extends HTMLElement = HTMLFormElement>(key: string) {
  const ref = useRef<T>(null);
  const dirty = useRef(false);
  const [restored, setRestored] = useState(false);
  const storageKey = `kept-words:${key}`;

  useEffect(() => {
    const draft = read(storageKey);
    const root = ref.current;
    if (!draft || !root) return;
    let changed = false;
    for (const el of fields(root)) {
      const value = draft[el.name];
      if (typeof value === "string" && value !== el.value) {
        el.value = value;
        changed = true;
      }
    }
    if (changed) {
      dirty.current = true;
      setRestored(true);
    } else forget(storageKey);
  }, [storageKey]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty.current) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  const keep = useCallback(() => {
    const root = ref.current;
    if (!root) return;
    const draft: Record<string, string> = {};
    for (const el of fields(root)) draft[el.name] = el.value;
    dirty.current = Object.values(draft).some((v) => v.trim() !== "");
    write(storageKey, draft);
  }, [storageKey]);

  const done = useCallback(() => {
    dirty.current = false;
    setRestored(false);
    forget(storageKey);
  }, [storageKey]);

  return { ref, keep, done, restored };
}

/** Said when a save throws (an old tab after a deploy, a dropped connection). */
export const SAVE_FAILED =
  "Couldn't save just now. Your words are still here and kept on this device. Reload the page and save again.";

export function KeptNotice() {
  return (
    <p className="rounded-md bg-[#FFF12F]/40 px-3 py-2 text-sm text-ink">
      We kept the words you hadn&apos;t saved yet. Save to put them on your site.
    </p>
  );
}

const TEXT_TYPES = new Set(["text", "url", "email", "tel", "search", "number", ""]);

function fields(root: HTMLElement) {
  return Array.from(root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input[name], textarea[name]")).filter(
    (el) => el instanceof HTMLTextAreaElement || TEXT_TYPES.has(el.getAttribute("type") ?? ""),
  );
}

function read(key: string): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function write(key: string, draft: Record<string, string>) {
  try {
    localStorage.setItem(key, JSON.stringify(draft));
  } catch {
    // Private window or full storage: the form still works, just unprotected.
  }
}

function forget(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Nothing to clear without storage.
  }
}
