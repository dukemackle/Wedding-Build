import { CHAIR_PITCH, ROW_PITCH, WORLD_SCALE } from "@/lib/venue-layout-geometry";
import { STANDARD_FRAME, type RoomFrame, type TemplateItem, type TemplateLayout } from "@/lib/layout-templates";

/**
 * Ready-made ceremony set-ups: rows of chairs either side of an aisle, the
 * arch at the front, room for the musicians, and a unity table if the couple
 * wants one. The ceremony counterpart of layout-templates.ts, and like it,
 * pure geometry shared by the picker's thumbnails and the server action.
 *
 * Chairs go down as blocks, not one item per chair: a block's size is its
 * seat count (see chairBlock), so each side is one piece to drag, and the
 * front row of each is its own block, reserved for family.
 */

export type CeremonyTemplateId = "aisle" | "angled" | "two_aisles";

export type CeremonyLayout = TemplateLayout & {
  rows: number;
  /** Chairs across one row, every section counted. */
  perRow: number;
  /** The whole set-up, arch to entrance, in canvas pixels. */
  extent: { width: number; height: number };
};

type CeremonySpec = {
  id: CeremonyTemplateId;
  name: string;
  blurb: string;
  /** How many blocks of chairs a row is split into. */
  sections: 2 | 3;
  /** Degrees the side blocks turn in towards the arch. */
  angle: number;
};

export const CEREMONY_TEMPLATES: CeremonySpec[] = [
  {
    id: "aisle",
    name: "Classic aisle",
    blurb: "Straight rows either side of one centre aisle. Works in any room or garden.",
    sections: 2,
    angle: 0,
  },
  {
    id: "angled",
    name: "Angled rows",
    blurb: "Rows turned in towards the arch, so every guest has a clearer view.",
    sections: 2,
    angle: 12,
  },
  {
    id: "two_aisles",
    name: "Two aisles",
    blurb: "Three blocks of chairs and two aisles. Easier to fill for a big crowd.",
    sections: 3,
    angle: 0,
  },
];

/** A six-foot aisle: room for a couple walking side by side and a dress. */
export const AISLE = Math.round(1.83 * WORLD_SCALE);
/** Seats in one section of a row, tried in order until the rows fit. */
const SECTION_SEATS = [6, 8, 10, 12, 14, 16];
const ARCH = { width: 200, height: 70, y: 50 };
/** Standing room between the arch and the front row, for the wedding party. */
const FRONT_ROW_Y = 270;
/** Kept clear at the back for the entrance and guests finding their seat. */
const BACK = 160;
const MAX_HEIGHT = 4000;
const SPARE = 1.05;

type Point = { x: number; y: number };

function rotate(p: Point, about: Point, degrees: number): Point {
  const r = (degrees * Math.PI) / 180;
  const dx = p.x - about.x;
  const dy = p.y - about.y;
  return { x: about.x + dx * Math.cos(r) - dy * Math.sin(r), y: about.y + dx * Math.sin(r) + dy * Math.cos(r) };
}

/** Turns a block round a pivot: its centre moves, and it rotates by the same. */
function turned(item: TemplateItem, pivot: Point, degrees: number): TemplateItem {
  if (!degrees) return item;
  const c = rotate({ x: item.x + item.width / 2, y: item.y + item.height / 2 }, pivot, degrees);
  return { ...item, x: c.x - item.width / 2, y: c.y - item.height / 2, rotation: degrees };
}

/** Corners of an item as drawn, rotation included. */
function corners(i: TemplateItem): Point[] {
  const c = { x: i.x + i.width / 2, y: i.y + i.height / 2 };
  return [
    { x: i.x, y: i.y },
    { x: i.x + i.width, y: i.y },
    { x: i.x, y: i.y + i.height },
    { x: i.x + i.width, y: i.y + i.height },
  ].map((p) => rotate(p, c, i.rotation ?? 0));
}

