export const REGIONS = [
  "Northeast",
  "Mid-Atlantic",
  "Southeast",
  "Midwest",
  "Southwest",
  "Mountain West",
  "Pacific Northwest",
  "West Coast",
] as const;

export const SEASONS = ["Winter", "Spring", "Summer", "Fall"] as const;

export const STYLE_TIERS = ["Simple", "Classic", "Luxury"] as const;

// Venue categories (2026-10-22), replacing six broad venue types. Stored as
// the label itself. src/lib/venue-category.ts sorts a venue into one.
export const VENUE_TYPES = [
  "Barn & Farm",
  "Ranch",
  "Historic Mansion & Estate",
  "Chapel & Church",
  "Ballroom",
  "Hotel & Resort",
  "Garden & Park",
  "Lake & River",
  "Mountain & Lodge",
  "Beach & Coast",
  "Vineyard & Winery",
  "Restaurant & Brewery",
  "Country Club & Golf",
  "Industrial Loft & Warehouse",
  "Museum, Gallery & Rooftop",
] as const;

export type VenueCategory = (typeof VENUE_TYPES)[number];

/** The six venue types used before 2026-10-22, and the closest category to each. */
export const LEGACY_VENUE_TYPES: Record<string, VenueCategory> = {
  "Barn / Rustic": "Barn & Farm",
  "Ballroom / Hotel": "Ballroom",
  "Garden / Outdoor": "Garden & Park",
  "Beach / Waterfront": "Beach & Coast",
  "Historic / Estate": "Historic Mansion & Estate",
  "Restaurant / Vineyard": "Vineyard & Winery",
};

/** A current category for any stored value: current labels pass, old ones map, anything else is null. */
export function currentVenueType(value: string | null | undefined): VenueCategory | null {
  if (!value) return null;
  if ((VENUE_TYPES as readonly string[]).includes(value)) return value as VenueCategory;
  return LEGACY_VENUE_TYPES[value] ?? null;
}

// The drawing a venue without photos shows. Six drawings cover the fifteen
// categories, each going to its nearest look.
const VENUE_TYPE_DRAWINGS: Record<VenueCategory, string> = {
  "Barn & Farm": "barn-rustic",
  Ranch: "barn-rustic",
  "Historic Mansion & Estate": "historic-estate",
  "Chapel & Church": "historic-estate",
  Ballroom: "ballroom-hotel",
  "Hotel & Resort": "ballroom-hotel",
  "Garden & Park": "garden-outdoor",
  "Lake & River": "beach-waterfront",
  "Mountain & Lodge": "garden-outdoor",
  "Beach & Coast": "beach-waterfront",
  "Vineyard & Winery": "restaurant-vineyard",
  "Restaurant & Brewery": "restaurant-vineyard",
  "Country Club & Golf": "garden-outdoor",
  "Industrial Loft & Warehouse": "ballroom-hotel",
  "Museum, Gallery & Rooftop": "historic-estate",
};

/** The venue-type drawing for a stored venue type (old labels included). */
export function venueTypeImage(value: string | null | undefined): string {
  const type = currentVenueType(value);
  return `/venue-types/${type ? VENUE_TYPE_DRAWINGS[type] : "historic-estate"}.svg`;
}

export const VENUE_SETTINGS = ["Indoor", "Outdoor", "Indoor & Outdoor"] as const;

// What a venue's preferred-vendor list is grouped by. The first nine match the
// vendor catalog's categories, so a listed vendor can be matched to Wren.
export const PREFERRED_VENDOR_CATEGORIES = [
  "Catering",
  "Bar",
  "Photography",
  "Videography",
  "Florals",
  "Music",
  "Cake",
  "Planning",
  "Transportation",
  "Hair & Makeup",
  "Rentals",
  "Officiant",
  "Stationery & Invitations",
  "Decor & Lighting",
  "Photo Booth",
  "Bridal & Formalwear",
  "Desserts",
  "Lodging",
  "Other",
] as const;

/**
 * What a vendor lists under -- the preferred-vendor categories minus Lodging,
 * which isn't a wedding vendor. "Other" stays: the vendor says what they do,
 * the admin sees it at review, and a type that keeps coming up earns its own
 * category rather than being created by whoever typed it first.
 */
export const VENDOR_LISTING_CATEGORIES = PREFERRED_VENDOR_CATEGORIES.filter((c) => c !== "Lodging");

export const SERVICE_LEVELS = {
  space_only: "Just the space",
  some_services: "Some services",
  all_inclusive: "All-inclusive",
} as const;

export const SERVICE_LEVEL_HINTS = {
  space_only: "You bring your own caterer and vendors.",
  some_services: "Some things are provided; you book the rest.",
  all_inclusive: "Catering, bar and most vendors are handled by the venue.",
} as const;

// How a venue's starting price works. "ask" shows no number at all, for
// venues that would rather not publish one.
export const PRICE_BASES = {
  rental: "Venue rental",
  package: "Packages",
  per_person: "Per person",
  minimum: "Food & drink minimum",
  ask: "Ask us",
} as const;

export const PRICE_BASIS_HINTS = {
  rental: "The space itself, starting at",
  package: "Packages starting at",
  per_person: "Per guest, starting at",
  minimum: "A minimum spend, starting at",
  ask: "We'll share pricing when couples get in touch",
} as const;

