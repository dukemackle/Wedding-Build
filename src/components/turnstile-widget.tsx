"use client";

import { useEffect, useRef } from "react";

type Turnstile = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
};

declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let scriptLoad: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  scriptLoad ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptLoad = null;
      reject();
    };
    document.head.appendChild(script);
  });
  return scriptLoad;
}

/**
 * Cloudflare's "are you a person" check for a guest-site form. Invisible for
 * almost everyone; a small box appears only when Cloudflare wants a tap. It
 * adds a hidden `cf-turnstile-response` field to the form it sits in, which
 * the server action checks (src/lib/turnstile.ts). A token works once, so
 * forms remount this (a new `key`) after each submit. Renders nothing when
 * Turnstile is off (no site key).
 */
export function TurnstileWidget({ siteKey }: { siteKey?: string | null }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!siteKey) return;
    let widgetId: string | null = null;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !ref.current || !window.turnstile) return;
        widgetId = window.turnstile.render(ref.current, {
          sitekey: siteKey,
          appearance: "interaction-only",
          "refresh-expired": "auto",
        });
      })
      .catch(() => {
        // No widget means no token; the server says "try again" and the
        // rate limits still hold.
      });
    return () => {
      cancelled = true;
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [siteKey]);

  if (!siteKey) return null;
  return <div ref={ref} />;
}
