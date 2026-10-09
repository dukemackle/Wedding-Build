import type {
  CanvasColor,
  CanvasElement,
  CanvasSection,
  PhoneBox,
  PhoneFrame,
  SiteCanvas,
} from "./site-canvas-schema";

export type {
  CanvasColor,
  CanvasElement,
  CanvasSection,
  ElementKind,
  PhoneBox,
  PhoneFrame,
  SiteCanvas,
  TextElement,
} from "./site-canvas-schema";

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
 * Phones get their own frame (`phone`). Until the couple moves something on
 * the phone, it stacks the elements in reading order under the section's
 * usual content ("stack"). The first move switches that section to its own
 * hand-placed layout ("free"), started from the stack as it looked, with
 * positions measured against the section's phone width. Either way an
 * element can be hidden on phones only.
 *
 * Nothing here imports site-design.ts (which imports this), so ids for fonts
 * and art are checked by shape and resolved when the page renders: an id that
 * no longer exists is skipped, never an error.
 *
 * The zod schema lives apart, in site-canvas-schema.ts, so the guest page
 * (which only draws a canvas) doesn't download the validation library.
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

export const HEX = /^#[0-9a-f]{6}$/i;
export const ID = /^[a-z0-9]{6,16}$/;
export const NAME = /^[a-z0-9-]{1,40}$/;

export function colorCss(color: CanvasColor) {
  return CANVAS_COLORS.find((c) => c.id === color)?.css ?? color;
}

/** Plays once as guests scroll to it (the Animate panel); "none" stays still. */
export const ANIMATIONS = [
  { id: "none", label: "None" },
  { id: "rise", label: "Rise" },
  { id: "fade", label: "Fade" },
  { id: "pan", label: "Pan" },
  { id: "pop", label: "Pop" },
  { id: "wipe", label: "Wipe" },
  { id: "drift", label: "Drift" },
] as const;

export type AnimationId = (typeof ANIMATIONS)[number]["id"];

/** Photo filters as CSS, gentle enough that skin still looks like skin. */
export const PHOTO_FILTERS = [
  { id: "none", label: "Original", css: "none" },
  { id: "warm", label: "Warm", css: "sepia(.22) saturate(1.15) hue-rotate(-6deg)" },
  { id: "cool", label: "Cool", css: "saturate(.9) hue-rotate(10deg) brightness(1.03)" },
  { id: "vivid", label: "Vivid", css: "saturate(1.3) contrast(1.05)" },
  { id: "fade", label: "Faded", css: "contrast(.88) brightness(1.08) saturate(.8)" },
  { id: "vintage", label: "Vintage", css: "sepia(.45) contrast(.95) brightness(1.02)" },
  { id: "mono", label: "Black & white", css: "grayscale(1) contrast(1.05)" },
] as const;

export type PhotoFilterId = (typeof PHOTO_FILTERS)[number]["id"];

export const PHOTO_FRAMES = [
  { id: "none", label: "None" },
  { id: "rounded", label: "Rounded" },
  { id: "circle", label: "Circle" },
  { id: "arch", label: "Arch" },
  { id: "polaroid", label: "Polaroid" },
  { id: "border", label: "Border" },
] as const;

export type PhotoFrameId = (typeof PHOTO_FRAMES)[number]["id"];

export function filterCss(id: string) {
  return PHOTO_FILTERS.find((f) => f.id === id)?.css ?? "none";
}

export const SHAPES = [
  { id: "rect", label: "Rectangle" },
  { id: "circle", label: "Circle" },
  { id: "arch", label: "Arch" },
  { id: "line", label: "Line" },
] as const;

export type ShapeId = (typeof SHAPES)[number]["id"];

export const BLOCK_STYLES = [
  { id: "card", label: "Card" },
  { id: "plain", label: "Plain" },
  { id: "tint", label: "Tinted" },
  { id: "outline", label: "Outlined" },
] as const;

export type BlockStyle = (typeof BLOCK_STYLES)[number]["id"];

export const MAX_ELEMENTS = 80;

export const STACKED_PHONE: PhoneFrame = { mode: "stack", w: 390, place: {}, hidden: [] };

export const EMPTY_CANVAS = { v: 1 as const, sections: {} as Record<string, CanvasSection> };

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
  const current = canvas.sections[key] ?? { w: Math.round(w), elements: [], style: null, phone: STACKED_PHONE };
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
  const next = mapElements(canvas, key, (list) => list.filter((el) => el.id !== id));
  return editPhone(next, key, (phone) => {
    const place = Object.fromEntries(Object.entries(phone.place).filter(([other]) => other !== id));
    return { ...phone, place, hidden: phone.hidden.filter((h) => h !== id) };
  });
}

