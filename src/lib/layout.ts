/**
 * The widths a page is allowed to be.
 *
 * Before this there were eight different `max-w-*` caps across the app, chosen
 * per component, with the nav capped wider than most of the content beneath
 * it. That mismatch is what made a wide screen look unfinished: the bar spans
 * 1152px, the page under it stops at 768px, and the eye reads the difference
 * as something missing rather than as margin.
 *
 * Three widths, and a rule for which to use. `WIDE` matches the nav's own cap
 * deliberately -- a page wider than the bar above it looks just as wrong as
 * one much narrower.
 */

/**
 * Long-form text and short forms. Capped near 70 characters a line, because
 * past that the eye loses its place returning to the left margin -- which is
 * why this stays narrow even on a huge screen rather than filling it.
 *
 * Legal pages, help, single-column forms like account and the estimate.
 *
 * Not the auth screens: those are a small centred card, sized like the
 * empty-state cards rather than like a page.
 */
export const READING_WIDTH = "max-w-2xl";

/**
 * The default. Enough for two columns of cards without becoming a spreadsheet.
 *
 * Most pages.
 */
export const STANDARD_WIDTH = "max-w-4xl";

/**
 * Pages whose content is genuinely wide: tables with many columns, or a list
 * beside a detail panel.
 *
 * Budget, checklist.
 */
export const WIDE_WIDTH = "max-w-6xl";

/**
 * A tool that needs more room than the nav: a schedule seven days across, a
 * floor plan you arrange furniture on. These are the only pages allowed past
 * WIDE, and the nav stretches to match rather than floating above them as a
 * short strip.
 *
 * Itinerary, venue layout, guests (the list beside two panels, three across).
 */
export const CANVAS_WIDTH = "max-w-[1600px]";

/**
 * No cap at all, for a page that manages its own width -- a map beside a list
 * that reaches all four edges.
 *
 * Venues, vendors.
 */
export const FULL_WIDTH = "max-w-none";

/**
 * The widths by name, for the props that carry one around.
 *
 * This is the whole set. If a new page seems to want a sixth, it is worth
 * asking whether it really differs from all five or is just a little wider
 * than one of them -- that question is what nine ad-hoc caps came from.
 */
export const PAGE_WIDTHS = {
  reading: READING_WIDTH,
  standard: STANDARD_WIDTH,
  wide: WIDE_WIDTH,
  canvas: CANVAS_WIDTH,
  full: FULL_WIDTH,
} as const;

export type PageWidth = keyof typeof PAGE_WIDTHS;

export function pageWidthClass(width: PageWidth) {
  return PAGE_WIDTHS[width];
}

