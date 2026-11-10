import type { ComponentType, SVGProps } from "react";
import { businessFactRows, type BusinessFacts } from "@/lib/business-facts";
import { BarIcon, BudgetIcon, CalculatorIcon, CalendarIcon, ClockIcon, MusicIcon, RingsIcon, StarIcon } from "@/components/icons";
import { SectionHeading, listingCard } from "@/components/listing-parts";

const ROW_ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  "In business since": StarIcon,
  "Weddings a year": RingsIcon,
  "Couples usually book": CalendarIcon,
  "Usually replies": ClockIcon,
  "To book": BudgetIcon,
  "Balance due": CalculatorIcon,
  "Music until": MusicIcon,
  Alcohol: BarIcon,
};

/**
 * "Booking and policies" on a venue or vendor listing: the answers couples
 * otherwise email to get. Renders nothing until the business has filled any
 * of it in, so imported listings look as they did.
 */
export function BookingFactsCard({
  facts,
  extraRows = [],
  extraNotes = [],
  className = "",
}: {
  facts: BusinessFacts;
  /** Venue-only rules (curfew, alcohol), already worded. */
  extraRows?: [string, string | null][];
  /** Longer venue-only answers (the rain plan), shown as text below the rows. */
  extraNotes?: [string, string | null][];
  className?: string;
}) {
  const rows = [...businessFactRows(facts), ...extraRows.filter((r): r is [string, string] => Boolean(r[1]))];
  const notes = [...extraNotes, ["Cancellation and postponement", facts.cancellation_policy] as [string, string | null]].filter(
    (n): n is [string, string] => Boolean(n[1]),
  );
  if (rows.length === 0 && notes.length === 0) return null;
  return (
    <section id="policies" className={`${listingCard} ${className}`}>
      <SectionHeading
        eyebrow="Before you book"
        title="Booking and policies"
        sub="In their own words. Confirm anything that matters in your contract."
      />
      {rows.length > 0 && (
        <dl className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
          {rows.map(([label, value]) => {
            const Icon = ROW_ICONS[label];
            return (
              <div key={label} className="flex flex-col-reverse justify-end rounded-lg bg-parchment p-4">
                <dt className="mt-0.5 text-xs text-ink/60">{label}</dt>
                <dd className="font-semibold leading-snug text-forest">{value}</dd>
                {Icon && (
                  <dd aria-hidden className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-brass/20 text-forest">
                    <Icon className="h-4 w-4" />
                  </dd>
                )}
              </div>
            );
          })}
        </dl>
      )}
      {notes.map(([label, text]) => (
        <div key={label} className="mt-5 rounded-lg border-l-4 border-brass bg-parchment px-4 py-3 text-sm">
          <p className="font-semibold text-forest">{label}</p>
          <p className="mt-1 whitespace-pre-line leading-relaxed text-ink/80">{text}</p>
        </div>
      ))}
    </section>
  );
}
