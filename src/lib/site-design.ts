import { z } from "zod";
import { canvasFontIds, canvasSchema, EMPTY_CANVAS } from "./site-canvas";

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
  /** Where the theme sits in the editor's list; none means the classic eight. */
  group?: ThemeGroup;
  /** The scene the theme draws by default (a design's own choice wins). */
  scene?: SceneId;
  /** The monogram the theme switches to when it's picked. */
  ornament?: OrnamentId;
};

export const THEME_GROUPS = ["Classic", "Outdoors", "Western", "Traditions", "Modern & retro"] as const;

export type ThemeGroup = (typeof THEME_GROUPS)[number];

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
  // Outdoors. Each one's swatches are its moods: picking another swatch
  // recolours the scene along with the buttons.
  {
    id: "mountain",
    name: "Mountain",
    mood: "Alpine",
    group: "Outdoors",
    scene: "mountains",
    bg: "#fbf1ee",
    surface: "#ffffff",
    ink: "#2e2140",
    muted: "#5a4a68",
    photo: "#e8d6dc",
    display: "'Oswald', sans-serif",
    body: "'Jost', sans-serif",
    italicNames: false,
    nameWeight: 500,
    buttonInk: "#ffffff",
    radius: "2px",
    swatches: ["#5b3a7a", "#3f6390", "#a14f22", "#3f6e55"],
  },
  {
    id: "ocean",
    name: "Ocean",
    mood: "Breezy",
    group: "Outdoors",
    scene: "waves",
    bg: "#f7f3ea",
    surface: "#ffffff",
    ink: "#143c5a",
    muted: "#4a6578",
    photo: "#d6e6ea",
    display: "'Marcellus', serif",
    body: "'Jost', sans-serif",
    italicNames: false,
    nameWeight: 400,
    buttonInk: "#ffffff",
    radius: "999px",
    swatches: ["#2a6f8e", "#143c5a", "#0f6a6a", "#4f7a6a"],
  },
  {
    id: "desert",
    name: "Desert",
    mood: "Boho",
    group: "Outdoors",
    scene: "sunset",
    bg: "#f6e9d8",
    surface: "#fcf5ec",
    ink: "#4a2414",
    muted: "#74503c",
    photo: "#e5cdb2",
    display: "'Fraunces', serif",
    body: "'Jost', sans-serif",
    italicNames: false,
    nameWeight: 500,
    buttonInk: "#ffffff",
    radius: "999px",
    swatches: ["#a84f2a", "#5a2a18", "#5f6b3f", "#8a5a2a"],
  },
  {
    id: "vineyard",
    name: "Vineyard",
    mood: "Harvest",
    group: "Outdoors",
    scene: "hills",
    bg: "#f4efe6",
    surface: "#fbf8f2",
    ink: "#3e1620",
    muted: "#6e4e56",
    photo: "#e2d6d0",
    display: "'Cormorant Garamond', serif",
    body: "'Jost', sans-serif",
    italicNames: true,
    nameWeight: 500,
    buttonInk: "#ffffff",
    radius: "2px",
    swatches: ["#6e2436", "#5a6630", "#7a5a2a", "#3f4a2a"],
  },
  {
    id: "barn",
    name: "Barn",
    mood: "Rustic elegant",
    group: "Outdoors",
    scene: "lights",
    ornament: "barndoor",
    bg: "#f6f0e6",
    surface: "#fffaf2",
    ink: "#3b2a1e",
    muted: "#6e5a48",
    photo: "#e2d4c0",
    display: "'Playfair Display', serif",
    body: "'Jost', sans-serif",
    italicNames: true,
    nameWeight: 500,
    buttonInk: "#ffffff",
    radius: "2px",
    swatches: ["#8a5a2b", "#3b2a1e", "#7d6020", "#5f6b4a"],
  },
  {
    id: "winter",
    name: "Winter",
    mood: "Crisp",
    group: "Outdoors",
    scene: "pines",
    bg: "#eef2f5",
    surface: "#ffffff",
    ink: "#1e2f4a",
    muted: "#4c5f78",
    photo: "#d6dee6",
    display: "'Gilda Display', serif",
    body: "'Jost', sans-serif",
    italicNames: false,
    nameWeight: 400,
    buttonInk: "#ffffff",
    radius: "2px",
    swatches: ["#1e2f4a", "#4a6380", "#2f5a4a", "#8a2a3c"],
  },
  // Western
  {
    id: "ranch",
    name: "Ranch",
    mood: "Rustic",
    group: "Western",
    scene: "frontier",
    ornament: "horseshoe",
    bg: "#efe3cc",
    surface: "#f7eedb",
    ink: "#3b2416",
    muted: "#694c37",
    photo: "#dccaa8",
    display: "'Rye', serif",
    body: "'Courier Prime', monospace",
    italicNames: false,
    nameWeight: 400,
    buttonInk: "#f7eedb",
    radius: "2px",
    swatches: ["#7a2e1f", "#5a3a24", "#6a5420", "#3b5a4a"],
  },
  {
    id: "cowgirl",
    name: "Cowgirl",
    mood: "Playful",
    group: "Western",
    scene: "gingham",
    ornament: "horseshoe",
    bg: "#fdf5f1",
    surface: "#ffffff",
    ink: "#4a1f2a",
    muted: "#77495a",
    photo: "#f2d4dc",
    display: "'Ultra', serif",
    body: "'Karla', sans-serif",
    italicNames: false,
    nameWeight: 400,
    buttonInk: "#ffffff",
    radius: "999px",
    swatches: ["#a3203a", "#a8406a", "#7a4a2a", "#3b5a7a"],
  },
  // Traditions. Each brings the marks its weddings use; all of them can be
  // changed like any other theme's.
  {
    id: "mehndi",
    name: "Mehndi",
    mood: "Jewel",
    group: "Traditions",
    scene: "garland",
    ornament: "mandala",
    bg: "#fbf1dc",
    surface: "#fff8ea",
    ink: "#4a0d27",
    muted: "#7a3a52",
    photo: "#f0d8b8",
    display: "'Cinzel', serif",
    body: "'Jost', sans-serif",
    italicNames: false,
    nameWeight: 500,
    buttonInk: "#ffffff",
    radius: "2px",
    swatches: ["#7a1640", "#0f5a4a", "#9a4a00", "#1f3a6e"],
  },
  {
    id: "nikah",
    name: "Nikah",
    mood: "Serene",
    group: "Traditions",
    scene: "stars",
    ornament: "bismillah",
    bg: "#f8f4ea",
    surface: "#ffffff",
    ink: "#123d35",
    muted: "#3d5f57",
    photo: "#dfe6dc",
    display: "'Pinyon Script', cursive",
    body: "'Cormorant Garamond', serif",
    italicNames: false,
    nameWeight: 400,
    buttonInk: "#ffffff",
    radius: "2px",
    swatches: ["#123d35", "#7d6020", "#5a2a3a", "#1f3a5a"],
  },
  {
    id: "chuppah",
    name: "Chuppah",
    mood: "Heirloom",
    group: "Traditions",
    scene: "frame",
    ornament: "chuppah",
    bg: "#f7f3ea",
    surface: "#ffffff",
    ink: "#1f3a6e",
    muted: "#4a5a7a",
    photo: "#dde2ea",
    display: "'Cormorant Garamond', serif",
    body: "'Jost', sans-serif",
    italicNames: false,
    nameWeight: 500,
    buttonInk: "#ffffff",
    radius: "2px",
    swatches: ["#1f3a6e", "#7d6020", "#5a2a4a", "#2f5a4a"],
  },
  {
    id: "fiesta",
    name: "Fiesta",
    mood: "Vibrant",
    group: "Traditions",
    scene: "papel",
    bg: "#fff7ec",
    surface: "#ffffff",
    ink: "#3a1f2a",
    muted: "#6a4a52",
    photo: "#f6dcc6",
    display: "'Playfair Display', serif",
    body: "'Karla', sans-serif",
    italicNames: false,
    nameWeight: 600,
    buttonInk: "#ffffff",
    radius: "999px",
    swatches: ["#b02a58", "#0f7a74", "#a8481a", "#3a1f2a"],
  },
  {
    id: "doublehappiness",
    name: "Double happiness",
    mood: "Festive",
    group: "Traditions",
    scene: "clouds",
    ornament: "xi",
    bg: "#a61d27",
    surface: "#b3262f",
    ink: "#fdf0d6",
    muted: "#f3d2a8",
    photo: "#8f1820",
    display: "'Cinzel', serif",
    body: "'Jost', sans-serif",
    italicNames: false,
    nameWeight: 500,
    buttonInk: "#6e1219",
    radius: "2px",
    swatches: ["#f6d68a", "#fdf0d6", "#ffffff", "#f0b860"],
  },
  // Modern & retro
  {
    id: "city",
    name: "City hall",
    mood: "Editorial",
    group: "Modern & retro",
    ornament: "none",
    bg: "#ffffff",
    surface: "#ffffff",
    ink: "#111111",
    muted: "#555555",
    photo: "#e6e6e6",
    display: "'Bodoni Moda', serif",
    body: "'Jost', sans-serif",
    italicNames: false,
    nameWeight: 500,
    buttonInk: "#ffffff",
    radius: "0px",
    swatches: ["#111111", "#8a2a3c", "#2243b6", "#5e5e5e"],
  },
  {
    id: "retro",
    name: "Retro",
    mood: "Groovy",
    group: "Modern & retro",
    scene: "groovy",
    ornament: "none",
    bg: "#fbf0dc",
    surface: "#fff8ea",
    ink: "#4e2814",
    muted: "#7d5236",
    photo: "#f0d9b5",
    display: "'Shrikhand', serif",
    body: "'Karla', sans-serif",
    italicNames: false,
    nameWeight: 400,
    buttonInk: "#ffffff",
    radius: "999px",
    swatches: ["#b23f14", "#8a4b2a", "#8a5a00", "#3b5a4a"],
  },
] as const satisfies readonly SiteTheme[];

