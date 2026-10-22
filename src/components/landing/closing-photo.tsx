"use client";

import { useSyncExternalStore } from "react";

/** Free under the Unsplash licence; none of these are in the hero rotation. */
const PHOTOS = [
  { file: "toast", by: "Al Elmes", position: "object-[center_40%]" },
  { file: "waterfront", by: "Fotógrafo Samuel Cruz", position: "object-[center_45%]" },
  { file: "sparklers", by: "Christian Bowen", position: "object-[center_40%]" },
] as const;

// Picked once per page load, so a refresh shows a different one.
const pick = Math.floor(Math.random() * PHOTOS.length);
const noop = () => () => {};

/**
 * The closing band's photo: a different one on each visit instead of a
 * second animation. The server renders none (the band is navy until it
 * arrives), so there's no hydration mismatch; it's far below the fold and
 * lazy-loaded, so nobody sees the swap. Approved 2026-10-22.
 */
export function ClosingPhoto() {
  const i = useSyncExternalStore(noop, () => pick, () => null);
  if (i === null) return null;
  const p = PHOTOS[i];
  return (
    <>
      <img
        src={`/landing/closing-${p.file}-2000.webp`}
        srcSet={`/landing/closing-${p.file}-1000.webp 1000w, /landing/closing-${p.file}-2000.webp 2000w`}
        sizes="100vw"
        alt=""
        loading="lazy"
        className={`absolute inset-0 h-full w-full object-cover ${p.position}`}
      />
      <p className="absolute bottom-2 right-3 z-10 text-[11px] text-white/70">Photo: {p.by}, Unsplash</p>
    </>
  );
}
