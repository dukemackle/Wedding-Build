"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { VenueTypeIcon } from "@/components/venue-type-icon";
import { VendorCategoryIcon } from "@/components/vendor-category-icon";
import { WrenMotto } from "@/components/wren-motto";
import { WrenBirdIcon } from "@/components/icons";
import { planSeating } from "@/lib/auto-seat";
import { AskWrenTile } from "@/app/dashboard/ask-wren-tile";
import {
  DEFAULT_SITE_DESIGN,
  FALLING,
  FALLING_COLORS,
  NATURAL_SWATCH,
  PALETTES,
  THEMES,
  fontById,
  fontsHref,
  fontsHrefFor,
  paletteColors,
  resolveDesign,
  type FallingId,
  type OrnamentId,
  type ThemeId,
  type FallingColorId,
} from "@/lib/site-design";
import { Falling, useReducedMotion } from "@/components/site-motion";
import { SiteOrnament } from "@/components/site-ornament";
import { ConfirmedChip } from "@/components/confirmed-badge";
import { DayList, DayTimeline } from "@/components/itinerary-timeline";
import { findFlags, type TimelineEvent } from "@/lib/itinerary";
import type { EventAudience } from "@/lib/supabase/types";
import { SAMPLE_GALLERY } from "@/lib/sample-photos";
import { CHECKLIST_PHASES, CHECKLIST_TEMPLATE } from "@/lib/checklist-template";
import {
  DueChip,
  HereBadge,
  ProgressRing,
  StageIcon,
  StageLine,
  StageNode,
  TaskTick,
  type StageState,
} from "@/components/checklist-ui";
import {
  AttireIcon,
  BarIcon,
  CakeIcon,
  CateringIcon,
  FloralsIcon,
  MusicIcon,
  PaperclipIcon,
  PhotographyIcon,
  RingsIcon,
  ToastIcon,
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
  /** Discounts and credits, like the real Saved column. */
  saved?: number;
  section: string;
  /** Off the budget until tapped in, like the real "Couples often add" chips. */
  suggested?: boolean;
}[] = [
  { section: "Wedding day", key: "venue", label: "Venue", Icon: VenueIcon, flat: 9000, actual: 9500, paid: 3000, saved: 500 },
  { section: "Wedding day", key: "catering", label: "Catering", Icon: CateringIcon, perGuest: 85 },
  { section: "Wedding day", key: "bar", label: "Bar", Icon: BarIcon, perGuest: 30 },
  { section: "Wedding day", key: "photo", label: "Photography", Icon: PhotographyIcon, flat: 4200, actual: 4000, paid: 4000, saved: 400 },
  { section: "Wedding day", key: "florals", label: "Florals", Icon: FloralsIcon, flat: 2800 },
  { section: "Wedding day", key: "music", label: "Music", Icon: MusicIcon, flat: 2200, actual: 1800, paid: 900 },
  { section: "Wedding day", key: "cake", label: "Cake", Icon: CakeIcon, perGuest: 6 },
  { section: "Rehearsal & welcome", key: "rehearsal", label: "Rehearsal Dinner", Icon: ToastIcon, flat: 2400, actual: 2600, paid: 1300 },
  { section: "Rehearsal & welcome", key: "welcome", label: "Welcome Party", Icon: ToastIcon, perGuest: 10, suggested: true },
  { section: "Attire & rings", key: "attire", label: "Wedding Attire", Icon: AttireIcon, flat: 2500, actual: 2200, paid: 2200, saved: 150 },
  { section: "Attire & rings", key: "rings", label: "Wedding Rings", Icon: RingsIcon, flat: 1500 },
];
const BUDGET_SECTION_ORDER = ["Wedding day", "Rehearsal & welcome", "Attire & rings"];

/** The real budget's paid ring (budget-table.tsx), in miniature. */
function DemoPaidRing({ pct, Icon }: { pct: number; Icon: (p: { className?: string }) => ReactNode }) {
  const full = pct >= 100;
  const c = 2 * Math.PI * 16;
  return (
    <span className="relative inline-block h-9 w-9 shrink-0">
      <svg viewBox="0 0 36 36" aria-hidden="true" className="absolute inset-0 -rotate-90">
        <circle cx="18" cy="18" r="16" fill="none" stroke="#ece8df" strokeWidth="2.5" />
        {pct > 0 && (
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke={full ? "#FFD301" : "#2243B6"}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={`${(c * pct) / 100} ${c}`}
            className="transition-[stroke-dasharray] duration-700"
          />
        )}
      </svg>
      <span
        className={`absolute inset-[4px] flex items-center justify-center rounded-full ${
          full ? "bg-[#FFD301] text-forest" : "bg-[#fff8d1] text-[#9a6b00]"
        }`}
      >
        <Icon className="h-4 w-4" />
      </span>
    </span>
  );
}

