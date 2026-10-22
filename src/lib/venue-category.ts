/**
 * Sorts a venue into one of the 15 venue categories (VENUE_TYPES) from its
 * name and description, for batch rows that still carry one of the six old
 * venue types or none at all.
 *
 * Pure and deterministic: a few dozen regex tests per row. It runs in the
 * import and check scripts (and the admin paste box) only for rows that
 * don't already name a current category, so listings that do never pay for
 * it, and it never runs per page request.
 *
 * Order of evidence: a building word in the venue's own name ("X Winery"),
 * then the head noun of the description ("A restored barn with..."), then
 * setting words, then the old venue type refined by setting words.
 */

import { VENUE_TYPES, type VenueCategory } from "@/lib/wedding-options";

export const VENUE_CATEGORIES = VENUE_TYPES;
export type { VenueCategory };

// States with an ocean, Gulf or tidal-bay coastline. "Beach" elsewhere means a lake or river beach.
const COASTAL = new Set([
  "Alabama", "Alaska", "California", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii",
  "Louisiana", "Maine", "Maryland", "Massachusetts", "Mississippi", "New Hampshire", "New Jersey",
  "New York", "North Carolina", "Oregon", "Rhode Island", "South Carolina", "Texas", "Virginia",
  "Washington", "District of Columbia",
]);

const w = (s: string) => new RegExp(`\\b(?:${s})\\b`, "i");
type Rule = readonly [VenueCategory, RegExp];

const HOTEL_BRANDS =
  "marriott|hilton|hyatt|sheraton|westin|omni|ritz[- ]carlton|four seasons|kimpton|embassy suites|doubletree|renaissance|fairmont|loews|wyndham|crowne plaza|holiday inn|hampton inn|courtyard by|radisson|intercontinental|st\\.? regis|waldorf|graduate|hotel indigo|autograph collection|curio|tribute portfolio|aloft|le meridien|jw|ac hotel|canopy|hilton garden|homewood|best western|drury|sonesta|margaritaville|great wolf|gaylord";

// Strong building/business words in a NAME, in precedence order (first match wins).
const NAME_STRONG: Rule[] = [
  ["Country Club & Golf", w("golf|golfing|country club|yacht club|racquet club|hunt club|golf club|links at|the links|c\\.?c\\.?$")],
  ["Vineyard & Winery", w("winery|wineries|vineyards?|cellars?|wines|vino|winecellars|wine estate|wine company|wine co")],
  ["Restaurant & Brewery", w("brewery|breweries|brewing|brewpub|brewhouse|brew house|brew co|distillery|distillers?|distilling|spirits|cidery|cider house|ciderworks|meadery|taproom|tap room|taphouse|tap house|beer garden|biergarten|restaurant|ristorante|bistro|grill|grille|kitchen|steakhouse|chophouse|tavern|pub|cafe|café|eatery|trattoria|osteria|brasserie|oyster bar|oyster house|supper club|smokehouse|bbq|barbecue|pizzeria|cantina|saloon|roadhouse|wine bar|bar & grill")],
  // Greenhouses and conservatories are gardens under glass.
  ["Garden & Park", w("greenhouse|greenhouses|conservatory|glasshouse|glass house|orangery|solarium|atrium garden")],
  ["Museum, Gallery & Rooftop", w("museum|history center|heritage center|historical society|cultural center|gallery|galleries|rooftop|roof ?top|skydeck|sky deck|art center|arts center|center for the arts|aquarium|planetarium|observatory|library|athenaeum|theater|theatre|opera house|science center|zoo|zoological|exploratorium|art museum|arts district")],
  ["Chapel & Church", w("chapel|church|cathedral|basilica|abbey|synagogue|meeting ?house|kirk|wedding chapel|mission san|mission santa")],
  ["Hotel & Resort", new RegExp(`\\b(?:hotel|hotels|resort|resorts|inn|suites|motel|bed (?:and|&) breakfast|b ?& ?b|spa|${HOTEL_BRANDS})\\b`, "i")],
  ["Ranch", w("ranch|ranches|rancho|hacienda|dude ranch|guest ranch")],
  ["Barn & Farm", w("barn|barns|farm|farms|farmstead|farmhouse|homestead|orchards?|silo|silos|stables?|equestrian|creamery|dairy|grange|acres|pumpkin patch|lavender|tree farm|berry")],
  ["Industrial Loft & Warehouse", w("warehouse|loft|lofts|factory|mill|mills|foundry|depot|train station|union station|station|freight|garage|works|brickyards?|the yards|studios?|power ?house|power plant|armory|industrial|machine shop|mercantile|cannery|press|printing|ironworks|steelworks|boiler|roundhouse|terminal")],
  ["Historic Mansion & Estate", w("mansion|manor|castle|chateau|château|villa|plantation|courthouse|carriage house|historic home|homeplace|abbey|palace|hall estate|estates?")],
  ["Mountain & Lodge", w("lodge|cabins?|chalet|ski|treehouse|tree house|timberline|alpine|retreat|camp|campground|basecamp")],
  ["Ballroom", w("ballroom|ballrooms|banquets?|banquet hall|event center|events center|event centre|event hall|events hall|reception hall|reception center|event venue|event space|events venue|conference center|convention center|civic center|community center|social hall|grand hall|music hall|concert hall|dance hall|the venue|events|soirée|soiree|club|hall|center|centre|pavilion|masonic|elks|vfw|legion|loft events")],
];

