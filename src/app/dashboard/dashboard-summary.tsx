import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import {
  HeadcountIcon,
  BudgetIcon,
  VenueIcon,
  VendorsIcon,
  AttireIcon,
} from "@/components/icons";
import { AnimatedCounter } from "@/components/animated-counter";

export type DashboardSummaryData = {
  guestsConfirmed: number;
  guestsPending: number;
  guestsDeclined: number;
  guestsTotal: number;
  headcount: number;
  budgetTotal: number;
  budgetCategoriesQuoted: number;
  budgetCategoriesTotal: number;
  venuesShortlisted: number;
  vendorInquiriesSent: number;
  vendorInquiriesBooked: number;
  attireShortlisted: number;
};

function SummaryTile({
  icon,
  accent,
  label,
  value,
  format,
  detail,
  href,
  linkLabel,
}: {
  icon: ComponentType<{ className?: string }>;
  accent: "forest" | "brass";
  label: string;
  value: number;
  format?: "number" | "currency";
  detail: string;
  href: string;
  linkLabel: string;
}) {
  const Icon = icon;
  return (
    <div className="flex flex-col gap-2 rounded-md border border-hairline bg-parchment p-4 transition-shadow hover:shadow-sm">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-full ${
          accent === "forest" ? "bg-forest/10" : "bg-brass/10"
        }`}
      >
        <Icon className={`h-5 w-5 ${accent === "forest" ? "text-forest" : "text-brass"}`} />
      </div>
      <span className="font-mono-numbers text-xs uppercase tracking-wide text-ink/50">
        {label}
      </span>
      <span className="font-mono-numbers text-2xl font-semibold text-forest">
        <AnimatedCounter value={value} format={format} />
      </span>
      <span className="text-xs text-ink/60">{detail}</span>
      <Link
        href={href}
        className="mt-1 text-xs font-medium text-brass transition-colors hover:text-forest"
      >
        {linkLabel} &rarr;
      </Link>
    </div>
  );
}

/**
 * The snapshot, and whatever sits beside it.
 *
 * Previously three stacked cards -- counts, booked venue, next tasks -- which
 * between them said "here is the state of your wedding" three times with three
 * headings. One card, two columns: what's done on the left, what's next on the
 * right. The booked venue is a line rather than a box because that's all it
 * ever was.
 */
export function DashboardSummary({
  data,
  bookedVenue,
  aside,
}: {
  data: DashboardSummaryData;
  bookedVenue?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="mt-8 w-full max-w-5xl rounded-lg border border-hairline bg-card p-6 sm:p-8 shadow-sm">
      <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr]">
        <div>
      <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
        At a glance
      </p>
      <h2 className="mt-2 mb-6 font-display text-2xl font-semibold text-forest">
        Where things stand
      </h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <SummaryTile
          icon={HeadcountIcon}
          accent="forest"
          label="Headcount"
          value={data.headcount}
          detail={
            data.guestsTotal > 0
              ? `${data.guestsConfirmed} confirmed, ${data.guestsPending} pending, ${data.guestsDeclined} declined`
              : "No guests added yet"
          }
          href="/guests"
          linkLabel="View guests"
        />
        <SummaryTile
          icon={BudgetIcon}
          accent="brass"
          label="Budget"
          value={data.budgetTotal}
          format="currency"
          detail={`${data.budgetCategoriesQuoted} of ${data.budgetCategoriesTotal} categories have a real quote`}
          href="/budget"
          linkLabel="View budget"
        />
        <SummaryTile
          icon={VenueIcon}
          accent="forest"
          label="Venues"
          value={data.venuesShortlisted}
          detail={
            data.venuesShortlisted === 1 ? "venue shortlisted" : "venues shortlisted"
          }
          href="/venues"
          linkLabel="View venues"
        />
        <SummaryTile
          icon={VendorsIcon}
          accent="brass"
          label="Vendors"
          value={data.vendorInquiriesSent}
          detail={`${data.vendorInquiriesSent === 1 ? "inquiry" : "inquiries"} sent, ${data.vendorInquiriesBooked} booked`}
          href="/vendors"
          linkLabel="View vendors"
        />
        <SummaryTile
          icon={AttireIcon}
          accent="forest"
          label="Attire"
          value={data.attireShortlisted}
          detail={
            data.attireShortlisted === 1 ? "item shortlisted" : "items shortlisted"
          }
          href="/attire"
          linkLabel="View attire"
        />
      </div>
          {bookedVenue}
        </div>
        {aside && <div className="lg:border-l lg:border-hairline lg:pl-8">{aside}</div>}
      </div>
    </div>
  );
}
