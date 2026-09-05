"use client";

import { useState } from "react";
import type { ItineraryEvent } from "@/lib/supabase/types";
import { dateKey, formatFullDate, formatTime, parseDateKey, sortByTime } from "@/lib/itinerary";
import { downloadIcs } from "@/lib/ics";
import { ItineraryCalendar } from "@/components/itinerary-calendar";

export function ItineraryView({
  events,
  weddingDate,
}: {
  events: ItineraryEvent[];
  weddingDate: string | null;
}) {
  const initialDate = weddingDate
    ? parseDateKey(weddingDate)
    : events[0]
      ? parseDateKey(events[0].event_date)
      : new Date();
  const [selectedDate, setSelectedDate] = useState(
    weddingDate ?? events[0]?.event_date ?? dateKey(new Date()),
  );

  const dayEvents = events.filter((e) => e.event_date === selectedDate).sort(sortByTime);

  return (
    <div className="grid gap-6 sm:grid-cols-[280px_1fr]">
      <ItineraryCalendar
        events={events}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        initialDate={initialDate}
        weddingDate={weddingDate}
      />

      <div>
        <h3 className="font-display text-xl font-semibold text-forest">
          {formatFullDate(selectedDate)}
        </h3>
        <div className="mt-3">
          {dayEvents.length === 0 ? (
            <p className="text-sm text-ink/50">Nothing scheduled for this day.</p>
          ) : (
            dayEvents.map((event) => {
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
                        <span className="font-mono-numbers text-sm text-brass">{timeRange}</span>
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
            })
          )}
        </div>
      </div>
    </div>
  );
}
