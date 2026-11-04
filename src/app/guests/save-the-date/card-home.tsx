"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CardSvg } from "@/components/save-the-date/card-svg";
import { FONTS_HREF } from "@/lib/save-the-date/fonts";
import { FAMILIES, SHORT, TEMPLATES, newCard, templateById } from "@/lib/save-the-date/templates";
import type { CardDoc } from "@/lib/save-the-date/types";

/**
 * The save-the-date home: the couple's card on the left of the top row with
 * its sending status, then every design, drawn with their own names, date and
 * photo, to start from. Picking one opens the studio on it; their words and
 * photo carry over, and Undo there brings the old design back.
 */
export function CardHome({
  card: initial,
  updatedAt,
  canEdit,
  sent,
  opened,
}: {
  card: CardDoc;
  updatedAt: string | null;
  canEdit: boolean;
  sent: number;
  opened: number;
}) {
  const card = useMeasured(initial);
  const [family, setFamily] = useState<string | null>(null);
  const shown = family ? TEMPLATES.filter((t) => t.family === family) : TEMPLATES;
  const started = Boolean(updatedAt);

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
    <div className="flex flex-col">
      <link rel="stylesheet" href={FONTS_HREF} precedence="default" />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-semibold text-forest sm:text-4xl">Your save the date</h1>
          <p className="mt-1 text-ink/60">
            {!started
              ? "We've started one with your details. Open it, or pick any design below."
              : sent
                ? `Sent to ${sent} ${sent === 1 ? "guest" : "guests"}${opened ? `, ${opened} opened` : ""}.`
                : "Not sent yet. Send it by email or share each guest's link when you're happy."}
          </p>
        </div>
        <div className="flex shrink-0 gap-2.5">
          <Link
            href="/guests/save-the-date/edit"
            className="flex h-11 items-center rounded-full border border-hairline bg-card px-5 text-sm font-medium text-ink hover:border-ink/30"
          >
            {started ? "Edit card" : "Open card"}
          </Link>
          {started && canEdit && (
            <Link
              href="/guests/save-the-date/send"
              className="flex h-11 items-center rounded-full bg-[#2243B6] px-5 text-sm font-medium text-white hover:bg-[#2243B6]/90"
            >
              {sent ? "Send more" : "Send"}
            </Link>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-x-3.5 gap-y-5 sm:grid-cols-3 sm:gap-6 lg:grid-cols-6">
        <Link href="/guests/save-the-date/edit" className="group flex min-w-0 flex-col">
          <span className="block overflow-hidden rounded-[10px] border border-hairline shadow-sm group-hover:border-ink/30">
            <CardSvg doc={card} className="block w-full" title="Your card" />
          </span>
          <span className="mt-2.5 flex min-w-0 items-center gap-2">
            <span className="truncate font-medium text-ink group-hover:underline">{templateById(card.template).name}</span>
            {sent > 0 && (
              <span className="shrink-0 rounded-full bg-[#FFD301] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#14203d]">
                Sent
              </span>
            )}
          </span>
          <span className="truncate text-[13px] text-ink/55" suppressHydrationWarning>
            {updatedAt ? `Edited ${ago(updatedAt)}` : "Not started yet"}
          </span>
        </Link>
      </div>

      <div className="mt-12 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="font-display text-2xl font-semibold text-forest sm:text-[28px]">
          {started ? "Try another design" : "Pick a design"}
        </h2>
        <p className="text-sm text-ink/55">
          {started ? "Your words and photo come with you, and Undo brings this one back." : `${TEMPLATES.length} designs, all with your names and date.`}
        </p>
      </div>
      <div className="-mx-4 mt-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filter designs by style">
        {chip("All", null)}
        {FAMILIES.map((f) => chip(SHORT[f] ?? f, f))}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-x-3.5 gap-y-5 sm:grid-cols-3 sm:gap-6 lg:grid-cols-6">
        {shown.map((t) => {
          const current = t.id === card.template;
          const preview: CardDoc = { ...newCard(t.id, card.content, card.photo, false), overrides: {} };
          return (
            <Link
              key={t.id}
              href={canEdit && !current ? `/guests/save-the-date/edit?t=${t.id}` : "/guests/save-the-date/edit"}
              className="group flex min-w-0 flex-col"
            >
              <span
                className={`block overflow-hidden rounded-[10px] ring-offset-2 transition ${current ? "ring-2 ring-[#2243B6]" : "ring-1 ring-ink/10 group-hover:ring-ink/30"}`}
              >
                <CardSvg doc={preview} className="block w-full" title={`${t.name} design`} />
              </span>
              <span className="mt-2.5 flex min-w-0 items-center gap-2">
                <span className="truncate font-medium text-ink">{t.name}</span>
                {current && <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-[#2243B6]">Yours</span>}
              </span>
              <span className="truncate text-[13px] text-ink/55">{t.family}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/** A starting photo comes without its proportions (aspect 0): read them before drawing. */
function useMeasured(initial: CardDoc): CardDoc {
  const [doc, setDoc] = useState(initial);
  useEffect(() => {
    const p = initial.photo;
    if (!p || p.aspect > 0) return;
    const img = new Image();
    img.onload = () => setDoc({ ...initial, photo: { ...p, aspect: img.naturalWidth / img.naturalHeight || 1 } });
    img.onerror = () => setDoc({ ...initial, photo: null });
    img.src = p.url;
  }, [initial]);
  return doc.photo && doc.photo.aspect === 0 ? { ...doc, photo: null } : doc;
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
