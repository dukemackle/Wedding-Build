import Image from "next/image";
import Link from "next/link";
import { formatPrice, separatePriceCents, type MarketSetWithItems } from "@/lib/marketplace";
import type { MarketListing } from "@/lib/supabase/types";

/**
 * A set's cover: its first item's photo large, the next two stacked beside
 * it, so a glance shows it's several things. Two items split it in half.
 */
export function SetCollage({ items, sizes = "(min-width: 1024px) 380px, 75vw", className = "" }: { items: MarketListing[]; sizes?: string; className?: string }) {
  const photos = items.map((l) => l.photo_urls[0]).filter(Boolean).slice(0, 3);
  const cell = "relative overflow-hidden bg-parchment";
  return (
    <div
      className={`grid aspect-[4/3] gap-1 overflow-hidden rounded-2xl border border-hairline bg-hairline ${
        photos.length >= 3 ? "grid-cols-[2fr_1fr] grid-rows-2" : "grid-cols-2"
      } ${className}`}
    >
      {photos.map((src, i) => (
        <div key={src} className={`${cell} ${photos.length >= 3 && i === 0 ? "row-span-2" : ""}`}>
          <Image src={src} alt="" fill sizes={sizes} className="object-cover" />
        </div>
      ))}
      {photos.length < 2 && <div className={cell} />}
    </div>
  );
}

/** "Arch, 24 vases, 12 lanterns and 3 signs" from the items' titles. */
export function setSummary(items: MarketListing[], max = 4) {
  const names = items.slice(0, max).map((l) => l.title);
  const more = items.length - names.length;
  if (more > 0) return `${names.join(", ")} and ${more} more`;
  return names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}` : (names[0] ?? "");
}

/** The set's price, the separate prices struck through, and the saving. */
export function SetPrice({ set, className = "" }: { set: MarketSetWithItems; className?: string }) {
  const separate = separatePriceCents(set.items);
  const saving = separate - set.price_cents;
  return (
    <p className={`flex flex-wrap items-baseline gap-x-2 ${className}`}>
      <span className="font-semibold text-ink">{formatPrice(set.price_cents, set.listing_type)}</span>
      {saving > 0 && (
        <>
          <s className="text-ink/40">{formatPrice(separate)}</s>
          <span className="font-medium text-[#2243B6]">Save {formatPrice(saving)}</span>
        </>
      )}
    </p>
  );
}

/** One set, on the marketplace's front page. */
export function SetCard({ set }: { set: MarketSetWithItems }) {
  return (
    <Link href={`/marketplace/sets/${set.id}`} className="group block">
      <SetCollage items={set.items} className="transition-shadow group-hover:shadow-md" />
      <p className="mt-2.5 font-display text-xl font-semibold leading-snug text-forest group-hover:underline">{set.title}</p>
      <p className="truncate text-sm text-ink/60">
        {set.items.length} pieces · {setSummary(set.items, 3)}
      </p>
      <SetPrice set={set} className="mt-0.5 text-sm" />
    </Link>
  );
}
