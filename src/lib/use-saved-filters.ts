"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Browse-screen filters that survive a reload, the back button and a shared
 * link: every filter lives in the page address (`?state=Texas&category=Cake`),
 * and the last search is remembered on this device so coming back to the page
 * picks up where the couple left off.
 *
 * A filter at its default ("all", or "" for the name search) is left out of the
 * address, so a fresh page keeps a clean URL.
 */
export function useSavedFilters<K extends string>(
  storageKey: string,
  defaults: Record<K, string>,
) {
  const params = useSearchParams();
  const keys = Object.keys(defaults) as K[];

  const [values, setValues] = useState<Record<K, string>>(() => {
    const fromUrl = { ...defaults };
    for (const key of keys) {
      const value = params.get(key);
      if (value != null) fromUrl[key] = value;
    }
    return fromUrl;
  });

  // An address with no filters in it falls back to the last search on this
  // device. Done after mount: the server can't see localStorage, and reading
  // it during render would hydrate differently from what it sent.
  const restored = useRef(false);
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    if (keys.some((key) => params.get(key) != null)) return;
    try {
      const saved = JSON.parse(window.localStorage.getItem(storageKey) ?? "null");
      if (!saved || typeof saved !== "object") return;
      const next = { ...defaults };
      for (const key of keys) {
        if (typeof saved[key] === "string") next[key] = saved[key];
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect -- storage only exists after mount
      setValues(next);
    } catch {
      // Private window or blocked storage: start from the defaults.
    }
    // Mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Address and device copy follow every change. replaceState rather than a
  // router push: a filter tweak isn't a page the back button should step through.
  useEffect(() => {
    if (!restored.current) return;
    const url = new URLSearchParams(window.location.search);
    const kept: Partial<Record<K, string>> = {};
    for (const key of keys) {
      if (values[key] === defaults[key]) url.delete(key);
      else {
        url.set(key, values[key]);
        kept[key] = values[key];
      }
    }
    const query = url.toString();
    const next = `${window.location.pathname}${query ? `?${query}` : ""}`;
    if (next !== `${window.location.pathname}${window.location.search}`) {
      window.history.replaceState(window.history.state, "", next);
    }
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(kept));
    } catch {
      // Not remembered on this device; the address still carries it.
    }
    // defaults and keys are fixed for the page's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, storageKey]);

  function set(key: K, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function update(patch: Partial<Record<K, string>>) {
    setValues((current) => ({ ...current, ...patch }));
  }

  return { values, set, update };
}
