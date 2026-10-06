import type { LeadCounts } from "@/lib/listing-leads";

/**
 * The top of a claim page: what this listing has already had from couples.
 * It's the reason a vendor bothers with the rest of the page, so it gets the
 * page's one gold moment. Nothing shows until there's something to show.
 */
export function LeadsCallout({ counts }: { counts: LeadCounts }) {
  if (counts.inquiries === 0 && counts.clicks === 0) return null;
  const stats = [
    { value: counts.inquiries, label: counts.inquiries === 1 ? "couple sent you an inquiry" : "couples sent you an inquiry" },
    { value: counts.clicks, label: counts.clicks === 1 ? "tap on your phone or website" : "taps on your phone or website" },
  ].filter((s) => s.value > 0);

  return (
    <div className="gold-flow-border mt-6 max-w-2xl rounded-xl p-[2px]">
      <div className="rounded-[10px] bg-card px-5 py-4">
        <p className="text-sm font-medium text-ink">From couples planning on You Do, I Do so far</p>
        <dl className="mt-3 flex flex-col gap-3 sm:flex-row sm:gap-10">
          {stats.map((s) => (
            <div key={s.label} className="flex items-baseline gap-2">
              <dt className="sr-only">{s.label}</dt>
              <dd className="font-display text-3xl font-semibold text-forest">{s.value}</dd>
              <span className="text-sm text-ink/70">{s.label}</span>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
