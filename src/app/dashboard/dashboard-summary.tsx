import Link from "next/link";
import type { ComponentType } from "react";
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

function formatCurrency(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

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
  format?: (n: number) => string;
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

export function DashboardSummary({ data }: { data: DashboardSummaryData }) {
  return (
    <div className="mt-8 w-full max-w-2xl rounded-lg border border-hairline bg-card p-6 sm:p-10 shadow-sm">
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
          format={formatCurrency}
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
    </div>
  );
}
