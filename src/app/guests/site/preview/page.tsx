import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { PublicWedding, SiteDesignRow, Venue, Wedding } from "@/lib/supabase/types";
import { parseWording, withWording } from "@/lib/site-designs";
import { parseSiteDesign } from "@/lib/site-design-schema";
import { GuestSiteTheme } from "@/components/guest-site-theme";
import { GuestSiteView, loadGuestSiteContent } from "@/app/w/[slug]/guest-site-view";
import { CanvasEditing } from "./canvas-editing";
import { bannerPhoto } from "@/lib/site-design";
import { SAMPLE_GALLERY, SAMPLE_HERO } from "@/lib/sample-photos";

export const metadata: Metadata = { title: "Guest site preview", robots: { index: false } };

/**
 * The couple's own guest site in its draft design, for the editor's preview
 * frame. Works before the site is turned on, since that's when most couples
 * will be designing it. The editor sends later changes in by postMessage.
 *
 * `?design=<id>` starts on that design. `?look=1` is the template gallery's
 * preview: the parent page sends the look to show, and nothing on it can be
 * dragged or retyped.
 */
export default async function GuestSitePreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ design?: string; look?: string }>;
}) {
  const { design: designId, look } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: wedding } = await supabase
    .from("weddings")
    .select("*")
    .or(`user_id.eq.${user.id},member_ids.cs.{${user.id}}`)
    .maybeSingle<Wedding>();
  if (!wedding) notFound();

  // The design row doesn't depend on the venue or the content, so it's
  // fetched alongside them rather than after.
  const rowPromise = designId
    ? supabase
        .from("site_designs")
        .select("*")
        .eq("id", designId)
        .eq("wedding_id", wedding.id)
        .maybeSingle<SiteDesignRow>()
    : Promise.resolve({ data: null });

  const { data: venue } = wedding.venue_id
    ? await supabase
        .from("venues")
        .select("name, city, state, photo_urls, about, description, address")
        .eq("id", wedding.venue_id)
        .maybeSingle<
          Pick<Venue, "name" | "city" | "state" | "photo_urls" | "about" | "description" | "address">
        >()
    : { data: null };

  const ownVenuePhotos = wedding.own_venue_photo_urls ?? [];
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
    venue_name: venue?.name ?? wedding.own_venue_name,
    venue_city: venue?.city ?? wedding.own_venue_city,
    venue_state: venue?.state ?? wedding.own_venue_state,
    itinerary_published: wedding.itinerary_published,
    site_design: wedding.site_design,
    venue_photo_urls: ownVenuePhotos.length > 0 ? ownVenuePhotos : (venue?.photo_urls ?? null),
    venue_about: venue?.about ?? venue?.description ?? null,
    venue_address: venue?.address ?? wedding.own_venue_address,
    site_locked: Boolean(wedding.site_password_hash),
    venue_photos_own: ownVenuePhotos.length > 0,
    gift_venmo: wedding.gift_venmo,
    gift_paypal: wedding.gift_paypal,
    gift_cashapp: wedding.gift_cashapp,
    gift_zelle: wedding.gift_zelle,
    meal_options: wedding.meal_options,
    ask_dietary: wedding.ask_dietary,
  };

  const [loaded, { data: row }] = await Promise.all([
    loadGuestSiteContent(supabase, asGuestsSeeIt, { preview: true }),
    rowPromise,
  ]);
  // In the template gallery, a couple with no photos yet sees samples, so a
  // photo layout is judged with a photo in it. Never in the editor's preview,
  // which shows exactly what guests would.
  const samples = Boolean(look);
  if (samples && !bannerPhoto(asGuestsSeeIt)) asGuestsSeeIt.hero_photo_url = SAMPLE_HERO;
  const content =
    samples && loaded.galleryPhotos.length === 0
      ? {
          ...loaded,
          galleryPhotos: SAMPLE_GALLERY.map((photo_url, i) => ({
            id: `sample-${i}`,
            wedding_id: wedding.id,
            photo_url,
            sort_order: i,
            created_at: "",
          })),
        }
      : loaded;
  const stored = parseSiteDesign(row ? row.design : wedding.site_design);
  const draft = row?.shared_wording ? withWording(stored, parseWording(wedding.site_wording)) : stored;

  return (
    <GuestSiteTheme design={draft} preview>
      <GuestSiteView wedding={asGuestsSeeIt} content={content} />
      {/* Dragging, resizing and the rest: here only, never on /w/[slug]. */}
      {!look && <CanvasEditing />}
    </GuestSiteTheme>
  );
}
