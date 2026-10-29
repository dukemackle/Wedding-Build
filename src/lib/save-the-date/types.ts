/**
 * The Save the Date Studio's card model.
 *
 * A card is drawn on a fixed 5x7 artboard (1000 x 1400 units) as SVG, so the
 * same drawing is the gallery thumbnail, the editor canvas, the guest's
 * reveal and the exported PNG/PDF -- one renderer, never a flattened image.
 * A template is a list of layers bound to the couple's details; the couple's
 * card is the template plus their content, colours, fonts and per-layer
 * overrides, so switching templates keeps everything they typed.
 */

export const ARTBOARD = { w: 1000, h: 1400 } as const;

/** Colour roles. Templates only ever name a role, so every colourway works. */
export type ColorRole = "paper" | "ink" | "accent" | "muted" | "onPhoto";
export type Palette = Record<ColorRole, string> & {
  id: string;
  label: string;
  /** Light, mid, dark: the accent painted as foil instead of flat ink. */
  metal?: [string, string, string];
};

/** Font roles, filled from a template's pairings with ids from FONTS in site-design. */
export type FontRole = "display" | "script" | "sans";
export type FontPairing = Record<FontRole, string> & { id: string; label: string };

export type CardContent = {
  nameA: string;
  nameB: string;
  /** ISO date (yyyy-mm-dd), or null while the couple only knows the season. */
  date: string | null;
  /** Replaces the formatted date, e.g. "Summer 2028" or "12–14 June 2028". */
  dateText: string;
  place: string;
  /** The small closing line. */
  note: string;
  headline: string;
};

export type Photo = {
  url: string;
  /** Width / height of the picture itself. */
  aspect: number;
  /** Focal point in % and zoom (1 = cover). */
  fx: number;
  fy: number;
  zoom: number;
  filter: "none" | "mono" | "warm";
};

/** What the couple can change on any single layer in Advanced mode. */
export type LayerOverride = {
  dx?: number;
  dy?: number;
  scale?: number;
  hidden?: boolean;
  font?: string;
  color?: string;
};

export type CardDoc = {
  template: string;
  palette: string;
  fonts: string;
  content: CardContent;
  photo: Photo | null;
  overrides: Record<string, LayerOverride>;
};

type Base = { id: string; label: string; rotate?: number };

export type TextBind = "headline" | "names" | "nameA" | "nameB" | "date" | "place" | "note" | "monogram" | "custom";

export type TextLayer = Base & {
  kind: "text";
  bind: TextBind;
  /** For "custom", or a fixed line like "&". `\n` breaks lines. */
  text?: string;
  x: number;
  y: number;
  size: number;
  font: FontRole;
  color: ColorRole;
  anchor?: "start" | "middle" | "end";
  /** Letter-spacing in em. */
  tracking?: number;
  upper?: boolean;
  italic?: boolean;
  weight?: number;
  lineHeight?: number;
  /** Long names shrink to fit this width instead of running off the card. */
  maxWidth: number;
  /** How the date reads on this template. */
  dateStyle?: DateStyle;
  /** "names" joins with this (default " & "). */
  joiner?: string;
  /** A soft shadow for type over photos. */
  shadow?: boolean;
  opacity?: number;
};

export type PhotoLayer = Base & {
  kind: "photo";
  x: number;
  y: number;
  w: number;
  h: number;
  shape: "rect" | "arch" | "oval";
  /** Darkening for type to sit on: which edges, 0-1. */
  scrim?: { top?: number; bottom?: number; left?: number };
};

export type ArtLayer = Base & {
  kind: "art";
  /** A key of ART in art.tsx. */
  art: string;
  /** Top-left corner; turns about its centre. */
  x: number;
  y: number;
  w: number;
  color?: ColorRole;
  flip?: boolean;
  opacity?: number;
};

export type Layer = TextLayer | PhotoLayer | ArtLayer;

export type DateStyle = "long" | "dots" | "weekday" | "words";

export type Template = {
  id: string;
  name: string;
  family: string;
  /** One line for the gallery. */
  mood: string;
  palettes: Palette[];
  pairings: FontPairing[];
  /** Paper texture drawn under everything. */
  grain?: number;
  usesPhoto: boolean;
  samplePhoto?: Photo;
  layers: Layer[];
  /** Layers drawn when there's no photo (photo templates still look designed). */
  noPhotoLayers?: Layer[];
};
