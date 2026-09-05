import type { ItineraryEvent } from "@/lib/supabase/types";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function dateTimeStamp(dateStr: string, timeStr: string) {
  const [y, m, d] = dateStr.split("-");
  const [hh, mm, ss] = timeStr.split(":");
  return `${y}${m}${d}T${hh}${mm}${ss ?? "00"}`;
}

function dateStamp(dateStr: string) {
  return dateStr.replace(/-/g, "");
}

function addOneDayStamp(dateStr: string) {
  const date = new Date(`${dateStr}T00:00:00`);
  date.setDate(date.getDate() + 1);
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
}

function addOneHour(timeStr: string) {
  const [hh, mm, ss] = timeStr.split(":").map(Number);
  const total = hh * 3600 + mm * 60 + (ss ?? 0) + 3600;
  const wrapped = total % (24 * 3600);
  return `${pad(Math.floor(wrapped / 3600))}:${pad(Math.floor((wrapped % 3600) / 60))}:${pad(wrapped % 60)}`;
}

function escapeText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function utcStamp() {
  const now = new Date();
  return `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;
}

export function icsForEvent(event: ItineraryEvent): string {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Wedding Ledger//EN", "BEGIN:VEVENT"];
  lines.push(`UID:${event.id}@weddingledger`);
  lines.push(`DTSTAMP:${utcStamp()}`);

  if (event.start_time) {
    lines.push(`DTSTART:${dateTimeStamp(event.event_date, event.start_time)}`);
    const endTime = event.end_time ?? addOneHour(event.start_time);
    lines.push(`DTEND:${dateTimeStamp(event.event_date, endTime)}`);
  } else {
    lines.push(`DTSTART;VALUE=DATE:${dateStamp(event.event_date)}`);
    lines.push(`DTEND;VALUE=DATE:${addOneDayStamp(event.event_date)}`);
  }

  lines.push(`SUMMARY:${escapeText(event.title)}`);
  if (event.location) lines.push(`LOCATION:${escapeText(event.location)}`);
  if (event.description) lines.push(`DESCRIPTION:${escapeText(event.description)}`);
  lines.push("END:VEVENT", "END:VCALENDAR");

  return lines.join("\r\n");
}

export function downloadIcs(event: ItineraryEvent) {
  const blob = new Blob([icsForEvent(event)], { type: "text/calendar;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${event.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "event"}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
