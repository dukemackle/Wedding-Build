import { z } from "zod";

/**
 * How a couple's guest site looks: theme, accent and (in later phases) fonts,
 * hero layout, motion and section order.
 *
 * Stored as jsonb on `weddings` -- `site_design_draft` is what the editor
 * writes, `site_design` is what guests see, and Publish copies one to the
 * other. Validated here rather than with columns so a new option never needs a
 * migration. Anything unreadable falls back to the default rather than
 * breaking the page: a guest should never see an error because of a setting.
 *
 * The theme values come from the approved mockup (docs/guest-site-editor.md).
 */

export type SiteTheme = {
  id: string;
  name: string;
  mood: string;
  bg: string;
  surface: string;
  ink: string;
  muted: string;
  /** The fill behind a photo that hasn't loaded, or isn't there yet. */
  photo: string;
  display: string;
  body: string;
  italicNames: boolean;
  nameWeight: number;
  /** Text on an accent-coloured button, for the theme's own swatches. */
  buttonInk: string;
  radius: string;
  swatches: [string, string, string, string];
};

// Soft to bold.
export const THEMES = [
  {
    id: "garden",
    name: "Garden",
    mood: "Soft",
    bg: "#f6f3ec",
    surface: "#ffffff",
    ink: "#2c3a2e",
    muted: "#56645a",
    photo: "#dde2d0",
    display: "'Cormorant Garamond', serif",
    body: "'Karla', sans-serif",
    italicNames: false,
    nameWeight: 500,
    buttonInk: "#ffffff",
    radius: "4px",
    swatches: ["#4f6f45", "#7a4e5a", "#3f5f7a", "#8a5a2b"],
  },
  {
    id: "midnight",
    name: "Midnight",
    mood: "Dramatic",
    bg: "#0f1a2e",
    surface: "#172542",
    ink: "#f3ead8",
    muted: "#b9c2d6",
    photo: "#22324f",
    display: "'Playfair Display', serif",
    body: "'Jost', sans-serif",
    italicNames: true,
    nameWeight: 500,
    buttonInk: "#0f1a2e",
    radius: "999px",
    swatches: ["#d4a64a", "#e8c9a0", "#a9c1e8", "#e3a0a8"],
  },
  {
    id: "terracotta",
    name: "Terracotta",
    mood: "Warm",
    bg: "#f1e3d3",
    surface: "#e8cfb6",
    ink: "#3a1f14",
    muted: "#6a3d2c",
    photo: "#d9b393",
    display: "'Fraunces', serif",
    body: "'Work Sans', sans-serif",
    italicNames: false,
    nameWeight: 700,
    buttonInk: "#ffffff",
    radius: "0px",
    swatches: ["#b5452a", "#7a2e1a", "#5f6b2d", "#2f4b5c"],
  },
  {
    id: "botanical",
    name: "Botanical",
    mood: "Lush",
    bg: "#1f3d2b",
    surface: "#274a35",
    ink: "#f4efe3",
    muted: "#c9d3c7",
    photo: "#335a43",
    display: "'Cormorant Garamond', serif",
    body: "'Karla', sans-serif",
    italicNames: true,
    nameWeight: 500,
    buttonInk: "#1f3d2b",
    radius: "4px",
    swatches: ["#e6b8a2", "#f0d58c", "#c8dcb9", "#f4efe3"],
  },
  {
    id: "riviera",
    name: "Riviera",
    mood: "Bright",
    bg: "#fdf8ec",
    surface: "#f6e7a8",
    ink: "#12307a",
    muted: "#3d4f86",
    photo: "#cfd9f0",
    display: "'DM Serif Display', serif",
    body: "'Jost', sans-serif",
    italicNames: false,
    nameWeight: 400,
    buttonInk: "#ffffff",
    radius: "999px",
    swatches: ["#12307a", "#b8401f", "#1f6b5c", "#6b2d7a"],
  },
  {
    id: "blush",
    name: "Blush",
    mood: "Romantic",
    bg: "#f7d9d9",
    surface: "#fbeaea",
    ink: "#4a0f1e",
    muted: "#7a3a48",
    photo: "#eebcbc",
    display: "'Bodoni Moda', serif",
    body: "'Jost', sans-serif",
    italicNames: true,
    nameWeight: 500,
    buttonInk: "#ffffff",
    radius: "0px",
    swatches: ["#4a0f1e", "#8a1c3a", "#2f3a5c", "#5c3a1f"],
  },
  {
    id: "modern",
    name: "Modern",
    mood: "Minimal",
    bg: "#ffffff",
    surface: "#f4f3f0",
    ink: "#111111",
    muted: "#555555",
    photo: "#e2e0db",
    display: "'Bodoni Moda', serif",
    body: "'Jost', sans-serif",
    italicNames: false,
    nameWeight: 500,
    buttonInk: "#ffffff",
    radius: "0px",
    swatches: ["#111111", "#5b2a36", "#1f3b57", "#3d4a3a"],
  },
  {
    id: "blacktie",
    name: "Black tie",
    mood: "Formal",
    bg: "#14171a",
    surface: "#1d2125",
    ink: "#f1ede4",
    muted: "#b9b4aa",
    photo: "#2a2f34",
    display: "'Bodoni Moda', serif",
    body: "'Jost', sans-serif",
    italicNames: false,
    nameWeight: 500,
    buttonInk: "#14171a",
    radius: "0px",
    swatches: ["#c9a45c", "#d8c3a5", "#b7c4cf", "#d9a7a0"],
  },
] as const satisfies readonly SiteTheme[];

