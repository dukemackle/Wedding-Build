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
  venue: null,
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
  "/budget": "Real costs for your area, every quote and payment tracked, and a Google Sheet that stays in sync.",
  "/guests": "RSVPs, meals, addresses and plus-ones in one table — or keep using your Google Sheet, synced both ways.",
  "/venues": "Browse on a map, shortlist, and send inquiries.",
  "/vendors": "Every vendor conversation and quote in one place.",
  "/checklist": "A month-by-month plan built around your date.",
  "/bookings": "Everyone you book, with their contract and contact details.",
  "/attire": "Dresses, suits and rings — save favorites, then buy or rent.",
  "/itinerary": "A printable run sheet, hour by hour — and for multi-day weddings, separate RSVPs for each event, invite-only ones included.",
  "/venue-layout": "Drag tables into your room and seat everyone.",
  "/guests/site": "A free wedding website with 23 themes, from mountain and beach to barn, ranch, mehndi and Nikah, plus 58 fonts, 32 palettes, colours pulled from your own photos, patterns and textures, and your own monogram. Click any heading to restyle or reword it, and drag text, shapes, line art, watercolours and your photos from a searchable library (cropped, framed, filtered and animated) anywhere at the top of the page or in your own blocks, with a separate layout for phones, and do all of it from your phone. Add your story, photos, videos and links. Pick your venue and the site shows it, with directions and the venue's own photos where it has added them. RSVPs built in.",
};

/**
 * The dashboard's own boxes, in the dashboard's order, filled with a sample
 * couple -- the same grid a couple gets after signing up, with a line under
 * each for visitors. Each opens a preview of that feature, and the Ask Wren
 * strip below them opens a sample chat.
 */
export function LandingFeatures() {
  const items: PreviewItem[] = buildFeatures(SAMPLE).map((feature) => {
    const withBlurb = { ...feature, blurb: BLURBS[feature.href] };
    return {
      id: feature.href.slice(1),
      title: feature.title,
      blurb: withBlurb.blurb,
      tile: <FeatureTile feature={withBlurb} asBox />,
    };
  });
  return <PreviewGrid items={items} />;
}
