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
  /** The banner photo's filter this look is designed around (Modern Black-Tie: black and white). */
  photoFilter?: SiteDesign["heroPhoto"]["filter"];
};

/**
 * Seven templates (approved 2026-10-27, from the finalists mockup), in place
 * of the 29 that came before: most of those were the same page of cards in a
 * different colour. Each of these has its own top of the page and its own
 * page style, so no two look alike, and three colourways chosen for it.
 * Designs made from a retired template keep their look; they just no longer
 * show one as picked.
 *
 * Classic (owner, 2026-10-28) goes first with "Start here": a plain page on
 * white, and what a couple who hasn't picked one starts on (STARTER_DESIGN).
 * It began as Ivory on warm white; the owner wanted the default pure white,
 * so Ivory became one of its colourways.
 */
export const TEMPLATES: SiteTemplate[] = [
  {
    id: "classic",
    name: "Classic",
    blurb: "Simple and timeless, your photo and names on white",
    theme: "garden",
    palette: "classic-white",
    colourways: ["ivory", "linen"],
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
    art: { id: "heirloom-garden", placement: "sides" },
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
  // Added 2026-11-10 so every suite (src/lib/suites.ts) has a site to match its cards.
  {
    id: "deco-gala",
    name: "Deco Gala",
    blurb: "Art Deco glamour, gold on black, each section in a framed panel",
    theme: "blacktie",
    palette: "black-tie",
    colourways: ["emerald", "champagne"],
    fonts: "cb",
    hero: "card",
    ornament: "none",
    pageStyle: "invitation",
    rsvp: "band",
  },
  {
    id: "wildflower",
    name: "Wildflower",
    blurb: "Meadow flowers round an arched photo, the day as a storybook",
    theme: "botanical",
    palette: "dusty-blue",
    colourways: ["blush", "marigold"],
    fonts: "fw",
    hero: "framed",
    ornament: "none",
    art: { id: "wild-roses", placement: "corners" },
    pageStyle: "storybook",
  },
  // Suites wave 2 (docs/suites-wave-2.md): a painted sky down the whole page
  // and the moor under the names, matching the Highland card.
  {
    id: "highland",
    name: "Highland",
    blurb: "A painted sky down the page, a moor of golden grass under your names",
    theme: "garden",
    palette: "moorland",
    colourways: ["heather", "first-frost"],
    fonts: "cj",
    hero: "invitation",
    ornament: "none",
    scene: "moors",
    pageStyle: "invitation",
    background: { texture: "sky" },
  },
  // Line-drawn flowers off the left edge of the top, the invitation framed
  // beside them, and a small magnolia over each section, matching the Gilded card.
  {
    id: "gilded",
    name: "Gilded",
    blurb: "Fine gold line flowers off the edge, a framed invitation, a magnolia over each section",
    theme: "garden",
    palette: "gilded-cream",
    colourways: ["gilded-emerald", "gilded-ink"],
    fonts: "cj",
    hero: "invitation",
    ornament: "none",
    scene: "gilded",
    pageStyle: "invitation",
  },
  // Type only, no artwork: the names large in a formal script over a faint
  // ampersand, small spaced capitals, the date in three ruled boxes; matching
  // the Calligraphy card (the Signature suite).
  {
    id: "signature",
    name: "Signature",
    blurb: "Type only: your names in a formal script, the date in three ruled boxes",
    theme: "garden",
    palette: "signature-cotton",
    colourways: ["signature-sepia", "signature-gold"],
    fonts: "pb",
    hero: "signature",
    ornament: "none",
    pageStyle: "invitation",
  },
  // The same type-only top, quiet: the names in a serif, the date stacked
  // small, each heading in a column beside its section; matching the Whitespace card.
  {
    id: "whitespace",
    name: "Whitespace",
    blurb: "Almost nothing: your names in a quiet serif, the date stacked, room to breathe",
    theme: "garden",
    palette: "whitespace-paper",
    colourways: ["whitespace-fog", "whitespace-blush"],
    fonts: "cj",
    hero: "signature",
    ornament: "none",
    pageStyle: "ledger",
  },
  // Batch A suites (2026-11-11, docs/batch-a-suites.md): the guest sites of
  // the four approved stationery suites. The invitation's type stack at the
  // top of the page on its paper, with the card's own watercolours.
  {
    id: "highland-lake",
    name: "Highland Lake",
    blurb: "Your names in script over a watercolour alpine lake, as on the card",
    theme: "garden",
    palette: "highland-navy",
    colourways: ["highland-evergreen", "highland-slate"],
    fonts: "pe",
    hero: "stationery",
    ornament: "none",
    scene: "alpine-lake",
    pageStyle: "invitation",
  },
  {
    id: "heirloom-peony",
    name: "Heirloom Peony",
    blurb: "Watercolour peonies at two corners, your names in a flowing script",
    theme: "garden",
    palette: "peony-burgundy",
    colourways: ["peony-rosewood", "peony-ink"],
    fonts: "pe",
    hero: "stationery",
    ornament: "none",
    scene: "peonies",
    pageStyle: "invitation",
  },
  {
    id: "wildflower-meadow",
    name: "Wildflower Meadow",
    blurb: "Bright watercolour wildflowers down both sides, a meadow under your names",
    theme: "garden",
    palette: "meadow-navy",
    colourways: ["meadow-forest", "meadow-poppy"],
    fonts: "ee",
    hero: "stationery",
    ornament: "none",
    scene: "painted-wildflowers",
    pageStyle: "invitation",
  },
  {
    id: "coastal-sunset",
    name: "Coastal Sunset",
    blurb: "Your names over a watercolour Big Sur sunset, edge to edge, as on the card",
    theme: "garden",
    palette: "coastal-driftwood",
    colourways: ["coastal-sea", "coastal-dusk"],
    fonts: "pe",
    hero: "stationery",
    ornament: "none",
    scene: "coastal-sunset",
    pageStyle: "invitation",
  },
  {
    id: "bougainvillea",
    name: "Bougainvillea Terrace",
    blurb: "Your names in the sky of a watercolour terrace arch hung with bougainvillea",
    theme: "botanical",
    palette: "terrace-terracotta",
    colourways: ["terrace-fuchsia", "terrace-olive"],
    fonts: "ee",
    hero: "stationery",
    ornament: "none",
    scene: "terrace-arch",
    pageStyle: "invitation",
  },
  {
    id: "joshua-tree",
    name: "Joshua Tree Sunset",
    blurb: "Your names in script over a watercolour desert sunset, a Joshua tree at the side",
    theme: "garden",
    palette: "joshua-umber",
    colourways: ["joshua-dusk", "joshua-sage"],
    fonts: "pe",
    hero: "stationery",
    ornament: "none",
    scene: "joshua-sunset",
    pageStyle: "invitation",
  },
  {
    id: "sonoran",
    name: "Sonoran Desert",
    blurb: "Your names in script over a watercolour Sonoran sunset, saguaros at the side",
    theme: "garden",
    palette: "sonoran-umber",
    colourways: ["sonoran-rose", "sonoran-sage"],
    fonts: "pe",
    hero: "stationery",
    ornament: "none",
    scene: "sonoran-sunset",
    pageStyle: "invitation",
  },
  {
    id: "garden-arch",
    name: "Garden Arch",
    blurb: "Your names in script over a watercolour Italian lake terrace, edge to edge",
    theme: "garden",
    palette: "garden-espresso",
    colourways: ["garden-rose", "garden-lake"],
    fonts: "pe",
    hero: "stationery",
    ornament: "none",
    scene: "lake-terrace",
    pageStyle: "invitation",
  },
  {
    id: "postmark",
    name: "Postmark",
    blurb: "Your names in script on the sky of a watercolour Tuscan villa, edge to edge",
    theme: "garden",
    palette: "postmark-airmail",
    colourways: ["postmark-terracotta", "postmark-ink"],
    fonts: "pe",
    hero: "stationery",
    ornament: "none",
    scene: "tuscan-villa",
    pageStyle: "invitation",
  },
  {
    id: "french-riviera",
    name: "French Riviera",
    blurb: "Your names in navy script over a watercolour Riviera terrace, edge to edge",
    theme: "garden",
    palette: "riviera-navy",
    colourways: ["riviera-sea", "riviera-fuchsia"],
    fonts: "pe",
    hero: "stationery",
    ornament: "none",
    scene: "riviera-terrace",
    pageStyle: "invitation",
  },
  {
    id: "regatta",
    name: "Regatta",
    blurb: "Your names in navy script over a watercolour sailboat on a New England bay",
    theme: "garden",
    palette: "regatta-navy",
    colourways: ["regatta-ocean", "regatta-slate"],
    fonts: "pe",
    hero: "stationery",
    ornament: "none",
    scene: "regatta-bay",
    pageStyle: "invitation",
  },
  {
    id: "palm-shore",
    name: "Palm Shore",
    blurb: "Your names in navy script, a watercolour palm beach along the foot of the page",
    theme: "garden",
    palette: "shoreline-navy",
    colourways: ["shoreline-lagoon", "shoreline-coral"],
    fonts: "pe",
    hero: "stationery",
    ornament: "none",
    scene: "palm-shore",
    pageStyle: "invitation",
  },
  {
    id: "evergreen-ridge",
    name: "Evergreen",
    blurb: "Your names in script on open paper, pines and misty peaks rising at the foot of the page",
    theme: "garden",
    palette: "ridge-forest",
    colourways: ["ridge-slate", "ridge-dusk"],
    fonts: "pe",
    hero: "stationery",
    ornament: "none",
    scene: "evergreen-ridge",
    pageStyle: "invitation",
  },
  {
    id: "meadow-vista",
    name: "Meadow Vista",
    blurb: "Your names in script on open paper, golden hills and a wildflower path at the foot of the page",
    theme: "garden",
    palette: "vista-olive",
    colourways: ["vista-lupine", "vista-earth"],
    fonts: "pe",
    hero: "stationery",
    ornament: "none",
    scene: "meadow-vista",
    pageStyle: "invitation",
  },
  {
    id: "golden-barn",
    name: "Golden Barn",
    blurb: "Your names in script on open paper, a barn at golden hour with a pond and peaks at the foot of the page",
    theme: "garden",
    palette: "barn-wood",
    colourways: ["barn-pine", "barn-dusk"],
    fonts: "pe",
    hero: "stationery",
    ornament: "none",
    scene: "golden-barn",
    pageStyle: "invitation",
  },
  {
    id: "golden-hills",
    name: "Golden Hills",
    blurb: "Your names in script on warm ivory paper, oak-dotted hills under a golden sunset at the foot of the page",
    theme: "garden",
    palette: "hills-sunset",
    colourways: ["hills-sage", "hills-rose"],
    fonts: "pe",
    hero: "stationery",
    ornament: "none",
    scene: "golden-hills",
    pageStyle: "invitation",
  },
  {
    id: "blush-garden",
    name: "Blush Garden",
    blurb: "Your names in script on textured cream paper, a blush bouquet of peonies and roses at the foot of the page",
    theme: "garden",
    palette: "blush-rose",
    colourways: ["blush-sage", "blush-mauve"],
    fonts: "pe",
    hero: "stationery",
    ornament: "none",
    scene: "blush-garden",
    pageStyle: "invitation",
  },
  {
    id: "starlit-terrace",
    name: "Starlit Terrace",
    blurb: "Your names in ivory script on a starry night sky, a lantern-lit terrace over moonlit hills at the foot of the page",
    theme: "midnight",
    palette: "starlit-ivory",
    colourways: ["starlit-moon", "starlit-candle"],
    fonts: "pe",
    hero: "stationery",
    ornament: "none",
    scene: "starlit-terrace",
    pageStyle: "invitation",
  },
  {
    id: "black-tie",
    name: "Modern Black-Tie",
    blurb: "Your photo in black and white, spaced capitals, fine rules, nothing else",
    theme: "modern",
    palette: "black-tie-ivory",
    colourways: ["black-tie-gilt", "black-tie-noir"],
    fonts: "ee",
    hero: "formal",
    ornament: "none",
    pageStyle: "evening",
    photoFilter: "mono",
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
    ...(t.photoFilter ? { heroPhoto: { ...design.heroPhoto, filter: t.photoFilter } } : {}),
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

