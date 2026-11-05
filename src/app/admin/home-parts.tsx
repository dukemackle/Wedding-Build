import Link from "next/link";
import { STATE_ABBR } from "@/lib/listing-pin";
import { AdminIcon, type AdminIconName } from "./admin-icons";

/** How soon a queue item wants the owner: shape and colour, not only words. */
export type Urgency = "urgent" | "soon" | "whenever";

const CHIP: Record<Urgency, { label: string; chip: string; tile: string }> = {
  urgent: { label: "Urgent", chip: "bg-[#FDECEA] text-[#B4321F]", tile: "bg-[#FDECEA] text-[#B4321F]" },
  soon: { label: "Today", chip: "bg-[#FFF4D6] text-[#8A5A00]", tile: "bg-[#FFF6BF] text-[#8A5A00]" },
  whenever: { label: "When you can", chip: "bg-[#EEF0F6] text-ink/65", tile: "bg-wren-soft text-wren-deep" },
};

export function QueueRow({
  icon,
  title,
  detail,
  urgency,
  href,
  action,
  primary,
}: {
  icon: AdminIconName;
  title: string;
  detail?: string | null;
  urgency: Urgency;
  href: string;
  action: string;
  primary?: boolean;
}) {
  const c = CHIP[urgency];
  return (
    <li className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3.5 gap-y-2 px-5 py-3.5 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
      <span className={`grid h-9 w-9 place-items-center rounded-[10px] ${c.tile}`} aria-hidden>
        <AdminIcon name={icon} className="h-[18px] w-[18px]" />
      </span>
      <div>
        <p className="text-[15px] font-semibold">{title}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-ink/60">
          <span className={`rounded-full px-2 font-mono-numbers text-[10.5px] font-medium uppercase tracking-wide ${c.chip}`}>{c.label}</span>
          {detail}
        </p>
      </div>
      <Link
        href={href}
        className={`col-start-2 justify-self-start rounded-lg border px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors sm:col-start-3 ${
          primary
            ? "border-forest bg-[#14203d] text-white hover:border-[#2243B6] hover:bg-[#2243B6]"
            : "border-hairline bg-card text-ink hover:border-[#2243B6] hover:text-[#2243B6]"
        }`}
      >
        {action}
      </Link>
    </li>
  );
}

/** A small trend line: one scale, faint area, the latest point marked. */
export function Sparkline({ points }: { points: number[] }) {
  if (points.length < 2) return null;
  const W = 200;
  const H = 34;
  const p = 3;
  const min = Math.min(...points);
  const range = Math.max(...points) - min || 1;
  const xy = points.map((v, i) => [p + (i * (W - 2 * p)) / (points.length - 1), H - p - ((v - min) / range) * (H - 2 * p)]);
  const line = xy.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const [lx, ly] = xy[xy.length - 1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="mt-1 h-8 w-full" aria-hidden>
      <polygon points={`${p},${H} ${line} ${W - p},${H}`} fill="#2243B6" fillOpacity={0.08} />
      <polyline points={line} fill="none" stroke="#2243B6" strokeWidth={1.6} vectorEffect="non-scaling-stroke" />
      <circle cx={lx} cy={ly} r={2.6} fill="#2243B6" />
    </svg>
  );
}

export function KpiTile({
  href,
  value,
  label,
  change,
  trend,
  definition,
  points,
}: {
  href: string;
  value: number;
  label: string;
  change: string;
  /** Last 30 days against the 30 before: decides the chip's colour. */
  trend?: "up" | "down" | "flat";
  definition: string;
  points?: number[];
}) {
  const chip =
    trend === "up" ? "bg-[#E5F5EC] text-[#1D7A4C]" : trend === "down" ? "bg-[#FDECEA] text-[#B4321F]" : "bg-[#EEF0F6] text-ink/65";
  const arrow = trend === "up" ? "▲ " : trend === "down" ? "▼ " : "";
  return (
    <Link
      href={href}
      className="flex flex-col gap-1 rounded-xl border border-hairline bg-card px-4 pt-3.5 pb-3 transition-colors hover:border-[#2243B6]"
    >
      <span className="text-[13px] font-medium text-ink/65">{label}</span>
      <span className="flex flex-wrap items-baseline gap-2">
        <span className="font-mono-numbers text-[26px] font-medium tracking-tight tabular-nums">{value.toLocaleString()}</span>
        <span className={`rounded-md px-1.5 font-mono-numbers text-[11.5px] ${chip}`}>
          {arrow}
          {change}
        </span>
      </span>
      {points && <Sparkline points={points} />}
      <span className="mt-auto text-[11px] leading-snug text-ink/45">{definition}</span>
    </Link>
  );
}

