import { z } from "zod";
import { EMPTY_TEXT_STYLE, TEXT_SLOTS, type SiteDesign, type TextSlotId } from "./site-design";

/**
 * Several designs per wedding (supabase/migrations/0111_site_designs.sql).
 *
 * "Shared wording" is the words in the page's headings -- the design's text
 * slots. A design that shares them reads them from weddings.site_wording when
 * it opens and writes them back when it saves; a design that doesn't keeps
 * its own. Fonts, sizes and colours on those words stay with each design.
 */

/** Plenty to compare a few looks; enough of a cap that the list stays a list. */
export const MAX_DESIGNS = 10;

export type Wording = Partial<Record<TextSlotId, string>>;

const SLOT_IDS = new Set<string>(TEXT_SLOTS.map((s) => s.id));

export function parseWording(value: unknown): Wording {
  const parsed = z.record(z.string(), z.string().trim().max(120)).safeParse(value);
  if (!parsed.success) return {};
  return Object.fromEntries(Object.entries(parsed.data).filter(([id, text]) => SLOT_IDS.has(id) && text)) as Wording;
}

/** The words a design has typed into its headings. */
export function wordingOf(design: SiteDesign): Wording {
  return Object.fromEntries(
    Object.entries(design.text).flatMap(([slot, style]) => (style?.text ? [[slot, style.text]] : [])),
  ) as Wording;
}

/** The design with exactly these words in its headings; each slot's styling is kept. */
export function withWording(design: SiteDesign, wording: Wording): SiteDesign {
  const text: SiteDesign["text"] = {};
  for (const { id } of TEXT_SLOTS) {
    const style = design.text[id];
    const words = wording[id] ?? null;
    const next = { ...EMPTY_TEXT_STYLE, ...style, text: words };
    if (Object.values(next).some((v) => v !== null)) text[id] = next;
  }
  return { ...design, text };
}

/** "Lemon Grove", or "Lemon Grove 2" when that name is taken. */
export function uniqueName(name: string, taken: string[]) {
  const names = new Set(taken.map((n) => n.toLowerCase()));
  if (!names.has(name.toLowerCase())) return name;
  for (let i = 2; ; i++) {
    const next = `${name} ${i}`;
    if (!names.has(next.toLowerCase())) return next;
  }
}

/** A save refused because the design moved on elsewhere (actions.ts, store). */
export const STALE_DESIGN =
  "Your partner (or another device) changed this design since you opened it, so this change wasn't saved. Reload to see theirs, then carry on.";