// Some name words are generic: let the description decide if it has a building noun.
const NAME_WEAK = w("event center|events center|event centre|event hall|events hall|event venue|event space|events venue|the venue|events|hall|center|centre|club|pavilion|estates?|house|retreat|camp|acres|studios?|station|works|press|terminal|spa|inn");
// Lodge halls are ballrooms, not mountain lodges.
const FRATERNAL = w("elks|moose|masonic|odd fellows|knights of columbus|eagles|vfw|legion|lions club|rotary|grange hall");

// Setting words (where, not what). Used after building words fail.
const SETTING: Rule[] = [
  ["Garden & Park", w("gardens?|park|parks|arboretum|botanical|botanic|preserve|nature center|conservancy|grove|meadows?|plaza|courtyard|green|greens|commons|square")],
  ["Lake & River", w("lake|lakes|lakeside|lakefront|lakehouse|lake house|lakeshore|lakeview|river|rivers|riverside|riverfront|riverview|riverwalk|pond|ponds|creek|creekside|falls|waterfall|bayou|canal|reservoir|springs")],
  ["Beach & Coast", w("beach|beaches|beachfront|beachside|ocean|oceanfront|oceanside|seaside|sea|coast|coastal|shore|shores|harbor|harbour|bay|bayside|island|marina|pier|wharf|dunes|surf|cove|boardwalk|lighthouse|waterfront|sound")],
  ["Mountain & Lodge", w("mountain|mountains|mountaintop|mtn|peak|peaks|summit|ridge|canyon|forest|woods|woodland|pines|timber|highlands?|bluffs?|hollow|valley")],
];

// Categories a later (amenity) noun in the description may still decide.
const AMENITY_OK = new Set<VenueCategory>(["Barn & Farm", "Ranch", "Vineyard & Winery", "Country Club & Golf", "Mountain & Lodge"]);

// Head nouns in a DESCRIPTION. The earliest one wins ("A barn on a lake with a garden").
const DESC_NOUNS: Rule[] = [
  ["Country Club & Golf", w("golf club|golf clubhouse|golf course|golf resort|country club|yacht club|private club|hunt club|racquet club")],
  ["Vineyard & Winery", w("winery|wineries|vineyards?|estate wines?|tasting room|wine estate|cellar door")],
  ["Restaurant & Brewery", w("brewery|breweries|brewing company|brewpub|distillery|distilleries|cidery|meadery|taproom|restaurant|steakhouse|tavern|bistro|gastropub|beer hall|supper club|eatery")],
  ["Garden & Park", w("greenhouse|glasshouse|glass house|conservatory|orangery|solarium")],
  ["Museum, Gallery & Rooftop", w("museum|art gallery|gallery|rooftop|roof deck|roof terrace|aquarium|planetarium|library|theater|theatre|opera house|science center|zoo|observatory")],
  ["Chapel & Church", w("chapel|church|cathedral|basilica|synagogue|meeting ?house")],
  ["Hotel & Resort", w("hotel|resort|inn|bed[- ]and[- ]breakfast|b&b")],
  ["Ranch", w("ranch|hacienda|rancho")],
  ["Barn & Farm", w("barn|barns|farm|farms|farmstead|farmhouse|homestead|orchard|lavender fields?|equestrian (?:center|estate|facility)")],
  ["Industrial Loft & Warehouse", w("warehouse|loft|factory|mill|foundry|ironworks|steel mill|depot|train station|rail station|industrial|machine shop|cannery|power plant|printing (?:plant|press)|armory")],
  ["Historic Mansion & Estate", w("mansion|manor|castle|chateau|château|villa|plantation|historic home|historic house|antebellum home|victorian home|estate")],
  ["Mountain & Lodge", w("lodge|log cabin|cabins?|chalet|mountain retreat|summer camp")],
  ["Ballroom", w("ballroom|banquet hall|banquet facility|banquet center|event center|events center|event hall|reception hall|conference center|convention center|civic center|community center|social hall|music hall|concert hall|music venue|dance hall")],
];

