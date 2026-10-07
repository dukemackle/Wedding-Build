import Image from "next/image";
import { artById, type SiteDesign } from "@/lib/site-design";

/**
 * The couple's botanical artwork around the top of the page (Style tab ›
 * Artwork). Public-domain illustrations, cut out of their paper.
 *
 * Watercolours keep their own colours. Line engravings are kept as a shape
 * only and filled with the accent, so one drawing suits every palette.
 *
 * "Sides" flanks the names, one sprig mirrored, as on a printed invitation.
 * "Corners" tucks a sprig into the top-left and bottom-right of the hero.
 * On a phone both shrink and lean in from the edges so the names keep the
 * middle of a narrow screen.
 */
export function SiteArt({ art }: { art: SiteDesign["art"] }) {
  const piece = artById(art.id);
  if (!piece) return null;

  const one = (mirror: boolean, className: string) => (
    <div
      aria-hidden="true"
      className={`site-art pointer-events-none absolute ${className}`}
      style={{ aspectRatio: `${piece.w} / ${piece.h}`, transform: mirror ? "scaleX(-1)" : undefined }}
    >
      {piece.kind === "line" ? (
        <div
          className="h-full w-full"
          style={{
            background: "var(--site-accent)",
            WebkitMaskImage: `url(${piece.src})`,
            maskImage: `url(${piece.src})`,
            WebkitMaskSize: "contain",
            maskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "top",
            maskPosition: "top",
          }}
        />
      ) : (
        <Image src={piece.src} alt="" fill sizes="(min-width: 1024px) 320px, 140px" className="object-contain object-top" />
      )}
    </div>
  );

  if (art.placement === "corners") {
    return (
      <>
        {one(false, "-left-6 -top-4 h-[150px] max-w-[40%] -rotate-[28deg] sm:h-[220px] lg:left-2 lg:h-[300px] lg:max-w-[26%]")}
        {one(true, "-bottom-4 -right-6 h-[150px] max-w-[40%] rotate-[152deg] sm:h-[220px] lg:right-2 lg:h-[300px] lg:max-w-[26%]")}
      </>
    );
  }

  // Sides: level with the names on a computer; from the top corners on a phone.
  return (
    <>
      {one(false, "-left-10 top-2 h-[170px] max-w-[36%] -rotate-12 sm:-left-4 sm:h-[240px] lg:left-[5%] lg:top-1/2 lg:h-[72%] lg:max-w-[22%] lg:-translate-y-1/2 lg:rotate-0")}
      {one(true, "-right-10 top-2 h-[170px] max-w-[36%] rotate-12 sm:-right-4 sm:h-[240px] lg:right-[5%] lg:top-1/2 lg:h-[72%] lg:max-w-[22%] lg:-translate-y-1/2 lg:rotate-0")}
    </>
  );
}
