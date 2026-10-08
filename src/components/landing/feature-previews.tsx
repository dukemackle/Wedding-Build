"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { WrenMotto } from "@/components/wren-motto";
import { AskWrenTile } from "@/app/dashboard/ask-wren-tile";
import {
  DEFAULT_SITE_DESIGN,
  PALETTES,
  THEMES,
  fontById,
  fontsHref,
  fontsHrefFor,
  paletteColors,
  resolveDesign,
  type OrnamentId,
  type ThemeId,
} from "@/lib/site-design";
import { SiteOrnament } from "@/components/site-ornament";
import { ConfirmedChip } from "@/components/confirmed-badge";
import { CHECKLIST_PHASES, CHECKLIST_TEMPLATE } from "@/lib/checklist-template";
import {
  BarIcon,
  CakeIcon,
  CateringIcon,
  FloralsIcon,
  MusicIcon,
  PaperclipIcon,
  PhotographyIcon,
  VenueIcon,
} from "@/components/icons";

/*
 * A small working preview of each part of Wren, on sample data, opened from
 * its tile on the landing page so a visitor can try it before signing up.
 * Nothing here saves anywhere.
 */

const usd = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

/*
 * Each demo below is a small copy of its real page, laid out the way that
 * page is: the wide arrangement from md up (the dialog is ~1000px there), the
 * phone arrangement below it. `Bleed` lets a demo run edge to edge in the
 * dialog, as the real pages run edge to edge in the app.
 */
function Bleed({ children }: { children: ReactNode }) {
  return <div className="-mx-5 -my-6 sm:-mx-8">{children}</div>;
}

const eyebrow =
  "font-mono-numbers text-[10px] uppercase tracking-[0.16em] text-ink/50";

/* ---------- Budget ---------- */

// Example costs: per head for the parts that scale with the guest count,
// flat for the rest. Round numbers, labelled as an example on screen.
const BUDGET_LINES: {
  key: string;
  label: string;
  Icon: (p: { className?: string }) => ReactNode;
  perGuest?: number;
  flat?: number;
  actual?: number;
  paid?: number;
}[] = [
  { key: "venue", label: "Venue", Icon: VenueIcon, flat: 9000, actual: 9500, paid: 3000 },
  { key: "catering", label: "Catering", Icon: CateringIcon, perGuest: 85 },
  { key: "bar", label: "Bar", Icon: BarIcon, perGuest: 30 },
  { key: "photo", label: "Photography", Icon: PhotographyIcon, flat: 4200, actual: 4000, paid: 4000 },
  { key: "florals", label: "Florals", Icon: FloralsIcon, flat: 2800 },
  { key: "music", label: "Music", Icon: MusicIcon, flat: 2200, actual: 1800 },
  { key: "cake", label: "Cake", Icon: CakeIcon, perGuest: 6 },
];

const BUDGET_TARGET = 40000;
// Same colours as the real "Where it's going" bar (budget-summary.tsx).
const SLICE_COLORS = ["#0d8266", "#b07d0a", "#d2426b", "#3b76c4"];
const REST_COLOR = "#c2c7c0";
const BUDGET_COLS =
  "md:grid md:grid-cols-[minmax(0,1fr)_6rem_6.5rem_8.5rem] md:items-center md:gap-4";

/**
 * The linked-Google-Sheet strip from Guests and Budget, in miniature: edits
 * in the demo count up as changes since the last sync, and Sync now clears
 * them -- the same banner the real pages show (components/sheet-sync-bar).
 */
function DemoSheetStrip({
  title,
  changes,
  extra,
  onSync,
}: {
  title: string;
  changes: number;
  extra?: string;
  onSync: () => void;
}) {
  const [synced, setSynced] = useState(false);
  const pending = changes > 0;
  return (
    <div className="overflow-hidden rounded-lg border border-hairline bg-card text-sm shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
        <span className="min-w-0 text-ink">
          <svg viewBox="0 0 16 16" aria-hidden="true" className="mr-2 inline h-4 w-4 align-[-3px] text-forest" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2.5" y="2" width="11" height="12" rx="1.5" />
            <path d="M2.5 6h11M2.5 10h11M6.5 6v8" />
          </svg>
          Linked to <span className="font-medium text-forest">{title}</span>
          <span className="text-xs text-ink/55">
            {synced && !pending ? " · synced just now" : " · Google Sheet"}
          </span>
        </span>
        <button
          type="button"
          onClick={() => {
            onSync();
            setSynced(true);
          }}
          className="rounded-full bg-forest px-3 py-1 text-xs text-parchment hover:bg-forest/90"
        >
          Sync now
        </button>
      </div>
      {pending && (
        <p className="border-t border-brass/30 bg-brass/10 px-4 py-1.5 text-xs text-forest">
          <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-brass align-middle" aria-hidden="true" />
          {changes} change{changes === 1 ? "" : "s"} here since your last sync{extra ? ` (${extra})` : ""}
        </p>
      )}
    </div>
  );
}

