import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import {
  VenueIcon,
  CateringIcon,
  BarIcon,
  PhotographyIcon,
  VideographyIcon,
  FloralsIcon,
  MusicIcon,
  PlannerIcon,
  CakeIcon,
  HairMakeupIcon,
  OfficiantIcon,
  TransportationIcon,
} from "@/components/icons";
import { DashboardPanel } from "./dashboard-panel";
import type { VendorStatus, VendorTrackerRow } from "./dashboard-data";

const ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  venue: VenueIcon,
  catering: CateringIcon,
  bar: BarIcon,
  photography: PhotographyIcon,
  videography: VideographyIcon,
  florals: FloralsIcon,
  music: MusicIcon,
  planner: PlannerIcon,
  cake: CakeIcon,
  hair_makeup: HairMakeupIcon,
  officiant: OfficiantIcon,
  transportation: TransportationIcon,
};

const STATUS: Record<VendorStatus, { label: string; tile: string; badge: string; icon: string }> = {
  booked: {
    label: "Booked",
    tile: "border-forest/30 bg-forest/[0.04]",
    badge: "bg-forest text-parchment",
    icon: "bg-forest text-parchment",
  },
  talking: {
    label: "In talks",
    tile: "border-brass/40 bg-brass/[0.05]",
    badge: "bg-brass/15 text-brass",
    icon: "bg-brass/15 text-brass",
  },
  quoted: {
    label: "Quote in",
    tile: "border-brass/40 bg-brass/[0.05]",
    badge: "bg-brass/15 text-brass",
    icon: "bg-brass/15 text-brass",
  },
  shortlisted: {
    label: "Shortlisted",
    tile: "border-brass/40 bg-brass/[0.05]",
    badge: "bg-brass/15 text-brass",
    icon: "bg-brass/15 text-brass",
  },
  open: {
    label: "Not started",
    tile: "border-hairline bg-parchment",
    badge: "bg-ink/5 text-ink/50",
    icon: "bg-ink/5 text-ink/40",
  },
};

/**
 * Who's booked, who's being talked to, and what nobody has started.
 *
 * The question couples actually ask each other -- "have we got a photographer
 * yet?" -- used to take a trip to three pages. One tile per booking, coloured
 * by how far along it is, answers it at a glance.
 */
export function VendorTracker({ rows }: { rows: VendorTrackerRow[] }) {
  const booked = rows.filter((row) => row.status === "booked").length;
  const pct = rows.length > 0 ? (booked / rows.length) * 100 : 0;

  return (
    <DashboardPanel
      eyebrow="Bookings"
      title={`${booked} of ${rows.length} booked`}
      summary={`${rows.filter((r) => r.status === "open").length} not started yet`}
      action={{ href: "/vendors", label: "Find vendors" }}
      collapsible
    >
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-hairline">
        <div className="h-full rounded-full bg-forest transition-all" style={{ width: `${pct}%` }} />
      </div>
      <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {rows.map((row) => {
          const Icon = ICONS[row.key] ?? VenueIcon;
          const style = STATUS[row.status];
          return (
            <li key={row.key}>
              <Link
                href={row.href}
                className={`flex h-full items-center gap-3 rounded-lg border p-3 transition-shadow hover:shadow-sm ${style.tile}`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${style.icon}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">{row.label}</span>
                  <span className="block truncate text-xs text-ink/55">
                    {row.detail ?? (row.key === "venue" ? "Browse venues" : "Browse vendors")}
                  </span>
                </span>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 font-mono-numbers text-[10px] uppercase tracking-wide ${style.badge}`}
                >
                  {style.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </DashboardPanel>
  );
}
