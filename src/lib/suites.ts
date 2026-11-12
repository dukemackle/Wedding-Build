import { BODY_FONTS, FONTS, PALETTES, contrast, mix, paletteColors, type SiteDesign } from "./site-design";
import { applyTemplate, templateById as siteTemplateById, withExtras } from "./site-templates";
import { INVITATION_PREFIX } from "./save-the-date/invitations";
import { CUSTOM_PALETTE, INVITATIONS, cardPalette, templateById as cardTemplateById } from "./save-the-date/templates";
import type { CardDoc } from "./save-the-date/types";

/**
 * Suites (approved 2026-11-10, design-expert DECISIONS.md): one design across
 * the save the date, the invitation and the guest site. The cards share a
 * template already (an invitation is made from a save-the-date design); a
 * suite adds the site template that goes with them, so whichever piece the
 * couple makes first, the others can pick up its colourway, fonts and art.
 */
export type Suite = {
  id: string;
  name: string;
  /** The save-the-date template (TEMPLATES in save-the-date/templates.ts). */
  card: string;
  /** The guest-site template (site-templates.ts). */
  site: string;
  /**
   * Card colourway → site palette, for cards whose paper is only the colour
   * behind a full-bleed photo (dark), when the site is a light page.
   * Without one, the site takes the card's paper, ink and accent as they are.
   */
  siteColourways?: Record<string, string>;
  /** "script": the site's names take the card's script face, not its display serif (Signature). */
  names?: "script";
};

