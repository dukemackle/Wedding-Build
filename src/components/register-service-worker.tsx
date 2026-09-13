"use client";

import { useEffect } from "react";

// Production-only: registering a service worker during `next dev` tends
// to serve stale local-dev code and cause confusing "why isn't my
// change showing up" bugs, so it's skipped entirely outside prod builds.
export function RegisterServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Registration failing (unsupported browser, blocked, etc.)
      // shouldn't affect the page working normally without it.
    });
  }, []);

  return null;
}