export function KpiGroup({ title, dot, children }: { title: string; dot: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="flex items-center gap-2 font-mono-numbers text-[11px] uppercase tracking-[0.14em] text-ink/60">
        <span className={`h-2 w-2 rounded-[2px] ${dot}`} aria-hidden />
        {title}
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">{children}</div>
    </section>
  );
}

/** A card with an icon tile and a title, for Home's sections. */
export function Panel({
  icon,
  tile,
  title,
  aside,
  children,
}: {
  icon: AdminIconName;
  tile: string;
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-hairline bg-card">
      <header className="flex items-center gap-2.5 border-b border-hairline px-5 py-3">
        <span className={`grid h-8 w-8 place-items-center rounded-lg ${tile}`} aria-hidden>
          <AdminIcon name={icon} className="h-[17px] w-[17px]" />
        </span>
        <h2 className="font-display text-2xl font-semibold text-forest">{title}</h2>
        {aside && <div className="ml-auto">{aside}</div>}
      </header>
      {children}
    </section>
  );
}

// Each state's square on a 12-column tile map: [row, column].
const TILE: Record<string, [number, number]> = {
  AK: [0, 0], ME: [0, 11], VT: [1, 10], NH: [1, 11],
  WA: [2, 1], ID: [2, 2], MT: [2, 3], ND: [2, 4], MN: [2, 5], IL: [2, 6], WI: [2, 7], MI: [2, 8], NY: [2, 9], RI: [2, 10], MA: [2, 11],
  OR: [3, 1], NV: [3, 2], WY: [3, 3], SD: [3, 4], IA: [3, 5], IN: [3, 6], OH: [3, 7], PA: [3, 8], NJ: [3, 9], CT: [3, 10],
  CA: [4, 1], UT: [4, 2], CO: [4, 3], NE: [4, 4], MO: [4, 5], KY: [4, 6], WV: [4, 7], VA: [4, 8], MD: [4, 9], DE: [4, 10],
  AZ: [5, 2], NM: [5, 3], KS: [5, 4], AR: [5, 5], TN: [5, 6], NC: [5, 7], SC: [5, 8],
  OK: [6, 4], LA: [6, 5], MS: [6, 6], AL: [6, 7], GA: [6, 8],
  HI: [7, 0], TX: [7, 4], FL: [7, 9],
};

/** Every state as a square: Royal at the venue floor, Aqua partway, grey empty. */
export function StateTileMap({ states, floor }: { states: { state: string; venues: number; vendors: number }[]; floor: number }) {
  return (
    <>
      <div className="mt-3 grid grid-cols-12 gap-[3px]" role="img" aria-label={`States by venue count against the ${floor}-venue floor`}>
        {states.map((s) => {
          const abbr = STATE_ABBR[s.state];
          const pos = abbr && TILE[abbr];
          if (!pos) return null;
          const tone = s.venues >= floor ? "bg-[#2243B6] text-white" : s.venues > 0 ? "bg-[#5AE4FF] text-forest" : "bg-[#ECEEF4] text-ink/45";
          return (
            <span
              key={s.state}
              title={`${s.state}: ${s.venues} venues · ${s.vendors} vendors`}
              style={{ gridRow: pos[0] + 1, gridColumn: pos[1] + 1 }}
              className={`grid aspect-square place-items-center rounded font-mono-numbers text-[8.5px] font-medium ${tone}`}
            >
              {abbr}
            </span>
          );
        })}
      </div>
      <p className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-[11.5px] text-ink/60">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[3px] bg-[#2243B6]" />{floor}+ venues</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[3px] bg-[#5AE4FF]" />1–{floor - 1}</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[3px] bg-[#ECEEF4]" />None</span>
      </p>
    </>
  );
}

export type Health = "ok" | "warn" | "bad" | "none";
export const HEALTH_DOT: Record<Health, string> = {
  ok: "bg-[#1D7A4C]",
  warn: "bg-[#E0A100]",
  bad: "bg-[#B4321F]",
  none: "bg-[#C3C8D6]",
};
