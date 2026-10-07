"use client";

import Image from "next/image";
import type { WeddingGalleryPhoto } from "@/lib/supabase/types";
import { useSiteDesign } from "@/components/guest-site-theme";

/**
 * The couple's own photos.
 *
 * Two arrangements, not one grid that shrinks: on a phone a row you swipe
 * through, one photo nearly filling the screen at a time; from `sm` up a
 * grid with the first photo given double the room, so it reads as a spread
 * rather than a contact sheet.
 */
export function GalleryView({ photos, alt }: { photos: WeddingGalleryPhoto[]; alt: string }) {
  const { pageStyle } = useSiteDesign();
  if (photos.length === 0) return null;
  if (pageStyle === "storybook") return <Scrapbook photos={photos} alt={alt} />;

  return (
    <>
      {/* Phone: swipe row. Negative margin lets photos run to the card edge. */}
      <div className="-mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-2 sm:hidden">
        {photos.map((photo) => (
          <Image
            key={photo.id}
            src={photo.photo_url}
            alt={alt}
            width={600}
            height={750}
            className="aspect-[4/5] w-[80%] shrink-0 snap-center rounded-lg object-cover"
          />
        ))}
      </div>

      {/* Tablet and up: a spread. */}
      <div className="hidden grid-cols-3 gap-3 sm:grid">
        {photos.map((photo, i) => (
          <Image
            key={photo.id}
            src={photo.photo_url}
            alt={alt}
            width={i === 0 ? 900 : 450}
            height={i === 0 ? 900 : 450}
            className={`aspect-square w-full rounded-lg object-cover ${
              i === 0 && photos.length >= 3 ? "col-span-2 row-span-2 h-full" : ""
            }`}
          />
        ))}
      </div>
    </>
  );
}

// Each print leans its own way, the same way every visit.
const TILTS = ["-rotate-[5deg]", "rotate-[3deg]", "-rotate-[2deg]", "rotate-[4deg]", "-rotate-[3deg]", "rotate-[2deg]"];

/**
 * The storybook photos: prints scattered on the table, each in a white
 * border with a strip of tape on some. Two to a row on a phone, a loose
 * wrap of larger prints on a computer; the first is the biggest.
 */
function Scrapbook({ photos, alt }: { photos: WeddingGalleryPhoto[]; alt: string }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-6 py-4 sm:flex sm:flex-wrap sm:items-start sm:justify-center sm:gap-x-8 sm:gap-y-10">
      {photos.map((photo, i) => (
        <figure
          key={photo.id}
          className={`relative bg-white p-2 pb-8 shadow-[0_6px_18px_rgba(40,40,30,0.18)] sm:p-3 sm:pb-12 ${TILTS[i % TILTS.length]} ${
            i === 0 ? "col-span-2 mx-auto w-4/5 sm:w-[340px]" : "sm:w-[240px]"
          }`}
        >
          {i % 3 === 1 && (
            <span
              className="absolute -top-2.5 left-1/2 h-5 w-20 -translate-x-1/2 -rotate-3 bg-[rgba(232,220,190,0.85)]"
              aria-hidden="true"
            />
          )}
          <Image
            src={photo.photo_url}
            alt={alt}
            width={i === 0 ? 700 : 480}
            height={i === 0 ? 700 : 480}
            className="aspect-square w-full object-cover"
          />
        </figure>
      ))}
    </div>
  );
}
