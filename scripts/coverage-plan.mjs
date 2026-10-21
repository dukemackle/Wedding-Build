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
// Pass 4 (2026-10-17) runs in two stages, in order. Stage 1 fills the map:
// MAP_FILL lists every town of 10,000+ people with no listing within 25 miles
// (2023 Census estimates), and each needs FILL_TARGET listings in it or a
// nearby town. Stage 2 starts by itself once every MAP_FILL town is done: it
// doubles every metro target (PASS4_SIZES) and adds PASS4_METROS. Pass 1 is
// unchanged throughout.

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

// Launch metros (owner, 2026-10-21): where batch work goes deep first, in this
// order, before anything else in pass 4. `npm run coverage -- launch` shows them.
export const LAUNCH_METROS = [
  "Texas: Austin",
  "Texas: Dallas–Fort Worth",
  "Texas: Houston",
  "Texas: San Antonio, New Braunfels and Boerne",
  "New York: New York City",
  "California: Los Angeles",
  "Illinois: Chicago",
  "Florida: Miami",
];

export function metroTarget(state, metro, doubled = false) {
  return (doubled ? PASS4_SIZES : SIZES)[MARKET_SIZE[`${state}: ${metro}`] ?? "standard"];
}

// Pass 4, stage 2: doubled sizes and about two more markets per state.
export const PASS4_SIZES = Object.fromEntries(
  Object.entries(SIZES).map(([k, t]) => [k, { venues: 2 * t.venues, perCategory: 2 * t.perCategory }]),
);


// Older batch names that belong to a metro above under a shorter name.
export const AREA_ALIASES = {
  "Corpus Christi and the Rio Grande Valley":
    "Corpus Christi, South Padre and the Rio Grande Valley",
  "Killeen, Harker Heights and Temple":
    "Killeen, Harker Heights, Temple and Salado",
};

export const PASS4_METROS = {
  Alabama: ["Tuscaloosa", "Auburn–Opelika"],
  Alaska: ["Fairbanks", "Juneau"],
  Arizona: ["Prescott", "Yuma"],
  Arkansas: ["Fort Smith", "Jonesboro"],
  California: ["Lake Tahoe and Truckee", "Santa Cruz"],
  Colorado: ["Durango and Telluride", "Grand Junction"],
  Connecticut: ["Fairfield County", "Connecticut River Valley"],
  Delaware: ["Dover"],
  Florida: ["Key West and the Keys", "Daytona and New Smyrna Beach"],
  Georgia: ["Columbus", "Golden Isles"],
  Idaho: ["Idaho Falls", "McCall"],
  Illinois: ["Rockford", "Galena"],
  Indiana: ["Lafayette", "Columbus and Brown County"],
  Iowa: ["Davenport and the Quad Cities", "Dubuque"],
  Kansas: ["Manhattan", "Salina"],
  Kentucky: ["Northern Kentucky", "Paducah"],
  Louisiana: ["Lake Charles", "Monroe"],
  Maine: ["Southern Maine Coast", "Bangor"],
  Maryland: ["Western Maryland", "Southern Maryland"],
  Massachusetts: ["Springfield and the Pioneer Valley", "North Shore"],
  Michigan: ["Kalamazoo", "Holland and the Lakeshore"],
  Minnesota: ["St. Cloud", "Brainerd Lakes"],
  Mississippi: ["Hattiesburg", "Tupelo"],
  Missouri: ["Columbia", "Branson"],
  Montana: ["Helena", "Great Falls"],
  Nebraska: ["Kearney", "Grand Island"],
  "New Hampshire": ["Lakes Region", "Concord"],
  "New Jersey": ["Cape May", "South Jersey"],
  "New Mexico": ["Las Cruces", "Taos"],
  "New York": ["Catskills", "Adirondacks and Lake Placid"],
  "North Carolina": ["Boone and the High Country", "Fayetteville"],
  "North Dakota": ["Grand Forks", "Minot"],
  Ohio: ["Youngstown", "Hocking Hills"],
  Oklahoma: ["Norman", "Stillwater"],
  Oregon: ["Eugene", "Columbia River Gorge and Hood River"],
  Pennsylvania: ["State College", "Scranton and Wilkes-Barre"],
  "Rhode Island": ["South County"],
  "South Carolina": ["Beaufort", "Spartanburg"],
  "South Dakota": ["Brookings", "Aberdeen"],
  Tennessee: ["Tri-Cities", "Murfreesboro"],
  Texas: ["Galveston", "Midland and Odessa"],
  Utah: ["Ogden", "Logan"],
  Vermont: ["Woodstock and Killington", "Southern Vermont"],
  Virginia: ["Fredericksburg", "Williamsburg"],
  Washington: ["Walla Walla", "Olympic Peninsula"],
  "West Virginia": ["Huntington", "Eastern Panhandle"],
  Wisconsin: ["Wisconsin Dells", "La Crosse"],
  Wyoming: ["Casper", "Cody and Sheridan"],
};