// Ocean and Gulf words that make a coastal hotel a beach resort.
const OCEAN_WORDS = w("beach|beaches|beachfront|beachside|ocean|oceanfront|oceanside|seaside|gulf|gulf-front|gulffront|oceanview");
const LAKE_RIVER = w("lake|lakeside|lakefront|lakeshore|river|riverside|riverfront");
const LAKE_INLAND = w("lake|lakes|lakeside|lakefront|lakeshore|river|riverside|riverfront|creek|creekside|springs|pond");
const OCEAN_NAMED = w("ocean|oceanfront|oceanside|gulf|atlantic|pacific|sea|seaside");
const OCEAN_STRICT = w("ocean|gulf|sea|atlantic|pacific|beach|bay|coast|sound");

function clean(s: string) {
  return s
    .replace(/farm[- ]to[- ]table/gi, " ")
    .replace(/wine country/gi, " ")
    .replace(/\b(?:hotel|room) block/gi, " ")
    .replace(/nearby (?:hotels?|inns?)/gi, " ")
    .replace(/\b(?:cater(?:ing|ed)?|prep|chef'?s?) kitchen/gi, " ")
    // "built by an iron foundry owner": who built it, not what it is.
    .replace(/\b(?:foundry|mill|factory|ranch|farm|lumber|railroad|steel|textile) (?:owner|baron|magnate|family|founder)s?\b/gi, " ");
}

// "in Black Mountain", "near Lake Placid Falls": a town named after a setting
// isn't the setting. Case-sensitive, so only proper names are dropped.
const PLACE_NAME = /\b(?:in|near|outside|outside of|of|from|to) (?:[A-Z][a-z]+ )+(?:Mountain|Mountains|Lake|Beach|Springs|Falls|Ridge|Valley|Park|Island|Bay|Harbor|Creek|Hills?|Grove|Woods|Forest)\b/g;

type Match = { cat: VenueCategory; index: number; word: string };

function earliest(text: string, list: Rule[]): Match | null {
  let best: Match | null = null;
  for (const [cat, re] of list) {
    const m = re.exec(text);
    if (m && (best === null || m.index < best.index)) best = { cat, index: m.index, word: m[0] };
  }
  return best;
}

function firstMatch(text: string, list: Rule[]): { cat: VenueCategory; word: string } | null {
  for (const [cat, re] of list) {
    const m = re.exec(text);
    if (m) return { cat, word: m[0] };
  }
  return null;
}

// A coastal word in a state without a coast, or beside lake/river words alone, means a lake or river.
function waterFix(cat: VenueCategory, state: string, text: string): VenueCategory {
  if (cat !== "Beach & Coast") return cat;
  if (state && !COASTAL.has(state)) return "Lake & River";
  if (LAKE_RIVER.test(text) && !OCEAN_STRICT.test(text)) return "Lake & River";
  return cat;
}

export type VenueCategoryInput = {
  name?: string | null;
  description?: string | null;
  /** The row's venue type as written, often one of the six old ones. */
  venueType?: string | null;
  setting?: string | null;
  state?: string | null;
};

export type VenueCategoryResult = {
  category: VenueCategory;
  /** "name": the venue's own name said it; "description": its description's head noun; "fallback": old type and setting words. */
  confidence: "name" | "description" | "fallback";
  /** Which rule fired, for checking a dry run. */
  rule: string;
};

function classify(input: VenueCategoryInput): VenueCategoryResult {
  const n = clean(input.name ?? "");
  const rawD = input.description ?? "";
  const d = clean(rawD);
  const dSet = d.replace(PLACE_NAME, " ");
  const venueType = input.venueType ?? "";
  const state = input.state ?? "";
  const both = `${n} ${d}`;
  const res = (category: VenueCategory, confidence: VenueCategoryResult["confidence"], rule: string) => ({ category, confidence, rule });

  // 1. Fraternal lodges and halls are ballrooms.
  if (FRATERNAL.test(n) && !w("ranch|barn|farm|golf").test(n)) return res("Ballroom", "name", "fraternal hall");

  // 2. Strong building word in the name.
  let nm = firstMatch(n, NAME_STRONG);
  // Head noun = building noun in the description's opening phrase (before "with", a comma...).
  // Later nouns are usually amenities ("a garden with a chapel"); only a few categories count from there.
  const cut = d.search(/\b(?:with|plus|including|featuring|offering|where|whose|that|which|alongside|beside|next to|near)\b|[,;:.(]/i);
  const headText = cut > 0 ? d.slice(0, cut) : d;
  let descHead = earliest(headText, DESC_NOUNS);
  let fromAmenity = false;
  if (!descHead) {
    const a = earliest(d, DESC_NOUNS);
    if (a && AMENITY_OK.has(a.cat)) {
      descHead = a;
      fromAmenity = true;
    }
  }
  if (nm) {
    // "Capitol Theatre Ballroom": a ballroom named after its building.
    if (nm.cat === "Museum, Gallery & Rooftop" && /\bballroom\b/i.test(n) && /theat|opera/i.test(nm.word)) nm = { cat: "Ballroom", word: "ballroom" };
    // "The Loft on X" / "X Mill" that is really a barn.
    if (nm.cat === "Industrial Loft & Warehouse" && venueType === "Barn / Rustic" && descHead && (descHead.cat === "Barn & Farm" || descHead.cat === "Ranch"))
      return res(descHead.cat, "description", `desc:${descHead.word} (barn type beats name:${nm.word})`);
    // "The Lodge & Club Ponte Vedra Beach": a resort, not a mountain lodge.
    if (nm.cat === "Mountain & Lodge" && descHead?.cat === "Hotel & Resort" && !w("mountain|mountains|ski|alpine|forest|woods|canyon|pines").test(d))
      return res("Hotel & Resort", "description", `desc:${descHead.word} (name:${nm.word})`);
    const weakWord = n.match(NAME_WEAK)?.[0] ?? "";
    const weak = NAME_WEAK.test(nm.word) && nm.word.toLowerCase() === weakWord.toLowerCase();
    if (!weak) return res(waterFix(nm.cat, state, both), "name", `name:${nm.word}`);
    // An inn or hotel by name stays one unless the description says a winery, ranch or the like
    // ("built by a foundry owner, now a 13-room inn").
    if (nm.cat === "Hotel & Resort" && descHead && (descHead.cat === "Industrial Loft & Warehouse" || descHead.cat === "Historic Mansion & Estate") && w("inn|hotel|guest rooms|\\d+-room").test(d))
      return res("Hotel & Resort", "name", `name weak:${nm.word} (desc:${descHead.word} + inn words)`);
    // Weak name word: a building noun in the description beats it.
    if (descHead && descHead.cat !== nm.cat) return res(descHead.cat, "description", `desc:${descHead.word} (name weak:${nm.word})`);
    // "X Estate" with no clear noun: old type decides between barn and mansion.
    if (nm.cat === "Historic Mansion & Estate" && venueType === "Barn / Rustic") return res("Barn & Farm", "fallback", "estate+barn type");
    if (nm.cat === "Ballroom" || nm.cat === "Hotel & Resort" || nm.cat === "Historic Mansion & Estate") return res(nm.cat, "name", `name weak:${nm.word}`);
    // other weak words (house, retreat, station...) fall through
  }

  // 3. Garden and park named venues.
  const garden = SETTING[0][1].exec(n);
  if (garden && !w("park city|park ave|park avenue|park street|park st|park place").test(n) && (!descHead || fromAmenity))
    return res("Garden & Park", "name", `name:${garden[0]}`);

  // 4. Head noun of the description.
  if (descHead) return res(waterFix(descHead.cat, state, both), "description", `desc${fromAmenity ? " amenity" : ""}:${descHead.word}`);
  if (garden) return res("Garden & Park", "name", `name:${garden[0]}`);

  // 5. Setting word in the name (lake, beach, mountain).
  // "Red Ridge", "Hidden Hollow", "X Valley" are as often names as places: they
  // only count with mountain words in the description too. Food and wine
  // venues ("Napa Valley Wine Train") go by their old type instead.
  let ns = venueType === "Restaurant / Vineyard" ? null : firstMatch(n.replace(/\b\w+ ?views?\b/gi, " "), SETTING.slice(1));
  if (ns && /^(?:ridge|valley|hollow|bluffs?|highlands?)$/i.test(ns.word) && !w("mountain|mountains|mountaintop|forest|woods|pines|alpine|canyon|ski").test(dSet)) ns = null;
  if (ns) return res(waterFix(ns.cat, state, both), "name", `name setting:${ns.word}`);

  // 6. Fallback: old type, refined by setting words in the description (town names dropped).
  const bothSet = `${n} ${dSet}`;
  const ds = earliest(dSet, SETTING);
  const ranchy = w("ranch|cattle|cowboy|western").test(bothSet);
  const mount = w("mountain|mountains|lodge|cabins?|forest|woods|woodland|pines|alpine|canyon").test(bothSet);
  const lake = w("lake|lakeside|lakefront|river|riverside|riverfront|pond|creek|waterfront|falls").test(bothSet);
  const beach = w("beach|ocean|oceanfront|seaside|coast|coastal|gulf|bay|harbor|harbour|marina|dunes|shore").test(bothSet);
  switch (venueType) {
    case "Barn / Rustic":
      if (ranchy) return res("Ranch", "fallback", "barn type + ranch words");
      return res("Barn & Farm", "fallback", "old type");
    case "Ballroom / Hotel":
      if (w("hotel|resort|inn|guest rooms|suites").test(d)) return res("Hotel & Resort", "fallback", "hotel type + hotel words");
      return res("Ballroom", "fallback", "old type");
    case "Garden / Outdoor":
      if (beach && COASTAL.has(state)) return res(waterFix("Beach & Coast", state, bothSet), "fallback", "garden type + coast words");
      if (lake) return res("Lake & River", "fallback", "garden type + water words");
      if (mount) return res("Mountain & Lodge", "fallback", "garden type + mountain words");
      return res("Garden & Park", "fallback", "old type");
    case "Beach / Waterfront":
      if (!COASTAL.has(state) || (lake && !beach)) return res("Lake & River", "fallback", "waterfront type, lake/river");
      return res("Beach & Coast", "fallback", "old type");
    case "Historic / Estate":
      return res("Historic Mansion & Estate", "fallback", "old type");
    case "Restaurant / Vineyard":
      if (w("wine|wines|vino|grapes?").test(both)) return res("Vineyard & Winery", "fallback", "wine words");
      return res("Restaurant & Brewery", "fallback", "old type");
    default:
      if (ds) return res(waterFix(ds.cat, state, bothSet), "fallback", `no type; desc setting:${ds.word}`);
      return res("Ballroom", "fallback", "no type");
  }
}

/**
 * The category for a venue. An ocean- or Gulf-front hotel or resort in a
 * coastal state is a beach venue first: couples pick it for the beach.
 */
export function categorizeVenue(input: VenueCategoryInput): VenueCategoryResult {
  const result = classify(input);
  if (result.category !== "Hotel & Resort") return result;
  const state = input.state ?? "";
  if (!COASTAL.has(state)) return result;
  const name = input.name ?? "";
  const description = input.description ?? "";
  // The opening sentence, minus town names ("near Avila Beach").
  const opening = (description.split(/(?<=[.!?])\s/)[0] ?? "").replace(PLACE_NAME, " ");
  const inland = LAKE_INLAND.test(`${name} ${opening}`) && !OCEAN_NAMED.test(`${name} ${opening}`);
  if (!inland && (OCEAN_WORDS.test(name) || OCEAN_WORDS.test(opening))) {
    return { category: "Beach & Coast", confidence: result.confidence, rule: `${result.rule}; ocean-front` };
  }
  if (input.venueType === "Beach / Waterfront" && !(LAKE_RIVER.test(`${name} ${description}`) && !OCEAN_STRICT.test(`${name} ${description}`))) {
    return { category: "Beach & Coast", confidence: result.confidence, rule: `${result.rule}; waterfront type` };
  }
  return result;
}
