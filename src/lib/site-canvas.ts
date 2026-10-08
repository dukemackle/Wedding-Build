import { z } from "zod";

/**
 * Editor v2, phase 2: things a couple places freely inside a section of their
 * guest site -- text, line art, shapes and photos -- each with a position,
 * size and rotation on an 8px grid (docs/guest-site-editor.md, "Editor v2").
 *
 * Stored as `canvas` in the site_design jsonb, versioned so a later phase can
 * change the shape without guessing. Positions are in the section's own
 * reference frame: `w` is the section's width when the first element went in
 * (in the editor's 1280px computer preview), and every x, y, w, h and font
 * size is in those units. The live page scales the frame to whatever width
 * the section has, so a design made at 1280 looks the same at 1024 or 1600.
 *
 * Phones get their own frame (`phone`). For now that stacks the elements in
 * reading order under the section's usual content; phase 3 lets couples
 * arrange it by hand.
 *
 * Nothing here imports site-design.ts (which imports this), so ids for fonts
 * and art are checked by shape and resolved when the page renders: an id that
 * no longer exists is skipped, never an error.
 */

export const GRID = 8;

/** Sections that hold free elements. The rest move and restyle as whole blocks. */
export function holdsElements(key: string) {
  return key === "hero" || key.startsWith("block:");
}

/**
 * Colours an element can take: a role in the site's palette, so a theme or
 * palette change recolours it with everything else, or a hex the couple
 * picked on purpose.
 */
export const CANVAS_COLORS = [
  { id: "heading", label: "Headings", css: "var(--color-forest)" },
  { id: "ink", label: "Text", css: "var(--color-ink)" },
  { id: "accent", label: "Accent", css: "var(--site-accent)" },
  { id: "accent2", label: "Second accent", css: "var(--site-accent-2)" },
  { id: "muted", label: "Soft text", css: "var(--site-muted)" },
  { id: "surface", label: "Card", css: "var(--color-card)" },
  { id: "bg", label: "Background", css: "var(--color-parchment)" },
] as const;

export type CanvasColorId = (typeof CANVAS_COLORS)[number]["id"];

const HEX = /^#[0-9a-f]{6}$/i;
const ID = /^[a-z0-9]{6,16}$/;
const NAME = /^[a-z0-9-]{1,40}$/;

const colorSchema = z.union([
  z.enum(CANVAS_COLORS.map((c) => c.id) as [CanvasColorId, ...CanvasColorId[]]),
  z.string().regex(HEX),
]);

export type CanvasColor = z.infer<typeof colorSchema>;

export function colorCss(color: CanvasColor) {
  return CANVAS_COLORS.find((c) => c.id === color)?.css ?? color;
}

const boxSchema = {
  id: z.string().regex(ID),
  x: z.number().min(-4000).max(8000),
  y: z.number().min(-4000).max(8000),
  w: z.number().min(GRID).max(8000),
  h: z.number().min(1).max(8000),
  rot: z.number().min(-180).max(180).catch(0),
  locked: z.boolean().catch(false),
  hidden: z.boolean().catch(false),
};

export const SHAPES = [
  { id: "rect", label: "Rectangle" },
  { id: "circle", label: "Circle" },
  { id: "arch", label: "Arch" },
  { id: "line", label: "Line" },
] as const;

export type ShapeId = (typeof SHAPES)[number]["id"];

const textSchema = z.object({
  ...boxSchema,
  kind: z.literal("text"),
  text: z.string().max(500),
  /** "display" and "body" follow the theme; anything else is a font id. */
  font: z.string().regex(NAME).catch("body"),
  size: z.number().min(8).max(400),
  color: colorSchema.catch("ink"),
  align: z.enum(["left", "center", "right"]).catch("center"),
  bold: z.boolean().catch(false),
  italic: z.boolean().catch(false),
});

const artSchema = z.object({
  ...boxSchema,
  kind: z.literal("art"),
  art: z.string().regex(NAME),
  color: colorSchema.catch("accent"),
  flip: z.boolean().catch(false),
});

