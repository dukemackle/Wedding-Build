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
  type HubFact,
} from "@/components/metro-hub";
import { anchorSlug, countBy, hubIsIndexable, loadMetroListings, metroBySlug, metroHref } from "@/lib/metros";
import { SITE_URL, VENDOR_LIST_COLUMNS, vendorHref, type VendorListing } from "@/lib/public-listings";
import { vendorCategoryImage } from "@/lib/vendor-category-icons";
import { VENDOR_PRICE_UNITS } from "@/lib/wedding-options";
import type { VendorPriceUnit } from "@/lib/supabase/types";

// /vendors/in/<metro>: the venue hub's sibling (src/app/venues/in/[metro]).
// Every vendor in a launch metro as plain links, grouped by category.

type Row = VendorListing & {
  description: string | null;
  last_verified_at: string | null;
  price_from: number | null;
  price_unit: VendorPriceUnit | null;
};

const load = cache(async (slug: string) => {
  const metro = metroBySlug(slug);
  if (!metro) return null;
  const supabase = await createClient();
  const [
    {
      data: { user },
    },
    vendors,
    venues,
  ] = await Promise.all([
    supabase.auth.getUser(),
    loadMetroListings<Row>(
      supabase,
      "vendors",
      metro,
      `${VENDOR_LIST_COLUMNS}, description, last_verified_at, price_from, price_unit`,
    ),
    loadMetroListings<{ latitude: number | null; longitude: number | null }>(
      supabase,
      "venues",
      metro,
      "id, latitude, longitude",
    ),
  ]);
  return { metro, user, vendors, venueCount: venues.length };
});

export async function generateMetadata({ params }: { params: Promise<{ metro: string }> }): Promise<Metadata> {
  const data = await load((await params).metro);
  if (!data) return {};
  const { metro, vendors } = data;
  const title = `Wedding vendors in ${metro.name}, ${metro.state}`;
  const description = `${vendors.length} wedding vendors in and around ${metro.name}, ${metro.state}: photographers, florists, caterers, DJs and more, from each business's own website. Free to browse.`;
  return {
    title,
    description,
    alternates: { canonical: metroHref("vendors", metro) },
    robots: hubIsIndexable(vendors) ? undefined : { index: false, follow: true },
    openGraph: { title, description, url: metroHref("vendors", metro), type: "website" },
  };
}

function priceLabel(v: Row): string | null {
  if (v.price_from == null) return null;
  return `From $${v.price_from.toLocaleString()}${v.price_unit ? ` ${VENDOR_PRICE_UNITS[v.price_unit]}` : ""}`;
}

export default async function MetroVendorsPage({ params }: { params: Promise<{ metro: string }> }) {
  const data = await load((await params).metro);
  if (!data) notFound();
  const { metro, user, vendors, venueCount } = data;
  const href = metroHref("vendors", metro);

  const categories = countBy(vendors, (v) => v.category);
  const towns = countBy(vendors, (v) => v.city);
  const inCity = vendors.filter((v) => v.city === metro.city).length;
  const photographers = vendors.filter((v) => v.category === "Photography").length;

  const facts: HubFact[] = [
    { value: vendors.length.toLocaleString(), label: `vendors in the ${metro.name} area` },
    { value: categories.length.toLocaleString(), label: "kinds of wedding vendor" },
  ];
  if (photographers) facts.push({ value: photographers.toLocaleString(), label: "photographers", highlight: true });
  facts.push({
    value: inCity.toLocaleString(),
    label: `based in ${metro.city} itself; the rest in ${Math.max(towns.length - (inCity ? 1 : 0), 0)} nearby towns`,
  });

  // A spread of categories rather than twelve photographers: one priced
  // vendor from each category in turn.
  const pricedByCategory = categories.map((c) =>
    vendors.filter((v) => v.category === c.value && v.price_from != null),
  );
  const featured: Row[] = [];
  for (let round = 0; featured.length < 12 && pricedByCategory.some((list) => list.length > round); round++) {
    for (const list of pricedByCategory) {
      if (list[round] && featured.length < 12) featured.push(list[round]);
    }
  }

  const groups = categories.map((c) => ({
    id: `cat-${anchorSlug(c.value)}`,
    title: c.value,
    items: vendors.filter((v) => v.category === c.value).map((v) => ({ href: vendorHref(v), name: v.name, meta: v.city })),
  }));

  const named = categories.slice(0, 3).map((c) => c.value.toLowerCase());
  const lede = `${vendors.length} wedding vendors within about ${metro.radiusMiles} miles of central ${metro.city}, across ${categories.length} kinds of service${
    named.length ? `. The most listed here: ${named.join(", ")}.` : "."
  }`;

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Wedding vendors", item: `${SITE_URL}/vendors` },
      { "@type": "ListItem", position: 2, name: `${metro.name} area`, item: `${SITE_URL}${href}` },
    ],
  };

  return (
    <PageShell email={user ? (user.email ?? "") : null} width="wide">
      <JsonLd data={breadcrumb} />
      <HubBreadcrumb items={[{ label: "Wedding vendors", href: "/vendors" }, { label: "Cities", href: "/cities" }, { label: `${metro.name} area` }]} />
      <HubHero
        title={["Wedding vendors in ", `, ${metro.state}`]}
        highlight={metro.name}
        lede={lede}
        actions={
          <>
            <HubButton href="/vendors" primary>
              Search vendors on the map
            </HubButton>
            <HubButton href={metroHref("venues", metro)}>{metro.name} venues</HubButton>
          </>
        }
        facts={facts}
        factsNote="From each business's own website; each listing shows when it was last checked. Prices change, so confirm with the vendor."
      />

      <HubSection title="By category" sub="Jump to the kind of vendor you need.">
        <HubChips
          chips={categories.map((c) => ({ label: c.value, count: c.count, href: `${href}#cat-${anchorSlug(c.value)}` }))}
        />
      </HubSection>

      {featured.length > 0 && (
        <HubSection
          eyebrow="With a published price"
          title={`${metro.name} vendors you can price today`}
          sub="Starting prices from each business's own site."
        >
          <HubCardGrid>
            {featured.map((v) => (
              <HubCard
                key={v.id}
                href={vendorHref(v)}
                image={v.image_url ?? vendorCategoryImage(v.category)}
                name={v.name}
                meta={[v.city, v.category].filter(Boolean).join(" · ")}
                price={priceLabel(v)}
              />
            ))}
          </HubCardGrid>
        </HubSection>
      )}

      <HubSection
        id="list"
        title={`Every ${metro.name}-area vendor, by category`}
        sub={`All ${vendors.length}, so nothing is hidden behind the map.`}
      >
        <HubGroupedList groups={groups} />
      </HubSection>

      {venueCount > 0 && (
        <HubSection title={`${metro.name} wedding venues`} sub={`${venueCount.toLocaleString()} venues in the same area.`}>
          <HubButton href={metroHref("venues", metro)}>See {metro.name} venues</HubButton>
        </HubSection>
      )}

      <HubEstimateBand metro={metro} />
      <HubNearby kind="vendors" metro={metro} />
      <HubNote>
        Listings come from each business&apos;s own website unless the business has claimed its listing. Nothing here is
        a paid placement. Own one of these businesses?{" "}
        <Link href="/list" className="underline hover:text-ink">
          Claim your free listing
        </Link>
        .
      </HubNote>
    </PageShell>
  );
}
