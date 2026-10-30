import type { Guest, GuestPriority, GuestSide, GuestType } from "@/lib/supabase/types";

/**
 * The guest list's housekeeping: which stage the list is in, which names
 * still need finishing, and Wren's guess at where an unsorted guest belongs.
 * Pure, so the page header, the "Tidy your list" card and quick sort all
 * read the list the same way.
 */

export type GuestListStage = "building" | "invites" | "final";

/**
 * Building until anyone has been invited or has answered; final once the
 * RSVP deadline has passed. `today` is a YYYY-MM-DD string, like the deadline.
 */
export function guestListStage(
  guests: Pick<Guest, "status" | "invite_sent_at">[],
  rsvpDeadline: string | null,
  today: string,
): GuestListStage {
  const anyOut = guests.some((g) => g.invite_sent_at || g.status !== "pending");
  if (!anyOut) return "building";
  if (rsvpDeadline && rsvpDeadline < today) return "final";
  return "invites";
}

/**
 * A name nobody could address an envelope to: a "?", a placeholder like
 * "Plus one" or "TBD", or a single word ("Belitz", "Grandma").
 */
export function looksUnfinished(name: string) {
  const n = name.trim();
  if (!n) return true;
  if (n.includes("?")) return true;
  if (/\b(tbd|tba|unknown|plus[ -]?one|guest)\b|\+1/i.test(n)) return true;
  return !/\s/.test(n);
}

/** Needs a pass in quick sort: no side or no family/friends group yet. */
export function isUnsorted(guest: Pick<Guest, "side" | "guest_type">) {
  return !guest.side || !guest.guest_type;
}

function lastName(name: string) {
  const words = name.trim().toLowerCase().split(/\s+/);
  const last = words[words.length - 1] ?? "";
  return words.length > 1 && last.length > 1 ? last.replace(/[^a-z'-]/g, "") : "";
}

function majority<T extends string>(values: (T | null)[]): T | null {
  const counts = new Map<T, number>();
  for (const v of values) if (v) counts.set(v, (counts.get(v) ?? 0) + 1);
  let best: T | null = null;
  let bestCount = 0;
  for (const [v, c] of counts) {
    if (c > bestCount) {
      best = v;
      bestCount = c;
    }
  }
  return best;
}

export type GroupingGuess = {
  side: GuestSide | null;
  guest_type: GuestType | null;
  /** Only from the same household; a shared last name says nothing about priority. */
  priority: GuestPriority | null;
  reason: string;
};

/**
 * Where a guest probably belongs, from the guests already sorted: the same
 * household first, then a shared last name. Null when nothing points anywhere.
 */
export function guessGrouping(
  guest: Pick<Guest, "id" | "name" | "household">,
  others: Pick<Guest, "id" | "name" | "household" | "side" | "guest_type" | "priority">[],
): GroupingGuess | null {
  const sorted = others.filter((o) => o.id !== guest.id && (o.side || o.guest_type));
  const household = guest.household?.trim().toLowerCase();
  if (household) {
    const mates = sorted.filter((o) => o.household?.trim().toLowerCase() === household);
    if (mates.length > 0) {
      return {
        side: majority(mates.map((m) => m.side)),
        guest_type: majority(mates.map((m) => m.guest_type)),
        priority: majority(mates.map((m) => m.priority)),
        reason:
          mates.length === 1
            ? `same household as ${mates[0].name}`
            : `same household as ${mates.length} sorted guests`,
      };
    }
  }
  const surname = lastName(guest.name);
  if (surname) {
    const relatives = sorted.filter((o) => lastName(o.name) === surname);
    if (relatives.length > 0) {
      const display = guest.name.trim().split(/\s+/).pop();
      return {
        side: majority(relatives.map((m) => m.side)),
        guest_type: majority(relatives.map((m) => m.guest_type)),
        priority: null,
        reason:
          relatives.length === 1
            ? `shares the last name ${display} with ${relatives[0].name}`
            : `shares the last name ${display} with ${relatives.length} sorted guests`,
      };
    }
  }
  return null;
}
