import { FONTS, fontById, fontsHrefFor } from "@/lib/site-design";
import { TEMPLATES } from "./templates";

const STUDIO_FONTS = [
  ...new Set([
    ...TEMPLATES.flatMap((t) => t.pairings.flatMap((p) => [p.display, p.script, p.sans])),
    ...FONTS.map((f) => f.id),
  ]),
];
/** Every face a card can show, as one Google Fonts stylesheet. */
export const FONTS_HREF = fontsHrefFor(STUDIO_FONTS.map((id) => fontById(id)?.css ?? ""));
