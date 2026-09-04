"use client";

import { useMemo, useState } from "react";
import type { ItineraryEvent } from "@/lib/supabase/types";
import { dateKey, formatMonthYear, getCalendarDays } from "@/lib/itinerary";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function ItineraryCalendar({
  events,
  selectedDate,
  onSelectDate,
  initialDate,
  weddingDate,
}: {
  events: ItineraryEvent[];
  selectedDate: string;
  onSelectDate: (dateKey: string) => void;
  initialDate: Date;
  weddingDate: string | null;
}) {
  const [viewDate, setViewDate] = useState(
    () => new Date(initialDate.getFullYear(), initialDate.getMonth(), 1),
  );

  const days = useMemo(
    () => getCalendarDays(viewDate.getFullYear(), viewDate.getMonth()),
    [viewDate],
  );

  const eventCountByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const event of events) {
      map.set(event.event_date, (map.get(event.event_date) ?? 0) + 1);
    }
    return map;
  }, [events]);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
          className="rounded-md border border-hairline px-2 py-1 text-sm text-ink transition-colors hover:border-forest"
          aria-label="Previous month"
        >
          &larr;
        </button>
        <span className="font-display text-lg font-semibold text-forest">
          {formatMonthYear(viewDate)}
        </span>
        <button
          type="button"
          onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
          className="rounded-md border border-hairline px-2 py-1 text-sm text-ink transition-colors hover:border-forest"
          aria-label="Next month"
        >
          &rarr;
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs uppercase tracking-wide text-ink/50">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="py-1">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map(({ date, inMonth }) => {
          const key = dateKey(date);
          const count = eventCountByDate.get(key) ?? 0;
          const isSelected = key === selectedDate;
          const isWeddingDay = weddingDate === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDate(key)}
              className={`flex aspect-square flex-col items-center justify-center gap-0.5 rounded-md border text-sm transition-colors ${
                isSelected
                  ? "border-forest bg-forest text-parchment"
                  : isWeddingDay
                    ? "border-brass bg-brass/10 text-ink hover:border-forest"
                    : inMonth
                      ? "border-hairline bg-parchment text-ink hover:border-forest"
                      : "border-transparent text-ink/30 hover:border-hairline"
              }`}
            >
              <span>{date.getDate()}</span>
              {count > 0 && (
                <span
                  className={`h-1 w-1 rounded-full ${isSelected ? "bg-parchment" : "bg-brass"}`}
                />
              )}
            </button>
          );
        })}
      </div>

      {weddingDate && (
        <p className="mt-3 text-xs text-ink/50">
          <span className="inline-block h-2 w-2 rounded-sm border border-brass bg-brass/10 align-middle" />{" "}
          Wedding day
        </p>
      )}
    </div>
  );
}
