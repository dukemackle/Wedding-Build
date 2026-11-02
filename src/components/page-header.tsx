import Image from "next/image";
import type { ReactNode } from "react";

/**
 * The top of each planning page (budget, guests, checklist, itinerary,
 * layout, registry): the page's name as the headline, a line in italic
 * royal blue under it, a sentence on what the page does, the page's main
 * actions, and a wedding photo. The photos are the ones the landing page's
 * boxes use, so a page looks like the box that opened it. Kept short so the
 * page's own content starts high.
 *
 * Two arrangements: on a phone the photo is a small square beside the
 * words; from md up it is a slim panel on the right and the actions sit on
 * the headline's row.
 *
 * A page whose tools belong up top (the venue layout) passes them as
 * `toolbar`: a full-width second row in the same card, under the words
 * and the photo, so the page has one header rather than a header followed
 * by a second titled card.
 */
export function PageHeader({
  eyebrow,
  title,
  accent,
  photo,
  children,
  actions,
  toolbar,
}: {
  /** The page's name, shown as the headline. */
  eyebrow: string;
  /** The plain start of the line under the headline. */
  title: string;
  /** The end of that line. */
  accent: string;
  /** A file in public/landing/features, without the extension. */
  photo: string;
  /** The sentence under the line. */
  children?: ReactNode;
  actions?: ReactNode;
  /** A row of tools under the headline, inside the same card. */
  toolbar?: ReactNode;
}) {
  return (
    <header className="rise-in mb-6 flex flex-wrap overflow-hidden rounded-[20px] border border-hairline bg-card shadow-[0_2px_10px_rgb(20_32_61/0.05)] md:grid md:grid-cols-[minmax(0,1fr)_300px]">
      <div className="relative w-24 shrink-0 overflow-hidden md:order-2 md:w-auto md:min-h-[120px]">
        <Image
          src={`/landing/features/${photo}.webp`}
          alt=""
          fill
          priority
          sizes="(min-width: 768px) 300px, 240px"
          className="page-photo-drift object-cover"
        />
      </div>
      <div className="min-w-0 flex-1 px-4 py-4 md:flex md:items-center md:gap-6 md:px-8 md:py-5">
        <div className="min-w-0 md:flex-1">
          <h1 className="font-display text-[34px] font-bold leading-none text-forest md:text-[44px]">
            {eyebrow}
          </h1>
          <p className="mt-1 font-display text-lg font-semibold italic leading-snug text-[#2243B6] md:text-[22px]">
            {title} {accent}
          </p>
          {children ? (
            <div className="mt-1 text-sm font-medium text-ink/85">{children}</div>
          ) : null}
        </div>
        {actions ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 md:mt-0 md:shrink-0 md:justify-end">
            {actions}
          </div>
        ) : null}
      </div>
      {toolbar ? (
        <div className="basis-full border-t border-hairline px-4 py-3 md:order-3 md:col-span-2 md:px-8 md:py-4">
          {toolbar}
        </div>
      ) : null}
    </header>
  );
}

/** The "+" that leads a primary "Add …" button. */
export function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
