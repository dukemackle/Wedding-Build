import Link from "next/link";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { STATE_ABBR } from "@/lib/listing-pin";
import { BUDGET_TO_MARKET, milesBetween } from "@/lib/marketplace";
import { TagIcon } from "@/components/icons";

/** How far "near you" reaches on the budget page. */
const NEAR_MILES = 50;

/**
 * The budget page's "on the marketplace near you": for each budget line the
 * marketplace can save money on, how many things couples nearby are selling.
 * Nothing at all when there's nothing near, so it never advertises an empty
 * shelf.
 */
export async function MarketplaceSuggestions({
  budgetKeys,
  origin,
  state,
}: {
  /** The budget lines the couple is tracking. */
  budgetKeys: string[];
  /** Their venue's pin, when booked. */
  origin: { latitude: number; longitude: number } | null;
  /** Their state, as a fallback for "near". */
  state: string | null;
}) {
  const keys = budgetKeys.filter((k) => BUDGET_TO_MARKET[k]);
  if (keys.length === 0 || (!origin && !state)) return null;

  const abbr = state ? (STATE_ABBR[state] ?? state) : null;
  let query = createAdminSupabaseClient()
    .from("market_listings")
    .select("category, latitude, longitude")
    .eq("status", "active")
    .limit(2000);
  if (!origin && abbr) query = query.eq("state", abbr);
  const { data } = await query.returns<{ category: string; latitude: number | null; longitude: number | null }[]>();

  const near = (data ?? []).filter(
    (l) =>
      !origin ||
      (l.latitude != null &&
        l.longitude != null &&
        milesBetween(origin, { latitude: l.latitude, longitude: l.longitude }) <= NEAR_MILES),
  );
  const counts = keys
    .map((key) => ({
      key,
      ...BUDGET_TO_MARKET[key],
      count: near.filter((l) => BUDGET_TO_MARKET[key].categories.includes(l.category)).length,
    }))
    .filter((c) => c.count > 0);
  if (counts.length === 0) return null;
  return <SuggestionsCard counts={counts} nearVenue={Boolean(origin)} />;
}

export function SuggestionsCard({
  counts,
  nearVenue,
}: {
  counts: { key: string; categories: string[]; count: number }[];
  nearVenue: boolean;
}) {
  return (
    <div className="mt-8 rounded-lg border border-hairline bg-card p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-2">
        <TagIcon className="h-5 w-5 text-brass" />
        <h2 className="font-display text-xl font-semibold text-forest">Save on these with the marketplace</h2>
      </div>
      <p className="mt-1 text-sm text-ink/70">
        Couples {nearVenue ? `within ${NEAR_MILES} miles of your venue` : "in your state"} are selling what they used.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {counts.map((c) => (
          <Link
            key={c.key}
            href={`/marketplace?category=${c.categories[0]}${nearVenue ? `&near=${NEAR_MILES}` : ""}`}
            className="rounded-full border border-hairline px-3.5 py-1.5 text-sm text-forest transition-colors hover:border-forest"
          >
            {LABELS[c.key]} · <strong>{c.count}</strong> near you →
          </Link>
        ))}
      </div>
    </div>
  );
}

const LABELS: Record<string, string> = {
  florals: "Decor & florals",
  attire: "Dresses & attire",
  stationery: "Signs & stationery",
  favors: "Favors",
};
