import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { fetchAll } from "@/lib/supabase/fetch-all";
import { SITE_URL, isIndexable, vendorHref, venueHref } from "@/lib/public-listings";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";
import { METROS, MIN_INDEXABLE, metroForPoint, metroHref } from "@/lib/metros";

// Built per request so a listing appears as soon as it's filled in, not at the
// next deploy. Read as the anon role, like any logged-out visitor.
export const dynamic = "force-dynamic";

type Row = {
  id: string;
  latitude: number | null;
  longitude: number | null;
  slug: string;
  description: string | null;
  last_verified_at: string | null;
  is_sample: boolean;
};

const COLUMNS = "id, slug, description, last_verified_at, is_sample, latitude, longitude";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(supabaseUrl(), supabaseAnonKey());
  const rows = (table: "venues" | "vendors") =>
    fetchAll<Row>((from, to) =>
      supabase.from(table).select(COLUMNS).eq("active", true).order("id").range(from, to).returns<Row[]>(),
    );
  const [venues, vendors] = await Promise.all([rows("venues"), rows("vendors")]);

  // Only listings that are also allowed in the index -- a sitemap entry for a
  // noindex page is a mixed signal.
  const entry = (href: string, row: Row): MetadataRoute.Sitemap[number] => ({
    url: `${SITE_URL}${href}`,
    lastModified: row.last_verified_at ?? undefined,
  });

  // Metro hubs, only once they have enough indexable listings to be indexed
  // themselves (the same rule as the hub page's own robots tag).
  const hubs = (["venues", "vendors"] as const).flatMap((kind) => {
    const counts = new Map<string, number>();
    for (const row of kind === "venues" ? venues : vendors) {
      if (!isIndexable(row) || row.is_sample) continue;
      const metro = metroForPoint(row.latitude, row.longitude);
      if (metro) counts.set(metro.slug, (counts.get(metro.slug) ?? 0) + 1);
    }
    return METROS.filter((m) => (counts.get(m.slug) ?? 0) >= MIN_INDEXABLE).map(
      (m): MetadataRoute.Sitemap[number] => ({ url: `${SITE_URL}${metroHref(kind, m)}`, changeFrequency: "weekly", priority: 0.8 }),
    );
  });

  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/venues`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/vendors`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/cities`, changeFrequency: "weekly", priority: 0.85 },
    { url: `${SITE_URL}/attire`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/estimate`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/list`, changeFrequency: "monthly", priority: 0.4 },
    ...hubs,
    ...venues.filter(isIndexable).map((v) => entry(venueHref(v), v)),
    ...vendors.filter(isIndexable).map((v) => entry(vendorHref(v), v)),
  ];
}
