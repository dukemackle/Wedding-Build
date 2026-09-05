import type { ItineraryEvent } from "@/lib/supabase/types";
import { formatFullDate, formatTime, sortByTime } from "@/lib/itinerary";

export function PrintSheet({
  coupleNames,
  events,
}: {
  coupleNames: string;
  events: ItineraryEvent[];
}) {
  const eventsByDate = new Map<string, ItineraryEvent[]>();
  for (const event of events) {
    const list = eventsByDate.get(event.event_date) ?? [];
    list.push(event);
    eventsByDate.set(event.event_date, list);
  }
  const dates = Array.from(eventsByDate.keys()).sort();

  return (
    <div className="rounded-lg border border-hairline bg-card p-6 shadow-sm sm:p-10 print:rounded-none print:border-0 print:p-0 print:shadow-none">
      <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
        Wedding weekend schedule
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-forest">
        {coupleNames || "Our Wedding"}
      </h1>

      {dates.length === 0 ? (
        <p className="mt-6 text-sm text-ink/50">No events scheduled yet.</p>
      ) : (
        dates.map((date) => (
          <div key={date} className="mt-8 first:mt-6">
            <h2 className="font-display text-xl font-semibold text-forest">
              {formatFullDate(date)}
            </h2>
            <div className="mt-3">
              {eventsByDate
                .get(date)!
                .sort(sortByTime)
                .map((event) => {
                  const timeRange = [
                    formatTime(event.start_time),
                    event.end_time && formatTime(event.end_time),
                  ]
                    .filter(Boolean)
                    .join(" – ");
                  return (
                    <div key={event.id} className="border-b border-hairline py-3 last:border-b-0">
                      <div className="flex flex-wrap items-baseline gap-2">
                        {timeRange && (
                          <span className="font-mono-numbers text-sm text-brass">
                            {timeRange}
                          </span>
                        )}
                        <span className="text-ink">{event.title}</span>
                      </div>
                      {event.location && (
                        <p className="mt-1 text-xs text-ink/50">{event.location}</p>
                      )}
                      {event.description && (
                        <p className="mt-1 text-sm text-ink/70">{event.description}</p>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
