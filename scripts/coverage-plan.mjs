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
// Pass 3 (2026-10-09) sizes targets by market (MARKET_SIZE below: a major
// metro needs 60 venues and 8 per category, a large one 35 and 5) and adds
// more second-tier and destination markets.

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
  Alabama: ["Birmingham", "Huntsville", "Gulf Shores and Mobile", "Montgomery"],
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
    "Inland Empire and Temecula",
    "Monterey and Carmel",
    "San Luis Obispo and Paso Robles",
    "Fresno",
  ],
  Colorado: [
    "Denver",
    "Colorado Springs",
    "Vail and Aspen",
    "Fort Collins",
    "Boulder",
    "Estes Park",
  ],
  Connecticut: ["Hartford", "New Haven", "Mystic", "Litchfield Hills"],
  Delaware: ["Wilmington", "Rehoboth Beach"],
  "District of Columbia": ["Washington"],
  Florida: [
    "Miami",
    "Orlando",
    "Tampa Bay",
    "St. Augustine and Jacksonville",
    "Destin and 30A",
    "Naples and Fort Myers",
    "Fort Lauderdale and Palm Beach",
    "Sarasota",
    "Pensacola",
    "Tallahassee",
    "Gainesville",
  ],
  Georgia: [
    "Atlanta",
    "Savannah",
    "North Georgia Mountains",
    "Athens",
    "Augusta",
    "Macon",
  ],
  Hawaii: ["Honolulu", "Maui", "Kauai", "Big Island"],
  Idaho: ["Boise", "Coeur d'Alene", "Sun Valley"],
  Illinois: ["Chicago", "Springfield", "Peoria", "Champaign–Urbana"],
  Indiana: [
    "Indianapolis",
    "Fort Wayne",
    "Bloomington",
    "South Bend",
    "Evansville",
  ],
  Iowa: ["Des Moines", "Cedar Rapids", "Iowa City"],
  Kansas: ["Wichita", "Lawrence and Topeka", "Kansas City"],
  Kentucky: ["Louisville", "Lexington", "Bowling Green"],
  Louisiana: ["New Orleans", "Baton Rouge", "Lafayette", "Shreveport"],
  Maine: ["Portland", "Midcoast and Bar Harbor"],
  Maryland: ["Baltimore", "Annapolis", "Frederick", "Eastern Shore"],
  Massachusetts: [
    "Boston",
    "Cape Cod",
    "Berkshires",
    "Worcester",
    "Martha's Vineyard and Nantucket",
  ],
  Michigan: [
    "Detroit",
    "Grand Rapids",
    "Traverse City",
    "Ann Arbor",
    "Lansing",
  ],
  Minnesota: ["Minneapolis–Saint Paul", "Duluth", "Rochester"],
  Mississippi: ["Jackson", "Gulf Coast", "Oxford"],
  Missouri: ["Kansas City", "St. Louis", "Springfield", "Lake of the Ozarks"],
  Montana: ["Bozeman", "Missoula", "Whitefish", "Billings"],
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
    "Rochester",
    "Albany and Saratoga",
    "Syracuse",
  ],
  "North Carolina": [
    "Charlotte",
    "Raleigh–Durham",
    "Asheville",
    "Wilmington",
    "Greensboro and Winston-Salem",
    "Outer Banks",
  ],
  "North Dakota": ["Fargo", "Bismarck"],
  Ohio: [
    "Columbus",
    "Cleveland",
    "Cincinnati",
    "Dayton",
    "Toledo",
    "Akron and Canton",
  ],
  Oklahoma: ["Oklahoma City", "Tulsa"],
  Oregon: [
    "Portland",
    "Bend",
    "Willamette Valley",
    "Southern Oregon",
    "Oregon Coast",
  ],
  Pennsylvania: [
    "Philadelphia",
    "Pittsburgh",
    "Lancaster",
    "Poconos",
    "Lehigh Valley",
    "Harrisburg and Hershey",
    "Erie",
  ],
  "Rhode Island": ["Providence and Newport"],
  "South Carolina": [
    "Charleston",
    "Greenville",
    "Columbia",
    "Myrtle Beach",
    "Hilton Head",
  ],
  "South Dakota": ["Sioux Falls", "Rapid City"],
  Tennessee: [
    "Nashville",
    "Knoxville",
    "Memphis",
    "Chattanooga",
    "Gatlinburg and the Smokies",
  ],
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
    "Tyler and East Texas",
  ],
  Utah: ["Salt Lake City", "Provo", "Park City", "St. George"],
  Vermont: ["Burlington", "Stowe"],
  Virginia: [
    "Northern Virginia",
    "Richmond",
    "Charlottesville",
    "Virginia Beach",
    "Shenandoah Valley",
    "Roanoke",
  ],
  Washington: [
    "Seattle",
    "Spokane",
    "Tacoma",
    "Bellingham and the San Juan Islands",
    "Leavenworth and Chelan",
  ],
  "West Virginia": ["Charleston", "Morgantown", "New River Gorge"],
  Wisconsin: [
    "Milwaukee",
    "Madison",
    "Door County",
    "Green Bay",
    "Lake Geneva",
  ],
  Wyoming: ["Jackson Hole", "Cheyenne"],
};

