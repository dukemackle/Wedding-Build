/**
 * Opens the couple's own guest site, as a guest would see it.
 *
 * Wren has had a "Copy link" since the guest site shipped, which is the right
 * tool for sending it to someone and the wrong one for the far more common
 * thing: checking what a change you just saved actually looks like. That took
 * copying the link, opening a tab and pasting -- so most of the time nobody
 * looked, and edits went out unseen.
 *
 * New tab on purpose: the couple is mid-edit on the Guests page, and losing
 * that to a page they only wanted to glance at would be its own small
 * annoyance.
 */
export function ViewGuestSiteButton({
  url,
  variant = "outline",
}: {
  url: string | null;
  /** "solid" for the share row, "quiet" beside a heading. */
  variant?: "outline" | "quiet";
}) {
  if (!url) return null;

  const className =
    variant === "quiet"
      ? "inline-flex shrink-0 items-center gap-1.5 text-xs text-brass hover:underline"
      : "inline-flex shrink-0 items-center gap-1.5 rounded-md border border-hairline bg-card px-3 py-1 text-xs text-forest transition-colors hover:border-forest";

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={className}>
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
        <path d="M1.5 8s2.4-4 6.5-4 6.5 4 6.5 4-2.4 4-6.5 4S1.5 8 1.5 8Z" />
        <circle cx="8" cy="8" r="1.75" />
      </svg>
      View guest page
    </a>
  );
}