export type ThemeId = (typeof THEMES)[number]["id"];

export const DEFAULT_THEME_ID: ThemeId = "garden";

const THEME_IDS = THEMES.map((t) => t.id) as [ThemeId, ...ThemeId[]];

const HEX = /^#[0-9a-f]{6}$/i;

/** Font pairings on the Style tab. "theme" keeps the theme's own pair. */
export const FONT_PAIRINGS = [
  { id: "theme", label: "Theme default", display: null, body: null },
  { id: "cg", label: "Cormorant · Karla", display: "'Cormorant Garamond', serif", body: "'Karla', sans-serif" },
  { id: "pj", label: "Playfair · Jost", display: "'Playfair Display', serif", body: "'Jost', sans-serif" },
  { id: "bj", label: "Bodoni · Jost", display: "'Bodoni Moda', serif", body: "'Jost', sans-serif" },
  { id: "fw", label: "Fraunces · Work Sans", display: "'Fraunces', serif", body: "'Work Sans', sans-serif" },
  { id: "dk", label: "DM Serif · Jost", display: "'DM Serif Display', serif", body: "'Jost', sans-serif" },
] as const;

export type FontPairingId = (typeof FONT_PAIRINGS)[number]["id"];

export const HERO_LAYOUTS = [
  { id: "full", label: "Full photo", help: "Your photo across the top, with a card over it" },
  { id: "split", label: "Side by side", help: "Photo on one side, your names on the other" },
  { id: "framed", label: "Framed", help: "An arched photo above your names" },
] as const;

export type HeroLayoutId = (typeof HERO_LAYOUTS)[number]["id"];

/**
 * The parts of the guest site a couple can reorder and hide. `column` is
 * where each sits on a computer: the things guests act on in the wide main
 * column, reference material in the sidebar. Order is kept within a column
 * there; on a phone the page is one column in the full order.
 */
export const SITE_SECTIONS = [
  { id: "rsvp", name: "RSVP", column: "main" },
  { id: "photos", name: "Photos", column: "main" },
  { id: "weekend", name: "The weekend", column: "main" },
  { id: "wall", name: "Photo wall", column: "main" },
  { id: "guests", name: "Who's coming", column: "side" },
  { id: "travel", name: "Travel & stays", column: "side" },
  { id: "faq", name: "FAQ", column: "side" },
  { id: "registry", name: "Registry", column: "side" },
] as const;

export type SectionId = (typeof SITE_SECTIONS)[number]["id"];

const SECTION_IDS = SITE_SECTIONS.map((x) => x.id) as [SectionId, ...SectionId[]];

const DEFAULT_SECTIONS = SITE_SECTIONS.map((x) => ({ id: x.id, hidden: false }));

/**
 * Whatever order was saved, made whole: unknown ids and repeats dropped, and
 * any section added to Wren since appended, visible, so a new section never
 * silently goes missing from an older design.
 */
function completeSections(saved: { id: SectionId; hidden: boolean }[]) {
  const seen = new Set<SectionId>();
  const kept = saved.filter((x) => !seen.has(x.id) && seen.add(x.id));
  return [...kept, ...DEFAULT_SECTIONS.filter((x) => !seen.has(x.id))];
}

export const siteDesignSchema = z.object({
  theme: z.enum(THEME_IDS).catch(DEFAULT_THEME_ID),
  /** null means the theme's first swatch. */
  accent: z.string().regex(HEX).nullable().catch(null),
  fonts: z.enum(FONT_PAIRINGS.map((f) => f.id) as [FontPairingId, ...FontPairingId[]]).catch("theme"),
  hero: z.enum(HERO_LAYOUTS.map((h) => h.id) as [HeroLayoutId, ...HeroLayoutId[]]).catch("full"),
  sections: z
    .array(z.object({ id: z.enum(SECTION_IDS), hidden: z.boolean().catch(false) }).nullable().catch(null))
    .transform((list) => completeSections(list.filter((x) => x !== null)))
    .catch(DEFAULT_SECTIONS),
});

