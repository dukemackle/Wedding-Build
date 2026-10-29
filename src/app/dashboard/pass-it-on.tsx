import Link from "next/link";
import { TagIcon } from "@/components/icons";
import { formatPrice } from "@/lib/marketplace";
import type { PassItOnDraft } from "@/lib/pass-it-on";

/**
 * After the wedding: "sell what's left", with the things the couple's budget
 * says they bought, priced where Wren can. Each opens the sell form with the
 * title, category and a suggested price filled in; "List my wedding" goes
 * through them one after another. Shown while the dashboard's caller says
 * it's the window (inPassItOnWindow), and gone once everything is listed.
 */
export function PassItOn({ drafts }: { drafts: PassItOnDraft[] }) {
  return (
    // Gold: after the wedding, this is the thing on the page worth doing.
    <section className="mt-6 rounded-lg border-2 border-[#FFD301] bg-card p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-2">
        <TagIcon className="h-5 w-5 text-[#9a6b00]" />
        <h2 className="font-display text-2xl font-semibold text-forest">Pass it on</h2>
      </div>
      <p className="mt-1 max-w-2xl text-sm text-ink/70">
        Congratulations! {drafts.length > 0 ? `Wren found ${drafts.length === 1 ? "one thing" : `${drafts.length} things`} in your budget another couple could use. ` : ""}
        Sell or lend what&apos;s left to a couple whose wedding is still coming. It&apos;s free.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {drafts.slice(0, 6).map((d) => (
          <Link
            key={d.source}
            href={`/marketplace/new?pass=1&from=${encodeURIComponent(d.source)}`}
            className="rounded-full border border-hairline px-3.5 py-1.5 text-sm text-forest transition-colors hover:border-forest"
          >
            + {d.title}
            {d.suggestCents ? <span className="text-ink/50"> · {formatPrice(d.suggestCents)}</span> : null}
          </Link>
        ))}
        <Link
          href={drafts.length > 0 ? "/marketplace/new?pass=1" : "/marketplace/new"}
          className="rounded-full bg-forest px-3.5 py-1.5 text-sm font-medium text-parchment hover:bg-forest/90"
        >
          {drafts.length > 0 ? "List my wedding" : "Sell something"}
        </Link>
      </div>
    </section>
  );
}
