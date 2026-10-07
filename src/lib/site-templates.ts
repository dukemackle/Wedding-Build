import {
  DEFAULT_SITE_DESIGN,
  PALETTES,
  isDark,
  paletteColors,
  type ArtId,
  type FontId,
  type HeroLayoutId,
  type OrnamentId,
  type Palette,
  type SiteDesign,
  type ThemeId,
} from "@/lib/site-design";

/**
 * Ready-made looks for the guest site (Theme tab › Browse templates). Each
 * is a combination of things the editor already offers -- a theme for the
 * shapes, a palette, a font pair, a monogram, a top-of-page layout and
 * optionally artwork -- so applying one is just filling in those settings,
 * and every one can be fine-tuned afterwards. Sections and motion are the
 * couple's own and a template never touches them.
 */

export const TEMPLATE_STYLES = [
  "Classic",
  "Modern",
  "Romantic",
  "Garden",
  "Rustic",
  "Destination",
  "Formal",
  "Seasonal",
  "Minimal",
  "Bold",
] as const;

export type TemplateStyle = (typeof TEMPLATE_STYLES)[number];

type Def = {
  id: string;
  name: string;
  styles: TemplateStyle[];
  theme: ThemeId;
  palette: Palette["id"];
  display: FontId;
  body: FontId;
  ornament: OrnamentId;
  hero: HeroLayoutId;
  art?: ArtId;
  corners?: boolean;
};

