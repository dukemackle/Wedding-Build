/**
 * Says out loud that Wren isn't sure about something.
 *
 * Used wherever Wren has guessed rather than read: a date inferred from a
 * clause that didn't state one, a spreadsheet column worked out from its
 * contents because the heading was wrong or duplicated, an amount pulled out
 * of a sentence. The couple can only check what they're told to check.
 *
 * Amber rather than red on purpose -- nothing here is broken, and colouring
 * ordinary uncertainty as an error would teach people to ignore real errors.
 * The icon and the words carry the meaning too, so it never rests on colour.
 *
 * Measured rather than eyeballed. The obvious amber-300 border came out at
 * 1.44:1 against the white card -- an edge nobody would notice, on the one
 * element whose whole job is being noticed. amber-600 gives 3.19:1 against
 * the card and 3.05:1 against parchment, clearing the 3:1 a UI boundary
 * needs on both surfaces this sits on. The amber-900 text reads at 8.15:1.
 */
export function Caution({ children }: { children: React.ReactNode }) {
  return (
    <span className="mt-1 flex items-start gap-1.5 rounded-md border border-amber-600 bg-amber-100 px-2 py-1 text-xs text-amber-900">
      <svg
        viewBox="0 0 16 16"
        aria-hidden="true"
        className="mt-0.5 h-3.5 w-3.5 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 2.5 1.8 13.2h12.4L8 2.5Z" />
        <path d="M8 6.6v3.1" />
        <path d="M8 11.4h.01" />
      </svg>
      <span className="min-w-0">
        <span className="font-medium">Double-check this. </span>
        {children}
      </span>
    </span>
  );
}
