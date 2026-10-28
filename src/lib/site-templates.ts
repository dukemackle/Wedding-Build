import {
  DEFAULT_SITE_DESIGN,
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

export type SiteTemplate = {
  id: string;
  name: string;
  /** One short line under the card: what the page looks like. */
  blurb: string;
  theme: ThemeId;
  hero: HeroLayoutId;
  /** A palette from PALETTES over the theme's colours; none keeps the theme's. */
  palette?: string;
  /** The other two colourways offered with it (PALETTES ids), each designed for it. */
  colourways: [string, string];
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
  /** A small tag on its gallery card ("Start here"). */
  badge?: string;
};

/**
 * Seven templates (approved 2026-10-27, from the finalists mockup), in place
 * of the 29 that came before: most of those were the same page of cards in a
 * different colour. Each of these has its own top of the page and its own
 * page style, so no two look alike, and three colourways chosen for it.
 * Designs made from a retired template keep their look; they just no longer
 * show one as picked.
 *
 * Ivory (owner, 2026-10-28) goes first with "Start here": a plain, classic
 * page on warm white, and what a couple who hasn't picked one starts on
 * (STARTER_DESIGN).
 */
export const TEMPLATES: SiteTemplate[] = [
  {
    id: "ivory",
    name: "Ivory",
    blurb: "Simple and timeless, your photo and names on warm white",
    theme: "garden",
    palette: "ivory",
    colourways: ["classic-white", "linen"],
    fonts: "cj",
    hero: "split",
    ornament: "none",
    pageStyle: "cards",
    badge: "Start here",
  },
  {
    id: "heirloom",
    name: "Heirloom",
    blurb: "A formal invitation on paper, the schedule down a centre line",
    theme: "garden",
    palette: "heirloom",
    colourways: ["ivory-sage", "dusty-blue"],
    fonts: "cj",
    hero: "invitation",
    ornament: "none",
    art: { id: "rose", placement: "sides" },
    pageStyle: "invitation",
  },
  {
    id: "editorial",
    name: "Editorial",
    blurb: "A magazine cover, numbered sections, the schedule as a table",
    theme: "modern",
    palette: "gallery",
    colourways: ["ivory-black", "burgundy"],
    fonts: "bj",
    hero: "masthead",
    ornament: "none",
    pageStyle: "magazine",
    rsvp: "band",
  },
  {
    id: "riviera",
    name: "Riviera",
    blurb: "A holiday postcard, colour bands, a ticket for each event",
    theme: "riviera",
    palette: "amalfi",
    colourways: ["coastal", "royal"],
    fonts: "dk",
    hero: "postcard",
    ornament: "none",
    art: { id: "lemon", placement: "sides" },
    pageStyle: "postcard",
    rsvp: "band",
    motion: "lively",
  },
  {
    id: "night-swim",
    name: "Night Swim",
    blurb: "Dark and glamorous, names under the stars, gold details",
    theme: "midnight",
    palette: "midnight-navy",
    colourways: ["black-tie", "emerald"],
    fonts: "pj",
    hero: "poster",
    ornament: "none",
    scene: "stars",
    pageStyle: "evening",
    motion: "lively",
  },
  {
    id: "golden-hour",
    name: "Golden Hour",
    blurb: "Your photo across the whole screen, big photos between sections",
    theme: "garden",
    palette: "linen",
    colourways: ["champagne", "blush"],
    fonts: "ij",
    hero: "cover",
    ornament: "none",
    pageStyle: "photo",
  },
  {
    id: "monogram",
    name: "Monogram",
    blurb: "Minimal and modern, your initials huge, lots of white space",
    theme: "modern",
    palette: "classic-white",
    colourways: ["french-blue", "eucalyptus"],
    fonts: "go",
    hero: "initials",
    ornament: "none",
    pageStyle: "ledger",
  },
  {
    id: "homestead",
    name: "Homestead",
    blurb: "Rustic, for barns and ranches, the schedule set like a menu",
    theme: "barn",
    palette: "desert",
    colourways: ["terracotta", "forest"],
    fonts: "fw",
    hero: "stamp",
    ornament: "none",
    pageStyle: "homestead",
    background: { texture: "paper" },
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
    // Art, scenes and falling extras are optional (owner, 2026-10-21): a
    // template starts with the couple's photo and nothing else over it.
    // `withExtras` adds the template's own when they ask for them.
    art: { id: null, placement: "sides" },
    hero: t.hero,
    scene: null,
    pageStyle: t.pageStyle ?? "cards",
    layouts: { ...design.layouts, rsvp: t.rsvp ?? "card" },
    background: { ...NO_BACKGROUND, ...t.background },
    motion: { ...MOTION_PRESETS[t.motion ?? "subtle"], falling: "none" },
    text,
  };
}

/** Whether a template has art, a scene or something falling to offer. */
export function hasExtras(t: SiteTemplate): boolean {
  return Boolean(t.art?.id || t.scene || t.falling);
}

/** Adds a template's own art, scene and falling extras to the design. */
export function withExtras(design: SiteDesign, t: SiteTemplate): Partial<SiteDesign> {
  return {
    ...(t.art ? { art: t.art } : {}),
    ...(t.scene ? { scene: t.scene } : {}),
    ...(t.falling ? { motion: { ...design.motion, falling: t.falling } } : {}),
  };
}

/**
 * What a couple who hasn't picked a template starts on: their guest site
 * before any design is published, and the base new designs go over.
 */
export const STARTER_DESIGN: SiteDesign = applyTemplate(DEFAULT_SITE_DESIGN, TEMPLATES[0]);

