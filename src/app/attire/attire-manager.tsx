"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import type { AttireItem, AttireShortlistEntry } from "@/lib/supabase/types";
import { ATTIRE_CATEGORIES, BUY_OR_RENT_OPTIONS, STYLE_TIERS } from "@/lib/wedding-options";
import { toggleAttireShortlist, updateAttireShortlistNotes } from "./actions";
import { SearchBox } from "@/components/search-box";
import { FilterDisclosure } from "@/components/filter-disclosure";

const CATEGORY_IMAGES: Record<string, string> = {
  "Wedding Dress": "/attire-types/wedding-dress.svg",
  "Bridesmaid Dress": "/attire-types/bridesmaid-dress.svg",
  "Groom Attire": "/attire-types/groom-attire.svg",
  "Groomsmen Attire": "/attire-types/groomsmen-attire.svg",
  "Ring - Her": "/attire-types/ring-her.svg",
  "Ring - Him": "/attire-types/ring-him.svg",
};
const DEFAULT_CATEGORY_IMAGE = "/attire-types/ring-him.svg";

function formatPrice(price: number | null) {
  if (price == null) return null;
  return `$${price.toLocaleString()}`;
}

function AttireShortlistButton({
  attireItemId,
  isShortlisted,
}: {
  attireItemId: string;
  isShortlisted: boolean;
}) {
  const [shortlisted, setShortlisted] = useState(isShortlisted);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const formData = new FormData();
    formData.set("attire_item_id", attireItemId);
    formData.set("is_shortlisted", String(shortlisted));

    startTransition(async () => {
      const result = await toggleAttireShortlist(formData);
      if (!result?.error) {
        setShortlisted((v) => !v);
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`rounded-full border px-3 py-1 text-sm transition-colors disabled:opacity-60 ${
        shortlisted
          ? "border-forest bg-forest text-parchment"
          : "border-hairline bg-parchment text-ink hover:border-forest"
      }`}
    >
      {shortlisted ? "✓ Shortlisted" : "+ Shortlist"}
    </button>
  );
}

function AttireCard({ item, isShortlisted }: { item: AttireItem; isShortlisted: boolean }) {
  const image = CATEGORY_IMAGES[item.category] ?? DEFAULT_CATEGORY_IMAGE;
  const price = formatPrice(item.price_from);

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-hairline bg-parchment">
      <Image
        src={image}
        alt={`${item.category} illustration`}
        width={400}
        height={300}
        className="aspect-[4/3] w-full border-b border-hairline object-cover"
      />
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="font-display text-xl font-semibold text-forest">{item.name}</h3>
          {item.price_tier && (
            <span className="shrink-0 rounded-full border border-hairline px-2 py-0.5 text-xs text-brass">
              {item.price_tier}
            </span>
          )}
        </div>
        <p className="text-xs uppercase tracking-wide text-ink/50">
          {[item.category, item.style].filter(Boolean).join(" · ")}
        </p>
        <p className="mt-1 flex items-center gap-2 font-mono-numbers text-sm text-ink/70">
          {item.buy_or_rent && (
            <span className="rounded-full border border-hairline px-2 py-0.5 text-xs text-ink/70">
              {item.buy_or_rent}
            </span>
          )}
          {price && <span>from {price}</span>}
        </p>
        {item.description && <p className="mt-3 text-sm text-ink/80">{item.description}</p>}
        <div className="mt-4">
          <AttireShortlistButton attireItemId={item.id} isShortlisted={isShortlisted} />
        </div>
      </div>
    </div>
  );
}

