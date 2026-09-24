import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { VendorTrackerRow } from "./dashboard-data";

export type Feature = {
  href: string;
  title: string;
  /** Where the couple stands on it, in a few words. */
  status: string;
  /** The picture in the box: the couple's own photo or a glimpse of their data. */
  media: ReactNode;
};

export type FeatureData = {
  checklist: { done: number; total: number; next: { title: string; due: string | null }[] };
  budget: {
    total: number;
    target: number | null;
    paid: number;
    typical: number;
    quoted: number;
    categories: number;
  };
  guests: { total: number; confirmed: number; pending: number; declined: number };
  venue: { photo: string | null; name: string; booked: boolean } | null;
  venuesShortlisted: number;
  vendors: VendorTrackerRow[];
  attire: { photo: string | null; name: string } | null;
  attireShortlisted: number;
  itinerary: { time: string | null; title: string }[];
  layoutItems: number;
};

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const shortDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });

function clockTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  return `${h % 12 || 12}${m ? `:${String(m).padStart(2, "0")}` : ""}${h >= 12 ? "pm" : "am"}`;
}

const pct = (part: number, whole: number) =>
  `${whole > 0 ? Math.min(100, Math.round((part / whole) * 100)) : 0}%`;

/* ---------- What fills each box ---------- */

/** A photo filling the box, with a label across its foot. */
function PhotoMedia({ src, label }: { src: string; label: string }) {
  return (
    <>
      <Image
        src={src}
        alt=""
        fill
        sizes="(min-width: 1024px) 320px, 50vw"
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
      <p className="absolute inset-x-3 bottom-2 truncate font-mono-numbers text-[9px] uppercase tracking-[0.2em] text-white sm:inset-x-4 sm:bottom-3 sm:text-[10px]">
        {label}
      </p>
    </>
  );
}

/**
 * Wren's own line drawing, for a box the couple hasn't put anything in yet --
 * so an empty dashboard still looks finished rather than blank.
 */
function DrawingMedia({ src }: { src: string }) {
  return (
    <Image
      src={src}
      alt=""
      fill
      sizes="(min-width: 1024px) 320px, 50vw"
      className="object-cover transition-transform duration-700 group-hover:scale-105"
    />
  );
}

function Panel({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 flex flex-col justify-center gap-2 bg-parchment px-3 sm:gap-2.5 sm:px-5">
      {children}
    </div>
  );
}

function Big({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono-numbers text-lg font-semibold text-forest sm:text-2xl">
      {children}
    </span>
  );
}

/** A few words in place of a number, for a box with nothing in it yet. */
function Phrase({ children }: { children: ReactNode }) {
  return (
    <span className="font-display text-xl font-semibold leading-tight text-forest sm:text-2xl">
      {children}
    </span>
  );
}

function Small({ children }: { children: ReactNode }) {
  return <span className="font-mono-numbers text-[9px] text-ink/50 sm:text-[10px]">{children}</span>;
}

type Line = { key: string; lead: ReactNode; text: string; tail?: string | null };

/** A short list, the third line hidden on a phone where the box is small. */
function Lines({ rows }: { rows: Line[] }) {
  return (
    <>
      {rows.map((row, i) => (
        <div key={row.key} className={`flex items-center gap-2 ${i === 2 ? "hidden sm:flex" : ""}`}>
          {row.lead}
          <span className="min-w-0 flex-1 truncate text-[11px] text-ink/80 sm:text-sm">
            {row.text}
          </span>
          {row.tail && (
            <span className="hidden shrink-0 font-mono-numbers text-[10px] text-ink/45 sm:inline">
              {row.tail}
            </span>
          )}
        </div>
      ))}
    </>
  );
}

const circle = (
  <span className="h-3 w-3 shrink-0 rounded-full border border-ink/30 sm:h-3.5 sm:w-3.5" />
);
const tick = (
  <span className="flex h-3 w-3 shrink-0 items-center justify-center rounded-full bg-forest text-[8px] text-parchment sm:h-3.5 sm:w-3.5">
    ✓
  </span>
);
const time = (label: string) => (
  <span className="w-10 shrink-0 font-mono-numbers text-[10px] text-brass sm:w-12 sm:text-xs">
    {label}
  </span>
);

/** A plain floor plan: round tables around a dance floor. */
function FloorPlanDrawing() {
  const tables = [
    [40, 40], [80, 40], [120, 40], [160, 40],
    [40, 105], [160, 105], [40, 145], [160, 145],
  ];
  return (
    <svg
      viewBox="0 0 200 180"
      aria-hidden="true"
      className="absolute inset-0 h-full w-full bg-parchment p-3 transition-transform duration-700 group-hover:scale-105"
    >
      <rect x="6" y="6" width="188" height="168" rx="4" fill="none" strokeWidth="1.5" className="stroke-forest/40" />
      <rect x="72" y="88" width="56" height="56" rx="2" strokeWidth="1.5" className="fill-brass/20 stroke-brass" />
      <rect x="70" y="158" width="60" height="8" rx="2" className="fill-forest/15" />
      {tables.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="12" strokeWidth="1.5" className="fill-card stroke-forest" />
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <circle
              key={a}
              cx={x + 17 * Math.cos((a * Math.PI) / 180)}
              cy={y + 17 * Math.sin((a * Math.PI) / 180)}
              r="2.5"
              className="fill-forest/40"
            />
          ))}
        </g>
      ))}
    </svg>
  );
}