export const SUITES: Suite[] = [
  { id: "heirloom", name: "Heirloom", card: "heirloom", site: "heirloom" },
  { id: "riviera", name: "Riviera", card: "riviera", site: "riviera" },
  { id: "midnight", name: "Midnight", card: "midnight", site: "night-swim" },
  {
    id: "golden-hour",
    name: "Golden Hour",
    card: "goldenhour",
    site: "golden-hour",
    siteColourways: { honey: "champagne", blush: "blush", white: "linen" },
  },
  { id: "homestead", name: "Homestead", card: "homestead", site: "homestead" },
  {
    id: "editorial",
    name: "Editorial",
    card: "editorial",
    site: "editorial",
    siteColourways: { noir: "ivory-black", sunwashed: "champagne", gilt: "black-tie" },
  },
  { id: "deco-gala", name: "Deco Gala", card: "decogala", site: "deco-gala" },
  { id: "wildflower", name: "Wildflower", card: "wildflower", site: "wildflower" },
  {
    id: "highland",
    name: "Highland",
    card: "highland",
    site: "highland",
    siteColourways: { moorland: "moorland", heather: "heather", frost: "first-frost" },
  },
  {
    id: "gilded",
    name: "Gilded",
    card: "gilded",
    site: "gilded",
    siteColourways: { cream: "gilded-cream", emerald: "gilded-emerald", ink: "gilded-ink" },
  },
  // Type only (suites wave 2): one site layout, two suites, because the two
  // cards are opposite moods (formal script, quiet serif) and a card belongs to one suite.
  {
    id: "signature",
    name: "Signature",
    card: "calligraphy",
    site: "signature",
    names: "script",
    siteColourways: { cotton: "signature-cotton", sepia: "signature-sepia", gilded: "signature-gold" },
  },
  {
    id: "whitespace",
    name: "Whitespace",
    card: "whitespace",
    site: "whitespace",
    siteColourways: { paper: "whitespace-paper", fog: "whitespace-fog", blush: "whitespace-blush" },
  },
  // Batch A (2026-11-11, docs/batch-a-suites.md): the owner's approved
  // reference suites, each a save the date, invitation and guest site.
  {
    id: "highland-lake",
    name: "Highland Lake",
    card: "highland-lake",
    site: "highland-lake",
    names: "script",
    siteColourways: { navy: "highland-navy", evergreen: "highland-evergreen", slate: "highland-slate" },
  },
  {
    id: "heirloom-peony",
    name: "Heirloom Peony",
    card: "heirloom-peony",
    site: "heirloom-peony",
    names: "script",
    siteColourways: { burgundy: "peony-burgundy", rosewood: "peony-rosewood", ink: "peony-ink" },
  },
  {
    id: "wildflower-meadow",
    name: "Wildflower Meadow",
    card: "wildflower-meadow",
    site: "wildflower-meadow",
    siteColourways: { navy: "meadow-navy", forest: "meadow-forest", poppy: "meadow-poppy" },
  },
  {
    id: "coastal-sunset",
    name: "Coastal Sunset",
    card: "coastal-sunset",
    site: "coastal-sunset",
    names: "script",
    siteColourways: { driftwood: "coastal-driftwood", sea: "coastal-sea", dusk: "coastal-dusk" },
  },
  {
    id: "bougainvillea",
    name: "Bougainvillea Terrace",
    card: "bougainvillea",
    site: "bougainvillea",
    siteColourways: { terracotta: "terrace-terracotta", fuchsia: "terrace-fuchsia", olive: "terrace-olive" },
  },
  {
    id: "joshua-tree",
    name: "Joshua Tree Sunset",
    card: "joshua-tree",
    site: "joshua-tree",
    names: "script",
    siteColourways: { umber: "joshua-umber", dusk: "joshua-dusk", sage: "joshua-sage" },
  },
  {
    id: "sonoran",
    name: "Sonoran Desert",
    card: "sonoran",
    site: "sonoran",
    names: "script",
    siteColourways: { umber: "sonoran-umber", rose: "sonoran-rose", sage: "sonoran-sage" },
  },
  {
    id: "garden-arch",
    name: "Garden Arch",
    card: "garden-arch",
    site: "garden-arch",
    names: "script",
    siteColourways: { espresso: "garden-espresso", rose: "garden-rose", lake: "garden-lake" },
  },
  {
    id: "postmark",
    name: "Postmark",
    card: "postmark",
    site: "postmark",
    names: "script",
    siteColourways: { airmail: "postmark-airmail", terracotta: "postmark-terracotta", ink: "postmark-ink" },
  },
  {
    id: "french-riviera",
    name: "French Riviera",
    card: "french-riviera",
    site: "french-riviera",
    names: "script",
    siteColourways: { navy: "riviera-navy", sea: "riviera-sea", fuchsia: "riviera-fuchsia" },
  },
  {
    id: "regatta",
    name: "Regatta",
    card: "regatta",
    site: "regatta",
    names: "script",
    siteColourways: { navy: "regatta-navy", ocean: "regatta-ocean", slate: "regatta-slate" },
  },
  {
    id: "palm-shore",
    name: "Palm Shore",
    card: "palm-shore",
    site: "palm-shore",
    names: "script",
    siteColourways: { navy: "shoreline-navy", lagoon: "shoreline-lagoon", coral: "shoreline-coral" },
  },
  {
    id: "evergreen-ridge",
    name: "Evergreen",
    card: "evergreen-ridge",
    site: "evergreen-ridge",
    names: "script",
    siteColourways: { forest: "ridge-forest", slate: "ridge-slate", dusk: "ridge-dusk" },
  },
  {
    id: "meadow-vista",
    name: "Meadow Vista",
    card: "meadow-vista",
    site: "meadow-vista",
    names: "script",
    siteColourways: { olive: "vista-olive", lupine: "vista-lupine", earth: "vista-earth" },
  },
  {
    id: "golden-barn",
    name: "Golden Barn",
    card: "golden-barn",
    site: "golden-barn",
    names: "script",
    siteColourways: { barnwood: "barn-wood", pine: "barn-pine", dusk: "barn-dusk" },
  },
  {
    id: "golden-hills",
    name: "Golden Hills",
    card: "golden-hills",
    site: "golden-hills",
    names: "script",
    siteColourways: { sunset: "hills-sunset", sage: "hills-sage", rose: "hills-rose" },
  },
  {
    id: "capiz",
    name: "Capiz",
    card: "capiz",
    site: "capiz",
    names: "script",
    siteColourways: { pearl: "cz-pearl", palm: "cz-palm", seaglass: "cz-seaglass" },
  },
  {
    id: "adire",
    name: "Adire",
    card: "adire",
    site: "adire",
    names: "script",
    siteColourways: { indigo: "ad-indigo", ink: "ad-ink", clay: "ad-clay" },
  },
  {
    id: "plum-lattice",
    name: "Plum Lattice",
    card: "plum-lattice",
    site: "plum-lattice",
    names: "script",
    siteColourways: { cinnabar: "pl-cinnabar", gold: "pl-gold", ink: "pl-ink" },
  },
  {
    id: "jharokha",
    name: "Jharokha",
    card: "jharokha",
    site: "jharokha",
    names: "script",
    siteColourways: { sandstone: "jk-sandstone", bougainvillea: "jk-bougainvillea", marigold: "jk-marigold" },
  },
  {
    id: "canopy",
    name: "Canopy",
    card: "canopy",
    site: "canopy",
    names: "script",
    siteColourways: { olive: "cy-olive", sand: "cy-sand", navy: "cy-navy" },
  },
  {
    id: "papel-courtyard",
    name: "Papel",
    card: "papel-courtyard",
    site: "papel-courtyard",
    names: "script",
    siteColourways: { fiesta: "pp-fiesta", terracotta: "pp-terracotta", agave: "pp-agave" },
  },
  {
    id: "rose-ribbon",
    name: "Rose Ribbon",
    card: "rose-ribbon",
    site: "rose-ribbon",
    names: "script",
    siteColourways: { rose: "rr-rose", ribbon: "rr-ribbon", sage: "rr-sage" },
  },
  {
    id: "boho-sunset",
    name: "Boho Sunset",
    card: "boho-sunset",
    site: "boho-sunset",
    names: "script",
    siteColourways: { terracotta: "bs-terracotta", rust: "bs-rust", cocoa: "bs-cocoa" },
  },
  {
    id: "misty-ridge",
    name: "Misty Ridge",
    card: "misty-ridge",
    site: "misty-ridge",
    names: "script",
    siteColourways: { slate: "ridge-slate-blue", dawn: "ridge-dawn", graphite: "ridge-graphite" },
  },
  {
    id: "tuscan-engraving",
    name: "Tuscan Engraving",
    card: "tuscan-engraving",
    site: "tuscan-engraving",
    names: "script",
    siteColourways: { sepia: "engraving-sepia", cypress: "engraving-cypress", ink: "engraving-ink" },
  },
  {
    id: "vineyard-etching",
    name: "Vineyard Etching",
    card: "vineyard-etching",
    site: "vineyard-etching",
    names: "script",
    siteColourways: { olive: "etching-olive", charcoal: "etching-charcoal", claret: "etching-claret" },
  },
  {
    id: "blush-garden",
    name: "Blush Garden",
    card: "blush-garden",
    site: "blush-garden",
    names: "script",
    siteColourways: { rose: "blush-rose", sage: "blush-sage", mauve: "blush-mauve" },
  },
  {
    id: "gold-flourish",
    name: "Gold Flourish",
    card: "gold-flourish",
    site: "gold-flourish",
    names: "script",
    siteColourways: { sepia: "flourish-sepia", gold: "flourish-gold", espresso: "flourish-espresso" },
  },
  {
    id: "golden-magnolia",
    name: "Golden Magnolia",
    card: "golden-magnolia",
    site: "golden-magnolia",
    names: "script",
    siteColourways: { olive: "magnolia-olive", gold: "magnolia-gold", espresso: "magnolia-espresso" },
  },
  {
    id: "greenery-arch",
    name: "Greenery Arch",
    card: "greenery-arch",
    site: "greenery-arch",
    names: "script",
    siteColourways: { eucalyptus: "arch-eucalyptus", charcoal: "arch-charcoal", terracotta: "arch-clay" },
  },
  {
    id: "portico",
    name: "Portico",
    card: "portico",
    site: "portico",
    names: "script",
    siteColourways: { lake: "portico-lake", stone: "portico-stone", cypress: "portico-cypress" },
  },
  {
    id: "pressed-botanicals",
    name: "Pressed Botanicals",
    card: "pressed-botanicals",
    site: "pressed-botanicals",
    names: "script",
    siteColourways: { lavender: "pressed-lavender", olive: "pressed-olive", umber: "pressed-umber" },
  },
  {
    id: "iris-garden",
    name: "Iris Garden",
    card: "iris-garden",
    site: "iris-garden",
    names: "script",
    siteColourways: { iris: "iris-violet", charcoal: "iris-charcoal", sage: "iris-sage" },
  },
  {
    id: "starlit-terrace",
    name: "Starlit Terrace",
    card: "starlit-terrace",
    site: "starlit-terrace",
    names: "script",
    siteColourways: { ivory: "starlit-ivory", moonlight: "starlit-moon", candlelight: "starlit-candle" },
  },
  {
    id: "deco-fan",
    name: "Deco Fan",
    card: "deco-fan",
    site: "deco-fan",
    names: "script",
    siteColourways: { champagne: "deco-champagne", gold: "deco-gold", silver: "deco-silver" },
  },
  {
    id: "black-tie",
    name: "Modern Black-Tie",
    card: "black-tie",
    site: "black-tie",
    siteColourways: { ivory: "black-tie-ivory", gilt: "black-tie-gilt", noir: "black-tie-noir" },
  },
];

