"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { LegalNotice } from "@/components/legal-notice";
import { MAX_SET_ITEMS, MIN_SET_ITEMS, formatPrice, type MarketSetWithItems } from "@/lib/marketplace";
import type { MarketListing } from "@/lib/supabase/types";
import { createSet, updateSet } from "../set-actions";
import { SetCollage } from "../set-card";

const field =
  "mt-1 w-full rounded-md border border-hairline bg-card px-3 py-2 text-ink outline-none focus:border-forest";
const label = "block text-sm font-medium text-forest";

/**
 * Make or edit a whole-wedding set: tick the listings that go together, name
 * it, price the lot. The collage and "they add up to" update as things are
 * ticked, so the seller sees the set as buyers will.
 */
export function SetForm({
  listings,
  set,
  preselected = [],
  defaultTitle = "",
}: {
  /** The seller's live listings that aren't in another set. */
  listings: MarketListing[];
  set?: MarketSetWithItems;
  /** Ticked to start with, e.g. the listing "Bundle into a set" came from. */
  preselected?: string[];
  defaultTitle?: string;
}) {
  const [picked, setPicked] = useState<string[]>(set ? set.items.map((l) => l.id) : preselected);
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const chosen = listings.filter((l) => picked.includes(l.id));
  const separate = chosen.reduce((sum, l) => sum + l.price_cents, 0);
  const type = chosen[0]?.listing_type;

  function toggle(id: string) {
    setPicked((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  }

  return (
    <form
      action={(formData) => {
        for (const id of picked) formData.append("listing_ids", id);
        startTransition(async () => {
          const result = set ? await updateSet(set.id, formData) : await createSet(formData);
          if (result?.error) setError(result.error);
        });
      }}
      // Desktop: pick on the left, the set taking shape on the right.
      className="grid gap-8 lg:grid-cols-[1fr_360px]"
    >
      <section>
        <p className={label}>
          What&apos;s in the set <span className="font-normal text-ink/50">· {picked.length} picked, at least {MIN_SET_ITEMS}</span>
        </p>
        <ul className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {listings.map((l) => {
            const on = picked.includes(l.id);
            const otherType = type && l.listing_type !== type && !on;
            return (
              <li key={l.id}>
                <label
                  className={`block cursor-pointer rounded-xl border-2 p-1.5 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-forest/40 ${
                    on ? "border-forest bg-card" : "border-transparent hover:border-hairline"
                  } ${otherType ? "cursor-not-allowed opacity-40" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={on}
                    disabled={Boolean(otherType) || (!on && picked.length >= MAX_SET_ITEMS)}
                    onChange={() => toggle(l.id)}
                    className="sr-only"
                  />
                  <span className="relative block aspect-square overflow-hidden rounded-lg bg-parchment">
                    {l.photo_urls[0] && <Image src={l.photo_urls[0]} alt="" fill sizes="180px" className="object-cover" />}
                    <span
                      aria-hidden
                      className={`absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full border-2 text-xs font-bold ${
                        on ? "border-forest bg-forest text-parchment" : "border-white bg-white/70 text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                  </span>
                  <span className="mt-1.5 block truncate text-sm font-medium text-forest">{l.title}</span>
                  <span className="block text-xs text-ink/50">
                    {formatPrice(l.price_cents, l.listing_type)}
                    {otherType ? ` · ${l.listing_type === "rent" ? "for rent" : "for sale"}` : ""}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
        {type && <p className="mt-2 text-xs text-ink/50">A set is all for sale or all for rent, so the others are greyed out.</p>}
      </section>

      <section className="space-y-5 lg:sticky lg:top-24 lg:self-start">
        {chosen.length > 0 && <SetCollage items={chosen} sizes="360px" />}
        <div>
          <label htmlFor="title" className={label}>Name the set</label>
          <input
            id="title"
            name="title"
            required
            maxLength={80}
            defaultValue={set?.title ?? defaultTitle}
            placeholder="e.g. Our garden wedding décor"
            className={field}
          />
        </div>
        <div>
          <label htmlFor="price" className={label}>{type === "rent" ? "Rental price for the set" : "Price for the set"}</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 mt-0.5 -translate-y-1/2 text-ink/50">$</span>
            <input
              id="price"
              name="price"
              inputMode="decimal"
              required
              defaultValue={set ? String(set.price_cents / 100) : ""}
              placeholder={separate ? String(Math.round((separate * 0.85) / 500) * 5) : "300"}
              className={`${field} pl-7`}
            />
          </div>
          {separate > 0 && (
            <p className="mt-1 text-xs text-ink/55">
              One by one they come to {formatPrice(separate)}. A little off for taking the lot helps it go.
            </p>
          )}
        </div>
        <div>
          <label htmlFor="description" className={label}>
            About the set <span className="font-normal text-ink/50">(optional)</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            maxLength={2000}
            defaultValue={set?.description ?? ""}
            placeholder="The look, the colours, what it suited (a garden, a barn, 120 guests)…"
            className={field}
          />
        </div>
        <p className="text-xs text-ink/50">Each piece stays listed on its own too, at its own price.</p>
        {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isPending || picked.length < MIN_SET_ITEMS}
            className="rounded-md bg-forest px-5 py-2.5 font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
          >
            {isPending ? "Saving…" : set ? "Save the set" : "Make the set"}
          </button>
          <Link href={set ? `/marketplace/sets/${set.id}` : "/marketplace?view=selling"} className="text-sm text-ink/60 hover:text-forest">
            Cancel
          </Link>
        </div>
        <LegalNotice action={set ? "saving this set" : "posting this set"} className="-mt-3" />
      </section>
    </form>
  );
}
