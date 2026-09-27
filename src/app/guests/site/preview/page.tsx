import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { PublicWedding, Wedding } from "@/lib/supabase/types";
import { parseSiteDesign } from "@/lib/site-design";
import { GuestSiteTheme } from "@/components/guest-site-theme";
import { GuestSiteView, loadGuestSiteContent } from "@/app/w/[slug]/guest-site-view";

export const metadata: Metadata = { title: "Guest site preview", robots: { index: false } };

/**
 * The couple's own guest site in its draft design, for the editor's preview
 * frame. Works before the site is turned on, since that's when most couples
 * will be designing it. The editor sends later changes in by postMessage.
 */
export default async function GuestSitePreviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: wedding } = await supabase
    .from("weddings")
    .select("*")
    .or(`user_id.eq.${user.id},partner_user_id.eq.${user.id}`)
    .maybeSingle<Wedding>();
  if (!wedding) notFound();

  const { data: venue } = wedding.venue_id
    ? await supabase
        .from("venues")
        .select("name, city, state")
        .eq("id", wedding.venue_id)
        .maybeSingle<{ name: string | null; city: string | null; state: string | null }>()
    : { data: null };

  // Shaped like the public view, so the preview renders through the same
  // component as the live page.
  const asGuestsSeeIt: PublicWedding = {
    id: wedding.id,
    public_slug: wedding.public_slug ?? "preview",
    partner_a_name: wedding.partner_a_name,
    partner_b_name: wedding.partner_b_name,
    wedding_date: wedding.wedding_date,
    region: wedding.region,
    hero_photo_url: wedding.hero_photo_url,
    rsvp_deadline: wedding.rsvp_deadline,
    dress_code: wedding.dress_code,
    travel_notes: wedding.travel_notes,
    venue_name: venue?.name ?? null,
    venue_city: venue?.city ?? null,
    venue_state: venue?.state ?? null,
    itinerary_published: wedding.itinerary_published,
    site_design: wedding.site_design,
  };

  const content = await loadGuestSiteContent(supabase, asGuestsSeeIt);
  const draft = parseSiteDesign(wedding.site_design_draft ?? wedding.site_design);

  return (
    <GuestSiteTheme design={draft} preview>
      <GuestSiteView wedding={asGuestsSeeIt} content={content} />
    </GuestSiteTheme>
  );
}
