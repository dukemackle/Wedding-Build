import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/page-shell";
import { JsonLd } from "@/components/json-ld";
import {
  HubBreadcrumb,
  HubButton,
  HubCard,
  HubCardGrid,
  HubChips,
  HubEstimateBand,
  HubGroupedList,
  HubHero,
  HubNearby,
  HubNote,
  HubSection,
  HubTiles,
  type HubFact,
} from "@/components/metro-hub";
import {
  anchorSlug,
  countBy,
  hubIsIndexable,
  loadMetroListings,
  median,
  metroBySlug,
  metroHref,
  type Metro,
} from "@/lib/metros";
import { SITE_URL, VENUE_LIST_COLUMNS, venueHref, type VenueListing } from "@/lib/public-listings";
import { currentVenueType, venueTypeImage } from "@/lib/wedding-options";
import { priceHeadline } from "@/lib/venue-pricing";

// /venues/in/<metro>: every venue in a launch metro as plain links, so search
// engines (and couples who search "wedding venues in Austin") have a way in
// besides the map. See src/lib/metros.ts for why these exist.

type Row = VenueListing & { description: string | null; last_verified_at: string | null };
type VendorRow = { category: string | null; latitude: number | null; longitude: number | null };

const load = cache(async (slug: string) => {
  const metro = metroBySlug(slug);
  if (!metro) return null;
  const supabase = await createClient();
  const [
    {
      data: { user },
    },
    venues,
    vendors,
  ] = await Promise.all([
    supabase.auth.getUser(),
    loadMetroListings<Row>(supabase, "venues", metro, `${VENUE_LIST_COLUMNS}, description, last_verified_at`),
    loadMetroListings<VendorRow>(supabase, "vendors", metro, "id, category, latitude, longitude"),
  ]);
  return { metro, user, venues, vendors };
});

function styleOf(v: Row): string | null {
  return currentVenueType(v.venue_type) ?? v.venue_type;
}

export async function generateMetadata({ params }: { params: Promise<{ metro: string }> }): Promise<Metadata> {
  const data = await load((await params).metro);
  if (!data) return {};
  const { metro, venues } = data;
  const title = `Wedding venues in ${metro.name}, ${metro.state}`;
  const description = `Compare ${venues.length} wedding venues in and around ${metro.name}, ${metro.state}: guest capacity, starting prices and styles, from each venue's own website. Free to browse.`;
  return {
    title,
    description,
    alternates: { canonical: metroHref("venues", metro) },
    robots: hubIsIndexable(venues) ? undefined : { index: false, follow: true },
    openGraph: { title, description, url: metroHref("venues", metro), type: "website" },
  };
}

function lede(metro: Metro, venues: Row[], towns: { value: string; count: number }[], styles: { value: string }[]): string {
  const others = towns.filter((t) => t.value !== metro.city);
  const named = others.slice(0, 3).map((t) => t.value);
  const kinds = styles.slice(0, 3).map((s) => s.value.toLowerCase());
  const list = (items: string[], last: string) =>
    items.length > 1 ? `${items.slice(0, -1).join(", ")} ${last} ${items[items.length - 1]}` : (items[0] ?? "");
  const parts = [
    `${venues.length} wedding venues within about ${metro.radiusMiles} miles of central ${metro.city}`,
    others.length ? `, in ${metro.city} and ${others.length} nearby towns including ${list(named, "and")}.` : ".",
  ];
  if (kinds.length) parts.push(` Most are ${list(kinds, "or")} venues.`);
  return parts.join("");
}

