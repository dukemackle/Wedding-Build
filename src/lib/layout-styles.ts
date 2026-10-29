/**
 * How the venue plan is dressed: the room it sits in, the tablecloths and
 * what goes in the middle of each table.
 *
 * Keys are stored as plain text (weddings.layout_room_style,
 * seating_tables.linen / centerpiece), so adding an option here needs no
 * migration. Anything stored that isn't listed falls back to the default.
 *
 * Wood, carpet and marble use natural material colours so the rooms read as
 * real places; everything that marks state (selection, sides, progress) stays
 * on the brand palette.
 */

export type RoomStyle = "blank" | "barn" | "ballroom";

export const ROOM_STYLES: { id: RoomStyle; label: string; swatch: string }[] = [
  { id: "blank", label: "Plain", swatch: "#fbf8f1" },
  {
    id: "barn",
    label: "Barn",
    swatch: "repeating-linear-gradient(0deg, #c99a68 0 5px, #b98a5a 5px 10px)",
  },
  {
    id: "ballroom",
    label: "Ballroom",
    swatch: "radial-gradient(circle, #2243B6 0 35%, #1d2d63 36%)",
  },
];

export function roomStyle(value: string | null | undefined): RoomStyle {
  return value === "barn" || value === "ballroom" ? value : "blank";
}

export type Linen = { id: string; label: string; color: string; edge: string };

export const LINENS: Linen[] = [
  { id: "wood", label: "Bare wood", color: "#b98a5a", edge: "#7a5232" },
  { id: "white", label: "White", color: "#ffffff", edge: "#d7cfb8" },
  { id: "ivory", label: "Ivory", color: "#f4efe2", edge: "#d9cfb4" },
  { id: "gold", label: "Gold", color: "#FFD301", edge: "#c9a400" },
  { id: "royal", label: "Royal blue", color: "#2243B6", edge: "#14203d" },
  { id: "blush", label: "Blush", color: "#e8c5b0", edge: "#c9a08a" },
  { id: "sage", label: "Sage", color: "#a9bfa0", edge: "#6f8a66" },
  { id: "navy", label: "Navy", color: "#14203d", edge: "#0a1124" },
];

export type CenterpieceId =
  | "wildflowers"
  | "lanterns"
  | "greenery"
  | "candles"
  | "tall_florals"
  | "candelabra"
  | "low_roses"
  | "none";

export const CENTERPIECE_LABELS: Record<CenterpieceId, string> = {
  wildflowers: "Wildflowers",
  lanterns: "Lanterns",
  greenery: "Greenery",
  candles: "Candles",
  tall_florals: "Tall florals",
  candelabra: "Candelabra",
  low_roses: "Low roses",
  none: "None",
};

type StyleDefaults = {
  linen: string;
  centerpiece: CenterpieceId;
  /** The centrepieces offered first for this room, in order. */
  centerpieces: CenterpieceId[];
  chair: string;
};

export const STYLE_DEFAULTS: Record<RoomStyle, StyleDefaults> = {
  blank: {
    linen: "white",
    centerpiece: "low_roses",
    centerpieces: ["low_roses", "candles", "greenery", "tall_florals", "none"],
    chair: "#d9d3c4",
  },
  barn: {
    linen: "wood",
    centerpiece: "wildflowers",
    centerpieces: ["wildflowers", "lanterns", "greenery", "candles", "none"],
    chair: "#8a5d36",
  },
  ballroom: {
    linen: "white",
    centerpiece: "tall_florals",
    centerpieces: ["tall_florals", "candelabra", "low_roses", "candles", "none"],
    chair: "#d9b44a",
  },
};

export function tableLinen(style: RoomStyle, value: string | null): Linen {
  return (
    LINENS.find((l) => l.id === value) ??
    LINENS.find((l) => l.id === STYLE_DEFAULTS[style].linen) ??
    LINENS[1]
  );
}

export function tableCenterpiece(style: RoomStyle, value: string | null): CenterpieceId {
  return value && value in CENTERPIECE_LABELS
    ? (value as CenterpieceId)
    : STYLE_DEFAULTS[style].centerpiece;
}

/** Navy or white, whichever reads on this fill. */
export function inkOn(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return "#14203d";
  const n = parseInt(m[1], 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.36 ? "#14203d" : "#ffffff";
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter((p) => /[\p{L}\p{N}]/u.test(p));
  if (parts.length === 0) return "?";
  const first = parts[0].match(/[\p{L}\p{N}]/u)?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1].match(/[\p{L}\p{N}]/u)?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

/**
 * Where each chair sits around a table, in the table's own box (0,0 is its
 * top-left). Angles point the chair's back away from the table.
 */
export function chairPositions(
  shape: "round" | "square" | "rectangle",
  width: number,
  height: number,
  count: number,
  gap = 14,
): { x: number; y: number; angle: number }[] {
  if (count <= 0) return [];
  const cx = width / 2;
  const cy = height / 2;

  if (shape === "round") {
    const rx = width / 2 + gap;
    const ry = height / 2 + gap;
    return Array.from({ length: count }, (_, i) => {
      const a = (i / count) * Math.PI * 2 - Math.PI / 2;
      return { x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry, angle: (a * 180) / Math.PI + 90 };
    });
  }

  // Rectangles seat along the two long sides; squares go round all four.
  const sides: { from: [number, number]; to: [number, number]; out: [number, number]; angle: number }[] = [
    { from: [0, -gap], to: [width, -gap], out: [0, -1], angle: 0 },
    { from: [0, height + gap], to: [width, height + gap], out: [0, 1], angle: 180 },
  ];
  if (shape === "square") {
    sides.splice(1, 0, { from: [width + gap, 0], to: [width + gap, height], out: [1, 0], angle: 90 });
    sides.push({ from: [-gap, 0], to: [-gap, height], out: [-1, 0], angle: 270 });
  }
  const perSide = sides.map((_, i) => Math.floor(count / sides.length) + (i < count % sides.length ? 1 : 0));
  return sides.flatMap((side, i) => {
    const n = perSide[i];
    return Array.from({ length: n }, (_, j) => {
      const t = (j + 0.5) / n;
      return {
        x: side.from[0] + (side.to[0] - side.from[0]) * t,
        y: side.from[1] + (side.to[1] - side.from[1]) * t,
        angle: side.angle,
      };
    });
  });
}
