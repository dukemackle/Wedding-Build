import type { VenueArtStyle } from "@/lib/supabase/types";

/**
 * Venue art: the prompts the admin "Venue art" page copies for ChatGPT.
 * This file is the source of truth; docs/site-art-prompts.md ("Venue art")
 * explains the process and points here. Keep each style line word for word
 * so every venue in a style looks like one artist's set.
 */

export const VENUE_ART_BUCKET = "venue-art";

export const VENUE_ART_RULES = `Turn the attached photograph into an original painting of this exact place. Trace the scene faithfully: the same architecture, arches, trees, water, hills and layout, in the same positions and proportions. Add nothing that isn't in the photo and remove nothing important. Leave out any people, cars, signs, chairs stacked to the side and other clutter. Fill the whole canvas (not transparent). Keep the upper third calm and light (sky, soft wash or plain paper) so names and a date can sit there. No text, no lettering, no signature, no watermark, no border or frame. Elegant, high-end wedding stationery quality. Original art, not in the style of any named living artist.`;

export type VenueArtStyleDef = {
  id: VenueArtStyle;
  label: string;
  /** Templates it suits; shown so a style is never paired with the wrong one. */
  suits: string;
  /** Null while planned: the style can't be picked until its line is written. */
  line: string | null;
};

export const VENUE_ART_STYLES: VenueArtStyleDef[] = [
  {
    id: "watercolour",
    label: "Watercolour",
    suits: "Heirloom, Golden Hour, Riviera",
    line: "Loose, luminous watercolour on white paper. Soft wet edges, gentle blooms of colour, light pencil underdrawing showing in places, generous white paper left unpainted toward the edges. Natural, slightly muted colours true to the photo.",
  },
  {
    id: "engraving",
    label: "Engraving",
    suits: "Heirloom, Classic, Editorial",
    line: "A fine vintage steel engraving, like a 19th-century book plate. Black ink only, crisp cross-hatching and stippling for shade, clean white paper, no colour. Detailed but airy.",
  },
  { id: "pen-and-wash", label: "Pen and wash", suits: "Homestead", line: null },
  { id: "gouache", label: "Gouache", suits: "Riviera", line: null },
  { id: "papercut", label: "Papercut", suits: "Any template with a scene", line: null },
];

export function venueArtStyle(id: string): VenueArtStyleDef | undefined {
  return VENUE_ART_STYLES.find((s) => s.id === id);
}

/** First message: rules, style, then the wide size. */
export function wideArtPrompt(style: VenueArtStyleDef): string {
  return `${VENUE_ART_RULES}\n\nStyle: ${style.line}\n\nSize: wide, 1536×1024 (landscape), for a desktop guest site.`;
}

/** Follow-up in the same chat. */
export const TALL_ART_PROMPT =
  "Same painting, same style, now as a tall 1024×1536 version for phones; recompose, don't stretch. Keep every rule from before.";

/** `venue-<slug>-<style>-wide.png`, as the docs name them. */
export function venueArtFileName(slug: string, style: VenueArtStyle, size: "wide" | "tall", ext = "png"): string {
  return `venue-${slug}-${style}-${size}.${ext}`;
}

export const VENUE_ART_MAX_BYTES = 20 * 1024 * 1024;
export const VENUE_ART_TYPES = ["image/png", "image/webp", "image/jpeg"];
