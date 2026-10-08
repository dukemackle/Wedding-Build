import { z } from "zod";
import {
  ANIMATIONS,
  BLOCK_STYLES,
  CANVAS_COLORS,
  GRID,
  HEX,
  ID,
  MAX_ELEMENTS,
  NAME,
  PHOTO_FILTERS,
  PHOTO_FRAMES,
  SHAPES,
  type AnimationId,
  type BlockStyle,
  type CanvasColorId,
  type PhotoFilterId,
  type PhotoFrameId,
  type ShapeId,
  EMPTY_CANVAS,
  STACKED_PHONE,
} from "./site-canvas";

/**
 * The canvas format's validation (see site-canvas.ts for what it means).
 * Server code and the editor parse with it; the guest page never loads it.
 */

const colorSchema = z.union([
  z.enum(CANVAS_COLORS.map((c) => c.id) as [CanvasColorId, ...CanvasColorId[]]),
  z.string().regex(HEX),
]);

export type CanvasColor = z.infer<typeof colorSchema>;

const boxSchema = {
  id: z.string().regex(ID),
  x: z.number().min(-4000).max(8000),
  y: z.number().min(-4000).max(8000),
  w: z.number().min(GRID).max(8000),
  h: z.number().min(1).max(8000),
  rot: z.number().min(-180).max(180).catch(0),
  locked: z.boolean().catch(false),
  hidden: z.boolean().catch(false),
  anim: z.enum(ANIMATIONS.map((a) => a.id) as [AnimationId, ...AnimationId[]]).catch("none"),
};

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
  /** Crop: the point kept in view (percent across and down) and how far it's zoomed in. */
  fx: z.number().min(0).max(100).catch(50),
  fy: z.number().min(0).max(100).catch(50),
  zoom: z.number().min(1).max(3).catch(1),
  frame: z.enum(PHOTO_FRAMES.map((f) => f.id) as [PhotoFrameId, ...PhotoFrameId[]]).catch("none"),
  filter: z.enum(PHOTO_FILTERS.map((f) => f.id) as [PhotoFilterId, ...PhotoFilterId[]]).catch("none"),
});

const elementSchema = z.discriminatedUnion("kind", [textSchema, artSchema, shapeSchema, photoSchema]);

export type CanvasElement = z.infer<typeof elementSchema>;
export type TextElement = z.infer<typeof textSchema>;
export type ElementKind = CanvasElement["kind"];

/** A box in the phone frame. `size` is a text element's font size there. */
const phoneBoxSchema = z.object({
  x: z.number().min(-2000).max(4000),
  y: z.number().min(-2000).max(8000),
  w: z.number().min(GRID).max(4000),
  h: z.number().min(1).max(8000),
  rot: z.number().min(-180).max(180).catch(0),
  size: z.number().min(6).max(400).nullable().catch(null),
});

export type PhoneBox = z.infer<typeof phoneBoxSchema>;

const phoneSchema = z.object({
  mode: z.enum(["stack", "free"]).catch("stack"),
  /** The section's width on a phone when it went free; phone boxes are in these units. */
  w: z.number().min(200).max(1200).catch(390),
  place: z
    .record(z.string(), phoneBoxSchema.nullable().catch(null))
    .transform(
      (all) =>
        Object.fromEntries(Object.entries(all).filter(([id, b]) => ID.test(id) && b !== null)) as Record<string, PhoneBox>,
    )
    .catch({}),
  /** Elements left off phones. */
  hidden: z.array(z.string().regex(ID)).max(MAX_ELEMENTS).catch([]),
});

export type PhoneFrame = z.infer<typeof phoneSchema>;

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
  /** The phone frame: stacked under the section, or placed by hand. */
  phone: phoneSchema.catch(STACKED_PHONE),
});

export type CanvasSection = z.infer<typeof sectionSchema>;

const SECTION_KEY = /^(hero|rsvp|photos|weekend|wall|guests|travel|faq|registry|block:[0-9a-f-]{36})$/;

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

