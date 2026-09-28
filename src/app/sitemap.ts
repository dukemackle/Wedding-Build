import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { fetchAll } from "@/lib/supabase/fetch-all";
import { SITE_URL, isIndexable, vendorHref, venueHref } from "@/lib/public-listings";

// Built per request so a listing appears as soon as it's filled in, not at the
// next deploy. Read as the anon role, like any logged-out visitor.
export const dynamic = "force-dynamic";

type Row = {
  id: string;
  slug: string;
  description: string | null;
  last_verified_at: string | null;
  is_sample: boolean;
};

const COLUMNS = "id, slug, description, last_verified_at, is_sample";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
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

  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/venues`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/vendors`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/estimate`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/list`, changeFrequency: "monthly", priority: 0.4 },
    ...venues.filter(isIndexable).map((v) => entry(venueHref(v), v)),
    ...vendors.filter(isIndexable).map((v) => entry(vendorHref(v), v)),
  ];
}
