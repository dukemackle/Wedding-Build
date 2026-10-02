// The 50-state coverage plan (plus DC): the metros each state's listings are
// built around, biggest wedding market first. Read by scripts/coverage.mjs.
//
// A vendor batch counts toward a metro when its name starts with the metro's
// name exactly ("Columbus: photography and florals"), so name new vendor
// batches after the metro here. Venues are counted per state.
//
// Targets: venues, 20 per metro (at least 15 in every state); vendors, 3 in
// each core category per metro. Pass 1, the floor before any marketing: every
// state has 15 venues and its first metro has every core category filled.

export const CORE_CATEGORIES = [
  "Photography",
  "Planning",
  "Florals",
  "Music",
  "Catering",
  "Hair & Makeup",
  "Cake",
  "Videography",
];

export const PER_CATEGORY = 3;
export const VENUES_PER_METRO = 20;
export const MIN_VENUES = 15;

export const METROS = {
  Alabama: ["Birmingham", "Huntsville"],
  Alaska: ["Anchorage"],
  Arizona: ["Phoenix", "Tucson"],
  Arkansas: ["Little Rock", "Northwest Arkansas"],
  California: ["Los Angeles", "San Francisco Bay Area", "San Diego", "Sacramento"],
  Colorado: ["Denver", "Colorado Springs"],
  Connecticut: ["Hartford", "New Haven"],
  Delaware: ["Wilmington"],
  "District of Columbia": ["Washington"],
  Florida: ["Miami", "Orlando", "Tampa Bay"],
  Georgia: ["Atlanta", "Savannah"],
  Hawaii: ["Honolulu", "Maui"],
  Idaho: ["Boise"],
  Illinois: ["Chicago", "Springfield"],
  Indiana: ["Indianapolis", "Fort Wayne"],
  Iowa: ["Des Moines", "Cedar Rapids"],
  Kansas: ["Wichita", "Lawrence and Topeka"],
  Kentucky: ["Louisville", "Lexington"],
  Louisiana: ["New Orleans", "Baton Rouge"],
  Maine: ["Portland"],
  Maryland: ["Baltimore", "Annapolis"],
  Massachusetts: ["Boston", "Cape Cod"],
  Michigan: ["Detroit", "Grand Rapids"],
  Minnesota: ["Minneapolis–Saint Paul", "Duluth"],
  Mississippi: ["Jackson", "Gulf Coast"],
  Missouri: ["Kansas City", "St. Louis"],
  Montana: ["Bozeman"],
  Nebraska: ["Omaha", "Lincoln"],
  Nevada: ["Las Vegas", "Reno and Lake Tahoe"],
  "New Hampshire": ["Portsmouth"],
  "New Jersey": ["Northern New Jersey", "Jersey Shore"],
  "New Mexico": ["Albuquerque", "Santa Fe"],
  "New York": ["New York City", "Hudson Valley", "Buffalo"],
  "North Carolina": ["Charlotte", "Raleigh–Durham", "Asheville"],
  "North Dakota": ["Fargo"],
  Ohio: ["Columbus", "Cleveland", "Cincinnati"],
  Oklahoma: ["Oklahoma City", "Tulsa"],
  Oregon: ["Portland", "Bend"],
  Pennsylvania: ["Philadelphia", "Pittsburgh", "Lancaster"],
  "Rhode Island": ["Providence and Newport"],
  "South Carolina": ["Charleston", "Greenville"],
  "South Dakota": ["Sioux Falls"],
  Tennessee: ["Nashville", "Knoxville", "Memphis"],
  Texas: ["Austin", "Dallas–Fort Worth", "Houston", "San Antonio, New Braunfels and Boerne"],
  Utah: ["Salt Lake City", "Provo"],
  Vermont: ["Burlington"],
  Virginia: ["Northern Virginia", "Richmond", "Charlottesville"],
  Washington: ["Seattle", "Spokane"],
  "West Virginia": ["Charleston"],
  Wisconsin: ["Milwaukee", "Madison"],
  Wyoming: ["Jackson Hole"],
};
