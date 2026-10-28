import { FeatureTile, buildFeatures, type FeatureData } from "@/app/dashboard/feature-grid";
import { PreviewGrid, type PreviewItem } from "./feature-previews";

/**
 * A made-up couple a few months into planning, so the landing page shows the
 * dashboard as it looks in use rather than a row of icons.
 */
const SAMPLE: FeatureData = {
  checklist: {
    done: 14,
    total: 43,
    next: [
      { title: "Book your photographer", due: "2027-01-14" },
      { title: "Send save-the-dates", due: "2027-02-01" },
      { title: "Taste cakes", due: "2027-02-20" },
    ],
  },
  budget: { total: 38400, actual: 31200, target: 40000, paid: 12600, quoted: 8, categories: 14 },
  guests: { total: 142, confirmed: 88, pending: 46, declined: 8 },
  venue: { photo: null, name: "Juniper Barn", booked: true },
  venuesShortlisted: 3,
  vendors: [
    { key: "venue", label: "Venue", status: "booked", detail: "Juniper Barn", href: "/venues" },
    { key: "photo", label: "Photographer", status: "booked", detail: null, href: "/vendors" },
    { key: "catering", label: "Catering", status: "quoted", detail: null, href: "/vendors" },
    { key: "music", label: "Music", status: "talking", detail: null, href: "/vendors" },
    { key: "florist", label: "Florist", status: "open", detail: null, href: "/vendors" },
  ],
  attire: null,
  attireShortlisted: 0,
  itinerary: [],
  layoutItems: 0,
  site: { names: "Juniper & Sam", date: "2027-06-12", live: true },
};

const BLURBS: Record<string, string> = {
  "/budget": "Cost estimates for your area with tax and service charges counted, every quote and payment tracked, and a Google Sheet that stays in sync.",
  "/guests": "RSVPs, meals, addresses and plus-ones in one table — or keep using your Google Sheet, synced both ways.",
  "/venues": "Browse on a map, shortlist, and send inquiries.",
  "/vendors": "Every vendor conversation and quote in one place.",
  "/checklist": "A month-by-month plan built around your date.",
  "/bookings": "Everyone you book, with their contract and contact details.",
  "/attire": "Dresses, suits and rings — save favorites, then buy or rent.",
  "/itinerary": "A printable run sheet, hour by hour — and for multi-day weddings, separate RSVPs for each event, invite-only ones included.",
  "/venue-layout": "Drag tables into your room and seat everyone.",
  "/guests/site": "A free wedding website in your names — 28 templates, your photos and story, and RSVPs built in.",
};

/**
 * On the landing page each box opens with a real wedding photo rather than the
 * dashboard's drawing, so the grid reads as weddings, not app mock-ups; the
 * demo behind each box still shows the product. All Unsplash (approved
 * 2026-10-22).
 */
const PHOTOS: Record<string, { file: string; alt: string }> = {
  "/budget": { file: "budget", alt: "A calculator and stationery among pink roses" },
  "/guests": { file: "guests", alt: "Guests cheering the couple down the aisle outdoors" },
  "/venues": { file: "venues", alt: "A lawn set for an outdoor ceremony at sunset" },
  "/vendors": { file: "vendors", alt: "A tiered wedding cake on a table outdoors in autumn" },
  "/checklist": { file: "checklist", alt: "A pen ticking items off a handwritten checklist" },
  "/bookings": { file: "bookings", alt: "A fountain pen with a drop of ink" },
  "/attire": { file: "attire", alt: "A wedding dress on a hanger" },
  "/itinerary": { file: "itinerary", alt: "A calendar open on a screen" },
  "/venue-layout": { file: "layout", alt: "Round reception tables set in a bright marquee" },
  "/guests/site": { file: "website", alt: "A guest site from You Do, I Do: names, timings, wedding party and an RSVP button" },
};

/**
 * The dashboard's own boxes, in the dashboard's order, filled with a sample
 * couple -- the same grid a couple gets after signing up, with a line under
 * each for visitors. Each opens a preview of that feature, and the Ask Wren
 * strip below them opens a sample chat.
 */
export function LandingFeatures() {
  const items: PreviewItem[] = buildFeatures(SAMPLE).map((feature) => {
    const photo = PHOTOS[feature.href];
    const withBlurb = {
      ...feature,
      blurb: BLURBS[feature.href],
      media: photo ? (
        <img
          src={`/landing/features/${photo.file}.webp`}
          alt={photo.alt}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
        />
      ) : (
        feature.media
      ),
    };
    return {
      id: feature.href.slice(1),
      title: feature.title,
      blurb: withBlurb.blurb,
      tile: <FeatureTile feature={withBlurb} asBox />,
    };
  });
  return (
    <>
      <PreviewGrid items={items} />
      <p className="mt-3 text-right text-[11px] text-ink/50">Photos: Unsplash</p>
    </>
  );
}
