import { z } from "zod";
import { TEMPLATES, newCard, templateById } from "./templates";
import type { CardDoc } from "./types";

/**
 * What a saved card may hold. Everything the couple types is capped, colours
 * are hex, and a photo is our own storage or an https URL, so a stored card
 * can't carry anything odd into the guest's page.
 */

/** A partner saved the card on another device since this one loaded it. */
export const STALE_CARD = "Your card was changed on another device. Reload to see the latest before editing.";

const id = z.string().min(1).max(40);
const hex = z.string().regex(/^#[0-9a-f]{6}$/i);

const content = z.object({
  nameA: z.string().max(60),
  nameB: z.string().max(60),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
  dateText: z.string().max(60),
  place: z.string().max(140),
  note: z.string().max(120),
  headline: z.string().max(80),
});

const photo = z
  .object({
    url: z
      .string()
      .max(1000)
      .refine((u) => u.startsWith("https://") || /^\/[a-z0-9]/i.test(u), "photo url"),
    aspect: z.number().positive().max(10),
    fx: z.number().min(0).max(100),
    fy: z.number().min(0).max(100),
    zoom: z.number().min(1).max(4),
    filter: z.enum(["none", "mono", "warm"]),
  })
  .nullable();

const override = z.object({
  dx: z.number().min(-2000).max(2000).optional(),
  dy: z.number().min(-2000).max(2000).optional(),
  scale: z.number().min(0.2).max(4).optional(),
  hidden: z.boolean().optional(),
  font: id.optional(),
  color: hex.optional(),
  text: z.string().max(200).optional(),
  tracking: z.number().min(-0.1).max(1).optional(),
  upper: z.boolean().optional(),
  italic: z.boolean().optional(),
  bold: z.boolean().optional(),
});

export const cardDocSchema = z.object({
  template: id,
  palette: id,
  fonts: id,
  content,
  photo,
  overrides: z.record(id, override).refine((o) => Object.keys(o).length <= 60, "too many overrides"),
});

/** A stored card as the editor opens it; anything unreadable becomes null. */
export function parseCardDoc(raw: unknown): CardDoc | null {
  const parsed = cardDocSchema.safeParse(raw);
  if (!parsed.success) return null;
  const doc = parsed.data as CardDoc;
  // A template retired since the card was saved: keep their words and photo on the first one.
  if (!TEMPLATES.some((t) => t.id === doc.template)) return newCard(TEMPLATES[0].id, doc.content, doc.photo, false);
  const t = templateById(doc.template);
  return {
    ...doc,
    palette: t.palettes.some((p) => p.id === doc.palette) ? doc.palette : t.palettes[0].id,
    fonts: t.pairings.some((p) => p.id === doc.fonts) ? doc.fonts : t.pairings[0].id,
  };
}
