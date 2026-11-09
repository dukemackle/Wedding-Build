import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { fetchAll } from "@/lib/supabase/fetch-all";
import { PageShell } from "@/components/page-shell";
import { JsonLd } from "@/components/json-ld";
import { HubBreadcrumb } from "@/components/metro-hub";
import { METROS, MIN_INDEXABLE, metroForPoint, metroHref } from "@/lib/metros";
import { isIndexable, SITE_URL } from "@/lib/public-listings";
import { regionOf, usMapPoint } from "@/lib/cities";
import { CitiesBrowser, type CityCard } from "./cities-browser";

// /cities: every metro hub in one place, by region, with a map on wide
// screens. Approved direction 2026-11-06 (owner): one organised page instead
// of thirty footer links or a nav tab per city.

export const metadata: Metadata = {
  title: "Wedding venues and vendors by city",
  description: `Wedding venues and vendors in ${METROS.length} US metro areas, from Austin to Seattle. Each listing is checked against the business's own website. Free to browse.`,
  alternates: { canonical: "/cities" },
};

type Row = {
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  last_verified_at: string | null;
  is_sample: boolean;
};

export default async function CitiesPage() {
  const supabase = await createClient();
  const rows = <T extends Row>(table: "venues" | "vendors", columns: string) =>
    fetchAll<T>((from, to) =>
      supabase
        .from(table)
        .select(columns)
        .eq("active", true)
        .eq("is_sample", false)
        .not("latitude", "is", null)
        .order("id")
        .range(from, to)
        .returns<T[]>(),
    );
  const base = "latitude, longitude, description, last_verified_at, is_sample";
  const [
    {
      data: { user },
    },
    venues,
    vendors,
  ] = await Promise.all([supabase.auth.getUser(), rows<Row>("venues", base), rows<Row>("vendors", base)]);

  type Tally = { venues: number; vendors: number; indexable: number };
  const tally = new Map<string, Tally>(METROS.map((m) => [m.slug, { venues: 0, vendors: 0, indexable: 0 }]));
  for (const v of venues) {
    const metro = metroForPoint(v.latitude, v.longitude);
    if (!metro) continue;
    const t = tally.get(metro.slug)!;
    t.venues++;
    if (isIndexable(v)) t.indexable++;
  }
  for (const v of vendors) {
    const metro = metroForPoint(v.latitude, v.longitude);
    if (metro) tally.get(metro.slug)!.vendors++;
  }

  const cities: CityCard[] = METROS.map((m) => {
    const t = tally.get(m.slug)!;
    return {
      slug: m.slug,
      name: m.name,
      state: m.state,
      region: regionOf(m.state),
      venues: t.venues,
      vendors: t.vendors,
      soon: t.indexable < MIN_INDEXABLE,
      venuesHref: metroHref("venues", m),
      vendorsHref: metroHref("vendors", m),
      point: usMapPoint(m.lat, m.lng),
    };
  });

  const totalVenues = cities.reduce((n, c) => n + c.venues, 0);

  return (
    <PageShell email={user?.email ?? null} width="canvas">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Wedding venues by city",
          itemListElement: cities.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: `Wedding venues in ${c.name}, ${c.state}`,
            url: `${SITE_URL}${c.venuesHref}`,
          })),
        }}
      />
      <HubBreadcrumb items={[{ label: "Wedding venues", href: "/venues" }, { label: "Cities" }]} />
      <div className="border-b border-hairline pb-8 pt-3 lg:pb-10">
        <h1 className="mb-4 mt-2 font-display text-[44px] font-medium leading-[1.02] text-ink lg:text-[68px]">
          Wedding <span className="bg-[linear-gradient(transparent_68%,#ffd301_68%)]">cities</span>
        </h1>
        <p className="max-w-[40rem] text-[16.5px] leading-relaxed text-ink/80 lg:text-lg">
          {totalVenues.toLocaleString()} venues and their local vendors in {cities.length} metro areas, each
          checked against the business&rsquo;s own website. Pick a city to see every listing there.
        </p>
      </div>
      <CitiesBrowser cities={cities} />
    </PageShell>
  );
}
