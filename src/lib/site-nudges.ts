import type { FontPairingId, SiteDesign } from "./site-design";

/**
 * "Make it more…" (Templates tab): one tap moves the current look in a
 * direction -- fonts, monogram frame, background and what falls -- and keeps
 * the couple's colours, words, photos, layouts and the rest of their motion
 * (envelope, countdown, RSVP burst). Rules, not Wren, so it's
 * instant, free and as many taps as they like; undo puts it back. Tapping
 * the same direction again steps to its next variant.
 */

type Variant = Partial<Pick<SiteDesign, "ornament" | "pageStyle" | "hero">> & {
  fonts: FontPairingId;
  background?: Partial<SiteDesign["background"]>;
  /** Only what falls and the shimmer: the rest of their motion is theirs. */
  motion?: Partial<Pick<SiteDesign["motion"], "falling" | "shimmer">>;
  /** Takes the artwork off. */
  noArt?: boolean;
  /** Takes the scene off the top. */
  noScene?: boolean;
};

const CALM = { falling: "none", shimmer: false } as const;

export const NUDGES = [
  {
    id: "elegant",
    label: "Elegant",
    variants: [
      { fonts: "gm", ornament: "scroll", background: { pattern: "none", texture: "linen" }, motion: CALM },
      { fonts: "ij", ornament: "oval", background: { pattern: "none", texture: "marble" }, motion: { ...CALM, shimmer: true } },
      { fonts: "cg", ornament: "crest", background: { pattern: "none", texture: "paper" }, motion: { ...CALM, shimmer: true } },
    ],
  },
  {
    id: "romantic",
    label: "Romantic",
    variants: [
      { fonts: "gv", ornament: "laurel", background: { pattern: "none", texture: "wash" }, motion: { ...CALM, falling: "petals" } },
      { fonts: "pb", ornament: "ring", background: { pattern: "none", texture: "silk" }, motion: { ...CALM, falling: "hearts" } },
      { fonts: "mr", ornament: "lace", background: { pattern: "none", texture: "wash" }, motion: { ...CALM, falling: "butterflies" } },
    ],
  },
  {
    id: "playful",
    label: "Playful",
    variants: [
      { fonts: "lp", ornament: "ring", background: { pattern: "dots", scope: "top" }, motion: { falling: "confetti", shimmer: true } },
      { fonts: "pn", ornament: "diamond", background: { pattern: "gingham", scope: "top" }, motion: { falling: "hearts", shimmer: true } },
      { fonts: "co", ornament: "star", background: { pattern: "sunburst", scope: "top" }, motion: { falling: "bubbles", shimmer: true } },
    ],
  },
  {
    id: "minimal",
    label: "Minimal",
    variants: [
      { fonts: "dk", ornament: "rule", hero: "text", noArt: true, noScene: true, background: { pattern: "none", texture: "none", divider: "none" }, motion: CALM },
      { fonts: "go", ornament: "rule", hero: "text", noArt: true, noScene: true, background: { pattern: "none", texture: "none", divider: "none" }, motion: CALM },
    ],
  },
  {
    id: "bold",
    label: "Bold",
    variants: [
      { fonts: "bz", hero: "poster", noArt: true, background: { pattern: "none" } },
      { fonts: "go", hero: "poster", noArt: true, background: { pattern: "pinstripe", scope: "top" } },
      { fonts: "cb", hero: "card", ornament: "chandelier", background: { pattern: "deco", scope: "top" } },
    ],
  },
] as const satisfies readonly { id: string; label: string; variants: readonly Variant[] }[];

export type NudgeId = (typeof NUDGES)[number]["id"];

/** The variant after the one the design already matches, else the first. */
export function nudge(design: SiteDesign, id: NudgeId): SiteDesign {
  const variants: readonly Variant[] = NUDGES.find((n) => n.id === id)!.variants;
  const at = variants.findIndex((v) => v.fonts === design.fonts && (v.ornament ?? design.ornament) === design.ornament);
  const v = variants[(at + 1) % variants.length];
  return {
    ...design,
    // A one-off face picked on its own would hide the new pairing.
    fonts: v.fonts,
    fontDisplay: null,
    fontBody: null,
    ...(v.ornament ? { ornament: v.ornament } : {}),
    ...(v.hero ? { hero: v.hero } : {}),
    ...(v.noArt ? { art: { id: null, placement: design.art.placement } } : {}),
    ...(v.noScene ? { scene: "none" as const } : {}),
    background: { ...design.background, ...v.background },
    motion: { ...design.motion, ...v.motion },
    template: null,
  };
}