export type ThemeId = (typeof THEMES)[number]["id"];

export const DEFAULT_THEME_ID: ThemeId = "garden";

const THEME_IDS = THEMES.map((t) => t.id) as [ThemeId, ...ThemeId[]];

const HEX = /^#[0-9a-f]{6}$/i;

/**
 * Every face a couple can pick, by itself, for headings or body text. `css`
 * is the font-family value; `google` the Google Fonts spec it loads from.
 * Script faces have no italic and read badly in capitals, so names set in
 * one are never slanted or tracked out.
 */
export const FONTS = [
  // Serif display
  { id: "cormorant", label: "Cormorant Garamond", kind: "serif", css: "'Cormorant Garamond', serif", google: "Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500" },
  { id: "playfair", label: "Playfair Display", kind: "serif", css: "'Playfair Display', serif", google: "Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500" },
  { id: "bodoni", label: "Bodoni Moda", kind: "serif", css: "'Bodoni Moda', serif", google: "Bodoni+Moda:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500" },
  { id: "fraunces", label: "Fraunces", kind: "serif", css: "'Fraunces', serif", google: "Fraunces:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500" },
  { id: "dmserif", label: "DM Serif Display", kind: "serif", css: "'DM Serif Display', serif", google: "DM+Serif+Display:ital@0;1" },
  { id: "ebgaramond", label: "EB Garamond", kind: "serif", css: "'EB Garamond', serif", google: "EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500" },
  { id: "cinzel", label: "Cinzel", kind: "serif", css: "'Cinzel', serif", google: "Cinzel:wght@400;500;600" },
  { id: "italiana", label: "Italiana", kind: "serif", css: "'Italiana', serif", google: "Italiana" },
  { id: "marcellus", label: "Marcellus", kind: "serif", css: "'Marcellus', serif", google: "Marcellus" },
  { id: "gilda", label: "Gilda Display", kind: "serif", css: "'Gilda Display', serif", google: "Gilda+Display" },
  { id: "prata", label: "Prata", kind: "serif", css: "'Prata', serif", google: "Prata" },
  { id: "baskerville", label: "Libre Baskerville", kind: "serif", css: "'Libre Baskerville', serif", google: "Libre+Baskerville:ital,wght@0,400;0,700;1,400" },
  { id: "forum", label: "Forum", kind: "serif", css: "'Forum', serif", google: "Forum" },
  { id: "bellefair", label: "Bellefair", kind: "serif", css: "'Bellefair', serif", google: "Bellefair" },
  { id: "zilla", label: "Zilla Slab", kind: "serif", css: "'Zilla Slab', serif", google: "Zilla+Slab:ital,wght@0,400;0,500;0,600;1,400" },
  { id: "bree", label: "Bree Serif", kind: "serif", css: "'Bree Serif', serif", google: "Bree+Serif" },
  // Display: big, characterful faces for names and headings only.
  { id: "cinzeldeco", label: "Cinzel Decorative", kind: "display", css: "'Cinzel Decorative', serif", google: "Cinzel+Decorative:wght@400;700" },
  { id: "poiret", label: "Poiret One", kind: "display", css: "'Poiret One', serif", google: "Poiret+One" },
  { id: "limelight", label: "Limelight", kind: "display", css: "'Limelight', serif", google: "Limelight" },
  { id: "abril", label: "Abril Fatface", kind: "display", css: "'Abril Fatface', serif", google: "Abril+Fatface" },
  { id: "gloock", label: "Gloock", kind: "display", css: "'Gloock', serif", google: "Gloock" },
  { id: "caslondisplay", label: "Libre Caslon Display", kind: "display", css: "'Libre Caslon Display', serif", google: "Libre+Caslon+Display" },
  { id: "bebas", label: "Bebas Neue", kind: "display", css: "'Bebas Neue', serif", google: "Bebas+Neue" },
  { id: "anton", label: "Anton", kind: "display", css: "'Anton', serif", google: "Anton" },
  { id: "oswald", label: "Oswald", kind: "display", css: "'Oswald', sans-serif", google: "Oswald:wght@400;500;600" },
  { id: "rye", label: "Rye", kind: "display", css: "'Rye', serif", google: "Rye" },
  { id: "ultra", label: "Ultra", kind: "display", css: "'Ultra', serif", google: "Ultra" },
  { id: "shrikhand", label: "Shrikhand", kind: "display", css: "'Shrikhand', serif", google: "Shrikhand" },
  // Script
  { id: "saintdelafield", label: "Mrs Saint Delafield", kind: "script", css: "'Mrs Saint Delafield', cursive", google: "Mrs+Saint+Delafield" },
  { id: "monsieur", label: "Monsieur La Doulaise", kind: "script", css: "'Monsieur La Doulaise', cursive", google: "Monsieur+La+Doulaise" },
  { id: "herrvon", label: "Herr Von Muellerhoff", kind: "script", css: "'Herr Von Muellerhoff', cursive", google: "Herr+Von+Muellerhoff" },
  { id: "corinthia", label: "Corinthia", kind: "script", css: "'Corinthia', cursive", google: "Corinthia:wght@400;700" },
  { id: "windsong", label: "WindSong", kind: "script", css: "'WindSong', cursive", google: "WindSong:wght@400;500" },
  { id: "ballet", label: "Ballet", kind: "script", css: "'Ballet', cursive", google: "Ballet" },
  { id: "alexbrush", label: "Alex Brush", kind: "script", css: "'Alex Brush', cursive", google: "Alex+Brush" },
  { id: "sacramento", label: "Sacramento", kind: "script", css: "'Sacramento', cursive", google: "Sacramento" },
  { id: "birthstone", label: "Birthstone", kind: "script", css: "'Birthstone', cursive", google: "Birthstone" },
  { id: "imperial", label: "Imperial Script", kind: "script", css: "'Imperial Script', cursive", google: "Imperial+Script" },
  { id: "lobster", label: "Lobster", kind: "script", css: "'Lobster', cursive", google: "Lobster" },
  { id: "damion", label: "Damion", kind: "script", css: "'Damion', cursive", google: "Damion" },
  { id: "kaushan", label: "Kaushan Script", kind: "script", css: "'Kaushan Script', cursive", google: "Kaushan+Script" },
  { id: "grandhotel", label: "Grand Hotel", kind: "script", css: "'Grand Hotel', cursive", google: "Grand+Hotel" },
  { id: "yellowtail", label: "Yellowtail", kind: "script", css: "'Yellowtail', cursive", google: "Yellowtail" },
  { id: "greatvibes", label: "Great Vibes", kind: "script", css: "'Great Vibes', cursive", google: "Great+Vibes" },
  { id: "pinyon", label: "Pinyon Script", kind: "script", css: "'Pinyon Script', cursive", google: "Pinyon+Script" },
  { id: "parisienne", label: "Parisienne", kind: "script", css: "'Parisienne', cursive", google: "Parisienne" },
  { id: "allura", label: "Allura", kind: "script", css: "'Allura', cursive", google: "Allura" },
  { id: "petitformal", label: "Petit Formal Script", kind: "script", css: "'Petit Formal Script', cursive", google: "Petit+Formal+Script" },
  // Sans
  { id: "jost", label: "Jost", kind: "sans", css: "'Jost', sans-serif", google: "Jost:wght@400;500;600" },
  { id: "karla", label: "Karla", kind: "sans", css: "'Karla', sans-serif", google: "Karla:wght@400;500;600" },
  { id: "worksans", label: "Work Sans", kind: "sans", css: "'Work Sans', sans-serif", google: "Work+Sans:wght@400;500;600" },
  { id: "montserrat", label: "Montserrat", kind: "sans", css: "'Montserrat', sans-serif", google: "Montserrat:wght@400;500;600" },
  { id: "josefin", label: "Josefin Sans", kind: "sans", css: "'Josefin Sans', sans-serif", google: "Josefin+Sans:wght@400;500;600" },
  { id: "nunito", label: "Nunito Sans", kind: "sans", css: "'Nunito Sans', sans-serif", google: "Nunito+Sans:wght@400;600" },
  { id: "poppins", label: "Poppins", kind: "sans", css: "'Poppins', sans-serif", google: "Poppins:wght@400;500;600" },
  { id: "raleway", label: "Raleway", kind: "sans", css: "'Raleway', sans-serif", google: "Raleway:ital,wght@0,400;0,500;0,600;1,400" },
  { id: "outfit", label: "Outfit", kind: "sans", css: "'Outfit', sans-serif", google: "Outfit:wght@400;500;600" },
  { id: "courier", label: "Courier Prime", kind: "sans", css: "'Courier Prime', monospace", google: "Courier+Prime:ital,wght@0,400;0,700;1,400" },
] as const;

