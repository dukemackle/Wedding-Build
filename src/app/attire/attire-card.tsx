"use client";

import Image from "next/image";
import type { AttireItem } from "@/lib/supabase/types";
import { categoryArt, formatPrice, swatch } from "@/lib/attire";

/**
 * Tints for the placeholder panels, so a grid of items without photos reads
 * as a set of distinct things rather than one tile repeated.
 */
const TINTS = ["#efe9df", "#e9e4dc", "#f1ebe4", "#e6e2d8", "#ede6e0", "#ebe7de", "#f0e8dd"];

function tintFor(id: string) {
  let n = 0;
  for (const ch of id) n = (n + ch.charCodeAt(0)) % TINTS.length;
  return TINTS[n];
}

/**
 * The product photo, or the category's line art on a tinted panel until the
 * item has real photos. Fills whatever box it's put in.
 */
export function AttireImage({
  item,
  index = 0,
  sizes,
  priority,
  className = "",
}: {
  item: AttireItem;
  index?: number;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const src = item.image_urls?.[index];
  if (src) {
    return (
      <Image
        src={src}
        alt={item.name}
        fill
        sizes={sizes}
        priority={priority}
        className={`object-cover ${className}`}
      />
    );
  }
  return (
    <div
      className={`absolute inset-0 bg-[length:58%] bg-[center_55%] bg-no-repeat ${className}`}
      style={{ backgroundColor: tintFor(item.id), backgroundImage: `url(${categoryArt(item.category)})` }}
      role="img"
      aria-label={`${item.category} illustration`}
    />
  );
}

export function HeartButton({
  saved,
  pending,
  onToggle,
  className = "",
}: {
  saved: boolean;
  pending?: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      disabled={pending}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved" : "Save"}
      className={`grid h-9 w-9 place-items-center rounded-full shadow-sm transition-colors disabled:opacity-60 ${
        saved ? "bg-forest text-parchment" : "bg-card/95 text-forest hover:bg-card"
      } ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8}>
        <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

export function PricePills({ item, compact }: { item: AttireItem; compact?: boolean }) {
  const buy = formatPrice(item.buy_price);
  const rent = formatPrice(item.rent_price);
  const fallback = !buy && !rent ? formatPrice(item.price_from) : null;
  const pill = "rounded-full border border-hairline px-2 py-0.5";
  return (
    <div className="flex flex-wrap gap-1.5 font-mono-numbers text-xs text-ink/80">
      {buy && <span className={pill}>Buy {buy}</span>}
      {/* A phone card has room for one price; buy wins, rent shows in the
          quick view. */}
      {rent && <span className={`${pill} ${compact && buy ? "hidden sm:inline" : ""}`}>Rent {rent}</span>}
      {fallback && <span className={pill}>from {fallback}</span>}
    </div>
  );
}

export function ColorDots({ colors, max = 5 }: { colors: string[]; max?: number }) {
  if (!colors?.length) return null;
  return (
    <div className="flex items-center gap-1.5" aria-label={`Colours: ${colors.join(", ")}`}>
      {colors.slice(0, max).map((c) => (
        <span
          key={c}
          title={c}
          className="h-3 w-3 rounded-full border border-ink/15"
          style={{ backgroundColor: swatch(c) }}
        />
      ))}
      {colors.length > max && <span className="text-xs text-ink/50">+{colors.length - max}</span>}
    </div>
  );
}

export function AttireCard({
  item,
  saved,
  pending,
  vendorName,
  onToggleSave,
  onOpen,
  priority,
}: {
  item: AttireItem;
  saved: boolean;
  pending?: boolean;
  vendorName?: string;
  onToggleSave: () => void;
  onOpen: () => void;
  priority?: boolean;
}) {
  const maker = item.designer ?? vendorName;
  const detail = item.silhouette ?? item.style;
  const hasSecond = (item.image_urls?.length ?? 0) > 1;

  return (
    <article className="group min-w-0">
      <div
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen())}
        className="relative block aspect-[3/4] w-full cursor-pointer overflow-hidden rounded-md outline-none focus-visible:ring-2 focus-visible:ring-forest"
      >
        <AttireImage
          item={item}
          priority={priority}
          sizes="(min-width: 1536px) 18vw, (min-width: 1280px) 22vw, (min-width: 768px) 30vw, 48vw"
          className="transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {hasSecond && (
          <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <AttireImage item={item} index={1} sizes="(min-width: 1280px) 22vw, 30vw" />
          </div>
        )}
        {item.badge && (
          <span className="absolute left-2 top-2 rounded bg-card/90 px-2 py-1 font-mono-numbers text-[10px] uppercase tracking-[0.14em] text-ink sm:left-3 sm:top-3">
            {item.badge}
          </span>
        )}
        <HeartButton
          saved={saved}
          pending={pending}
          onToggle={onToggleSave}
          className="absolute right-2 top-2 sm:right-3 sm:top-3"
        />
      </div>
      <button type="button" onClick={onOpen} className="mt-2.5 block w-full text-left">
        <h3 className="truncate font-medium text-ink">{item.name}</h3>
        <p className="truncate text-xs text-ink/55">
          {[maker, detail].filter(Boolean).join(" · ")}
        </p>
      </button>
      <div className="mt-1.5">
        <PricePills item={item} compact />
      </div>
      <div className="mt-2">
        <ColorDots colors={item.colors} />
      </div>
    </article>
  );
}
