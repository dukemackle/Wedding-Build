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
 * Legal pages, login, signup, single-column forms.
 */
export const READING_WIDTH = "max-w-2xl";

/**
 * The default. Enough for two columns of cards without becoming a spreadsheet.
 *
 * Most pages.
 */
export const STANDARD_WIDTH = "max-w-4xl";

/**
 * Pages whose content is genuinely wide: tables with many columns, a layout
 * canvas, or a list beside a detail panel. Matches the nav.
 *
 * Budget, guests, seating, venue layout, checklist.
 */
export const WIDE_WIDTH = "max-w-6xl";
