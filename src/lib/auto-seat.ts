import type { Guest, GuestSide, GuestType, SeatingTable } from "@/lib/supabase/types";

/**
 * "Seat the rest": fills the couple's tables with everyone not yet seated.
 *
 * Plain rules, no AI call, so it is instant, free and gives the same answer
 * twice. Households stay together (split only when one is bigger than any
 * table), a guest's plus-one always sits with them, and tables fill by side
 * then by family/friends/work, so Partner A's family lands together, then
 * their friends, and so on. Leftover seats at a table go to the same side
 * before an empty table is started. Guests already seated are never moved.
 *
 * The client runs this to show the preview; the server action runs it again
 * on fresh data to apply it, so a stale tab can't over-fill a table.
 */

export type SeatGuest = Pick<Guest, "id" | "name" | "household" | "side" | "guest_type" | "plus_one" | "table_id">;
export type SeatTable = Pick<SeatingTable, "id" | "name" | "capacity">;

export type SeatPlan = {
  /** Table id -> guest ids to seat there, in table order. */
  assignments: { tableId: string; guestIds: string[] }[];
  /** People (plus-ones counted) given a seat by this plan. */
  seatedPeople: number;
  /** Guests the plan couldn't fit. */
  leftover: SeatGuest[];
  leftoverPeople: number;
};

/** Tables the couple sits at themselves; never filled automatically. */
export function isReservedTable(table: Pick<SeatTable, "name">) {
  return /sweetheart|head table|couple/i.test(table.name);
}

const SIDE_ORDER: (GuestSide | null)[] = ["a", "b", "both", null];
const TYPE_ORDER: (GuestType | null)[] = ["family", "friends", "work", "other", null];

function people(g: SeatGuest) {
  return 1 + (g.plus_one ? 1 : 0);
}

type Unit = { guests: SeatGuest[]; size: number; side: GuestSide | null; type: GuestType | null; label: string };

function mostCommon<T>(values: T[]): T {
  const counts = new Map<T, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

function makeUnit(guests: SeatGuest[]): Unit {
  return {
    guests,
    size: guests.reduce((s, g) => s + people(g), 0),
    side: mostCommon(guests.map((g) => g.side)),
    type: mostCommon(guests.map((g) => g.guest_type)),
    label: (guests[0].household ?? guests[0].name).toLowerCase(),
  };
}

/** "Table 2" before "Table 10"; names without numbers keep their order. */
function tableOrder(tables: SeatTable[]) {
  const num = (name: string) => {
    const m = name.match(/\d+/);
    return m ? Number(m[0]) : Number.POSITIVE_INFINITY;
  };
  return tables
    .map((t, i) => ({ t, i }))
    .sort((a, b) => num(a.t.name) - num(b.t.name) || a.i - b.i)
    .map(({ t }) => t);
}

export function planSeating(guests: SeatGuest[], tables: SeatTable[]): SeatPlan {
  const open = tableOrder(tables.filter((t) => (t.capacity ?? 0) > 0 && !isReservedTable(t)));
  const free = new Map(open.map((t) => [t.id, t.capacity ?? 0]));
  // Who's at each table already, for "same side / same group" matching.
  const sitting = new Map<string, { side: GuestSide | null; type: GuestType | null }[]>();
  for (const g of guests) {
    if (!g.table_id || !free.has(g.table_id)) continue;
    free.set(g.table_id, (free.get(g.table_id) ?? 0) - people(g));
    const list = sitting.get(g.table_id) ?? [];
    list.push({ side: g.side, type: g.guest_type });
    sitting.set(g.table_id, list);
  }

  // Households become one unit; anyone without a household is their own.
  const byHousehold = new Map<string, SeatGuest[]>();
  const units: Unit[] = [];
  for (const g of guests) {
    if (g.table_id) continue;
    const key = g.household?.trim().toLowerCase();
    if (!key) {
      units.push(makeUnit([g]));
      continue;
    }
    const list = byHousehold.get(key) ?? [];
    list.push(g);
    byHousehold.set(key, list);
  }
  for (const list of byHousehold.values()) units.push(makeUnit(list));

  units.sort(
    (a, b) =>
      SIDE_ORDER.indexOf(a.side) - SIDE_ORDER.indexOf(b.side) ||
      TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type) ||
      b.size - a.size ||
      a.label.localeCompare(b.label),
  );

  const biggest = Math.max(0, ...open.map((t) => t.capacity ?? 0));
  const assigned = new Map<string, string[]>();
  const leftover: SeatGuest[] = [];

  function score(tableId: string, unit: Unit) {
    const here = sitting.get(tableId);
    if (!here || here.length === 0) return 1;
    if (here.some((p) => p.side === unit.side && p.type === unit.type)) return 3;
    if (here.some((p) => p.side === unit.side)) return 2;
    return 0;
  }

  function place(unit: Unit): boolean {
    let best: SeatTable | null = null;
    let bestScore = -1;
    for (const t of open) {
      if ((free.get(t.id) ?? 0) < unit.size) continue;
      const s = score(t.id, unit);
      if (s > bestScore) {
        best = t;
        bestScore = s;
      }
    }
    if (!best) return false;
    free.set(best.id, (free.get(best.id) ?? 0) - unit.size);
    assigned.set(best.id, [...(assigned.get(best.id) ?? []), ...unit.guests.map((g) => g.id)]);
    sitting.set(best.id, [
      ...(sitting.get(best.id) ?? []),
      ...unit.guests.map((g) => ({ side: g.side, type: g.guest_type })),
    ]);
    return true;
  }

  for (const unit of units) {
    if (unit.size <= biggest) {
      if (!place(unit)) leftover.push(...unit.guests);
      continue;
    }
    // Bigger than any table: split into table-sized pieces, keeping each
    // guest with their plus-one.
    let piece: SeatGuest[] = [];
    let pieceSize = 0;
    const pieces: SeatGuest[][] = [];
    for (const g of unit.guests) {
      if (pieceSize + people(g) > biggest && piece.length > 0) {
        pieces.push(piece);
        piece = [];
        pieceSize = 0;
      }
      piece.push(g);
      pieceSize += people(g);
    }
    if (piece.length > 0) pieces.push(piece);
    for (const p of pieces) {
      if (!place(makeUnit(p))) leftover.push(...p);
    }
  }

  const assignments = open
    .filter((t) => assigned.has(t.id))
    .map((t) => ({ tableId: t.id, guestIds: assigned.get(t.id)! }));
  const leftoverPeople = leftover.reduce((s, g) => s + people(g), 0);
  const unseatedPeople = guests.filter((g) => !g.table_id).reduce((s, g) => s + people(g), 0);
  return { assignments, seatedPeople: unseatedPeople - leftoverPeople, leftover, leftoverPeople };
}
