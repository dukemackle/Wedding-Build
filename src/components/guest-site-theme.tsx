"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import {
  THEMES,
  designCssVars,
  fontsHref,
  parseSiteDesign,
  themeById,
  type SiteDesign,
} from "@/lib/site-design";

/** What the editor sends into its preview frame whenever the draft changes. */
export const DESIGN_MESSAGE = "wren:site-design";
/** What the preview frame sends up once it can receive a design. */
export const READY_MESSAGE = "wren:preview-ready";

/**
 * Wraps the guest site in a couple's theme.
 *
 * On the live site it just sets the colours and fonts. As the editor's preview
 * (`preview`) it also takes new designs from the editor by postMessage, so a
 * theme click restyles the page instantly instead of reloading it, and it
 * stops links and forms from working -- an RSVP sent from the preview would be
 * a real one.
 */
export function GuestSiteTheme({
  design: initial,
  preview = false,
  children,
}: {
  design: SiteDesign;
  preview?: boolean;
  children: ReactNode;
}) {
  const [design, setDesign] = useState(initial);

  useEffect(() => {
    if (!preview) return;
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === DESIGN_MESSAGE) setDesign(parseSiteDesign(event.data.design));
    }
    function block(event: Event) {
      const target = event.target as Element | null;
      if (event.type === "submit") {
        event.preventDefault();
        return;
      }
      const link = target?.closest?.("a[href]");
      if (link && !link.getAttribute("href")?.startsWith("#")) event.preventDefault();
    }
    window.addEventListener("message", onMessage);
    document.addEventListener("click", block, true);
    document.addEventListener("submit", block, true);
    window.parent?.postMessage({ type: READY_MESSAGE }, window.location.origin);
    return () => {
      window.removeEventListener("message", onMessage);
      document.removeEventListener("click", block, true);
      document.removeEventListener("submit", block, true);
    };
  }, [preview]);

  return (
    <>
      {/* React hoists this into <head>. The preview loads every theme's fonts
          up front so switching theme doesn't flash a fallback face. */}
      <link
        rel="stylesheet"
        href={fontsHref(preview ? THEMES : [themeById(design.theme)])}
        precedence="default"
      />
      <div
        className="guest-site flex flex-1 flex-col bg-parchment font-body text-ink"
        style={designCssVars(design) as CSSProperties}
      >
        {children}
        <footer className="mt-auto flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-6 py-6 text-xs text-ink/50">
          <Link href="/" className="hover:text-ink">
            Made with Wren
          </Link>
          <Link href="/terms" className="hover:text-ink">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-ink">
            Privacy
          </Link>
        </footer>
      </div>
    </>
  );
}
