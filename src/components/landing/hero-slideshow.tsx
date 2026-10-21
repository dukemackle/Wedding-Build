"use client";

import { useEffect, useState } from "react";

/** Free under the Unsplash licence; credited on the photo anyway. */
const SLIDES = [
  { file: "roses-blue", alt: "A wedding table set with white roses and pale blue flowers", by: "Sheila C", position: "object-center" },
  { file: "long-table", alt: "A long wedding table lined with white flowers", by: "Jonathan Borba", position: "object-center" },
  { file: "yellow-blue", alt: "A wedding table with yellow and blue flowers and glassware", by: "Bruno Ngarukiye", position: "object-center" },
  { file: "lawn-lights", alt: "A long wedding table on a lawn under string lights", by: "Josh Withers", position: "object-[center_60%]" },
  { file: "couple", alt: "A bride and groom dancing in a field at sunset", by: "Jacob Diehl", position: "object-[62%_center] sm:object-[center_40%]" },
] as const;

/** How long each photo stays before fading into the next. */
const HOLD_MS = 6500;

/**
 * The landing hero's photos: a slow crossfade with a slight drift in, so the
 * page feels alive without reading like an ad. The first photo is in the
 * server HTML (it's the page's largest paint); the rest mount once it has
 * loaded. With reduced motion the first photo just stays.
 * Approved 2026-10-21.
 */
export function HeroSlideshow() {
  const [active, setActive] = useState(0);
  const [rest, setRest] = useState(false);

  // The others start loading once the first has painted, so they never
  // compete with it.
  function onFirstLoad() {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) setRest(true);
  }

  useEffect(() => {
    if (!rest) return;
    const id = window.setInterval(() => setActive((i) => (i + 1) % SLIDES.length), HOLD_MS);
    return () => window.clearInterval(id);
  }, [rest]);

  return (
    <>
      {SLIDES.map((s, i) =>
        i === 0 || rest ? (
          <img
            key={s.file}
            src={`/landing/hero-${s.file}-2000.webp`}
            srcSet={`/landing/hero-${s.file}-1000.webp 1000w, /landing/hero-${s.file}-2000.webp 2000w`}
            sizes="(max-width: 640px) 1100px, 100vw"
            alt={i === active ? s.alt : ""}
            aria-hidden={i === active ? undefined : true}
            fetchPriority={i === 0 ? "high" : "low"}
            onLoad={i === 0 ? onFirstLoad : undefined}
            // Already loaded before React hydrated: onLoad won't fire.
            ref={i === 0 ? (el) => void (el?.complete && el.naturalWidth > 0 && onFirstLoad()) : undefined}
            className={`hero-slide absolute inset-0 h-full w-full object-cover ${s.position} ${
              i === active ? "hero-slide-on" : ""
            }`}
          />
        ) : null,
      )}
      <p className="absolute bottom-2 right-3 z-10 text-[11px] text-white/70">Photo: {SLIDES[active].by}, Unsplash</p>
    </>
  );
}
