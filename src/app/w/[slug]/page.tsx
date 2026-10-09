import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { PublicWedding } from "@/lib/supabase/types";
import { parseSiteDesign } from "@/lib/site-design-schema";
import { bannerPhoto } from "@/lib/site-design";
import { GuestSiteTheme } from "@/components/guest-site-theme";
import { GuestSiteView, loadGuestSiteContent } from "./guest-site-view";

function formatDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Shared by the metadata and the page so the lookup runs once per request.
const getWedding = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("public_weddings")
    .select("*")
    .eq("public_slug", slug)
    .maybeSingle<PublicWedding>();
  return data;
});

/**
 * What a texted or posted link unfurls into. Most guests meet the site this
 * way, so it should read as the couple's invitation -- names, date, photo --
 * not as a bare "Wren" link.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const wedding = await getWedding(slug);
  if (!wedding) return {};

  const names =
    [wedding.partner_a_name, wedding.partner_b_name].filter(Boolean).join(" & ") ||
    "Our wedding";
  const place = [wedding.venue_city, wedding.venue_state].filter(Boolean).join(", ");
  const when = wedding.wedding_date ? formatDate(wedding.wedding_date) : null;
  const title = when ? `${names} · ${when}` : names;
  const whenWhere = [when, place].filter(Boolean).join(" in ");
  const description = `You're invited! ${whenWhere ? `${whenWhere}. ` : ""}RSVP, see the schedule and travel details here.`;
  const banner = bannerPhoto(wedding);
  const images = banner ? [{ url: banner }] : undefined;

  return {
    // The couple's own page: their names, not ours, in the tab.
    title: { absolute: title },
    description,
    openGraph: { title, description, type: "website", images },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title,
      description,
      images: images?.map((image) => image.url),
    },
  };
}

export default async function PublicWeddingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const wedding = await getWedding(slug);

  if (!wedding) {
    notFound();
  }

  const content = await loadGuestSiteContent(supabase, wedding);

  return (
    <GuestSiteTheme design={parseSiteDesign(wedding.site_design)}>
      <GuestSiteView wedding={wedding} content={content} />
    </GuestSiteTheme>
  );
}
