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

export const VENUE_TYPES = [
  "Barn / Rustic",
  "Ballroom / Hotel",
  "Garden / Outdoor",
  "Beach / Waterfront",
  "Historic / Estate",
  "Restaurant / Vineyard",
] as const;

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
  "Lodging",
  "Other",
] as const;

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

export const VENDOR_POLICIES = {
  any: "Bring any vendors",
  preferred: "Preferred list, outside vendors welcome",
  required: "Must use the venue's vendor list",
} as const;

export const SUGGESTED_VENUE_QUESTIONS = [
  "What is your peak season?",
  "How many hours are included?",
  "Can we bring our own alcohol?",
  "What's the plan if it rains?",
  "Is there a noise curfew?",
  "What deposit is required to book?",
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
  Planning: ["Do you offer day-of coordination only?", "How many weddings do you take a year?", "When should we book you?"],
  Transportation: ["How many passengers per vehicle?", "Is there a minimum booking time?"],
  default: ["How far ahead should we book?", "What deposit is required?", "Do you travel, and is there a fee?"],
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
