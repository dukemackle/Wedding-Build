"use client";

import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { focusPosition, type PhotoFocus } from "@/lib/dashboard-photos";

const SECONDS_PER_PHOTO = 8;

const noSubscribe = () => () => {};

/**
 * The couple's photos behind the whole dashboard, one at a time, each fading
 * into the next with a slow drift.
 *
 * Portalled to <body>: the page fades in through a transform, and a fixed
 * element inside a transformed parent is fixed to that parent, not the screen.
 * Sits behind the page at the same z-index as the yellow glow on <html>, and
 * later in the document, so it covers the glow. Under
 * reduced motion the photos still change, just without the fade or drift.
 */
export function PhotoBackdrop({ photos, focus }: { photos: string[]; focus?: PhotoFocus }) {
  // False during server render, true on the client: there's no <body> to
  // portal into until then.
  const mounted = useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false,
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (photos.length < 2) return;
    const timer = setInterval(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % photos.length);
    }, SECONDS_PER_PHOTO * 1000);
    return () => clearInterval(timer);
  }, [photos.length]);

  if (!mounted || photos.length === 0) return null;
  const shown = index % photos.length;

  return createPortal(
    <div aria-hidden="true" className="dashboard-backdrop pointer-events-none fixed inset-0 z-[-1] overflow-hidden bg-forest">
      {photos.map((src, i) => (
        <div
          key={src}
          className={`absolute inset-0 motion-safe:transition-opacity motion-safe:duration-[1500ms] ${
            i === shown ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={src}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className="hero-kenburns object-cover"
            // Crop around the couple's chosen spot, and zoom in towards it.
            style={{ objectPosition: focusPosition(focus, src), transformOrigin: focusPosition(focus, src) }}
          />
        </div>
      ))}
      {/* Navy wash, deepening down the page: light enough at the top that the
          photo reads, dark enough lower down that the gaps between cards
          don't fight them. */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#14203d]/25 via-[#14203d]/40 to-[#14203d]/60" />
    </div>,
    document.body,
  );
}
