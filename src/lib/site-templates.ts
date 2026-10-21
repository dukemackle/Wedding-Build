import {
  EMPTY_TEXT_STYLE,
  MOTION_PRESETS,
  NO_BACKGROUND,
  PALETTES,
  themeById,
  type FallingId,
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

export const TEMPLATE_TAGS = ["Signature", "Beach", "Garden", "Rustic", "Line art", "Traditions", "Modern", "Glam"] as const;

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
  /** What falls, over the motion preset's own. */
  falling?: FallingId;
  /** The RSVP's layout; none means the plain card. */
  rsvp?: SiteDesign["layouts"]["rsvp"];
};

export const TEMPLATES: SiteTemplate[] = [
  // The signature templates (approved 2026-10-21): each its own page
  // arrangement (PAGE_STYLES), not only a colour and a piece of art.
  {
    id: "heirloom",
    name: "Heirloom",
    tags: ["Signature", "Garden"],
    theme: "garden",
    palette: "heirloom",
    fonts: "cj",
    hero: "framed",
    ornament: "none",
    art: { id: "rose", placement: "sides" },
    pageStyle: "invitation",
  },
  {
    id: "editorial",
    name: "Editorial",
    tags: ["Signature", "Modern"],
    theme: "modern",
    palette: "gallery",
    fonts: "bj",
    hero: "poster",
    ornament: "none",
    pageStyle: "magazine",
    rsvp: "band",
  },
  {
    id: "riviera",
    name: "Riviera",
    tags: ["Signature", "Beach"],
    theme: "riviera",
    palette: "amalfi",
    fonts: "dk",
    hero: "split",
    ornament: "none",
    art: { id: "lemon", placement: "sides" },
    pageStyle: "postcard",
    rsvp: "band",
    motion: "lively",
  },
  {
    id: "ocean",
    name: "Cake by the Ocean",
    tags: ["Beach"],
    theme: "ocean",
    hero: "text",
    ornament: "anchor",
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
    art: { id: "eucalyptus-line", placement: "sides" },
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
    tags: ["Rustic"],
    theme: "vineyard",
    hero: "split",
    ornament: "crest",
    background: { texture: "linen" },
    art: { id: "cherries", placement: "sides" },
  },
  {
    id: "desert-sun",
    name: "Desert Sun",
    tags: ["Rustic"],
    theme: "desert",
    hero: "text",
    ornament: "star",
    background: { texture: "wash" },
  },
  {
    id: "ranch",
    name: "Home on the Ranch",
    tags: ["Rustic"],
    theme: "ranch",
    hero: "card",
    ornament: "horseshoe",
    background: { texture: "paper" },
  },
  {
    id: "winter-pines",
    name: "Winter Pines",
    tags: [],
    theme: "winter",
    hero: "framed",
    art: { id: "hawthorn", placement: "sides" },
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
    tags: ["Glam", "Modern"],
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
    background: { pattern: "lattice", scope: "top" },
    falling: "marigolds",
    art: { id: "peony", placement: "corners" },
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
    tags: ["Traditions"],
    theme: "chuppah",
    hero: "framed",
    ornament: "chuppah",
    art: { id: "myrtle", placement: "sides" },
  },
  {
    id: "sunbaked",
    name: "Sunbaked",
    tags: ["Rustic"],
    theme: "terracotta",
    hero: "split",
    ornament: "laurel",
    art: { id: "bay-laurel", placement: "corners" },
    pageStyle: "storybook",
    background: { texture: "linen", divider: "deckle" },
  },
  {
    id: "conservatory",
    name: "Conservatory",
    tags: ["Garden", "Line art"],
    theme: "botanical",
    hero: "framed",
    ornament: "arch",
    art: { id: "eucalyptus-line", placement: "sides" },
    background: { pattern: "lattice", scope: "top" },
    falling: "butterflies",
  },
  {
    id: "alpine",
    name: "Alpine",
    tags: ["Rustic"],
    theme: "mountain",
    hero: "full",
    ornament: "mountain",
    pageStyle: "storybook",
    background: { texture: "paper", divider: "torn" },
  },
  {
    id: "barn-dance",
    name: "Barn Dance",
    tags: ["Rustic"],
    theme: "barn",
    hero: "card",
    art: { id: "grass", placement: "corners" },
    pageStyle: "storybook",
    background: { texture: "linen", divider: "scallop" },
    falling: "fireflies",
  },
  {
    id: "rodeo",
    name: "Rodeo Sweetheart",
    tags: ["Rustic"],
    theme: "cowgirl",
    hero: "poster",
    background: { pattern: "gingham", scope: "top" },
    motion: "lively",
    falling: "hearts",
  },
  {
    id: "fiesta",
    name: "Fiesta",
    tags: ["Traditions"],
    theme: "fiesta",
    hero: "monogram",
    pageStyle: "storybook",
    background: { pattern: "harlequin", scope: "top", divider: "scallop" },
    motion: "lively",
    falling: "marigolds",
  },
  {
    id: "red-lanterns",
    name: "Red Lanterns",
    tags: ["Traditions"],
    theme: "doublehappiness",
    hero: "monogram",
    background: { pattern: "scallops", scope: "top" },
    falling: "lanterns",
  },
  {
    id: "city-hall",
    name: "City Hall",
    tags: ["Modern"],
    theme: "city",
    hero: "split",
    fonts: "go",
    background: { pattern: "pinstripe", scope: "top" },
  },
  {
    id: "groovy",
    name: "Groovy",
    tags: ["Modern"],
    theme: "retro",
    hero: "poster",
    background: { pattern: "sunburst" },
    motion: "lively",
    falling: "confetti",
  },
  {
    id: "marble-gold",
    name: "Marble & Gold",
    tags: ["Glam", "Modern"],
    theme: "modern",
    palette: "champagne",
    hero: "framed",
    fonts: "gm",
    ornament: "scroll",
    background: { texture: "marble" },
  },
  {
    id: "gatsby",
    name: "Gatsby",
    tags: ["Glam"],
    theme: "blacktie",
    palette: "black-tie",
    hero: "text",
    fonts: "cb",
    ornament: "chandelier",
    background: { pattern: "deco", texture: "flecks" },
    falling: "sparklers",
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
    layouts: { ...design.layouts, rsvp: t.rsvp ?? "card" },
    background: { ...NO_BACKGROUND, ...t.background },
    motion: { ...MOTION_PRESETS[t.motion ?? "subtle"], ...(t.falling ? { falling: t.falling } : {}) },
    text,
  };
}
