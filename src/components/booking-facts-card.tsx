import { businessFactRows, type BusinessFacts } from "@/lib/business-facts";

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
    <div className={`rounded-lg border border-hairline bg-card p-6 shadow-sm ${className}`}>
      <h2 className="font-display text-xl font-semibold text-forest">Booking and policies</h2>
      <p className="mt-1 text-sm text-ink/60">In their own words. Confirm anything that matters in your contract.</p>
      {rows.length > 0 && (
        <dl className="mt-3 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 border-b border-hairline py-2 text-sm">
              <dt className="shrink-0 text-ink/60">{label}</dt>
              <dd className="text-right text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      )}
      {notes.map(([label, text]) => (
        <div key={label} className="mt-4 text-sm">
          <p className="text-ink/60">{label}</p>
          <p className="mt-1 whitespace-pre-line text-ink/80">{text}</p>
        </div>
      ))}
    </div>
  );
}
