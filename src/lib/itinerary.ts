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

export function sortByTime(a: Pick<ItineraryEvent, "start_time">, b: Pick<ItineraryEvent, "start_time">) {
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

/** The fields the timeline needs, so the landing demo can draw one too. */
export type TimelineEvent = Pick<ItineraryEvent, "id" | "title" | "start_time" | "end_time" | "location" | "audience"> & {
  people?: string[] | null;
};

/** "15:30:00" -> 930. */
export function toMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
}

/** 930 -> "15:30". */
export function fromMinutes(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

/** An event with no end is drawn as half an hour; one that ends past midnight runs on. */
const DEFAULT_LENGTH = 30;

export function spanOf(event: Pick<ItineraryEvent, "start_time" | "end_time">) {
  if (!event.start_time) return null;
  const start = toMinutes(event.start_time);
  let end = event.end_time ? toMinutes(event.end_time) : start + DEFAULT_LENGTH;
  if (end <= start) end = event.end_time && end < start ? end + 24 * 60 : start + DEFAULT_LENGTH;
  return { start, end, open: !event.end_time };
}

export function formatLength(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return [h && `${h}h`, m && `${m}m`].filter(Boolean).join(" ") || "0m";
}

/** The ceremony is the day's fixed point: everything else is planned around it. */
export function isCeremony(event: Pick<ItineraryEvent, "title">) {
  return /\bceremony\b/i.test(event.title) && !/rehearsal/i.test(event.title);
}

export type PlacedEvent<E extends TimelineEvent = TimelineEvent> = {
  event: E;
  start: number;
  end: number;
  lane: number;
  lanes: number;
  /** How many lanes it's drawn across: it widens into free lanes to its right. */
  span: number;
};

/**
 * Side-by-side lanes for overlapping events: each event takes the first lane
 * free at its start, and every event in a run of overlaps shares that run's
 * lane count, then widens into any lanes to its right that stay free while it
 * runs.
 */
export function placeEvents<E extends TimelineEvent>(events: E[]): PlacedEvent<E>[] {
  const timed = events
    .map((event) => ({ event, span: spanOf(event) }))
    .filter((x): x is { event: E; span: NonNullable<ReturnType<typeof spanOf>> } => x.span !== null)
    .sort((a, b) => a.span.start - b.span.start || b.span.end - a.span.end);

  const placed: PlacedEvent<E>[] = [];
  let group: PlacedEvent<E>[] = [];
  let laneEnds: number[] = [];
  let groupEnd = -1;
  const close = () => {
    for (const p of group) {
      p.lanes = laneEnds.length;
      const blocked = (lane: number) =>
        group.some((o) => o.lane === lane && o.start < p.end && p.start < o.end);
      while (p.lane + p.span < p.lanes && !blocked(p.lane + p.span)) p.span += 1;
    }
    group = [];
    laneEnds = [];
  };
  for (const { event, span } of timed) {
    if (span.start >= groupEnd) close();
    let lane = laneEnds.findIndex((end) => end <= span.start);
    if (lane === -1) lane = laneEnds.length;
    laneEnds[lane] = span.end;
    const p = { event, start: span.start, end: span.end, lane, lanes: 1, span: 1 };
    group.push(p);
    placed.push(p);
    groupEnd = Math.max(groupEnd, span.end);
  }
  close();
  return placed;
}

export type DayFlag = { eventId: string; message: string };

/**
 * What's worth a second look on a day. Overlaps alone are normal (portraits
 * during cocktail hour, cake during dancing), so only three things count:
 * something running into or out of the ceremony, two guest events that half
 * overlap (guests can't be at both), and guests left with a long stretch of
 * nothing between two of their events.
 */
export function findFlags(events: TimelineEvent[]): DayFlag[] {
  const placed = placeEvents(events);
  const flags: DayFlag[] = [];
  const ceremony = placed.find((p) => isCeremony(p.event));
  const partial = (a: PlacedEvent, b: PlacedEvent) =>
    a.start < b.end && b.start < a.end && !(a.start <= b.start && a.end >= b.end) && !(b.start <= a.start && b.end >= a.end);

  if (ceremony) {
    for (const p of placed) {
      if (p === ceremony || !partial(p, ceremony)) continue;
      flags.push({
        eventId: p.event.id,
        message:
          p.start < ceremony.start
            ? `"${p.event.title}" runs ${formatLength(p.end - ceremony.start)} into the ceremony.`
            : `"${p.event.title}" starts before the ceremony ends.`,
      });
    }
  }

  const forGuests = placed.filter((p) => audienceOf(p.event) === "guests");
  for (let i = 0; i < forGuests.length; i++) {
    for (let j = i + 1; j < forGuests.length; j++) {
      const [a, b] = [forGuests[i], forGuests[j]];
      if (a === ceremony || b === ceremony || !partial(a, b)) continue;
      flags.push({
        eventId: b.event.id,
        message: `"${a.event.title}" and "${b.event.title}" overlap by ${formatLength(a.end - b.start)}, and guests can't be at both.`,
      });
    }
  }

  let lastEnd: PlacedEvent | null = null;
  for (const p of forGuests) {
    if (lastEnd && p.start - lastEnd.end >= 90) {
      flags.push({
        eventId: p.event.id,
        message: `Guests have ${formatLength(p.start - lastEnd.end)} with nothing on between "${lastEnd.event.title}" and "${p.event.title}".`,
      });
    }
    if (!lastEnd || p.end > lastEnd.end) lastEnd = p;
  }
  return flags;
}

/**
 * Which events "move this and everything after" moves. Before the ceremony it
 * stops short of it, since the ceremony time is printed on the invitations;
 * from the ceremony on, everything later moves too.
 */
export function eventsToShift<E extends TimelineEvent>(dayEvents: E[], from: E): E[] {
  const start = spanOf(from)?.start;
  if (start === undefined) return [from];
  const ceremony = dayEvents.find(isCeremony);
  const ceremonyStart = ceremony ? spanOf(ceremony)?.start : undefined;
  const stopAtCeremony = ceremonyStart !== undefined && start < ceremonyStart;
  return dayEvents.filter((e) => {
    const s = spanOf(e)?.start;
    if (s === undefined || s < start) return false;
    if (e.id === from.id) return true;
    return !(stopAtCeremony && (e === ceremony || s >= ceremonyStart!));
  });
}

/** The couple's name for the day, else "Wedding day", "Day before", "Day after", or the weekday. */
export function dayLabel(date: string, weddingDate: string | null, names?: Record<string, string> | null) {
  if (names?.[date]) return names[date];
  if (weddingDate) {
    const diff = Math.round((parseDateKey(date).getTime() - parseDateKey(weddingDate).getTime()) / 86_400_000);
    if (diff === 0) return "Wedding day";
    if (diff === -1) return "Day before";
    if (diff === 1) return "Day after";
  }
  return parseDateKey(date).toLocaleDateString("en-US", { weekday: "long" });
}

export function formatShortDate(key: string) {
  return parseDateKey(key).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}
