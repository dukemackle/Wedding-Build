"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { AttireItem, AttirePartyMember } from "@/lib/supabase/types";
import { formatPrice, safeUrl, swatch } from "@/lib/attire";
import { AttireImage, HeartButton } from "./attire-card";

/**
 * One item up close. A dialog beside the grid on desktop -- gallery left,
 * details right -- and a full-screen sheet on a phone, gallery on top.
 */
export function AttireQuickView({
  item,
  saved,
  pending,
  vendorName,
  party,
  onToggleSave,
  onAssign,
  onClose,
}: {
  item: AttireItem;
  saved: boolean;
  pending?: boolean;
  vendorName?: string;
  party: AttirePartyMember[];
  onToggleSave: () => void;
  onAssign: (memberId: string) => void;
  onClose: () => void;
}) {
  const [photo, setPhoto] = useState(0);
  const [assignTo, setAssignTo] = useState("");
  const photoCount = Math.max(item.image_urls?.length ?? 0, 1);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  const retailer = safeUrl(item.retailer_url);
  const buy = formatPrice(item.buy_price);
  const rent = formatPrice(item.rent_price);
  const details = [
    ["Silhouette", item.silhouette],
    ["Neckline", item.neckline],
    ["Sleeves", item.sleeves],
    ["Length", item.length],
    ["Fabric", item.fabric],
    ["Sizes", item.size_range],
    ["Style", item.style],
    ["Price tier", item.price_tier],
  ].filter((d): d is [string, string] => Boolean(d[1]));
  const partyable = !item.category.startsWith("Ring");
  const wearing = party.filter((m) => m.attire_item_id === item.id);

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-center bg-ink/40 backdrop-blur-[2px] lg:items-center lg:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={item.name}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full flex-col overflow-y-auto bg-card lg:grid lg:max-h-[88vh] lg:max-w-6xl lg:grid-cols-[1.1fr_1fr] lg:overflow-hidden lg:rounded-xl lg:shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-card/95 text-lg text-ink shadow-sm hover:text-forest"
        >
          ✕
        </button>

        {/* Gallery */}
        <div className="flex flex-col gap-3 bg-parchment p-0 lg:overflow-y-auto lg:p-5">
          <div className="relative aspect-[3/4] w-full overflow-hidden lg:rounded-md">
            <AttireImage item={item} index={photo} sizes="(min-width: 1024px) 50vw, 100vw" priority />
          </div>
          {photoCount > 1 && (
            <div className="flex gap-2 overflow-x-auto px-4 pb-1 lg:px-0">
              {item.image_urls.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPhoto(i)}
                  className={`relative aspect-[3/4] w-16 shrink-0 overflow-hidden rounded border-2 ${
                    i === photo ? "border-forest" : "border-transparent"
                  }`}
                  aria-label={`Photo ${i + 1}`}
                >
                  <AttireImage item={item} index={i} sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col p-5 pb-10 sm:p-8 lg:overflow-y-auto">
          <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
            {[item.designer ?? vendorName, item.category].filter(Boolean).join(" · ")}
          </p>
          <div className="mt-2 flex items-start justify-between gap-4">
            <h2 className="font-display text-3xl font-semibold text-forest sm:text-4xl">{item.name}</h2>
            <HeartButton saved={saved} pending={pending} onToggle={onToggleSave} className="mt-1 shrink-0 border border-hairline" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {buy && (
              <div className="rounded-lg border border-hairline p-3">
                <p className="text-xs uppercase tracking-wide text-ink/50">Buy</p>
                <p className="font-mono-numbers text-xl text-ink">{buy}</p>
              </div>
            )}
            {rent && (
              <div className="rounded-lg border border-hairline p-3">
                <p className="text-xs uppercase tracking-wide text-ink/50">Rent</p>
                <p className="font-mono-numbers text-xl text-ink">{rent}</p>
              </div>
            )}
            {!buy && !rent && item.price_from != null && (
              <div className="rounded-lg border border-hairline p-3">
                <p className="text-xs uppercase tracking-wide text-ink/50">From</p>
                <p className="font-mono-numbers text-xl text-ink">{formatPrice(item.price_from)}</p>
              </div>
            )}
          </div>

          {item.description && <p className="mt-5 leading-relaxed text-ink/80">{item.description}</p>}

          {item.colors?.length > 0 && (
            <div className="mt-5">
              <p className="text-xs uppercase tracking-[0.14em] text-ink/60">Colours</p>
              <div className="mt-2 flex flex-wrap gap-3">
                {item.colors.map((c) => (
                  <span key={c} className="flex items-center gap-1.5 text-sm text-ink/80">
                    <span className="h-5 w-5 rounded-full border border-ink/15" style={{ backgroundColor: swatch(c) }} />
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {details.length > 0 && (
            <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-hairline pt-5 text-sm">
              {details.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs uppercase tracking-wide text-ink/50">{label}</dt>
                  <dd className="text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            {retailer && (
              <a
                href={retailer}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="flex-1 rounded-full bg-forest px-5 py-3 text-center font-medium text-parchment transition-colors hover:bg-forest/90"
              >
                Shop at {item.designer ?? "retailer"} ↗
              </a>
            )}
            {item.vendor_id && (
              <Link
                href={`/vendors/${item.vendor_id}`}
                className={`flex-1 rounded-full px-5 py-3 text-center font-medium transition-colors ${
                  retailer
                    ? "border border-forest text-forest hover:bg-forest/5"
                    : "bg-forest text-parchment hover:bg-forest/90"
                }`}
              >
                Book a fitting{vendorName ? ` at ${vendorName}` : ""}
              </Link>
            )}
            {!retailer && !item.vendor_id && (
              <p className="text-sm text-ink/50">Where to buy is coming soon. Save it now so you don&apos;t lose it.</p>
            )}
          </div>

          {partyable && (
            <div className="mt-6 rounded-lg border border-hairline bg-parchment p-4">
              <p className="font-display text-lg font-semibold text-forest">Wedding party</p>
              {wearing.length > 0 && (
                <p className="mt-1 text-sm text-ink/70">
                  Wearing this: {wearing.map((m) => m.name).join(", ")}
                </p>
              )}
              {party.length === 0 ? (
                <p className="mt-1 text-sm text-ink/60">
                  Add your party on the Party board tab, then assign this look to them.
                </p>
              ) : (
                <div className="mt-3 flex gap-2">
                  <select
                    value={assignTo}
                    onChange={(e) => setAssignTo(e.target.value)}
                    className="min-w-0 flex-1 rounded-md border border-hairline bg-card px-3 py-2 text-sm text-ink outline-none focus:border-forest"
                  >
                    <option value="">Assign to…</option>
                    <option value="__all">Everyone without a look</option>
                    {party.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                        {m.role ? ` (${m.role})` : ""}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={!assignTo}
                    onClick={() => {
                      if (assignTo === "__all") {
                        party.filter((m) => !m.attire_item_id).forEach((m) => onAssign(m.id));
                      } else {
                        onAssign(assignTo);
                      }
                      setAssignTo("");
                    }}
                    className="rounded-md bg-forest px-4 py-2 text-sm font-medium text-parchment disabled:opacity-40"
                  >
                    Assign
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
