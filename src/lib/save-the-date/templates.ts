import type { CardContent, CardDoc, Template } from "./types";

/**
 * The template library. Prototype set: three directions chosen to prove the
 * engine across its three kinds of artwork -- a full-bleed photograph
 * (Editorial), painted botanicals (Heirloom Garden) and recolourable line art
 * (Midnight Arch). Each has its own composition, not a recolour of another.
 */

export const TEMPLATES: Template[] = [
  {
    id: "editorial",
    name: "Editorial",
    family: "Editorial luxury",
    mood: "A magazine cover: your photo, full bleed, oversized type.",
    usesPhoto: true,
    samplePhoto: { url: "/landing/hero-couple-2000.webp", aspect: 2000 / 1336, fx: 47, fy: 60, zoom: 1, filter: "mono" },
    palettes: [
      { id: "noir", label: "Noir", paper: "#141414", ink: "#ffffff", accent: "#ffffff", muted: "#d6d6d6", onPhoto: "#ffffff" },
      { id: "sunwashed", label: "Sunwashed", paper: "#2b2119", ink: "#fff4e2", accent: "#fff4e2", muted: "#ecdcc4", onPhoto: "#fff4e2" },
      { id: "gilt", label: "Gilt", paper: "#1b1a17", ink: "#f3dc9a", accent: "#f3dc9a", muted: "#e9dcb8", onPhoto: "#f3dc9a" },
    ],
    pairings: [
      { id: "didone", label: "Didone", display: "bodoni", script: "bodoni", sans: "jost" },
      { id: "hairline", label: "Hairline", display: "italiana", script: "italiana", sans: "montserrat" },
      { id: "ink", label: "Ink", display: "gloock", script: "gloock", sans: "karla" },
    ],
    layers: [
      { kind: "photo", id: "photo", label: "Photo", x: 0, y: 0, w: 1000, h: 1400, shape: "rect", scrim: { top: 0.55, bottom: 0.75 } },
      { kind: "text", id: "headline", label: "Headline", bind: "headline", text: "Save\nthe\nDate", x: 54, y: 236, size: 214, lineHeight: 0.93, font: "display", color: "onPhoto", upper: true, tracking: -0.02, maxWidth: 900 },
      { kind: "text", id: "folio", label: "Side line", bind: "date", dateStyle: "dots", x: 950, y: 120, rotate: 90, size: 19, font: "sans", color: "onPhoto", upper: true, tracking: 0.42, maxWidth: 700, opacity: 0.8 },
      { kind: "text", id: "names", label: "Names", bind: "names", x: 58, y: 1078, size: 84, font: "display", italic: true, color: "onPhoto", maxWidth: 880, shadow: true },
      { kind: "art", id: "rule", label: "Rule", art: "rule", x: 58, y: 1122, w: 96, color: "onPhoto", opacity: 0.85 },
      { kind: "text", id: "date", label: "Date", bind: "date", dateStyle: "weekday", x: 58, y: 1192, size: 27, font: "sans", color: "onPhoto", upper: true, tracking: 0.26, maxWidth: 880 },
      { kind: "text", id: "place", label: "Place", bind: "place", x: 58, y: 1238, size: 22, font: "sans", color: "onPhoto", upper: true, tracking: 0.3, maxWidth: 880, opacity: 0.82 },
      { kind: "text", id: "note", label: "Closing line", bind: "note", x: 58, y: 1334, size: 16, font: "sans", color: "onPhoto", upper: true, tracking: 0.34, maxWidth: 880, opacity: 0.7 },
    ],
  },
  {
    id: "heirloom",
    name: "Heirloom Garden",
    family: "Romantic florals",
    mood: "Hand-painted antique botanicals around a scalloped frame.",
    usesPhoto: false,
    grain: 0.05,
    palettes: [
      { id: "rosewood", label: "Rosewood", paper: "#fbf6ef", ink: "#5a3431", accent: "#7f8d63", muted: "#8f6e66", onPhoto: "#ffffff" },
      { id: "sage", label: "Sage", paper: "#f6f5ee", ink: "#3c4a39", accent: "#a2765f", muted: "#6c7766", onPhoto: "#ffffff" },
      { id: "blush", label: "Blush", paper: "#fbefeb", ink: "#6d2f3a", accent: "#c38a85", muted: "#94656a", onPhoto: "#ffffff" },
    ],
    pairings: [
      { id: "garamond", label: "Garamond & script", display: "cormorant", script: "pinyon", sans: "jost" },
      { id: "letterpress", label: "Letterpress", display: "ebgaramond", script: "saintdelafield", sans: "josefin" },
      { id: "romance", label: "Modern romance", display: "playfair", script: "greatvibes", sans: "montserrat" },
    ],
    layers: [
      { kind: "art", id: "frame", label: "Scalloped frame", art: "scallopFrame", x: 45, y: 45, w: 910, color: "accent", opacity: 0.55 },
      { kind: "art", id: "sweetpea", label: "Sweet pea", art: "sweetPea", x: 300, y: -40, w: 260, rotate: -64 },
      { kind: "art", id: "roses", label: "Roses", art: "roses", x: -60, y: -80, w: 380, rotate: -22 },
      { kind: "art", id: "peony", label: "Peony", art: "peony", x: 650, y: -70, w: 400, rotate: 18 },
      { kind: "art", id: "roses2", label: "Roses (lower)", art: "roses", x: 745, y: 1105, w: 300, rotate: -24 },
      { kind: "art", id: "myrtle", label: "Myrtle", art: "myrtle", x: -20, y: 1060, w: 240, rotate: 28, flip: true },
      { kind: "text", id: "headline", label: "Headline", bind: "headline", text: "Save the Date", x: 500, y: 520, size: 30, font: "sans", color: "accent", upper: true, tracking: 0.46, anchor: "middle", maxWidth: 640 },
      { kind: "text", id: "nameA", label: "First name", bind: "nameA", x: 500, y: 690, size: 138, font: "script", color: "ink", anchor: "middle", maxWidth: 720 },
      { kind: "text", id: "amp", label: "Ampersand", bind: "custom", text: "and", x: 500, y: 770, size: 40, font: "display", italic: true, color: "accent", anchor: "middle", maxWidth: 200 },
      { kind: "text", id: "nameB", label: "Second name", bind: "nameB", x: 500, y: 890, size: 138, font: "script", color: "ink", anchor: "middle", maxWidth: 720 },
      { kind: "art", id: "divider", label: "Divider", art: "diamondRule", x: 400, y: 950, w: 200, color: "accent" },
      { kind: "text", id: "date", label: "Date", bind: "date", dateStyle: "words", x: 500, y: 1030, size: 30, lineHeight: 1.5, font: "display", color: "ink", upper: true, tracking: 0.14, anchor: "middle", maxWidth: 520 },
      { kind: "text", id: "place", label: "Place", bind: "place", x: 500, y: 1150, size: 34, font: "display", italic: true, color: "muted", anchor: "middle", maxWidth: 500 },
      { kind: "text", id: "note", label: "Closing line", bind: "note", x: 500, y: 1272, size: 15, font: "sans", color: "muted", upper: true, tracking: 0.36, anchor: "middle", maxWidth: 400 },
    ],
  },
  {
    id: "midnight",
    name: "Midnight Arch",
    family: "Celestial & black tie",
    mood: "Gold line work on a night sky: an arch, a crescent, a moonlit sea.",
    usesPhoto: false,
    grain: 0.06,
    palettes: [
      { id: "midnight", label: "Midnight & gold", paper: "#0e1830", ink: "#f4ead0", accent: "#d8b45c", muted: "#a8b2c8", onPhoto: "#ffffff", metal: ["#f7e3a1", "#d8b45c", "#a37a2c"] },
      { id: "onyx", label: "Onyx & silver", paper: "#121214", ink: "#f2f2ef", accent: "#c9ccd2", muted: "#9a9ca3", onPhoto: "#ffffff", metal: ["#f5f6f8", "#c3c7ce", "#8a8f99"] },
      { id: "royal", label: "Royal & champagne", paper: "#1d2f6f", ink: "#fbf3df", accent: "#ead39a", muted: "#b9c3e4", onPhoto: "#ffffff", metal: ["#fff1c4", "#e6cd8e", "#b9965a"] },
    ],
    pairings: [
      { id: "roman", label: "Roman capitals", display: "cinzel", script: "cormorant", sans: "jost" },
      { id: "deco", label: "Deco", display: "italiana", script: "italiana", sans: "josefin" },
      { id: "classic", label: "Classic", display: "cormorant", script: "cormorant", sans: "montserrat" },
    ],
    layers: [
      { kind: "art", id: "arch", label: "Arch", art: "archFrame", x: 80, y: 90, w: 840, color: "accent" },
      { kind: "art", id: "stars", label: "Stars", art: "starfield", x: 120, y: 150, w: 760, color: "accent" },
      { kind: "art", id: "moon", label: "Moon", art: "moon", x: 470, y: 176, w: 60, color: "accent", rotate: -20 },
      { kind: "text", id: "headline", label: "Headline", bind: "headline", text: "Save\nthe Date", x: 500, y: 410, size: 82, lineHeight: 1.12, font: "display", color: "ink", upper: true, tracking: 0.1, anchor: "middle", maxWidth: 640 },
      { kind: "art", id: "divider", label: "Divider", art: "diamondRule", x: 410, y: 562, w: 180, color: "accent" },
      { kind: "text", id: "names", label: "Names", bind: "names", x: 500, y: 668, size: 40, font: "sans", color: "accent", upper: true, tracking: 0.32, anchor: "middle", maxWidth: 640 },
      { kind: "text", id: "date", label: "Date", bind: "date", dateStyle: "long", x: 500, y: 790, size: 46, font: "script", italic: true, color: "ink", anchor: "middle", maxWidth: 620 },
      { kind: "text", id: "place", label: "Place", bind: "place", x: 500, y: 856, size: 20, font: "sans", color: "muted", upper: true, tracking: 0.38, anchor: "middle", maxWidth: 600 },
      { kind: "art", id: "sea", label: "Moonlit sea", art: "seaHorizon", x: 150, y: 960, w: 700, color: "accent" },
      { kind: "text", id: "note", label: "Closing line", bind: "note", x: 500, y: 1262, size: 15, font: "sans", color: "muted", upper: true, tracking: 0.38, anchor: "middle", maxWidth: 560 },
    ],
  },
];

export function templateById(id: string): Template {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}

export const SAMPLE_CONTENT: CardContent = {
  nameA: "Alex",
  nameB: "Jordan",
  date: "2028-06-12",
  dateText: "",
  place: "Santa Barbara, California",
  note: "Formal invitation to follow",
  headline: "",
};

/** A fresh card on a template, keeping whatever the couple already typed. */
export function newCard(templateId: string, content = SAMPLE_CONTENT, photo: CardDoc["photo"] = null): CardDoc {
  const t = templateById(templateId);
  return {
    template: t.id,
    palette: t.palettes[0].id,
    fonts: t.pairings[0].id,
    content,
    photo: photo ?? t.samplePhoto ?? null,
    overrides: {},
  };
}
