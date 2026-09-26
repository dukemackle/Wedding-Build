import {
  FeatureTile,
  Panel,
  Phrase,
  Small,
  buildFeatures,
  type Feature,
  type FeatureData,
} from "@/app/dashboard/feature-grid";

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
  budget: { total: 38400, target: 40000, paid: 12600, typical: 41200, quoted: 8, categories: 14 },
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
};

/** Tiles with a demo further down open it; the rest go to sign-up. */
const DEMO_LINK: Record<string, string> = {
  "/budget": "#see-it-budget",
  "/guests": "#see-it-rsvp",
  "/checklist": "#see-it-checklist",
  "/venue-layout": "#see-it-seating",
};

const BLURBS: Record<string, string> = {
  "/budget": "Real costs for your area, and every quote and payment tracked.",
  "/guests": "RSVPs, meal choices and plus-ones on one list.",
  "/venues": "Browse on a map, shortlist, and send inquiries.",
  "/vendors": "Every vendor conversation and quote in one place.",
  "/checklist": "A month-by-month plan built around your date.",
  "/attire": "Dresses, suits and rings — buy or rent, and when to order.",
  "/itinerary": "A printable run sheet for the day, hour by hour.",
  "/venue-layout": "Drag tables into your room and seat everyone.",
  "/site": "A free wedding website with your schedule and RSVP form.",
  "/ask": "An assistant that knows your budget and guest list.",
};

function landingFeatures(): Feature[] {
  const all = buildFeatures(SAMPLE);
  // Bookings and the estimator are dashboard shortcuts; a visitor is better
  // served by the two parts they'd otherwise not know exist.
  const kept = all.filter((f) => f.href !== "/bookings" && f.href !== "/budget/estimate");
  kept.push(
    {
      href: "/site",
      title: "Wedding site",
      status: "Free, shareable",
      media: (
        <Panel>
          <Phrase>Juniper &amp; Sam</Phrase>
          <Small>June 12, 2027 · RSVP by May 1</Small>
          <span className="w-fit rounded-full bg-forest px-3 py-1 font-mono-numbers text-[9px] text-parchment sm:text-[10px]">
            RSVP
          </span>
        </Panel>
      ),
    },
    {
      href: "/ask",
      title: "Ask Wren",
      status: "Built-in helper",
      media: (
        <Panel>
          <span className="w-fit max-w-[90%] rounded-2xl rounded-bl-sm bg-card px-3 py-1.5 text-[11px] text-ink/80 shadow-sm sm:text-sm">
            What should we book next?
          </span>
          <span className="ml-auto w-fit max-w-[90%] rounded-2xl rounded-br-sm bg-forest px-3 py-1.5 text-[11px] text-parchment sm:text-sm">
            Your florist — they book up 9 months out.
          </span>
        </Panel>
      ),
    },
  );
  return kept.map((f) => ({
    ...f,
    href: DEMO_LINK[f.href] ?? "/signup",
    blurb: BLURBS[f.href],
  }));
}

/**
 * The dashboard's own tiles, filled with a sample couple. Two across on a
 * phone, five on a wide screen -- the same grid a couple gets after signing up.
 */
export function LandingFeatures() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-5">
      {landingFeatures().map((feature) => (
        <FeatureTile key={feature.title} feature={feature} />
      ))}
    </div>
  );
}
