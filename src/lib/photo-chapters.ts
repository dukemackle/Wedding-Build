import type { GuestPost, ItineraryEvent } from "@/lib/supabase/types";

export type PhotoChapter = {
  key: string;
  title: string;
  /** "Sat, Jun 12 · 4:00 pm", or null for the catch-all. */
  when: string | null;
  posts: GuestPost[];
};

type Slot = { key: string; title: string; date: string; start: number; end: number; when: string };

/**
 * Sorts photo-wall posts into the couple's itinerary: each post goes to the
 * event that was on when its photo was taken (taken_local, 0159), in the order
 * the day ran. Each event runs until the next one starts that day, the last
 * to midnight -- end times are ignored, since the gap after cocktail hour's
 * "end" is still cocktail hour to anyone holding a camera. Anything taken
 * before the day's first event, on a day with no events, or with no time at
 * all goes in a final "Other photos" chapter. Empty chapters are left out.
 *
 * Both sides are phone/itinerary wall-clock times, so no time zone is needed.
 */
export function photoChapters(posts: GuestPost[], events: ItineraryEvent[]): PhotoChapter[] {
  const timed = events
    .filter((e) => e.start_time)
    .map((e) => ({ e, start: minutes(e.start_time!) }))
    .sort((a, b) => a.e.event_date.localeCompare(b.e.event_date) || a.start - b.start);

  const slots: Slot[] = timed.map(({ e, start }, i) => {
    const next = timed[i + 1];
    const until = next && next.e.event_date === e.event_date ? next.start : 24 * 60;
    return {
      key: e.id,
      title: e.title,
      date: e.event_date,
      start,
      end: until,
      when: `${dayLabel(e.event_date)} · ${timeLabel(e.start_time!)}`,
    };
  });

  const byKey = new Map<string, GuestPost[]>();
  const other: GuestPost[] = [];
  for (const post of posts) {
    const slot = post.taken_local ? slotFor(slots, post.taken_local) : null;
    if (!slot) other.push(post);
    else byKey.set(slot.key, [...(byKey.get(slot.key) ?? []), post]);
  }

  const chapters: PhotoChapter[] = slots
    .filter((slot) => byKey.has(slot.key))
    .map((slot) => ({
      key: slot.key,
      title: slot.title,
      when: slot.when,
      posts: byKey.get(slot.key)!.sort(byTaken),
    }));
  if (other.length > 0) {
    chapters.push({ key: "other", title: "Other photos", when: null, posts: other.sort(byTaken) });
  }
  return chapters;
}

function slotFor(slots: Slot[], takenLocal: string): Slot | null {
  const date = takenLocal.slice(0, 10);
  const at = minutes(takenLocal.slice(11, 16));
  return slots.find((s) => s.date === date && at >= s.start && at < s.end) ?? null;
}

function byTaken(a: GuestPost, b: GuestPost) {
  return (a.taken_local ?? a.created_at).localeCompare(b.taken_local ?? b.created_at);
}

/** "16:30" or "16:30:00" -> 990. */
function minutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
}

function dayLabel(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function timeLabel(time: string): string {
  const total = minutes(time);
  const h = Math.floor(total / 60);
  const m = total % 60;
  const suffix = h >= 12 ? "pm" : "am";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`;
}