export default async function MetroVenuesPage({
  params,
  searchParams,
}: {
  params: Promise<{ metro: string }>;
  searchParams: Promise<{ style?: string }>;
}) {
  const data = await load((await params).metro);
  if (!data) notFound();
  const { metro, user, venues, vendors } = data;
  const href = metroHref("venues", metro);

  const styles = countBy(venues, styleOf);
  const requested = (await searchParams).style;
  const style = styles.some((s) => s.value === requested) ? requested : undefined;
  const shown = style ? venues.filter((v) => styleOf(v) === style) : venues;

  const towns = countBy(venues, (v) => v.city);
  const shownTowns = countBy(shown, (v) => v.city);
  const capacities = venues.map((v) => v.capacity).filter((c): c is number => c != null && c > 0);
  const startingPrices = venues
    .filter((v) => v.price_from != null && (v.price_basis === "rental" || v.price_basis === "package"))
    .map((v) => v.price_from as number);
  const middlePrice = startingPrices.length >= 5 ? median(startingPrices) : null;
  const inCity = venues.filter((v) => v.city === metro.city).length;

  const facts: HubFact[] = [{ value: venues.length.toLocaleString(), label: `venues in the ${metro.name} area` }];
  if (capacities.length)
    facts.push({
      value: `${Math.min(...capacities).toLocaleString()}–${Math.max(...capacities).toLocaleString()}`,
      label: "guests, smallest to largest",
    });
  if (middlePrice != null)
    facts.push({
      value: `$${middlePrice.toLocaleString()}`,
      label: `middle starting price, of the ${startingPrices.length} venues that publish one`,
      highlight: true,
    });
  facts.push({
    value: inCity.toLocaleString(),
    label: `in ${metro.city} itself; the rest in ${Math.max(towns.length - (inCity ? 1 : 0), 0)} nearby towns`,
  });

  const priced = shown
    .filter((v) => v.price_from != null && v.price_basis !== "ask")
    .sort((a, b) => (b.capacity ?? 0) - (a.capacity ?? 0))
    .slice(0, 12);

  // Towns with a handful of venues share one "Other nearby towns" group, so
  // the list isn't thirty headings of one or two names each.
  const bigTowns = new Set(shownTowns.filter((t) => t.count >= 3).map((t) => t.value));
  const groups = shownTowns
    .filter((t) => bigTowns.has(t.value))
    .map((town) => ({
      id: `town-${anchorSlug(town.value)}`,
      title: town.value,
      items: shown
        .filter((v) => v.city === town.value)
        .map((v) => ({ href: venueHref(v), name: v.name, meta: styleOf(v) })),
    }));
  const rest = shown
    .filter((v) => !bigTowns.has(v.city?.trim() ?? ""))
    .sort((a, b) => (a.city ?? "").localeCompare(b.city ?? "") || a.name.localeCompare(b.name));
  if (rest.length)
    groups.push({
      id: "town-other",
      title: "Other nearby towns",
      items: rest.map((v) => ({ href: venueHref(v), name: v.name, meta: [v.city, styleOf(v)].filter(Boolean).join(", ") })),
    });

  const vendorCategories = countBy(vendors, (v) => v.category).filter((c) => c.value !== "Other");

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Wedding venues", item: `${SITE_URL}/venues` },
      { "@type": "ListItem", position: 2, name: `${metro.name} area`, item: `${SITE_URL}${href}` },
    ],
  };

  return (
    <PageShell email={user ? (user.email ?? "") : null} width="wide">
      <JsonLd data={breadcrumb} />
      <HubBreadcrumb items={[{ label: "Wedding venues", href: "/venues" }, { label: `${metro.name} area` }]} />
      <HubHero
        title={["Wedding venues in ", `, ${metro.state}`]}
        highlight={metro.name}
        lede={lede(metro, venues, towns, styles)}
        actions={
          <>
            <HubButton href="/venues" primary>
              Search venues on the map
            </HubButton>
            <HubButton href="/estimate">Estimate your wedding cost</HubButton>
          </>
        }
        facts={facts}
        factsNote="From each venue's own website; each listing shows when it was last checked. Prices change, so confirm with the venue."
      />

      <div className="grid gap-2 lg:grid-cols-2 lg:gap-10">
        <HubSection title="By town" sub={`Where ${metro.name} couples look.`}>
          <HubChips
            chips={towns.filter((t) => t.count >= 3).slice(0, 10).map((t) => ({
              label: t.value,
              count: t.count,
              href: `${href}${style ? `?style=${encodeURIComponent(style)}` : ""}#town-${anchorSlug(t.value)}`,
            }))}
          />
        </HubSection>
        <HubSection title="By style" sub="The kinds of places on offer here.">
          <HubChips
            chips={[
              { label: "All", count: venues.length, href: `${href}#list`, current: !style },
              ...styles.slice(0, 9).map((s) => ({
                label: s.value,
                count: s.count,
                href: `${href}?style=${encodeURIComponent(s.value)}#list`,
                current: s.value === style,
              })),
            ]}
          />
        </HubSection>
      </div>

      {priced.length > 0 && (
        <HubSection
          eyebrow="With a published price"
          title={`${metro.name} venues you can price today`}
          sub="Starting prices from the venue's own site. Open one for capacity, what's included and how to ask about your date."
        >
          <HubCardGrid>
            {priced.map((v) => (
              <HubCard
                key={v.id}
                href={venueHref(v)}
                image={v.image_url ?? venueTypeImage(v.venue_type)}
                name={v.name}
                meta={[v.city, styleOf(v), v.capacity ? `up to ${v.capacity.toLocaleString()}` : null].filter(Boolean).join(" · ")}
                price={priceHeadline(v)}
              />
            ))}
          </HubCardGrid>
        </HubSection>
      )}

      <HubSection
        id="list"
        title={style ? `Every ${style.toLowerCase()} venue, by town` : `Every ${metro.name}-area venue, by town`}
        sub={`All ${shown.length}, so nothing is hidden behind the map.`}
      >
        <HubGroupedList groups={groups} />
      </HubSection>

      {vendorCategories.length > 0 && (
        <HubSection
          title={`${metro.name} wedding vendors`}
          sub={`Photographers, florists, caterers and more in the ${metro.name} area.`}
        >
          <HubTiles
            tiles={vendorCategories.slice(0, 6).map((c) => ({
              label: c.value,
              count: c.count,
              href: `${metroHref("vendors", metro)}#cat-${anchorSlug(c.value)}`,
            }))}
          />
          <div className="mt-4">
            <HubButton href={metroHref("vendors", metro)}>All {vendors.length.toLocaleString()} {metro.name} vendors</HubButton>
          </div>
        </HubSection>
      )}

      <HubEstimateBand metro={metro} />
      <HubNearby kind="venues" metro={metro} />
      <HubNote>
        Listings come from each business&apos;s own website unless the business has claimed its listing. Nothing here is
        a paid placement. Own one of these venues?{" "}
        <Link href="/list" className="underline hover:text-ink">
          Claim your free listing
        </Link>
        .
      </HubNote>
    </PageShell>
  );
}