const DEFS: Def[] = [
  { id: "classical-crest-navy", name: "Classical Crest Navy", styles: ["Classic", "Formal"], theme: "modern", palette: "midnight-navy", display: "cormorant", body: "montserrat", ornament: "crest", hero: "monogram" },
  { id: "eucalyptus-garden", name: "Eucalyptus Garden", styles: ["Garden", "Romantic"], theme: "garden", palette: "ivory-sage", display: "cormorant", body: "karla", ornament: "none", hero: "text", art: "eucalyptus" },
  { id: "wild-rose-meadow", name: "Wild Rose Meadow", styles: ["Garden", "Romantic", "Rustic"], theme: "garden", palette: "eucalyptus", display: "greatvibes", body: "ebgaramond", ornament: "laurel", hero: "text", art: "wild-roses" },
  { id: "amalfi-lemons", name: "Amalfi Lemons", styles: ["Destination", "Bold"], theme: "riviera", palette: "amalfi", display: "italiana", body: "josefin", ornament: "ring", hero: "text", art: "lemon", corners: true },
  { id: "olive-grove", name: "Olive Grove", styles: ["Destination", "Rustic"], theme: "terracotta", palette: "olive-grove", display: "fraunces", body: "worksans", ornament: "laurel", hero: "text", art: "olive" },
  { id: "gilded-olive", name: "Gilded Olive", styles: ["Formal", "Classic"], theme: "blacktie", palette: "black-tie", display: "cinzel", body: "montserrat", ornament: "crest", hero: "monogram", art: "olive-line" },
  { id: "blush-peony", name: "Blush Peony", styles: ["Romantic"], theme: "blush", palette: "blush", display: "pinyon", body: "baskerville", ornament: "seal", hero: "text", art: "peony" },
  { id: "rose-garden", name: "Rose Garden", styles: ["Romantic", "Classic"], theme: "blush", palette: "rose-quartz", display: "playfair", body: "jost", ornament: "rule", hero: "framed", art: "rose" },
  { id: "white-roses", name: "White Roses", styles: ["Romantic", "Minimal"], theme: "modern", palette: "classic-white", display: "bodoni", body: "jost", ornament: "seal", hero: "text", art: "roses-white", corners: true },
  { id: "lavender-fields", name: "Lavender Fields", styles: ["Garden", "Destination"], theme: "garden", palette: "lavender", display: "parisienne", body: "nunito", ornament: "arch", hero: "text", art: "lavender" },
  { id: "provence-sketch", name: "Provence Sketch", styles: ["Minimal", "Garden"], theme: "modern", palette: "linen", display: "cormorant", body: "karla", ornament: "ring", hero: "text", art: "lavender-line" },
  { id: "sweet-pea", name: "Sweet Pea", styles: ["Garden", "Romantic"], theme: "garden", palette: "mauve", display: "allura", body: "ebgaramond", ornament: "laurel", hero: "text", art: "sweet-pea", corners: true },
  { id: "midsummer", name: "Midsummer", styles: ["Garden", "Bold"], theme: "garden", palette: "peach", display: "fraunces", body: "worksans", ornament: "rule", hero: "text", art: "mallow" },
  { id: "golden-hour", name: "Golden Hour", styles: ["Rustic", "Seasonal"], theme: "terracotta", palette: "desert", display: "dmserif", body: "worksans", ornament: "none", hero: "text", art: "oats" },
  { id: "autumn-leaves", name: "Autumn Leaves", styles: ["Seasonal", "Rustic"], theme: "terracotta", palette: "terracotta", display: "fraunces", body: "worksans", ornament: "laurel", hero: "text", art: "autumn", corners: true },
  { id: "harvest-marsala", name: "Harvest Marsala", styles: ["Seasonal", "Classic"], theme: "modern", palette: "marsala", display: "playfair", body: "jost", ornament: "crest", hero: "monogram", art: "autumn" },
  { id: "holly-berries", name: "Holly & Berries", styles: ["Seasonal", "Classic"], theme: "modern", palette: "burgundy", display: "cormorant", body: "montserrat", ornament: "seal", hero: "text", art: "holly" },
  { id: "winter-forest", name: "Winter Forest", styles: ["Seasonal", "Formal"], theme: "botanical", palette: "forest", display: "cormorant", body: "karla", ornament: "laurel", hero: "monogram", art: "holly-line" },
  { id: "emerald-evening", name: "Emerald Evening", styles: ["Formal", "Bold"], theme: "botanical", palette: "emerald", display: "bodoni", body: "jost", ornament: "diamond", hero: "monogram", art: "eucalyptus-line" },
  { id: "date-palm", name: "Date Palm", styles: ["Destination", "Minimal"], theme: "riviera", palette: "coastal", display: "italiana", body: "josefin", ornament: "ring", hero: "text", art: "palm" },
  { id: "coastal-linen", name: "Coastal Linen", styles: ["Destination", "Minimal"], theme: "modern", palette: "coastal", display: "cormorant", body: "nunito", ornament: "rule", hero: "full" },
  { id: "french-blue", name: "French Blue", styles: ["Classic", "Modern"], theme: "modern", palette: "french-blue", display: "bodoni", body: "jost", ornament: "ring", hero: "split" },
  { id: "something-blue", name: "Something Blue", styles: ["Classic", "Romantic"], theme: "garden", palette: "dusty-blue", display: "pinyon", body: "baskerville", ornament: "laurel", hero: "framed" },
  { id: "navy-gold", name: "Navy & Gold", styles: ["Classic", "Formal"], theme: "modern", palette: "navy-gold", display: "cinzel", body: "montserrat", ornament: "crest", hero: "full" },
  { id: "royal-sunshine", name: "Royal Sunshine", styles: ["Bold", "Modern"], theme: "riviera", palette: "royal", display: "dmserif", body: "jost", ornament: "diamond", hero: "monogram" },
  { id: "black-tie", name: "Black Tie", styles: ["Formal", "Minimal"], theme: "blacktie", palette: "black-tie", display: "bodoni", body: "jost", ornament: "diamond", hero: "text" },
  { id: "ivory-ink", name: "Ivory & Ink", styles: ["Minimal", "Modern"], theme: "modern", palette: "ivory-black", display: "italiana", body: "josefin", ornament: "rule", hero: "split" },
  { id: "classic-white", name: "Classic White", styles: ["Minimal", "Classic"], theme: "modern", palette: "classic-white", display: "cormorant", body: "karla", ornament: "rule", hero: "full" },
  { id: "champagne-toast", name: "Champagne Toast", styles: ["Formal", "Romantic"], theme: "garden", palette: "champagne", display: "greatvibes", body: "ebgaramond", ornament: "crest", hero: "framed" },
  { id: "marigold", name: "Marigold", styles: ["Bold", "Destination"], theme: "terracotta", palette: "marigold", display: "fraunces", body: "worksans", ornament: "seal", hero: "split" },
  { id: "tuscan-villa", name: "Tuscan Villa", styles: ["Destination", "Rustic"], theme: "terracotta", palette: "tuscan", display: "cormorant", body: "worksans", ornament: "arch", hero: "framed", art: "olive" },
  { id: "desert-sunset", name: "Desert Sunset", styles: ["Rustic", "Bold"], theme: "terracotta", palette: "desert", display: "dmserif", body: "worksans", ornament: "arch", hero: "split" },
  { id: "terracotta", name: "Terracotta", styles: ["Rustic", "Modern"], theme: "terracotta", palette: "terracotta", display: "fraunces", body: "worksans", ornament: "rule", hero: "full" },
  { id: "bordeaux", name: "Bordeaux", styles: ["Formal", "Romantic"], theme: "blush", palette: "bordeaux", display: "playfair", body: "jost", ornament: "seal", hero: "monogram", art: "rose", corners: true },
  { id: "plum-velvet", name: "Plum Velvet", styles: ["Formal", "Bold"], theme: "midnight", palette: "plum", display: "pinyon", body: "baskerville", ornament: "laurel", hero: "monogram" },
  { id: "espresso", name: "Espresso", styles: ["Modern", "Rustic"], theme: "modern", palette: "espresso", display: "gilda", body: "nunito", ornament: "ring", hero: "split" },
  { id: "slate-silver", name: "Slate & Silver", styles: ["Modern", "Minimal"], theme: "modern", palette: "slate", display: "cinzel", body: "montserrat", ornament: "diamond", hero: "full" },
  { id: "midnight-garden", name: "Midnight Garden", styles: ["Romantic", "Formal"], theme: "midnight", palette: "midnight-navy", display: "playfair", body: "jost", ornament: "laurel", hero: "framed", art: "eucalyptus-line" },
  { id: "botanical-sketch", name: "Botanical Sketch", styles: ["Garden", "Minimal"], theme: "garden", palette: "ivory-sage", display: "gilda", body: "nunito", ornament: "none", hero: "text", art: "eucalyptus-line" },
  { id: "peach-blossom", name: "Peach Blossom", styles: ["Romantic", "Bold"], theme: "blush", palette: "peach", display: "parisienne", body: "nunito", ornament: "seal", hero: "framed" },
  { id: "mauve-moodboard", name: "Mauve Moodboard", styles: ["Modern", "Romantic"], theme: "modern", palette: "mauve", display: "italiana", body: "josefin", ornament: "arch", hero: "split" },
  { id: "lavender-haze", name: "Lavender Haze", styles: ["Romantic", "Minimal"], theme: "garden", palette: "lavender", display: "cormorant", body: "karla", ornament: "ring", hero: "full" },
  { id: "linen-lace", name: "Linen & Lace", styles: ["Rustic", "Classic"], theme: "garden", palette: "linen", display: "petitformal", body: "ebgaramond", ornament: "laurel", hero: "framed" },
  { id: "forest-chapel", name: "Forest Chapel", styles: ["Rustic", "Formal"], theme: "botanical", palette: "forest", display: "cinzel", body: "montserrat", ornament: "arch", hero: "framed" },
  { id: "gold-crest", name: "Gold Crest", styles: ["Formal", "Classic"], theme: "blacktie", palette: "black-tie", display: "cormorant", body: "montserrat", ornament: "crest", hero: "monogram" },
  { id: "olive-sketch", name: "Olive Sketch", styles: ["Minimal", "Destination"], theme: "modern", palette: "olive-grove", display: "marcellus", body: "nunito", ornament: "ring", hero: "text", art: "olive-line" },
  { id: "mistletoe", name: "Mistletoe", styles: ["Seasonal", "Romantic"], theme: "garden", palette: "eucalyptus", display: "pinyon", body: "baskerville", ornament: "seal", hero: "text", art: "holly-line", corners: true },
  { id: "sunlit-wildflowers", name: "Sunlit Wildflowers", styles: ["Garden", "Bold"], theme: "riviera", palette: "marigold", display: "allura", body: "nunito", ornament: "laurel", hero: "text", art: "wild-roses", corners: true },
];