/* ---------- The ten boxes ---------- */

/** Every part of Wren, in the order a wedding tends to need them. */
export function buildFeatures(d: FeatureData): Feature[] {
  const booked = d.vendors.filter((v) => v.status === "booked");
  const over = d.budget.target != null ? d.budget.total - d.budget.target : null;

  return [
    {
      href: "/checklist",
      title: "Checklist",
      status:
        d.checklist.total > 0
          ? `${d.checklist.done} of ${d.checklist.total} done`
          : "Build your plan",
      media: (
        <Panel>
          {d.checklist.next.length > 0 ? (
            <>
              <Lines
                rows={d.checklist.next.map((t) => ({
                  key: t.title,
                  lead: circle,
                  text: t.title,
                  tail: t.due ? shortDate(t.due) : null,
                }))}
              />
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-hairline">
                <div
                  className="h-full rounded-full bg-forest"
                  style={{ width: pct(d.checklist.done, d.checklist.total) }}
                />
              </div>
            </>
          ) : (
            <>
              <Phrase>Month by month</Phrase>
              <Small>A plan made for your date</Small>
            </>
          )}
        </Panel>
      ),
    },
    {
      href: "/budget",
      title: "Budget",
      status: `${d.budget.quoted} of ${d.budget.categories} quoted`,
      media: (
        <Panel>
          <div className="flex items-baseline justify-between gap-2">
            <Big>{usd(d.budget.total)}</Big>
            {d.budget.target != null && (
              <span className="hidden sm:inline">
                <Small>target {usd(d.budget.target)}</Small>
              </span>
            )}
          </div>
          {/* Paid in green over the whole estimate; the tick is the target. */}
          <div className="relative h-1.5 rounded-full bg-brass/70">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-forest"
              style={{ width: pct(d.budget.paid, d.budget.total) }}
            />
            {d.budget.target != null && (
              <div
                className="absolute -top-1 h-3.5 w-0.5 bg-ink/60"
                style={{ left: pct(d.budget.target, d.budget.total) }}
              />
            )}
          </div>
          <div className="flex justify-between gap-2">
            <span className="hidden sm:inline">
              <Small>
                <span className="text-forest">■</span> Paid {usd(d.budget.paid)}
              </Small>
            </span>
            {over != null && (
              <span
                className={`font-mono-numbers text-[9px] sm:text-[10px] ${over > 0 ? "text-brass" : "text-forest"}`}
              >
                {over > 0 ? `${usd(over)} over` : `${usd(-over)} under`}
              </span>
            )}
          </div>
        </Panel>
      ),
    },
    {
      href: "/guests",
      title: "Guests",
      status: d.guests.total > 0 ? `${d.guests.confirmed} coming` : "Start your list",
      media: (
        <Panel>
          <div className="flex items-baseline gap-2">
            <Big>{d.guests.total}</Big>
            <Small>on the list</Small>
          </div>
          <div className="flex h-1.5 overflow-hidden rounded-full bg-hairline">
            <div className="bg-forest" style={{ width: pct(d.guests.confirmed, d.guests.total) }} />
            <div className="bg-brass/70" style={{ width: pct(d.guests.pending, d.guests.total) }} />
            <div className="bg-ink/25" style={{ width: pct(d.guests.declined, d.guests.total) }} />
          </div>
          <div className="flex gap-3">
            <Small>
              <span className="text-forest">■</span> {d.guests.confirmed} yes
            </Small>
            <Small>
              <span className="text-brass">■</span> {d.guests.pending} waiting
            </Small>
          </div>
        </Panel>
      ),
    },
    {
      href: "/venues",
      title: "Venues",
      status: d.venue?.booked
        ? "Booked"
        : d.venuesShortlisted > 0
          ? `${d.venuesShortlisted} shortlisted`
          : "Find your place",
      media: d.venue?.photo ? (
        <PhotoMedia src={d.venue.photo} label={d.venue.name} />
      ) : (
        <DrawingMedia src="/venue-types/barn-rustic.svg" />
      ),
    },
    {
      href: "/vendors",
      title: "Vendors",
      status:
        d.vendors.length > 0 ? `${booked.length} of ${d.vendors.length} booked` : "Find your team",
      media: (
        <Panel>
          <div className="flex flex-wrap gap-1 sm:gap-1.5">
            {d.vendors.slice(0, 9).map((v, i) => (
              <span
                key={v.key}
                className={`rounded-full px-1.5 py-0.5 text-[9px] sm:px-2 sm:text-[11px] ${i >= 6 ? "hidden sm:inline" : ""} ${
                  v.status === "booked"
                    ? "bg-forest text-parchment"
                    : "border border-hairline bg-card text-ink/60"
                }`}
              >
                {v.label}
              </span>
            ))}
          </div>
        </Panel>
      ),
    },
    {
      href: "/attire",
      title: "Attire",
      status: d.attireShortlisted > 0 ? `${d.attireShortlisted} saved` : "Find the look",
      media: d.attire?.photo ? (
        <PhotoMedia src={d.attire.photo} label={d.attire.name} />
      ) : (
        <DrawingMedia src="/attire-types/wedding-dress.svg" />
      ),
    },
    {
      href: "/bookings",
      title: "Bookings",
      status: booked.length > 0 ? `${booked.length} booked` : "Contracts & contacts",
      media: (
        <Panel>
          {booked.length > 0 ? (
            <Lines
              rows={booked.slice(0, 3).map((v) => ({
                key: v.key,
                lead: tick,
                text: v.detail ? `${v.label} · ${v.detail}` : v.label,
              }))}
            />
          ) : (
            <>
              <Phrase>Nothing booked yet</Phrase>
              <Small>Everyone you book, in one place</Small>
            </>
          )}
        </Panel>
      ),
    },
    {
      href: "/itinerary",
      title: "Itinerary",
      status: d.itinerary.length > 0 ? "Hour by hour" : "Plan the day",
      // An example day until they've added their own.
      media: (
        <Panel>
          <Lines
            rows={
              d.itinerary.length > 0
                ? d.itinerary.map((e, i) => ({
                    key: `${i}-${e.title}`,
                    lead: time(e.time ? clockTime(e.time) : "—"),
                    text: e.title,
                  }))
                : [
                    { key: "a", lead: time("4pm"), text: "Ceremony" },
                    { key: "b", lead: time("5pm"), text: "Cocktail hour" },
                    { key: "c", lead: time("6pm"), text: "Dinner & toasts" },
                  ]
            }
          />
        </Panel>
      ),
    },
    {
      href: "/venue-layout",
      title: "Venue Layout",
      status: d.layoutItems > 0 ? `${d.layoutItems} pieces placed` : "Arrange the room",
      media: <FloorPlanDrawing />,
    },
    {
      href: "/budget/estimate",
      title: "Estimator",
      status: "See typical costs",
      media: (
        <Panel>
          <Small>Typical for a wedding like yours</Small>
          <Big>{usd(d.budget.typical)}</Big>
        </Panel>
      ),
    },
  ];
}

