import {
  EMPTY_TEXT_STYLE,
  MOTION_PRESETS,
  PALETTES,
  themeById,
  type FontPairingId,
  type HeroLayoutId,
  type SceneId,
  type SiteDesign,
  type ThemeId,
} from "./site-design";

/**
 * Templates (Editor v2, phase 5a): finished looks to start from, each a
 * combination of things the editor already has -- a theme, a palette, a font
 * pair, a hero layout, artwork, a background and motion -- so every one is
 * something the couple could have built themselves and can keep changing.
 *
 * Switching keeps the couple's content: their words (headings retyped in the
 * preview), section order, photos' focus, and anything they placed on the
 * page. Only the look changes.
 */

export const TEMPLATE_TAGS = ["Beach", "Garden", "Rustic", "Line art", "Traditions", "Modern"] as const;

export type TemplateTag = (typeof TEMPLATE_TAGS)[number];

export type SiteTemplate = {
  id: string;
  name: string;
  tags: TemplateTag[];
  theme: ThemeId;
  hero: HeroLayoutId;
  /** A palette from PALETTES over the theme's colours; none keeps the theme's. */
  palette?: string;
  fonts?: FontPairingId;
  /** None means the theme's own monogram. */
  ornament?: SiteDesign["ornament"];
  art?: SiteDesign["art"];
  scene?: SceneId | null;
  pageStyle?: SiteDesign["pageStyle"];
  background?: Partial<SiteDesign["background"]>;
  motion?: keyof typeof MOTION_PRESETS;
};

export const TEMPLATES: SiteTemplate[] = [
  {
    id: "ocean",
    name: "Cake by the Ocean",
    tags: ["Beach", "Line art"],
    theme: "ocean",
    hero: "text",
    ornament: "anchor",
    art: { id: "frond", placement: "sides" },
    pageStyle: "storybook",
    background: { texture: "paper" },
  },
  {
    id: "lemon-grove",
    name: "Lemon Grove",
    tags: ["Beach", "Garden"],
    theme: "riviera",
    palette: "amalfi",
    hero: "framed",
    ornament: "laurel",
    art: { id: "lemon", placement: "corners" },
    background: { texture: "wash" },
  },
  {
    id: "night-swim",
    name: "Night Swim",
    tags: ["Beach", "Modern"],
    theme: "midnight",
    hero: "poster",
    ornament: "star",
    scene: "stars",
    background: { pattern: "dots", scope: "top" },
    motion: "lively",
  },
  {
    id: "garden-party",
    name: "Garden Party",
    tags: ["Garden"],
    theme: "garden",
    hero: "full",
    ornament: "laurel",
    art: { id: "eucalyptus", placement: "sides" },
    background: { texture: "linen" },
  },
  {
    id: "rose-garden",
    name: "Rose Garden",
    tags: ["Garden"],
    theme: "blush",
    hero: "framed",
    fonts: "gv",
    ornament: "ring",
    art: { id: "roses-white", placement: "corners" },
    background: { texture: "wash" },
  },
  {
    id: "vineyard",
    name: "Vineyard Supper",
    tags: ["Rustic", "Line art"],
    theme: "vineyard",
    hero: "split",
    ornament: "crest",
    art: { id: "grapes", placement: "sides" },
    background: { texture: "linen" },
  },
  {
    id: "desert-sun",
    name: "Desert Sun",
    tags: ["Rustic", "Line art"],
    theme: "desert",
    hero: "text",
    ornament: "star",
    art: { id: "saguaro", placement: "sides" },
    background: { texture: "wash" },
  },
  {
    id: "ranch",
    name: "Home on the Ranch",
    tags: ["Rustic"],
    theme: "ranch",
    hero: "card",
    ornament: "horseshoe",
    art: { id: "horseshoe", placement: "corners" },
    background: { texture: "paper" },
  },
  {
    id: "winter-pines",
    name: "Winter Pines",
    tags: ["Line art"],
    theme: "winter",
    hero: "framed",
    art: { id: "pine", placement: "sides" },
    pageStyle: "storybook",
  },
  {
    id: "modern",
    name: "Gallery",
    tags: ["Modern"],
    theme: "modern",
    hero: "poster",
    fonts: "bz",
    ornament: "none",
    motion: "lively",
  },
  {
    id: "black-tie",
    name: "Black Tie",
    tags: ["Modern"],
    theme: "blacktie",
    hero: "card",
    ornament: "scroll",
    background: { texture: "paper" },
  },
  {
    id: "mehndi",
    name: "Mehndi Night",
    tags: ["Traditions"],
    theme: "mehndi",
    hero: "monogram",
    ornament: "mandala",
    art: { id: "peony", placement: "corners" },
    background: { pattern: "lattice", scope: "top" },
  },
  {
    id: "nikah",
    name: "Nikah",
    tags: ["Traditions"],
    theme: "nikah",
    hero: "text",
    ornament: "bismillah",
    background: { pattern: "lattice" },
  },
  {
    id: "chuppah",
    name: "Under the Chuppah",
    tags: ["Traditions", "Line art"],
    theme: "chuppah",
    hero: "framed",
    ornament: "chuppah",
    art: { id: "olive-line", placement: "sides" },
  },
];

export function templateById(id: string | null | undefined) {
  return TEMPLATES.find((t) => t.id === id) ?? null;
}

/** A design with a template's look and the couple's content. */
export function applyTemplate(design: SiteDesign, t: SiteTemplate): SiteDesign {
  const theme = themeById(t.theme);
  const palette = PALETTES.find((p) => p.id === t.palette);
  // Words they've typed stay; one-off fonts and colours give way to the new look.
  const text = Object.fromEntries(
    Object.entries(design.text).flatMap(([slot, style]) =>
      style?.text ? [[slot, { ...EMPTY_TEXT_STYLE, text: style.text }]] : [],
    ),
  ) as SiteDesign["text"];
  return {
    ...design,
    template: t.id,
    theme: t.theme,
    accent: palette?.accent ?? null,
    colors: palette ? { bg: palette.bg, ink: palette.ink, heading: palette.heading } : { bg: null, ink: null, heading: null },
    fonts: t.fonts ?? "theme",
    fontDisplay: null,
    fontBody: null,
    ornament: t.ornament ?? theme.ornament ?? "rule",
    art: t.art ?? { id: null, placement: "sides" },
    hero: t.hero,
    scene: t.scene ?? null,
    pageStyle: t.pageStyle ?? "cards",
    background: { pattern: "none", texture: "none", scope: "page", ...t.background },
    motion: MOTION_PRESETS[t.motion ?? "subtle"],
    text,
  };
}