// Pass 4, stage 1. A town is done when it and the places in "near" (within
// 15 miles) hold FILL_TARGET venues and vendors between them, or when research
// has logged FILL_DRY skipped businesses there without finding enough.
export const FILL_TARGET = { venues: 3, vendors: 3 };
export const FILL_DRY = 5;

export const MAP_FILL = {
  Alabama: [
    { town: "Troy", near: ["Banks", "Brundidge", "Goshen", "Petrey"] },
    { town: "Selma", near: ["Benton", "Orrville", "Selmont-West Selmont", "Valley Grande"] },
    { town: "Scottsboro", near: ["Dutton", "Grant", "Hollywood", "Langston", "Pisgah", "Pleasant Groves", "Powell", "Section", "Skyline", "Sylvania", "Woodville"] },
    { town: "Fort Payne", near: ["Broomtown", "Fyffe", "Hammondville", "Henagar", "Mentone", "Pine Ridge", "Powell", "Rainsville", "Shiloh", "Sylvania", "Valley Head"] },
    { town: "Jasper", near: ["Carbon Hill", "Cordova", "Dora", "Oakman", "Parrish", "Sipsey", "Sumiton"] },
    { town: "Eufaula", near: ["Bakerhill"] },
  ],
  Arizona: [
    { town: "Lake Havasu City", near: ["Crystal Beach", "Desert Hills"] },
    { town: "Kingman", near: ["Clacks Canyon", "Golden Valley", "Lazy Y U", "McConnico", "New Kingman-Butler", "Pine Lake", "Pinion Pines", "So-Hi", "Walnut Creek"] },
    { town: "Nogales", near: ["Beyerville", "Kino Springs", "Rio Rico"] },
    { town: "Payson", near: ["Bear Flat", "Beaver Valley", "Deer Creek", "East Verde Estates", "Flowing Springs", "Freedom Acres", "Geronimo Estates", "Gisela", "Kohls Ranch", "Mead Ranch", "Mesa del Caballo", "Oxbow Estates", "Pine", "Round Valley", "Rye", "Star Valley", "Strawberry", "Tonto Village", "Washington Park", "Whispering Pines"] },
    { town: "Show Low", near: ["Hondah", "Lake of the Woods", "Linden", "Pinedale", "Pinetop Country Club", "Pinetop-Lakeside", "Shumway", "Taylor", "Wagon Wheel", "White Mountain Lake"] },
    { town: "Safford", near: ["Bryce", "Cactus Flats", "Central", "Pima", "San Jose", "Solomon", "Swift Trail Junction", "Thatcher"] },
  ],
  Arkansas: [
    { town: "Pine Bluff", near: ["Altheimer", "Sherrill", "Sulphur Springs", "White Hall"] },
    { town: "El Dorado", near: ["Calion", "Junction City", "Lawson", "Louann", "Norphlet", "Smackover", "Urbana"] },
    { town: "Blytheville", near: ["Armorel", "Burdette", "Dell", "Gosnell", "Luxora", "Manila", "Victoria"] },
    { town: "Batesville", near: ["Bethesda", "Cave City", "Cushman", "Desha", "Floral", "Magness", "Moorefield", "Newark", "Oil Trough", "Pleasant Plains", "Salado", "Southside", "Sulphur Rock"] },
    { town: "Magnolia", near: ["Buckner", "Emerson", "McNeil", "Stephens", "Waldo"] },
    { town: "Arkadelphia", near: ["Bismarck", "Caddo Valley", "Donaldson", "Friendship", "Gum Springs", "Midway"] },
    { town: "Camden", near: ["Chidester", "East Camden", "Louann"] },
  ],
  California: [
    { town: "Lancaster", near: ["Acton", "Desert View Highlands", "Elizabeth Lake", "Green Valley", "Leona Valley", "Palmdale", "Quartz Hill", "Rosamond"] },
    { town: "Palmdale", near: ["Acton", "Agua Dulce", "Desert View Highlands", "Lancaster", "Leona Valley", "Littlerock", "Quartz Hill", "Sun Village"] },
    { town: "Victorville", near: ["Adelanto", "Apple Valley", "Hesperia", "Mountain View Acres", "Oak Hills", "Phelan", "Spring Valley Lake"] },
    { town: "Merced", near: ["Atwater", "Bear Creek", "Cressey", "El Nido", "Franklin", "Le Grand", "Livingston", "McSwain", "Planada", "Tuttle", "University of California-Merced", "Winton"] },
    { town: "Apple Valley", near: ["Adelanto", "Hesperia", "Mountain View Acres", "Oak Hills", "Spring Valley Lake", "Victorville"] },
    { town: "Delano", near: ["Allensworth", "Ducor", "Earlimart", "Jovista", "McFarland", "Pixley", "Richgrove", "Rodriguez Camp", "Teviston", "Wasco"] },
    { town: "El Centro", near: ["Brawley", "Calexico", "El Centro Naval Air Facility", "Heber", "Holtville", "Imperial", "Seeley"] },
    { town: "Calexico", near: ["El Centro", "El Centro Naval Air Facility", "Heber", "Holtville", "Imperial", "Seeley"] },
    { town: "Adelanto", near: ["Apple Valley", "Hesperia", "Mountain View Acres", "Oak Hills", "Phelan", "PiÃ±on Hills", "Silver Lakes", "Spring Valley Lake", "Victorville"] },
    { town: "Ridgecrest", near: ["China Lake Acres", "Inyokern", "Ridgecrest Heights"] },
    { town: "Brawley", near: ["Calipatria", "El Centro", "El Centro Naval Air Facility", "Holtville", "Imperial", "Westmorland"] },
    { town: "Barstow", near: ["Lenwood", "Yermo"] },
    { town: "Soledad", near: ["Chualar", "Gonzales", "Greenfield"] },
    { town: "Imperial", near: ["Brawley", "Calexico", "El Centro", "El Centro Naval Air Facility", "Heber", "Holtville", "Seeley", "Westmorland"] },
    { town: "Greenfield", near: ["King City", "Pine Canyon", "Soledad"] },
    { town: "Blythe", near: ["Mesa Verde", "Ripley"] },
    { town: "Coalinga", near: ["Avenal", "Huron"] },
    { town: "Avenal", near: ["Coalinga", "Huron", "Kettleman City"] },
    { town: "King City", near: ["Greenfield", "Pine Canyon", "San Lucas"] },
    { town: "California City", near: ["Boron", "North Edwards"] },
    { town: "Susanville", near: ["Janesville", "Johnstonville", "Litchfield"] },
  ],
  Colorado: [
    { town: "Sterling", near: ["Atwood", "Iliff", "Merino", "Padroni"] },
    { town: "Fort Morgan", near: ["Blue Sky", "Brush", "Hillrose", "Log Lane Village", "Morgan Heights", "Saddle Ridge", "Snyder", "Trail Side", "Weldona"] },
  ],
  Florida: [
    { town: "Belle Glade", near: ["Canal Point", "Lake Harbor", "Pahokee", "South Bay"] },
    { town: "Sebring", near: ["Avon Park", "Lake Placid", "Lemon Grove"] },
  ],
  Georgia: [
    { town: "Albany", near: ["Baconton", "Leesburg", "Putney", "Sasser"] },
    { town: "Statesboro", near: ["Brooklet", "Portal", "Pulaski", "Register"] },
    { town: "Dublin", near: ["Cadwell", "Dexter", "Dudley", "East Dublin", "Montrose", "Rentz"] },
    { town: "Americus", near: ["Andersonville", "De Soto", "Ellaville", "Leslie", "Plains", "Smithville"] },
    { town: "Moultrie", near: ["Berlin", "Coolidge", "Doerun", "Ellenton", "Funston", "Norman Park", "Sale City"] },
    { town: "Waycross", near: ["Blackshear", "Deenwood", "Dixie Union", "Hoboken", "Manor", "Sunnyside", "Waresboro"] },
    { town: "Douglas", near: ["Ambrose", "Broxton", "Nicholls", "Pearson"] },
    { town: "Vidalia", near: ["Ailey", "Alston", "Higgston", "Lyons", "Mount Vernon", "Oak Park", "Ohoopee", "Santa Claus", "Tarrytown", "Uvalda"] },
    { town: "Jesup", near: ["Gardi", "Ludowici", "Odum", "Screven"] },
  ],
  Idaho: [
    { town: "Mountain Home", near: ["Mountain Home AFB"] },
  ],
  Illinois: [
    { town: "Kankakee", near: ["Aroma Park", "Beaverville", "Bonfield", "Bourbonnais", "Bradley", "Chebanse", "Clifton", "Herscher", "Hopkins Park", "Irwin", "Limestone", "Manteno", "Martinton", "Momence", "Papineau", "Sammons Point", "St. Anne", "Sun River Terrace", "Union Hill"] },
    { town: "Freeport", near: ["Adeline", "Baileyville", "Cedarville", "Dakota", "Davis", "Forreston", "German Valley", "Lake Carroll", "Lena", "Orangeville", "Pearl City", "Pecatonica", "Ridott", "Rock City", "Shannon", "Willow Lake"] },
    { town: "Dixon", near: ["Amboy", "Ashton", "Franklin Grove", "Galt", "Grand Detour", "Harmon", "Lee Center", "Lost Nation", "Mount Morris", "Nachusa", "Nelson", "Oregon", "Polo", "Rock Falls", "Sterling"] },
    { town: "Macomb", near: ["Adair", "Bardolph", "Blandinsville", "Bushnell", "Colchester", "Georgetown", "Good Hope", "Industry", "Sciota", "Tennessee"] },
    { town: "Sterling", near: ["Coleta", "Como", "Deer Grove", "Dixon", "Galt", "Harmon", "Lyndon", "Milledgeville", "Morrison", "Nelson", "Polo", "Rock Falls", "Tampico"] },
    { town: "Mount Vernon", near: ["Ashley", "Belle Rive", "Bluford", "Bonnie", "Dahlgren", "Dix", "Ina", "Kell", "Nason", "Opdyke", "Richview", "Walnut Hill", "Waltonville", "Woodlawn"] },
    { town: "Effingham", near: ["Altamont", "Beecher City", "Dieterich", "Edgewood", "Mason", "Montrose", "Neoga", "Shumway", "Sigel", "Stewardson", "Teutopolis", "Watson", "Wheeler"] },
    { town: "Kewanee", near: ["Annawan", "Atkinson", "Bishop Hill", "Bradford", "Buda", "Cambridge", "Galva", "La Fayette", "Mineral", "Nekoma", "Neponset", "Sheffield", "Toulon", "Wyoming"] },
    { town: "Centralia", near: ["Ashley", "Central City", "Dix", "Hoffman", "Hoyleton", "Huey", "Irvington", "Junction City", "Kell", "New Minden", "Odin", "Richview", "Salem", "Sandoval", "Walnut Hill", "Wamac", "Woodlawn"] },
    { town: "Pontiac", near: ["Chenoa", "Cornell", "Fairbury", "Flanagan", "Odell", "Saunemin"] },
  ],
  Indiana: [
    { town: "Vincennes", near: ["Bicknell", "Bruceville", "Decker", "Emison", "Hazleton", "Monroe City", "Oaktown", "Ragsdale", "Wheatland"] },
    { town: "Madison", near: ["Blocher", "Brooksburg", "Canaan", "Commiskey", "Deputy", "Dupont", "Hanover", "Kent", "Lamb", "Paris Crossing"] },
  ],
  Iowa: [
    { town: "Fort Dodge", near: ["Badger", "Barnum", "Callender", "Clare", "Coalville", "Dakota City", "Duncombe", "Humboldt", "Knierim", "Lehigh", "Moorland", "Otho", "Thor", "Vincent"] },
    { town: "Muscatine", near: ["Atalissa", "Conesville", "Durant", "Fairport", "Fruitland", "Grandview", "Kent Estates", "Letts", "Montpelier", "Moscow", "Nichols", "West Liberty", "Wilton"] },
    { town: "Le Mars", near: ["Brunsville", "Craig", "Hinton", "Maurice", "Merrill", "Oyens", "Remsen", "Struble"] },
    { town: "Carroll", near: ["Arcadia", "Auburn", "Breda", "Dedham", "Glidden", "Halbur", "Lanesboro", "Lidderdale", "Ralston", "Templeton", "Westside", "Willey"] },
  ],
  Kansas: [
    { town: "Dodge City", near: ["Ensign", "Fort Dodge", "Wilroads Gardens", "Wright"] },
    { town: "Garden City", near: ["Holcomb", "Pierceville"] },
    { town: "Hays", near: ["Catharine", "Ellis", "Munjor", "Schoenchen", "Victoria"] },
    { town: "Pittsburg", near: ["Arma", "Cherokee", "Chicopee", "Croweburg", "Franklin", "Frontenac", "Girard", "Mulberry", "Opolis", "Radley", "Ringo", "Roseland", "Scammon", "Weir", "Yale"] },
    { town: "Liberal", near: [] },
    { town: "Great Bend", near: ["Albert", "Ellinwood", "Hoisington", "Olmitz", "Pawnee Rock", "Radium", "Seward"] },
  ],
  Kentucky: [
    { town: "Glasgow", near: ["Cave City", "Hiseville", "Horse Cave", "Park City", "Summer Shade"] },
  ],
  Louisiana: [
    { town: "Ruston", near: ["Choudrant", "Downsville", "Dubach", "Grambling", "Quitman", "Simsboro", "Vienna"] },
  ],
  Michigan: [
    { town: "Sault Ste. Marie", near: ["Brimley", "Kincheloe"] },
  ],
  Minnesota: [
    { town: "Hibbing", near: ["Buhl", "Chisholm", "Keewatin", "Kinney", "Nashwauk"] },
    { town: "Bemidji", near: ["Solway", "Turtle River", "Wilton"] },
    { town: "Hutchinson", near: ["Biscay", "Brownton", "Cedar Mills", "Darwin", "Dassel", "Glencoe", "Silver Lake", "Stewart"] },
    { town: "Fergus Falls", near: ["Dalton", "Elizabeth", "Erhard", "Foxhome", "Underwood"] },
    { town: "New Ulm", near: ["Courtland", "Essig", "Hanska", "Lafayette", "Nicollet", "Searles", "Sleepy Eye"] },
    { town: "Worthington", near: ["Bigelow", "Brewster", "Kinbrae", "Round Lake", "Rushmore", "Wilmont"] },
    { town: "Grand Rapids", near: ["Bovey", "Calumet", "Cohasset", "Coleraine", "Deer River", "La Prairie", "Marble", "Taconite", "Warba", "Zemple"] },
    { town: "Fairmont", near: ["Ceylon", "Granada", "Northrop", "Sherburn", "Trimont", "Truman", "Welcome"] },
  ],
  Mississippi: [
    { town: "Meridian", near: ["Chunky", "Collinsville", "Lauderdale", "Marion", "Meridian Station", "Nellieburg", "Toomsuba"] },
    { town: "Greenville", near: ["Arcola", "Elizabeth", "Leland", "Metcalfe", "Scott", "Stoneville", "Winterville"] },
    { town: "Clarksdale", near: ["Alligator", "Bobo", "Coahoma", "Dublin", "Duncan", "Farrell", "Friars Point", "Jonestown", "Lyon", "Rena Lara", "Tutwiler"] },
    { town: "Greenwood", near: ["Cruger", "Itta Bena", "Mississippi Valley State University", "Morgan City", "Schlater", "Sidon"] },
    { town: "Grenada", near: ["Duck Hill", "Elliott", "Holcomb", "Tillatoba"] },
    { town: "Cleveland", near: ["Beulah", "Boyle", "Doddsville", "Drew", "Merigold", "Mound Bayou", "Pace", "Renova", "Ruleville", "Shaw", "Shelby", "Skene", "Symonds", "Winstonville"] },
  ],
  Missouri: [
    { town: "Marshall", near: ["Arrow Rock", "Blackwater", "Gilliam", "Grand Pass", "Malta Bend", "Miami", "Mount Leonard", "Nelson", "Slater"] },
    { town: "West Plains", near: ["Brandsville", "Pomona", "South Fork"] },
    { town: "Maryville", near: ["Arkoe", "Barnard", "Burlington Junction", "Clearmont", "Clyde", "Conception", "Conception Junction", "Graham", "Guilford", "Hopkins", "Maitland", "Parnell", "Pickering", "Quitman", "Ravenwood", "Skidmore"] },
    { town: "Kennett", near: ["Bragg City", "Deering", "Denton", "Frisbee", "Holcomb", "Homestown", "Hornersville", "Pascola", "Rives", "Senath", "Steele", "White Oak"] },
  ],
  Nebraska: [
    { town: "Columbus", near: ["Bellwood", "Duncan", "Lakeview", "Monroe", "Platte Center", "Richland", "Tarnov"] },
    { town: "North Platte", near: ["Hershey", "Maxwell"] },
    { town: "Lexington", near: ["Cozad", "Elwood", "Overton", "Smithfield"] },
  ],
  Nevada: [
    { town: "Fernley", near: ["Silver Springs", "Wadsworth"] },
    { town: "Mesquite", near: ["Bunkerville"] },
    { town: "Elko", near: ["Osino", "Spring Creek"] },
  ],
  "New Mexico": [
    { town: "Roswell", near: ["Midway"] },
    { town: "Hobbs", near: ["Monument", "Nadine", "North Hobbs"] },
    { town: "Clovis", near: ["Cannon AFB", "Texico"] },
    { town: "Carlsbad", near: ["Happy Valley", "La Huerta", "Livingston Wheeler", "Loving"] },
    { town: "Alamogordo", near: ["Boles Acres", "Cloudcroft", "High Rolls", "Holloman AFB", "La Luz", "Tularosa"] },
    { town: "Gallup", near: ["Black Hat", "Catalpa Canyon", "Church Rock", "Crestview", "Fort Wingate", "Gamerco", "Iyanbito", "Pinehaven", "Purty Rock", "Rock Springs", "Sundance", "Twin Lakes", "White Cliffs", "Williams Acres", "Yah-ta-hey"] },
    { town: "Deming", near: ["Keeler Farm", "La Hacienda", "Mountain View", "Pecan Park", "Pulpotio Bareas", "Sunshine", "Ventura"] },
    { town: "Las Vegas", near: ["Tecolote"] },
    { town: "Artesia", near: ["Atoka", "Lake Arthur", "Morningside"] },
    { town: "Portales", near: ["Cannon AFB", "Floyd"] },
    { town: "Lovington", near: [] },
  ],
  "New York": [
    { town: "Utica", near: ["Barneveld", "Chadwicks", "Clark Mills", "Clayville", "Clinton", "Cold Brook", "East Frankfort", "East Herkimer", "Frankfort", "Hamilton College", "Herkimer", "Holland Patent", "Ilion", "Marcy", "Middleville", "Mohawk", "New Hartford", "New York Mills", "Newport", "Oriskany", "Poland", "Prospect", "South Ilion", "Stittville", "Washington Mills", "Waterville", "West Winfield", "Westmoreland", "Whitesboro", "Yorkville"] },
    { town: "Rome", near: ["Clark Mills", "Clinton", "Durhamville", "Hamilton College", "Holland Patent", "Lake Delta", "Marcy", "New Hartford", "New York Mills", "North Bay", "Oneida", "Oneida Castle", "Oriskany", "Sherrill", "Stittville", "Sylvan Beach", "Vernon", "Verona", "Westernville", "Westmoreland", "Whitesboro", "Yorkville"] },
    { town: "Watertown", near: ["Adams", "Adams Center", "Black River", "Brownville", "Calcium", "Chaumont", "Copenhagen", "Deferiet", "Depauville", "Dexter", "Evans Mills", "Felts Mills", "Fort Drum", "Glen Park", "Great Bend", "Herrings", "Lorraine", "Pamelia Center", "Rodman", "Sackets Harbor", "West Carthage"] },
    { town: "Oswego", near: ["Fair Haven", "Fulton", "Hannibal", "Mexico", "Minetto", "SUNY Oswego"] },
    { town: "Dunkirk", near: ["Brocton", "Cassadaga", "Forestville", "Fredonia", "Silver Creek", "Sunset Bay"] },
    { town: "Massena", near: ["Akwesasne", "Brasher Falls", "Norfolk", "Norwood", "Winthrop"] },
  ],
  "North Carolina": [
    { town: "Jacksonville", near: ["Half Moon", "Piney Green", "Pumpkin Center", "Richlands", "Sneads Ferry", "Swansboro"] },
    { town: "Lumberton", near: ["Barker Ten Mile", "Bladenboro", "Boardman", "Butters", "Elrod", "Fairmont", "McDonald", "Orrum", "Pembroke", "Proctorville", "Prospect", "Raynham", "Rennert", "St. Pauls", "Tar Heel"] },
    { town: "Elizabeth City", near: ["Camden", "Moyock", "South Mills", "Winfall"] },
    { town: "Morganton", near: ["Cajah's Mountain", "Connelly Springs", "Drexel", "Gamewell", "Glen Alpine", "Hudson", "Icard", "Nebo", "Rutherford College", "Salem", "Sawmills", "Valdese"] },
    { town: "Laurinburg", near: ["Deercroft", "East Laurinburg", "Gibson", "Laurel Hill", "Maxton", "Old Hundred", "Prospect", "Raemon", "Scotch Meadows", "Wagram", "Wakulla"] },
    { town: "Roanoke Rapids", near: ["Garysburg", "Gaston", "Halifax", "Jackson", "Littleton", "Seaboard", "South Rosemary", "South Weldon", "Weldon"] },
    { town: "Waynesville", near: ["Canton", "Clyde", "Lake Junaluska", "Maggie Valley", "Sylva", "West Canton"] },
  ],
  "North Dakota": [
    { town: "Williston", near: ["Epping", "Springbrook", "Trenton"] },
    { town: "Jamestown", near: ["Buchanan", "Spiritwood", "Spiritwood Lake", "Ypsilanti"] },
  ],
  Ohio: [
    { town: "Portsmouth", near: ["Clarktown", "Franklin Furnace", "Friendship", "Lucasville", "McDermott", "Minford", "New Boston", "Otway", "Rosemount", "Sciotodale", "South Webster", "Stockdale", "West Portsmouth", "Wheelersburg"] },
  ],
  Oklahoma: [
    { town: "Altus", near: ["Blair", "East Duke", "Elmer", "Friendship", "Headrick", "Martha", "Olustee", "Tipton"] },
    { town: "McAlester", near: ["Adamson", "Alderson", "Arpelar", "Bache", "Blanco", "Bug Tussle", "Crowder", "Haileyville", "Hartshorne", "Haywood", "Krebs", "Savanna", "Scipio"] },
    { town: "Ada", near: ["Byng", "Fittstown", "Fitzhugh", "Francis", "Konawa", "Latta", "Pickett", "Roff", "Sasakwa", "Stonewall", "Vanoss"] },
    { town: "Guymon", near: ["Goodwell", "Hough", "Optima"] },
    { town: "Weatherford", near: ["Colony", "Corn", "Custer City", "Hydro", "Thomas"] },
    { town: "Elk City", near: ["Burns Flat", "Canute", "Carter", "Sayre"] },
  ],
  Oregon: [
    { town: "Baker City", near: ["Haines"] },
  ],
  Pennsylvania: [
    { town: "St. Marys", near: ["Byrnedale", "Force", "Johnsonburg", "Kersey", "Ridgway", "Weedville", "Wilcox"] },
  ],
  "South Carolina": [
    { town: "Sumter", near: ["Ashwood", "Cane Savannah", "Cherryvale", "Dalzell", "East Sumter", "Lakewood", "Mayesville", "Mulberry", "Oakland", "Oswego", "Paxville", "Pinewood", "Privateer", "Rembert", "South Sumter", "St. Charles", "Stateburg", "Wedgefield"] },
    { town: "Greenwood", near: ["Abbeville", "Bradley", "Cokesbury", "Coronaca", "Cross Hill", "Hodges", "Ninety Six", "Promised Land", "Ware Shoals", "Waterloo"] },
  ],
  "South Dakota": [
    { town: "Huron", near: ["Alpena", "Broadland", "Cavour", "Huron Colony", "Morningside", "Pearl Creek Colony", "Riverside Colony", "Virgil", "Wolsey", "Yale"] },
  ],
  Tennessee: [
    { town: "Cookeville", near: ["Algood", "Baxter", "Dodson Branch", "Monterey", "Sparta"] },
    { town: "Morristown", near: ["Baneberry", "Bean Station", "Bulls Gap", "Dandridge", "Jefferson City", "Mooresburg", "Russellville", "Rutledge", "White Pine"] },
    { town: "Tullahoma", near: ["Decherd", "Estill Springs", "Lynchburg, Moore County metropolitan government", "Manchester", "New Union", "Normandy", "Wartrace", "Winchester"] },
    { town: "Manchester", near: ["Estill Springs", "Hillsboro", "Lakewood Park", "Morrison", "New Union", "Normandy", "Pelham", "Tullahoma", "Viola"] },
    { town: "Lawrenceburg", near: ["Ethridge", "Leoma", "Loretto", "Summertown", "Westpoint"] },
  ],
  Texas: [
    { town: "Laredo", near: ["Botines", "La Coma", "La Presa", "Laredo Ranchettes", "Laredo Ranchettes West", "Los Altos", "Los Corralitos", "Los Minerales", "Los Veteranos II", "Pueblo Nuevo", "Ranchitos East", "Ranchos Penitas West", "Rio Bravo", "San Carlos I", "San Carlos II", "Tanquecitos South Acres", "Tanquecitos South Acres II"] },
    { town: "Victoria", near: ["Bloomington", "Inez", "Placedo", "Quail Creek"] },
    { town: "Del Rio", near: ["Cienegas Terrace", "Lake View", "Laughlin AFB", "Val Verde Park"] },
    { town: "Eagle Pass", near: ["Chula Vista", "Eidson Road", "Elm Creek", "Fabrica", "Las Quintas Fronterizas", "Radar Base", "Rosita", "Seco Mines", "Siesta Acres"] },
    { town: "Lake Jackson", near: ["Angleton", "Bailey's Prairie", "Brazoria", "Clute", "Danbury", "East Columbia", "Freeport", "Holiday Lakes", "Jones Creek", "Oyster Creek", "Quintana", "Richwood", "Surfside Beach", "Sweeny", "West Columbia", "Wild Peach Village"] },
    { town: "Corsicana", near: ["Alma", "Angus", "Barry", "Blooming Grove", "Emhouse", "Eureka", "Goodlow", "Kerens", "Mildred", "Mustang", "Navarro", "Oak Valley", "Powell", "Retreat", "Rice", "Richland"] },
    { town: "Paris", near: ["Blossom", "Brookston", "Powderly", "Reno", "Roxton", "Sun Valley", "Toco"] },
    { town: "Kingsville", near: ["Bishop", "Driscoll", "Ricardo", "Riviera"] },
    { town: "Big Spring", near: ["Coahoma", "Forsan", "Sand Springs"] },
    { town: "Stephenville", near: ["Bluff Dale", "Dublin", "Huckabay", "Lingleville"] },
    { town: "Plainview", near: ["Edmonson", "Hale Center", "Kress", "Seth Ward"] },
    { town: "Palestine", near: ["Elkhart", "Neches"] },
    { town: "Brownwood", near: ["Bangs", "Blanket", "Early", "Lake Brownwood", "Thunderbird Bay", "Zephyr"] },
    { town: "Alice", near: ["Agua Dulce", "Alfred", "Alice Acres", "Amargosa", "Ben Bolt", "Coyote Acres", "Loma Linda East", "Owl Ranch", "Rancho Alegre", "Rancho Banquete", "San Diego", "South La Paloma"] },
    { town: "Bay City", near: ["Markham", "Van Vleck", "Wadsworth"] },
    { town: "Sulphur Springs", near: ["Como", "Cumby", "Tira", "Yantis"] },
    { town: "Pampa", near: ["Lefors", "Skellytown", "White Deer"] },
    { town: "Mount Pleasant", near: ["Miller's Cove", "Mount Vernon", "Omaha", "Pittsburg", "Rocky Mound", "Winfield"] },
    { town: "Uvalde", near: ["Knippa", "Uvalde Estates"] },
    { town: "Hereford", near: ["Summerfield"] },
    { town: "Dumas", near: ["Cactus", "Sunray"] },
    { town: "Athens", near: ["Brownsboro", "Callender Lake", "Caney City", "Eustace", "Log Cabin", "Malakoff", "Murchison", "Star Harbor"] },
    { town: "Andrews", near: ["McKinney Acres"] },
    { town: "Borger", near: ["Fritch", "Lake Meredith Estates", "Sanford", "Skellytown", "Stinnett"] },
    { town: "El Campo", near: ["Louise", "Wharton"] },
    { town: "Port Lavaca", near: ["Alamo Beach", "Magnolia Beach", "Placedo", "Point Comfort", "Vanderbilt"] },
    { town: "Pleasanton", near: ["Charlotte", "Christine", "Jourdanton", "Leming", "Poteet"] },
    { town: "Snyder", near: ["Hermleigh"] },
    { town: "Bonham", near: ["Bailey", "Bells", "Dodd City", "Ector", "Leonard", "Ravenna", "Savoy", "Trenton", "Whitewright", "Windom"] },
    { town: "Clute", near: ["Angleton", "Bailey's Prairie", "Brazoria", "Danbury", "East Columbia", "Freeport", "Holiday Lakes", "Jones Creek", "Lake Jackson", "Oyster Creek", "Quintana", "Richwood", "Surfside Beach", "Wild Peach Village"] },
    { town: "Freeport", near: ["Brazoria", "Clute", "Jones Creek", "Lake Jackson", "Oyster Creek", "Quintana", "Richwood", "Surfside Beach"] },
    { town: "Sweetwater", near: ["Roscoe"] },
  ],
  Utah: [
    { town: "Vernal", near: ["Jensen", "Lapoint", "Maeser", "Naples"] },
  ],
  Virginia: [
    { town: "Danville", near: ["Blairs", "Mount Hermon"] },
  ],
  Washington: [
    { town: "Moses Lake", near: ["Cascade Valley", "Marine View", "Moses Lake North", "Wheeler"] },
    { town: "Aberdeen", near: ["Aberdeen Gardens", "Brady", "Central Park", "Cosmopolis", "Hoquiam", "Markham", "Montesano", "Ocosta"] },
  ],
  Wyoming: [
    { town: "Evanston", near: ["Bear River"] },
    { town: "Riverton", near: ["Arapahoe", "Hudson"] },
  ],
};