export type FontId = (typeof FONTS)[number]["id"];

const FONT_IDS = FONTS.map((f) => f.id) as [FontId, ...FontId[]];

/** Faces that work for paragraphs: no scripts or display faces, and no all-caps Cinzel. */
export const BODY_FONTS = FONTS.filter(
  (f) => f.kind !== "script" && f.kind !== "display" && f.id !== "cinzel" && f.id !== "italiana",
);

export function fontById(id: string | null | undefined) {
  return FONTS.find((f) => f.id === id) ?? null;
}

export function fontByCss(css: string) {
  return FONTS.find((f) => f.css === css) ?? null;
}

/**
 * Quick picks on the Style tab: tried-and-tested pairs. Choosing one sets the
 * heading and body face; "theme" clears both back to the theme's own.
 */
export const FONT_PAIRINGS = [
  { id: "theme", label: "Theme default", display: null, body: null },
  { id: "cg", label: "Cormorant · Karla", display: "cormorant", body: "karla" },
  { id: "pj", label: "Playfair · Jost", display: "playfair", body: "jost" },
  { id: "bj", label: "Bodoni · Jost", display: "bodoni", body: "jost" },
  { id: "fw", label: "Fraunces · Work Sans", display: "fraunces", body: "worksans" },
  { id: "dk", label: "DM Serif · Jost", display: "dmserif", body: "jost" },
  { id: "gv", label: "Great Vibes · EB Garamond", display: "greatvibes", body: "ebgaramond" },
  { id: "cm", label: "Cinzel · Montserrat", display: "cinzel", body: "montserrat" },
  { id: "pb", label: "Pinyon · Libre Baskerville", display: "pinyon", body: "baskerville" },
  { id: "ij", label: "Italiana · Josefin", display: "italiana", body: "josefin" },
  { id: "pn", label: "Parisienne · Nunito", display: "parisienne", body: "nunito" },
  { id: "gm", label: "Gilda · Marcellus", display: "gilda", body: "nunito" },
  { id: "mr", label: "Mrs Saint Delafield · Raleway", display: "saintdelafield", body: "raleway" },
  { id: "co", label: "Corinthia · Outfit", display: "corinthia", body: "outfit" },
  { id: "lp", label: "Lobster · Poppins", display: "lobster", body: "poppins" },
  { id: "cb", label: "Cinzel Decorative · Bellefair", display: "cinzeldeco", body: "bellefair" },
  { id: "go", label: "Gloock · Outfit", display: "gloock", body: "outfit" },
  { id: "bz", label: "Bebas Neue · Zilla Slab", display: "bebas", body: "zilla" },
] as const satisfies readonly { id: string; label: string; display: FontId | null; body: FontId | null }[];