function ShortlistNotes({
  entry,
  itemName,
}: {
  entry: AttireShortlistEntry;
  itemName: string;
}) {
  const [saved, setSaved] = useState(true);
  const [isPending, startTransition] = useTransition();

  function handleSave(formData: FormData) {
    startTransition(async () => {
      const result = await updateAttireShortlistNotes(formData);
      setSaved(!result?.error);
    });
  }

  return (
    <div className="border-b border-hairline py-4 last:border-b-0">
      <p className="text-ink">{itemName}</p>
      <form action={handleSave} className="mt-2 flex items-start gap-3">
        <input type="hidden" name="attire_item_id" value={entry.attire_item_id} />
        <textarea
          name="notes"
          rows={2}
          placeholder="Notes (size, alterations, who's wearing it)..."
          defaultValue={entry.notes ?? ""}
          onChange={() => setSaved(false)}
          className="flex-1 rounded-md border border-hairline bg-parchment px-3 py-2 text-sm text-ink outline-none focus:border-forest"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md border border-hairline px-3 py-2 text-sm text-ink transition-colors hover:border-forest disabled:opacity-60"
        >
          {isPending ? "Saving..." : saved ? "Saved" : "Save"}
        </button>
      </form>
    </div>
  );
}

export function AttireManager({
  items,
  shortlist,
}: {
  items: AttireItem[];
  shortlist: AttireShortlistEntry[];
}) {
  const [categoryFilter, setCategoryFilter] = useState<string | "all">("all");
  const [tierFilter, setTierFilter] = useState<string | "all">("all");
  const [buyRentFilter, setBuyRentFilter] = useState<string | "all">("all");
  const [search, setSearch] = useState("");

  const shortlistedIds = new Set(shortlist.map((s) => s.attire_item_id));
  const itemById = new Map(items.map((i) => [i.id, i]));

  const activeFilterCount = [categoryFilter, tierFilter, buyRentFilter].filter(
    (f) => f !== "all",
  ).length;

  const filteredItems = items.filter(
    (i) =>
      (categoryFilter === "all" || i.category === categoryFilter) &&
      (tierFilter === "all" || i.price_tier === tierFilter) &&
      (buyRentFilter === "all" || i.buy_or_rent === buyRentFilter) &&
      i.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-8">
      {shortlist.length > 0 && (
        <div className="rounded-lg border border-hairline bg-card p-6 shadow-sm">
          <h2 className="font-display text-2xl font-semibold text-forest">Your shortlist</h2>
          <div className="mt-4">
            {shortlist.map((entry) => {
              const item = itemById.get(entry.attire_item_id);
              if (!item) return null;
              return <ShortlistNotes key={entry.id} entry={entry} itemName={item.name} />;
            })}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-hairline bg-card p-6 shadow-sm">
        <div className="mb-4">
          <SearchBox value={search} onChange={setSearch} placeholder="Search attire by name..." />
        </div>
        <FilterDisclosure activeCount={activeFilterCount}>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategoryFilter("all")}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                categoryFilter === "all"
                  ? "border-forest bg-forest text-parchment"
                  : "border-hairline bg-parchment text-ink hover:border-forest"
              }`}
            >
              All categories
            </button>
            {ATTIRE_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category)}
                className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                  categoryFilter === category
                    ? "border-forest bg-forest text-parchment"
                    : "border-hairline bg-parchment text-ink hover:border-forest"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setBuyRentFilter("all")}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                buyRentFilter === "all"
                  ? "border-forest bg-forest text-parchment"
                  : "border-hairline bg-parchment text-ink hover:border-forest"
              }`}
            >
              Buy or rent
            </button>
            {BUY_OR_RENT_OPTIONS.map((option) => (
              <button
                key={option}
                onClick={() => setBuyRentFilter(option)}
                className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                  buyRentFilter === option
                    ? "border-forest bg-forest text-parchment"
                    : "border-hairline bg-parchment text-ink hover:border-forest"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTierFilter("all")}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                tierFilter === "all"
                  ? "border-forest bg-forest text-parchment"
                  : "border-hairline bg-parchment text-ink hover:border-forest"
              }`}
            >
              All price tiers
            </button>
            {STYLE_TIERS.map((tier) => (
              <button
                key={tier}
                onClick={() => setTierFilter(tier)}
                className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                  tierFilter === tier
                    ? "border-forest bg-forest text-parchment"
                    : "border-hairline bg-parchment text-ink hover:border-forest"
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </FilterDisclosure>

        {filteredItems.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink/50">
            {items.length === 0
              ? "No attire has been added yet."
              : "No attire matches these filters."}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filteredItems.map((item) => (
              <AttireCard
                key={item.id}
                item={item}
                isShortlisted={shortlistedIds.has(item.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
