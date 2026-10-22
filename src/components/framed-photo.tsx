"use client";

import { isLibraryPhoto } from "@/lib/photo-credit";
import Image from "next/image";
import type { CSSProperties } from "react";
import type { PhotoFrameId } from "@/lib/site-canvas";
import { useSiteDesign } from "./guest-site-theme";

/**
 * A photo on the guest site in the frame the couple picked for their photos
 * (design.photoFrame), the same frames a placed photo can have. `fallback` is
 * what a section shows when they haven't picked one: the gallery's rounded
 * corners, the wedding party's circles.
 *
 * `aspect` is the photo's own shape ("4 / 5"); a circle is always square.
 */
export function FramedPhoto({
  src,
  alt,
  initial,
  sizes,
  aspect,
  fallback = "rounded",
  className = "",
  priority,
  circleMax,
}: {
  /** No photo: `initial` sits in the frame instead. */
  src: string | null;
  alt: string;
  initial?: string;
  sizes: string;
  aspect: string;
  fallback?: PhotoFrameId;
  className?: string;
  priority?: boolean;
  /** How wide a circle may grow, for a photo that otherwise fills a wide section. */
  circleMax?: string;
}) {
  const frame = useSiteDesign().photoFrame ?? fallback;
  const { outer, radius } = FRAME_STYLE[frame];
  return (
    <div
      className={className}
      style={frame === "circle" && circleMax ? { ...outer, maxWidth: circleMax, marginInline: "auto" } : outer}
    >
      <div
        className="relative w-full overflow-hidden bg-[var(--site-photo)]"
        style={{ borderRadius: radius, aspectRatio: frame === "circle" ? "1 / 1" : aspect }}
      >
        {src ? (
          <Image src={src} unoptimized={isLibraryPhoto(src)} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
        ) : (
          <span className="absolute inset-0 grid place-items-center font-display text-4xl text-forest" aria-hidden="true">
            {initial}
          </span>
        )}
      </div>
    </div>
  );
}

const FRAME_STYLE: Record<PhotoFrameId, { outer?: CSSProperties; radius?: string }> = {
  none: {},
  rounded: { radius: "0.5rem" },
  circle: { radius: "50%" },
  arch: { radius: "9999px 9999px 0 0" },
  polaroid: { outer: { padding: "4% 4% 14%", background: "#ffffff", boxShadow: "0 6px 18px rgb(0 0 0 / 0.16)" } },
  border: { outer: { padding: "3%", border: "1.5px solid var(--site-accent)" } },
};
