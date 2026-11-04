"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { CardSvg } from "@/components/save-the-date/card-svg";
import { actionFailed } from "@/lib/action-error";
import { FONTS_HREF } from "@/lib/save-the-date/fonts";
import { FAMILIES, MAX_CARDS, SHORT, TEMPLATES, newCard } from "@/lib/save-the-date/templates";
import type { CardContent, CardDoc, Photo } from "@/lib/save-the-date/types";
import { chooseCard, createCard, deleteCard, renameCard } from "./actions";
import type { Card } from "./load-card";

/**
 * The save-the-date home: every design the couple has made, the one guests
 * see marked, each with a menu; below, every template drawn with their own
 * names, date and photo. Picking a template makes a new design and opens it.
 */
export function CardHome({
  cards,
  canEdit,
  sent,
  opened,
  sample,
  bannerPhoto,
}: {
  cards: Card[];
  canEdit: boolean;
  sent: number;
  opened: number;
  /** Their words, for drawing the templates before they've made a card. */
  sample: CardContent;
  bannerPhoto: string | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [family, setFamily] = useState<string | null>(null);
  const banner = useAspect(cards.length ? null : bannerPhoto);
  const latest = cards[0]?.doc;
  const words = latest?.content ?? sample;
  const photo: Photo | null = latest ? latest.photo : banner;
  const chosen = cards.find((c) => c.chosen);
  const full = cards.length >= MAX_CARDS;
  const shown = family ? TEMPLATES.filter((t) => t.family === family) : TEMPLATES;

  const make = (from: { template?: string; copyOf?: string }) => {
    if (!canEdit) return;
    setError(null);
    start(async () => {
      const r = await createCard({ ...from, aspect: banner?.aspect }).catch(() => ({ error: actionFailed("reach the server") }) as { error?: string; id?: string });
      if (r.error || !r.id) setError(r.error ?? "Couldn't start that design.");
      else router.push(`/guests/save-the-date/edit/${r.id}`);
    });
  };

  const chip = (label: string, value: string | null) => (
    <button
      key={label}
      type="button"
      onClick={() => setFamily(value)}
      aria-pressed={family === value}
      className={`h-9 shrink-0 rounded-full border px-3.5 text-sm transition ${family === value ? "border-[#2243B6] bg-[#2243B6]/[0.06] font-medium text-[#2243B6]" : "border-hairline bg-card text-ink/70 hover:border-ink/25"}`}
    >
      {label}
    </button>
  );

  return (
    <div className={`flex flex-col ${pending ? "cursor-progress" : ""}`}>
      <link rel="stylesheet" href={FONTS_HREF} precedence="default" />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-semibold text-forest sm:text-4xl">Your save the dates</h1>
          <p className="mt-1 text-ink/60">
            {!cards.length
              ? "Pick a design to start. Make a few if you like, and send your favourite."
              : sent && chosen
                ? <>Sent to {sent} {sent === 1 ? "guest" : "guests"}{opened ? `, ${opened} opened` : ""}. Their links show &ldquo;{chosen.name}&rdquo;.</>
                : "Nothing sent yet. Open a design to finish it, then send the one you like best."}
          </p>
        </div>
        {cards.length > 0 && canEdit && (
          <Link
            href={`/guests/save-the-date/send${chosen ? `?card=${chosen.id}` : ""}`}
            className="flex h-11 shrink-0 items-center self-start rounded-full bg-[#2243B6] px-5 text-sm font-medium text-white hover:bg-[#2243B6]/90 sm:self-auto"
          >
            {sent ? "Send more" : "Send"}
          </Link>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-800">
          {error}
        </p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-x-3.5 gap-y-5 sm:grid-cols-3 sm:gap-6 lg:grid-cols-6">
        {cards.map((c) => (
          <CardTile
            key={c.id}
            card={c}
            sent={sent > 0}
            canEdit={canEdit}
            canAdd={!full}
            menuOpen={menuFor === c.id}
            onMenu={(open) => setMenuFor(open ? c.id : null)}
            onError={setError}
            onCopy={() => make({ copyOf: c.id })}
          />
        ))}
        {canEdit && !full && (
          <button
            type="button"
            disabled={pending}
            onClick={() => (cards.length ? document.getElementById("designs")?.scrollIntoView({ behavior: "smooth" }) : make({}))}
            className="group flex flex-col text-left"
          >
            <span className="flex aspect-[5/7] flex-col items-center justify-center rounded-[10px] border-[1.5px] border-dashed border-ink/20 bg-card px-3 text-center text-sm text-ink/60 group-hover:border-ink/40">
              <span className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-[#2243B6] text-2xl text-white">+</span>
              {cards.length ? "Start a new design" : "Start with your details"}
            </span>
          </button>
        )}
        {full && (
          <p className="col-span-2 self-center text-sm text-ink/60 sm:col-span-1">
            That&apos;s {MAX_CARDS} designs, the most you can keep. Delete one to start another.
          </p>
        )}
      </div>

      <div id="designs" className="mt-12 flex scroll-mt-24 flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="font-display text-2xl font-semibold text-forest sm:text-[28px]">Start from a template</h2>
        <p className="text-sm text-ink/55">{TEMPLATES.length} designs, drawn with your names and date.</p>
      </div>
      <div className="-mx-4 mt-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filter templates by style">
        {chip("All", null)}
        {FAMILIES.map((f) => chip(SHORT[f] ?? f, f))}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-x-3.5 gap-y-5 sm:grid-cols-3 sm:gap-6 lg:grid-cols-6">
        {shown.map((t) => {
          // With no photo of theirs, a photo design shows its sample so it reads as
          // one that takes a photo. Starting from it still leaves the photo empty.
          const preview: CardDoc = newCard(t.id, words, photo, true);
          return (
            <button
              key={t.id}
              type="button"
              disabled={pending || full || !canEdit}
              title={full ? `You can keep ${MAX_CARDS} designs. Delete one to start another.` : undefined}
              onClick={() => make({ template: t.id })}
              className="group flex min-w-0 flex-col text-left disabled:cursor-not-allowed"
            >
              <span className="block overflow-hidden rounded-[10px] ring-1 ring-ink/10 transition group-hover:ring-ink/30 group-disabled:group-hover:ring-ink/10">
                <CardSvg doc={preview} className="block w-full" title={`${t.name} template`} />
              </span>
              <span className="mt-2.5 truncate font-medium text-ink">{t.name}</span>
              <span className="truncate text-[13px] text-ink/55">{t.family}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CardTile({
  card: c,
  sent,
  canEdit,
  canAdd,
  menuOpen,
  onMenu,
  onError,
  onCopy,
}: {
  card: Card;
  sent: boolean;
  canEdit: boolean;
  canAdd: boolean;
  menuOpen: boolean;
  onMenu: (open: boolean) => void;
  onError: (message: string | null) => void;
  onCopy: () => void;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(c.name);
  const doc = useMeasured(c.doc);
  const href = `/guests/save-the-date/edit/${c.id}`;

  const run = (action: () => Promise<{ error?: string }>) => {
    onError(null);
    start(async () => {
      const r = await action().catch(() => ({ error: actionFailed("reach the server") }));
      if (r.error) return onError(r.error);
      onMenu(false);
      setRenaming(false);
      router.refresh();
    });
  };
  const item = "flex w-full items-center rounded-lg px-3 py-2.5 text-left text-[15px] hover:bg-ink/5 disabled:opacity-40 sm:py-2 sm:text-sm";

  return (
    <div className={`relative flex min-w-0 flex-col ${pending ? "opacity-60" : ""}`}>
      <Link href={href} className="group block">
        <span className="block overflow-hidden rounded-[10px] border border-hairline shadow-sm group-hover:border-ink/30">
          <CardSvg doc={doc} className="block w-full" title={c.name} />
        </span>
      </Link>
      {canEdit && (
        <button
          type="button"
          aria-label={`More for ${c.name}`}
          aria-expanded={menuOpen}
          onClick={() => onMenu(!menuOpen)}
          className="absolute right-2 top-2 flex h-8 w-10 items-center justify-center rounded-[10px] bg-white text-ink shadow-[0_1px_4px_rgba(0,0,0,0.15)] hover:bg-white/90"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <circle cx="5" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
          </svg>
        </button>
      )}
      <div className="mt-2.5 flex min-w-0 items-center gap-2">
        <Link href={href} className="truncate font-medium text-ink hover:underline">
          {c.name}
        </Link>
        {/* "Sent" only once guests have it; before that the marked card is just the one Send starts on. */}
        {c.chosen && sent && (
          <span className="shrink-0 rounded-full bg-[#FFD301] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#14203d]">
            Sent
          </span>
        )}
      </div>
      <span className="truncate text-[13px] text-ink/55" suppressHydrationWarning>
        Edited {ago(c.updatedAt)}
      </span>

      {menuOpen && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => {
              onMenu(false);
              setRenaming(false);
            }}
            className="fixed inset-0 z-40 cursor-default bg-[#14203d]/40 sm:bg-transparent"
          />
          <div
            role="menu"
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-[18px] bg-white px-2.5 pb-6 pt-2 text-ink shadow-[0_-10px_40px_rgba(20,32,61,0.3)] sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-2 sm:top-12 sm:w-60 sm:rounded-xl sm:p-1.5 sm:pb-1.5 sm:shadow-[0_8px_30px_rgba(20,32,61,0.2)]"
          >
            <span aria-hidden="true" className="mx-auto mb-2 block h-1 w-10 rounded bg-ink/20 sm:hidden" />
            <p className="truncate px-3 pb-1 text-xs font-medium text-ink/50 sm:hidden">{c.name}</p>
            {renaming ? (
              <form
                className="flex flex-col gap-2 p-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  run(() => renameCard(c.id, name));
                }}
              >
                <label className="text-xs font-medium text-ink/60" htmlFor={`name-${c.id}`}>
                  Name
                </label>
                <input
                  id={`name-${c.id}`}
                  autoFocus
                  value={name}
                  maxLength={60}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10 rounded-lg border border-hairline px-3 text-base text-ink sm:text-sm"
                />
                <button type="submit" disabled={pending} className="h-10 rounded-lg bg-[#2243B6] text-sm font-medium text-white">
                  Save name
                </button>
              </form>
            ) : (
              <>
                <Link role="menuitem" href={href} className={item}>
                  Open
                </Link>
                <Link role="menuitem" href={`/guests/save-the-date/send?card=${c.id}`} className={item}>
                  Send this one
                </Link>
                {!c.chosen && sent && (
                  <button
                    role="menuitem"
                    type="button"
                    disabled={pending}
                    className={item}
                    onClick={() => {
                      if (confirm(`Show “${c.name}” at every guest's link instead? Guests you've already sent to will see it too.`)) {
                        run(() => chooseCard(c.id));
                      }
                    }}
                  >
                    Show this at guests&apos; links
                  </button>
                )}
                <button role="menuitem" type="button" className={item} onClick={() => setRenaming(true)}>
                  Rename
                </button>
                <button
                  role="menuitem"
                  type="button"
                  disabled={pending || !canAdd}
                  className={item}
                  onClick={() => {
                    onMenu(false);
                    onCopy();
                  }}
                >
                  Duplicate
                </button>
                <div className="my-1 h-px bg-hairline" />
                <button
                  role="menuitem"
                  type="button"
                  disabled={pending}
                  className={`${item} text-red-700`}
                  onClick={() => {
                    if (confirm(`Delete “${c.name}”? This can't be undone.`)) run(() => deleteCard(c.id));
                  }}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/** A photo's proportions, read in the browser; null until known (or with no photo). */
function useAspect(url: string | null): Photo | null {
  const [photo, setPhoto] = useState<Photo | null>(null);
  useEffect(() => {
    if (!url) return;
    const img = new Image();
    img.onload = () =>
      setPhoto({ url, aspect: img.naturalWidth / img.naturalHeight || 1, fx: 50, fy: 50, zoom: 1, filter: "mono" });
    img.src = url;
  }, [url]);
  return url ? photo : null;
}

/** A card saved before its photo's proportions were known draws without the photo rather than break. */
function useMeasured(doc: CardDoc): CardDoc {
  return doc.photo && !(doc.photo.aspect > 0) ? { ...doc, photo: null } : doc;
}

/** "2 hours ago", "yesterday", "3 days ago". */
function ago(iso: string) {
  const seconds = (new Date(iso).getTime() - Date.now()) / 1000;
  const format = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [
    ["second", 60],
    ["minute", 60],
    ["hour", 24],
    ["day", 30],
    ["month", 12],
    ["year", Infinity],
  ];
  let value = seconds;
  for (const [unit, size] of steps) {
    if (Math.abs(value) < size) return unit === "second" ? "just now" : format.format(Math.round(value), unit);
    value /= size;
  }
  return "";
}
