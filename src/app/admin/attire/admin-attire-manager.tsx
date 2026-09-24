"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import type { AttireItem } from "@/lib/supabase/types";
import { ATTIRE_CATEGORIES, STYLE_TIERS } from "@/lib/wedding-options";
import { COLOR_SWATCHES, formatPrice } from "@/lib/attire";
import { deleteAttireItem, saveAttireItem } from "./actions";

const input =
  "w-full rounded-md border border-hairline bg-parchment px-3 py-2 text-sm text-ink outline-none focus:border-forest";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-ink/70">{label}</span>
      {children}
      {hint && <span className="text-xs text-ink/45">{hint}</span>}
    </label>
  );
}

function ItemForm({
  item,
  vendors,
  onDone,
}: {
  item?: AttireItem;
  vendors: { id: string; name: string }[];
  onDone: () => void;
}) {
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(fd) =>
        startTransition(async () => {
          const result = await saveAttireItem(fd);
          setError(result?.error);
          if (!result?.error) onDone();
        })
      }
      className="grid gap-4 rounded-lg border border-hairline bg-card p-5 shadow-sm sm:grid-cols-2"
    >
      {item && <input type="hidden" name="id" value={item.id} />}
      <Field label="Name *">
        <input name="name" required defaultValue={item?.name} className={input} />
      </Field>
      <Field label="Category *">
        <select name="category" required defaultValue={item?.category ?? "Wedding Dress"} className={input}>
          {ATTIRE_CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </Field>
      <Field label="Designer / brand">
        <input name="designer" defaultValue={item?.designer ?? ""} className={input} />
      </Field>
      <Field label="Style tab" hint="Groups items into the tabs under the category, e.g. A-line, Tuxedo, Solitaire.">
        <input name="style" defaultValue={item?.style ?? ""} className={input} />
      </Field>
      <Field label="Buy price ($)">
        <input name="buy_price" inputMode="decimal" defaultValue={item?.buy_price ?? ""} className={input} />
      </Field>
      <Field label="Rent price ($)">
        <input name="rent_price" inputMode="decimal" defaultValue={item?.rent_price ?? ""} className={input} />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Photo URLs" hint="One https link per line. The first is the main photo, the second shows on hover.">
          <textarea name="image_urls" rows={3} defaultValue={item?.image_urls?.join("\n")} className={`${input} font-mono-numbers text-xs`} />
        </Field>
      </div>
      <Field label="Retailer link" hint="Where 'Shop' sends the couple. Affiliate links go here.">
        <input name="retailer_url" type="url" defaultValue={item?.retailer_url ?? ""} className={input} />
      </Field>
      <Field label="Listed by vendor" hint="A boutique on Wren's vendor side. 'Book a fitting' links to them.">
        <select name="vendor_id" defaultValue={item?.vendor_id ?? ""} className={input}>
          <option value="">None</option>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Silhouette / cut">
        <input name="silhouette" defaultValue={item?.silhouette ?? ""} className={input} />
      </Field>
      <Field label="Neckline">
        <input name="neckline" defaultValue={item?.neckline ?? ""} className={input} />
      </Field>
      <Field label="Sleeves">
        <input name="sleeves" defaultValue={item?.sleeves ?? ""} className={input} />
      </Field>
      <Field label="Length">
        <input name="length" defaultValue={item?.length ?? ""} className={input} />
      </Field>
      <Field label="Fabric / metal">
        <input name="fabric" defaultValue={item?.fabric ?? ""} className={input} />
      </Field>
      <Field label="Size range" hint="e.g. 0–30, 36S–52L">
        <input name="size_range" defaultValue={item?.size_range ?? ""} className={input} />
      </Field>
      <Field label="Colours" hint={`Comma-separated. Swatches exist for: ${Object.keys(COLOR_SWATCHES).join(", ")}.`}>
        <input name="colors" defaultValue={item?.colors?.join(", ")} className={input} />
      </Field>
      <Field label="Price tier">
        <select name="price_tier" defaultValue={item?.price_tier ?? ""} className={input}>
          <option value="">—</option>
          {STYLE_TIERS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </Field>
      <Field label="Badge" hint="Short label on the photo: New, Ships fast, Best seller.">
        <input name="badge" defaultValue={item?.badge ?? ""} className={input} />
      </Field>
      <div className="flex items-end gap-6 pb-2 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="is_featured" defaultChecked={item?.is_featured} className="accent-forest" />
          Featured (sorts first)
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="is_active" defaultChecked={item?.is_active ?? true} className="accent-forest" />
          Visible to couples
        </label>
      </div>
      <div className="sm:col-span-2">
        <Field label="Description">
          <textarea name="description" rows={3} defaultValue={item?.description ?? ""} className={input} />
        </Field>
      </div>
      <div className="flex items-center gap-3 sm:col-span-2">
        <button type="submit" disabled={isPending} className="rounded-md bg-forest px-4 py-2 text-sm font-medium text-parchment disabled:opacity-60">
          {isPending ? "Saving…" : item ? "Save changes" : "Add item"}
        </button>
        <button type="button" onClick={onDone} className="text-sm text-ink/60 hover:text-forest">
          Cancel
        </button>
        {error && <p className="text-sm text-red-700">{error}</p>}
      </div>
    </form>
  );
}

