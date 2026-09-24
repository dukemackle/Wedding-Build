import Image from "next/image";
import type { WeddingGalleryPhoto } from "@/lib/supabase/types";

/**
 * The couple's own photos.
 *
 * Two arrangements, not one grid that shrinks: on a phone a row you swipe
 * through, one photo nearly filling the screen at a time; from `sm` up a
 * grid with the first photo given double the room, so it reads as a spread
 * rather than a contact sheet.
 */
export function GalleryView({ photos, alt }: { photos: WeddingGalleryPhoto[]; alt: string }) {
  if (photos.length === 0) return null;

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
