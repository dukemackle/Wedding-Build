/**
 * A way back to the couple's own spreadsheet.
 *
 * Importing doesn't end a couple's relationship with their sheet -- the two
 * of them have been keeping it for months, and half the time the answer to
 * "wait, what did we agree with the caterer" is still in there. This is a
 * plain link out to Google, not an integration: Wren stores the URL they
 * pasted and nothing else.
 */
export function SpreadsheetLink({ url }: { url: string | null }) {
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs text-brass hover:underline"
    >
      <svg
        viewBox="0 0 16 16"
        aria-hidden="true"
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2.5" y="2" width="11" height="12" rx="1.5" />
        <path d="M5.5 6h5M5.5 8.5h5M5.5 11h3" />
      </svg>
      Open your spreadsheet
    </a>
  );
}
