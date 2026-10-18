import Link from "next/link";
import { TagIcon } from "@/components/icons";
import { BUDGET_TO_MARKET } from "@/lib/marketplace";

/** How long after the wedding the dashboard keeps asking. */
const SHOW_FOR_DAYS = 180;

/**
 * After the wedding: "sell what's left", with a one-tap start for each thing
 * the couple's budget says they bought. Each opens the sell form with the
 * title and category filled in; the photos are theirs to add.
 */
export function PassItOn({
  weddingDate,
  spentCategories,
  customItems,
  today,
}: {
  weddingDate: string | null;
  /** Budget categories with money against them. */
  spentCategories: string[];
  /** The couple's own budget lines ("Table numbers", "Neon sign"). */
  customItems: string[];
  today: Date;
}) {
  if (!weddingDate) return null;
  const daysSince = (today.getTime() - new Date(`${weddingDate}T12:00:00`).getTime()) / 86400_000;
  if (daysSince < 1 || daysSince > SHOW_FOR_DAYS) return null;

  const suggestions = [
    ...spentCategories
      .filter((key) => BUDGET_TO_MARKET[key])
      .map((key) => ({ title: BUDGET_TO_MARKET[key].sellTitle, category: BUDGET_TO_MARKET[key].sellCategory })),
    ...customItems.map((title) => ({ title, category: "decor" })),
  ].slice(0, 6);

  return (
    // Gold: after the wedding, this is the thing on the page worth doing.
    <section className="mt-6 rounded-lg border-2 border-[#FFD301] bg-card p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-2">
        <TagIcon className="h-5 w-5 text-[#9a6b00]" />
        <h2 className="font-display text-2xl font-semibold text-forest">Pass it on</h2>
      </div>
      <p className="mt-1 max-w-2xl text-sm text-ink/70">
        Congratulations! Sell or lend what&apos;s left to a couple whose wedding is still coming. It takes a minute a
        listing, and it&apos;s free.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <Link
            key={s.title}
            href={`/marketplace/new?title=${encodeURIComponent(s.title)}&category=${s.category}`}
            className="rounded-full border border-hairline px-3.5 py-1.5 text-sm text-forest transition-colors hover:border-forest"
          >
            + {s.title}
          </Link>
        ))}
        <Link
          href="/marketplace/new"
          className="rounded-full bg-forest px-3.5 py-1.5 text-sm font-medium text-parchment hover:bg-forest/90"
        >
          Sell something else
        </Link>
      </div>
    </section>
  );
}
