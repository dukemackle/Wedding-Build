"use client";

import { useState, useTransition } from "react";
import type { PublicRegistryGift, RegistryClaim, Wedding } from "@/lib/supabase/types";
import { safeUrl, storeFromUrl, usd } from "@/lib/registry";
import {
  deleteRegistryGift,
  readProductLink,
  releaseClaimAsCouple,
  saveGiftSettings,
  saveRegistryGift,
} from "./actions";

const inputClass =
  "w-full rounded-md border border-hairline bg-parchment px-3 py-2 text-ink outline-none focus:border-forest";
const labelClass = "flex flex-col gap-1 text-sm text-ink";
const primary =
  "rounded-md bg-forest px-4 py-2 font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60";
const secondary =
  "rounded-md border border-hairline px-4 py-2 font-medium text-ink transition-colors hover:border-forest";
const sectionClass = "rounded-lg border border-hairline bg-card p-5 shadow-sm";
const sectionHeadingClass = "font-mono-numbers text-[11px] uppercase tracking-[0.18em] text-ink/50";

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

/* ---------- Adding and editing ---------- */

type Draft = {
  title: string;
  url: string;
  image_url: string;
  store: string;
  price: string;
  quantity: string;
  goal: string;
  note: string;
};

const blank: Draft = { title: "", url: "", image_url: "", store: "", price: "", quantity: "1", goal: "", note: "" };

function fromGift(g: PublicRegistryGift): Draft {
  return {
    title: g.title,
    url: g.url ?? "",
    image_url: g.image_url ?? "",
    store: g.store ?? "",
    price: g.price != null ? String(g.price) : "",
    quantity: String(g.quantity),
    goal: g.goal != null ? String(g.goal) : "",
    note: g.note ?? "",
  };
}