export type FontPairingId = (typeof FONT_PAIRINGS)[number]["id"];

export const HERO_LAYOUTS = [
  { id: "full", label: "Full photo", help: "Your photo across the top, with a card over it" },
  { id: "split", label: "Side by side", help: "Photo on one side, your names on the other" },
  { id: "framed", label: "Framed", help: "An arched photo above your names" },
  { id: "monogram", label: "Monogram", help: "Your crest large, your names under it, no photo" },
  { id: "text", label: "Text only", help: "Just your names and date, beautifully set" },
  { id: "card", label: "Framed card", help: "Your names on a framed card, over your photo or a band of your colour" },
  { id: "poster", label: "Poster", help: "Your names huge, poster-style, over your photo or on their own" },
] as const;

/** The layouts that show the banner photo. */
export const PHOTO_HEROES: readonly HeroLayoutId[] = ["full", "split", "framed"];

/**
 * The mark above the couple's names: their initials, set in a frame drawn in
 * the accent colour. "rule" is what the site had before there was a choice.
 */
export const ORNAMENTS = [
  { id: "none", label: "None" },
  { id: "rule", label: "Simple" },
  { id: "laurel", label: "Laurel" },
  { id: "crest", label: "Crest" },
  { id: "ring", label: "Ring" },
  { id: "arch", label: "Arch" },
  { id: "diamond", label: "Diamond" },
  { id: "seal", label: "Wax seal" },
  { id: "horseshoe", label: "Horseshoe" },
  { id: "mountain", label: "Peak" },
  { id: "anchor", label: "Anchor" },
  { id: "mandala", label: "Mandala" },
  { id: "star", label: "Eight-point star" },
  { id: "chuppah", label: "Chuppah" },
  { id: "compass", label: "Compass" },
  { id: "wheel", label: "Ship's wheel" },
  { id: "chandelier", label: "Chandelier" },
  { id: "barndoor", label: "Barn door" },
  { id: "lace", label: "Lace" },
  { id: "scroll", label: "Gold scroll" },
  { id: "oval", label: "Oval" },
  // Words rather than initials: the blessing a Nikah invitation opens with,
  // and the double-happiness character.
  { id: "bismillah", label: "Bismillah" },
  { id: "xi", label: "囍" },
] as const;

/** Ornaments that are a set phrase, not the couple's initials. */
export const WORD_ORNAMENTS: readonly OrnamentId[] = ["bismillah", "xi"];

/**
 * A drawn setting for the top of the page, coloured from the palette so it
 * suits any accent (src/components/site-scene.tsx). "band" scenes sit along
 * the bottom of the top of the page, "strip" ones along its top, and
 * "surround" ones frame the names (so they show only where there's no photo
 * behind them).
 */
export const SCENES = [
  { id: "none", label: "None", place: "none" },
  // Landscapes, along the bottom of the top of the page.
  { id: "mountains", label: "Snowy peaks", place: "band" },
  { id: "ridges", label: "Misty ridges", place: "band" },
  { id: "lake", label: "Alpine lake", place: "band" },
  { id: "meadow", label: "Ranch meadow", place: "band" },
  { id: "hills", label: "Vineyard rows", place: "band" },
  { id: "waves", label: "Waves", place: "band" },
  { id: "pines", label: "Pines", place: "band" },
  { id: "frontier", label: "Mesas", place: "band" },
  { id: "sunset", label: "Desert sun", place: "band" },
  // Strips, across the top.
  { id: "lights", label: "String lights", place: "strip" },
  { id: "shoreline", label: "Shoreline", place: "strip" },
  { id: "garland", label: "Marigolds", place: "strip" },
  { id: "papel", label: "Papel picado", place: "strip" },
  { id: "stars", label: "Star pattern", place: "strip" },
  { id: "gingham", label: "Gingham", place: "strip" },
  { id: "stripes", label: "Stripes", place: "strip" },
  { id: "rope", label: "Rope", place: "strip" },
  { id: "western-tiles", label: "Western tiles", place: "strip" },
  { id: "ocean-tiles", label: "Ocean tiles", place: "strip" },
  // Around the names.
  { id: "drape", label: "Draped fabric", place: "surround" },
  { id: "western-pattern", label: "Western icons", place: "surround" },
  { id: "ocean-pattern", label: "Sea life", place: "surround" },
  { id: "clouds", label: "Clouds", place: "surround" },
  { id: "groovy", label: "Groovy rings", place: "surround" },
  { id: "frame", label: "Double frame", place: "surround" },
  { id: "scallop", label: "Scalloped border", place: "surround" },
] as const;

export type SceneId = (typeof SCENES)[number]["id"];

const SCENE_IDS = SCENES.map((x) => x.id) as [SceneId, ...SceneId[]];

export function sceneById(id: string | null | undefined) {
  return SCENES.find((x) => x.id === id) ?? SCENES[0];
}

/**
 * How the sections below the top are dressed. "cards" is each in its own
 * card, two columns on a computer. "storybook" runs them as full-width bands
 * in alternating tints, with the schedule as an illustrated timeline, photos
 * as a scrapbook and places to stay as a dotted route.
 */
export const PAGE_STYLES = [
  { id: "cards", label: "Cards", help: "Each section in its own card" },
  { id: "storybook", label: "Storybook", help: "Full-width bands, a timeline, scrapbook photos" },
] as const;

export type PageStyleId = (typeof PAGE_STYLES)[number]["id"];

export type OrnamentId = (typeof ORNAMENTS)[number]["id"];

const ORNAMENT_IDS = ORNAMENTS.map((o) => o.id) as [OrnamentId, ...OrnamentId[]];

