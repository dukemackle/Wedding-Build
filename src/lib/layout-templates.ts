import type { LayoutItemType, TableShape } from "@/lib/supabase/types";
import { CANVAS_HEIGHT, CANVAS_WIDTH, ITEM_TYPE_DIMENSIONS, chairSize, tableDimensions } from "@/lib/venue-layout-geometry";

/**
 * Ready-made room layouts: one click puts down every table, chair, the dance
 * floor and the usual furniture, sized to the couple's guest list.
 *
 * Pure geometry, shared by the picker (which draws each one as a thumbnail)
 * and the server action that saves it, so what the couple sees in the card is
 * what lands on the plan. Tables are numbered from the couple's table
 * outwards, so Table 1 is the closest -- which is also the order "Seat the
 * rest" fills them in, family first.
 */

export type LayoutTemplateId = "classic" | "long" | "head";

export type TemplateTable = {
  name: string;
  shape: TableShape;
  capacity: number;
  x: number;
  y: number;
  /** Null keeps the size the editor derives from shape and seats. */
  width: number | null;
  height: number | null;
};

export type TemplateItem = { type: LayoutItemType; label: string | null; x: number; y: number; width: number; height: number };

export type TemplateLayout = {
  tables: TemplateTable[];
  items: TemplateItem[];
  /** Seats at the guest tables (the couple's own table not counted). */
  seats: number;
  /** How long the room is: 900, or more when a big guest list needs it. */
  height: number;
};

type Rect = { x: number; y: number; width: number; height: number };

type TemplateSpec = {
  id: LayoutTemplateId;
  name: string;
  blurb: string;
  shape: TableShape;
  /** Seats per table, tried in order until the room fits. */
  capacities: number[];
  couple: { name: string; shape: TableShape; capacity: number; width: number; height: number };
};

export const LAYOUT_TEMPLATES: TemplateSpec[] = [
  {
    id: "classic",
    name: "Classic rounds",
    blurb: "Round tables ringed around the dance floor, with a sweetheart table up front.",
    shape: "round",
    capacities: [10, 12],
    couple: { name: "Sweetheart table", shape: "rectangle", capacity: 2, width: 150, height: 70 },
  },
  {
    id: "head",
    name: "Head table & rounds",
    blurb: "A long head table for you and the wedding party, rounds for everyone else.",
    shape: "round",
    capacities: [8, 10, 12],
    couple: { name: "Head table", shape: "rectangle", capacity: 10, width: 300, height: 80 },
  },
  {
    id: "long",
    name: "Long feasting tables",
    blurb: "Rows of long tables, family-style. Lovely in a barn or a tent.",
    shape: "rectangle",
    capacities: [12, 16, 20],
    couple: { name: "Sweetheart table", shape: "rectangle", capacity: 2, width: 150, height: 70 },
  },
];

/** Breathing room kept clear around fixed furniture. */
const CLEARANCE = 24;
const EDGE = 24;
/** No room is drawn longer than this (about 1,500 guests in classic rounds). */
const MAX_HEIGHT = 4000;
/** Smallest a table body gets, so its name and centrepiece still fit. */
const MIN_BODY = { round: 90, square: 90, rectangle: 50 } as const;
/** A few spare seats, for the guest who appears on the day. */
const SPARE = 1.05;

function overlaps(a: Rect, b: Rect) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}

function inflate(r: Rect, by: number): Rect {
  return { x: r.x - by, y: r.y - by, width: r.width + by * 2, height: r.height + by * 2 };
}

function center(r: Rect) {
  return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
}

function item(type: LayoutItemType, x: number, y: number, label: string | null = null, size?: Partial<Rect>): TemplateItem {
  const d = ITEM_TYPE_DIMENSIONS[type];
  return { type, label, x, y, width: size?.width ?? d.width, height: size?.height ?? d.height };
}

/** The table's name and "0/10 seated" tag under it, in canvas pixels. */
const LABEL_HEIGHT = 48;

/**
 * Room a table needs round its body: chairs on every side (only the long
 * sides of a long table), and below them the name tag the editor draws.
 */
function margins(shape: TableShape, capacity: number, size: { width: number; height: number }) {
  const chair = chairSize({ shape, capacity, ...size }) + 4;
  return { x: shape === "rectangle" ? 8 : chair, top: chair, bottom: chair + 10 + LABEL_HEIGHT };
}

/** Every slot a table of this size could take without touching the furniture. */
function slots(
  size: { width: number; height: number },
  chair: { x: number; top: number; bottom: number },
  blocked: Rect[],
  roomHeight: number,
): Rect[] {
  const cellW = size.width + chair.x * 2 + 8;
  const cellH = size.height + chair.top + chair.bottom + 8;
  const cols = Math.floor((CANVAS_WIDTH - EDGE * 2) / cellW);
  const rows = Math.floor((roomHeight - EDGE * 2) / cellH);
  // Centre the grid so the spare floor is shared evenly at the edges.
  const offX = (CANVAS_WIDTH - cols * cellW) / 2;
  const offY = (roomHeight - rows * cellH) / 2;
  const out: Rect[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const body = {
        x: offX + c * cellW + chair.x + 4,
        y: offY + r * cellH + chair.top + 4,
        width: size.width,
        height: size.height,
      };
      const withChairs = { x: body.x - chair.x, y: body.y - chair.top, width: size.width + chair.x * 2, height: size.height + chair.top + chair.bottom };
      if (!blocked.some((b) => overlaps(withChairs, inflate(b, CLEARANCE)))) out.push(body);
    }
  }
  return out;
}

