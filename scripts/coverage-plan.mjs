// The 50-state coverage plan (plus DC): the metros each state's listings are
// built around, biggest wedding market first. Read by scripts/coverage.mjs.
//
// A vendor batch counts toward a metro when its name starts with the metro's
// name exactly ("Columbus: photography and florals"), so name new vendor
// batches after the metro here. Venues are counted per state.
//
// Targets: venues, 40 per metro (at least 15 in every state); vendors, 6 in
// each core category per metro. Pass 1, the floor before any marketing: every
// state has 15 venues and its first metro has every core category filled.
// Pass 2 (2026-10-04) added the second-tier and destination markets after each
// state's original metros; the daily "Batch builder" routine works through them.
// Pass 3 (2026-10-09) sizes targets by market (MARKET_SIZE below: a major
// metro needs 60 venues and 8 per category, a large one 35 and 5) and adds
// more second-tier and destination markets.
// Pass 4 (2026-10-17) doubles every target (standard 40 venues and 6 per
// category, large 70 and 10, major 120 and 16) and adds about two more
// secondary or destination markets per state, at the end of each list.

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
export const VENUES_PER_METRO = 40;
export const MIN_VENUES = 15;

export const METROS = {
  Alabama: ["Birmingham", "Huntsville", "Gulf Shores and Mobile", "Montgomery", "Tuscaloosa", "Auburn–Opelika"],
  Alaska: ["Anchorage", "Kenai Peninsula", "Fairbanks", "Juneau"],
  Arizona: ["Phoenix", "Tucson", "Sedona and Flagstaff", "Prescott", "Yuma"],
  Arkansas: ["Little Rock", "Northwest Arkansas", "Hot Springs", "Fort Smith", "Jonesboro"],
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
    "Lake Tahoe and Truckee",
    "Santa Cruz",
  ],
  Colorado: [
    "Denver",
    "Colorado Springs",
    "Vail and Aspen",
    "Fort Collins",
    "Boulder",
    "Estes Park",
    "Durango and Telluride",
    "Grand Junction",
  ],
  Connecticut: ["Hartford", "New Haven", "Mystic", "Litchfield Hills", "Fairfield County", "Connecticut River Valley"],
  Delaware: ["Wilmington", "Rehoboth Beach", "Dover"],
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
    "Key West and the Keys",
    "Daytona and New Smyrna Beach",
  ],
  Georgia: [
    "Atlanta",
    "Savannah",
    "North Georgia Mountains",
    "Athens",
    "Augusta",
    "Macon",
    "Columbus",
    "Golden Isles",
  ],
  Hawaii: ["Honolulu", "Maui", "Kauai", "Big Island"],
  Idaho: ["Boise", "Coeur d'Alene", "Sun Valley", "Idaho Falls", "McCall"],
  Illinois: ["Chicago", "Springfield", "Peoria", "Champaign–Urbana", "Rockford", "Galena"],
  Indiana: [
    "Indianapolis",
    "Fort Wayne",
    "Bloomington",
    "South Bend",
    "Evansville",
    "Lafayette",
    "Columbus and Brown County",
  ],
  Iowa: ["Des Moines", "Cedar Rapids", "Iowa City", "Davenport and the Quad Cities", "Dubuque"],
  Kansas: ["Wichita", "Lawrence and Topeka", "Kansas City", "Manhattan", "Salina"],
  Kentucky: ["Louisville", "Lexington", "Bowling Green", "Northern Kentucky", "Paducah"],
  Louisiana: ["New Orleans", "Baton Rouge", "Lafayette", "Shreveport", "Lake Charles", "Monroe"],
  Maine: ["Portland", "Midcoast and Bar Harbor", "Southern Maine Coast", "Bangor"],
  Maryland: ["Baltimore", "Annapolis", "Frederick", "Eastern Shore", "Western Maryland", "Southern Maryland"],
  Massachusetts: [
    "Boston",
    "Cape Cod",
    "Berkshires",
    "Worcester",
    "Martha's Vineyard and Nantucket",
    "Springfield and the Pioneer Valley",
    "North Shore",
  ],
  Michigan: [
    "Detroit",
    "Grand Rapids",
    "Traverse City",
    "Ann Arbor",
    "Lansing",
    "Kalamazoo",
    "Holland and the Lakeshore",
  ],
  Minnesota: ["Minneapolis–Saint Paul", "Duluth", "Rochester", "St. Cloud", "Brainerd Lakes"],
  Mississippi: ["Jackson", "Gulf Coast", "Oxford", "Hattiesburg", "Tupelo"],
  Missouri: ["Kansas City", "St. Louis", "Springfield", "Lake of the Ozarks", "Columbia", "Branson"],
  Montana: ["Bozeman", "Missoula", "Whitefish", "Billings", "Helena", "Great Falls"],
  Nebraska: ["Omaha", "Lincoln", "Kearney", "Grand Island"],
  Nevada: ["Las Vegas", "Reno and Lake Tahoe"],
  "New Hampshire": ["Portsmouth", "White Mountains", "Manchester", "Lakes Region", "Concord"],
  "New Jersey": ["Northern New Jersey", "Jersey Shore", "Princeton", "Cape May", "South Jersey"],
  "New Mexico": ["Albuquerque", "Santa Fe", "Las Cruces", "Taos"],
  "New York": [
    "New York City",
    "Hudson Valley",
    "Buffalo",
    "Long Island",
    "Finger Lakes",
    "Rochester",
    "Albany and Saratoga",
    "Syracuse",
    "Catskills",
    "Adirondacks and Lake Placid",
  ],
  "North Carolina": [
    "Charlotte",
    "Raleigh–Durham",
    "Asheville",
    "Wilmington",
    "Greensboro and Winston-Salem",
    "Outer Banks",
    "Boone and the High Country",
    "Fayetteville",
  ],
  "North Dakota": ["Fargo", "Bismarck", "Grand Forks", "Minot"],
  Ohio: [
    "Columbus",
    "Cleveland",
    "Cincinnati",
    "Dayton",
    "Toledo",
    "Akron and Canton",
    "Youngstown",
    "Hocking Hills",
  ],
  Oklahoma: ["Oklahoma City", "Tulsa", "Norman", "Stillwater"],
  Oregon: [
    "Portland",
    "Bend",
    "Willamette Valley",
    "Southern Oregon",
    "Oregon Coast",
    "Eugene",
    "Columbia River Gorge and Hood River",
  ],
  Pennsylvania: [
    "Philadelphia",
    "Pittsburgh",
    "Lancaster",
    "Poconos",
    "Lehigh Valley",
    "Harrisburg and Hershey",
    "Erie",
    "State College",
    "Scranton and Wilkes-Barre",
  ],
  "Rhode Island": ["Providence and Newport", "South County"],
  "South Carolina": [
    "Charleston",
    "Greenville",
    "Columbia",
    "Myrtle Beach",
    "Hilton Head",
    "Beaufort",
    "Spartanburg",
  ],
  "South Dakota": ["Sioux Falls", "Rapid City", "Brookings", "Aberdeen"],
  Tennessee: [
    "Nashville",
    "Knoxville",
    "Memphis",
    "Chattanooga",
    "Gatlinburg and the Smokies",
    "Tri-Cities",
    "Murfreesboro",
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
    "Galveston",
    "Midland and Odessa",
  ],
  Utah: ["Salt Lake City", "Provo", "Park City", "St. George", "Ogden", "Logan"],
  Vermont: ["Burlington", "Stowe", "Woodstock and Killington", "Southern Vermont"],
  Virginia: [
    "Northern Virginia",
    "Richmond",
    "Charlottesville",
    "Virginia Beach",
    "Shenandoah Valley",
    "Roanoke",
    "Fredericksburg",
    "Williamsburg",
  ],
  Washington: [
    "Seattle",
    "Spokane",
    "Tacoma",
    "Bellingham and the San Juan Islands",
    "Leavenworth and Chelan",
    "Walla Walla",
    "Olympic Peninsula",
  ],
  "West Virginia": ["Charleston", "Morgantown", "New River Gorge", "Huntington", "Eastern Panhandle"],
  Wisconsin: [
    "Milwaukee",
    "Madison",
    "Door County",
    "Green Bay",
    "Lake Geneva",
    "Wisconsin Dells",
    "La Crosse",
  ],
  Wyoming: ["Jackson Hole", "Cheyenne", "Casper", "Cody and Sheridan"],
};

// Pass 3 market sizes, keyed "State: Metro". Unlisted metros are "standard".
export const SIZES = {
  major: { venues: 120, perCategory: 16 },
  large: { venues: 70, perCategory: 10 },
  standard: { venues: VENUES_PER_METRO, perCategory: 2 * PER_CATEGORY },
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