export function AdminAttireManager({
  items,
  vendors,
  saveCounts,
}: {
  items: AttireItem[];
  vendors: { id: string; name: string }[];
  saveCounts: Record<string, number>;
}) {
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [category, setCategory] = useState<string>("all");
  const [, startTransition] = useTransition();

  const shown = items.filter((i) => category === "all" || i.category === category);
  const withPhotos = items.filter((i) => i.image_urls?.length).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="rounded-md bg-forest px-4 py-2 text-sm font-medium text-parchment"
        >
          + Add item
        </button>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-md border border-hairline bg-card px-3 py-2 text-sm">
          <option value="all">All categories ({items.length})</option>
          {ATTIRE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c} ({items.filter((i) => i.category === c).length})
            </option>
          ))}
        </select>
        <span className="font-mono-numbers text-xs text-ink/50">
          {withPhotos}/{items.length} have photos
        </span>
      </div>

      {editing === "new" && <ItemForm vendors={vendors} onDone={() => setEditing(null)} />}

      <ul className="divide-y divide-hairline rounded-lg border border-hairline bg-card">
        {shown.map((item) =>
          editing === item.id ? (
            <li key={item.id} className="p-3">
              <ItemForm item={item} vendors={vendors} onDone={() => setEditing(null)} />
            </li>
          ) : (
            <li key={item.id} className={`flex items-center gap-3 p-3 ${item.is_active ? "" : "opacity-50"}`}>
              <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded bg-parchment">
                {item.image_urls?.[0] && <Image src={item.image_urls[0]} alt="" fill sizes="44px" className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">
                  {item.name}
                  {item.is_featured && <span className="ml-2 text-xs text-brass">★ Featured</span>}
                  {!item.is_active && <span className="ml-2 text-xs text-ink/50">Hidden</span>}
                </p>
                <p className="truncate text-xs text-ink/55">
                  {[item.category, item.designer, item.style].filter(Boolean).join(" · ")}
                </p>
              </div>
              <div className="hidden text-right font-mono-numbers text-xs text-ink/70 sm:block">
                {item.buy_price != null && <div>Buy {formatPrice(item.buy_price)}</div>}
                {item.rent_price != null && <div>Rent {formatPrice(item.rent_price)}</div>}
              </div>
              <span className="w-16 text-right font-mono-numbers text-xs text-ink/50" title="Couples who saved it">
                ♥ {saveCounts[item.id] ?? 0}
              </span>
              <button type="button" onClick={() => setEditing(item.id)} className="text-sm text-forest hover:underline">
                Edit
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!confirm(`Delete ${item.name}? It will disappear from every couple's saves and party board. Hiding it keeps those.`)) return;
                  const fd = new FormData();
                  fd.set("id", item.id);
                  startTransition(async () => {
                    await deleteAttireItem(fd);
                  });
                }}
                className="text-sm text-ink/40 hover:text-red-700"
              >
                Delete
              </button>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}