const shapeSchema = z.object({
  ...boxSchema,
  kind: z.literal("shape"),
  shape: z.enum(SHAPES.map((s) => s.id) as [ShapeId, ...ShapeId[]]),
  color: colorSchema.catch("accent"),
  /** An outline rather than a fill. */
  outline: z.boolean().catch(false),
});

const photoSchema = z.object({
  ...boxSchema,
  kind: z.literal("photo"),
  src: z.string().url().max(1000).refine((u) => u.startsWith("https://")),
  alt: z.string().max(200).catch(""),
});

const elementSchema = z.discriminatedUnion("kind", [textSchema, artSchema, shapeSchema, photoSchema]);

export type CanvasElement = z.infer<typeof elementSchema>;
export type TextElement = z.infer<typeof textSchema>;
export type ElementKind = CanvasElement["kind"];

export const BLOCK_STYLES = [
  { id: "card", label: "Card" },
  { id: "plain", label: "Plain" },
  { id: "tint", label: "Tinted" },
  { id: "outline", label: "Outlined" },
] as const;

export type BlockStyle = (typeof BLOCK_STYLES)[number]["id"];

export const MAX_ELEMENTS = 80;

const sectionSchema = z.object({
  /** The reference width every position in this section is measured against. */
  w: z.number().min(200).max(4000),
  /** Back to front. Anything unreadable is dropped, not the whole section. */
  elements: z
    .array(elementSchema.nullable().catch(null))
    .max(MAX_ELEMENTS)
    .transform((list) => {
      const seen = new Set<string>();
      return list.filter((el): el is CanvasElement => el !== null && !seen.has(el.id) && !!seen.add(el.id));
    })
    .catch([]),
  /** The section as a whole: its card style. null is the theme's own. */
  style: z.enum(BLOCK_STYLES.map((s) => s.id) as [BlockStyle, ...BlockStyle[]]).nullable().catch(null),
  /** The phone frame. "stack" puts the elements in reading order under the section. */
  phone: z.object({ mode: z.literal("stack") }).catch({ mode: "stack" }),
});

export type CanvasSection = z.infer<typeof sectionSchema>;

const SECTION_KEY = /^(hero|rsvp|photos|weekend|wall|guests|travel|faq|registry|block:[0-9a-f-]{36})$/;

export const EMPTY_CANVAS = { v: 1 as const, sections: {} as Record<string, CanvasSection> };

export const canvasSchema = z
  .object({
    v: z.literal(1),
    sections: z
      .record(z.string(), sectionSchema.nullable().catch(null))
      .transform(
        (all) =>
          Object.fromEntries(
            Object.entries(all).filter(([key, s]) => SECTION_KEY.test(key) && s !== null),
          ) as Record<string, CanvasSection>,
      ),
  })
  .catch(EMPTY_CANVAS);

export type SiteCanvas = z.infer<typeof canvasSchema>;

// ---------------------------------------------------------------------------
// Edits. Pure, so the editor panel and the preview frame make the same change.

export function newElementId() {
  return Math.random().toString(36).slice(2, 10).padEnd(8, "0");
}

export const snap = (n: number) => Math.round(n / GRID) * GRID;

export function sectionOf(canvas: SiteCanvas, key: string): CanvasSection | null {
  return canvas.sections[key] ?? null;
}

export function findElement(canvas: SiteCanvas, key: string, id: string) {
  return canvas.sections[key]?.elements.find((el) => el.id === id) ?? null;
}

function withSection(
  canvas: SiteCanvas,
  key: string,
  w: number,
  edit: (section: CanvasSection) => CanvasSection,
): SiteCanvas {
  const current = canvas.sections[key] ?? { w: Math.round(w), elements: [], style: null, phone: { mode: "stack" } };
  return { ...canvas, sections: { ...canvas.sections, [key]: edit(current) } };
}

function mapElements(canvas: SiteCanvas, key: string, edit: (list: CanvasElement[]) => CanvasElement[]) {
  const section = canvas.sections[key];
  if (!section) return canvas;
  return withSection(canvas, key, section.w, (s) => ({ ...s, elements: edit(s.elements) }));
}