/** The tap-to-pick choices on a venue's claim form. Venues can add their own. */
export const INCLUDED_OPTIONS = [
  "Tables",
  "Chairs",
  "Linens",
  "Catering",
  "Bar service",
  "Setup & cleanup",
  "Day-of coordinator",
  "Event staff",
  "Security",
  "Getting-ready suites",
  "AV & sound",
  "Lighting",
  "Decor",
  "Ceremony arch",
  "Dance floor",
  "Cake cutting",
] as const;

export const AMENITY_OPTIONS = [
  "Bridal suite",
  "Groom's suite",
  "On-site lodging",
  "Indoor ceremony",
  "Outdoor ceremony",
  "Rain backup plan",
  "Climate-controlled",
  "Wheelchair accessible",
  "On-site parking",
  "Valet",
  "Wi-Fi",
  "Pet friendly",
  "Fire pit",
  "Late-night allowed",
  "Kitchen for caterers",
  "Restrooms on site",
] as const;

export const VENDOR_POLICIES = {
  any: "Bring any vendors",
  preferred: "Preferred list, outside vendors welcome",
  required: "Must use the venue's vendor list",
} as const;

export const ALCOHOL_POLICIES = {
  in_house: "The venue's own bar only",
  licensed: "Bring your own, served by a licensed bartender",
  byob: "Bring your own",
  none: "No alcohol",
} as const;

// Stored as the label itself, like VENUE_TYPES.
export const MUSIC_END_TIMES = [
  "9 pm",
  "9:30 pm",
  "10 pm",
  "10:30 pm",
  "11 pm",
  "11:30 pm",
  "Midnight",
  "12:30 am",
  "1 am",
  "2 am",
  "No curfew",
] as const;

// Booking lead time, deposit, curfew, rain plan and alcohol have their own
// fields now, so the suggestions stick to what those don't cover.
export const SUGGESTED_VENUE_QUESTIONS = [
  "What is your peak season?",
  "How many hours are included?",
  "Is the venue ours alone that day?",
  "When can vendors start setting up?",
] as const;

export const VENDOR_PRICE_UNITS = {
  event: "per event",
  guest: "per guest",
  hour: "per hour",
  package: "per package",
} as const;

// The questions couples ask each kind of vendor first, offered pre-filled on
// the vendor's claim form. Categories not listed get the general set.
export const SUGGESTED_VENDOR_QUESTIONS: Record<string, readonly string[]> = {
  Photography: [
    "How soon do we get our photos?",
    "Do you bring a second shooter?",
    "How many hours of coverage are included?",
    "Do you travel, and is there a fee?",
  ],
  Videography: [
    "How long is the finished film?",
    "When do we get the video?",
    "Do you film the full ceremony and speeches?",
  ],
  Catering: [
    "Do you offer tastings?",
    "Can you handle dietary restrictions?",
    "Are staff, plates and linens included?",
    "Is there a minimum guest count?",
  ],
  Bar: ["Are you licensed and insured?", "Can we supply our own alcohol?", "How many bartenders per guest?"],
  Florals: ["Is there a minimum spend?", "Do you handle setup and teardown?", "Can we reuse ceremony flowers at the reception?"],
  Music: ["Do you take song requests?", "Do you provide the sound system and microphones?", "How long do you play?"],
  Cake: ["Do you offer tastings?", "Do you deliver and set up?", "Can you do dietary-friendly cakes?"],
  Planning: ["Do you offer day-of coordination only?", "When do you start working with us?", "Do you coordinate the rehearsal?"],
  Transportation: ["How many passengers per vehicle?", "Is there a minimum booking time?"],
  "Hair & Makeup": ["Do you offer a trial?", "Do you come to us on the day?", "How many people can you get ready?"],
  "Stationery & Invitations": ["How long does printing take?", "Do you do day-of signs and menus?", "Can we see a proof first?"],
  "Decor & Lighting": ["Do you handle setup and teardown?", "Is there a delivery fee?", "Can we see the pieces in person?"],
  "Photo Booth": ["How many hours are included?", "Do guests get prints?", "Are props and an attendant included?"],
  "Bridal & Formalwear": ["How far ahead should we order?", "Are alterations included?", "Do you rent as well as sell?"],
  Desserts: ["Do you offer tastings?", "Do you deliver and set up?", "Can you do dietary-friendly options?"],
  default: ["Do you travel, and is there a fee?", "What happens if you're ill on the day?"],
};

export const CAPACITY_FILTER_STEPS = [50, 100, 150, 200, 300] as const;

export const ATTIRE_CATEGORIES = [
  "Wedding Dress",
  "Bridesmaid Dress",
  "Groom Attire",
  "Groomsmen Attire",
  "Ring - Her",
  "Ring - Him",
] as const;

export const BUY_OR_RENT_OPTIONS = ["Buy", "Rent", "Buy or Rent"] as const;

export const STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "District of Columbia",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
] as const;

/** Meteorological seasons, matching the SEASONS picker. */
export function seasonOf(date: string): (typeof SEASONS)[number] | null {
  const month = Number(date.slice(5, 7));
  if (!month) return null;
  if (month <= 2 || month === 12) return "Winter";
  if (month <= 5) return "Spring";
  if (month <= 8) return "Summer";
  return "Fall";
}
