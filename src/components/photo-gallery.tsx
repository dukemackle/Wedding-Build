"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * A listing's photos, the way a listings site shows them.
 *
 * Desktop: one large photo with up to four beside it, and a "See all" button.
 * Phone: one photo at a time, swiped sideways, with a count. Either way,
 * tapping a photo opens a full-screen viewer that arrows, swipes and closes
 * with Esc.
 *
 * Shared by venues and vendors -- it only knows about URLs.
 */
export function PhotoGallery({ photos, alt }: { photos: string[]; alt: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const [slide, setSlide] = useState(0);
  const strip = useRef<HTMLDivElement>(null);

  if (photos.length === 0) return null;
  const side = photos.slice(1, 5);
  const onlyOne = photos.length === 1;

  return (
    <>
      {/* Phone: swipeable strip. */}
      <div className="relative -mx-4 sm:hidden">
        <div
          ref={strip}
          onScroll={(e) => {
            const el = e.currentTarget;
            setSlide(Math.round(el.scrollLeft / el.clientWidth));
          }}
          className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {photos.map((url, i) => (
            <button key={url} type="button" onClick={() => setOpen(i)} className="w-full shrink-0 snap-center">
              <Image
                src={url}
                alt={`${alt} photo ${i + 1}`}
                width={750}
                height={500}
                priority={i === 0}
                className="aspect-[3/2] w-full bg-parchment object-cover"
              />
            </button>
          ))}
        </div>
        {photos.length > 1 && (
          <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-ink/70 px-2.5 py-1 font-mono-numbers text-xs text-white">
            {slide + 1} / {photos.length}
          </span>
        )}
      </div>

      {/* Desktop: the big-plus-four grid. */}
      <div
        className={`relative hidden gap-2 overflow-hidden rounded-lg sm:grid ${
          onlyOne ? "grid-cols-1" : side.length > 2 ? "grid-cols-[2fr_1fr_1fr] grid-rows-2" : "grid-cols-[2fr_1fr] grid-rows-2"
        } h-[420px]`}
      >
        <button type="button" onClick={() => setOpen(0)} className={`relative ${onlyOne ? "" : "row-span-2"}`}>
          <Image src={photos[0]} alt={`${alt} photo 1`} fill priority sizes="(min-width: 1024px) 60vw, 100vw" className="bg-parchment object-cover transition-opacity hover:opacity-90" />
        </button>
        {side.map((url, i) => (
          <button
            key={url}
            type="button"
            onClick={() => setOpen(i + 1)}
            className={`relative ${side.length === 1 ? "row-span-2" : side.length === 3 && i === 2 ? "col-span-2" : ""}`}
          >
            <Image src={url} alt={`${alt} photo ${i + 2}`} fill sizes="25vw" className="bg-parchment object-cover transition-opacity hover:opacity-90" />
          </button>
        ))}
        {photos.length > 1 && (
          <button
            type="button"
            onClick={() => setOpen(0)}
            className="absolute bottom-3 right-3 flex items-center gap-2 rounded-md border border-hairline bg-card px-3 py-1.5 text-sm font-medium text-ink shadow-sm hover:border-forest"
          >
            <GridIcon /> See all {photos.length} photos
          </button>
        )}
      </div>

      {open !== null && <Lightbox photos={photos} alt={alt} start={open} onClose={() => setOpen(null)} />}
    </>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
      <rect x="1" y="1" width="6" height="6" rx="1" />
      <rect x="9" y="1" width="6" height="6" rx="1" />
      <rect x="1" y="9" width="6" height="6" rx="1" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </svg>
  );
}

function Lightbox({
  photos,
  alt,
  start,
  onClose,
}: {
  photos: string[];
  alt: string;
  start: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(start);
  const touchX = useRef<number | null>(null);
  const go = useCallback(
    (step: number) => setIndex((i) => (i + step + photos.length) % photos.length),
    [photos.length],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Stop Esc here so it closes the viewer, not the listing behind it.
      if (e.key === "Escape") {
        e.stopImmediatePropagation();
        onClose();
      }
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [go, onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${alt} photos`}
      className="fixed inset-0 z-[70] flex flex-col bg-black"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 text-sm text-white/80">
        <span className="font-mono-numbers">
          {index + 1} / {photos.length}
        </span>
        <button type="button" onClick={onClose} className="rounded-md px-3 py-1.5 text-white hover:bg-white/10" aria-label="Close photos">
          ✕ Close
        </button>
      </div>
      <div className="relative flex-1">
        <Image src={photos[index]} alt={`${alt} photo ${index + 1}`} fill sizes="100vw" className="object-contain" />
        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-ink shadow sm:flex"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-ink shadow sm:flex"
            >
              ›
            </button>
          </>
        )}
      </div>
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto px-4 py-3">
          {photos.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setIndex(i)}
              className={`relative h-14 w-20 shrink-0 overflow-hidden rounded ${i === index ? "ring-2 ring-white" : "opacity-60 hover:opacity-100"}`}
            >
              <Image src={url} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