/** Adds to the front. `w` is the section's width now, used if it has no frame yet. */
export function addElement(canvas: SiteCanvas, key: string, w: number, el: CanvasElement): SiteCanvas {
  if ((canvas.sections[key]?.elements.length ?? 0) >= MAX_ELEMENTS) return canvas;
  return withSection(canvas, key, w, (s) => ({ ...s, elements: [...s.elements, el] }));
}

export function updateElement(
  canvas: SiteCanvas,
  key: string,
  id: string,
  patch: Partial<CanvasElement>,
): SiteCanvas {
  return mapElements(canvas, key, (list) =>
    list.map((el) => (el.id === id ? ({ ...el, ...patch, id, kind: el.kind } as CanvasElement) : el)),
  );
}

export function removeElement(canvas: SiteCanvas, key: string, id: string): SiteCanvas {
  return mapElements(canvas, key, (list) => list.filter((el) => el.id !== id));
}

/** A copy just below and to the right, in front, unlocked. Returns the new id too. */
export function duplicateElement(canvas: SiteCanvas, key: string, id: string): [SiteCanvas, string | null] {
  const el = findElement(canvas, key, id);
  if (!el || (canvas.sections[key]?.elements.length ?? 0) >= MAX_ELEMENTS) return [canvas, null];
  const copy = { ...el, id: newElementId(), x: el.x + GRID * 2, y: el.y + GRID * 2, locked: false, hidden: false };
  return [mapElements(canvas, key, (list) => [...list, copy]), copy.id];
}

export type LayerMove = "forward" | "backward" | "front" | "back";

export function moveLayer(canvas: SiteCanvas, key: string, id: string, move: LayerMove): SiteCanvas {
  return mapElements(canvas, key, (list) => {
    const at = list.findIndex((el) => el.id === id);
    if (at < 0) return list;
    const to =
      move === "front" ? list.length - 1 : move === "back" ? 0 : move === "forward" ? Math.min(list.length - 1, at + 1) : Math.max(0, at - 1);
    return reorder(list, at, to);
  });
}

/** For the Layers list: put an element at a position, back to front. */
export function placeLayer(canvas: SiteCanvas, key: string, id: string, to: number): SiteCanvas {
  return mapElements(canvas, key, (list) => {
    const at = list.findIndex((el) => el.id === id);
    return at < 0 ? list : reorder(list, at, Math.max(0, Math.min(list.length - 1, to)));
  });
}

function reorder<T>(list: T[], from: number, to: number) {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export type Align = "top" | "middle" | "bottom" | "left" | "centre" | "right";

/** Where an element goes to line up with its section (`h` is the section's height, in its units). */
export function alignPatch(el: CanvasElement, align: Align, w: number, h: number): Partial<CanvasElement> {
  switch (align) {
    case "left":
      return { x: 0 };
    case "centre":
      return { x: Math.round((w - el.w) / 2) };
    case "right":
      return { x: Math.round(w - el.w) };
    case "top":
      return { y: 0 };
    case "middle":
      return { y: Math.round((h - el.h) / 2) };
    case "bottom":
      return { y: Math.round(h - el.h) };
  }
}

export function setSectionStyle(canvas: SiteCanvas, key: string, w: number, style: BlockStyle | null): SiteCanvas {
  return withSection(canvas, key, w, (s) => ({ ...s, style }));
}

/** Top to bottom, then left to right: the order a phone stacks them in. */
export function readingOrder(elements: CanvasElement[]) {
  return [...elements].sort((a, b) => (Math.abs(a.y - b.y) < GRID * 3 ? a.x - b.x : a.y - b.y));
}

/** How far down the section's elements reach, so it grows to hold them. */
export function elementsBottom(elements: CanvasElement[]) {
  return elements.reduce((max, el) => (el.hidden ? max : Math.max(max, el.y + el.h)), 0);
}

/** Font ids used by text elements, so the live page loads them. */
export function canvasFontIds(canvas: SiteCanvas) {
  return Object.values(canvas.sections).flatMap((s) =>
    s.elements.flatMap((el) => (el.kind === "text" && el.font !== "display" && el.font !== "body" ? [el.font] : [])),
  );
}
