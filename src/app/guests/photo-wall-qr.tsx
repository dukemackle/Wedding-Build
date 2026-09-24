import Link from "next/link";

/**
 * The QR code for the photo wall, and where to print it.
 *
 * A code on each reception table is how the photo wall fills up on the day:
 * guests take the pictures anyway, this is how they reach the couple.
 */
export function PhotoWallQr({ svg, shareUrl }: { svg: string; shareUrl: string }) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
      <div
        className="w-40 shrink-0 rounded-lg border border-hairline bg-white p-2 [&>svg]:h-auto [&>svg]:w-full"
        // Generated from our own URL by the qrcode library, not user input.
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <div className="min-w-0">
        <p className="text-sm text-ink/70">
          Put this on each table at the reception. Guests scan it and can post photos straight to
          your wall — you approve each one before it shows.
        </p>
        <p className="mt-2 break-all font-mono-numbers text-xs text-ink/50">{shareUrl}</p>
        <Link
          href="/guests/table-card"
          target="_blank"
          className="mt-4 inline-block rounded-md bg-forest px-4 py-2 text-sm font-medium text-parchment transition-colors hover:bg-forest/90"
        >
          Print table cards
        </Link>
      </div>
    </div>
  );
}