/** The suite a save-the-date or invitation design belongs to, if any. */
export function suiteForCard(templateId: string | null | undefined): Suite | null {
  if (!templateId) return null;
  const source = templateId.startsWith(INVITATION_PREFIX) ? templateId.slice(INVITATION_PREFIX.length) : templateId;
  return SUITES.find((s) => s.card === source) ?? null;
}

/** The suite a guest-site template belongs to, if any. */
export function suiteForSite(templateId: string | null | undefined): Suite | null {
  return SUITES.find((s) => s.site === templateId) ?? null;
}

/** The invitation design in a card's suite, if one is drawn for it. */
export function invitationIdFor(doc: CardDoc): string | null {
  const suite = suiteForCard(doc.template);
  const id = `${INVITATION_PREFIX}${suite?.card ?? doc.template.replace(INVITATION_PREFIX, "")}`;
  return INVITATIONS.some((t) => t.id === id) ? id : null;
}

/** An accent that still reads as text on the page: darkened (or lightened) towards the ink until it does. */
function readableAccent(accent: string, bg: string, ink: string) {
  for (let t = 0; t <= 1; t += 0.1) {
    const c = mix(accent, ink, t);
    if (contrast(c, bg) >= 3) return c;
  }
  return ink;
}

const isFont = (id: string) => FONTS.some((f) => f.id === id);
const isBodyFont = (id: string) => BODY_FONTS.some((f) => f.id === id);

