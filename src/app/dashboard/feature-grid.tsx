import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import {
  AttireIcon,
  BudgetIcon,
  CalculatorIcon,
  CalendarIcon,
  ChecklistIcon,
  FloorPlanIcon,
  HeadcountIcon,
  PaperclipIcon,
  VendorsIcon,
  VenueIcon,
} from "@/components/icons";

export type Feature = {
  href: string;
  title: string;
  /** One line on what the page is for. Hidden on a phone, where the tile is small. */
  blurb: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Where the couple stands on it, in a few words -- or nothing yet. */
  status?: string | null;
  /** 0-1, for the thin bar under a tile that has a natural "how far along". */
  progress?: number;
};

type FeatureCounts = {
  tasksDone: number;
  tasksTotal: number;
  budgetTotal: number;
  budgetTarget: number | null;
  guestsTotal: number;
  guestsConfirmed: number;
  venuesShortlisted: number;
  vendorsBooked: number;
  vendorsTracked: number;
  attireShortlisted: number;
};

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/** Every part of Wren, in the order a wedding tends to need them. */
export function buildFeatures(c: FeatureCounts): Feature[] {
  return [
    {
      href: "/checklist",
      title: "Checklist",
      blurb: "Everything to do, month by month.",
      icon: ChecklistIcon,
      status: c.tasksTotal > 0 ? `${c.tasksDone} of ${c.tasksTotal} done` : "Build your plan",
      progress: c.tasksTotal > 0 ? c.tasksDone / c.tasksTotal : undefined,
    },
    {
      href: "/budget",
      title: "Budget",
      blurb: "What it costs, and what's been paid.",
      icon: BudgetIcon,
      status:
        c.budgetTarget != null
          ? `${usd(c.budgetTotal)} of ${usd(c.budgetTarget)}`
          : usd(c.budgetTotal),
    },
    {
      href: "/guests",
      title: "Guests",
      blurb: "Your list, RSVPs and guest site.",
      icon: HeadcountIcon,
      status:
        c.guestsTotal > 0
          ? `${c.guestsTotal} invited · ${c.guestsConfirmed} yes`
          : "Start your list",
    },
    {
      href: "/venues",
      title: "Venues",
      blurb: "Find the place and compare them.",
      icon: VenueIcon,
      status: c.venuesShortlisted > 0 ? `${c.venuesShortlisted} shortlisted` : null,
    },
    {
      href: "/vendors",
      title: "Vendors",
      blurb: "Photographers, florists, music and more.",
      icon: VendorsIcon,
      status: c.vendorsTracked > 0 ? `${c.vendorsBooked} of ${c.vendorsTracked} booked` : null,
    },
    {
      href: "/attire",
      title: "Attire",
      blurb: "Dresses, suits and the wedding party.",
      icon: AttireIcon,
      status: c.attireShortlisted > 0 ? `${c.attireShortlisted} shortlisted` : null,
    },
    {
      href: "/bookings",
      title: "Bookings",
      blurb: "Contracts, contacts and deposits.",
      icon: PaperclipIcon,
      status: c.vendorsBooked > 0 ? `${c.vendorsBooked} booked` : null,
    },
    {
      href: "/itinerary",
      title: "Itinerary",
      blurb: "The day, hour by hour.",
      icon: CalendarIcon,
    },
    {
      href: "/venue-layout",
      title: "Venue Layout",
      blurb: "Tables, seating and the floor plan.",
      icon: FloorPlanIcon,
    },
    {
      href: "/budget/estimate",
      title: "Estimator",
      blurb: "What a wedding like yours costs.",
      icon: CalculatorIcon,
    },
  ];
}

function FeatureTile({ feature }: { feature: Feature }) {
  const { href, title, blurb, icon: Icon, status, progress } = feature;
  return (
    <Link
      href={href}
      className="group relative flex min-h-[132px] flex-col overflow-hidden rounded-2xl border border-hairline bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brass/50 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass sm:min-h-[220px] sm:p-7"
    >
      {/* A brass rule that draws in across the top on hover. */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-brass transition-transform duration-500 group-hover:scale-x-100"
      />

      <div className="flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-forest/[0.07] text-forest transition-colors duration-300 group-hover:bg-forest group-hover:text-parchment sm:h-14 sm:w-14">
          <Icon className="h-5 w-5 sm:h-7 sm:w-7" />
        </span>
        <span
          aria-hidden="true"
          className="hidden text-lg text-brass opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 sm:block sm:-translate-x-2"
        >
          &rarr;
        </span>
      </div>

      <h2 className="mt-4 font-display text-xl font-semibold leading-tight text-forest sm:mt-8 sm:text-[1.75rem]">
        {title}
      </h2>
      <p className="mt-1.5 hidden text-sm leading-snug text-ink/60 sm:block">{blurb}</p>

      <div className="mt-auto pt-1 sm:pt-4">
        <p className="font-mono-numbers text-[11px] leading-snug tracking-wide text-ink/50 sm:truncate sm:text-xs sm:text-brass">
          {status}
        </p>
        {progress !== undefined && (
          <span aria-hidden="true" className="mt-2 block h-1 overflow-hidden rounded-full bg-hairline">
            <span
              className="block h-full rounded-full bg-forest"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </span>
        )}
      </div>
    </Link>
  );
}

/**
 * The dashboard, below the banner: one box per part of Wren, and nothing else.
 *
 * Deliberately not a summary. The old dashboard answered every question at
 * once -- tasks, budget bars, RSVPs, a vendor tracker -- and read as a wall.
 * Each box carries at most one line of where things stand; the detail lives
 * one click away on the page itself.
 *
 * A phone gets two small boxes across (icon, name, status); a wide screen
 * gets five tall ones with a line on what each page is for.
 */
export function FeatureGrid({ features }: { features: Feature[] }) {
  return (
    <nav
      aria-label="Your wedding"
      className="mt-6 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-5 lg:grid-cols-5"
    >
      {features.map((feature) => (
        <FeatureTile key={feature.href} feature={feature} />
      ))}
    </nav>
  );
}
