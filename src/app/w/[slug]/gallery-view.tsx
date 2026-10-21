"use client";

import { isLibraryPhoto } from "@/lib/photo-credit";
import Image from "next/image";
import type { WeddingGalleryPhoto } from "@/lib/supabase/types";
import { useSiteDesign } from "@/components/guest-site-theme";
import { defaultPhotosLayout } from "@/lib/site-design";
import { FramedPhoto } from "@/components/framed-photo";

/** Each photo's alt text: "Maya & Jordan, photo 3 of 9", so a screen reader can tell them apart. */
type Props = { photos: WeddingGalleryPhoto[]; alt: (i: number) => string };

/**
 * The couple's own photos, in the layout they picked (SECTION_LAYOUTS.photos);
 * left unpicked, the page style's own (defaultPhotosLayout), except that a
 * picked photo frame always gets the spread, which wears it.
 * Each layout has its own phone arrangement, not a shrunk one.
 */
export function GalleryView({ photos, alt: names }: { photos: WeddingGalleryPhoto[]; alt: string }) {
  const alt = (i: number) => (photos.length > 1 ? `${names}, photo ${i + 1} of ${photos.length}` : names);
  const { pageStyle, layouts, photoFrame } = useSiteDesign();
  if (photos.length === 0) return null;
  const auto = defaultPhotosLayout(pageStyle);
  const layout = layouts.photos ?? (auto === "scrapbook" && photoFrame ? "spread" : auto);
  if (layout === "scrapbook") return <Scrapbook photos={photos} alt={alt} />;
  if (layout === "masonry") return <Masonry photos={photos} alt={alt} />;
  if (layout === "filmstrip") return <Filmstrip photos={photos} alt={alt} />;
  if (layout === "line") return <WashingLine photos={photos} alt={alt} />;
  return <Spread photos={photos} alt={alt} />;
}

/**
 * Two arrangements, not one grid that shrinks: on a phone a row you swipe
 * through, one photo nearly filling the screen at a time; from `sm` up a
 * grid with the first photo given double the room, so it reads as a spread
 * rather than a contact sheet.
 */
function Spread({ photos, alt }: Props) {
  const { photoFrame } = useSiteDesign();
  // A frame with padding or a curved edge needs a little air between photos.
  const roomy = photoFrame === "polaroid" || photoFrame === "border" || photoFrame === "circle";
  return (
    <>
      {/* Phone: swipe row. Negative margin lets photos run to the card edge. */}
      <div className={`-mx-6 flex snap-x snap-mandatory overflow-x-auto px-6 pb-4 pt-1 sm:hidden ${roomy ? "gap-4" : "gap-3"}`}>
        {photos.map((photo, i) => (
          <FramedPhoto
            key={photo.id}
            src={photo.photo_url}
            alt={alt(i)}
            sizes="80vw"
            aspect="4 / 5"
            priority={i === 0}
            className="w-[80%] shrink-0 snap-center"
          />
        ))}
      </div>

      {/* Tablet and up: a spread. */}
      {/* One photo stands alone, two side by side; three or more make the spread. */}
      <div
        className={`hidden items-start sm:grid ${
          photos.length === 1 ? "mx-auto max-w-2xl grid-cols-1" : photos.length === 2 ? "grid-cols-2" : "grid-cols-3"
        } ${roomy ? "gap-5" : "gap-3"}`}
      >
        {photos.map((photo, i) => {
          const lead = i === 0 && photos.length >= 3;
          return (
            <FramedPhoto
              key={photo.id}
              src={photo.photo_url}
              alt={alt(i)}
              sizes={lead ? "(min-width: 1024px) 40vw, 60vw" : "(min-width: 1024px) 20vw, 30vw"}
              aspect={photoFrame === "arch" ? "4 / 5" : "1 / 1"}
              className={lead ? "col-span-2 row-span-2" : ""}
            />
          );
        })}
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
function Scrapbook({ photos, alt }: Props) {
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
            unoptimized={isLibraryPhoto(photo.photo_url)}
            alt={alt(i)}
            width={i === 0 ? 700 : 480}
            height={i === 0 ? 700 : 480}
            className="aspect-square w-full object-cover"
          />
        </figure>
      ))}
    </div>
  );
}

/**
 * Every photo at its own shape, in columns: two on a phone, three on a
 * computer. Sizes are a guess until each loads, then the photo's own.
 */