function FeatureTile({ feature, titleOnTop }: { feature: Feature; titleOnTop: boolean }) {
  const { href, title, status, media } = feature;
  const words = (
    <div className="px-3 py-3 sm:px-5 sm:py-4">
      <h2 className="font-display text-[1.6rem] font-bold leading-none text-forest sm:text-[2.35rem]">
        {title}
      </h2>
      <p className="mt-2 truncate font-mono-numbers text-[11px] tracking-wide text-ink/55 sm:text-xs sm:text-brass">
        {status}
      </p>
    </div>
  );
  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl border border-hairline bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brass/60 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
    >
      {titleOnTop && words}
      {/* Grows to fill the box, so a neighbour's two-line title never leaves a gap. */}
      <div
        className={`relative min-h-28 flex-1 overflow-hidden border-hairline sm:min-h-40 ${titleOnTop ? "border-t" : "border-b"}`}
      >
        {media}
        <span
          aria-hidden="true"
          className="absolute right-3 top-3 hidden h-9 w-9 items-center justify-center rounded-full border border-brass/40 bg-card/90 text-brass opacity-0 shadow-sm transition-all duration-300 group-hover:opacity-100 sm:flex"
        >
          &rarr;
        </span>
      </div>
      {!titleOnTop && words}
    </Link>
  );
}

/**
 * The dashboard, below the banner: one box per part of Wren, and nothing else.
 *
 * Each box is its name set large, then a picture of what's behind it -- the
 * couple's own venue photo, their budget bar, their next tasks -- so the box
 * reads as a door from across the room. Where they haven't added anything yet
 * it shows Wren's own drawing or an example, never an empty grey square.
 *
 * Two across on a phone, five on a wide screen.
 */
export function FeatureGrid({
  features,
  titleOnTop = true,
}: {
  features: Feature[];
  titleOnTop?: boolean;
}) {
  return (
    <nav
      aria-label="Your wedding"
      className="mt-6 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-5 lg:grid-cols-5"
    >
      {features.map((feature) => (
        <FeatureTile key={feature.href} feature={feature} titleOnTop={titleOnTop} />
      ))}
    </nav>
  );
}