/**
 * Botanical artwork for the top of the page (Style tab › Artwork): public-
 * domain illustrations cut out of their paper, in public/site-art/ (sources
 * and licences in docs/site-art-sources.md). "line" pieces are engravings
 * kept as a shape and filled with the accent; "colour" pieces are
 * watercolours shown as painted. w and h are the file's pixel size.
 */
export const SITE_ART = [
  { id: "eucalyptus", name: "Eucalyptus", group: "Greenery", kind: "colour", src: "/site-art/eucalyptus-watercolour.webp", w: 626, h: 900 },
  { id: "eucalyptus-line", name: "Eucalyptus sketch", group: "Greenery", kind: "line", src: "/site-art/eucalyptus-line.webp", w: 653, h: 900 },
  { id: "olive", name: "Olive branch", group: "Greenery", kind: "colour", src: "/site-art/olive-colour.webp", w: 787, h: 900 },
  { id: "olive-line", name: "Olive sketch", group: "Greenery", kind: "line", src: "/site-art/olive-line.webp", w: 900, h: 759 },
  { id: "rose", name: "Garden rose", group: "Roses & peonies", kind: "colour", src: "/site-art/rose-pink.webp", w: 659, h: 900 },
  { id: "roses-white", name: "White roses", group: "Roses & peonies", kind: "colour", src: "/site-art/roses-white-pink.webp", w: 824, h: 900 },
  { id: "peony", name: "Peony", group: "Roses & peonies", kind: "colour", src: "/site-art/peony-magenta.webp", w: 677, h: 900 },
  { id: "wild-roses", name: "Wild roses", group: "Wildflowers", kind: "colour", src: "/site-art/wild-roses.webp", w: 625, h: 900 },
  { id: "mallow", name: "Mallow", group: "Wildflowers", kind: "colour", src: "/site-art/mallow.webp", w: 787, h: 900 },
  { id: "sweet-pea", name: "Sweet pea", group: "Wildflowers", kind: "colour", src: "/site-art/sweet-pea.webp", w: 641, h: 900 },
  { id: "lavender", name: "Lavender", group: "Wildflowers", kind: "colour", src: "/site-art/lavender-colour.webp", w: 432, h: 900 },
  { id: "lavender-line", name: "Lavender sketch", group: "Wildflowers", kind: "line", src: "/site-art/lavender-line.webp", w: 366, h: 900 },
  { id: "oats", name: "Dried grasses", group: "Seasonal", kind: "colour", src: "/site-art/oats.webp", w: 472, h: 900 },
  { id: "autumn", name: "Autumn leaves", group: "Seasonal", kind: "colour", src: "/site-art/autumn-sprig.webp", w: 802, h: 900 },
  { id: "holly", name: "Holly", group: "Seasonal", kind: "colour", src: "/site-art/holly.webp", w: 531, h: 900 },
  { id: "holly-line", name: "Holly & mistletoe", group: "Seasonal", kind: "line", src: "/site-art/holly-mistletoe-line.webp", w: 674, h: 900 },
  { id: "lemon", name: "Lemons", group: "Destination", kind: "colour", src: "/site-art/lemon.webp", w: 703, h: 900 },
  { id: "palm", name: "Date palm", group: "Destination", kind: "colour", src: "/site-art/palm-sprig.webp", w: 302, h: 900 },
  // Drawn for You Do, I Do (SVG, ours outright), filled with the accent.
  { id: "boot", name: "Cowboy boot", group: "Western", kind: "line", src: "/site-art/boot.svg", w: 640, h: 900 },
  { id: "saguaro", name: "Cactus", group: "Western", kind: "line", src: "/site-art/saguaro.svg", w: 600, h: 900 },
  { id: "longhorn", name: "Longhorn", group: "Western", kind: "line", src: "/site-art/longhorn.svg", w: 900, h: 560 },
  { id: "anchor", name: "Anchor", group: "Coast", kind: "line", src: "/site-art/anchor.svg", w: 720, h: 900 },
  { id: "shells", name: "Shells", group: "Coast", kind: "line", src: "/site-art/shells.svg", w: 640, h: 900 },
  { id: "frond", name: "Palm frond", group: "Coast", kind: "line", src: "/site-art/frond.svg", w: 620, h: 900 },
  { id: "grapes", name: "Grapevine", group: "Vineyard", kind: "line", src: "/site-art/grapes.svg", w: 640, h: 900 },
  { id: "pine", name: "Pine bough", group: "Winter", kind: "line", src: "/site-art/pine.svg", w: 600, h: 900 },
  // Icons shared with the patterns (scripts/site-art-icons.mjs writes them).
  { id: "hat", name: "Cowboy hat", group: "Western", kind: "line", src: "/site-art/icon-hat.svg", w: 900, h: 900 },
  { id: "badge", name: "Sheriff's star", group: "Western", kind: "line", src: "/site-art/icon-badge.svg", w: 900, h: 900 },
  { id: "horseshoe", name: "Horseshoe", group: "Western", kind: "line", src: "/site-art/icon-horseshoe.svg", w: 900, h: 900 },
  { id: "seahorse", name: "Seahorse", group: "Coast", kind: "line", src: "/site-art/icon-seahorse.svg", w: 900, h: 900 },
  { id: "starfish", name: "Starfish", group: "Coast", kind: "line", src: "/site-art/icon-starfish.svg", w: 900, h: 900 },
  { id: "turtle", name: "Sea turtle", group: "Coast", kind: "line", src: "/site-art/icon-turtle.svg", w: 900, h: 900 },
  { id: "coral", name: "Coral", group: "Coast", kind: "line", src: "/site-art/icon-coral.svg", w: 900, h: 900 },
  { id: "fish", name: "Fish", group: "Coast", kind: "line", src: "/site-art/icon-fish.svg", w: 900, h: 900 },
  { id: "hibiscus", name: "Hibiscus", group: "Coast", kind: "line", src: "/site-art/hibiscus.svg", w: 600, h: 900 },
  { id: "seagrass", name: "Sea grass", group: "Coast", kind: "line", src: "/site-art/seagrass.svg", w: 600, h: 900 },
  { id: "sun", name: "Sun", group: "Desert", kind: "line", src: "/site-art/sun.svg", w: 900, h: 900 },
] as const;

export type ArtId = (typeof SITE_ART)[number]["id"];

const ART_IDS = SITE_ART.map((a) => a.id) as [ArtId, ...ArtId[]];

export function artById(id: string | null | undefined) {
  return SITE_ART.find((a) => a.id === id) ?? null;
}

export const ART_PLACEMENTS = [
  { id: "sides", label: "Either side" },
  { id: "corners", label: "Corners" },
] as const;

