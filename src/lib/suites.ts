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
  next = {
    ...next,
    fontDisplay: isFont(pair.display) ? (pair.display as SiteDesign["fontDisplay"]) : null,
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
