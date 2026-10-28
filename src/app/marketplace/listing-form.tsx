"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { LegalNotice } from "@/components/legal-notice";
import { createClient } from "@/lib/supabase/client";
import { shrinkImage } from "@/lib/shrink-image";
import { STATES } from "@/lib/wedding-options";
import { MARKET_CATEGORIES, MARKET_COLORS, MARKET_CONDITIONS, MAX_MARKET_PHOTOS, NOT_ALLOWED, PICKUP_OPTIONS } from "@/lib/marketplace";
import type { MarketListing } from "@/lib/supabase/types";
import { createListing, updateListing } from "./actions";

const field =
  "mt-1 w-full rounded-md border border-hairline bg-card px-3 py-2 text-ink outline-none focus:border-forest";
const label = "block text-sm font-medium text-forest";

/**
 * Sell or edit one listing. Photos go first, the way a marketplace asks for
 * them: they're uploaded straight from the browser to the seller's own folder
 * as they're picked, and the form only carries their URLs.
 */
export function ListingForm({
  sellerId,
  listing,
  defaults,
  pass,
  badgePreview = null,
}: {
  sellerId: string;
  listing?: MarketListing;
  /**
   * Prefilled values: for a new listing the seller's first name and wedding
   * town, and for an edit the state's full name (the row keeps its abbreviation).
   */
  defaults?: { seller_name?: string; city?: string; state?: string; title?: string; category?: string; price?: string };
  /** A "Pass it on" draft: the budget line it came from, and Wren's price reasoning. */
  pass?: { source: string; skip: string; hint: string | null };
  /** The badge the seller's wedding would earn ("Married Oct 2026"), or null without a date. */
  badgePreview?: string | null;
}) {
  const [photos, setPhotos] = useState<string[]>(listing?.photo_urls ?? []);
  const [uploading, setUploading] = useState(0);
  const [free, setFree] = useState(listing ? listing.price_cents === 0 : false);
  const [type, setType] = useState<"sale" | "rent">(listing?.listing_type ?? "sale");
  const [colors, setColors] = useState<string[]>(listing?.color_families ?? []);
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);

  async function addPhotos(files: FileList | null) {
    if (!files) return;
    const room = MAX_MARKET_PHOTOS - photos.length;
    const picked = Array.from(files).slice(0, room);
    if (picked.length === 0) return;
    setError(undefined);
    setUploading((n) => n + picked.length);
    const supabase = createClient();
    for (const original of picked) {
      try {
        const file = await shrinkImage(original, 1600);
        if (!file.type.startsWith("image/")) throw new Error("not an image");
        if (file.size > 5 * 1024 * 1024) throw new Error("too big");
        const path = `${sellerId}/${crypto.randomUUID()}.${file.type === "image/png" ? "png" : "jpg"}`;
        const { error: uploadError } = await supabase.storage
          .from("market-photos")
          .upload(path, file, { contentType: file.type });
        if (uploadError) throw uploadError;
        const url = supabase.storage.from("market-photos").getPublicUrl(path).data.publicUrl;
        setPhotos((current) => [...current, url]);
      } catch {
        setError("A photo didn't upload. Try a JPG or PNG under 5MB.");
      } finally {
        setUploading((n) => n - 1);
      }
    }
    if (fileInput.current) fileInput.current.value = "";
  }

  function move(index: number, by: number) {
    setPhotos((current) => {
      const next = [...current];
      const [photo] = next.splice(index, 1);
      next.splice(Math.max(0, Math.min(next.length, index + by)), 0, photo);
      return next;
    });
  }

  function submit(formData: FormData) {
    for (const url of photos) formData.append("photo_urls", url);
    startTransition(async () => {
      const result = listing ? await updateListing(listing.id, formData) : await createListing(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form action={submit} className="space-y-6">
      {pass && (
        <>
          <input type="hidden" name="source_budget_item" value={pass.source} />
          <input type="hidden" name="pass" value="1" />
          <input type="hidden" name="pass_skip" value={pass.skip} />
        </>
      )}
      <section>
        <p className={label}>
          Photos <span className="font-normal text-ink/50">· {photos.length}/{MAX_MARKET_PHOTOS}, first one is the cover</span>
        </p>
        <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {photos.map((url, i) => (
            <div key={url} className="group relative aspect-square overflow-hidden rounded-md border border-hairline bg-parchment">
              <Image src={url} alt="" fill sizes="160px" className="object-cover" />
              {i === 0 && (
                <span className="absolute left-1 top-1 rounded bg-forest px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-parchment">
                  Cover
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-gradient-to-t from-black/60 p-1">
                <button type="button" aria-label="Move earlier" onClick={() => move(i, -1)} disabled={i === 0} className="rounded px-1.5 text-white disabled:opacity-30">
                  ‹
                </button>
                <button type="button" aria-label="Remove photo" onClick={() => setPhotos((c) => c.filter((p) => p !== url))} className="rounded px-1.5 text-xs text-white">
                  Remove
                </button>
                <button type="button" aria-label="Move later" onClick={() => move(i, 1)} disabled={i === photos.length - 1} className="rounded px-1.5 text-white disabled:opacity-30">
                  ›
                </button>
              </div>
            </div>
          ))}
          {Array.from({ length: uploading }, (_, i) => (
            <div key={`up-${i}`} className="flex aspect-square animate-pulse items-center justify-center rounded-md border border-hairline bg-parchment text-xs text-ink/50">
              Uploading…
            </div>
          ))}
          {photos.length + uploading < MAX_MARKET_PHOTOS && (
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-hairline text-sm text-forest hover:border-forest">
              <span className="text-2xl leading-none">+</span>
              Add photos
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(e) => addPhotos(e.target.files)}
              />
            </label>
          )}
        </div>
      </section>

      <fieldset>
        <legend className={label}>Selling or renting it out?</legend>
        <div className="mt-1 inline-flex rounded-md border border-hairline bg-card p-1">
          {(
            [
              ["sale", "Sell it"],
              ["rent", "Rent it out"],
            ] as const
          ).map(([value, text]) => (
            <label
              key={value}
              className={`cursor-pointer rounded px-4 py-1.5 text-sm font-medium ${
                type === value ? "bg-forest text-parchment" : "text-forest hover:bg-forest/5"
              }`}
            >
              <input
                type="radio"
                name="listing_type"
                value={value}
                checked={type === value}
                onChange={() => setType(value)}
                className="sr-only"
              />
              {text}
            </label>
          ))}
        </div>
        {type === "rent" && (
          <p className="mt-1 text-xs text-ink/50">
            Lent for one wedding and returned after. Agree the dates and any deposit with the renter in messages.
          </p>
        )}
      </fieldset>

      <div>
        <label htmlFor="title" className={label}>Title</label>
        <input id="title" name="title" required maxLength={80} defaultValue={listing?.title ?? defaults?.title} placeholder="e.g. 24 gold table numbers" className={field} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <label htmlFor="price" className={label}>{type === "rent" ? "Rental price" : "Price"}</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 mt-0.5 -translate-y-1/2 text-ink/50">$</span>
            <input
              id="price"
              name="price"
              inputMode="decimal"
              disabled={free}
              required={!free}
              defaultValue={listing ? (listing.price_cents > 0 ? String(listing.price_cents / 100) : "") : (defaults?.price ?? "")}
              placeholder={free ? "Free" : "40"}
              className={`${field} pl-7 disabled:bg-parchment disabled:text-ink/40`}
            />
          </div>
          {pass?.hint && !free && <p className="mt-1 text-xs text-ink/55">{pass.hint}</p>}
          <label className="mt-2 flex items-center gap-2 text-sm text-ink/70">
            <input type="checkbox" name="free" checked={free} onChange={(e) => setFree(e.target.checked)} />
            {type === "rent" ? "Free to borrow" : "Free to a good home"}
          </label>
          {!free && (
            <label className="mt-1 flex items-center gap-2 text-sm text-ink/70">
              <input type="checkbox" name="negotiable" defaultChecked={listing?.negotiable ?? false} />
              Open to offers
            </label>
          )}
        </div>
        <div>
          <label htmlFor="category" className={label}>Category</label>
          <select id="category" name="category" required defaultValue={listing?.category ?? defaults?.category ?? ""} className={field}>
            <option value="" disabled>Choose…</option>
            {MARKET_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="condition" className={label}>Condition</label>
          <select id="condition" name="condition" required defaultValue={listing?.condition ?? ""} className={field}>
            <option value="" disabled>Choose…</option>
            {MARKET_CONDITIONS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="quantity" className={label}>How many</label>
        <input id="quantity" name="quantity" type="number" min={1} max={10000} defaultValue={listing?.quantity ?? 1} className={`${field} sm:w-32`} />
        <p className="mt-1 text-xs text-ink/50">Selling a set? Put the number in the set and price it as one.</p>
      </div>

      <fieldset>
        <legend className={label}>
          Colours <span className="font-normal text-ink/50">(optional, up to 3)</span>
        </legend>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {MARKET_COLORS.map((c) => {
            const on = colors.includes(c.id);
            return (
              <label
                key={c.id}
                className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-forest/40 ${
                  on ? "border-forest bg-forest text-parchment" : "border-hairline bg-card text-forest hover:border-forest/50"
                } ${!on && colors.length >= 3 ? "opacity-40" : ""}`}
              >
                <input
                  type="checkbox"
                  name="color_families"
                  value={c.id}
                  checked={on}
                  disabled={!on && colors.length >= 3}
                  onChange={() => setColors((cur) => (on ? cur.filter((x) => x !== c.id) : [...cur, c.id]))}
                  className="sr-only"
                />
                <span aria-hidden className="h-3 w-3 rounded-full border border-black/15" style={{ background: c.dot }} />
                {c.label}
              </label>
            );
          })}
        </div>
        <p className="mt-1 text-xs text-ink/50">Helps couples with the same colours find it.</p>
      </fieldset>

      <fieldset>
        <legend className={label}>How can the buyer get it?</legend>
        <div className="mt-1 flex flex-wrap gap-x-5 gap-y-2">
          {PICKUP_OPTIONS.map((o) => (
            <label key={o.value} className="flex items-center gap-2 text-sm text-ink/80">
              <input
                type="checkbox"
                name="pickup_options"
                value={o.value}
                defaultChecked={(listing?.pickup_options ?? ["meetup"]).includes(o.value)}
              />
              {o.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="description" className={label}>Description <span className="font-normal text-ink/50">(optional)</span></label>
        <textarea
          id="description"
          name="description"
          rows={5}
          maxLength={2000}
          defaultValue={listing?.description ?? ""}
          placeholder="Size, colours, any wear, whether you'd split the set…"
          className={field}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="city" className={label}>Pickup town</label>
          <input id="city" name="city" required maxLength={80} defaultValue={listing?.city ?? defaults?.city} placeholder="Austin" className={field} />
        </div>
        <div>
          <label htmlFor="state" className={label}>State</label>
          <select id="state" name="state" required defaultValue={defaults?.state ?? ""} className={field}>
            <option value="" disabled>Choose…</option>
            {STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
      <p className="-mt-3 text-xs text-ink/50">
        Only the town shows on the map. Share an exact pickup spot in messages once you&apos;ve agreed a sale.
      </p>

      <div>
        <label htmlFor="seller_name" className={label}>Your first name</label>
        <input id="seller_name" name="seller_name" required maxLength={40} defaultValue={listing?.seller_name ?? defaults?.seller_name} className={`${field} sm:w-64`} />
      </div>

      {badgePreview && (
        <label className="flex items-start gap-2 text-sm text-ink/80">
          <input type="checkbox" name="show_badge" defaultChecked={listing ? Boolean(listing.seller_badge) : true} className="mt-1" />
          <span>
            Show <strong className="text-forest">&ldquo;{badgePreview} · planned on You Do, I Do&rdquo;</strong> on this
            listing, so buyers know you&apos;re a real couple. Month and year only, never your venue or date.
          </span>
        </label>
      )}

      {error && <p className="text-sm text-red-700" role="alert">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending || uploading > 0}
          className="rounded-md bg-forest px-5 py-2.5 font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
        >
          {isPending ? "Saving…" : listing ? "Save changes" : pass ? "List it" : "Post listing"}
        </button>
        <Link href={listing ? `/marketplace/${listing.id}` : "/marketplace"} className="text-sm text-ink/60 hover:text-forest">
          Cancel
        </Link>
      </div>
      <LegalNotice action={listing ? "saving this listing" : "posting this listing"} className="-mt-3" />
      <details className="text-xs text-ink/50">
        <summary className="cursor-pointer">
          By posting you confirm it&apos;s yours to sell and isn&apos;t on the not-allowed list.
        </summary>
        <p className="mt-2">
          {NOT_ALLOWED.join(" · ")}. Listings that break this are taken down.
        </p>
      </details>
    </form>
  );
}