/** The heroes artwork sits in: the photo is the picture in the others. */
export const ART_HEROES: readonly HeroLayoutId[] = ["text", "monogram", "framed", "poster"];

/** Colour families for the palette filter, in the order the chips show. */
export const COLOR_FAMILIES = [
  { id: "neutral", label: "White & ivory", dot: "#f3efe6" },
  { id: "green", label: "Green", dot: "#5e7f6c" },
  { id: "blue", label: "Blue", dot: "#3d5873" },
  { id: "pink", label: "Pink", dot: "#d9a3ab" },
  { id: "purple", label: "Purple", dot: "#7465a3" },
  { id: "red", label: "Burgundy", dot: "#6e1f2e" },
  { id: "orange", label: "Terracotta", dot: "#b5562f" },
  { id: "gold", label: "Gold & yellow", dot: "#c9a45c" },
  { id: "brown", label: "Brown", dot: "#7a5a3a" },
  { id: "black", label: "Black", dot: "#121212" },
] as const;

export type ColorFamily = (typeof COLOR_FAMILIES)[number]["id"];

/**
 * Ready-made colour schemes that sit on top of any theme: background, text,
 * headings, and the accent for buttons, links and the monogram. Each keeps
 * text at 7:1 on its background, headings at 4.5:1 and the accent at 4:1 or
 * better -- check a new one before adding it. Wedding palettes are the couple's own look,
 * not the app's, so they range wider than the brand colours.
 */
export const PALETTES = [
  // Light
  { id: "ivory-sage", name: "Ivory & sage", family: "green", bg: "#f7f4ec", ink: "#2f3b30", heading: "#3f5a40", accent: "#5f7f52" },
  { id: "eucalyptus", name: "Eucalyptus", family: "green", bg: "#eef2ee", ink: "#263328", heading: "#43604f", accent: "#4f6f5d" },
  { id: "olive-grove", name: "Olive grove", family: "green", bg: "#f4f1e6", ink: "#34361f", heading: "#565b2c", accent: "#6a6f33" },
  { id: "dusty-blue", name: "Dusty blue", family: "blue", bg: "#f1f4f7", ink: "#1f2b3a", heading: "#3d5873", accent: "#4f6d8f" },
  { id: "french-blue", name: "French blue", family: "blue", bg: "#fbfaf6", ink: "#172447", heading: "#24407f", accent: "#2243b6" },
  { id: "coastal", name: "Coastal", family: "blue", bg: "#eef5f6", ink: "#1d3640", heading: "#2f6170", accent: "#2f7484" },
  { id: "amalfi", name: "Amalfi lemon", family: "gold", bg: "#fff9df", ink: "#1b2a5c", heading: "#2243b6", accent: "#2243b6" },
  { id: "navy-gold", name: "Navy & gold", family: "blue", bg: "#fbf8f1", ink: "#141d33", heading: "#1f2c4f", accent: "#8a6a1f" },
  { id: "blush", name: "Blush", family: "pink", bg: "#fbf1ef", ink: "#45232a", heading: "#8a4553", accent: "#9d5562" },
  { id: "rose-quartz", name: "Rose quartz", family: "pink", bg: "#f8ecec", ink: "#4a2a32", heading: "#8f4f5f", accent: "#9b5767" },
  { id: "mauve", name: "Mauve", family: "purple", bg: "#f5eff2", ink: "#3c2a35", heading: "#6d4a5d", accent: "#7e566d" },
  { id: "lavender", name: "Lavender", family: "purple", bg: "#f4f2f8", ink: "#2d2840", heading: "#5a4d80", accent: "#665896" },
  { id: "terracotta", name: "Terracotta", family: "orange", bg: "#f6ece3", ink: "#3a2219", heading: "#94452b", accent: "#a5502d" },
  { id: "peach", name: "Peach", family: "orange", bg: "#fdf1ea", ink: "#45291f", heading: "#a5532f", accent: "#ad5735" },
  { id: "desert", name: "Desert sand", family: "brown", bg: "#f3ebdf", ink: "#3b2e22", heading: "#6f5233", accent: "#8a5f33" },
  { id: "tuscan", name: "Tuscan", family: "brown", bg: "#f4ede2", ink: "#33291c", heading: "#5f5029", accent: "#7a6127" },
  { id: "burgundy", name: "Burgundy", family: "red", bg: "#faf5f2", ink: "#2e1418", heading: "#6e1f2e", accent: "#8a2a3c" },
  { id: "marsala", name: "Marsala", family: "red", bg: "#f5ede8", ink: "#3a1d1d", heading: "#7b2d2d", accent: "#8f3f36" },
  { id: "marigold", name: "Marigold", family: "gold", bg: "#fdf6e7", ink: "#3a2a10", heading: "#7d5200", accent: "#8a5d00" },
  { id: "champagne", name: "Champagne", family: "gold", bg: "#faf6ef", ink: "#3a3226", heading: "#6f5b3b", accent: "#866a3a" },
  { id: "classic-white", name: "Classic white", family: "neutral", bg: "#ffffff", ink: "#1a1a1a", heading: "#1a1a1a", accent: "#5e5e5e" },
  { id: "ivory-black", name: "Ivory & ink", family: "neutral", bg: "#fbf9f4", ink: "#111111", heading: "#111111", accent: "#111111" },
  { id: "linen", name: "Linen", family: "neutral", bg: "#f2eee6", ink: "#2e2a24", heading: "#4a4237", accent: "#6b5f4c" },
  // Dark
  { id: "midnight-navy", name: "Midnight navy", family: "blue", bg: "#14203d", ink: "#f3ead8", heading: "#f3ead8", accent: "#e0b65a" },
  { id: "royal", name: "Royal", family: "blue", bg: "#1c2a6b", ink: "#fff7d6", heading: "#fff7d6", accent: "#ffd301" },
  { id: "slate", name: "Slate", family: "blue", bg: "#2a333d", ink: "#eef1f4", heading: "#eef1f4", accent: "#a9c1e0" },
  { id: "emerald", name: "Emerald", family: "green", bg: "#12352a", ink: "#f1ece0", heading: "#f1ece0", accent: "#d6b25e" },
  { id: "forest", name: "Forest", family: "green", bg: "#1f3d2b", ink: "#f4efe3", heading: "#f4efe3", accent: "#e6b8a2" },
  { id: "black-tie", name: "Black tie", family: "black", bg: "#121212", ink: "#f2eee6", heading: "#f2eee6", accent: "#c9a45c" },
  { id: "bordeaux", name: "Bordeaux", family: "red", bg: "#3a0f1b", ink: "#f6e9e4", heading: "#f6e9e4", accent: "#e3b3a0" },
  { id: "plum", name: "Plum", family: "purple", bg: "#2e1a33", ink: "#f2e9f2", heading: "#f2e9f2", accent: "#d7b2d8" },
  { id: "espresso", name: "Espresso", family: "brown", bg: "#2b1d16", ink: "#f3e9dc", heading: "#f3e9dc", accent: "#d9a066" },
] as const satisfies readonly {
  id: string;
  name: string;
  family: ColorFamily;
  bg: string;
  ink: string;
  heading: string;
  accent: string;
}[];

