"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import type { PublicRegistryGift, RegistryItem } from "@/lib/supabase/types";
import {
  PAY_LABELS,
  payLink,
  payMethods,
  safeUrl,
  storeFromUrl,
  usd,
  type PayHandles,
} from "@/lib/registry";
import { claimRegistryGift, releaseRegistryClaim } from "./actions";

/**
 * The registry on the guest site: links to store registries, cash funds paid
 * straight to the couple, and gifts from any store that a guest claims before
 * buying -- which is what stops two guests buying the same thing.
 *
 * Claims this browser made are remembered in localStorage (with the token the
 * database handed back), so the guest can see "you're getting this" and undo
 * it. Nothing else depends on it: lose it and the claim still stands, and the
 * couple can release it.
 */

const inputClass =
  "w-full rounded-md border border-hairline bg-parchment px-3 py-2 text-ink outline-none focus:border-forest";
const primary =
  "btn-motion rounded-md bg-forest px-4 py-2 font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60";
const secondary =
  "rounded-md border border-hairline px-4 py-2 font-medium text-ink transition-colors hover:border-forest";

type Mine = {
  token: string;
  quantity: number;
  amount?: number | null;
  shipTo?: string | null;
};
type MineMap = Record<string, Mine[]>;

function useMyClaims(weddingId: string) {
  const key = `yd-registry:${weddingId}`;
  const [mine, setMine] = useState<MineMap>({});
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(key) ?? "{}");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reads browser storage once mounted
      if (saved && typeof saved === "object") setMine(saved);
    } catch {
      // Private window or blocked storage: claims still work, just without undo here.
    }
  }, [key]);
  function save(next: MineMap) {
    setMine(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // As above.
    }
  }
  return [mine, save] as const;
}

function Dialog({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-card p-6 shadow-xl sm:max-w-md sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-xl font-semibold text-forest">
            {title}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 -mt-1 px-2 text-2xl leading-none text-ink/40 hover:text-ink"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function GiftPicture({ gift }: { gift: PublicRegistryGift }) {
  const src = safeUrl(gift.image_url);
  return (
    <div className="relative aspect-square overflow-hidden rounded-md bg-white">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- a store's own product photo, any host
        <img
          src={src}
          alt=""
          loading="lazy"
          className="h-full w-full object-contain p-3"
        />
      ) : (
        <div
          className="flex h-full items-center justify-center text-4xl text-ink/20"
          aria-hidden
        >
          🎁
        </div>
      )}
    </div>
  );
}

/* ---------- Gifts ---------- */