function BudgetDemo() {
  const [guests, setGuests] = useState(120);
  const [actual, setActual] = useState<Record<string, number | undefined>>(
    Object.fromEntries(BUDGET_LINES.map((l) => [l.key, l.actual])),
  );
  const [paid, setPaid] = useState<Record<string, number>>(
    Object.fromEntries(BUDGET_LINES.map((l) => [l.key, l.paid ?? 0])),
  );
  const [syncedAt, setSyncedAt] = useState({ actual, paid });
  const sheetChanges = BUDGET_LINES.filter(
    (l) => actual[l.key] !== syncedAt.actual[l.key] || paid[l.key] !== syncedAt.paid[l.key],
  ).length;

  const rows = BUDGET_LINES.map((l) => {
    const estimate = l.perGuest ? l.perGuest * guests : (l.flat ?? 0);
    const a = actual[l.key];
    const amount = a ?? estimate;
    const p = paid[l.key] ?? 0;
    const pct = a ? Math.min(100, (p / a) * 100) : 0;
    return { ...l, estimate, a, amount, p, pct };
  });
  const projected = rows.reduce((s, r) => s + r.amount, 0);
  const actualSoFar = rows.reduce((s, r) => s + (r.a ?? 0), 0);
  const paidSoFar = rows.reduce((s, r) => s + r.p, 0);
  const remaining = BUDGET_TARGET - actualSoFar;
  const quoted = rows.filter((r) => r.a).length;

  const sorted = [...rows].sort((x, y) => y.amount - x.amount);
  const slices = [
    ...sorted.slice(0, 4).map((r, i) => ({
      key: r.key,
      label: r.label,
      color: SLICE_COLORS[i],
      pct: Math.round((r.amount / projected) * 100),
    })),
    {
      key: "rest",
      label: "Everything else",
      color: REST_COLOR,
      pct: Math.round(
        (sorted.slice(4).reduce((s, r) => s + r.amount, 0) / projected) * 100,
      ),
    },
  ];

  return (
    <Bleed>
      <div className="border-b border-hairline px-5 pt-4 sm:px-8">
        <DemoSheetStrip
          title="Our wedding budget"
          changes={sheetChanges}
          onSync={() => setSyncedAt({ actual, paid })}
        />
      </div>
      <div className="border-b border-hairline bg-gradient-to-b from-parchment/60 to-card px-5 py-5 sm:px-8">
        <div className={BUDGET_COLS.replace("md:items-center", "md:items-end")}>
          <div>
            <p className="font-display text-2xl font-semibold text-forest">
              Your budget
            </p>
            <label className="mt-2 flex items-center gap-3 text-sm text-ink/70">
              <span className="shrink-0">Guests</span>
              <input
                type="range"
                min={40}
                max={250}
                step={5}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full max-w-48 accent-[var(--color-forest)]"
              />
              <span className="font-mono-numbers font-semibold text-forest">
                {guests}
              </span>
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-6 md:contents">
            <div className="md:text-right">
              <p className={eyebrow}>Projected</p>
              <p className="mt-1 font-mono-numbers text-xl text-wren-deep md:text-2xl">
                {usd(projected)}
              </p>
            </div>
            <div className="md:text-right">
              <p className={eyebrow}>Actual so far</p>
              <p className="mt-1 font-mono-numbers text-xl text-brass md:text-2xl">
                {usd(actualSoFar)}
              </p>
              <p className="font-mono-numbers text-[11px] text-ink/55">
                {usd(paidSoFar)} paid
              </p>
            </div>
            <div className="min-w-[9rem] flex-1 md:border-l md:border-hairline md:pl-4">
              <p className={eyebrow}>Budget</p>
              <p className="mt-1 font-mono-numbers text-xl text-forest md:text-2xl">
                {usd(BUDGET_TARGET)}
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-forest/10">
                <div
                  className={`h-1.5 rounded-full transition-[width] ${remaining < 0 ? "bg-brass" : "bg-forest"}`}
                  style={{
                    width: `${Math.min(100, (actualSoFar / BUDGET_TARGET) * 100)}%`,
                  }}
                />
              </div>
              <p className="mt-1 font-mono-numbers text-[11px] text-ink/60">
                {usd(Math.abs(remaining))} {remaining < 0 ? "over" : "under"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 border-t border-hairline pt-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className={eyebrow}>Where it&apos;s going</p>
            <p className="font-mono-numbers text-[11px] text-ink/55">
              {quoted} of {rows.length} lines have a real number
            </p>
          </div>
          <div className="mt-2 flex h-3 gap-[2px]">
            {slices.map((s) => (
              <span
                key={s.key}
                className="transition-[width] first:rounded-l-full last:rounded-r-full"
                style={{ width: `${s.pct}%`, backgroundColor: s.color }}
              />
            ))}
          </div>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-ink/70">
            {slices.map((s) => (
              <span key={s.key} className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                {s.label}
                <span className="font-mono-numbers font-medium text-ink">
                  {s.pct}%
                </span>
              </span>
            ))}
          </p>
        </div>
      </div>

      <div
        className={`hidden border-b border-hairline bg-parchment/50 px-8 py-2 ${BUDGET_COLS}`}
      >
        <span className={eyebrow}>Category</span>
        <span className={`${eyebrow} text-right`}>Estimate</span>
        <span className={`${eyebrow} pr-2 text-right`}>Actual</span>
        <span className={eyebrow}>Paid</span>
      </div>

      <div className="px-5 sm:px-6">
        {rows.map((r) => (
          <div
            key={r.key}
            className={`border-b border-hairline px-1 py-2.5 last:border-b-0 md:px-2 ${BUDGET_COLS}`}
          >
            <div className="flex min-w-0 items-center gap-2">
              <r.Icon className="h-4 w-4 shrink-0 text-brass" />
              <span className="min-w-0 truncate text-ink">
                {r.label}
                {r.perGuest && (
                  <span className="text-ink/45"> · scales with guest count</span>
                )}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-3 pl-6 md:contents">
              <span className="font-mono-numbers text-sm text-ink/60 md:text-right">
                {usd(r.estimate)}
              </span>
              <input
                type="number"
                min={0}
                value={r.a ?? ""}
                placeholder="0"
                aria-label={`Actual cost for ${r.label}`}
                onChange={(e) =>
                  setActual((s) => ({
                    ...s,
                    [r.key]: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
                className="w-24 rounded-md border border-hairline bg-parchment px-2 py-1 text-right font-mono-numbers text-sm text-ink outline-none focus:border-forest md:justify-self-end"
              />
              <span className="flex flex-1 items-center gap-2 md:flex-none">
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-forest/10">
                  <span
                    className="block h-1.5 rounded-full bg-forest transition-[width]"
                    style={{ width: `${r.pct}%` }}
                  />
                </span>
                <span className="w-9 shrink-0 text-right font-mono-numbers text-[11px] text-ink/55">
                  {r.p <= 0 ? "—" : r.pct >= 100 ? "Paid" : `${Math.round(r.pct)}%`}
                </span>
                <button
                  type="button"
                  disabled={!r.a}
                  aria-pressed={r.pct >= 100}
                  aria-label={`Paid in full for ${r.label}`}
                  onClick={() =>
                    setPaid((s) => ({ ...s, [r.key]: r.pct >= 100 ? 0 : (r.a ?? 0) }))
                  }
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm transition-colors disabled:opacity-40 ${
                    r.pct >= 100
                      ? "border-forest bg-forest text-parchment"
                      : "border-hairline text-ink/30 hover:border-forest hover:text-forest"
                  }`}
                >
                  ✓
                </button>
              </span>
            </div>
          </div>
        ))}
        <p className="py-3 text-xs text-ink/50">
          Example numbers. Your account starts from real costs for your state,
          season and style.
        </p>
      </div>
    </Bleed>
  );
}

/* ---------- Seating ---------- */

type SideKey = "a" | "b" | "both";
const SIDE_COLORS: Record<SideKey, string> = {
  a: "#2243B6",
  b: "#e0a100",
  both: "#00BFFE",
};

const SEAT_GUESTS: { name: string; side: SideKey; plusOne?: boolean }[] = [
  { name: "Aunt May", side: "a" },
  { name: "Uncle Joe", side: "a", plusOne: true },
  { name: "Priya S.", side: "b" },
  { name: "Marcus T.", side: "b" },
  { name: "Grandma Rose", side: "a" },
  { name: "Lena O.", side: "both" },
  { name: "Theo R.", side: "b" },
];

const SEAT_TABLES = [
  { id: "head", name: "Head table", round: false, cap: 6, x: 30, y: 6, w: 40, h: 16 },
  { id: "t1", name: "Table 1", round: true, cap: 8, x: 6, y: 34, w: 21, h: 0 },
  { id: "t2", name: "Table 2", round: true, cap: 8, x: 73, y: 34, w: 21, h: 0 },
  { id: "t3", name: "Table 3", round: true, cap: 8, x: 6, y: 68, w: 21, h: 0 },
  { id: "t4", name: "Table 4", round: true, cap: 8, x: 73, y: 68, w: 21, h: 0 },
];

function SeatingDemo() {
  const [seats, setSeats] = useState<Record<string, string>>({
    "Priya S.": "t2",
    "Lena O.": "head",
  });
  const [picked, setPicked] = useState<string | null>(null);

  const seat = (name: string, table: string | null) => {
    if (!name) return;
    setSeats((s) => {
      const next = { ...s };
      if (table == null) delete next[name];
      else next[name] = table;
      return next;
    });
    setPicked(null);
  };

  const dropProps = (table: string) => ({
    onDragOver: (e: React.DragEvent) => e.preventDefault(),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      seat(e.dataTransfer.getData("text/plain"), table);
    },
    onClick: () => picked && seat(picked, table),
  });

  const unseated = SEAT_GUESTS.filter((g) => !seats[g.name]);

  return (
    <Bleed>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-5 py-3 sm:px-8">
        <p className="text-sm text-ink/70">
          {unseated.length} of {SEAT_GUESTS.length} guests still unassigned.
        </p>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-full border border-hairline bg-parchment p-1">
            {["Seating", "Whole Venue", "Rooms"].map((m, i) => (
              <span
                key={m}
                className={`rounded-full px-3 py-1 font-mono-numbers text-xs ${
                  i === 0 ? "bg-forest text-parchment" : "text-ink/60"
                }`}
              >
                {m}
              </span>
            ))}
          </div>
          <span className="hidden rounded-full bg-forest px-3 py-1.5 font-mono-numbers text-xs text-parchment sm:inline">
            + Add table
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4 sm:px-8 md:flex-row md:items-start">
        {/* The plan: tables where they stand in the room. */}
        <div className="relative aspect-[4/3] min-w-0 flex-1 rounded-lg border border-hairline bg-parchment">
          <div className="absolute left-[34%] top-[40%] flex h-[22%] w-[32%] items-center justify-center rounded-md border-2 border-dashed border-forest/25 font-mono-numbers text-[10px] uppercase tracking-[0.15em] text-ink/40">
            Dance floor
          </div>
          {SEAT_TABLES.map((t) => {
            const here = SEAT_GUESTS.filter((g) => seats[g.name] === t.id);
            return (
              <div
                key={t.id}
                {...dropProps(t.id)}
                style={{
                  left: `${t.x}%`,
                  top: `${t.y}%`,
                  width: `${t.w}%`,
                  ...(t.round ? { aspectRatio: "1" } : { height: `${t.h}%` }),
                }}
                className={`absolute flex flex-col items-center justify-center gap-0.5 overflow-hidden border-2 bg-card p-1 text-center shadow-sm transition-colors ${
                  t.round ? "rounded-full" : "rounded-lg"
                } ${picked ? "cursor-copy border-brass" : "border-forest/30"}`}
              >
                <p className="text-[11px] font-medium leading-tight text-ink md:text-xs">
                  {t.name}
                </p>
                <p className="font-mono-numbers text-[9px] text-ink/50 md:text-[10px]">
                  {here.length}/{t.cap}
                  <span className="hidden md:inline"> seated</span>
                </p>
                <div className="hidden flex-wrap justify-center gap-0.5 md:flex">
                  {here.slice(0, 2).map((g) => (
                    <span
                      key={g.name}
                      className="rounded-full border border-hairline bg-parchment px-1.5 text-[10px] text-ink"
                    >
                      {g.name.split(" ")[0]}
                    </span>
                  ))}
                  {here.length > 2 && (
                    <span className="text-[10px] text-ink/50">+{here.length - 2}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Guests to seat: beside the plan on a wide screen, under it on a phone. */}
        <div className="w-full shrink-0 rounded-lg border border-hairline bg-parchment md:w-60">
          <div className="flex items-baseline justify-between gap-2 border-b border-hairline px-4 py-3">
            <p className="font-display text-lg font-semibold text-forest">
              Guests to seat
            </p>
            <span className="font-mono-numbers text-xs text-ink/50">
              {unseated.length}
            </span>
          </div>
          {unseated.length === 0 ? (
            <p className="p-4 text-sm text-ink/60">Everyone has a seat.</p>
          ) : (
            unseated.map((g) => (
              <button
                key={g.name}
                type="button"
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text/plain", g.name)}
                onClick={() => setPicked(picked === g.name ? null : g.name)}
                className={`flex w-full cursor-grab items-center gap-2 border-b border-hairline px-4 py-2 text-left last:border-b-0 ${
                  picked === g.name ? "bg-forest/10" : "hover:bg-card"
                }`}
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: SIDE_COLORS[g.side] }}
                />
                <span className="truncate text-sm text-ink">{g.name}</span>
                {g.plusOne && <span className="text-xs text-ink/50">+1</span>}
              </button>
            ))
          )}
          <p className="border-t border-hairline px-4 py-2 text-xs text-ink/50">
            Drag a guest onto a table, or tap a guest and then a table.
          </p>
        </div>
      </div>
    </Bleed>
  );
}

/* ---------- Checklist ---------- */

// The real stages and tasks, from the same template a new plan is built from,
// dated back from a sample wedding.
const DEMO_WEDDING = new Date("2027-06-12T00:00:00");
const DEMO_STAGES = CHECKLIST_PHASES.slice(0, 4).map((phase) => ({
  ...phase,
  tasks: CHECKLIST_TEMPLATE.filter((t) => t.phase === phase.key)
    .slice(0, 4)
    .map((t) => ({
      title: t.title,
      due: new Date(
        DEMO_WEDDING.getTime() - t.weeksBefore * 7 * 86400000,
      ).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    })),
}));

function ChecklistDemo() {
  const [done, setDone] = useState<Set<string>>(
    () =>
      new Set([
        ...DEMO_STAGES[0].tasks.map((t) => t.title),
        DEMO_STAGES[1].tasks[0].title,
      ]),
  );
  const [picked, setPicked] = useState<string | null>(null);
  const [openStages, setOpenStages] = useState<Set<string>>(new Set());

  const stages = DEMO_STAGES.map((s) => {
    const d = s.tasks.filter((t) => done.has(t.title)).length;
    return { ...s, done: d, left: s.tasks.length - d, isDone: d === s.tasks.length };
  });
  const currentKey = stages.find((s) => s.left > 0)?.key;
  const activeKey = picked ?? currentKey ?? stages[0].key;
  const active = stages.find((s) => s.key === activeKey)!;
  const total = stages.reduce((n, s) => n + s.tasks.length, 0);
  const doneCount = stages.reduce((n, s) => n + s.done, 0);

  const toggle = (title: string) =>
    setDone((s) => {
      const next = new Set(s);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });

  const row = (t: { title: string; due: string }) => {
    const on = done.has(t.title);
    return (
      <div
        key={t.title}
        className="flex items-start gap-3 border-b border-hairline py-3 last:border-b-0"
      >
        <button
          type="button"
          onClick={() => toggle(t.title)}
          aria-label={on ? "Mark as not done" : "Mark as done"}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
            on ? "border-forest bg-forest text-parchment" : "border-hairline hover:border-forest"
          }`}
        >
          {on && <Tick className="h-3 w-3" />}
        </button>
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <span className={on ? "text-ink/50 line-through" : "text-ink"}>
            {t.title}
          </span>
          <span className="rounded-full border border-hairline px-2 py-0.5 text-xs text-ink/60">
            Due {t.due}
          </span>
        </div>
      </div>
    );
  };

  const hereTag = (
    <span className="font-mono-numbers text-[10px] uppercase tracking-[0.18em] text-brass">
      You&apos;re here
    </span>
  );

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-hairline pb-4">
        <div>
          <p className="font-display text-2xl font-semibold text-forest">Your plan</p>
          <p className="mt-1 text-sm text-ink/70">
            {doneCount} of {total} tasks done
          </p>
          <div className="mt-2 h-2 w-48 overflow-hidden rounded-full bg-forest/10">
            <div
              className="h-2 rounded-full bg-forest transition-[width]"
              style={{ width: `${(doneCount / total) * 100}%` }}
            />
          </div>
        </div>
        <span className="rounded-full bg-forest px-4 py-1.5 font-mono-numbers text-sm text-parchment">
          + Add task
        </span>
      </div>

      {/* Phone: the stages as an accordion, the one you're on open. */}
      <div className="mt-4 flex flex-col gap-3 md:hidden">
        {stages.map((s) => {
          const isCurrent = s.key === currentKey;
          const isOpen = isCurrent || openStages.has(s.key);
          return (
            <section
              key={s.key}
              className={`rounded-md border p-4 ${
                isCurrent
                  ? "border-forest/30 bg-parchment"
                  : s.isDone
                    ? "border-hairline bg-parchment/40"
                    : "border-hairline"
              }`}
            >
              <button
                type="button"
                onClick={() =>
                  !isCurrent &&
                  setOpenStages((o) => {
                    const next = new Set(o);
                    if (next.has(s.key)) next.delete(s.key);
                    else next.add(s.key);
                    return next;
                  })
                }
                className="flex w-full items-baseline justify-between gap-3 text-left"
              >
                <span className="min-w-0">
                  {isCurrent && hereTag}
                  <span
                    className={`flex items-baseline gap-2 font-display text-xl font-semibold ${s.isDone ? "text-forest/60" : "text-forest"}`}
                  >
                    {s.isDone && <Tick className="h-4 w-4 self-center" />}
                    {s.title}
                  </span>
                </span>
                <span className="shrink-0 font-mono-numbers text-xs text-ink/50">
                  {isCurrent ? `${s.left} left` : s.isDone ? `${s.done} done` : s.left}
                </span>
              </button>
              {isOpen && <div className="mt-2">{s.tasks.map(row)}</div>}
            </section>
          );
        })}
      </div>

      {/* Wide: the whole arc down the side, the stage you're on beside it. */}
      <div className="mt-5 hidden md:grid md:grid-cols-[220px_1fr] md:gap-8">
        <nav className="flex flex-col gap-0.5 border-r border-hairline pr-5">
          {stages.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setPicked(s.key)}
              className={`rounded-md px-3 py-2 text-left transition-colors ${
                s.key === activeKey ? "bg-forest/10" : "hover:bg-parchment"
              }`}
            >
              <span
                className={`flex items-center gap-1.5 font-display text-base ${
                  s.key === activeKey
                    ? "font-semibold text-forest"
                    : s.isDone
                      ? "text-forest/55"
                      : "text-ink/75"
                }`}
              >
                {s.isDone && <Tick className="h-4 w-4" />}
                {s.title}
              </span>
              <span className="mt-0.5 block font-mono-numbers text-[11px] text-ink/45">
                {s.isDone
                  ? `${s.done} done`
                  : s.key === currentKey
                    ? `${s.left} left · you're here`
                    : `${s.left} to do`}
              </span>
            </button>
          ))}
        </nav>
        <div className="min-w-0">
          {active.key === currentKey && hereTag}
          <p
            className={`flex items-center gap-2 font-display text-2xl font-semibold ${active.isDone ? "text-forest/60" : "text-forest"}`}
          >
            {active.isDone && <Tick className="h-5 w-5" />}
            {active.title}
          </p>
          <p className="mt-1 text-sm text-ink/65">
            {active.isDone ? active.doneBlurb : active.blurb}
          </p>
          <div className="mt-3">{active.tasks.map(row)}</div>
        </div>
      </div>
    </div>
  );
}

function Tick({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}

/* ---------- Guests ---------- */

type DemoStatus = "confirmed" | "pending" | "declined" | "invited";
const STATUS_LABEL: Record<DemoStatus, string> = {
  confirmed: "Confirmed",
  pending: "No reply",
  declined: "Declined",
  invited: "Invited",
};
const STATUS_BADGE: Record<DemoStatus, string> = {
  invited: "border-hairline text-ink/70",
  confirmed: "border-forest/40 bg-forest/10 text-forest",
  declined: "border-red-200 bg-red-50 text-red-700",
  pending: "border-brass/40 bg-brass/10 text-brass",
};

const DEMO_GUESTS: {
  name: string;
  side: SideKey;
  group: string;
  status: DemoStatus;
  address?: string;
}[] = [
  { name: "Aunt May", side: "a", group: "Family", status: "confirmed", address: "Bend, OR" },
  { name: "Grandma Rose", side: "a", group: "Family", status: "confirmed", address: "Salem, OR" },
  { name: "Uncle Joe", side: "a", group: "Family", status: "pending", address: "Boise, ID" },
  { name: "Priya S.", side: "b", group: "Friends", status: "pending", address: "Austin, TX" },
  { name: "Marcus T.", side: "b", group: "Friends", status: "pending" },
  { name: "Lena O.", side: "both", group: "Friends", status: "confirmed", address: "Portland, OR" },
  { name: "Theo R.", side: "b", group: "Work", status: "declined" },
];

const INCOMING = [
  { name: "Priya S.", reply: "Joyfully accepts", meal: "Salmon", status: "confirmed" as const },
  { name: "Uncle Joe", reply: "Joyfully accepts", meal: "Chicken", status: "confirmed" as const },
];

function RsvpDemo() {
  const [status, setStatus] = useState<Record<string, DemoStatus>>(
    Object.fromEntries(DEMO_GUESTS.map((g) => [g.name, g.status])),
  );
  const [filter, setFilter] = useState<"none" | "pending" | "address">("none");
  const [syncedStatus, setSyncedStatus] = useState(status);
  const rsvpChanges = DEMO_GUESTS.filter((g) => status[g.name] !== syncedStatus[g.name]).length;
  const incoming = INCOMING.filter((r) => status[r.name] === "pending");

  const shown = DEMO_GUESTS.filter((g) =>
    filter === "pending"
      ? status[g.name] === "pending"
      : filter === "address"
        ? !g.address
        : true,
  );
  const confirmed = DEMO_GUESTS.filter((g) => status[g.name] === "confirmed").length;
  const pending = DEMO_GUESTS.filter((g) => status[g.name] === "pending").length;
  const noAddress = DEMO_GUESTS.filter((g) => !g.address).length;

  const chip = (key: typeof filter, label: string) => (
    <button
      type="button"
      onClick={() => setFilter((f) => (f === key ? "none" : key))}
      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
        filter === key
          ? "border-forest bg-forest text-parchment"
          : "border-hairline bg-parchment text-ink/80 hover:border-forest"
      }`}
    >
      {label}
    </button>
  );
  const badge = (s: DemoStatus) => (
    <span className={`rounded-full border px-2 py-0.5 text-xs ${STATUS_BADGE[s]}`}>
      {STATUS_LABEL[s]}
    </span>
  );

  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_260px] md:items-start">
      <div className="md:col-span-2">
        <DemoSheetStrip
          title="Our guest list"
          changes={rsvpChanges}
          extra={rsvpChanges > 0 ? `${rsvpChanges} RSVP${rsvpChanges === 1 ? "" : "s"}` : undefined}
          onSync={() => setSyncedStatus(status)}
        />
      </div>
      <div className="min-w-0 rounded-lg border border-hairline bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-hairline pb-3">
          <p className="text-sm text-ink/70">
            <span className="font-mono-numbers text-2xl text-forest">{confirmed}</span>{" "}
            confirmed
            <span className="hidden text-ink/45 sm:inline"> · feeds your Budget guest count</span>
          </p>
          <div className="flex gap-2">
            <span className="rounded-full bg-forest px-3 py-1 font-mono-numbers text-xs text-parchment">
              + Add guest
            </span>
            <span className="rounded-full border border-hairline bg-parchment px-3 py-1 font-mono-numbers text-xs text-ink">
              Import
            </span>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className={eyebrow}>Show</span>
          {chip("pending", `No reply (${pending})`)}
          {chip("address", `Missing address (${noAddress})`)}
        </div>

        {/* Wide: the table, one column per field. */}
        <table className="mt-3 hidden w-full table-fixed border-collapse text-left md:table">
          <thead>
            <tr className="border-b border-hairline font-mono-numbers text-[10px] uppercase tracking-[0.15em] text-ink/45">
              <th className="w-3" />
              <th className="px-2 py-2 font-normal">Name</th>
              <th className="w-20 px-2 py-2 font-normal">Group</th>
              <th className="w-28 px-2 py-2 font-normal">RSVP</th>
              <th className="w-28 px-2 py-2 font-normal">Address</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((g) => (
              <tr key={g.name} className="border-b border-hairline/70">
                <td className="border-l-4" style={{ borderLeftColor: SIDE_COLORS[g.side] }} />
                <td className="truncate px-2 py-2 text-sm text-ink">{g.name}</td>
                <td className="px-2 py-2 text-xs text-ink/70">{g.group}</td>
                <td className="px-2 py-2">{badge(status[g.name])}</td>
                <td className="truncate px-2 py-2 text-xs">
                  {g.address ? (
                    <span className="text-ink/70">
                      <span className="text-forest">✓</span> {g.address}
                    </span>
                  ) : (
                    <span className="text-red-700/80">Missing</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Phone: one row per guest, the side as a dot. */}
        <ul className="mt-2 md:hidden">
          {shown.map((g) => (
            <li
              key={g.name}
              className="flex items-center justify-between gap-3 border-b border-hairline py-2.5 last:border-b-0"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: SIDE_COLORS[g.side] }}
                />
                <span className="truncate text-sm text-ink">{g.name}</span>
                {!g.address && <span className="text-[11px] text-red-700/80">No address</span>}
              </span>
              {badge(status[g.name])}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg border border-hairline bg-card p-4 shadow-sm">
        <p className="font-display text-xl font-semibold text-forest">
          Invitations &amp; RSVPs
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
          <span className="rounded-full bg-forest px-2.5 py-1 text-parchment">
            New RSVPs ({incoming.length})
          </span>
          <span className="rounded-full border border-hairline px-2.5 py-1 text-ink/60">
            Collect addresses
          </span>
        </div>
        {incoming.length === 0 ? (
          <p className="mt-4 text-sm text-ink/60">
            All caught up. Replies from your wedding site land here first.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {incoming.map((r) => (
              <li key={r.name} className="rounded-md border border-hairline bg-parchment p-3">
                <p className="text-sm font-medium text-ink">{r.name}</p>
                <p className="text-xs text-ink/60">
                  {r.reply} · {r.meal}
                </p>
                <button
                  type="button"
                  onClick={() => setStatus((s) => ({ ...s, [r.name]: r.status }))}
                  className="mt-2 rounded-full bg-forest px-3 py-1 text-xs text-parchment hover:bg-forest/90"
                >
                  Add to list
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ---------- Venues and Vendors: the map-and-results browser ---------- */

/*
 * A small copy of the real Venues/Vendors screen (search-shell.tsx): a filter
 * bar on top, the map and the results side by side on a wide screen, and on a
 * phone the map as the page with the results in a sheet over its lower half.
 * The map is drawn, not Leaflet, so opening a demo pulls no tiles.
 */

type Pin = { id: string; x: number; y: number; label: string };

function MockMap({
  pins,
  active,
  onPin,
}: {
  pins: Pin[];
  active: string | null;
  onPin: (id: string | null) => void;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#eef3f6]">
      <svg
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <path d="M-10 210 C 80 180, 140 250, 230 215 S 360 170, 420 200 L 420 320 L -10 320 Z" fill="#d6ecf5" />
        <path d="M-10 210 C 80 180, 140 250, 230 215 S 360 170, 420 200" fill="none" stroke="#b9dfee" strokeWidth="3" />
        <rect x="40" y="40" width="70" height="50" rx="8" fill="#e3eedf" />
        <rect x="270" y="70" width="90" height="60" rx="10" fill="#e3eedf" />
        <g stroke="#fff" strokeWidth="7" fill="none">
          <path d="M0 120 H400" />
          <path d="M150 0 V300" />
          <path d="M0 40 L400 160" />
        </g>
        <g stroke="#fff" strokeWidth="3" fill="none">
          <path d="M0 70 H400" />
          <path d="M240 0 V300" />
          <path d="M80 0 V300" />
          <path d="M320 0 V210" />
          <path d="M0 170 H400" />
        </g>
      </svg>
      {pins.map((p) => (
        <button
          key={p.id}
          type="button"
          onMouseEnter={() => onPin(p.id)}
          onMouseLeave={() => onPin(null)}
          onFocus={() => onPin(p.id)}
          onBlur={() => onPin(null)}
          aria-label={p.label}
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
          className={`absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border-2 border-white px-2 py-0.5 text-[11px] font-bold shadow-md transition-transform ${
            active === p.id
              ? "z-10 scale-110 bg-brass text-forest"
              : "bg-forest text-white"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

function MockBrowser({
  search,
  filters,
  count,
  noun,
  pins,
  active,
  onActive,
  children,
}: {
  search: string;
  filters: ReactNode;
  count: number;
  noun: string;
  pins: Pin[];
  active: string | null;
  onActive: (id: string | null) => void;
  children: ReactNode;
}) {
  const results = (
    <>
      <p className="px-3 pt-2 text-center font-display text-base font-semibold text-forest md:border-b md:border-hairline md:py-2 md:text-left">
        {count} {noun}
        {count === 1 ? "" : "s"}
      </p>
      <div className="grid grid-cols-2 gap-2 p-3">{children}</div>
    </>
  );
  return (
    <div className="-mx-5 -my-6 flex flex-col sm:-mx-8">
      <div className="flex flex-wrap items-center gap-2 border-b border-hairline bg-card px-4 py-2.5">
        <div className="min-w-0 flex-1 rounded-full border border-hairline px-4 py-1.5 text-sm text-ink/45 md:max-w-56">
          {search}
        </div>
        <div className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
          {filters}
        </div>
      </div>
      {/* Phone: the map is the page, results in a sheet over its lower half.
          Wide: map left, results right, each its own column. */}
      <div className="relative h-[26rem] md:flex md:h-[24rem]">
        <div className="absolute inset-0 md:relative md:w-[55%] md:shrink-0">
          <MockMap pins={pins} active={active} onPin={onActive} />
        </div>
        <div className="absolute inset-x-0 bottom-0 flex h-[58%] flex-col rounded-t-2xl border-t border-hairline bg-card shadow-[0_-6px_24px_rgb(20_32_61/0.18)] md:static md:h-auto md:flex-1 md:rounded-none md:border-l md:border-t-0 md:shadow-none">
          <div className="mx-auto mt-2 h-1.5 w-10 shrink-0 rounded-full bg-hairline md:hidden" />
          <div className="min-h-0 flex-1 overflow-y-auto">{results}</div>
        </div>
      </div>
    </div>
  );
}

function FilterPill({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1 text-sm transition-colors ${
        on
          ? "border-forest bg-forest text-parchment"
          : "border-hairline bg-card text-ink/70 hover:border-forest"
      }`}
    >
      {children}
    </button>
  );
}

const VENUES = [
  { id: "juniper", confirmed: true, name: "Juniper Barn", kind: "Barn", setting: "Indoor & outdoor", src: "/venue-types/barn-rustic.svg", guests: 180, price: 9000, x: 22, y: 30 },
  { id: "harbor", name: "Harbor House", kind: "Waterfront", setting: "Outdoor", src: "/venue-types/beach-waterfront.svg", guests: 140, price: 12500, x: 62, y: 68 },
  { id: "linden", confirmed: true, name: "The Linden Estate", kind: "Historic estate", setting: "Indoor", src: "/venue-types/historic-estate.svg", guests: 220, price: 16000, x: 78, y: 32 },
  { id: "rosewood", name: "Rosewood Garden", kind: "Garden", setting: "Outdoor", src: "/venue-types/garden-outdoor.svg", guests: 120, price: 7500, x: 40, y: 50 },
  { id: "grand", name: "The Grand Hotel", kind: "Ballroom", setting: "Indoor", src: "/venue-types/ballroom-hotel.svg", guests: 300, price: 21000, x: 52, y: 18 },
  { id: "vine", name: "Cedar Vine Winery", kind: "Vineyard", setting: "Indoor & outdoor", src: "/venue-types/restaurant-vineyard.svg", guests: 160, price: 11000, x: 12, y: 60 },
];

function VenuesDemo() {
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [min, setMin] = useState(0);
  const [active, setActive] = useState<string | null>(null);
  const shown = VENUES.filter((v) => v.guests >= min);
  const toggle = (id: string) =>
    setSaved((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  return (
    <MockBrowser
      search="Austin, TX"
      count={shown.length}
      noun="venue"
      active={active}
      onActive={setActive}
      pins={shown.map((v) => ({ id: v.id, x: v.x, y: v.y, label: `${v.guests}` }))}
      filters={
        <>
          {[0, 150, 200].map((n) => (
            <FilterPill key={n} on={min === n} onClick={() => setMin(n)}>
              {n === 0 ? "Any size" : `${n}+ guests`}
            </FilterPill>
          ))}
          <span className="shrink-0 self-center whitespace-nowrap rounded-full bg-brass/15 px-3 py-1 text-sm text-forest">
            ♥ {saved.size} saved
          </span>
        </>
      }
    >
      {shown.map((v) => (
        <div
          key={v.id}
          onMouseEnter={() => setActive(v.id)}
          onMouseLeave={() => setActive(null)}
          className={`overflow-hidden rounded-xl border bg-card transition-colors ${
            active === v.id ? "border-forest" : "border-hairline"
          }`}
        >
          <div className="relative aspect-[16/9] bg-parchment">
            <Image src={v.src} alt="" fill sizes="220px" className="object-cover" />
            {"confirmed" in v && <ConfirmedChip className="absolute left-2 top-2" />}
            <button
              type="button"
              onClick={() => toggle(v.id)}
              aria-pressed={saved.has(v.id)}
              aria-label={`Shortlist ${v.name}`}
              className={`absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border text-sm ${
                saved.has(v.id)
                  ? "border-brass bg-brass text-forest"
                  : "border-hairline bg-card text-ink/50"
              }`}
            >
              ♥
            </button>
          </div>
          <div className="p-2.5">
            <p className="font-mono-numbers text-base font-bold tracking-tight text-ink">
              {v.guests} guests
            </p>
            <p className="text-xs text-ink/75">
              {v.kind} · {v.setting}
            </p>
            <p className="text-xs text-ink/55">from {usd(v.price)}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.07em] text-ink/40">
              {v.name}
            </p>
          </div>
        </div>
      ))}
    </MockBrowser>
  );
}

const VENDOR_KINDS = ["Photography", "Florals", "Catering", "Music"];

const VENDORS = [
  { id: "fern", name: "Fern & Field Photo", kind: "Photography", note: "Film and digital · 8 hr packages", x: 30, y: 28 },
  { id: "lumen", name: "Lumen Studio", kind: "Photography", note: "Documentary style · second shooter", x: 70, y: 55 },
  { id: "wild", name: "Wildflower Co.", kind: "Florals", note: "Seasonal, locally grown", x: 45, y: 62 },
  { id: "honey", name: "The Honey Pot", kind: "Catering", note: "Family-style and buffet", x: 60, y: 22 },
  { id: "marlowe", name: "DJ Marlowe", kind: "Music", note: "DJ and ceremony sound", x: 18, y: 50 },
  { id: "strings", name: "Bluebonnet Strings", kind: "Music", note: "Quartet for the ceremony", x: 82, y: 38 },
];

function VendorsDemo() {
  const [kind, setKind] = useState<string | null>(null);
  const [sent, setSent] = useState<Set<string>>(new Set(["fern"]));
  const [active, setActive] = useState<string | null>(null);
  const shown = VENDORS.filter((v) => !kind || v.kind === kind);
  return (
    <MockBrowser
      search="Austin, TX"
      count={shown.length}
      noun="vendor"
      active={active}
      onActive={setActive}
      pins={shown.map((v) => ({ id: v.id, x: v.x, y: v.y, label: v.kind }))}
      filters={
        <>
          <FilterPill on={kind === null} onClick={() => setKind(null)}>
            All
          </FilterPill>
          {VENDOR_KINDS.map((k) => (
            <FilterPill key={k} on={kind === k} onClick={() => setKind(k)}>
              {k}
            </FilterPill>
          ))}
        </>
      }
    >
      {shown.map((v) => {
        const done = sent.has(v.id);
        return (
          <div
            key={v.id}
            onMouseEnter={() => setActive(v.id)}
            onMouseLeave={() => setActive(null)}
            className={`flex flex-col rounded-xl border bg-card p-3 transition-colors ${
              active === v.id ? "border-forest" : "border-hairline"
            }`}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-brass">
              {v.kind}
            </p>
            <p className="mt-0.5 font-display text-base font-semibold leading-tight text-forest">
              {v.name}
            </p>
            <p className="mt-0.5 text-xs text-ink/60">{v.note}</p>
            <button
              type="button"
              disabled={done}
              onClick={() => setSent((s) => new Set(s).add(v.id))}
              className={`mt-2.5 w-full rounded-full border px-3 py-1.5 text-xs ${
                done
                  ? "border-forest/30 bg-forest/10 text-forest"
                  : "border-hairline text-ink hover:border-forest"
              }`}
            >
              {done ? "Inquiry sent ✓" : "Request a quote"}
            </button>
          </div>
        );
      })}
    </MockBrowser>
  );
}

/* ---------- Attire ---------- */

const ATTIRE_CATS = [
  { key: "dress", label: "Wedding Dresses", art: "/attire-types/wedding-dress.svg" },
  { key: "maids", label: "Bridesmaids", art: "/attire-types/bridesmaid-dress.svg" },
  { key: "suit", label: "Suits & Tuxedos", art: "/attire-types/groom-attire.svg" },
  { key: "groomsmen", label: "Groomsmen", art: "/attire-types/groomsmen-attire.svg" },
  { key: "her", label: "Her Ring", art: "/attire-types/ring-her.svg" },
  { key: "him", label: "His Ring", art: "/attire-types/ring-him.svg" },
];

const ATTIRE_ITEMS = [
  { id: "a1", cat: "dress", name: "Juniper A-line", maker: "Maison Lark · A-line", buy: 1800, rent: 450, colors: ["#fbf8f1", "#f3e6d8"], badge: "New" },
  { id: "a2", cat: "suit", name: "Navy slim suit", maker: "Harbor Tailors · Slim fit", buy: 650, rent: 160, colors: ["#14203d", "#3a3a3a"] },
  { id: "a3", cat: "maids", name: "Chiffon wrap dress", maker: "Wildflower · Wrap", buy: 180, rent: 60, colors: ["#2243B6", "#00BFFE", "#FFD301"] },
  { id: "a4", cat: "her", name: "Oval solitaire", maker: "Aurum · 14k gold", buy: 2400, colors: ["#FFD301", "#e5e4e2"] },
  { id: "a5", cat: "dress", name: "Linden sheath", maker: "Maison Lark · Sheath", buy: 1200, colors: ["#fbf8f1"] },
  { id: "a6", cat: "groomsmen", name: "Grey three-piece", maker: "Harbor Tailors · Classic", buy: 420, rent: 110, colors: ["#8a8f98", "#14203d"] },
  { id: "a7", cat: "him", name: "Brushed band", maker: "Aurum · Tungsten", buy: 380, colors: ["#8a8f98", "#FFD301"] },
  { id: "a8", cat: "suit", name: "Ivory dinner jacket", maker: "Harbor Tailors · Tux", buy: 790, rent: 190, colors: ["#fbf8f1", "#14203d"], badge: "Popular" },
];

function AttireDemo() {
  const [cat, setCat] = useState<string | null>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set(["a1"]));
  const [view, setView] = useState<"browse" | "saved">("browse");
  const shown = ATTIRE_ITEMS.filter((i) =>
    view === "saved" ? saved.has(i.id) : !cat || i.cat === cat,
  );
  const art = (c: string) => ATTIRE_CATS.find((x) => x.key === c)!.art;
  const toggle = (id: string) =>
    setSaved((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <Bleed>
      <div className="flex flex-col gap-3 border-b border-hairline bg-gradient-to-r from-[#f3efe6] to-[#f8f6f1] px-5 py-4 sm:px-8 md:flex-row md:items-center md:justify-between">
        <p className="max-w-md text-sm text-ink/70">
          Gowns, suits, the whole party and the rings. Save what you love and
          dress the party from one board.
        </p>
        <div className="flex rounded-full border border-hairline bg-card p-1 shadow-sm">
          {(
            [
              ["browse", "Browse"],
              ["saved", "Saved"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setView(key)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-1.5 text-sm md:flex-none ${
                view === key ? "bg-forest font-medium text-parchment" : "text-ink/70 hover:text-forest"
              }`}
            >
              {label}
              {key === "saved" && saved.size > 0 && (
                <span className="rounded-full bg-brass/20 px-1.5 font-mono-numbers text-[11px]">
                  {saved.size}
                </span>
              )}
            </button>
          ))}
          <span className="flex flex-1 items-center justify-center px-4 py-1.5 text-sm text-ink/40 md:flex-none">
            Party board
          </span>
        </div>
      </div>

      {view === "browse" && (
        <div className="flex gap-4 overflow-x-auto px-5 pt-4 [scrollbar-width:none] sm:px-8 md:justify-center md:gap-6">
          {ATTIRE_CATS.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setCat(cat === c.key ? null : c.key)}
              className="flex w-[72px] shrink-0 flex-col items-center text-center md:w-[92px]"
            >
              <span
                className={`relative block h-16 w-16 overflow-hidden rounded-full border-2 bg-[#f1ece2] md:h-20 md:w-20 ${
                  cat === c.key ? "border-forest" : "border-transparent"
                }`}
              >
                <Image src={c.art} alt="" fill sizes="80px" className="object-contain p-2" />
              </span>
              <span
                className={`mt-1.5 text-[10px] font-medium uppercase leading-tight tracking-[0.12em] ${
                  cat === c.key ? "text-forest" : "text-ink/60"
                }`}
              >
                {c.label}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-x-3 gap-y-5 px-5 py-5 sm:px-8 md:grid-cols-4 md:gap-x-5">
        {shown.length === 0 && (
          <p className="col-span-full py-8 text-center text-sm text-ink/60">
            Tap the heart on anything you like and it lands here.
          </p>
        )}
        {shown.map((i) => (
          <article key={i.id} className="min-w-0">
            <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-[#f1ece2]">
              <Image src={art(i.cat)} alt="" fill sizes="200px" className="object-cover" />
              {i.badge && (
                <span className="absolute left-2 top-2 rounded bg-card/90 px-2 py-1 font-mono-numbers text-[10px] uppercase tracking-[0.14em] text-ink">
                  {i.badge}
                </span>
              )}
              <button
                type="button"
                onClick={() => toggle(i.id)}
                aria-pressed={saved.has(i.id)}
                aria-label={saved.has(i.id) ? "Remove from saved" : "Save"}
                className={`absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full shadow-sm ${
                  saved.has(i.id) ? "bg-forest text-parchment" : "bg-card/95 text-forest"
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill={saved.has(i.id) ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <p className="mt-2 truncate text-sm font-medium text-ink">{i.name}</p>
            <p className="truncate text-xs text-ink/55">{i.maker}</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5 font-mono-numbers text-[11px] text-ink/80">
              <span className="rounded-full border border-hairline px-2 py-0.5">
                Buy {usd(i.buy)}
              </span>
              {i.rent && (
                <span className="hidden rounded-full border border-hairline px-2 py-0.5 sm:inline">
                  Rent {usd(i.rent)}
                </span>
              )}
            </div>
            <div className="mt-1.5 flex gap-1">
              {i.colors.map((c) => (
                <span
                  key={c}
                  className="h-3 w-3 rounded-full border border-ink/15"
                  style={{ background: c }}
                />
              ))}
            </div>
          </article>
        ))}
      </div>
    </Bleed>
  );
}

/* ---------- Itinerary ---------- */

const DAYS = [
  {
    date: 11,
    label: "Friday, June 11",
    events: [
      { time: "5:00 – 6:00 PM", title: "Rehearsal", where: "Juniper Barn" },
      { time: "6:30 PM", title: "Rehearsal dinner", where: "The Honey Pot" },
    ],
  },
  {
    date: 12,
    label: "Saturday, June 12",
    wedding: true,
    events: [
      { time: "10:00 AM", title: "Hair & makeup", where: "Bridal suite" },
      { time: "2:00 PM", title: "First look & photos", where: "The orchard" },
      { time: "4:00 – 4:30 PM", title: "Ceremony", where: "Juniper Barn lawn" },
      { time: "6:00 PM", title: "Dinner & toasts", where: "The barn" },
    ],
  },
  {
    date: 13,
    label: "Sunday, June 13",
    events: [{ time: "10:30 AM", title: "Farewell brunch", where: "Harbor House" }],
  },
];

function ItineraryDemo() {
  const [picked, setPicked] = useState(12);
  // June 2027 starts on a Tuesday.
  const cells = [
    ...Array.from({ length: 2 }, () => null),
    ...Array.from({ length: 30 }, (_, i) => i + 1),
  ];
  return (
    <div className="grid gap-5 md:grid-cols-[210px_1fr]">
      <div className="hidden rounded-lg border border-hairline bg-card p-4 shadow-sm md:block">
        <p className="font-display text-lg font-semibold text-forest">June 2027</p>
        <div className="mt-2 grid grid-cols-7 gap-y-1 text-center font-mono-numbers text-[10px] text-ink/40">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-y-1 text-center font-mono-numbers text-xs">
          {cells.map((d, i) => {
            const has = DAYS.some((x) => x.date === d);
            return d == null ? (
              <span key={i} />
            ) : (
              <button
                key={i}
                type="button"
                onClick={() => has && setPicked(d)}
                className={`relative mx-auto flex h-7 w-7 items-center justify-center rounded-full ${
                  d === picked
                    ? "bg-forest text-parchment"
                    : d === 12
                      ? "ring-1 ring-brass text-ink"
                      : "text-ink/70"
                }`}
              >
                {d}
                {has && d !== picked && (
                  <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-brass" />
                )}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-ink/50">Pick a date to add an event to that day.</p>
      </div>

      <div className="min-w-0">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm text-ink/60">3 days scheduled, side by side below.</p>
          <span className="shrink-0 whitespace-nowrap rounded-full bg-forest px-4 py-1.5 font-mono-numbers text-sm text-parchment">
            + Add event
          </span>
        </div>
        {/* Wide: the days as columns. Phone: the same columns, swiped. */}
        <div className="-mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
          {DAYS.map((day) => (
            <div
              key={day.date}
              onClick={() => setPicked(day.date)}
              className={`w-[78%] shrink-0 snap-start rounded-lg border bg-card p-3 shadow-sm transition-colors md:w-auto ${
                picked === day.date ? "border-forest/50" : "border-hairline"
              }`}
            >
              <div className="mb-2 border-b border-hairline pb-2">
                <p className="font-display text-base font-semibold text-forest">
                  {day.label}
                </p>
                {day.wedding && (
                  <span className="font-mono-numbers text-[11px] uppercase tracking-wide text-brass">
                    Wedding day
                  </span>
                )}
              </div>
              {day.events.map((e) => (
                <div key={e.title} className="border-b border-hairline py-2.5 last:border-b-0">
                  <p className="font-mono-numbers text-[11px] text-brass">{e.time}</p>
                  <p className="mt-0.5 text-sm text-ink">{e.title}</p>
                  <p className="mt-0.5 text-xs text-ink/50">{e.where}</p>
                  <p className="mt-1 text-xs text-brass">Add to calendar</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Bookings ---------- */

const BOOKED = [
  {
    key: "venue",
    label: "Venue",
    Icon: VenueIcon,
    name: "Juniper Barn",
    meta: "Bend, OR · $9,500",
    contact: "events@juniperbarn.com",
    contract: "juniper-barn-agreement.pdf",
  },
  {
    key: "photo",
    label: "Photography",
    Icon: PhotographyIcon,
    name: "Lena Ortiz Photo",
    meta: "$4,000",
    contact: "(541) 555-0142",
    contract: "ortiz-photo-contract.pdf",
  },
  {
    key: "catering",
    label: "Catering",
    Icon: CateringIcon,
    name: "Fig & Salt Catering",
    meta: "$10,200",
    contact: "hello@figandsalt.com",
    contract: null,
  },
];

const STILL_NEED = [
  { label: "Florals", Icon: FloralsIcon },
  { label: "Music", Icon: MusicIcon },
  { label: "Cake", Icon: CakeIcon },
];

function BookingsDemo() {
  const [uploaded, setUploaded] = useState<Set<string>>(new Set());
  const section = "rounded-lg border border-hairline bg-card p-4 shadow-sm";
  return (
    <div>
      <p className="text-sm text-ink/70">
        Who you&apos;ve booked, who you&apos;re still talking to, and every contract.{" "}
        <span className="font-mono-numbers text-ink">3 of 6 booked</span>
      </p>
      <div className="mt-4 grid gap-5 md:grid-cols-[minmax(0,1fr)_230px] md:items-start">
        <section>
          <p className="font-display text-2xl font-semibold text-forest">Booked</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {BOOKED.map((b) => {
              const file = b.contract ?? (uploaded.has(b.key) ? "fig-and-salt-quote.pdf" : null);
              return (
                <div
                  key={b.key}
                  className="flex flex-col rounded-lg border border-forest/30 bg-card p-4 shadow-sm"
                >
                  <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-ink/50">
                    <b.Icon className="h-3.5 w-3.5 text-brass" />
                    {b.label}
                  </p>
                  <p className="mt-1 font-display text-xl font-semibold text-forest">{b.name}</p>
                  <p className="mt-0.5 text-sm text-ink/60">{b.meta}</p>
                  <p className="mt-1.5 text-sm text-brass">{b.contact}</p>
                  <div className="mt-3">
                    {file ? (
                      <div className="flex items-center gap-2 rounded-md border border-hairline px-3 py-2">
                        <PaperclipIcon className="h-4 w-4 shrink-0 text-forest" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm text-forest">{file}</span>
                          <span className="block font-mono-numbers text-[11px] text-ink/50">
                            {b.contract ? "Read by Wren · 3 dates added" : "Just uploaded"}
                          </span>
                        </span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setUploaded((s) => new Set(s).add(b.key))}
                        className="w-full rounded-full border border-dashed border-hairline py-2 text-sm text-ink/70 hover:border-forest hover:text-forest"
                      >
                        + Upload contract
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        <aside className="flex flex-col gap-4">
          <section className={section}>
            <p className="font-mono-numbers text-[11px] uppercase tracking-[0.18em] text-ink/50">
              Still need
            </p>
            <ul className="mt-2">
              {STILL_NEED.map((n) => (
                <li
                  key={n.label}
                  className="flex items-center justify-between gap-2 border-b border-hairline py-2 text-sm last:border-b-0"
                >
                  <span className="flex items-center gap-1.5 text-ink/80">
                    <n.Icon className="h-3.5 w-3.5 text-ink/40" />
                    {n.label}
                  </span>
                  <span className="text-xs text-brass">Browse &rarr;</span>
                </li>
              ))}
            </ul>
          </section>
          <section className={section}>
            <p className="font-mono-numbers text-[11px] uppercase tracking-[0.18em] text-ink/50">
              Still talking to
            </p>
            <div className="mt-2 flex flex-col">
              {[
                ["Wildflower Co.", "Florals · quote requested"],
                ["DJ Marlowe", "Music · replied"],
              ].map(([name, note]) => (
                <div key={name} className="border-b border-hairline py-2 last:border-b-0">
                  <p className="text-sm text-ink">{name}</p>
                  <p className="text-xs text-ink/50">{note}</p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

/* ---------- Wedding site ---------- */

const DEMO_THEMES = ["garden", "mountain", "ranch", "midnight"].map(
  (id) => THEMES.find((t) => t.id === id) ?? THEMES[0],
);

const DEMO_PALETTES = ["eucalyptus", "blush", "french-blue", "midnight-navy", "terracotta"].map(
  (id) => PALETTES.find((p) => p.id === id) ?? PALETTES[0],
);

const DEMO_ORNAMENTS: { id: OrnamentId; label: string }[] = [
  { id: "laurel", label: "Laurel" },
  { id: "crest", label: "Crest" },
  { id: "seal", label: "Wax seal" },
  { id: "none", label: "None" },
];

// Theme font first, then a few the names cycle through when clicked.
const DEMO_NAME_FONTS = [null, "greatvibes", "saintdelafield", "playfair"] as const;

function SiteDemo() {
  const [themeId, setThemeId] = useState<ThemeId>(DEMO_THEMES[0].id);
  const [paletteId, setPaletteId] = useState<string | null>(null);
  const [ornament, setOrnament] = useState<OrnamentId>("laurel");
  const [device, setDevice] = useState<"desktop" | "phone">("desktop");
  const [rsvped, setRsvped] = useState(false);
  const [namesFont, setNamesFont] = useState(0);
  const palette = DEMO_PALETTES.find((p) => p.id === paletteId);
  // The real resolver, so the demo mixes cards and muted text the way the site does.
  const { theme: t, accent, onAccent, heading } = resolveDesign({
    ...DEFAULT_SITE_DESIGN,
    theme: themeId,
    ...(palette ? paletteColors(palette) : {}),
  });
  const phone = device === "phone";

  const panel = (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <p className="font-display text-2xl font-semibold text-forest">Your guest site</p>
        <span className="rounded-full bg-forest/10 px-2 py-0.5 text-xs font-semibold text-forest">
          Live
        </span>
      </div>
      <div className="flex gap-1 rounded-lg bg-ink/[0.05] p-1">
        {["Theme", "Style", "Motion", "Sections"].map((label, i) => (
          <span
            key={label}
            className={`flex h-8 flex-1 items-center justify-center rounded-md text-xs ${
              i === 0 ? "bg-card font-semibold text-forest shadow-sm" : "text-ink/60"
            }`}
          >
            {label}
          </span>
        ))}
      </div>
      <p className={eyebrow}>Theme</p>
      <div className="grid grid-cols-2 gap-2.5">
        {DEMO_THEMES.map((x) => (
          <button
            key={x.id}
            type="button"
            onClick={() => {
              setThemeId(x.id);
              setPaletteId(null);
            }}
            aria-pressed={x.id === themeId}
            className={`overflow-hidden rounded-xl bg-card text-left ${
              x.id === themeId ? "ring-2 ring-forest" : "ring-1 ring-hairline"
            }`}
          >
            <span
              className="flex h-14 flex-col items-center justify-center gap-1.5"
              style={{ background: x.bg, color: x.ink }}
            >
              <span className="text-lg leading-none" style={{ fontFamily: x.display }}>
                Aa
              </span>
              <span className="flex gap-1">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: x.swatches[0] }} />
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: x.ink }} />
              </span>
            </span>
            <span className="block px-2.5 py-1.5 text-xs font-medium text-ink">{x.name}</span>
          </button>
        ))}
      </div>
      <p className={eyebrow}>Colour palette</p>
      <div className="flex flex-wrap gap-2">
        {DEMO_PALETTES.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPaletteId(p.id === paletteId ? null : p.id)}
            aria-label={p.name}
            aria-pressed={p.id === paletteId}
            title={p.name}
            className={`flex h-9 w-9 items-center justify-center rounded-full bg-card ${
              p.id === paletteId ? "ring-2 ring-forest" : "ring-1 ring-hairline"
            }`}
          >
            <span
              className="flex h-6 w-6 items-center justify-center rounded-full"
              style={{ background: p.bg, boxShadow: "inset 0 0 0 1px rgb(0 0 0 / 0.08)" }}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.accent }} />
            </span>
          </button>
        ))}
      </div>
      <p className={eyebrow}>Monogram</p>
      <div className="flex flex-wrap gap-1.5">
        {DEMO_ORNAMENTS.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => setOrnament(o.id)}
            aria-pressed={o.id === ornament}
            className={`h-8 rounded-full px-3 text-xs ${
              o.id === ornament ? "bg-forest text-parchment" : "bg-card text-ink/70 ring-1 ring-hairline"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Bleed>
      <link rel="stylesheet" href={fontsHref(DEMO_THEMES)} precedence="default" />
      <link
        rel="stylesheet"
        href={fontsHrefFor(DEMO_NAME_FONTS.flatMap((id) => (id ? [fontById(id)?.css ?? ""] : [])))}
        precedence="default"
      />
      <div className="flex flex-col-reverse md:flex-row">
        <aside className="border-t border-hairline bg-card px-5 py-5 sm:px-8 md:w-[300px] md:shrink-0 md:border-r md:border-t-0 md:px-5">
          {panel}
        </aside>
        <section className="flex min-w-0 flex-1 flex-col bg-[#eef0ec]">
          <div className="flex items-center gap-2 px-4 py-3">
            <div className="flex gap-1 rounded-lg border border-hairline bg-card p-1">
              {(
                [
                  ["desktop", "Computer"],
                  ["phone", "Phone"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={device === key}
                  onClick={() => setDevice(key)}
                  className={`h-7 rounded-md px-3 text-xs ${
                    device === key ? "bg-forest text-parchment" : "text-ink/70"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex-1" />
            <span className="hidden text-xs text-ink/60 sm:inline">All changes saved</span>
          </div>
          <div className="flex flex-1 items-start justify-center px-4 pb-5">
            <div
              className={`w-full overflow-hidden border border-hairline bg-card shadow-md transition-[max-width] duration-300 ${
                phone ? "max-w-[250px] rounded-[1.6rem]" : "max-w-none rounded-lg"
              }`}
            >
              <div className="border-b border-hairline px-3 py-1.5 text-center font-mono-numbers text-[10px] text-ink/45">
                youdoido.com/w/juniper-and-sam
              </div>
              <div
                className={`flex flex-col items-center gap-2 text-center transition-colors duration-500 ${phone ? "px-4 py-8" : "px-6 py-10"}`}
                style={
                  {
                    background: t.bg,
                    color: t.ink,
                    fontFamily: t.body,
                    "--site-accent": accent,
                    "--site-on-accent": onAccent,
                    "--font-display": t.display,
                  } as React.CSSProperties
                }
              >
                <SiteOrnament kind={ornament} first="Juniper" second="Sam" />
                <p className="font-mono-numbers text-[10px] uppercase tracking-[0.25em]" style={{ color: t.muted }}>
                  June 12, 2027 · Bend, Oregon
                </p>
                {/* Like the real editor: click the words to restyle them. */}
                <button
                  type="button"
                  onClick={() => setNamesFont((i) => (i + 1) % DEMO_NAME_FONTS.length)}
                  title="Click to try another font"
                  className={`${phone ? "text-3xl" : "text-5xl"} rounded-sm outline-offset-4 hover:outline hover:outline-2 hover:outline-dashed hover:outline-[#2243B6]/60`}
                  style={{
                    fontFamily: fontById(DEMO_NAME_FONTS[namesFont])?.css ?? t.display,
                    fontStyle: t.italicNames && namesFont === 0 ? "italic" : "normal",
                    fontWeight: t.nameWeight,
                    color: heading,
                  }}
                >
                  Juniper &amp; Sam
                </button>
                <div className={`mt-3 grid w-full max-w-sm gap-2 ${phone ? "grid-cols-1" : "grid-cols-3"}`}>
                  {[
                    ["4pm", "Ceremony"],
                    ["5pm", "Cocktails"],
                    ["6pm", "Dinner"],
                  ].map(([time, label]) => (
                    <div key={label} className="py-2" style={{ background: t.surface, borderRadius: t.radius }}>
                      <p className="font-mono-numbers text-xs" style={{ color: accent }}>{time}</p>
                      <p className="text-xs" style={{ color: t.muted }}>{label}</p>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setRsvped(true)}
                  className="mt-4 px-6 py-2 text-lg"
                  style={{ background: accent, color: onAccent, borderRadius: t.radius, fontFamily: t.display }}
                >
                  {rsvped ? "See you there! ✓" : "RSVP"}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Bleed>
  );
}

/* ---------- Ask Wren ---------- */

const QUESTIONS = [
  {
    q: "What should we book next?",
    a: "Your florist — good ones book up about 9 months out, and you're at 11.",
  },
  {
    q: "Are we over budget?",
    a: "You're $8,800 under your $40,000 target on real numbers — $1,600 under once catering and the other open lines come in at their estimates.",
  },
  {
    q: "Who hasn't RSVP'd?",
    a: "46 guests are still waiting — mostly Sam's side. Want a reminder list?",
  },
  {
    q: "Add a florist task to our checklist",
    a: "I'll add \u201cBook your florist\u201d, due November 1. Go ahead?",
    action: "Added to your checklist ✓",
  },
];

function AskDemo() {
  const [chat, setChat] = useState<(typeof QUESTIONS)[number][]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const asked = new Set(chat.map((c) => c.q));
  return (
    <div className="flex flex-col gap-4">
      <div className="flex min-h-32 flex-col gap-2 rounded-xl border border-hairline bg-parchment p-4">
        {chat.length === 0 && (
          <p className="m-auto text-sm text-ink/45">Pick a question below.</p>
        )}
        {chat.map((c) => (
          <div key={c.q} className="flex flex-col gap-2">
            <span className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-card px-3 py-1.5 text-sm text-ink/80 shadow-sm">
              {c.q}
            </span>
            <span className="max-w-[85%] rounded-2xl rounded-bl-sm bg-wren px-3 py-1.5 text-sm text-ink">
              {c.a}
            </span>
            {"action" in c &&
              (confirmed ? (
                <span className="font-mono-numbers text-xs text-wren-deep">{c.action}</span>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmed(true)}
                  className="w-fit rounded-full bg-forest px-4 py-1.5 text-xs text-parchment hover:bg-forest/90"
                >
                  Yes, add it
                </button>
              ))}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {QUESTIONS.filter((c) => !asked.has(c.q)).map((c) => (
          <button
            key={c.q}
            type="button"
            onClick={() => setChat((h) => [...h, c])}
            className="rounded-full border border-hairline bg-card px-3 py-1.5 text-sm text-wren-deep hover:border-wren"
          >
            {c.q}
          </button>
        ))}
      </div>
      <p className="text-xs text-ink/50">
        Sample answers. In your account Wren reads your own budget, guests and
        checklist, and asks before it changes anything.
      </p>
    </div>
  );
}

/* ---------- The grid and the pop-up ---------- */

const PREVIEWS: Record<string, { heading: string; Demo: () => ReactNode }> = {
  budget: {
    heading: "Watch the budget move with your guest list",
    Demo: BudgetDemo,
  },
  guests: {
    heading: "Guests reply online, your list updates itself",
    Demo: RsvpDemo,
  },
  venues: {
    heading: "Shortlist the places you love",
    Demo: VenuesDemo,
  },
  vendors: {
    heading: "Reach every vendor from one list",
    Demo: VendorsDemo,
  },
  checklist: { heading: "Always know what's next", Demo: ChecklistDemo },
  attire: { heading: "Save what you love, then buy or rent", Demo: AttireDemo },
  itinerary: { heading: "The whole day, hour by hour", Demo: ItineraryDemo },
  "venue-layout": {
    heading: "Seat your guests by dragging them to a table",
    Demo: SeatingDemo,
  },
  bookings: { heading: "Every booking, with its contract", Demo: BookingsDemo },
  "guests/site": { heading: "Your own wedding website, free", Demo: SiteDemo },
  ask: { heading: "Ask Wren, or have Wren do it", Demo: AskDemo },
};

const ASK_ITEM = {
  id: "ask",
  title: "Ask Wren",
  blurb: "An assistant that knows your budget, guests and checklist.",
};

export type PreviewItem = {
  id: string;
  title: string;
  blurb?: string;
  tile: ReactNode;
};

/**
 * The feature tiles, each a button that opens a preview of that feature.
 * Two across on a phone, five on a wide screen, then the Ask Wren strip
 * across the full width, as on the dashboard.
 *
 * The preview is a centred dialog on a wide screen and a sheet up from the
 * bottom on a phone.
 */
export function PreviewGrid({ items }: { items: PreviewItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = openId === "ask" ? ASK_ITEM : items.find((i) => i.id === openId);
  const preview = openId ? PREVIEWS[openId] : null;

  useEffect(() => {
    if (!openId) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenId(null);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [openId]);

  const tileButton = (item: PreviewItem) => (
    <button
      key={item.id}
      type="button"
      onClick={() => setOpenId(item.id)}
      aria-label={`Preview ${item.title}`}
      className="grid rounded-2xl text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
    >
      {item.tile}
    </button>
  );

  return (
    <>
      {/* Every row the same height, so no tile is taller than its neighbours
          because of a longer blurb. */}
      <div className="grid auto-rows-fr grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-5">
        {items.map(tileButton)}
      </div>
      <div className="mt-3 sm:mt-5">
        <AskWrenTile onClick={() => setOpenId("ask")} />
      </div>

      {/* Portalled to <body>: the grid sits inside a fade-in whose transform
          would otherwise pin this "fixed" overlay to the grid, not the screen. */}
      {open &&
        preview &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
            <div
              className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
              onClick={() => setOpenId(null)}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="preview-title"
              className={`relative flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-card shadow-2xl sm:rounded-3xl ${
                openId === "ask" ? "sm:max-w-3xl" : "sm:max-w-5xl"
              }`}
            >
              <div className="flex items-start justify-between gap-4 border-b border-hairline px-5 pb-4 pt-5 sm:px-8 sm:pt-7">
                <div>
                  <p className="font-mono-numbers text-[10px] uppercase tracking-[0.25em] text-brass">
                    {open.title}
                  </p>
                  <h2
                    id="preview-title"
                    className="mt-1 font-display text-2xl font-semibold leading-tight text-forest sm:text-3xl"
                  >
                    {preview.heading}
                  </h2>
                  {open.blurb && (
                    <p className="mt-1 text-sm text-ink/60">{open.blurb}</p>
                  )}
                  {openId === "ask" && (
                    <p className="mt-1 text-sm text-ink/60">
                      <WrenMotto />
                    </p>
                  )}
                </div>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={() => setOpenId(null)}
                  aria-label="Close"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-hairline text-lg text-ink/60 hover:border-forest hover:text-forest"
                >
                  ×
                </button>
              </div>
              <div className="overflow-y-auto px-5 py-6 sm:px-8">
                <preview.Demo key={openId} />
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-hairline px-5 py-4 sm:px-8">
                <span className="text-xs text-ink/50">
                  Sample wedding · nothing here is saved
                </span>
                <Link
                  href="/signup"
                  className="shrink-0 rounded-full bg-forest px-5 py-2 font-display text-parchment hover:bg-forest/90"
                >
                  Start planning free
                </Link>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