export type Palette = (typeof PALETTES)[number];

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

/** A custom block (site_blocks row) in the section list: "block:<uuid>". */
export type BlockKey = `block:${string}`;

/** Anything that can sit in the section list: a built-in section or a block. */
export type SectionKey = SectionId | BlockKey;

export const blockKey = (id: string): BlockKey => `block:${id}`;

export function blockIdOf(key: SectionKey): string | null {
  return key.startsWith("block:") ? key.slice("block:".length) : null;
}

/** Blocks are content to read, so on a computer they sit in the main column. */
export function sectionColumn(key: SectionKey): "main" | "side" {
  return SITE_SECTIONS.find((x) => x.id === key)?.column ?? "main";
}

const BLOCK_KEY = /^block:[0-9a-f-]{36}$/;

const sectionKeySchema = z.union([
  z.enum(SECTION_IDS),
  z.string().regex(BLOCK_KEY).transform((k) => k as BlockKey),
]);

const DEFAULT_SECTIONS = SITE_SECTIONS.map((x) => ({ id: x.id as SectionKey, hidden: false }));

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

export const OPENINGS = [
  { id: "none", label: "Straight in", help: "The page is simply there." },
  { id: "envelope", label: "Envelope opens", help: "An envelope with your initials unseals first." },
  { id: "write", label: "Names write in", help: "Your names appear as if handwritten." },
  { id: "reveal", label: "Photo reveal", help: "Your photo opens out from the centre." },
] as const;

const motionSchema = z.object({
  opening: z.enum(["none", "envelope", "write", "reveal"]).catch("none"),
  scroll: z.enum(["none", "fade", "slide", "zoom"]).catch("fade"),
  photo: z.enum(["still", "zoom"]).catch("zoom"),
  petals: z.boolean().catch(false),
  ticking: z.boolean().catch(true),
  confetti: z.boolean().catch(false),
  speed: z.enum(["slow", "normal", "fast"]).catch("normal"),
});

export type Motion = z.infer<typeof motionSchema>;

/**
 * The Motion tab's "Overall" choices. Each fills in every setting; changing
 * one afterwards makes it "Custom" -- worked out by comparing, not stored, so
 * it can never disagree with the settings. Subtle is what the site did
 * before there was a Motion tab.
 */
export const MOTION_PRESETS = {
  none: { opening: "none", scroll: "none", photo: "still", petals: false, ticking: false, confetti: false, speed: "normal" },
  subtle: { opening: "none", scroll: "fade", photo: "zoom", petals: false, ticking: true, confetti: false, speed: "normal" },
  lively: { opening: "envelope", scroll: "zoom", photo: "zoom", petals: true, ticking: true, confetti: true, speed: "normal" },
} as const satisfies Record<string, Motion>;

export type MotionPreset = keyof typeof MOTION_PRESETS | "custom";

export function motionPreset(motion: Motion): MotionPreset {
  const match = (Object.keys(MOTION_PRESETS) as (keyof typeof MOTION_PRESETS)[]).find((key) =>
    (Object.keys(motion) as (keyof Motion)[]).every(
      (k) => k === "speed" || motion[k] === MOTION_PRESETS[key][k],
    ),
  );
  return match ?? "custom";
}

/** Multiplies every duration. */
export const MOTION_SPEED = { slow: 1.5, normal: 1, fast: 0.6 } as const;

/**
 * The words on the guest site a couple can click in the editor's preview to
 * restyle, and (where `words` is true) retype. The rest come from their
 * wedding details -- names, a guest count -- so only their look changes here.
 */
export const TEXT_SLOTS = [
  { id: "hero.kicker", label: "Invitation line", words: true },
  { id: "hero.names", label: "Your names", words: false },
  { id: "rsvp.title", label: "RSVP heading", words: true },
  { id: "photos.title", label: "Photos heading", words: true },
  { id: "weekend.title", label: "Schedule heading", words: true },
  { id: "wall.title", label: "Photo wall heading", words: true },
  { id: "guests.title", label: "Who's coming heading", words: false },
  { id: "travel.title", label: "Travel heading", words: true },
  { id: "faq.title", label: "FAQ heading", words: true },
  { id: "registry.title", label: "Registry heading", words: true },
] as const;

export type TextSlotId = (typeof TEXT_SLOTS)[number]["id"];

const TEXT_SLOT_IDS = new Set<string>(TEXT_SLOTS.map((s) => s.id));

/** Size steps for the toolbar's − and +, as a multiple of the slot's own size. */
export const TEXT_SIZES = [0.625, 0.75, 0.875, 1, 1.125, 1.25, 1.5, 1.75, 2] as const;

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

export const EMPTY_TEXT_STYLE: TextStyle = {
  text: null,
  font: null,
  size: null,
  color: null,
  align: null,
  bold: null,
  italic: null,
};

export function hasTextStyle(style: TextStyle | undefined) {
  return !!style && Object.values(style).some((v) => v !== null && v !== "");
}

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
});

export type SiteDesign = z.infer<typeof siteDesignSchema>;

