import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { VendorTrackerRow } from "./dashboard-data";
import { vendorCategoryIconPaths } from "@/lib/vendor-category-icons";
import { SAVED_ICON } from "@/lib/venue-type-icons";
import { RsvpYesCount } from "./rsvp-count";

export type Feature = {
  href: string;
  title: string;
  /** Where the couple stands on it, in a few words. */
  status: string;
  /** The top of the box: the couple's own photo or a glimpse of their data. */
  media: ReactNode;
  /** One line on what the part does -- the landing page, for visitors who haven't used it. */
  blurb?: string;
};

export type FeatureData = {
  checklist: { done: number; total: number; next: { title: string; due: string | null }[] };
  budget: {
    total: number;
    /** Real numbers only (overrides plus custom items), no estimates. */
    actual: number;
    target: number | null;
    paid: number;
    quoted: number;
    categories: number;
  };
  guests: { total: number; confirmed: number; pending: number; declined: number };
  /** Remembers the RSVP count per wedding so a new "yes" can bump it. Absent on the landing sample. */
  weddingId?: string;
  venue: { photo: string | null; name: string; booked: boolean } | null;
  venuesShortlisted: number;
  vendors: VendorTrackerRow[];
  attire: { photo: string | null; name: string } | null;
  attireShortlisted: number;
  itinerary: { time: string | null; title: string }[];
  layoutItems: number;
  /** The guest site: the couple's names and date as it shows them, and whether it's published. */
  site: { names: string; date: string | null; live: boolean; photo?: string | null };
};

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const shortDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const longDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

function clockTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  return `${h % 12 || 12}${m ? `:${String(m).padStart(2, "0")}` : ""}${h >= 12 ? "pm" : "am"}`;
}

const pct = (part: number, whole: number) =>
  `${whole > 0 ? Math.min(100, Math.round((part / whole) * 100)) : 0}%`;

/* ---------- What fills each box ---------- */

/**
 * Stand-in photos (the landing page's, Unsplash) for boxes that would
 * otherwise open on a drawing, until the couple has a photo of their own.
 */
const STOCK = {
  venue: "/landing/features/venues.webp",
  attire: "/landing/features/attire.webp",
};

