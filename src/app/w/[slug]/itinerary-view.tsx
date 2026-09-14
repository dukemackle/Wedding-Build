"use client";

import type { ItineraryEvent } from "@/lib/supabase/types";
import { formatFullDate, formatTime, groupEventsByDate } from "@/lib/itinerary";
import { downloadIcs } from "@/lib/ics";

export function ItineraryView({
  events,
  weddingDate,
}: {
  events: ItineraryEvent[];
  weddingDate: string | null;
}) {
  const days = groupEventsByDate(events);

  if (days.length === 0) {
    return <p className="text-sm text-ink/50">Nothing scheduled yet.</p>;
  }

  return (
    <div className="flex items-start gap-4 overflow-x-auto pb-2">
      {days.map((day) => (
        <div
          key={day.date}
          className="w-full min-w-[220px] flex-1 rounded-lg border border-hairline bg-card p-4 shadow-sm"
        >
          <div className="mb-3 border-b border-hairline pb-3">
            <p className="font-display text-lg font-semibold text-forest">
              {formatFullDate(day.date)}
            </p>
            {weddingDate === day.date && (
              <span className="font-mono-numbers text-[11px] uppercase tracking-wide text-brass">
                Wedding day
              </span>
            )}
          </div>

          {day.events.map((event) => {
            const timeRange = [
              formatTime(event.start_time),
              event.end_time && formatTime(event.end_time),
            ]
              .filter(Boolean)
              .join(" – ");

            return (
              <div key={event.id} className="border-b border-hairline py-3 last:border-b-0">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="flex flex-wrap items-baseline gap-2">
                    {timeRange && (
                      <span className="font-mono-numbers text-xs text-brass">{timeRange}</span>
                    )}
                    <span className="text-ink">{event.title}</span>
                  </div>
                  <button
                    onClick={() => downloadIcs(event)}
                    className="shrink-0 text-xs text-brass hover:underline"
                  >
                    Add to calendar
                  </button>
                </div>
                {event.location && <p className="mt-1 text-xs text-ink/50">{event.location}</p>}
                {event.description && (
                  <p className="mt-1 text-sm text-ink/70">{event.description}</p>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