function Masonry({ photos, alt }: Props) {
  return (
    <div className="columns-2 gap-2 sm:columns-3 sm:gap-3">
      {photos.map((photo, i) => (
        <Image
          key={photo.id}
          src={photo.photo_url}
          unoptimized={isLibraryPhoto(photo.photo_url)}
          alt={alt(i)}
          width={600}
          height={750}
          sizes="(min-width: 640px) 33vw, 50vw"
          className="mb-2 h-auto w-full break-inside-avoid rounded-lg sm:mb-3"
        />
      ))}
    </div>
  );
}

// Sprocket holes along both edges of the film.
const SPROCKETS =
  "repeating-linear-gradient(90deg, rgb(244 241 234 / 0.85) 0 8px, transparent 8px 20px)";

/**
 * A strip of film to scroll along, frames snapping into place: one frame
 * nearly filling a phone, a run of larger frames across a computer.
 */
function Filmstrip({ photos, alt }: Props) {
  return (
    <div
      className="-mx-6 overflow-x-auto bg-[#1d1b18] py-5 sm:mx-0 sm:rounded-sm sm:py-7"
      style={{
        backgroundImage: `${SPROCKETS}, ${SPROCKETS}`,
        backgroundSize: "auto 6px, auto 6px",
        backgroundPosition: "0 7px, 0 calc(100% - 7px)",
        backgroundRepeat: "repeat-x",
        backgroundAttachment: "local",
      }}
    >
      <div className="flex w-max snap-x snap-mandatory gap-2 px-6 sm:gap-3 sm:px-4">
        {photos.map((photo, i) => (
          <Image
            key={photo.id}
            src={photo.photo_url}
            unoptimized={isLibraryPhoto(photo.photo_url)}
            alt={alt(i)}
            width={640}
            height={480}
            className="aspect-[4/3] w-[78vw] max-w-[360px] shrink-0 snap-center object-cover sm:w-[320px] sm:max-w-none lg:w-[380px]"
          />
        ))}
      </div>
    </div>
  );
}

const SWAY = ["-rotate-[4deg]", "rotate-[3deg]", "-rotate-[2deg]", "rotate-[5deg]"];

/**
 * Polaroids pegged along a string that sags between its ends: two to a
 * string on a phone, four on a computer, each hanging where the string is.
 */
function WashingLine({ photos, alt }: Props) {
  const rows = (per: number) =>
    Array.from({ length: Math.ceil(photos.length / per) }, (_, r) => photos.slice(r * per, r * per + per));
  const line = (row: WeddingGalleryPhoto[], per: number, offset: number) => (
    <div key={row[0].id} className="relative pt-2">
      <svg className="absolute inset-x-0 top-0 h-12 w-full" viewBox="0 0 100 48" preserveAspectRatio="none" aria-hidden="true">
        <path
          d="M0 4 Q50 52 100 4"
          fill="none"
          stroke="var(--color-ink)"
          strokeOpacity={0.45}
          strokeWidth={1.2}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {/* A short last row hangs in the middle of its string, not off one end. */}
      <div className="relative flex justify-center">
        {row.map((photo, i) => {
          // Where the string is under this photo: a parabola, 4 at the ends, 28 mid-way.
          const t = ((per - row.length) / 2 + i + 0.5) / per;
          const sag = 4 + 96 * t * (1 - t) - 2;
          return (
            <figure
              key={photo.id}
              style={{ marginTop: sag, width: `${86 / per}%`, marginInline: `${7 / per}%` }}
              className={`relative origin-top bg-white p-1.5 pb-7 shadow-[0_6px_16px_rgba(40,40,30,0.18)] sm:p-2 sm:pb-9 ${SWAY[(offset + i) % SWAY.length]}`}
            >
              <span
                className="absolute -top-2.5 left-1/2 h-5 w-2 -translate-x-1/2 rounded-[2px] bg-[#c8a77a] shadow-sm"
                aria-hidden="true"
              />
              <Image src={photo.photo_url} unoptimized={isLibraryPhoto(photo.photo_url)} alt={alt(offset + i)} width={480} height={480} className="aspect-square w-full object-cover" />
            </figure>
          );
        })}
      </div>
    </div>
  );
  return (
    <>
      <div className="flex flex-col gap-6 sm:hidden">{rows(2).map((row, r) => line(row, 2, r * 2))}</div>
      <div className="hidden flex-col gap-10 sm:flex">{rows(4).map((row, r) => line(row, 4, r * 4))}</div>
    </>
  );
}
