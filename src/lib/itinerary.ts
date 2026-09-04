import type { ItineraryEvent } from "@/lib/supabase/types";

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
