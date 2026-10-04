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
// Pass 2 (2026-10-04) added the second-tier and destination markets after each
// state's original metros; the daily "Batch builder" routine works through them.

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
  Alabama: ["Birmingham", "Huntsville", "Gulf Shores and Mobile"],
  Alaska: ["Anchorage", "Kenai Peninsula"],
  Arizona: ["Phoenix", "Tucson", "Sedona and Flagstaff"],
  Arkansas: ["Little Rock", "Northwest Arkansas", "Hot Springs"],
  California: [
    "Los Angeles",
    "San Francisco Bay Area",
    "San Diego",
    "Sacramento",
    "Orange County",
    "Napa and Sonoma",
    "Santa Barbara",
    "Palm Springs",
  ],
  Colorado: ["Denver", "Colorado Springs", "Vail and Aspen", "Fort Collins"],
  Connecticut: ["Hartford", "New Haven", "Mystic"],
  Delaware: ["Wilmington", "Rehoboth Beach"],
  "District of Columbia": ["Washington"],
  Florida: [
    "Miami",
    "Orlando",
    "Tampa Bay",
    "St. Augustine and Jacksonville",
    "Destin and 30A",
    "Naples and Fort Myers",
  ],
  Georgia: ["Atlanta", "Savannah", "North Georgia Mountains", "Athens"],
  Hawaii: ["Honolulu", "Maui", "Kauai", "Big Island"],
  Idaho: ["Boise", "Coeur d'Alene", "Sun Valley"],
  Illinois: ["Chicago", "Springfield", "Peoria"],
  Indiana: ["Indianapolis", "Fort Wayne", "Bloomington"],
  Iowa: ["Des Moines", "Cedar Rapids", "Iowa City"],
  Kansas: ["Wichita", "Lawrence and Topeka", "Kansas City"],
  Kentucky: ["Louisville", "Lexington", "Bowling Green"],
  Louisiana: ["New Orleans", "Baton Rouge", "Lafayette"],
  Maine: ["Portland", "Midcoast and Bar Harbor"],
  Maryland: ["Baltimore", "Annapolis", "Frederick", "Eastern Shore"],
  Massachusetts: ["Boston", "Cape Cod", "Berkshires", "Worcester"],
  Michigan: ["Detroit", "Grand Rapids", "Traverse City", "Ann Arbor"],
  Minnesota: ["Minneapolis–Saint Paul", "Duluth", "Rochester"],
  Mississippi: ["Jackson", "Gulf Coast", "Oxford"],
  Missouri: ["Kansas City", "St. Louis", "Springfield"],
  Montana: ["Bozeman", "Missoula", "Whitefish"],
  Nebraska: ["Omaha", "Lincoln"],
  Nevada: ["Las Vegas", "Reno and Lake Tahoe"],
  "New Hampshire": ["Portsmouth", "White Mountains", "Manchester"],
  "New Jersey": ["Northern New Jersey", "Jersey Shore", "Princeton"],
  "New Mexico": ["Albuquerque", "Santa Fe"],
  "New York": [
    "New York City",
    "Hudson Valley",
    "Buffalo",
    "Long Island",
    "Finger Lakes",
  ],
  "North Carolina": ["Charlotte", "Raleigh–Durham", "Asheville", "Wilmington"],
  "North Dakota": ["Fargo", "Bismarck"],
  Ohio: ["Columbus", "Cleveland", "Cincinnati", "Dayton"],
  Oklahoma: ["Oklahoma City", "Tulsa"],
  Oregon: ["Portland", "Bend", "Willamette Valley"],
  Pennsylvania: ["Philadelphia", "Pittsburgh", "Lancaster", "Poconos"],
  "Rhode Island": ["Providence and Newport"],
  "South Carolina": ["Charleston", "Greenville", "Columbia", "Myrtle Beach"],
  "South Dakota": ["Sioux Falls", "Rapid City"],
  Tennessee: ["Nashville", "Knoxville", "Memphis", "Chattanooga"],
  Texas: [
    "Austin",
    "Dallas–Fort Worth",
    "Houston",
    "San Antonio, New Braunfels and Boerne",
    "Hill Country",
    "El Paso",
    "Corpus Christi, South Padre and the Rio Grande Valley",
    "Killeen, Harker Heights, Temple and Salado",
    "Waco, Bryan–College Station and Brenham",
    "Lubbock and Amarillo",
  ],
  Utah: ["Salt Lake City", "Provo", "Park City", "St. George"],
  Vermont: ["Burlington", "Stowe"],
  Virginia: [
    "Northern Virginia",
    "Richmond",
    "Charlottesville",
    "Virginia Beach",
  ],
  Washington: ["Seattle", "Spokane", "Tacoma"],
  "West Virginia": ["Charleston", "Morgantown", "New River Gorge"],
  Wisconsin: ["Milwaukee", "Madison", "Door County"],
  Wyoming: ["Jackson Hole", "Cheyenne"],
};

// Older batch names that belong to a metro above under a shorter name.
export const AREA_ALIASES = {
  "Corpus Christi and the Rio Grande Valley":
    "Corpus Christi, South Padre and the Rio Grande Valley",
  "Killeen, Harker Heights and Temple":
    "Killeen, Harker Heights, Temple and Salado",
};