export function buildCeremony(
  id: CeremonyTemplateId,
  guestSeats: number,
  options: { unity?: boolean } = {},
  frame: RoomFrame = STANDARD_FRAME,
): CeremonyLayout {
  const spec = CEREMONY_TEMPLATES.find((t) => t.id === id) ?? CEREMONY_TEMPLATES[0];
  const needed = Math.ceil(Math.max(guestSeats, 40) * SPARE);
  const tilt = (seats: number) => seats * CHAIR_PITCH * Math.sin((spec.angle * Math.PI) / 180);
  const rowsFor = (seats: number) => Math.max(2, Math.ceil(needed / (seats * spec.sections)));
  const depthFor = (seats: number) => rowsFor(seats) * ROW_PITCH + tilt(seats);

  // The narrowest rows that fit the standard room; past the widest, the room
  // runs longer instead, like the dinner layouts do for a big wedding.
  // Rows also have to fit across the room, aisles and all.
  const fitsAcross = (s: number) => spec.sections * s * CHAIR_PITCH + (spec.sections - 1) * AISLE <= frame.width - 48;
  let seats = SECTION_SEATS.find((s) => fitsAcross(s) && FRONT_ROW_Y + depthFor(s) <= frame.height - BACK);
  let roomHeight = frame.height;
  if (seats == null) {
    seats = [...SECTION_SEATS].reverse().find(fitsAcross) ?? SECTION_SEATS[0];
    while (FRONT_ROW_Y + depthFor(seats) > roomHeight - BACK && roomHeight < MAX_HEIGHT) roomHeight += 50;
  }
  const rows = rowsFor(seats);
  const sectionWidth = seats * CHAIR_PITCH;
  // An angled row's outer end swings forward; start lower so it keeps clear
  // of the wedding party.
  const top = FRONT_ROW_Y + tilt(seats);

  // Each section's left edge, aisles between them, centred on the arch.
  const total = spec.sections * sectionWidth + (spec.sections - 1) * AISLE;
  // Centred, or in an L-shaped room slid sideways until the rows and the arch
  // are on the floor.
  const block = (m: number) => ({ x: m - total / 2, y: ARCH.y, width: total, height: top + rows * ROW_PITCH - ARCH.y });
  let mid = frame.width / 2;
  if (frame.inside) {
    search: for (let d = 0; d <= frame.width; d += 20) {
      for (const m of [frame.width / 2 - d, frame.width / 2 + d]) {
        if (frame.inside(block(m))) {
          mid = m;
          break search;
        }
      }
    }
  }
  const lefts = Array.from({ length: spec.sections }, (_, n) => mid - total / 2 + n * (sectionWidth + AISLE));

  const chairs: TemplateItem[] = [];
  lefts.forEach((x, n) => {
    const front: TemplateItem = { type: "chairs", label: "Reserved", x, y: top, width: sectionWidth, height: ROW_PITCH };
    const rest: TemplateItem = {
      type: "chairs",
      label: null,
      x,
      y: top + ROW_PITCH,
      width: sectionWidth,
      height: (rows - 1) * ROW_PITCH,
    };
    // Two-section layouts can angle: the left side turns clockwise round its
    // aisle-side front corner, the right side the other way.
    const side = spec.sections === 2 ? (n === 0 ? 1 : -1) : 0;
    const pivot = { x: n === 0 ? x + sectionWidth : x, y: top };
    chairs.push(turned(front, pivot, side * spec.angle), turned(rest, pivot, side * spec.angle));
  });

  // The entrance sits a couple of metres behind the back row, where the
  // aisle starts, rather than at the far wall of an empty room.
  const backRow = Math.max(...chairs.flatMap(corners).map((p) => p.y));
  const entranceY = Math.min(roomHeight - 75 - 12, backRow + 90);

  const items: TemplateItem[] = [
    { type: "stage", label: "Arch", x: mid - ARCH.width / 2, y: ARCH.y, width: ARCH.width, height: ARCH.height },
    // Strings or a guitarist to one side of the arch, facing the aisle.
    { type: "dj_booth", label: "Musicians", x: mid + ARCH.width / 2 + 150, y: ARCH.y, width: 140, height: 75 },
    ...(options.unity
      ? [{ type: "other" as const, label: "Unity table", x: mid - 45, y: ARCH.y + ARCH.height + 24, width: 90, height: 45 }]
      : []),
    ...chairs,
    { type: "entrance", label: null, x: mid - 75 / 2, y: entranceY, width: 75, height: 75 },
  ];

  const points = items.flatMap(corners);
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);

  return {
    tables: [],
    // Kept on the floor of a small room (the musicians beside the arch).
    items: items.map((i) => ({
      ...i,
      x: Math.round(i.rotation ? i.x : Math.max(0, Math.min(i.x, frame.width - i.width))),
      y: Math.round(i.y),
    })),
    seats: rows * seats * spec.sections,
    height: roomHeight,
    rows,
    perRow: seats * spec.sections,
    extent: { width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) },
  };
}
