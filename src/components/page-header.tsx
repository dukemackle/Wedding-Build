import Image from "next/image";
import type { ReactNode } from "react";

/**
 * The top of each planning page (budget, guests, checklist, itinerary,
 * layout, registry): the page's name, a headline with one word in royal
 * blue, a line under it, the page's main actions, and a wedding photo
 * beside them. The photos are the ones the landing page's boxes use, so a
 * page looks like the box that opened it.
 *
 * Two arrangements: on a phone the photo is a short strip above the words;
 * from md up it sits to the right of them at the same height.
 */
export function PageHeader({
  eyebrow,
  title,
  accent,
  photo,
  children,
  actions,
}: {
  eyebrow: string;
  /** The plain start of the headline. */
  title: string;
  /** The end of the headline, set in italic royal blue. */
  accent: string;
  /** A file in public/landing/features, without the extension. */
  photo: string;
  /** The line under the headline. */
  children?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="rise-in mb-6 overflow-hidden rounded-[20px] border border-hairline bg-card shadow-[0_2px_10px_rgb(20_32_61/0.05)] md:grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <div className="relative h-32 overflow-hidden md:order-2 md:h-auto md:min-h-[220px]">
        <Image
          src={`/landing/features/${photo}.webp`}
          alt=""
          fill
          priority
          sizes="(min-width: 768px) 50vw, 100vw"
          className="page-photo-drift object-cover"
        />
      </div>
      <div className="flex flex-col justify-center gap-2 px-5 py-5 md:px-10 md:py-8">
        <p className="flex items-center gap-2 font-mono-numbers text-xs font-medium uppercase tracking-[0.2em] text-[#9a6b00]">
          <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden="true">
            <path d="M7 1 13 7 7 13 1 7z" fill="#ffd301" stroke="#9a6b00" strokeWidth="1" />
          </svg>
          {eyebrow}
        </p>
        <h1 className="font-display text-4xl font-bold leading-none text-forest md:text-5xl">
          {title} <em className="font-semibold text-[#2243B6]">{accent}</em>
        </h1>
        {children ? (
          <div className="text-[15px] font-medium text-ink/85 md:text-base">{children}</div>
        ) : null}
        {actions ? <div className="mt-3 flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
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