const BUDGET_TARGET = 40000;
// Same colours as the real "Where it's going" bar (budget-summary.tsx).
const SLICE_COLORS = ["#0d8266", "#b07d0a", "#d2426b", "#3b76c4"];
const REST_COLOR = "#c2c7c0";
const BUDGET_COLS =
  "md:grid md:grid-cols-[minmax(0,1fr)_6rem_6.5rem_4.5rem_8.5rem] md:items-center md:gap-4";

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
  const [added, setAdded] = useState<Set<string>>(() => new Set());
  const sheetChanges = BUDGET_LINES.filter(
    (l) => actual[l.key] !== syncedAt.actual[l.key] || paid[l.key] !== syncedAt.paid[l.key],
  ).length;

  const rows = BUDGET_LINES.filter((l) => !l.suggested || added.has(l.key)).map((l) => {
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
            <p className="mt-2 inline-flex items-center gap-2 rounded-xl border border-[#f2dc6a] bg-gradient-to-br from-[#fffbe0] to-[#fff3b0] px-3 py-1">
              <span className="font-mono-numbers text-[10px] uppercase tracking-[0.16em] text-[#9a6b00]">
                ✦ You&apos;ve saved
              </span>
              <span className="font-mono-numbers font-semibold text-forest">
                {usd(rows.reduce((s, r) => s + (r.saved ?? 0), 0))}
              </span>
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
        <span className={`${eyebrow} text-right`}>Saved</span>
        <span className={eyebrow}>Paid</span>
      </div>

      <div className="px-5 sm:px-6">
        {BUDGET_SECTION_ORDER.map((section) => {
          const inSection = rows.filter((r) => r.section === section);
          const suggestions = BUDGET_LINES.filter(
            (l) => l.section === section && l.suggested && !added.has(l.key),
          );
          return (
            <div key={section}>
              <div className="flex items-baseline justify-between border-b border-hairline pb-2 pt-4">
                <span className="font-display text-xl font-bold text-forest">{section}</span>
                <span className="font-mono-numbers text-sm text-ink/70">
                  {usd(inSection.reduce((s, r) => s + r.amount, 0))}
                </span>
              </div>
              {inSection.map((r) => (
                <div
                  key={r.key}
                  className={`border-b border-hairline px-1 py-2.5 last:border-b-0 md:px-2 ${BUDGET_COLS}`}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <DemoPaidRing pct={r.pct} Icon={r.Icon} />
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
                    <span className="hidden font-mono-numbers text-sm text-[#9a6b00] md:block md:text-right">
                      {r.saved ? `−${usd(r.saved)}` : ""}
                    </span>
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
              {suggestions.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 border-t border-hairline bg-[#fffbe0]/60 px-2 py-2.5">
                  <span className="mr-1 text-xs font-medium text-ink/60">Couples often add</span>
                  {suggestions.map((l) => (
                    <button
                      key={l.key}
                      type="button"
                      onClick={() => setAdded((s) => new Set(s).add(l.key))}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#FFD301] bg-card px-3 py-1 text-xs font-medium text-forest transition-colors hover:bg-[#FFF12F]/40"
                    >
                      + {l.label}
                      <span className="font-mono-numbers font-normal text-ink/55">
                        ~{usd(l.perGuest ? l.perGuest * guests : (l.flat ?? 0))}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <p className="py-3 text-xs text-ink/50">
          Example numbers. Your account starts from estimates for your state,
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

const SEAT_GUESTS: { name: string; side: SideKey; plusOne?: boolean; household?: string }[] = [
  { name: "Aunt May", side: "a", household: "May & Joe" },
  { name: "Uncle Joe", side: "a", plusOne: true, household: "May & Joe" },
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

// The same rooms the real plan offers, reduced to a floor and a table look.
const DEMO_ROOMS = {
  barn: {
    floor: "repeating-linear-gradient(0deg, #c99a68 0 10px, #b98a5a 10px 11px, #c4935f 11px 21px, #a97c4f 21px 22px)",
    table: "#b98a5a",
    edge: "#7a5232",
    chair: "#8a5d36",
    dance: "repeating-conic-gradient(#a06c40 0 25%, #8e5e36 0 50%) 0 0 / 14px 14px",
    danceInk: "#fff6d6",
  },
  ballroom: {
    floor: "radial-gradient(circle, #2243B6 0 1.5px, transparent 2px) 0 0 / 22px 22px, #1d2d63",
    table: "#ffffff",
    edge: "#d9b44a",
    chair: "#d9b44a",
    dance: "repeating-conic-gradient(#f6f3ec 0 25%, #e7e0cf 0 50%) 0 0 / 18px 18px",
    danceInk: "#9a6b00",
  },
} as const;

function SeatingDemo() {
  const [room, setRoom] = useState<keyof typeof DEMO_ROOMS>("barn");
  const look = DEMO_ROOMS[room];
  const [seats, setSeats] = useState<Record<string, string>>({
    "Priya S.": "t2",
    "Lena O.": "head",
  });
  const [picked, setPicked] = useState<string | null>(null);
  const [ceremony, setCeremony] = useState(false);

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

  // The real "Seat the rest" rules, run on the demo's guests and tables.
  const seatTheRest = () => {
    const plan = planSeating(
      SEAT_GUESTS.map((g) => ({
        id: g.name,
        name: g.name,
        household: g.household ?? null,
        side: g.side,
        guest_type: null,
        plus_one: !!g.plusOne,
        table_id: seats[g.name] ?? null,
      })),
      SEAT_TABLES.map((t) => ({ id: t.id, name: t.name, capacity: t.cap })),
    );
    setSeats((s) => {
      const next = { ...s };
      for (const a of plan.assignments) for (const name of a.guestIds) next[name] = a.tableId;
      return next;
    });
    setPicked(null);
  };

  return (
    <Bleed>
      <div className="border-b border-hairline px-5 py-3 sm:px-8">
        <p className="text-sm text-ink/70">
          {unseated.length} of {SEAT_GUESTS.length} guests still unassigned.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="hidden rounded-full bg-forest px-3 py-1.5 font-mono-numbers text-xs text-parchment sm:inline">
            + Add table
          </span>
          <span className="hidden rounded-full border border-forest px-3 py-1.5 font-mono-numbers text-xs text-forest sm:inline">
            Layouts
          </span>
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
          <div className="inline-flex rounded-full border border-hairline bg-parchment p-1">
            {(["barn", "ballroom"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoom(r)}
                aria-pressed={room === r}
                className={`rounded-full px-3 py-1 text-xs capitalize ${
                  room === r ? "bg-forest text-parchment" : "text-ink/60"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 font-mono-numbers text-[10px] uppercase tracking-[0.2em] text-ink/50">
            Event
          </span>
          {["Ceremony", "Reception"].map((e, i) => {
            const on = ceremony ? i === 0 : i === 1;
            return (
              <button
                key={e}
                type="button"
                onClick={() => setCeremony(i === 0)}
                aria-pressed={on}
                className={`rounded-full border px-2.5 py-0.5 text-xs ${
                  on ? "border-forest bg-forest text-parchment" : "border-hairline text-ink/70 hover:border-forest/40"
                }`}
              >
                {e}
              </button>
            );
          })}
        </div>
      </div>

      {ceremony ? (
        <CeremonyDemo look={look} room={room} />
      ) : (
      <div className="flex flex-col gap-4 p-4 sm:px-8 md:flex-row md:items-start">
        {/* The plan: tables where they stand in the room. */}
        <div
          className="relative aspect-[4/3] min-w-0 flex-1 rounded-lg border-[6px]"
          style={{ background: look.floor, borderColor: room === "barn" ? "#5b3a22" : "#e7ddc4" }}
        >
          <div
            className="absolute left-[34%] top-[40%] flex h-[22%] w-[32%] items-center justify-center rounded-sm font-mono-numbers text-[10px] uppercase tracking-[0.15em] shadow-md"
            style={{ background: look.dance, color: look.danceInk }}
          >
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
                  background: look.table,
                  borderColor: picked ? undefined : look.edge,
                }}
                className={`absolute flex flex-col items-center justify-center gap-0.5 border-2 p-1 text-center shadow-md transition-colors ${
                  t.round ? "rounded-full" : "rounded-lg"
                } ${picked ? "cursor-copy border-brass" : ""}`}
              >
                {/* Chairs round the table; a seated guest's chair takes their side's colour. */}
                {Array.from({ length: t.cap }, (_, i) => {
                  const a = (i / t.cap) * Math.PI * 2 - Math.PI / 2;
                  const guest = here[i];
                  const pos = t.round
                    ? { left: `${50 + Math.cos(a) * 64}%`, top: `${50 + Math.sin(a) * 64}%` }
                    : {
                        left: `${((i % (t.cap / 2)) + 0.5) * (100 / (t.cap / 2))}%`,
                        top: i < t.cap / 2 ? "-22%" : "122%",
                      };
                  return (
                    <span
                      key={i}
                      aria-hidden
                      className="absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70"
                      style={{ ...pos, background: guest ? SIDE_COLORS[guest.side] : look.chair }}
                    />
                  );
                })}
                <p className="rounded-full bg-white/85 px-1.5 text-[11px] font-medium leading-tight text-ink md:text-xs">
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
          {unseated.length > 0 && (
            <div className="border-b border-hairline p-3">
              <button
                type="button"
                onClick={seatTheRest}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-forest px-3 py-2 text-sm font-medium text-parchment hover:bg-forest/90"
              >
                <WrenBirdIcon className="h-4 w-4 text-wren" />
                Seat the rest with Wren
              </button>
            </div>
          )}
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
      )}
    </Bleed>
  );
}

/**
 * The ceremony event: the "Classic aisle" ready-made layout, as it lands on
 * the plan -- the arch, rows either side of the aisle, the front row kept
 * for family.
 */
function CeremonyDemo({ look, room }: { look: (typeof DEMO_ROOMS)[keyof typeof DEMO_ROOMS]; room: keyof typeof DEMO_ROOMS }) {
  const rows = 6;
  const perSide = 6;
  const side = (key: string) => (
    <div key={key} className="flex flex-col gap-[6%]">
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="relative flex gap-1">
          {Array.from({ length: perSide }, (_, c) => (
            <span key={c} aria-hidden className="h-3 w-3 rounded-sm sm:h-3.5 sm:w-3.5" style={{ background: r === 0 ? "#FFD301" : look.chair }} />
          ))}
        </div>
      ))}
    </div>
  );
  return (
    <div className="flex flex-col gap-4 p-4 sm:px-8 md:flex-row md:items-start">
      <div
        className="relative flex aspect-[4/3] min-w-0 flex-1 flex-col items-center rounded-lg border-[6px] pt-[5%]"
        style={{ background: look.floor, borderColor: room === "barn" ? "#5b3a22" : "#e7ddc4" }}
      >
        <div className="flex w-full items-center justify-center">
          <span className="rounded-full px-6 py-1.5 font-mono-numbers text-[10px] uppercase tracking-[0.15em] shadow-md" style={{ background: look.table, color: room === "barn" ? "#fff6d6" : "#14203d" }}>
            Arch
          </span>
          <span className="absolute right-[5%] rounded-md bg-[#262626] sm:right-[14%] px-2 py-1 font-mono-numbers text-[9px] uppercase tracking-[0.15em] text-parchment">
            Musicians
          </span>
        </div>
        <span className="mt-[12%] rounded-full bg-forest/85 px-2 py-0.5 font-mono-numbers text-[9px] uppercase tracking-[0.15em] text-parchment">
          Reserved for family
        </span>
        <div className="mt-2 flex h-[48%] gap-[9%]">
          {side("left")}
          {side("right")}
        </div>
      </div>
      <div className="w-full shrink-0 rounded-lg border border-hairline bg-parchment p-4 md:w-60">
        <p className="font-display text-lg font-semibold text-forest">Classic aisle</p>
        <p className="mt-1 font-mono-numbers text-xs text-ink/70">6 rows of 12 · 72 chairs</p>
        <p className="mt-0.5 text-xs text-ink/60">About 40 × 40 ft, 6 ft aisle</p>
        <p className="mt-3 text-xs text-ink/60">
          Pick a ready-made ceremony sized to your guest list: straight rows, angled rows or two aisles, with a unity table if you want one.
        </p>
      </div>
    </div>
  );
}

/* ---------- Checklist ---------- */

// The real stages and tasks, from the same template a new plan is built from,
// dated back from a sample wedding a year out, so the due chips show
// their real colours (sky this month, gold within three, outlined later).
function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
const DEMO_WEDDING = new Date();
DEMO_WEDDING.setMonth(DEMO_WEDDING.getMonth() + 12);
const DEMO_STAGES = CHECKLIST_PHASES.slice(0, 4).map((phase) => ({
  ...phase,
  tasks: CHECKLIST_TEMPLATE.filter((t) => t.phase === phase.key)
    .slice(0, 4)
    .map((t) => ({
      title: t.title,
      due: isoDate(new Date(DEMO_WEDDING.getTime() - t.weeksBefore * 7 * 86400000)),
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
  const [justTicked, setJustTicked] = useState<string | null>(null);
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
  const stateOf = (s: (typeof stages)[number]): StageState =>
    s.isDone ? "done" : s.key === currentKey ? "here" : "todo";

  const toggle = (title: string) => {
    setJustTicked(done.has(title) ? null : title);
    setDone((s) => {
      const next = new Set(s);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

  const row = (t: { title: string; due: string }) => {
    const on = done.has(t.title);
    return (
      <div
        key={t.title}
        className="flex items-start gap-3 border-b border-hairline py-3.5 last:border-b-0"
      >
        <TaskTick on={on} justTicked={justTicked === t.title} onClick={() => toggle(t.title)} />
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2.5 gap-y-1.5">
          <span
            className={`text-base font-medium sm:text-[17px] ${
              on ? "text-ink/50 line-through decoration-[#FFD301] decoration-2" : "text-ink"
            }`}
          >
            {t.title}
          </span>
          <DueChip date={t.due} completed={on} />
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center gap-4 border-b border-hairline pb-4">
        <ProgressRing done={doneCount} total={total} size={72} />
        <div className="min-w-0 flex-1">
          <p className="font-display text-[28px] font-semibold leading-tight text-forest">Your plan</p>
          <p className="mt-0.5 text-[15px] text-ink/80">
            <strong className="font-semibold text-ink">
              {doneCount} of {total}
            </strong>{" "}
            tasks done
          </p>
        </div>
        <span className="btn-primary pointer-events-none max-sm:hidden">+ Add task</span>
      </div>

      {/* Phone: the journey as one column, the stage you're on open. */}
      <div className="mt-4 md:hidden">
        {stages.map((s, i) => {
          const state = stateOf(s);
          const isCurrent = state === "here";
          const isOpen = isCurrent || openStages.has(s.key);
          return (
            <section key={s.key} className="relative flex items-start gap-3.5 pb-4">
              {i < stages.length - 1 && <StageLine done={s.isDone} left={13.5} top={34} />}
              <StageNode state={state} num={String(i + 1)} size={30} />
              <div className="min-w-0 flex-1">
                {isCurrent ? (
                  <>
                    <HereBadge />
                    <p className="mt-2 font-display text-2xl font-semibold leading-tight text-forest">
                      {s.title}
                    </p>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setOpenStages((o) => {
                        const next = new Set(o);
                        if (next.has(s.key)) next.delete(s.key);
                        else next.add(s.key);
                        return next;
                      })
                    }
                    className="flex min-h-11 w-full items-center justify-between gap-2.5 text-left"
                  >
                    <span
                      className={`font-display text-xl font-semibold ${s.isDone ? "text-forest/60" : "text-forest"}`}
                    >
                      {s.title}
                    </span>
                    <span className="shrink-0 font-mono-numbers text-xs text-ink/70">
                      {s.isDone ? `${s.done} done` : `${s.left} to do`}
                    </span>
                  </button>
                )}
                {isOpen && <div className="mt-1">{s.tasks.map(row)}</div>}
              </div>
            </section>
          );
        })}
      </div>

      {/* Wide: the whole journey down the side, the stage you're on beside it. */}
      <div className="mt-5 hidden md:grid md:grid-cols-[240px_1fr] md:gap-7">
        <nav className="border-r border-hairline pr-4">
          {stages.map((s, i) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setPicked(s.key)}
              className={`relative flex w-full items-start gap-3.5 rounded-xl pb-4 pl-1 pr-2 pt-2 text-left transition-colors ${
                s.key === activeKey ? "bg-[#f3f5fc]" : "hover:bg-parchment"
              }`}
            >
              {i < stages.length - 1 && <StageLine done={s.isDone} left={18.5} top={44} />}
              <StageNode state={stateOf(s)} num={String(i + 1)} />
              <span className="min-w-0 pt-0.5">
                <span
                  className={`block font-display text-lg font-semibold leading-tight ${
                    s.isDone && s.key !== activeKey ? "text-forest/60" : "text-forest"
                  }`}
                >
                  {s.title}
                </span>
                <span className="mt-0.5 block font-mono-numbers text-xs text-ink/70">
                  {s.isDone
                    ? `${s.done} done`
                    : s.key === currentKey
                      ? `${s.left} left · you're here`
                      : `${s.left} to do`}
                </span>
              </span>
            </button>
          ))}
        </nav>
        <div className="min-w-0">
          <div className="flex items-start gap-4">
            <StageIcon phase={active.key} size={52} />
            <div className="min-w-0">
              {active.key === currentKey && <HereBadge />}
              <p className="mt-1.5 font-display text-[30px] font-semibold leading-tight text-forest">
                {active.title}
              </p>
            </div>
          </div>
          <p className="mt-2 text-[15px] text-ink/75">
            {active.isDone ? active.doneBlurb : active.blurb}
          </p>
          <div className="mt-2">{active.tasks.map(row)}</div>
        </div>
      </div>
    </div>
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
  { name: "Priya S.", reply: "Joyfully accepts", meal: "Salmon · Dietary: nut allergy", status: "confirmed" as const },
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
          {/* The real page's stage header, invites-out stage, in miniature. */}
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <p className="text-sm text-ink/70">
              <span className="font-display text-3xl font-semibold leading-none text-forest">{confirmed}</span>{" "}
              coming so far
              <span className="hidden text-ink/45 sm:inline"> · feeds your Budget guest count</span>
            </p>
            <div className="flex h-2.5 max-w-xs overflow-hidden rounded-full bg-[#F3F1EC]" aria-hidden="true">
              <div className="bg-[#2243B6]" style={{ width: `${(confirmed / DEMO_GUESTS.length) * 100}%` }} />
              <div
                className="bg-[#8A90A0]"
                style={{ width: `${(DEMO_GUESTS.filter((g) => status[g.name] === "declined").length / DEMO_GUESTS.length) * 100}%` }}
              />
            </div>
          </div>
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
        {/* Personal RSVP links (0141): a household's answers skip the queue. */}
        <div className="mt-3 rounded-md border border-forest/30 bg-forest/5 p-3">
          <p className="text-sm font-medium text-ink">The Alvarez household</p>
          <p className="text-xs text-ink/60">3 coming · 1 can&apos;t make it · via their invitation link</p>
          <p className="mt-1 font-mono-numbers text-[10px] uppercase tracking-[0.15em] text-forest">
            Already on your list
          </p>
        </div>
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

/** `iconOnly` pins (vendors) show just the icon; the label stays as the aria-label. */
type Pin = { id: string; x: number; y: number; label: string; icon?: ReactNode; iconOnly?: boolean };

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
          className={`absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 whitespace-nowrap rounded-full border-2 border-white text-[11px] font-bold shadow-md transition-transform ${
            p.iconOnly ? "p-0.5" : p.icon ? "py-0.5 pl-0.5 pr-2" : "px-2 py-0.5"
          } ${
            active === p.id
              ? p.icon
                ? "z-10 scale-110 bg-[#2243B6] text-white"
                : "z-10 scale-110 bg-brass text-forest"
              : "bg-forest text-white"
          }`}
        >
          {p.icon}
          {!p.iconOnly && p.label}
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
  { id: "juniper", confirmed: true, name: "Juniper Barn", kind: "Barn & Farm", setting: "Indoor & outdoor", src: "/venue-types/barn-rustic.svg", guests: 180, price: 9000, x: 22, y: 30 },
  { id: "harbor", name: "Harbor House", kind: "Beach & Coast", setting: "Outdoor", src: "/venue-types/beach-waterfront.svg", guests: 140, price: 12500, x: 62, y: 68 },
  { id: "linden", confirmed: true, name: "The Linden Estate", kind: "Historic Mansion & Estate", setting: "Indoor", src: "/venue-types/historic-estate.svg", guests: 220, price: 16000, x: 78, y: 32 },
  { id: "rosewood", name: "Rosewood Garden", kind: "Garden & Park", setting: "Outdoor", src: "/venue-types/garden-outdoor.svg", guests: 120, price: 7500, x: 40, y: 50 },
  { id: "grand", name: "The Grand Hotel", kind: "Hotel & Resort", setting: "Indoor", src: "/venue-types/hotel-resort.svg", guests: 300, price: 21000, x: 52, y: 18 },
  { id: "vine", name: "Cedar Vine Winery", kind: "Vineyard & Winery", setting: "Indoor & outdoor", src: "/venue-types/restaurant-vineyard.svg", guests: 160, price: 11000, x: 12, y: 60 },
];

const BUDGET_GUESTS = 150;
const BUDGET_LIMIT = 40000;

function VenuesDemo() {
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [min, setMin] = useState(0);
  const [inBudget, setInBudget] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  // The ♥ pill opens the saved list, as the real Saved page does.
  const [onlySaved, setOnlySaved] = useState(false);
  // The real Budget filter's sum for a room-only rental: the room plus about
  // $150 a guest for food and drink, here for 150 guests against $40,000.
  const withFood = (price: number) => price + BUDGET_GUESTS * 150;
  const shown = onlySaved
    ? VENUES.filter((v) => saved.has(v.id))
    : VENUES.filter((v) => v.guests >= min && (!inBudget || withFood(v.price) <= BUDGET_LIMIT));
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
      pins={shown.map((v) => ({
        id: v.id,
        x: v.x,
        y: v.y,
        label: `${v.guests}`,
        icon: <VenueTypeIcon type={v.kind} className="h-4 w-4" />,
      }))}
      filters={
        <>
          {[0, 150, 200].map((n) => (
            <FilterPill key={n} on={min === n} onClick={() => setMin(n)}>
              {n === 0 ? "Any size" : `${n}+ guests`}
            </FilterPill>
          ))}
          <FilterPill on={inBudget} onClick={() => setInBudget((b) => !b)}>
            Under $40k · {BUDGET_GUESTS} guests
          </FilterPill>
          <button
            type="button"
            onClick={() => setOnlySaved((o) => !o)}
            aria-pressed={onlySaved}
            className={`shrink-0 self-center whitespace-nowrap rounded-full px-3 py-1 text-sm text-forest ${
              onlySaved ? "bg-brass" : "bg-brass/15"
            }`}
          >
            ♥ {saved.size} saved
          </button>
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
            {inBudget && (
              <p className="text-[11px] text-ink/55">About {usd(withFood(v.price))} with food &amp; drink (est.)</p>
            )}
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
  // Several categories at once, like the real Category filter.
  const [kinds, setKinds] = useState<Set<string>>(new Set());
  const [sent, setSent] = useState<Set<string>>(new Set(["fern"]));
  const [active, setActive] = useState<string | null>(null);
  const shown = VENDORS.filter((v) => kinds.size === 0 || kinds.has(v.kind));
  const toggleKind = (k: string) =>
    setKinds((s) => {
      const next = new Set(s);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  return (
    <MockBrowser
      search="Austin, TX"
      count={shown.length}
      noun="vendor"
      active={active}
      onActive={setActive}
      pins={shown.map((v) => ({
        id: v.id,
        x: v.x,
        y: v.y,
        label: v.kind,
        icon: <VendorCategoryIcon category={v.kind} className="h-4 w-4" />,
        iconOnly: true,
      }))}
      filters={
        <>
          <FilterPill on={kinds.size === 0} onClick={() => setKinds(new Set())}>
            All
          </FilterPill>
          {VENDOR_KINDS.map((k) => (
            <FilterPill key={k} on={kinds.has(k)} onClick={() => toggleKind(k)}>
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

type DemoEvent = TimelineEvent & { audience: EventAudience };
const ev = (
  id: string,
  start: string,
  end: string | null,
  title: string,
  location: string,
  audience: EventAudience,
  people: string[] = [],
): DemoEvent => ({ id, title, start_time: start, end_time: end, location, audience, people });

const DAYS: { date: string; short: string; label: string; events: DemoEvent[] }[] = [
  {
    date: "2027-06-11",
    short: "Fri · Jun 11",
    label: "Day before",
    events: [
      ev("r1", "17:00", "18:00", "Rehearsal", "Juniper Barn", "party"),
      ev("r2", "18:30", "21:00", "Rehearsal dinner", "The Honey Pot", "guests"),
    ],
  },
  {
    date: "2027-06-12",
    short: "Sat · Jun 12",
    label: "Wedding day",
    events: [
      ev("w1", "10:00", "13:00", "Hair & makeup", "Bridal suite", "party", ["Glow Studio", "Bridesmaids"]),
      ev("w2", "13:30", "14:30", "First look & photos", "The orchard", "private"),
      ev("w3", "14:30", "16:10", "Family photos", "Barn lawn", "party", ["Lena Ortiz Photo", "Both families"]),
      ev("w4", "15:30", "16:00", "Guests arrive", "Front terrace", "guests"),
      ev("w5", "16:00", "16:30", "Ceremony", "Juniper Barn lawn", "guests"),
      ev("w6", "16:30", "17:30", "Cocktail hour", "The terrace", "guests"),
      ev("w7", "18:00", "19:30", "Dinner & toasts", "The barn", "guests", ["Caterer", "DJ"]),
    ],
  },
  {
    date: "2027-06-13",
    short: "Sun · Jun 13",
    label: "Day after",
    events: [ev("b1", "10:30", "12:30", "Farewell brunch", "Harbor House", "guests")],
  },
];

function ItineraryDemo() {
  const [picked, setPicked] = useState("2027-06-12");
  const [selected, setSelected] = useState<string | null>("w3");
  const [guestView, setGuestView] = useState(false);
  const day = DAYS.find((d) => d.date === picked)!;
  const flags = findFlags(day.events);
  const flagged = new Set(flags.map((f) => f.eventId));
  const pick = (e: DemoEvent) => setSelected(e.id);
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2" role="tablist" aria-label="Days">
          {DAYS.map((d) => (
            <button
              key={d.date}
              type="button"
              role="tab"
              aria-selected={d.date === picked}
              onClick={() => setPicked(d.date)}
              className={`rounded-xl border bg-card px-3 py-1.5 text-left ${
                d.date === picked ? "border-forest ring-1 ring-forest" : "border-hairline"
              }`}
            >
              <span className="block text-[10px] uppercase tracking-wide text-ink/55">{d.short}</span>
              <span className="font-display text-base font-semibold text-forest">{d.label}</span>
            </button>
          ))}
        </div>
        <div className="inline-flex rounded-full border border-hairline bg-card p-0.5 text-xs" role="group" aria-label="Show">
          {[
            { on: false, label: "Everything" },
            { on: true, label: "What guests see" },
          ].map((o) => (
            <button
              key={o.label}
              type="button"
              aria-pressed={guestView === o.on}
              onClick={() => setGuestView(o.on)}
              className={`rounded-full px-3 py-1.5 transition-colors ${
                guestView === o.on ? "bg-forest text-parchment" : "text-ink/60 hover:text-ink"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-lg border border-hairline bg-card p-3 shadow-sm sm:p-4">
        {flags.map((f) => (
          <p key={f.eventId} className="mb-3 rounded-[10px] border border-[#f3dc7a] bg-[#fff8d6] px-3 py-2 text-xs font-medium text-ink">
            {f.message} <span className="text-[#2243B6]">Move it and everything after in one go.</span>
          </p>
        ))}
        <div className="hidden md:block">
          <DayTimeline events={day.events} selectedId={selected} onSelect={pick} guestView={guestView} flagged={flagged} />
        </div>
        <div className="md:hidden">
          <DayList events={day.events} selectedId={selected} onSelect={pick} guestView={guestView} flagged={flagged} />
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
    photo: "/venue-types/barn-rustic.svg",
  },
  {
    key: "photo",
    label: "Photography",
    Icon: PhotographyIcon,
    name: "Lena Ortiz Photo",
    meta: "$4,000",
    contact: "(541) 555-0142",
    contract: "ortiz-photo-contract.pdf",
    photo: "/vendor-types/photography.svg",
  },
  {
    key: "catering",
    label: "Catering",
    Icon: CateringIcon,
    name: "Fig & Salt Catering",
    meta: "$10,200",
    contact: "hello@figandsalt.com",
    contract: null,
    photo: "/vendor-types/catering.svg",
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
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-ink/50">
                        <b.Icon className="h-3.5 w-3.5 text-brass" />
                        {b.label}
                      </p>
                      <p className="mt-1 font-display text-xl font-semibold text-forest">{b.name}</p>
                      <p className="mt-0.5 text-sm text-ink/60">{b.meta}</p>
                      <p className="mt-1.5 truncate text-sm text-brass">{b.contact}</p>
                    </div>
                    <Image
                      src={b.photo}
                      alt={b.name}
                      width={128}
                      height={128}
                      className="h-14 w-14 shrink-0 rounded-md border border-hairline object-cover shadow-sm"
                    />
                  </div>
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

// Line art to place on the demo site, as in the editor's Elements tab.
const DEMO_ART = [
  { id: "eucalyptus", label: "Eucalyptus", src: "/site-art/eucalyptus-line.webp" },
  { id: "lavender", label: "Lavender", src: "/site-art/lavender-line.webp" },
  { id: "rings", label: "Wedding rings", src: "/site-art/rings.svg" },
  { id: "laurel", label: "Laurel divider", src: "/site-art/divider-laurel.svg" },
] as const;

function artMask(src: string, color: string): React.CSSProperties {
  return {
    background: color,
    WebkitMaskImage: `url(${src})`,
    maskImage: `url(${src})`,
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
  };
}

/**
 * A sprig placed freely on the demo site, dragged like an element in the real
 * editor: Royal-blue selection with handles, snapping to 8px. The phone frame
 * has its own layout: the sprig sits stacked under the names until it's
 * dragged, then stays where it was put there, wherever it is on the computer.
 */
function DemoArt({ src, color, phone }: { src: string; color: string; phone: boolean }) {
  const [desktopPos, setDesktopPos] = useState({ x: 24, y: 24 });
  const [phonePos, setPhonePos] = useState<{ x: number; y: number } | null>(null);
  const [picked, setPicked] = useState(true);
  const drag = useRef<{ px: number; py: number; x: number; y: number } | null>(null);
  const pos = phone ? phonePos : desktopPos;
  const setPos = phone ? setPhonePos : setDesktopPos;
  // One element whether stacked or placed, so a drag that starts on the
  // stacked sprig carries on after it's lifted out of the flow.
  return (
    <span
      role="img"
      aria-label={pos ? "Artwork you can drag" : "Artwork, stacked on phones until you drag it"}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        let start = pos;
        if (!start) {
          const box = e.currentTarget.getBoundingClientRect();
          const frame = e.currentTarget.offsetParent?.getBoundingClientRect();
          start = { x: Math.round(box.left - (frame?.left ?? 0)), y: Math.round(box.top - (frame?.top ?? 0)) };
          setPos(start);
        }
        drag.current = { px: e.clientX, py: e.clientY, ...start };
        setPicked(true);
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d) return;
        const snap = (n: number) => Math.round(n / 8) * 8;
        setPos({ x: snap(d.x + e.clientX - d.px), y: snap(d.y + e.clientY - d.py) });
      }}
      onPointerUp={() => (drag.current = null)}
      className={`${pos ? "absolute z-10" : "relative mt-2 block"} cursor-move touch-none ${phone ? "h-16 w-12" : "h-24 w-16"}`}
      style={{ ...(pos ? { left: pos.x, top: pos.y } : {}), outline: picked && pos ? "2px solid #2243B6" : undefined, outlineOffset: 2 }}
    >
      <span className="block h-full w-full" style={artMask(src, color)} />
      {picked &&
        pos &&
        ["-left-1.5 -top-1.5", "-right-1.5 -top-1.5", "-bottom-1.5 -left-1.5", "-bottom-1.5 -right-1.5"].map((at) => (
          <span key={at} aria-hidden="true" className={`absolute h-2.5 w-2.5 rounded-full border-[1.5px] border-[#2243B6] bg-white ${at}`} />
        ))}
    </span>
  );
}

// A few of the Motion tab's falling choices and colours; the site has more of each.
const DEMO_FALLING = FALLING.filter((f) => ["none", "petals", "hearts", "snow", "fireflies"].includes(f.id));
const DEMO_FALLING_COLORS = FALLING_COLORS.filter((c) => ["accent", "natural", "blush", "gold", "sage"].includes(c.id));

// Theme font first, then a few the names cycle through when clicked.
const DEMO_NAME_FONTS = [null, "greatvibes", "saintdelafield", "playfair"] as const;

function SiteDemo() {
  const [themeId, setThemeId] = useState<ThemeId>(DEMO_THEMES[0].id);
  const [paletteId, setPaletteId] = useState<string | null>(null);
  const [ornament, setOrnament] = useState<OrnamentId>("laurel");
  const [device, setDevice] = useState<"desktop" | "phone">("desktop");
  const [rsvped, setRsvped] = useState(false);
  const [namesFont, setNamesFont] = useState(0);
  const [art, setArt] = useState<string | null>(DEMO_ART[0].id);
  const [falling, setFalling] = useState<FallingId>("petals");
  const [fallingColor, setFallingColor] = useState<FallingColorId>("accent");
  const reduced = useReducedMotion();
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
      {/* Your designs: a few looks side by side, one of them live. */}
      <div className="flex gap-1.5 overflow-x-auto text-xs">
        {["Heirloom", "Golden Hour", "Riviera"].map((name, i) => (
          <span
            key={name}
            className={`flex h-7 shrink-0 items-center gap-1.5 rounded-full px-2.5 ${
              i === 0 ? "bg-card font-medium text-forest ring-1 ring-forest/30" : "text-ink/60 ring-1 ring-hairline"
            }`}
          >
            {name}
            {i === 0 && <span className="rounded-full bg-[#FFD301] px-1.5 text-[10px] font-semibold text-[#14203d]">LIVE</span>}
          </span>
        ))}
        <span className="flex h-7 shrink-0 items-center rounded-full px-2.5 text-[#2243B6] ring-1 ring-hairline">+ New</span>
      </div>
      <div className="flex gap-1 rounded-lg bg-ink/[0.05] p-1">
        {["Design", "Sections", "Elements", "Fonts"].map((label, i) => (
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
      <p className={eyebrow}>Looks</p>
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
      <p className={eyebrow}>Line art &amp; ornaments · drag it on the site</p>
      <div className="flex gap-2">
        {DEMO_ART.map((a) => (
          <button
            key={a.id}
            type="button"
            aria-label={a.label}
            title={a.label}
            aria-pressed={art === a.id}
            onClick={() => setArt(art === a.id ? null : a.id)}
            className={`flex h-12 w-12 items-center justify-center rounded-xl bg-card p-1.5 ${
              art === a.id ? "ring-2 ring-[#2243B6]" : "ring-1 ring-hairline"
            }`}
          >
            <span aria-hidden="true" className="h-full w-full" style={artMask(a.src, accent)} />
          </button>
        ))}
      </div>
      <p className={eyebrow}>Falling over the page</p>
      <div className="flex flex-wrap gap-1.5">
        {DEMO_FALLING.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFalling(f.id)}
            aria-pressed={f.id === falling}
            className={`h-8 rounded-full px-3 text-xs ${
              f.id === falling ? "bg-forest text-parchment" : "bg-card text-ink/70 ring-1 ring-hairline"
            }`}
          >
            {f.label}
          </button>
        ))}
        {falling !== "none" &&
          DEMO_FALLING_COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              title={c.label}
              aria-label={`${c.label} colour`}
              aria-pressed={c.id === fallingColor}
              onClick={() => setFallingColor(c.id)}
              className={`h-8 w-8 rounded-full ${c.id === fallingColor ? "ring-2 ring-[#2243B6] ring-offset-1" : "ring-1 ring-hairline"}`}
              style={{
                background:
                  c.id === "natural" ? NATURAL_SWATCH : (c.hex ?? accent),
              }}
            />
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
      <p className={eyebrow}>Photos · upload yours or search free ones</p>
      <div className="flex h-9 items-center gap-2 rounded-lg bg-card px-3 text-xs text-ink/50 ring-1 ring-hairline">
        <span aria-hidden="true">⌕</span>
        Vineyard
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {SAMPLE_GALLERY.slice(0, 4).map((src) => (
          // Unsplash's own resized copies, like the real photo search.
          // eslint-disable-next-line @next/next/no-img-element
          <img key={src} src={src.replace("w=1200", "w=240")} alt="" loading="lazy" className="aspect-square w-full rounded-md object-cover" />
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
              {/* A password on the site: guests type it once, from the invitation. */}
              <div className="flex items-center justify-center gap-1.5 border-b border-hairline px-3 py-1.5 font-mono-numbers text-[10px] text-ink/45">
                <svg width="9" height="10" viewBox="0 0 9 10" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
                  <rect x="1" y="4.5" width="7" height="5" rx="1" />
                  <path d="M2.5 4.5V3a2 2 0 0 1 4 0v1.5" />
                </svg>
                youdoido.com/w/juniper-and-sam
              </div>
              {/* Tabs: a page per section, behind a Menu button on a phone. */}
              <div
                className="flex items-center gap-3 border-b px-3 py-2 text-[11px] transition-colors duration-500"
                style={{ background: t.bg, color: t.ink, borderColor: `color-mix(in srgb, ${t.ink} 14%, transparent)`, fontFamily: t.body }}
              >
                <span className="truncate text-[13px]" style={{ fontFamily: t.display, color: heading }}>
                  Juniper &amp; Sam
                </span>
                <span className="flex-1" />
                {!phone &&
                  ["Home", "Our story", "Schedule", "Travel", "Registry"].map((label, i) => (
                    <span
                      key={label}
                      className="border-b-2 pb-0.5"
                      style={{ borderColor: i === 0 ? accent : "transparent", opacity: i === 0 ? 1 : 0.7 }}
                    >
                      {label}
                    </span>
                  ))}
                <span className="rounded-full px-2.5 py-0.5 font-medium" style={{ background: heading, color: t.bg }}>
                  RSVP
                </span>
                {phone && (
                  <span className="rounded-full border px-2 py-0.5" style={{ borderColor: `color-mix(in srgb, ${t.ink} 20%, transparent)` }}>
                    ☰ Menu
                  </span>
                )}
              </div>
              <div
                className={`relative flex flex-col items-center gap-2 text-center transition-colors duration-500 ${phone ? "px-4 py-8" : "px-6 py-10"}`}
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
                {falling !== "none" && !reduced && <Falling kind={falling} color={fallingColor} speed={1} contained />}
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
                {art && (
                  <DemoArt src={DEMO_ART.find((a) => a.id === art)!.src} color={accent} phone={phone} />
                )}
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
                {/* The wedding party, framed the way the couple picked (arches here). */}
                <div className="mt-4 flex justify-center gap-3">
                  {[
                    ["Maya", "Maid of honor"],
                    ["Theo", "Best man"],
                    ["Iris", "Bridesmaid"],
                  ].map(([name, role]) => (
                    <div key={name} className="flex w-16 flex-col items-center">
                      <span
                        className="grid aspect-[4/5] w-full place-items-center rounded-t-full text-lg"
                        style={{ background: t.surface, color: accent, fontFamily: t.display }}
                      >
                        {name[0]}
                      </span>
                      <span className="mt-1 text-[11px]" style={{ color: heading }}>{name}</span>
                      <span className="text-[8px] uppercase tracking-wider" style={{ color: t.muted }}>{role}</span>
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
    heading: "Set the room in a click, then seat everyone",
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
