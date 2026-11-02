import type { PlanOutline } from "@/lib/supabase/types";
import { WORLD_SCALE } from "@/lib/venue-layout-geometry";
import { STANDARD_FRAME, type RoomFrame } from "@/lib/layout-templates";

/**
 * Venue floor plans (decisions.md, 2026-10-28): a space's real size and
 * outline, stored in metres and shown in feet. The layout editor draws at
 * WORLD_SCALE canvas pixels a metre, so a copied plan becomes a room that size.
 */

export const FEET_PER_METRE = 3.28084;
export const MIN_PLAN_M = 3;
export const MAX_PLAN_M = 120;

export const metresToFeet = (m: number) => Math.round(m * FEET_PER_METRE);
export const feetToMetres = (ft: number) => Math.round((ft / FEET_PER_METRE) * 100) / 100;

export type PlanShape = { width_m: number; length_m: number; outline: PlanOutline | null };

/** The corners to draw: the outline, or the rectangle when there is none. */
export function planCorners({ width_m, length_m, outline }: PlanShape): PlanOutline {
  return outline && outline.length >= 3
    ? outline
    : [
        [0, 0],
        [width_m, 0],
        [width_m, length_m],
        [0, length_m],
      ];
}

/** Floor area in square feet, by the shoelace formula. */
export function planAreaSqFt(plan: PlanShape): number {
  const pts = planCorners(plan);
  let twice = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % pts.length];
    twice += x1 * y2 - x2 * y1;
  }
  return Math.round((Math.abs(twice) / 2) * FEET_PER_METRE * FEET_PER_METRE);
}

/** "60 × 40 ft", the bounding size couples read. */
export function planSizeLabel(plan: Pick<PlanShape, "width_m" | "length_m">): string {
  return `${metresToFeet(plan.width_m)} × ${metresToFeet(plan.length_m)} ft`;
}

/** The plan in editor canvas pixels. */
export function planCanvas(plan: PlanShape) {
  return {
    width: Math.round(plan.width_m * WORLD_SCALE),
    height: Math.round(plan.length_m * WORLD_SCALE),
    corners: planCorners(plan).map(([x, y]) => [x * WORLD_SCALE, y * WORLD_SCALE] as [number, number]),
  };
}

/** A room with a plan, or null for an ordinary free-size room. */
export function roomPlan(room: {
  width_m: number | null;
  length_m: number | null;
  outline: PlanOutline | null;
} | null | undefined): PlanShape | null {
  if (!room || room.width_m == null || room.length_m == null) return null;
  return { width_m: Number(room.width_m), length_m: Number(room.length_m), outline: room.outline };
}

/** Even-odd point-in-polygon, for keeping template tables on the floor. */
export function insidePolygon(x: number, y: number, corners: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = corners.length - 1; i < corners.length; j = i++) {
    const [xi, yi] = corners[i];
    const [xj, yj] = corners[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Checks an outline sent from the admin form: in the box, at least three corners. */
export function cleanOutline(raw: unknown, width_m: number, length_m: number): PlanOutline | null {
  if (!Array.isArray(raw) || raw.length < 3 || raw.length > 40) return null;
  const pts: PlanOutline = [];
  for (const p of raw) {
    if (!Array.isArray(p) || p.length !== 2) return null;
    const [x, y] = p.map(Number);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    pts.push([
      Math.round(Math.min(Math.max(x, 0), width_m) * 100) / 100,
      Math.round(Math.min(Math.max(y, 0), length_m) * 100) / 100,
    ]);
  }
  // Just the four corners of the box: store as a plain rectangle.
  const isBox =
    pts.length === 4 &&
    pts.every(([x, y]) => (x === 0 || x === width_m) && (y === 0 || y === length_m)) &&
    new Set(pts.map((p) => p.join(","))).size === 4;
  return isBox ? null : pts;
}

/**
 * The floor a ready-made layout is built for: the room's real size, keeping
 * tables on the floor of an L-shaped outline. Null plan: the standard room.
 */
export function frameForPlan(plan: PlanShape | null): RoomFrame {
  if (!plan) return STANDARD_FRAME;
  const { width, height, corners } = planCanvas(plan);
  if (!plan.outline) return { width, height };
  return {
    width,
    height,
    inside: (r) =>
      [
        [r.x, r.y],
        [r.x + r.width, r.y],
        [r.x, r.y + r.height],
        [r.x + r.width, r.y + r.height],
        [r.x + r.width / 2, r.y + r.height / 2],
      ].every(([x, y]) => insidePolygon(x, y, corners)),
  };
}