/** A photo filling the box, with a label across its foot. */
function PhotoMedia({ src, label }: { src: string; label?: string }) {
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
      {label && (
        <p className="absolute inset-x-3 bottom-2 truncate font-mono-numbers text-[9px] uppercase tracking-[0.2em] text-white sm:inset-x-4 sm:bottom-3 sm:text-[10px]">
          {label}
        </p>
      )}
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

export function Panel({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 flex flex-col justify-center gap-2 bg-parchment px-3 sm:gap-2.5 sm:px-5">
      {children}
    </div>
  );
}

export function Big({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono-numbers text-lg font-semibold text-forest sm:text-2xl">
      {children}
    </span>
  );
}

/** A few words in place of a number, for a box with nothing in it yet. */
export function Phrase({ children }: { children: ReactNode }) {
  return (
    <span className="font-display text-xl font-semibold leading-tight text-forest sm:text-2xl">
      {children}
    </span>
  );
}

export function Small({ children }: { children: ReactNode }) {
  return <span className="font-mono-numbers text-[9px] text-ink/50 sm:text-[10px]">{children}</span>;
}

type Line = { key: string; lead: ReactNode; text: string; tail?: string | null };

/**
 * A short list, the third line hidden on a phone where the box is small.
 * `wrap` gives each line room for two rows of text instead of cutting it
 * off, and shows two lines rather than three to make the room.
 */
function Lines({ rows, wrap = false }: { rows: Line[]; wrap?: boolean }) {
  return (
    <>
      {(wrap ? rows.slice(0, 2) : rows).map((row, i) => (
        <div
          key={row.key}
          className={`flex gap-2 ${wrap ? "items-start [&>span:first-child]:mt-0.5" : "items-center"} ${i === 2 ? "hidden sm:flex" : ""}`}
        >
          {row.lead}
          <span
            className={`min-w-0 flex-1 text-[11px] text-ink/80 sm:text-sm ${wrap ? "line-clamp-2 leading-snug" : "truncate"}`}
          >
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

/**
 * A map with vendors pinned on it -- the Vendors page is a map beside a list,
 * so the box shows that map: the same base-map colours (Protomaps "light",
 * src/lib/own-map-style.ts) and the same pins (badge-pin.ts and
 * clustered-markers.tsx) -- category badges up close, a numbered cluster and
 * gold dots further out. Drawn rather than a screenshot so it needs no tiles
 * and stays crisp. Booked vendors wear the saved heart.
 */
const MAP_BADGES: [number, number, string][] = [
  [58, 70, "Photography"],
  [128, 62, "Florals"],
  [92, 112, "Catering"],
  [160, 118, "Music"],
  [40, 150, "Cake"],
];
const MAP_DOTS = [[176, 36], [18, 100], [118, 148], [188, 150]];

function MapDrawing({ booked }: { booked: number }) {
  return (
    <svg
      viewBox="0 0 200 180"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className="absolute inset-0 h-full w-full bg-[#e2dfda] transition-transform duration-700 group-hover:scale-105"
    >
      <path d="M118 0 H200 V48 C180 56 160 40 140 44 S118 20 118 0Z" fill="#cfddd5" />
      <path d="M0 160 C20 150 40 168 70 164 L76 180 H0Z" fill="#cfddd5" />
      <path d="M-5 104 C30 92 50 128 90 132 S150 150 205 140" fill="none" stroke="#80deea" strokeWidth="9" />
      <g fill="none" stroke="#ebebeb" strokeWidth="2">
        <path d="M0 40 H200M0 124 H200M30 0 V180M110 0 V180M174 0 V180" />
      </g>
      <g fill="none" stroke="#e0e0e0" strokeWidth="6" strokeLinecap="round">
        <path d="M0 86 H200M72 0 V180M150 0 L136 180" />
      </g>
      <g fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round">
        <path d="M0 86 H200M72 0 V180M150 0 L136 180" />
      </g>
      {MAP_DOTS.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="4.5" fill="#FFD301" stroke="#14203D" strokeWidth="2.2" />
      ))}
      <g transform="translate(28 40)">
        <circle r="11" fill="#14203D" stroke="#fff" strokeWidth="2" />
        <text y="4" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700" fontFamily="ui-sans-serif,system-ui,sans-serif">
          12
        </text>
      </g>
      {MAP_BADGES.map(([x, y, category], i) => {
        const saved = i < booked;
        return (
          <g key={category} transform={`translate(${x} ${y})`}>
            <path d="M-4 -3 L0 3 L4 -3Z" fill="#14203D" />
            <circle cy="-14" r="12" fill="#14203D" stroke="#fff" strokeWidth="1.8" style={{ filter: "drop-shadow(0 1px 2px rgba(20,32,61,.35))" }} />
            <circle cy="-14" r="9" fill={saved ? "#fff" : "#FFD301"} />
            <svg
              x="-6"
              y="-20"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#14203D"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              dangerouslySetInnerHTML={{ __html: saved ? SAVED_ICON : vendorCategoryIconPaths(category) }}
            />
          </g>
        );
      })}
    </svg>
  );
}

/* ---------- The ten boxes ---------- */

/**
 * Every part of Wren, most used first. On a wide screen the top row is
 * Budget, Guests, Venues, Vendors, then the checklist at the far right.
 */
export function buildFeatures(d: FeatureData): Feature[] {
  const booked = d.vendors.filter((v) => v.status === "booked");
  // Over/under the target by the projection, estimates included -- the same
  // figure shown big above it. Against real numbers alone, a couple with no
  // quotes yet read as "$60,000 under", which said nothing.
  const target = d.budget.target;
  const over = target != null ? d.budget.total - target : null;
  const overLabel =
    target == null || over == null
      ? null
      : over > 0
        ? `${usd(over)} over`
        : `${usd(-over)} under`;

  // Which box's status line reads as an instruction ("Book your venue",
  // "Publish it", "3 overdue"). The gold itself moved to the next-step card
  // above the grid (next-step.ts), so the page has one highlight, not two.
  const today = new Date().toISOString().slice(0, 10);
  const overdue = d.checklist.next.filter((t) => t.due && t.due < today).length;
  const next: "venue" | "site" | "checklist" | null = !d.venue?.booked
    ? "venue"
    : d.guests.total > 0 && !d.site.live
      ? "site"
      : overdue > 0
        ? "checklist"
        : null;

  const features: Feature[] = [
    {
      href: "/budget",
      title: "Budget",
      status: `${d.budget.quoted} of ${d.budget.categories} quoted`,
      media: (
        <Panel>
          <div className="flex flex-wrap items-baseline gap-x-2">
            <Big>{usd(d.budget.total)}</Big>
            <Small>{target != null ? `of ${usd(target)}` : "estimated"}</Small>
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
          <div className="flex justify-between gap-2 whitespace-nowrap">
            <span className="hidden sm:inline">
              <Small>
                <span className="text-forest">■</span> {usd(d.budget.paid)} paid
              </Small>
            </span>
            {overLabel && (
              <span
                className={`font-mono-numbers text-[9px] sm:text-[10px] ${(over ?? 0) > 0 ? "text-brass" : "text-forest"}`}
              >
                {overLabel}
              </span>
            )}
          </div>
        </Panel>
      ),
    },
    {
      href: "/guests",
      title: "Guests",
      status:
        d.guests.total === 0
          ? "Start your list"
          : d.guests.confirmed > 0
            ? `${d.guests.confirmed} coming`
            : d.site.live
              ? "No replies yet"
              : "RSVPs not open yet",
      media: d.guests.total === 0 ? (
        <Panel>
          <Phrase>Add your first guests</Phrase>
          <Small>Names, RSVPs and plus-ones in one list</Small>
        </Panel>
      ) : (
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
              <span className="text-forest">■</span>{" "}
              <RsvpYesCount count={d.guests.confirmed} seenKey={d.weddingId} />
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
        : next === "venue"
          ? "Book your venue"
        : d.venuesShortlisted > 0
          ? `${d.venuesShortlisted} shortlisted`
          : "Find your place",
      // Their venue's photo, or a stand-in with its name when the listing has
      // none. The drawing is only for a couple who hasn't picked one.
      media: d.venue ? (
        <PhotoMedia src={d.venue.photo ?? STOCK.venue} label={d.venue.name} />
      ) : (
        <DrawingMedia src="/venue-types/barn-rustic.svg" />
      ),
    },
    {
      href: "/vendors",
      title: "Vendors",
      status:
        d.vendors.length > 0 ? `${booked.length} of ${d.vendors.length} booked` : "Find your team",
      media: <MapDrawing booked={booked.length} />,
    },
    {
      href: "/checklist",
      title: "Checklist",
      status:
        next === "checklist"
          ? `${overdue} overdue`
          : d.checklist.total > 0
            ? `${d.checklist.done} of ${d.checklist.total} done`
            : "Build your plan",
      media: (
        <Panel>
          {d.checklist.next.length > 0 ? (
            <>
              <Lines
                wrap
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
      href: "/bookings",
      title: "Bookings",
      status: booked.length > 0 ? `${booked.length} booked` : "Contracts & contacts",
      media: (
        <Panel>
          {booked.length > 0 ? (
            <Lines
              wrap
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
      href: "/attire",
      title: "Attire",
      status: d.attireShortlisted > 0 ? `${d.attireShortlisted} saved` : "Find the look",
      media: d.attire?.photo ? (
        <PhotoMedia src={d.attire.photo} label={d.attire.name} />
      ) : (
        <PhotoMedia src={STOCK.attire} />
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
            wrap
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
      title: "Layout",
      status: d.layoutItems > 0 ? `${d.layoutItems} pieces placed` : "Arrange the room",
      media: <FloorPlanDrawing />,
    },
    {
      href: "/guests/site",
      title: "Website",
      status: d.site.live
        ? "Live for guests"
        : next === "site"
          ? "Publish it"
          : "Design yours",
      // Their banner photo once they've chosen one; until then the top of the
      // site as text: names, date, and whether guests can see it.
      media: d.site.photo ? (
        <PhotoMedia src={d.site.photo} label={d.site.names} />
      ) : (
        <Panel>
          <Phrase>{d.site.names}</Phrase>
          <Small>{d.site.date ? d.site.live ? `${longDate(d.site.date)} · RSVP online` : longDate(d.site.date) : "Your date, schedule and RSVP"}</Small>
          {/* Whether guests can see it -- a label, not a button, since the whole box is the link. */}
          <span className="flex items-center gap-1.5 font-mono-numbers text-[9px] uppercase tracking-[0.15em] text-ink/55 sm:text-[10px]">
            <span className={`h-1.5 w-1.5 rounded-full ${d.site.live ? "bg-forest" : "border border-ink/40"}`} />
            {d.site.live ? "Live" : "Not published"}
          </span>
        </Panel>
      ),
    },
  ];

  return features;
}

/**
 * `asBox` drops the link, for a tile something else makes clickable -- the
 * landing page opens a preview instead of navigating.
 */
export function FeatureTile({ feature, asBox = false }: { feature: Feature; asBox?: boolean }) {
  const { href, title, status, media, blurb } = feature;
  const words = (
    <div className="px-3 py-3 sm:px-5 sm:py-4">
      <h2 className="font-display text-[1.6rem] font-bold leading-none text-forest sm:text-[2.35rem]">
        {title}
      </h2>
      <p
        className={`mt-2 truncate font-mono-numbers text-[11px] tracking-wide sm:text-xs text-ink/55`}
      >
        {status}
      </p>
      {blurb && (
        <p className="mt-2 line-clamp-3 text-[11px] leading-snug text-ink/70 sm:text-sm">{blurb}</p>
      )}
    </div>
  );
  const className = `group relative flex h-full flex-col overflow-hidden rounded-2xl border border-hairline bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brass hover:shadow-[0_14px_40px_-12px_rgba(224,161,0,0.55)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass`;
  const inner = (
    <>
      {/* Grows to fill the box, so a neighbour's two-line title never leaves a gap. */}
      <div
        className="relative min-h-28 flex-1 overflow-hidden border-b border-hairline sm:min-h-40"
      >
        {media}
        <span
          aria-hidden="true"
          className="absolute right-3 top-3 hidden h-9 w-9 items-center justify-center rounded-full border border-brass/40 bg-card/90 text-brass opacity-0 shadow-sm transition-all duration-300 group-hover:opacity-100 sm:flex"
        >
          &rarr;
        </span>
      </div>
      {words}
      {/* A band of gold light that sweeps across the box on hover. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -translate-x-full -skew-x-12 bg-gradient-to-r from-transparent via-[#ffe45c]/35 to-transparent opacity-0 transition-[transform,opacity] duration-700 ease-out group-hover:translate-x-[400%] group-hover:opacity-100 motion-reduce:hidden"
      />
    </>
  );
  return asBox ? (
    <div className={className}>{inner}</div>
  ) : (
    <Link href={href} className={className}>
      {inner}
    </Link>
  );
}

/**
 * The dashboard, below the banner: one box per part of Wren, and nothing else.
 *
 * Each box is a picture of what's behind it -- the couple's own venue photo,
 * their budget bar, their next tasks -- over its name set large, so the box
 * reads as a door from across the room. Where they haven't added anything yet
 * it shows Wren's own drawing or an example, never an empty grey square.
 *
 * Two across on a phone, five on a wide screen.
 */
export function FeatureGrid({ features, tail }: { features: Feature[]; tail?: ReactNode }) {
  return (
    <div className="mt-6 flex flex-col gap-3 sm:mt-10 sm:gap-5 lg:mt-5">
      <nav aria-label="Your wedding" className="grid auto-rows-fr grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-5">
        {features.map((feature) => (
          <FeatureTile key={feature.href} feature={feature} />
        ))}
      </nav>
      {/* A full-width strip below the boxes (Ask Wren), spaced like one of them. */}
      {tail}
    </div>
  );
}