/**
 * The fixed pieces for a room this long: the couple's table up front, the
 * dance floor in the middle of the room, the door at the back. The floor
 * grows with the crowd.
 */
function furniture(spec: TemplateSpec, seatsNeeded: number, roomHeight: number) {
  const couple: Rect = {
    x: (CANVAS_WIDTH - spec.couple.width) / 2,
    y: 40,
    width: spec.couple.width,
    height: spec.couple.height,
  };
  const floorSide = Math.round(Math.min(420, Math.max(200, 140 + seatsNeeded * 0.5)));
  const dance: Rect = {
    x: (CANVAS_WIDTH - floorSide) / 2,
    y: spec.id === "long" ? roomHeight - floorSide - 150 : (roomHeight - floorSide) / 2 + 20,
    width: floorSide,
    height: floorSide,
  };
  const items: TemplateItem[] = [
    item("dance_floor", dance.x, dance.y, null, { width: dance.width, height: dance.height }),
    // Music, bar, cake and gifts flank the floor rather than taking corners,
    // so the party sits in one block and the rest of the room is tables.
    item("dj_booth", dance.x + dance.width + 20, dance.y),
    item("cake_table", dance.x + dance.width + 20, dance.y + dance.height - 70),
    item("bar", dance.x - 130 - 20, dance.y),
    item("gift_table", dance.x - 85 - 20, dance.y + dance.height - 70),
    item("entrance", (CANVAS_WIDTH - 75) / 2, roomHeight - 75 - EDGE / 2),
  ];
  const blocked: Rect[] = [
    { x: couple.x - 8, y: couple.y - 34, width: couple.width + 16, height: couple.height + 34 * 2 + LABEL_HEIGHT },
    ...items.map((i) => ({ x: i.x, y: i.y, width: i.width, height: i.height })),
  ];
  return { couple, dance, items, blocked };
}

export function buildTemplate(id: LayoutTemplateId, guestSeats: number): TemplateLayout {
  const spec = LAYOUT_TEMPLATES.find((t) => t.id === id) ?? LAYOUT_TEMPLATES[0];
  const seatsNeeded = Math.max(guestSeats, 40);

  type Fit = { capacity: number; size: { width: number; height: number }; picked: Rect[]; needed: number; roomHeight: number };
  const attempt = (capacity: number, scale: number, roomHeight: number): Fit => {
    const needed = Math.ceil((seatsNeeded * SPARE) / capacity);
    const base = tableDimensions(spec.shape, capacity);
    const shrink = Math.max(scale, MIN_BODY[spec.shape] / Math.min(base.width, base.height));
    const size = { width: Math.round(base.width * shrink), height: Math.round(base.height * shrink) };
    const { blocked } = furniture(spec, seatsNeeded, roomHeight);
    return { capacity, size, picked: slots(size, margins(spec.shape, capacity, size), blocked, roomHeight), needed, roomHeight };
  };

  // Largest tables that fit the standard room: each table size at full
  // scale, then shrinking a step at a time.
  let chosen: Fit | null = null;
  outer: for (let scale = 1; scale >= 0.3; scale -= 0.05) {
    for (const capacity of spec.capacities) {
      const fit = attempt(capacity, scale, CANVAS_HEIGHT);
      if (fit.picked.length >= fit.needed) {
        chosen = fit;
        break outer;
      }
    }
  }
  // Still not enough at the smallest size: a big wedding. Keep the biggest
  // tables at that size and make the room longer, a row at a time, until
  // everyone has a seat.
  if (!chosen) {
    const capacity = spec.capacities[spec.capacities.length - 1];
    let roomHeight = CANVAS_HEIGHT;
    let fit = attempt(capacity, 0, roomHeight);
    while (fit.picked.length < fit.needed && roomHeight < MAX_HEIGHT) {
      roomHeight += 50;
      fit = attempt(capacity, 0, roomHeight);
    }
    chosen = fit;
  }

  const { couple, dance, items } = furniture(spec, seatsNeeded, chosen.roomHeight);
  // Fill outwards from the dance floor, so the room gathers round it.
  const floorMid = center(dance);
  const dist = (r: Rect, p: { x: number; y: number }) => Math.hypot(center(r).x - p.x, center(r).y - p.y);
  const taken = [...chosen.picked].sort((a, b) => dist(a, floorMid) - dist(b, floorMid)).slice(0, chosen.needed);
  // Number them from the couple's table outwards.
  const coupleMid = center(couple);
  taken.sort((a, b) => dist(a, coupleMid) - dist(b, coupleMid) || a.x - b.x);

  const usual = tableDimensions(spec.shape, chosen.capacity);
  const shrunk = chosen.size.width !== usual.width || chosen.size.height !== usual.height;
  const tables: TemplateTable[] = [
    {
      name: spec.couple.name,
      shape: spec.couple.shape,
      capacity: spec.couple.capacity,
      x: Math.round(couple.x),
      y: Math.round(couple.y),
      width: spec.couple.width,
      height: spec.couple.height,
    },
    ...taken.map((r, i) => ({
      name: `Table ${i + 1}`,
      shape: spec.shape,
      capacity: chosen.capacity,
      x: Math.round(r.x),
      y: Math.round(r.y),
      width: shrunk ? r.width : null,
      height: shrunk ? r.height : null,
    })),
  ];

  return {
    tables,
    items: items.map((i) => ({ ...i, x: Math.round(i.x), y: Math.round(i.y) })),
    seats: taken.length * chosen.capacity,
    height: chosen.roomHeight,
  };
}
