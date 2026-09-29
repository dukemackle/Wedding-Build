"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { WrenMotto } from "@/components/wren-motto";
import { AskWrenTile } from "@/app/dashboard/ask-wren-tile";
import { THEMES } from "@/lib/site-design";

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

/* ---------- Budget ---------- */

// Example costs: per head for the parts that scale with the guest count,
// flat for the rest. Round numbers, labelled as an example on screen.
const BUDGET_LINES = [
  { label: "Catering", perGuest: 85 },
  { label: "Bar", perGuest: 30 },
  { label: "Rentals", perGuest: 18 },
  { label: "Venue", flat: 9000 },
  { label: "Photography", flat: 4200 },
  { label: "Flowers", flat: 2800 },
  { label: "Music", flat: 2200 },
];

function BudgetDemo() {
  const [guests, setGuests] = useState(120);
  const lines = BUDGET_LINES.map((l) => ({
    label: l.label,
    amount: l.flat ?? (l.perGuest ?? 0) * guests,
  }));
  const total = lines.reduce((s, l) => s + l.amount, 0);
  const max = Math.max(...lines.map((l) => l.amount));

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor="demo-guests" className="text-sm text-ink/70">
            Guests
          </label>
          <span className="font-mono-numbers text-lg font-semibold text-forest">
            {guests}
          </span>
        </div>
        <input
          id="demo-guests"
          type="range"
          min={40}
          max={250}
          step={5}
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          className="mt-2 w-full accent-forest"
        />
      </div>
      <div className="flex items-baseline justify-between border-y border-hairline py-3">
        <span className="font-display text-xl text-forest">
          Estimated total
        </span>
        <span className="font-mono-numbers text-2xl font-semibold text-wren-deep">
          {usd(total)}
        </span>
      </div>
      <ul className="flex flex-col gap-2.5">
        {lines.map((l) => (
          <li
            key={l.label}
            className="grid grid-cols-[6.5rem_1fr_4.5rem] items-center gap-3 text-sm"
          >
            <span className="text-ink/80">{l.label}</span>
            <span className="h-1.5 overflow-hidden rounded-full bg-hairline">
              <span
                className="block h-full rounded-full bg-brass/80 transition-[width] duration-300"
                style={{ width: `${(l.amount / max) * 100}%` }}
              />
            </span>
            <span className="text-right font-mono-numbers text-xs text-ink/70">
              {usd(l.amount)}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-ink/50">
        Example numbers. Your account uses real costs for your state, season and
        style.
      </p>
    </div>
  );
}

/* ---------- Seating ---------- */

const SEAT_GUESTS = [
  "Aunt May",
  "Uncle Joe",
  "Priya",
  "Marcus",
  "Grandma Rose",
  "Lena",
];
const TABLES = ["Table 1", "Table 2"];

function SeatingDemo() {
  // Guest -> table index, or absent while unseated.
  const [seats, setSeats] = useState<Record<string, number>>({ Priya: 1 });
  const [picked, setPicked] = useState<string | null>(null);

  const seat = (name: string, table: number | null) => {
    setSeats((s) => {
      const next = { ...s };
      if (table == null) delete next[name];
      else next[name] = table;
      return next;
    });
    setPicked(null);
  };

  const chip = (name: string) => (
    <button
      key={name}
      type="button"
      draggable
      onDragStart={(e) => e.dataTransfer.setData("text/plain", name)}
      onClick={() => setPicked(picked === name ? null : name)}
      className={`cursor-grab rounded-full border px-3 py-1 text-sm transition-colors ${
        picked === name
          ? "border-forest bg-forest text-parchment"
          : "border-hairline bg-card text-ink/80 hover:border-forest"
      }`}
    >
      {name}
    </button>
  );

  const dropProps = (table: number | null) => ({
    onDragOver: (e: React.DragEvent) => e.preventDefault(),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      seat(e.dataTransfer.getData("text/plain"), table);
    },
    onClick: () => picked && seat(picked, table),
  });

  const unseated = SEAT_GUESTS.filter((g) => seats[g] == null);

  return (
    <div className="flex flex-col gap-5">
      <div
        {...dropProps(null)}
        className="min-h-14 rounded-xl border border-dashed border-hairline p-3"
      >
        <p className="mb-2 font-mono-numbers text-[10px] uppercase tracking-[0.2em] text-ink/50">
          Not seated · {unseated.length}
        </p>
        <div className="flex flex-wrap gap-2">{unseated.map(chip)}</div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {TABLES.map((t, i) => {
          const here = SEAT_GUESTS.filter((g) => seats[g] === i);
          return (
            <div
              key={t}
              {...dropProps(i)}
              className={`mx-auto flex aspect-square w-full max-w-60 flex-col items-center justify-center gap-1.5 rounded-full border-2 p-3 sm:gap-2 sm:p-6 text-center transition-colors ${
                picked
                  ? "border-brass bg-brass/5"
                  : "border-forest/40 bg-parchment"
              }`}
            >
              <span className="font-display text-lg text-forest">{t}</span>
              <div className="flex flex-wrap justify-center gap-1.5">
                {here.map(chip)}
              </div>
              <span className="font-mono-numbers text-[10px] text-ink/50">
                {here.length} of 8 seats
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-ink/50">
        Drag a guest to a table — or tap a guest, then tap a table.
      </p>
    </div>
  );
}

/* ---------- Checklist ---------- */

const TASKS = [
  { title: "Set a budget", when: "12 months out" },
  { title: "Book your venue", when: "12 months out" },
  { title: "Book your photographer", when: "10 months out" },
  { title: "Send save-the-dates", when: "8 months out" },
  { title: "Order invitations", when: "4 months out" },
  { title: "Final headcount to caterer", when: "2 weeks out" },
];

function ChecklistDemo() {
  const [done, setDone] = useState<Set<number>>(new Set([0]));
  const toggle = (i: number) =>
    setDone((d) => {
      const next = new Set(d);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  const pct = Math.round((done.size / TASKS.length) * 100);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <span className="font-display text-xl text-forest">
          {done.size} of {TASKS.length} done
        </span>
        <span className="font-mono-numbers text-sm text-brass">{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-hairline">
        <div
          className="h-full rounded-full bg-forest transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <ul className="flex flex-col divide-y divide-hairline">
        {TASKS.map((t, i) => (
          <li key={t.title}>
            <label className="flex cursor-pointer items-center gap-3 py-2.5">
              <input
                type="checkbox"
                checked={done.has(i)}
                onChange={() => toggle(i)}
                className="h-4 w-4 accent-forest"
              />
              <span
                className={`flex-1 text-sm ${done.has(i) ? "text-ink/40 line-through" : "text-ink/85"}`}
              >
                {t.title}
              </span>
              <span className="font-mono-numbers text-[10px] text-ink/45">
                {t.when}
              </span>
            </label>
          </li>
        ))}
      </ul>
      <p className="text-xs text-ink/50">
        Your real checklist is built around your wedding date.
      </p>
    </div>
  );
}

/* ---------- RSVP ---------- */

type Reply = { name: string; coming: boolean; meal: string; address: boolean };

function RsvpDemo() {
  const [replies, setReplies] = useState<Reply[]>([
    { name: "Priya S.", coming: true, meal: "Salmon", address: true },
    { name: "Marcus T.", coming: false, meal: "", address: false },
  ]);
  const [name, setName] = useState("");
  const [coming, setComing] = useState(true);
  const [meal, setMeal] = useState("Chicken");

  const yes = replies.filter((r) => r.coming).length;
  const noAddress = replies.filter((r) => !r.address).length;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* What a guest sees on the wedding site. */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          setReplies((r) => [
            { name: name.trim(), coming, meal: coming ? meal : "", address: false },
            ...r,
          ]);
          setName("");
        }}
        className="flex flex-col gap-3 rounded-xl border border-hairline bg-parchment p-4"
      >
        <p className="font-mono-numbers text-[10px] uppercase tracking-[0.2em] text-ink/50">
          Your guest sees
        </p>
        <p className="font-display text-xl text-forest">
          Juniper &amp; Sam · June 12
        </p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          aria-label="Your name"
          className="rounded-lg border border-hairline bg-card px-3 py-2 text-sm"
        />
        <div className="flex gap-2">
          {[true, false].map((v) => (
            <button
              key={String(v)}
              type="button"
              onClick={() => setComing(v)}
              className={`flex-1 rounded-full border px-3 py-1.5 text-sm ${
                coming === v
                  ? "border-forest bg-forest text-parchment"
                  : "border-hairline bg-card text-ink/70"
              }`}
            >
              {v ? "Joyfully accept" : "Regretfully decline"}
            </button>
          ))}
        </div>
        {coming && (
          <select
            value={meal}
            onChange={(e) => setMeal(e.target.value)}
            aria-label="Meal"
            className="rounded-lg border border-hairline bg-card px-3 py-2 text-sm"
          >
            <option>Chicken</option>
            <option>Salmon</option>
            <option>Vegetarian</option>
          </select>
        )}
        <button
          type="submit"
          className="rounded-full bg-forest px-4 py-2 font-display text-parchment hover:bg-forest/90"
        >
          Send RSVP
        </button>
      </form>

      {/* What the couple sees update. */}
      <div className="flex flex-col gap-3">
        <p className="font-mono-numbers text-[10px] uppercase tracking-[0.2em] text-ink/50">
          You see
        </p>
        <div className="flex items-baseline gap-2">
          <span className="font-mono-numbers text-2xl font-semibold text-forest">
            {yes}
          </span>
          <span className="text-sm text-ink/60">
            coming of {replies.length} replied
          </span>
        </div>
        <ul className="flex flex-col divide-y divide-hairline">
          {replies.map((r, i) => (
            <li
              key={`${r.name}-${replies.length - i}`}
              className="flex items-center justify-between py-2 text-sm"
            >
              <span className="text-ink/85">{r.name}</span>
              <span className="flex items-center gap-3">
                <span className={`text-xs ${r.address ? "text-ink/45" : "text-red-700/80"}`}>
                  {r.address ? "✓ Address" : "No address"}
                </span>
                <span
                  className={`font-mono-numbers text-xs ${r.coming ? "text-forest" : "text-ink/45"}`}
                >
                  {r.coming ? `Yes · ${r.meal}` : "Can't make it"}
                </span>
              </span>
            </li>
          ))}
        </ul>
        {noAddress > 0 && (
          <p className="text-xs text-ink/50">
            {noAddress} still missing an address — one click filters to just them.
          </p>
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
  { id: "juniper", name: "Juniper Barn", kind: "Barn", setting: "Indoor & outdoor", src: "/venue-types/barn-rustic.svg", guests: 180, price: 9000, x: 22, y: 30 },
  { id: "harbor", name: "Harbor House", kind: "Waterfront", setting: "Outdoor", src: "/venue-types/beach-waterfront.svg", guests: 140, price: 12500, x: 62, y: 68 },
  { id: "linden", name: "The Linden Estate", kind: "Historic estate", setting: "Indoor", src: "/venue-types/historic-estate.svg", guests: 220, price: 16000, x: 78, y: 32 },
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

const ATTIRE = [
  {
    name: "Wedding dress",
    src: "/attire-types/wedding-dress.svg",
    orderBy: "8 months out",
  },
  {
    name: "Suit",
    src: "/attire-types/groom-attire.svg",
    orderBy: "4 months out",
  },
  { name: "Rings", src: "/attire-types/ring-her.svg", orderBy: "3 months out" },
];

function AttireDemo() {
  const [rent, setRent] = useState<Record<string, boolean>>({ Suit: true });
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {ATTIRE.map((a) => (
        <div
          key={a.name}
          className="flex flex-col items-center gap-3 rounded-xl border border-hairline bg-card p-4"
        >
          <div className="relative h-24 w-full">
            <Image
              src={a.src}
              alt=""
              fill
              sizes="200px"
              className="object-contain"
            />
          </div>
          <p className="font-display text-lg text-forest">{a.name}</p>
          <div className="flex rounded-full border border-hairline p-0.5 text-xs">
            {["Buy", "Rent"].map((opt) => {
              const on = (opt === "Rent") === !!rent[a.name];
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() =>
                    setRent((r) => ({ ...r, [a.name]: opt === "Rent" }))
                  }
                  className={`rounded-full px-3 py-1 ${on ? "bg-forest text-parchment" : "text-ink/60"}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          <p className="font-mono-numbers text-[10px] text-brass">
            {rent[a.name] ? "Reserve" : "Order"} by {a.orderBy}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ---------- Itinerary ---------- */

const DAY = [
  { time: "10am", title: "Hair & makeup", who: "Bridal party" },
  { time: "2pm", title: "First look & photos", who: "Couple, photographer" },
  { time: "4pm", title: "Ceremony", who: "Everyone" },
  { time: "5pm", title: "Cocktail hour", who: "Guests" },
  { time: "6pm", title: "Dinner & toasts", who: "Everyone" },
  { time: "8pm", title: "First dance", who: "Couple, DJ" },
];

function ItineraryDemo() {
  const [open, setOpen] = useState(2);
  return (
    <ol className="relative flex flex-col border-l border-hairline pl-5">
      {DAY.map((e, i) => (
        <li key={e.title} className="relative py-2">
          <span
            className={`absolute -left-[1.6rem] top-4 h-3 w-3 rounded-full border-2 ${
              i === open ? "border-brass bg-brass" : "border-forest/40 bg-card"
            }`}
          />
          <button
            type="button"
            onClick={() => setOpen(i)}
            className="flex w-full items-baseline gap-4 text-left"
          >
            <span className="w-12 shrink-0 font-mono-numbers text-xs text-brass">
              {e.time}
            </span>
            <span className="text-sm text-ink/85">{e.title}</span>
          </button>
          {i === open && (
            <p className="ml-16 mt-1 font-mono-numbers text-[10px] text-ink/50">
              Who: {e.who}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}

/* ---------- Bookings ---------- */

const BOOKINGS = [
  { who: "Juniper Barn", what: "Venue", contract: "Signed", paid: "Deposit paid" },
  { who: "Lena Ortiz Photo", what: "Photographer", contract: "Signed", paid: "Deposit paid" },
  { who: "Fig & Salt Catering", what: "Catering", contract: "Waiting on it", paid: "Nothing paid" },
];

function BookingsDemo() {
  const [signed, setSigned] = useState(false);
  return (
    <ul className="flex flex-col divide-y divide-hairline rounded-xl border border-hairline bg-parchment">
      {BOOKINGS.map((b, i) => {
        const done = b.contract === "Signed" || (i === 2 && signed);
        return (
          <li key={b.who} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-forest">{b.who}</p>
              <p className="font-mono-numbers text-[10px] text-ink/50">{b.what}</p>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 font-mono-numbers text-[10px] ${done ? "bg-forest text-parchment" : "bg-brass/15 text-[#9a6b00]"}`}
            >
              {done ? "Contract signed ✓" : "Contract: waiting"}
            </span>
            {i === 2 && !signed && (
              <button
                type="button"
                onClick={() => setSigned(true)}
                className="rounded-full border border-hairline bg-card px-3 py-1 text-xs text-forest hover:border-brass"
              >
                Upload contract
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/* ---------- Wedding site ---------- */

// Four of the site editor's real themes, from soft to bold.
const DEMO_THEMES = ["garden", "blush", "terracotta", "midnight"].map(
  (id) => THEMES.find((t) => t.id === id) ?? THEMES[0],
);

function SiteDemo() {
  const [themeId, setThemeId] = useState(DEMO_THEMES[0].id);
  const [rsvped, setRsvped] = useState(false);
  const t = DEMO_THEMES.find((x) => x.id === themeId) ?? DEMO_THEMES[0];
  const accent = t.swatches[0];
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono-numbers text-[10px] uppercase tracking-[0.2em] text-ink/50">Theme</span>
        {DEMO_THEMES.map((x) => (
          <button
            key={x.id}
            type="button"
            onClick={() => setThemeId(x.id)}
            aria-pressed={x.id === themeId}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors ${x.id === themeId ? "border-brass bg-brass/10 text-forest" : "border-hairline bg-card text-ink/70 hover:border-brass"}`}
          >
            <span className="h-3 w-3 rounded-full" style={{ background: x.swatches[0] }} />
            {x.name}
          </button>
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-hairline">
        <div className="border-b border-hairline bg-card px-3 py-1.5 font-mono-numbers text-[10px] text-ink/45">
          wrenwed.com/w/juniper-and-sam
        </div>
        <div
          className="flex flex-col items-center gap-2 px-6 py-8 text-center transition-colors duration-500"
          style={{ background: t.bg, color: t.ink, fontFamily: t.body }}
        >
          <p className="font-mono-numbers text-[10px] uppercase tracking-[0.25em]" style={{ color: t.muted }}>
            June 12, 2027 · Bend, Oregon
          </p>
          <p
            className="text-4xl"
            style={{ fontFamily: t.display, fontStyle: t.italicNames ? "italic" : "normal", fontWeight: t.nameWeight }}
          >
            Juniper &amp; Sam
          </p>
          <div className="mt-3 grid w-full max-w-sm grid-cols-3 gap-2 text-center">
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
            style={{ background: accent, color: t.buttonInk, borderRadius: t.radius, fontFamily: t.display }}
          >
            {rsvped ? "See you there! ✓" : "RSVP"}
          </button>
        </div>
      </div>
      <p className="text-xs text-ink/50">
        Eight themes, your own colours and fonts, and sections for travel, FAQs,
        your registry, photos and a guest photo wall.
      </p>
    </div>
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

/** `wide` gives the dialog room for a side-by-side screen, not a card. */
const PREVIEWS: Record<
  string,
  { heading: string; Demo: () => ReactNode; wide?: boolean }
> = {
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
    wide: true,
  },
  vendors: {
    heading: "Reach every vendor from one list",
    Demo: VendorsDemo,
    wide: true,
  },
  checklist: { heading: "Always know what's next", Demo: ChecklistDemo },
  attire: { heading: "Buy or rent, and know when to order", Demo: AttireDemo },
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
                preview.wide ? "sm:max-w-5xl" : "sm:max-w-3xl"
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
