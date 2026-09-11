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

// "Custom" starts every category at a neutral (1x) baseline instead of a
// preset multiplier, for couples/estimator users who'd rather set or
// override every category themselves than take a Simple/Classic/Luxury
// preset.
export const STYLE_TIERS = ["Simple", "Classic", "Luxury", "Custom"] as const;

export const VENUE_TYPES = [
  "Barn / Rustic",
  "Ballroom / Hotel",
  "Garden / Outdoor",
  "Beach / Waterfront",
  "Historic / Estate",
  "Restaurant / Vineyard",
] as const;

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