function ClaimGiftDialog({
  gift,
  remaining,
  coupleNames,
  onClaimed,
  onClose,
}: {
  gift: PublicRegistryGift;
  remaining: number;
  coupleNames: string;
  onClaimed: (mine: Mine) => void;
  onClose: () => void;
}) {
  const [error, setError] = useState<string>();
  const [done, setDone] = useState<Mine | null>(null);
  const [isPending, startTransition] = useTransition();
  const buyUrl = safeUrl(gift.url);
  const store = gift.store ?? storeFromUrl(gift.url);

  function submit(formData: FormData) {
    formData.set("gift_id", gift.id);
    startTransition(async () => {
      const result = await claimRegistryGift(formData);
      if (result.error || !result.token) {
        setError(result.error);
        return;
      }
      const mine = {
        token: result.token,
        quantity: Number(formData.get("quantity")) || 1,
        shipTo: result.shipTo,
      };
      setDone(mine);
      onClaimed(mine);
    });
  }

  if (done) {
    return (
      <Dialog title="It's yours" onClose={onClose}>
        <p className="mt-3 text-ink/80">
          We&apos;ve marked <strong>{gift.title}</strong> as taken, so nobody
          else will buy it.
        </p>
        {done.shipTo && (
          <div className="mt-4 rounded-md border border-hairline bg-parchment px-4 py-3 text-sm">
            <p className="text-xs uppercase tracking-wide text-ink/50">
              Ship it to
            </p>
            <p className="mt-1 whitespace-pre-line text-ink">{done.shipTo}</p>
          </div>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          {buyUrl && (
            <a
              href={buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={primary}
            >
              Buy it{store ? ` at ${store}` : ""} ↗
            </a>
          )}
          <button onClick={onClose} className={secondary}>
            Done
          </button>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog title="I'm getting this" onClose={onClose}>
      <p className="mt-2 text-sm text-ink/70">
        Tell {coupleNames || "the couple"} it&apos;s you, and we&apos;ll mark it
        as taken so no one else buys the same thing.
      </p>
      <div className="mt-4 flex gap-4">
        <div className="w-20 shrink-0">
          <GiftPicture gift={gift} />
        </div>
        <div>
          <p className="font-medium text-ink">{gift.title}</p>
          <p className="text-sm text-ink/60">
            {[store, gift.price != null ? usd(gift.price) : null]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      </div>
      <form action={submit} className="mt-5 flex flex-col gap-4">
        <input
          name="website"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden
        />
        <label className="flex flex-col gap-1 text-sm text-ink">
          Your name
          <input
            name="guest_name"
            required
            autoComplete="name"
            maxLength={120}
            className={inputClass}
          />
        </label>
        {remaining > 1 && (
          <label className="flex flex-col gap-1 text-sm text-ink">
            How many?
            <select name="quantity" defaultValue="1" className={inputClass}>
              {Array.from({ length: remaining }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} of {remaining} still needed
                </option>
              ))}
            </select>
          </label>
        )}
        {error && <p className="text-sm text-red-800">{error}</p>}
        <button
          type="submit"
          disabled={isPending}
          className={`${primary} w-full`}
        >
          {isPending ? "Saving..." : "Count me in"}
        </button>
      </form>
    </Dialog>
  );
}

function GiftCard({
  gift,
  remaining,
  mine,
  onClaim,
  onUndo,
}: {
  gift: PublicRegistryGift;
  remaining: number;
  mine: Mine[] | undefined;
  onClaim: () => void;
  onUndo: () => void;
}) {
  const store = gift.store ?? storeFromUrl(gift.url);
  const buyUrl = safeUrl(gift.url);
  const taken = remaining <= 0;
  const yours = mine?.reduce((n, m) => n + m.quantity, 0) ?? 0;

  return (
    <div
      className={`flex gap-3 rounded-lg border border-hairline bg-card p-3 sm:flex-col sm:gap-0 ${taken && !yours ? "opacity-60" : ""}`}
    >
      <div className="relative w-24 shrink-0 self-start sm:w-auto sm:self-auto">
        <GiftPicture gift={gift} />
        {(taken || yours > 0) && (
          <span className="absolute left-2 top-2 whitespace-nowrap rounded-full bg-forest px-2 py-0.5 text-[11px] font-medium text-parchment">
            {yours > 0 ? "Yours ✓" : "Taken"}
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="line-clamp-2 font-medium leading-snug text-ink sm:mt-3">
          {gift.title}
        </p>
        <p className="mt-0.5 text-sm text-ink/60">
          {[store, gift.price != null ? usd(gift.price) : null]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {gift.note && (
          <p className="mt-1 text-sm italic text-ink/60">“{gift.note}”</p>
        )}
        {gift.quantity > 1 && !taken && (
          <p className="mt-1 text-xs text-ink/50">
            {remaining} of {gift.quantity} still needed
          </p>
        )}
        <div className="mt-auto flex flex-col items-center gap-2 pt-3">
          {!taken && (
            <button
              onClick={onClaim}
              className={`${primary} w-full px-2 text-sm`}
            >
              I&apos;m getting this
            </button>
          )}
          {yours > 0 && buyUrl && (
            <a
              href={buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${secondary} w-full px-2 text-center text-sm`}
            >
              Buy it{store ? ` at ${store}` : ""} ↗
            </a>
          )}
          {yours > 0 ? (
            <button
              onClick={onUndo}
              className="text-xs text-ink/50 hover:underline"
            >
              Not getting it after all? Undo
            </button>
          ) : (
            !taken &&
            buyUrl && (
              <a
                href={buyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-ink/50 hover:underline"
              >
                Just looking? See it{store ? ` at ${store}` : ""}
              </a>
            )
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Funds ---------- */

const AMOUNTS = [25, 50, 100, 250];

function FundDialog({
  fund,
  handles,
  coupleNames,
  onGiven,
  onClose,
}: {
  fund: PublicRegistryGift;
  handles: PayHandles;
  coupleNames: string;
  onGiven: (mine: Mine) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState<string>("50");
  const [error, setError] = useState<string>();
  const [sentWith, setSentWith] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const methods = payMethods(handles);
  const value = Number(amount.replace(/[$,]/g, "")) || null;
  const note = `${fund.title} 💛`;

  function record(label: string) {
    if (!name.trim()) {
      setError("Add your name first, so they know who to thank.");
      return false;
    }
    setError(undefined);
    const formData = new FormData();
    formData.set("gift_id", fund.id);
    formData.set("guest_name", name);
    if (value) formData.set("amount", String(value));
    startTransition(async () => {
      const result = await claimRegistryGift(formData);
      if (result.error || !result.token) {
        setError(result.error);
        return;
      }
      setSentWith(label);
      onGiven({ token: result.token, quantity: 1, amount: value });
    });
    return true;
  }

  if (sentWith) {
    return (
      <Dialog title="Thank you!" onClose={onClose}>
        <p className="mt-3 text-ink/80">
          {coupleNames || "The couple"} will see that you gave
          {value ? ` ${usd(value)}` : ""} to <strong>{fund.title}</strong>.
          {sentWith !== "Zelle" &&
            ` Finish sending it in ${sentWith} if you haven't yet.`}
        </p>
        <button onClick={onClose} className={`${primary} mt-6`}>
          Done
        </button>
      </Dialog>
    );
  }

  return (
    <Dialog title={fund.title} onClose={onClose}>
      {fund.note && <p className="mt-2 text-sm text-ink/70">{fund.note}</p>}
      <div className="mt-5 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm text-ink">
          Your name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={120}
            autoComplete="name"
            className={inputClass}
          />
        </label>
        <div className="text-sm text-ink">
          Amount
          <div className="mt-1 flex flex-wrap gap-2">
            {AMOUNTS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAmount(String(a))}
                className={`rounded-full border px-3.5 py-1.5 ${amount === String(a) ? "border-forest bg-forest text-parchment" : "border-hairline text-ink hover:border-forest"}`}
              >
                ${a}
              </button>
            ))}
            <input
              value={AMOUNTS.includes(Number(amount)) ? "" : amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              placeholder="Other"
              aria-label="Other amount"
              className="w-24 rounded-full border border-hairline bg-parchment px-3.5 py-1.5 text-ink outline-none focus:border-forest"
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-800">{error}</p>}
        {methods.length === 0 ? (
          <p className="rounded-md bg-parchment px-4 py-3 text-sm text-ink/70">
            {coupleNames || "The couple"} haven&apos;t said how to send money
            yet. Check back soon.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {methods.map(({ method, handle }) => {
              const href = payLink(method, handle, value, note);
              return href ? (
                <a
                  key={method}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (!record(PAY_LABELS[method])) e.preventDefault();
                  }}
                  className={`${primary} text-center ${isPending ? "pointer-events-none opacity-60" : ""}`}
                >
                  Send{value ? ` ${usd(value)}` : ""} with {PAY_LABELS[method]}{" "}
                  ↗
                </a>
              ) : (
                <div
                  key={method}
                  className="rounded-md border border-hairline px-4 py-3 text-sm"
                >
                  <p className="text-ink">
                    Zelle to <strong className="select-all">{handle}</strong>
                  </p>
                  <button
                    onClick={() => record("Zelle")}
                    disabled={isPending}
                    className="mt-2 text-sm font-medium text-forest hover:underline disabled:opacity-60"
                  >
                    I&apos;ve sent it
                  </button>
                </div>
              );
            })}
          </div>
        )}
        <p className="text-xs text-ink/50">
          Money goes straight to {coupleNames || "the couple"}. You Do, I Do
          never touches it and takes no fee.
        </p>
      </div>
    </Dialog>
  );
}

function FundCard({
  fund,
  mine,
  onGive,
}: {
  fund: PublicRegistryGift;
  mine: Mine[] | undefined;
  onGive: () => void;
}) {
  const progress = fund.goal
    ? Math.min(100, Math.round((fund.raised / fund.goal) * 100))
    : null;
  const src = safeUrl(fund.image_url);
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-hairline bg-card sm:flex-row">
      {src && (
        // eslint-disable-next-line @next/next/no-img-element -- the couple's own photo, any host
        <img
          src={src}
          alt=""
          loading="lazy"
          className="h-40 w-full object-cover sm:h-auto sm:w-44"
        />
      )}
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs uppercase tracking-wide text-ink/50">Cash fund</p>
        <p className="mt-0.5 font-display text-lg font-semibold text-forest">
          {fund.title}
        </p>
        {fund.note && <p className="mt-1 text-sm text-ink/70">{fund.note}</p>}
        {progress !== null && (
          <div className="mt-3">
            <div className="h-2 overflow-hidden rounded-full bg-hairline">
              <div
                className="h-full rounded-full bg-forest"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-ink/50">
              {progress}% of the way there
            </p>
          </div>
        )}
        <div className="mt-auto flex items-center gap-3 pt-4">
          <button onClick={onGive} className={`${primary} text-sm`}>
            Give to this fund
          </button>
          {mine && mine.length > 0 && (
            <span className="text-xs text-ink/60">Thank you for giving 💛</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- The section ---------- */

export function RegistryView({
  weddingId,
  coupleNames,
  storeLinks,
  gifts,
  handles,
}: {
  weddingId: string;
  coupleNames: string;
  storeLinks: RegistryItem[];
  gifts: PublicRegistryGift[];
  handles: PayHandles;
}) {
  const [mine, setMine] = useMyClaims(weddingId);
  // Claims made or undone here since the page loaded; the next visit reads them fresh.
  const [adjust, setAdjust] = useState<Record<string, number>>({});
  const [open, setOpen] = useState<{ id: string } | null>(null);
  const [filter, setFilter] = useState<"needed" | "all">("needed");
  const [error, setError] = useState<string>();
  const [, startTransition] = useTransition();

  const funds = gifts.filter((g) => g.kind === "fund");
  const items = gifts.filter((g) => g.kind === "gift");
  const remainingOf = (g: PublicRegistryGift) =>
    g.quantity - g.claimed - (adjust[g.id] ?? 0);

  const shown = useMemo(() => {
    const left = (g: PublicRegistryGift) =>
      g.quantity - g.claimed - (adjust[g.id] ?? 0);
    const list =
      filter === "needed"
        ? items.filter((g) => left(g) > 0 || mine[g.id]?.length)
        : items;
    // Taken gifts drop to the end rather than vanishing, so "all" still reads as a registry.
    return [...list].sort(
      (a, b) => Number(left(a) <= 0) - Number(left(b) <= 0),
    );
  }, [items, filter, adjust, mine]);
  const neededCount = items.filter((g) => remainingOf(g) > 0).length;

  function claimed(giftId: string, claim: Mine) {
    setMine({ ...mine, [giftId]: [...(mine[giftId] ?? []), claim] });
    setAdjust((a) => ({ ...a, [giftId]: (a[giftId] ?? 0) + claim.quantity }));
  }

  function undo(gift: PublicRegistryGift) {
    const claims = mine[gift.id] ?? [];
    if (!confirm(`Undo — you're not getting "${gift.title}" after all?`))
      return;
    startTransition(async () => {
      for (const claim of claims) {
        const result = await releaseRegistryClaim(claim.token);
        if (result.error) {
          setError(result.error);
          return;
        }
      }
      const next = { ...mine };
      delete next[gift.id];
      setMine(next);
      setAdjust((a) => ({
        ...a,
        [gift.id]:
          (a[gift.id] ?? 0) - claims.reduce((n, c) => n + c.quantity, 0),
      }));
    });
  }

  const openGift = open ? gifts.find((g) => g.id === open.id) : undefined;

  return (
    <div className="mt-4 flex flex-col gap-8">
      {storeLinks.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {storeLinks.map((link) => {
            const href = safeUrl(link.url);
            const store = storeFromUrl(link.url);
            const body = (
              <>
                <span className="font-medium text-ink">{link.label}</span>
                {link.notes && (
                  <span className="block text-xs text-ink/60">
                    {link.notes}
                  </span>
                )}
                {!link.notes && store && store !== link.label && (
                  <span className="block text-xs text-ink/50">{store}</span>
                )}
              </>
            );
            return href ? (
              <a
                key={link.id}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-[10rem] flex-1 rounded-lg border border-hairline px-4 py-3 transition-colors hover:border-forest sm:flex-none"
              >
                {body} <span className="sr-only">(opens in a new tab)</span>
              </a>
            ) : (
              <div
                key={link.id}
                className="min-w-[10rem] flex-1 rounded-lg border border-hairline px-4 py-3 sm:flex-none"
              >
                {body}
              </div>
            );
          })}
        </div>
      )}

      {funds.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {funds.map((fund) => (
            <FundCard
              key={fund.id}
              fund={fund}
              mine={mine[fund.id]}
              onGive={() => setOpen({ id: fund.id })}
            />
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink/70">
              Tap <strong>I&apos;m getting this</strong> before you buy, so no
              one doubles up.
            </p>
            <div
              className="flex rounded-full border border-hairline p-0.5 text-sm"
              role="tablist"
            >
              {(
                [
                  ["needed", `Still needed (${neededCount})`],
                  ["all", `All (${items.length})`],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={filter === key}
                  onClick={() => setFilter(key)}
                  className={`rounded-full px-3 py-1 ${filter === key ? "bg-forest text-parchment" : "text-ink/70"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="mt-3 text-sm text-red-800">{error}</p>}
          {shown.length === 0 ? (
            <p className="mt-6 text-center text-ink/60">
              Every gift has been claimed. Thank you all!
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {shown.map((gift) => (
                <GiftCard
                  key={gift.id}
                  gift={gift}
                  remaining={remainingOf(gift)}
                  mine={mine[gift.id]}
                  onClaim={() => setOpen({ id: gift.id })}
                  onUndo={() => undo(gift)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {openGift?.kind === "gift" && (
        <ClaimGiftDialog
          gift={openGift}
          remaining={remainingOf(openGift)}
          coupleNames={coupleNames}
          onClaimed={(claim) => claimed(openGift.id, claim)}
          onClose={() => setOpen(null)}
        />
      )}
      {openGift?.kind === "fund" && (
        <FundDialog
          fund={openGift}
          handles={handles}
          coupleNames={coupleNames}
          onGiven={(claim) => claimed(openGift.id, claim)}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}
