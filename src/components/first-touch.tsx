"use client";

import { useEffect } from "react";
import { FIRST_TOUCH_STORAGE_KEY } from "@/lib/attribution";

/**
 * Remembers, once per browser, where the first visit came from: the
 * referring site's name, any utm tags and the landing page. Read back when
 * they sign up or claim a listing (src/lib/attribution.ts). Nothing is sent
 * anywhere until then, and no cookie is set.
 */
export function FirstTouch() {
  useEffect(() => {
    try {
      const host = window.location.hostname;
      if (host.startsWith("admin.") || window.localStorage.getItem(FIRST_TOUCH_STORAGE_KEY)) return;
      const params = new URLSearchParams(window.location.search);
      let referrer = "";
      try {
        const ref = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, "") : "";
        // Our own pages (and the admin) aren't a source.
        if (ref && !ref.endsWith("youdoido.com") && !ref.endsWith("wrenwed.com") && ref !== host) referrer = ref;
      } catch {
        // An unreadable referrer counts as none.
      }
      const touch: Record<string, string> = {
        landing: window.location.pathname.slice(0, 120),
        at: new Date().toISOString().slice(0, 10),
      };
      if (referrer) touch.referrer = referrer;
      for (const key of ["utm_source", "utm_medium", "utm_campaign"]) {
        const v = params.get(key);
        if (v) touch[key] = v.slice(0, 120);
      }
      window.localStorage.setItem(FIRST_TOUCH_STORAGE_KEY, JSON.stringify(touch));
    } catch {
      // Private mode or blocked storage: we just won't know.
    }
  }, []);
  return null;
}
