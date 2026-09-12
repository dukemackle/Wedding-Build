import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/app-nav";
import { FadeInSection } from "@/components/fade-in-section";
import { BUDGET_CATEGORIES, VENDOR_CATEGORY_TO_BUDGET_KEY } from "@/lib/budget-categories";
import { CATEGORY_ICONS } from "@/app/budget/budget-table";
import type { Venue, Wedding } from "@/lib/supabase/types";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const BUDGET_KEY_TO_BROWSE_HREF: Record<string, string> = {
  venue: "/venues",
  attire: "/attire",
  ...Object.fromEntries(Object.values(VENDOR_CATEGORY_TO_BUDGET_KEY).map((key) => [key, "/vendors"])),
};

type BudgetLineItemRow = {
  category: string;
  override_value: number | null;
  purchased_from: string | null;
  vendor_id: string | null;
  venue_id: string | null;
};

function CategoryCard({
  label,
  Icon,
  isBooked,
  imageUrl,
  purchasedFrom,
  price,
  browseHref,
}: {
  label: string;
  Icon?: React.ComponentType<{ className?: string }>;
  isBooked: boolean;
  imageUrl: string | null;
  purchasedFrom: string | null;
  price: number | null;
  browseHref?: string;
}) {
  if (isBooked) {
    return (
      <div className="flex flex-col overflow-hidden rounded-lg border border-forest/30 bg-parchment">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={purchasedFrom ?? label}
            width={400}
            height={300}
            className="aspect-[4/3] w-full border-b border-hairline object-cover"
          />
        )}
        <div className="flex flex-1 flex-col p-4">
          <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-ink/50">
            {Icon && <Icon className="h-3.5 w-3.5 text-brass" />}
            {label}
          </p>
          <p className="mt-1 font-display text-lg font-semibold text-forest">
            {purchasedFrom ?? "Booked"}
          </p>
          {price != null && (
            <p className="mt-1 font-mono-numbers text-sm text-ink/70">{currency.format(price)}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2 rounded-lg border border-dashed border-hairline bg-parchment/50 p-4">
      <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-ink/50">
        {Icon && <Icon className="h-3.5 w-3.5 text-ink/40" />}
        {label}
      </p>
      <p className="text-sm text-ink/50">Not booked yet</p>
      {browseHref && (
        <Link href={browseHref} className="text-xs text-brass hover:underline">
          Browse &rarr;
        </Link>
      )}
    </div>
  );
}

export default async function WeddingPlanPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: wedding } = await supabase
    .from("weddings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle<Wedding>();

  if (!wedding) {
    return (
      <main className="flex flex-1 flex-col items-center px-6 py-16">
        <AppNav email={user.email ?? ""} />
        <div className="w-full max-w-md rounded-lg border border-hairline bg-card p-6 sm:p-10 text-center shadow-sm">
          <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
            Wedding Plan
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-forest">
            Set up your wedding first
          </h1>
          <p className="mt-4 text-ink/70">
            Add your wedding details on the Dashboard, then come back here as you book things.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-block rounded-md bg-forest px-4 py-2 font-medium text-parchment transition-colors hover:bg-forest/90"
          >
            Go to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const { data: lineItems } = await supabase
    .from("budget_line_items")
    .select("category, override_value, purchased_from, vendor_id, venue_id")
    .eq("wedding_id", wedding.id)
    .returns<BudgetLineItemRow[]>();

  const lineItemByCategory = new Map((lineItems ?? []).map((row) => [row.category, row]));

  const vendorIds = (lineItems ?? [])
    .map((row) => row.vendor_id)
    .filter((id): id is string => Boolean(id));
  const venueIds = (lineItems ?? [])
    .map((row) => row.venue_id)
    .filter((id): id is string => Boolean(id));

  const [{ data: linkedVendors }, { data: linkedVenues }] = await Promise.all([
    vendorIds.length
      ? supabase.from("vendors").select("id, image_url").in("id", vendorIds)
      : Promise.resolve({ data: [] }),
    venueIds.length
      ? supabase.from("venues").select("id, image_url").in("id", venueIds)
      : Promise.resolve({ data: [] }),
  ]);

  const imageByVendorId = new Map(
    (linkedVendors ?? []).map((v: { id: string; image_url: string | null }) => [v.id, v.image_url]),
  );
  const imageByVenueId = new Map(
    (linkedVenues ?? []).map((v: { id: string; image_url: string | null }) => [v.id, v.image_url]),
  );

  const cards = BUDGET_CATEGORIES.map((category) => {
    const lineItem = lineItemByCategory.get(category.key);
    const isBooked = Boolean(lineItem?.vendor_id || lineItem?.venue_id);
    const imageUrl = lineItem?.vendor_id
      ? (imageByVendorId.get(lineItem.vendor_id) ?? null)
      : lineItem?.venue_id
        ? (imageByVenueId.get(lineItem.venue_id) ?? null)
        : null;

    return {
      key: category.key,
      label: category.label,
      isBooked,
      imageUrl,
      purchasedFrom: lineItem?.purchased_from ?? null,
      price: lineItem?.override_value ?? null,
      browseHref: BUDGET_KEY_TO_BROWSE_HREF[category.key],
    };
  });

  const bookedCount = cards.filter((c) => c.isBooked).length;

  const { data: venue } = wedding.venue_id
    ? await supabase.from("venues").select("*").eq("id", wedding.venue_id).maybeSingle<Venue>()
    : { data: null };

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-16">
      <AppNav email={user.email ?? ""} maxWidthClassName="max-w-4xl" />
      <div className="w-full max-w-4xl">
        <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
          Wedding Plan
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-forest">
          {[wedding.partner_a_name, wedding.partner_b_name].filter(Boolean).join(" & ") ||
            "Your wedding"}
        </h1>
        <p className="mt-2 text-sm text-ink/70">
          Everything you&apos;ve booked so far, all in one place.{" "}
          <span className="font-mono-numbers text-ink">
            {bookedCount} of {cards.length} booked
          </span>
        </p>

        {venue && (
          <FadeInSection>
            <div className="mt-6 w-full overflow-hidden rounded-lg border border-hairline bg-card shadow-sm">
              {venue.image_url && (
                <Image
                  src={venue.image_url}
                  alt={venue.name}
                  width={900}
                  height={400}
                  className="aspect-[21/9] w-full border-b border-hairline object-cover"
                />
              )}
              <div className="p-6">
                <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
                  Venue
                </p>
                <h2 className="mt-1 font-display text-2xl font-semibold text-forest">
                  {venue.name}
                </h2>
                <p className="mt-1 text-sm text-ink/70">
                  {[venue.city, venue.state].filter(Boolean).join(", ")}
                </p>
              </div>
            </div>
          </FadeInSection>
        )}

        <FadeInSection delayMs={40}>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards
              .filter((c) => c.key !== "venue")
              .map((card) => (
                <CategoryCard
                  key={card.key}
                  label={card.label}
                  Icon={CATEGORY_ICONS[card.key]}
                  isBooked={card.isBooked}
                  imageUrl={card.imageUrl}
                  purchasedFrom={card.purchasedFrom}
                  price={card.price}
                  browseHref={card.browseHref}
                />
              ))}
          </div>
        </FadeInSection>
      </div>
    </main>
  );
}
