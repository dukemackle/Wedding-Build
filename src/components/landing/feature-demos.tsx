"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/*
 * Small working versions of four Wren tools, on sample data, so a visitor
 * can try one before signing up. Nothing here saves anywhere.
 */

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

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
          <span className="font-mono-numbers text-lg font-semibold text-forest">{guests}</span>
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
        <span className="font-display text-xl text-forest">Estimated total</span>
        <span className="font-mono-numbers text-2xl font-semibold text-forest">{usd(total)}</span>
      </div>
      <ul className="flex flex-col gap-2.5">
        {lines.map((l) => (
          <li key={l.label} className="grid grid-cols-[6.5rem_1fr_4.5rem] items-center gap-3 text-sm">
            <span className="text-ink/80">{l.label}</span>
            <span className="h-1.5 overflow-hidden rounded-full bg-hairline">
              <span
                className="block h-full rounded-full bg-brass/80 transition-[width] duration-300"
                style={{ width: `${(l.amount / max) * 100}%` }}
              />
            </span>
            <span className="text-right font-mono-numbers text-xs text-ink/70">{usd(l.amount)}</span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-ink/50">
        Example numbers. Your account uses real costs for your state, season and style.
      </p>
    </div>
  );
}

/* ---------- Seating ---------- */

const SEAT_GUESTS = ["Aunt May", "Uncle Joe", "Priya", "Marcus", "Grandma Rose", "Lena"];
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
                picked ? "border-brass bg-brass/5" : "border-forest/40 bg-parchment"
              }`}
            >
              <span className="font-display text-lg text-forest">{t}</span>
              <div className="flex flex-wrap justify-center gap-1.5">{here.map(chip)}</div>
              <span className="font-mono-numbers text-[10px] text-ink/50">{here.length} of 8 seats</span>
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
        <div className="h-full rounded-full bg-forest transition-[width] duration-300" style={{ width: `${pct}%` }} />
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
              <span className={`flex-1 text-sm ${done.has(i) ? "text-ink/40 line-through" : "text-ink/85"}`}>
                {t.title}
              </span>
              <span className="font-mono-numbers text-[10px] text-ink/45">{t.when}</span>
            </label>
          </li>
        ))}
      </ul>
      <p className="text-xs text-ink/50">Your real checklist is built around your wedding date.</p>
    </div>
  );
}

/* ---------- RSVP ---------- */

type Reply = { name: string; coming: boolean; meal: string };

function RsvpDemo() {
  const [replies, setReplies] = useState<Reply[]>([
    { name: "Priya S.", coming: true, meal: "Salmon" },
    { name: "Marcus T.", coming: false, meal: "" },
  ]);
  const [name, setName] = useState("");
  const [coming, setComing] = useState(true);
  const [meal, setMeal] = useState("Chicken");

  const yes = replies.filter((r) => r.coming).length;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* What a guest sees on the wedding site. */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          setReplies((r) => [{ name: name.trim(), coming, meal: coming ? meal : "" }, ...r]);
          setName("");
        }}
        className="flex flex-col gap-3 rounded-xl border border-hairline bg-parchment p-4"
      >
        <p className="font-mono-numbers text-[10px] uppercase tracking-[0.2em] text-ink/50">
          Your guest sees
        </p>
        <p className="font-display text-xl text-forest">Juniper &amp; Sam · June 12</p>
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
                coming === v ? "border-forest bg-forest text-parchment" : "border-hairline bg-card text-ink/70"
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
          <span className="font-mono-numbers text-2xl font-semibold text-forest">{yes}</span>
          <span className="text-sm text-ink/60">coming of {replies.length} replied</span>
        </div>
        <ul className="flex flex-col divide-y divide-hairline">
          {replies.map((r, i) => (
            <li
              key={`${r.name}-${replies.length - i}`}
              className="flex items-center justify-between py-2 text-sm"
            >
              <span className="text-ink/85">{r.name}</span>
              <span className={`font-mono-numbers text-xs ${r.coming ? "text-forest" : "text-ink/45"}`}>
                {r.coming ? `Yes · ${r.meal}` : "Can't make it"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ---------- The tabs ---------- */

const DEMOS = [
  { id: "budget", label: "Budget", title: "Watch the budget move with your guest list", Demo: BudgetDemo },
  { id: "seating", label: "Seating", title: "Seat your guests by dragging them to a table", Demo: SeatingDemo },
  { id: "checklist", label: "Checklist", title: "Always know what's next", Demo: ChecklistDemo },
  { id: "rsvp", label: "RSVPs", title: "Guests reply online, your list updates itself", Demo: RsvpDemo },
] as const;

type DemoId = (typeof DEMOS)[number]["id"];

/**
 * Desktop: the tabs as a column on the left, the demo beside them.
 * Phone: the four tabs in one row that fits without scrolling, the demo beneath.
 */
export function FeatureDemos() {
  const [active, setActive] = useState<DemoId>("budget");

  // The feature tiles above link to #see-it-<id>; open that demo.
  useEffect(() => {
    const open = () => {
      const id = window.location.hash.replace("#see-it-", "");
      if (DEMOS.some((d) => d.id === id)) setActive(id as DemoId);
    };
    open();
    window.addEventListener("hashchange", open);
    return () => window.removeEventListener("hashchange", open);
  }, []);

  const current = DEMOS.find((d) => d.id === active)!;

  return (
    <section id="see-it" className="w-full scroll-mt-24">
      {/* Anchors for the tiles to land on. */}
      {DEMOS.map((d) => (
        <span key={d.id} id={`see-it-${d.id}`} className="block scroll-mt-24" />
      ))}
      <div className="text-center">
        <p className="font-mono-numbers text-[11px] uppercase tracking-[0.25em] text-brass">Try it</p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-forest sm:text-4xl">See how it works</h2>
        <p className="mt-2 text-sm text-ink/60">Real tools, sample wedding. Nothing you do here is saved.</p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-[15rem_1fr] lg:gap-8">
        <div
          role="tablist"
          aria-label="Feature demos"
          className="grid grid-cols-4 gap-1.5 lg:flex lg:flex-col lg:gap-2"
        >
          {DEMOS.map((d) => (
            <button
              key={d.id}
              role="tab"
              type="button"
              aria-selected={active === d.id}
              onClick={() => setActive(d.id)}
              className={`rounded-full border px-1 py-2 font-display text-base transition-colors lg:rounded-xl lg:px-5 lg:py-4 lg:text-left lg:text-xl ${
                active === d.id
                  ? "border-forest bg-forest text-parchment"
                  : "border-hairline bg-card text-forest hover:border-brass"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        <div role="tabpanel" className="rounded-2xl border border-hairline bg-card p-5 shadow-sm sm:p-8">
          <h3 className="mb-6 font-display text-2xl font-semibold text-forest">{current.title}</h3>
          <current.Demo key={current.id} />
          <div className="mt-6 border-t border-hairline pt-4 text-right">
            <Link href="/signup" className="font-display text-lg text-brass hover:text-forest">
              Do this with your own wedding &rarr;
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