/** A copy just below and to the right, in front, unlocked. Returns the new id too. */
export function duplicateElement(canvas: SiteCanvas, key: string, id: string): [SiteCanvas, string | null] {
  const el = findElement(canvas, key, id);
  if (!el || (canvas.sections[key]?.elements.length ?? 0) >= MAX_ELEMENTS) return [canvas, null];
  const copy = { ...el, id: newElementId(), x: el.x + GRID * 2, y: el.y + GRID * 2, locked: false, hidden: false };
  const next = mapElements(canvas, key, (list) => [...list, copy]);
  // On a hand-placed phone layout the copy lands beside the original there too.
  const box = canvas.sections[key]?.phone.place[id];
  return [
    box ? editPhone(next, key, (phone) => ({ ...phone, place: { ...phone.place, [copy.id]: { ...box, x: box.x + GRID * 2, y: box.y + GRID * 2 } } })) : next,
    copy.id,
  ];
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

// ---------------------------------------------------------------------------
// The phone frame.

function editPhone(canvas: SiteCanvas, key: string, edit: (phone: PhoneFrame) => PhoneFrame): SiteCanvas {
  const section = canvas.sections[key];
  if (!section) return canvas;
  return { ...canvas, sections: { ...canvas.sections, [key]: { ...section, phone: edit(section.phone) } } };
}

/**
 * Where each shown element sits in a hand-placed phone layout. An element
 * added on the computer since the layout went free has no phone box yet, so
 * it goes under the rest, centred, at a phone-friendly size, the way the
 * stack would have put it.
 */
export function phoneBoxes(section: CanvasSection): Map<string, PhoneBox> {
  const { phone } = section;
  const boxes = new Map<string, PhoneBox>();
  const shown = section.elements.filter((el) => !el.hidden && !phone.hidden.includes(el.id));
  let bottom = 0;
  for (const el of shown) {
    const b = phone.place[el.id];
    if (b) {
      boxes.set(el.id, b);
      bottom = Math.max(bottom, b.y + b.h);
    }
  }
  for (const el of readingOrder(shown)) {
    if (boxes.has(el.id)) continue;
    const w = Math.min(phone.w - GRID * 4, Math.max(64, Math.round((el.w / section.w) * phone.w * 1.8)));
    const h = el.kind === "text" ? el.h * (w / el.w) : Math.round(w * (el.h / el.w));
    const size = el.kind === "text" ? Math.max(14, Math.round(el.size * 0.45)) : null;
    const box = { x: Math.round((phone.w - w) / 2), y: bottom + GRID * 2, w, h: Math.max(1, Math.round(h)), rot: 0, size };
    boxes.set(el.id, box);
    bottom = box.y + box.h;
  }
  return boxes;
}

/** Switches a section to a hand-placed phone layout, with boxes measured from the stack. */
export function placeOnPhone(canvas: SiteCanvas, key: string, w: number, place: Record<string, PhoneBox>): SiteCanvas {
  return editPhone(canvas, key, (phone) => ({
    ...phone,
    mode: "free",
    w: phone.mode === "free" ? phone.w : Math.round(w),
    place: { ...phone.place, ...place },
  }));
}

export function updatePhoneBox(canvas: SiteCanvas, key: string, id: string, patch: Partial<PhoneBox>): SiteCanvas {
  const section = canvas.sections[key];
  if (!section || section.phone.mode !== "free") return canvas;
  const current = phoneBoxes(section).get(id) ?? section.phone.place[id];
  if (!current) return canvas;
  return editPhone(canvas, key, (phone) => ({ ...phone, place: { ...phone.place, [id]: { ...current, ...patch } } }));
}

/** Back to the automatic stack, keeping which elements are off phones. */
export function stackOnPhone(canvas: SiteCanvas, key: string): SiteCanvas {
  return editPhone(canvas, key, (phone) => ({ ...STACKED_PHONE, hidden: phone.hidden }));
}

export function setHiddenOnPhone(canvas: SiteCanvas, key: string, id: string, hidden: boolean): SiteCanvas {
  return editPhone(canvas, key, (phone) => ({
    ...phone,
    hidden: hidden ? [...new Set([...phone.hidden, id])] : phone.hidden.filter((h) => h !== id),
  }));
}
