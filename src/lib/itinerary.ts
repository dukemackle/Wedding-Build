import type { EventAudience, ItineraryEvent } from "@/lib/supabase/types";

// All date math here works in local-time Date objects and formats them
// manually (never through toISOString/UTC), so a day never shifts by one
// depending on the viewer's timezone offset.
export function dateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key: string) {
  return new Date(`${key}T00:00:00`);
}

export function formatMonthYear(date: Date) {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function formatFullDate(key: string) {
  return parseDateKey(key).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function formatTime(time: string | null) {
  if (!time) return null;
  const [hourStr, minuteStr] = time.split(":");
  const hour = Number(hourStr);
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minuteStr.padStart(2, "0")} ${period}`;
}

export function sortByTime(a: ItineraryEvent, b: ItineraryEvent) {
  if (!a.start_time && !b.start_time) return 0;
  if (!a.start_time) return -1;
  if (!b.start_time) return 1;
  return a.start_time.localeCompare(b.start_time);
}

export function groupEventsByDate(
  events: ItineraryEvent[],
): { date: string; events: ItineraryEvent[] }[] {
  const byDate = new Map<string, ItineraryEvent[]>();
  for (const event of events) {
    const list = byDate.get(event.event_date) ?? [];
    list.push(event);
    byDate.set(event.event_date, list);
  }
  return Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, dayEvents]) => ({ date, events: dayEvents.sort(sortByTime) }));
}

/** Who each audience is, as the editor, the tags and the run sheets name it. */
export const AUDIENCES: { value: EventAudience; label: string; short: string; help: string }[] = [
  { value: "guests", label: "Guests", short: "Guests", help: "On your guest site, and on every run sheet." },
  {
    value: "party",
    label: "Wedding party & family",
    short: "Party & family",
    help: "On the wedding-party run sheet. Never on your guest site.",
  },
  {
    value: "private",
    label: "Just us & vendors",
    short: "Just us & vendors",
    help: "Only on your full run sheet, the one you hand vendors.",
  },
];

export function isAudience(value: unknown): value is EventAudience {
  return value === "guests" || value === "party" || value === "private";
}

/** Rows saved before 0143 have no audience; they were all public. */
export function audienceOf(event: Pick<ItineraryEvent, "audience">): EventAudience {
  return isAudience(event.audience) ? event.audience : "guests";
}

/**
 * A first guess from the title, so "Hair & makeup" doesn't land on the guest
 * site because nobody changed the default. The couple can always override it.
 */
export function guessAudience(title: string): EventAudience {
  const t = title.toLowerCase();
  if (/load[- ]?in|set ?up|tear ?down|breakdown|vendor|deliver|first look|portraits|sneak|planner|private vows/.test(t)) {
    return "private";
  }
  if (
    /hair|make ?up|getting ready|get ready|dressing|wedding party|bridal party|bridesmaid|groomsm|family photo|line ?up|rehearsal(?! dinner)/.test(t)
  ) {
    return "party";
  }
  return "guests";
}

export type CalendarDay = { date: Date; inMonth: boolean };

export function getCalendarDays(year: number, month: number): CalendarDay[] {
  const firstOfMonth = new Date(year, month, 1);
  const startDay = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: CalendarDay[] = [];
  for (let i = startDay; i > 0; i--) {
    days.push({ date: new Date(year, month, 1 - i), inMonth: false });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push({ date: new Date(year, month, day), inMonth: true });
  }
  while (days.length % 7 !== 0) {
    const last = days[days.length - 1].date;
    days.push({ date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1), inMonth: false });
  }
  return days;
}
