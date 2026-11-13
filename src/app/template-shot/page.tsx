import { GuestSiteTheme } from "@/components/guest-site-theme";
import { GuestSiteView } from "@/app/w/[slug]/guest-site-view";
import { MOTION_PRESETS, DEFAULT_SITE_DESIGN } from "@/lib/site-design";
import { applyTemplate, TEMPLATES } from "@/lib/site-templates";
import { SAMPLE_GALLERY, SAMPLE_HERO } from "@/lib/sample-photos";
import type { PublicWedding } from "@/lib/supabase/types";
import type { GuestSiteContent } from "@/app/w/[slug]/guest-site-view";
import { notFound } from "next/navigation";

/**
 * Dev only: a template on a sample couple, still, for
 * `npm run template-pictures` to screenshot into public/site-templates (the
 * template cards' saved pictures). 404s in production.
 */

export default async function TemplateShotPage({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const { t } = await searchParams;
  const tpl = TEMPLATES.find((x) => x.id === t) ?? TEMPLATES[0];
  const design = { ...applyTemplate(DEFAULT_SITE_DESIGN, tpl), motion: { ...MOTION_PRESETS.none } };
  const wedding: PublicWedding = {
    id: "sample", public_slug: "sample", partner_a_name: "Ava", partner_b_name: "Theo",
    wedding_date: "2027-06-12", region: null, hero_photo_url: SAMPLE_HERO, rsvp_deadline: "2027-05-01",
    dress_code: null, travel_notes: null, venue_name: "The Grove", venue_city: "Austin", venue_state: "TX",
    itinerary_published: false, site_design: design, venue_photo_urls: null, venue_about: null, venue_address: null,
    site_locked: false, venue_photos_own: false, venue_latitude: null, venue_longitude: null,
    gift_venmo: null, gift_paypal: null, gift_cashapp: null, gift_zelle: null, meal_options: null, ask_dietary: false,
  };
  const content: GuestSiteContent = {
    blocks: [], registryItems: [], registryGifts: [], itineraryEvents: [], weddingFaqs: [], accommodations: [],
    guestbookEntries: [], confirmedGuests: [], partyMembers: [], photoCredits: [],
    galleryPhotos: SAMPLE_GALLERY.map((photo_url, i) => ({ id: `s${i}`, wedding_id: "sample", photo_url, sort_order: i, created_at: "" })),
  };
  return (
    <GuestSiteTheme design={design} preview>
      <GuestSiteView wedding={wedding} content={content} />
    </GuestSiteTheme>
  );
}