// Pass 3 market sizes, keyed "State: Metro". Unlisted metros are "standard".
export const SIZES = {
  major: { venues: 60, perCategory: 8 },
  large: { venues: 35, perCategory: 5 },
  standard: { venues: VENUES_PER_METRO, perCategory: PER_CATEGORY },
};

const MAJOR = [
  "Arizona: Phoenix", "California: Los Angeles", "California: San Francisco Bay Area",
  "California: San Diego", "California: Orange County", "Colorado: Denver",
  "District of Columbia: Washington", "Florida: Miami", "Florida: Orlando", "Florida: Tampa Bay",
  "Georgia: Atlanta", "Illinois: Chicago", "Maryland: Baltimore", "Massachusetts: Boston",
  "Michigan: Detroit", "Minnesota: Minneapolis–Saint Paul", "Missouri: St. Louis",
  "Nevada: Las Vegas", "New Jersey: Northern New Jersey", "New York: New York City",
  "New York: Long Island", "North Carolina: Charlotte", "Oregon: Portland",
  "Pennsylvania: Philadelphia", "Tennessee: Nashville", "Texas: Austin",
  "Texas: Dallas–Fort Worth", "Texas: Houston", "Virginia: Northern Virginia", "Washington: Seattle",
];
const LARGE = [
  "Alabama: Birmingham", "Arizona: Tucson", "Arizona: Sedona and Flagstaff", "California: Sacramento",
  "California: Napa and Sonoma", "California: Santa Barbara", "California: Palm Springs",
  "California: Inland Empire and Temecula", "Colorado: Colorado Springs", "Colorado: Vail and Aspen",
  "Connecticut: Hartford", "Florida: St. Augustine and Jacksonville", "Florida: Destin and 30A",
  "Florida: Fort Lauderdale and Palm Beach", "Georgia: Savannah", "Hawaii: Honolulu", "Hawaii: Maui",
  "Idaho: Boise", "Indiana: Indianapolis", "Kentucky: Louisville", "Louisiana: New Orleans",
  "Massachusetts: Cape Cod", "Michigan: Grand Rapids", "Missouri: Kansas City", "Nebraska: Omaha",
  "New Jersey: Jersey Shore", "New Mexico: Albuquerque", "New York: Hudson Valley", "New York: Buffalo",
  "North Carolina: Raleigh–Durham", "North Carolina: Asheville", "Ohio: Columbus", "Ohio: Cleveland",
  "Ohio: Cincinnati", "Oklahoma: Oklahoma City", "Oklahoma: Tulsa", "Pennsylvania: Pittsburgh",
  "Rhode Island: Providence and Newport", "South Carolina: Charleston", "Tennessee: Memphis",
  "Tennessee: Knoxville", "Texas: San Antonio, New Braunfels and Boerne", "Texas: Hill Country",
  "Utah: Salt Lake City", "Utah: Park City", "Virginia: Richmond", "Wisconsin: Milwaukee",
  "Wisconsin: Madison",
];
export const MARKET_SIZE = Object.fromEntries([
  ...MAJOR.map((k) => [k, "major"]),
  ...LARGE.map((k) => [k, "large"]),
]);

export function metroTarget(state, metro) {
  return SIZES[MARKET_SIZE[`${state}: ${metro}`] ?? "standard"];
}

// Older batch names that belong to a metro above under a shorter name.
export const AREA_ALIASES = {
  "Corpus Christi and the Rio Grande Valley":
    "Corpus Christi, South Padre and the Rio Grande Valley",
  "Killeen, Harker Heights and Temple":
    "Killeen, Harker Heights, Temple and Salado",
};
