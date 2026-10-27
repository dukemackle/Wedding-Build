import { cache } from "react";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createGuestSiteClient, guestSiteCover } from "@/lib/supabase/guest-site";
import type { PublicWedding } from "@/lib/supabase/types";
import { parseSiteDesign } from "@/lib/site-design-schema";
import { bannerPhoto } from "@/lib/site-design";
import { GuestSiteTheme } from "@/components/guest-site-theme";
import { GuestSiteView, loadGuestSiteContent } from "./guest-site-view";
import { SiteGate } from "./site-gate";
import { findHousehold } from "@/lib/households";
import { inviteCookie } from "@/lib/invite-codes";

function formatDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Shared by the metadata and the page so the lookup runs once per request.
// The database shows the site only past its password (0121), so a locked site
// the guest hasn't opened comes back as just its cover: names, date, look.
const getSite = cache(async (slug: string) => {
  const supabase = await createGuestSiteClient(slug);
  const { data: wedding } = await supabase
    .from("public_weddings")
    .select("*")
    .eq("public_slug", slug)
    .maybeSingle<PublicWedding>();
  return { supabase, wedding, cover: wedding ? null : await guestSiteCover(slug) };
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
  const { wedding: open, cover } = await getSite(slug);
  const wedding = open ?? (cover?.site_locked ? { ...cover, venue_city: null, venue_state: null } : null);
  if (!wedding) return {};

  const names =
    [wedding.partner_a_name, wedding.partner_b_name].filter(Boolean).join(" & ") ||
    "Our wedding";
  // Behind a password, the link preview still reads as the invitation but
  // leaves out where it is, and search engines are asked to stay out.
  const place = wedding.site_locked ? "" : [wedding.venue_city, wedding.venue_state].filter(Boolean).join(", ");
  const when = wedding.wedding_date ? formatDate(wedding.wedding_date) : null;
  const title = when ? `${names} · ${when}` : names;
  const whenWhere = [when, place].filter(Boolean).join(" in ");
  const description = wedding.site_locked
    ? `You're invited!${whenWhere ? ` ${whenWhere}.` : ""} Open the site with the password from your invitation.`
    : `You're invited! ${whenWhere ? `${whenWhere}. ` : ""}RSVP, see the schedule and travel details here.`;
  const banner = bannerPhoto(wedding);
  const images = banner ? [{ url: banner }] : undefined;

  return {
    // The couple's own page: their names, not ours, in the tab.
    title: { absolute: title },
    description,
    robots: wedding.site_locked ? { index: false, follow: false } : undefined,
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
  const { supabase, wedding, cover } = await getSite(slug);

  if (!wedding) {
    if (!cover?.site_locked) notFound();
    const names = [cover.partner_a_name, cover.partner_b_name].filter(Boolean).join(" & ") || "Our wedding";
    return (
      <GuestSiteTheme design={parseSiteDesign(cover.site_design)}>
        <SiteGate slug={slug} names={names} when={cover.wedding_date ? formatDate(cover.wedding_date) : null} />
      </GuestSiteTheme>
    );
  }

  const design = parseSiteDesign(wedding.site_design);
  const [content, household] = await Promise.all([
    loadGuestSiteContent(supabase, wedding),
    findHousehold(wedding.id, (await cookies()).get(inviteCookie(slug))?.value),
  ]);

  return (
    <GuestSiteTheme design={design}>
      <GuestSiteView wedding={wedding} content={content} household={household} />
    </GuestSiteTheme>
  );
}