export type SiteDesign = z.infer<typeof siteDesignSchema>;

export const DEFAULT_SITE_DESIGN: SiteDesign = {
  theme: DEFAULT_THEME_ID,
  accent: null,
  fonts: "theme",
  hero: "full",
  sections: DEFAULT_SECTIONS,
};

/** Whatever is in the column -- null, an old shape, junk -- as a usable design. */
export function parseSiteDesign(value: unknown): SiteDesign {
  const result = siteDesignSchema.safeParse(value ?? {});
  return result.success ? result.data : DEFAULT_SITE_DESIGN;
}

export function sameDesign(a: SiteDesign, b: SiteDesign) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function themeById(id: string): SiteTheme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

function channel(hex: string, i: number) {
  const c = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string) {
  return 0.2126 * channel(hex, 0) + 0.7152 * channel(hex, 1) + 0.0722 * channel(hex, 2);
}

/** WCAG contrast ratio, 1 to 21. */
export function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export type ResolvedDesign = {
  theme: SiteTheme;
  accent: string;
  /** Text on an accent button: the theme's own choice unless a custom accent makes it unreadable. */
  onAccent: string;
  /** The darker of ink and background: a scrim over a photo has to be dark on every theme. */
  scrim: string;
};

export function resolveDesign(design: SiteDesign): ResolvedDesign {
  const base = themeById(design.theme);
  const pairing = FONT_PAIRINGS.find((f) => f.id === design.fonts);
  const theme: SiteTheme =
    pairing?.display && pairing.body ? { ...base, display: pairing.display, body: pairing.body } : base;
  const accent = design.accent ?? theme.swatches[0];
  const onAccent =
    contrast(theme.buttonInk, accent) >= 4.5
      ? theme.buttonInk
      : [theme.buttonInk, "#ffffff", theme.ink, theme.bg, "#111111"].reduce((best, c) =>
          contrast(c, accent) > contrast(best, accent) ? c : best,
        );
  const scrim = luminance(theme.ink) < luminance(theme.bg) ? theme.ink : theme.bg;
  return { theme, accent, onAccent, scrim };
}

/**
 * The CSS custom properties that restyle the guest site. The site is written
 * against the app's semantic colour names, so overriding those on a wrapper
 * rethemes every card, heading and label under it; the `.guest-site` rules in
 * globals.css handle the few places where one app colour plays two roles.
 */
export function designCssVars(design: SiteDesign): Record<string, string> {
  const { theme, accent, onAccent, scrim } = resolveDesign(design);
  return {
    "--color-parchment": theme.bg,
    "--color-card": theme.surface,
    "--color-ink": theme.ink,
    "--color-hairline": `color-mix(in srgb, ${theme.ink} 14%, transparent)`,
    // Headings use `forest`; in the mockup they're in the theme's ink.
    "--color-forest": theme.ink,
    // Small uppercase labels use `brass`; in the mockup they're the accent.
    "--color-brass": accent,
    "--font-display": theme.display,
    "--font-body": theme.body,
    "--site-accent": accent,
    "--site-on-accent": onAccent,
    "--site-muted": theme.muted,
    "--site-photo": theme.photo,
    "--site-scrim": scrim,
    "--site-radius": theme.radius,
    "--site-name-style": theme.italicNames ? "italic" : "normal",
    "--site-name-weight": String(theme.nameWeight),
    // Native controls -- checkboxes, select menus, scrollbars -- in the theme's light or dark.
    "--site-scheme": luminance(theme.bg) < 0.2 ? "dark" : "light",
  };
}

const FONT_FAMILIES: Record<string, string> = {
  "'Cormorant Garamond', serif": "Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500",
  "'Karla', sans-serif": "Karla:wght@400;500;600",
  "'Playfair Display', serif": "Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500",
  "'Jost', sans-serif": "Jost:wght@400;500;600",
  "'Fraunces', serif": "Fraunces:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500",
  "'Work Sans', sans-serif": "Work+Sans:wght@400;500;600",
  "'DM Serif Display', serif": "DM+Serif+Display:ital@0;1",
  "'Bodoni Moda', serif": "Bodoni+Moda:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500",
};

/**
 * The Google Fonts stylesheet for some themes -- one theme on the live site,
 * all of them in the editor. Loaded as a stylesheet rather than through
 * next/font so the app's other pages don't preload eight families they never
 * use, and so the build doesn't fetch them either (see CLAUDE.md on font
 * fetches failing Cloudflare builds).
 */
export function fontsHref(themes: readonly SiteTheme[]) {
  const families = [...new Set(themes.flatMap((t) => [t.display, t.body]))]
    .map((f) => FONT_FAMILIES[f])
    .filter(Boolean);
  return `https://fonts.googleapis.com/css2?${families.map((f) => `family=${f}`).join("&")}&display=swap`;
}