/**
 * The couple's site with the look of their card: the suite's site template,
 * its decorations, and the card's colourway and fonts. Their words, photos
 * and anything they placed stay, as with any template switch.
 * Null when the card's design isn't part of a suite.
 */
export function siteMatchingCard(design: SiteDesign, doc: CardDoc): SiteDesign | null {
  const suite = suiteForCard(doc.template);
  const site = siteTemplateById(suite?.site);
  if (!suite || !site) return null;
  const base = applyTemplate(design, site);
  let next: SiteDesign = { ...base, ...withExtras(base, site) };

  const mapped = doc.palette !== CUSTOM_PALETTE ? PALETTES.find((p) => p.id === suite.siteColourways?.[doc.palette]) : undefined;
  if (mapped) {
    next = { ...next, ...paletteColors(mapped) };
  } else {
    const p = cardPalette(doc);
    next = { ...next, colors: { bg: p.paper, ink: p.ink, heading: p.ink }, accent: readableAccent(p.accent, p.paper, p.ink) };
  }

  const t = cardTemplateById(doc.template);
  const pair = t.pairings.find((x) => x.id === doc.fonts) ?? t.pairings[0];
  const body = [pair.sans, pair.display].find(isBodyFont);
  // A script face as the display font sets only the names; headings fall back to the body face.
  const display = suite.names === "script" && isFont(pair.script) ? pair.script : pair.display;
  next = {
    ...next,
    fontDisplay: isFont(display) ? (display as SiteDesign["fontDisplay"]) : null,
    ...(body ? { fontBody: body as SiteDesign["fontBody"] } : {}),
  };
  return next;
}

/** Whether the site already wears this card's look (template, colours and heading font). */
export function siteMatches(design: SiteDesign, doc: CardDoc): boolean {
  const want = siteMatchingCard(design, doc);
  if (!want) return false;
  return (
    design.template === want.template &&
    design.accent === want.accent &&
    design.colors.bg === want.colors.bg &&
    design.colors.ink === want.colors.ink &&
    design.fontDisplay === want.fontDisplay
  );
}

/** A card's look carried onto another design in the same suite: colourway and fonts. */
export function lookFromCard(doc: CardDoc): Pick<CardDoc, "palette" | "colours" | "fonts"> {
  return { palette: doc.palette, colours: doc.colours, fonts: doc.fonts };
}