function GiftForm({
  kind,
  gift,
  onDone,
}: {
  kind: "gift" | "fund";
  gift?: PublicRegistryGift;
  onDone: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(gift ? fromGift(gift) : blank);
  const [error, setError] = useState<string>();
  const [hint, setHint] = useState<string>();
  const [reading, startReading] = useTransition();
  const [saving, startSaving] = useTransition();
  const set = (key: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setDraft((d) => ({ ...d, [key]: e.target.value }));

  function fillFromLink() {
    if (!draft.url.trim()) return;
    startReading(async () => {
      const found = await readProductLink(draft.url);
      if (found.error) {
        setError(found.error);
        return;
      }
      setError(undefined);
      setDraft((d) => ({
        ...d,
        title: d.title || found.title || "",
        image_url: d.image_url || found.image || "",
        price: d.price || (found.price != null ? String(found.price) : ""),
        store: d.store || found.store || "",
      }));
      setHint(
        found.title
          ? "Filled in from the store's page. Check it looks right."
          : `${found.store ?? "That store"} didn't share the details. Add the name and price yourself.`,
      );
    });
  }

  function submit(formData: FormData) {
    startSaving(async () => {
      const result = await saveRegistryGift(formData);
      if (result.error) setError(result.error);
      else onDone();
    });
  }

  const picture = safeUrl(draft.image_url);

  return (
    <form action={submit} className="flex flex-col gap-3">
      <input type="hidden" name="kind" value={kind} />
      {gift && <input type="hidden" name="id" value={gift.id} />}
      {kind === "gift" && (
        <label className={labelClass}>
          Link to the gift
          <div className="flex gap-2">
            <input
              name="url"
              type="url"
              value={draft.url}
              onChange={set("url")}
              onBlur={() => !draft.title && fillFromLink()}
              placeholder="Paste a link from any store"
              className={inputClass}
            />
            <button type="button" onClick={fillFromLink} disabled={reading || !draft.url} className={`${secondary} shrink-0 text-sm`}>
              {reading ? "Reading..." : "Fill in"}
            </button>
          </div>
        </label>
      )}
      {hint && <p className="-mt-1 text-xs text-ink/60">{hint}</p>}
      <div className="flex gap-3">
        {kind === "gift" && (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-hairline bg-white">
            {picture ? (
              // eslint-disable-next-line @next/next/no-img-element -- a store's product photo, any host
              <img src={picture} alt="" className="h-full w-full object-contain p-1" />
            ) : (
              <span className="text-2xl text-ink/20" aria-hidden>
                🎁
              </span>
            )}
          </div>
        )}
        <label className={`${labelClass} flex-1`}>
          {kind === "fund" ? "Fund name" : "Name"}
          <input
            name="title"
            required
            value={draft.title}
            onChange={set("title")}
            maxLength={200}
            placeholder={kind === "fund" ? "e.g. Honeymoon in Italy" : "e.g. KitchenAid stand mixer"}
            className={inputClass}
          />
        </label>
      </div>
      {kind === "gift" ? (
        <div className="grid grid-cols-3 gap-3">
          <label className={labelClass}>
            Price
            <input name="price" inputMode="decimal" value={draft.price} onChange={set("price")} placeholder="$" className={inputClass} />
          </label>
          <label className={labelClass}>
            How many
            <input name="quantity" type="number" min={1} max={99} value={draft.quantity} onChange={set("quantity")} className={inputClass} />
          </label>
          <label className={labelClass}>
            Store
            <input name="store" value={draft.store} onChange={set("store")} placeholder={storeFromUrl(draft.url) ?? ""} className={inputClass} />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className={labelClass}>
            Goal (optional)
            <input name="goal" inputMode="decimal" value={draft.goal} onChange={set("goal")} placeholder="$" className={inputClass} />
          </label>
          <label className={labelClass}>
            Photo link (optional)
            <input name="image_url" type="url" value={draft.image_url} onChange={set("image_url")} placeholder="https://..." className={inputClass} />
          </label>
        </div>
      )}
      {kind === "gift" && <input type="hidden" name="image_url" value={draft.image_url} />}
      <label className={labelClass}>
        {kind === "fund" ? "What it's for" : "A note for guests (optional)"}
        <textarea
          name="note"
          rows={2}
          value={draft.note}
          onChange={set("note")}
          maxLength={600}
          placeholder={kind === "fund" ? "e.g. Ten days on the Amalfi coast, gelato every day" : "e.g. In the grey, please!"}
          className={inputClass}
        />
      </label>
      {error && <p className="text-sm text-red-800">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={saving} className={primary}>
          {saving ? "Saving..." : gift ? "Save" : kind === "fund" ? "Add fund" : "Add gift"}
        </button>
        <button type="button" onClick={onDone} className={secondary}>
          Cancel
        </button>
      </div>
    </form>
  );
}

/* ---------- Lists ---------- */

function useRemove() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  function run(action: () => Promise<{ error?: string }>, question: string) {
    if (!confirm(question)) return;
    startTransition(async () => {
      const result = await action();
      setError(result.error);
    });
  }
  return { isPending, error, run };
}

function GiftTile({ gift, claims }: { gift: PublicRegistryGift; claims: RegistryClaim[] }) {
  const [editing, setEditing] = useState(false);
  const remove = useRemove();
  const picture = safeUrl(gift.image_url);
  const store = gift.store ?? storeFromUrl(gift.url);
  const taken = gift.claimed >= gift.quantity;

  if (editing) {
    return (
      <div className={`${sectionClass} sm:col-span-2`}>
        <GiftForm kind="gift" gift={gift} onDone={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-lg border border-hairline bg-card p-3 shadow-sm">
      <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-white">
        {picture ? (
          // eslint-disable-next-line @next/next/no-img-element -- a store's product photo, any host
          <img src={picture} alt="" loading="lazy" className="h-full w-full object-contain p-2" />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl text-ink/20" aria-hidden>
            🎁
          </div>
        )}
        <span
          className={`absolute left-2 top-2 rounded-full px-2.5 py-0.5 text-xs font-medium ${
            taken ? "bg-forest text-parchment" : gift.claimed > 0 ? "bg-brass/20 text-ink" : "bg-white/90 text-ink/60"
          }`}
        >
          {taken ? "Taken" : gift.claimed > 0 ? `${gift.claimed} of ${gift.quantity} claimed` : gift.quantity > 1 ? `Wants ${gift.quantity}` : "Still needed"}
        </span>
      </div>
      <p className="mt-2 line-clamp-2 text-sm font-medium leading-snug text-ink">{gift.title}</p>
      <p className="text-xs text-ink/60">
        {[store, gift.price != null ? usd(gift.price) : null].filter(Boolean).join(" · ")}
      </p>
      {claims.length > 0 && (
        <p className="mt-1 text-xs text-forest">
          {claims.map((c) => `${c.guest_name}${c.quantity > 1 ? ` (${c.quantity})` : ""}`).join(", ")}
        </p>
      )}
      {remove.error && <p className="mt-1 text-xs text-red-800">{remove.error}</p>}
      <div className="mt-auto flex gap-3 pt-2 text-xs">
        <button onClick={() => setEditing(true)} className="text-brass hover:underline">
          Edit
        </button>
        <button
          onClick={() =>
            remove.run(
              () => deleteRegistryGift(gift.id),
              claims.length
                ? `${claims[0].guest_name} already said they're getting this. Remove it anyway?`
                : `Remove "${gift.title}"?`,
            )
          }
          disabled={remove.isPending}
          className="text-ink/50 hover:underline"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

function FundRow({ fund, claims }: { fund: PublicRegistryGift; claims: RegistryClaim[] }) {
  const [editing, setEditing] = useState(false);
  const remove = useRemove();
  const progress = fund.goal ? Math.min(100, Math.round((fund.raised / fund.goal) * 100)) : null;

  if (editing) return <GiftForm kind="fund" gift={fund} onDone={() => setEditing(false)} />;

  return (
    <div className="border-b border-hairline py-4 first:pt-0 last:border-b-0 last:pb-0">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-medium text-ink">{fund.title}</p>
          <p className="text-sm text-ink/60">
            {usd(fund.raised)} from {claims.length} {claims.length === 1 ? "guest" : "guests"}
            {fund.goal ? ` · goal ${usd(fund.goal)}` : ""}
          </p>
        </div>
        <div className="flex shrink-0 gap-3 text-xs">
          <button onClick={() => setEditing(true)} className="text-brass hover:underline">
            Edit
          </button>
          <button
            onClick={() => remove.run(() => deleteRegistryGift(fund.id), `Remove the "${fund.title}" fund?`)}
            disabled={remove.isPending}
            className="text-ink/50 hover:underline"
          >
            Remove
          </button>
        </div>
      </div>
      {progress !== null && (
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-hairline">
          <div className="h-full rounded-full bg-brass" style={{ width: `${progress}%` }} />
        </div>
      )}
      {remove.error && <p className="mt-1 text-xs text-red-800">{remove.error}</p>}
    </div>
  );
}

export function GiftsSection({ gifts, claims }: { gifts: PublicRegistryGift[]; claims: RegistryClaim[] }) {
  const [adding, setAdding] = useState(false);
  const items = gifts.filter((g) => g.kind === "gift");
  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold text-forest">Gifts from any store</h2>
          <p className="mt-1 text-sm text-ink/60">
            Guests tap &ldquo;I&apos;m getting this&rdquo; before they buy, and it&apos;s marked taken for everyone else.
          </p>
        </div>
        {!adding && (
          <button onClick={() => setAdding(true)} className={`${primary} text-sm`}>
            + Add a gift
          </button>
        )}
      </div>
      {adding && (
        <div className={`mt-4 ${sectionClass}`}>
          <GiftForm kind="gift" onDone={() => setAdding(false)} />
        </div>
      )}
      {items.length === 0 && !adding ? (
        <div className={`mt-4 ${sectionClass} text-center`}>
          <p className="text-sm text-ink/60">
            Paste a link to anything you&apos;d love, from Amazon to the pottery shop down the road.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {items.map((gift) => (
            <GiftTile key={gift.id} gift={gift} claims={claims.filter((c) => c.gift_id === gift.id)} />
          ))}
        </div>
      )}
    </section>
  );
}

export function FundsSection({ gifts, claims }: { gifts: PublicRegistryGift[]; claims: RegistryClaim[] }) {
  const [adding, setAdding] = useState(false);
  const funds = gifts.filter((g) => g.kind === "fund");
  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold text-forest">Cash funds</h2>
          <p className="mt-1 text-sm text-ink/60">Guests send money straight to you. No fees, ever.</p>
        </div>
        {!adding && (
          <button onClick={() => setAdding(true)} className={`${secondary} text-sm`}>
            + Add a fund
          </button>
        )}
      </div>
      {(adding || funds.length > 0) && (
        <div className={`mt-4 ${sectionClass}`}>
          {adding && (
            <div className={funds.length ? "mb-5 border-b border-hairline pb-5" : ""}>
              <GiftForm kind="fund" onDone={() => setAdding(false)} />
            </div>
          )}
          {funds.map((fund) => (
            <FundRow key={fund.id} fund={fund} claims={claims.filter((c) => c.gift_id === fund.id)} />
          ))}
        </div>
      )}
    </section>
  );
}

function ClaimRow({ claim, gift }: { claim: RegistryClaim; gift: PublicRegistryGift | undefined }) {
  const remove = useRemove();
  return (
    <li className="flex items-start justify-between gap-3 border-b border-hairline py-2.5 text-sm last:border-b-0">
      <div className="min-w-0">
        <p className="text-ink">
          <span className="font-medium">{claim.guest_name}</span>{" "}
          <span className="text-ink/60">
            {gift?.kind === "fund"
              ? `gave ${claim.amount ? usd(claim.amount) : ""} to`
              : claim.quantity > 1
                ? `is getting ${claim.quantity} ×`
                : "is getting"}
          </span>{" "}
          {gift?.title ?? "a gift you removed"}
        </p>
        {claim.message && <p className="text-xs italic text-ink/60">“{claim.message}”</p>}
        <p className="text-xs text-ink/40">{shortDate(claim.created_at)}</p>
        {remove.error && <p className="text-xs text-red-800">{remove.error}</p>}
      </div>
      <button
        onClick={() =>
          remove.run(
            () => releaseClaimAsCouple(claim.id),
            gift?.kind === "fund"
              ? `Remove ${claim.guest_name}'s gift from the list? (It doesn't refund anything.)`
              : `Free "${gift?.title}" up again, so other guests can get it?`,
          )
        }
        disabled={remove.isPending}
        className="shrink-0 text-xs text-ink/50 hover:underline"
      >
        {gift?.kind === "fund" ? "Remove" : "Release"}
      </button>
    </li>
  );
}

export function ClaimsSection({ gifts, claims }: { gifts: PublicRegistryGift[]; claims: RegistryClaim[] }) {
  return (
    <section className={sectionClass}>
      <h2 className={sectionHeadingClass}>Who&apos;s giving what</h2>
      {claims.length === 0 ? (
        <p className="mt-2 text-sm text-ink/60">
          When a guest claims a gift or gives to a fund, they&apos;ll show up here, ready for your thank-you notes.
        </p>
      ) : (
        <ul className="mt-2">
          {claims.map((claim) => (
            <ClaimRow key={claim.id} claim={claim} gift={gifts.find((g) => g.id === claim.gift_id)} />
          ))}
        </ul>
      )}
    </section>
  );
}

export function GiftSettings({ wedding }: { wedding: Wedding }) {
  const [error, setError] = useState<string>();
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function submit(formData: FormData) {
    startTransition(async () => {
      const result = await saveGiftSettings(formData);
      setError(result.error);
      setSaved(!result.error);
    });
  }

  return (
    <section className={sectionClass}>
      <h2 className={sectionHeadingClass}>How guests send money</h2>
      <p className="mt-1 text-xs text-ink/60">Fill in any you use. Guests only see buttons for these.</p>
      <form action={submit} onChange={() => setSaved(false)} className="mt-3 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <label className={labelClass}>
            Venmo
            <input name="gift_venmo" defaultValue={wedding.gift_venmo ?? ""} placeholder="@username" className={inputClass} />
          </label>
          <label className={labelClass}>
            PayPal.me
            <input name="gift_paypal" defaultValue={wedding.gift_paypal ?? ""} placeholder="name" className={inputClass} />
          </label>
          <label className={labelClass}>
            Cash App
            <input name="gift_cashapp" defaultValue={wedding.gift_cashapp ?? ""} placeholder="$cashtag" className={inputClass} />
          </label>
          <label className={labelClass}>
            Zelle
            <input name="gift_zelle" defaultValue={wedding.gift_zelle ?? ""} placeholder="email or phone" className={inputClass} />
          </label>
        </div>
        <label className={`${labelClass} mt-2`}>
          Ship gifts to
          <textarea
            name="gift_ship_to"
            rows={3}
            defaultValue={wedding.gift_ship_to ?? ""}
            placeholder={"Name\nStreet\nCity, State ZIP"}
            className={inputClass}
          />
          <span className="text-xs text-ink/50">Only shown to a guest right after they claim a gift.</span>
        </label>
        {error && <p className="text-sm text-red-800">{error}</p>}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={isPending} className={`${primary} text-sm`}>
            {isPending ? "Saving..." : "Save"}
          </button>
          {saved && <span className="text-sm text-forest">Saved</span>}
        </div>
      </form>
    </section>
  );
}
