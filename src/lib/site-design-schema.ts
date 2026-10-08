import { z } from "zod";
import { canvasSchema } from "./site-canvas-schema";
import { PHOTO_FILTERS, type PhotoFilterId } from "./site-canvas";
import {
  ART_IDS,
  BG_PATTERNS,
  BG_TEXTURES,
  BLOCK_KEY,
  DEFAULT_SECTIONS,
  DEFAULT_SITE_DESIGN,
  DEFAULT_THEME_ID,
  FONT_IDS,
  FONT_PAIRINGS,
  HERO_LAYOUTS,
  HERO_PHOTO,
  HEX,
  MOTION_PRESETS,
  NO_BACKGROUND,
  ORNAMENT_IDS,
  SCENE_IDS,
  SECTION_IDS,
  TEXT_SLOT_IDS,
  THEME_IDS,
  hasTextStyle,
  type BgPattern,
  type BgTexture,
  type BlockKey,
  type FontPairingId,
  type HeroLayoutId,
  type SectionKey,
  type TextSlotId,
} from "./site-design";

/**
 * The guest site design's validation (see site-design.ts for what each
 * setting means). Server code and the editor parse with it; the guest page
 * only reads designs that were parsed on the server, so it never loads zod.
 */

const sectionKeySchema = z.union([
  z.enum(SECTION_IDS),
  z.string().regex(BLOCK_KEY).transform((k) => k as BlockKey),
]);

/**
 * Whatever order was saved, made whole: unknown ids and repeats dropped, and
 * any built-in section added to Wren since appended, visible, so a new section
 * never silently goes missing from an older design. Blocks are kept as saved;
 * one whose row has been deleted is simply skipped when the page renders.
 */
function completeSections(saved: { id: SectionKey; hidden: boolean }[]) {
  const seen = new Set<SectionKey>();
  const kept = saved.filter((x) => !seen.has(x.id) && seen.add(x.id));
  return [...kept, ...DEFAULT_SECTIONS.filter((x) => !seen.has(x.id))];
}

const motionSchema = z.object({
  opening: z.enum(["none", "envelope", "write", "reveal"]).catch("none"),
  scroll: z.enum(["none", "fade", "slide", "zoom"]).catch("fade"),
  photo: z.enum(["still", "zoom"]).catch("zoom"),
  petals: z.boolean().catch(false),
  ticking: z.boolean().catch(true),
  confetti: z.boolean().catch(false),
  speed: z.enum(["slow", "normal", "fast"]).catch("normal"),
});

/** Each null means the theme's own. */
const textStyleSchema = z.object({
  text: z.string().trim().max(120).nullable().catch(null),
  font: z.enum(FONT_IDS).nullable().catch(null),
  size: z.number().min(0.5).max(2.5).nullable().catch(null),
  color: z.string().regex(HEX).nullable().catch(null),
  align: z.enum(["left", "center", "right"]).nullable().catch(null),
  bold: z.boolean().nullable().catch(null),
  italic: z.boolean().nullable().catch(null),
});

export type TextStyle = z.infer<typeof textStyleSchema>;

const backgroundSchema = z.object({
  pattern: z.enum(BG_PATTERNS.map((p) => p.id) as [BgPattern, ...BgPattern[]]).catch("none"),
  texture: z.enum(BG_TEXTURES.map((t) => t.id) as [BgTexture, ...BgTexture[]]).catch("none"),
  /** Every section, or just the top of the page. */
  scope: z.enum(["page", "top"]).catch("page"),
});

export const siteDesignSchema = z.object({
  theme: z.enum(THEME_IDS).catch(DEFAULT_THEME_ID),
  /** null means the theme's first swatch. */
  accent: z.string().regex(HEX).nullable().catch(null),
  fonts: z.enum(FONT_PAIRINGS.map((f) => f.id) as [FontPairingId, ...FontPairingId[]]).catch("theme"),
  /** A face picked on its own; null means the pairing's, then the theme's. */
  fontDisplay: z.enum(FONT_IDS).nullable().catch(null),
  fontBody: z.enum(FONT_IDS).nullable().catch(null),
  /** Colours over the theme's own; each null means the theme's. */
  colors: z
    .object({
      bg: z.string().regex(HEX).nullable().catch(null),
      ink: z.string().regex(HEX).nullable().catch(null),
      heading: z.string().regex(HEX).nullable().catch(null),
    })
    .catch({ bg: null, ink: null, heading: null }),
  ornament: z.enum(ORNAMENT_IDS).catch("rule"),
  art: z
    .object({
      id: z.enum(ART_IDS).nullable().catch(null),
      placement: z.enum(["sides", "corners"]).catch("sides"),
    })
    .catch({ id: null, placement: "sides" }),
  hero: z.enum(HERO_LAYOUTS.map((h) => h.id) as [HeroLayoutId, ...HeroLayoutId[]]).catch("full"),
  /** null means the theme's own scene. */
  scene: z.enum(SCENE_IDS).nullable().catch(null),
  pageStyle: z.enum(["cards", "storybook"]).catch("cards"),
  /** A vow renewal changes the wording, and counts the years from `since`. */
  occasion: z
    .object({
      kind: z.enum(["wedding", "renewal"]).catch("wedding"),
      since: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().catch(null),
    })
    .catch({ kind: "wedding", since: null }),
  sections: z
    .array(z.object({ id: sectionKeySchema, hidden: z.boolean().catch(false) }).nullable().catch(null))
    .transform((list) => completeSections(list.filter((x) => x !== null)))
    .catch(DEFAULT_SECTIONS),
  motion: motionSchema.catch(MOTION_PRESETS.subtle),
  /** Per-slot changes made by clicking words in the preview. Unknown or empty slots are dropped. */
  text: z
    .record(z.string(), textStyleSchema.nullable().catch(null))
    .transform(
      (all) =>
        Object.fromEntries(
          Object.entries(all).filter(
            ([id, style]) => TEXT_SLOT_IDS.has(id) && style !== null && hasTextStyle(style),
          ),
        ) as Partial<Record<TextSlotId, TextStyle>>,
    )
    .catch({}),
  /** Free elements inside sections, and whole-section styles (src/lib/site-canvas.ts). */
  canvas: canvasSchema,
  background: backgroundSchema.catch(NO_BACKGROUND),
  /** The banner photo's focus point (percent across and down) and filter. */
  heroPhoto: z
    .object({
      fx: z.number().min(0).max(100).catch(50),
      fy: z.number().min(0).max(100).catch(50),
      filter: z.enum(PHOTO_FILTERS.map((f) => f.id) as [PhotoFilterId, ...PhotoFilterId[]]).catch("none"),
    })
    .catch(HERO_PHOTO),
  /** The template the look started from (site-templates.ts), shown as picked. */
  template: z.string().regex(/^[a-z-]{1,40}$/).nullable().catch(null),
});

/** Whatever is in the column -- null, an old shape, junk -- as a usable design. */
export function parseSiteDesign(value: unknown): SiteDesign {
  const result = siteDesignSchema.safeParse(value ?? {});
  return result.success ? result.data : DEFAULT_SITE_DESIGN;
}


export type Motion = z.infer<typeof motionSchema>;
export type SiteDesign = z.infer<typeof siteDesignSchema>;
