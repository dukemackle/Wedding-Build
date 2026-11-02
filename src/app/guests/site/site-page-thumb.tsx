"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DESIGN_MESSAGE, READY_MESSAGE } from "@/components/guest-site-theme";
import { MOTION_PRESETS, resolveDesign, type SiteDesign } from "@/lib/site-design";

const PHONE = { w: 390, h: 844 };
const COMPUTER = { w: 1280, h: 800 };

/**
 * A design as a thumbnail: the real guest site (the preview page, sent the
 * design by postMessage) laid out at phone or computer width and scaled down
 * to fill its parent, so a card looks exactly like the page it opens
 * (owner, 2026-10-27: the drawn thumbnails didn't match). Upright cards get
 * the phone layout and wide ones the computer layout, so the card shows a
 * whole first screen rather than a close-up of the photo (owner, 2026-10-27:
 * phone pages in wide cards were too zoomed in).
 *
 * Each one is a page load, so a frame only starts once its card is near the
 * screen, and the page shows still (no opening motion) since nobody scrolls
 * a thumbnail. Until the look has arrived, the card is the page's colour.
 */
export function SitePageThumb({ design }: { design: SiteDesign }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [near, setNear] = useState(false);
  const [shown, setShown] = useState(false);
  const still = useMemo(() => ({ ...design, motion: { ...MOTION_PRESETS.none } }), [design]);
  const stillRef = useRef(still);

  useEffect(() => {
    stillRef.current = still;
    frameRef.current?.contentWindow?.postMessage({ type: DESIGN_MESSAGE, design: still }, window.location.origin);
  }, [still]);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const sizes = new ResizeObserver(([entry]) => setBox({ w: entry.contentRect.width, h: entry.contentRect.height }));
    const seen = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          seen.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    sizes.observe(el);
    seen.observe(el);
    return () => {
      sizes.disconnect();
      seen.disconnect();
    };
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.source !== frameRef.current?.contentWindow) return;
      if (event.data?.type !== READY_MESSAGE) return;
      frameRef.current?.contentWindow?.postMessage({ type: DESIGN_MESSAGE, design: stillRef.current }, window.location.origin);
      // A moment for the new look to paint before the frame shows.
      timer = setTimeout(() => setShown(true), 250);
    }
    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
      clearTimeout(timer);
    };
  }, []);

  // Laid out in a real screen's height at least, so the top of the page is
  // as tall as on a phone or laptop; the card shows what fits.
  const screen = box.h > box.w ? PHONE : COMPUTER;
  const width = screen.w;
  const scale = box.w / width;
  const bg = resolveDesign(design).theme.bg;

  return (
    <div ref={boxRef} className="absolute inset-0 overflow-hidden" style={{ background: bg }} aria-hidden="true">
      {near && box.w > 0 && (
        <iframe
          ref={frameRef}
          src="/guests/site/preview?look=1"
          title=""
          tabIndex={-1}
          scrolling="no"
          className={`pointer-events-none absolute left-0 top-0 border-0 transition-opacity duration-300 ${shown ? "opacity-100" : "opacity-0"}`}
          style={{ width, height: Math.max(box.h / scale, screen.h), transform: `scale(${scale})`, transformOrigin: "0 0" }}
        />
      )}
    </div>
  );
}