export const DEFAULT_SITE_DESIGN: SiteDesign = {
  theme: DEFAULT_THEME_ID,
  accent: null,
  fonts: "theme",
  fontDisplay: null,
  fontBody: null,
  colors: { bg: null, ink: null, heading: null },
  ornament: "rule",
  art: { id: null, placement: "sides" },
  hero: "full",
  scene: null,
  pageStyle: "cards",
  occasion: { kind: "wedding", since: null },
  sections: DEFAULT_SECTIONS,
  motion: MOTION_PRESETS.subtle,
  text: {},
  canvas: EMPTY_CANVAS,
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

function mix(a: string, b: string, t: number) {
  const ch = (hex: string, i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
  return `#${[0, 1, 2]
    .map((i) => Math.round(ch(a, i) * (1 - t) + ch(b, i) * t).toString(16).padStart(2, "0"))
    .join("")}`;
}

export function isDark(hex: string) {
  return luminance(hex) < 0.2;
}

export type ResolvedDesign = {
  theme: SiteTheme;
  accent: string;
  /** Text on an accent button: the theme's own choice unless a custom accent makes it unreadable. */
  onAccent: string;
  /** The darker of ink and background: a scrim over a photo has to be dark on every theme. */
  scrim: string;
  heading: string;
  /** The heading face is a script: names aren't slanted or set in capitals. */
  scriptNames: boolean;
  /** The scene drawn at the top: the design's own choice, else the theme's. */
  scene: SceneId;
  /** The tint behind every other band in the storybook page style. */
  band: string;
  /** A second colour from the theme, for skies and far hills in the scenes. */
  accent2: string;
};

export function resolveDesign(design: SiteDesign): ResolvedDesign {
  const base = themeById(design.theme);
  const pairing = FONT_PAIRINGS.find((f) => f.id === design.fonts);
  const display = fontById(design.fontDisplay ?? pairing?.display)?.css ?? base.display;
  const body = fontById(design.fontBody ?? pairing?.body)?.css ?? base.body;

  // A custom background brings its own card, muted text and photo fill, mixed
  // from it so every theme's surfaces still sit right on it.
  const { bg: cBg, ink: cInk, heading: cHeading } = design.colors;
  const bg = cBg ?? base.bg;
  const ink = cInk ?? base.ink;
  const dark = isDark(bg);
  const theme: SiteTheme = {
    ...base,
    display,
    body,
    bg,
    ink,
    surface: cBg ? (dark ? mix(bg, "#ffffff", 0.06) : mix(bg, "#ffffff", 0.6)) : base.surface,
    muted: cBg || cInk ? mix(ink, bg, 0.28) : base.muted,
    photo: cBg ? mix(bg, ink, 0.12) : base.photo,
  };
  const scriptNames = fontByCss(display)?.kind === "script";
  if (scriptNames) theme.italicNames = false;

  const accent = design.accent ?? theme.swatches[0];
  // A second colour for skies and far hills: the next swatch after the accent.
  const at = theme.swatches.indexOf(accent as never);
  const accent2 = theme.swatches[(at + 1) % theme.swatches.length];
  const onAccent =
    contrast(theme.buttonInk, accent) >= 4.5
      ? theme.buttonInk
      : [theme.buttonInk, "#ffffff", theme.ink, theme.bg, "#111111"].reduce((best, c) =>
          contrast(c, accent) > contrast(best, accent) ? c : best,
        );
  const scrim = luminance(theme.ink) < luminance(theme.bg) ? theme.ink : theme.bg;
  const heading = cHeading ?? (cInk ? ink : theme.ink);
  const scene = design.scene ?? base.scene ?? "none";
  const band = mix(theme.bg, accent, dark ? 0.16 : 0.09);
  return { theme, accent, accent2, onAccent, scrim, heading, scriptNames, scene, band };
}

/** The palette these settings match exactly, if any -- worked out, not stored. */
export function activePalette(design: SiteDesign) {
  return (
    PALETTES.find(
      (p) =>
        design.colors.bg === p.bg &&
        design.colors.ink === p.ink &&
        design.colors.heading === p.heading &&
        design.accent === p.accent,
    ) ?? null
  );
}

export function paletteColors(p: Palette): Pick<SiteDesign, "colors" | "accent"> {
  return { colors: { bg: p.bg, ink: p.ink, heading: p.heading }, accent: p.accent };
}

/**
 * The CSS custom properties that restyle the guest site. The site is written
 * against the app's semantic colour names, so overriding those on a wrapper
 * rethemes every card, heading and label under it; the `.guest-site` rules in
 * globals.css handle the few places where one app colour plays two roles.
 */
export function designCssVars(design: SiteDesign): Record<string, string> {
  const { theme, accent, accent2, onAccent, scrim, heading, scriptNames, band } = resolveDesign(design);
  return {
    "--color-parchment": theme.bg,
    "--color-card": theme.surface,
    "--color-ink": theme.ink,
    "--color-hairline": `color-mix(in srgb, ${theme.ink} 14%, transparent)`,
    // Headings use `forest`; in the mockup they're in the theme's ink.
    "--color-forest": heading,
    // Small uppercase labels use `brass`; in the mockup they're the accent.
    "--color-brass": accent,
    // A script face is for the names and monogram; set as section headings
    // ("RSVP", "Travel") it reads as a scrawl, so those take the body face.
    "--font-display": scriptNames ? theme.body : theme.display,
    "--font-names": theme.display,
    "--font-body": theme.body,
    "--site-accent": accent,
    "--site-on-accent": onAccent,
    "--site-muted": theme.muted,
    "--site-photo": theme.photo,
    "--site-band": band,
    "--site-accent-2": accent2,
    "--site-scrim": scrim,
    "--site-radius": theme.radius,
    "--site-name-style": theme.italicNames ? "italic" : "normal",
    "--site-name-weight": String(theme.nameWeight),
    // Native controls -- checkboxes, select menus, scrollbars -- in the theme's light or dark.
    "--site-scheme": luminance(theme.bg) < 0.2 ? "dark" : "light",
    "--motion-speed": String(MOTION_SPEED[design.motion.speed]),
  };
}

/**
 * The Google Fonts stylesheet for some themes -- one theme on the live site,
 * all of them in the editor. Loaded as a stylesheet rather than through
 * next/font so the app's other pages don't preload families they never use,
 * and so the build doesn't fetch them either (see CLAUDE.md on font fetches
 * failing Cloudflare builds).
 */
export function fontsHref(themes: readonly Pick<SiteTheme, "display" | "body">[]) {
  return fontsHrefFor(themes.flatMap((t) => [t.display, t.body]));
}

/** The stylesheet for some font-family values (unknown ones are skipped). */
export function fontsHrefFor(css: readonly string[]) {
  const families = [...new Set(css)].map((c) => fontByCss(c)?.google).filter(Boolean);
  return `https://fonts.googleapis.com/css2?${families.map((f) => `family=${f}`).join("&")}&display=swap`;
}

/** The live site's stylesheet: the theme's faces plus any picked for a single slot. */
export function siteFontsHref(design: SiteDesign) {
  const { theme } = resolveDesign(design);
  const picked = [
    ...Object.values(design.text).flatMap((s) => (s?.font ? [s.font] : [])),
    ...canvasFontIds(design.canvas),
  ].map((id) => fontById(id)?.css ?? "");
  return fontsHrefFor([theme.display, theme.body, ...picked]);
}

/** A slot's own look over its usual one. Size is applied separately, relative to the slot's size. */
export function textSlotCss(style: TextStyle | undefined): Record<string, string> {
  if (!style) return {};
  const css: Record<string, string> = {};
  const font = fontById(style.font);
  if (font) css.fontFamily = font.css;
  if (style.color) css.color = style.color;
  if (style.align) css.textAlign = style.align;
  if (style.bold !== null) css.fontWeight = style.bold ? "700" : "400";
  if (style.italic !== null) css.fontStyle = style.italic ? "italic" : "normal";
  return css;
}

/** Every face in the library, for the editor, where any can be picked. */
export const ALL_FONTS_HREF = fontsHrefFor(FONTS.map((f) => f.css));