export type SiteTemplate = Omit<Def, "palette"> & {
  palette: Palette;
  dark: boolean;
  /** The settings a template sets; everything else stays as it was. */
  design: Pick<SiteDesign, "theme" | "colors" | "accent" | "fonts" | "fontDisplay" | "fontBody" | "ornament" | "hero" | "art">;
};

export const SITE_TEMPLATES: SiteTemplate[] = DEFS.map((d) => {
  const palette = PALETTES.find((p) => p.id === d.palette) ?? PALETTES[0];
  return {
    ...d,
    palette,
    dark: isDark(palette.bg),
    design: {
      theme: d.theme,
      ...paletteColors(palette),
      fonts: "theme",
      fontDisplay: d.display,
      fontBody: d.body,
      ornament: d.ornament,
      hero: d.hero,
      art: { id: d.art ?? null, placement: d.corners ? "corners" : "sides" },
    },
  };
});

/** A template's look on top of a couple's design: their sections and motion stay. */
export function applyTemplate(design: SiteDesign, t: SiteTemplate): SiteDesign {
  return { ...design, ...t.design };
}

/** The design a template card draws: the template over the defaults. */
export function templatePreview(t: SiteTemplate): SiteDesign {
  return { ...DEFAULT_SITE_DESIGN, ...t.design };
}

/** The template the design still matches exactly, if any -- worked out, not stored. */
export function matchingTemplate(design: SiteDesign) {
  const pick = (d: SiteTemplate["design"]) =>
    JSON.stringify([d.theme, d.colors, d.accent, d.fontDisplay, d.fontBody, d.ornament, d.hero, d.art]);
  const mine = pick(design);
  return SITE_TEMPLATES.find((t) => pick(t.design) === mine) ?? null;
}
