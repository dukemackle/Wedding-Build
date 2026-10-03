import type { VenueBatch } from "@/lib/venue-batches";

// Washington venue batches. Every row's State is "Washington". Add new batches at the end.
const batches: VenueBatch[] = [
  {
    name: "Seattle, Eastside, Snohomish and Tacoma",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Novelty Hill-Januik Winery	14710 Woodinville-Redmond Road NE	Woodinville	Washington			Restaurant / Vineyard	Indoor & Outdoor	200		Modern Woodinville winery with an indoor Terrace Room above the tank room, landscaped gardens and an in-house culinary team.		425-481-5502	https://www.noveltyhilljanuik.com/weddings/
JM Cellars	14404 137th Pl NE	Woodinville	Washington			Restaurant / Vineyard	Indoor & Outdoor	100	Classic	Woodinville winery on Bramble Bump hill with a private arboretum, garden courtyard, fire pits and a loft for getting ready.	events@jmcellars.com	425.485.6508	https://www.jmcellars.com/private-events
Chateau Lill	14208 Woodinville-Redmond Rd NE	Redmond	Washington			Garden / Outdoor	Indoor & Outdoor			Family-owned French-style chateau on 10 acres of lawns, vineyard, small farm and forest near Woodinville.	info@chateaulill.com	425.466.0213	https://chateaulill.com/
The Edgewater Hotel	2411 Alaskan Way	Seattle	Washington			Beach / Waterfront	Indoor & Outdoor	220		Over-water hotel on the Seattle waterfront with an Elliott Bay ballroom, terrace room and bayside ceremony options facing the Olympics.		206.971.5703	https://www.edgewaterhotel.com/weddings
Fairmont Olympic Hotel	411 University Street	Seattle	Washington			Ballroom / Hotel	Indoor			Grand downtown hotel open since 1924 that fills a whole city block, with historic event rooms and five restaurants and bars.		206-621-1700	https://www.fairmont.com/seattle/
Chihuly Garden and Glass	305 Harrison St	Seattle	Washington			Garden / Outdoor	Indoor & Outdoor	270		Glass-art museum beside the Space Needle, with a Glasshouse under a 100-foot suspended sculpture and sculpture gardens.		206.905.2180	https://chihulygardenandglass.com/events/private
Dunn Gardens	13533 Northshire Road NW	Seattle	Washington			Garden / Outdoor	Outdoor			Historic 1914 garden in north Seattle laid out by the Olmsted Brothers, hosting elopements and small weddings on its lawns and arbors.	info@dunngardens.org	(206) 362-0933	https://dunngardens.org/weddings/
Imperia Lake Union	3119 Eastlake Ave E	Seattle	Washington			Historic / Estate	Indoor			The 1927 former Lake Union Cafe in Eastlake, a 6,000-square-foot Art Deco room overlooking the lake with in-house catering.	events@imperiaseattle.com	206-568-1258	https://imperiaseattle.com/
Robinswood House	2430 148th Ave SE	Bellevue	Washington			Historic / Estate	Indoor & Outdoor	200		City-run 1895 homestead with an 1884 log cabana, patios and a sunken garden inside 60-acre Robinswood Park.		425-865-0795	https://bellevuewa.gov/city-government/departments/parks/rentals/indoor-rentals/robinswood-house
Pickering Barn	1730 10th Ave NW	Issaquah	Washington			Barn / Rustic	Indoor & Outdoor	350		City-owned red dairy barn over 110 years old in downtown Issaquah, with 12,000 square feet of hall space and a courtyard.		425-837-3000	https://www.issaquahwa.gov/3483/Weddings
Trinity Tree Farm	14237 228th Ave SE	Issaquah	Washington			Barn / Rustic	Indoor & Outdoor	150		Hilltop tree farm with two separate venues, a cedar barn and a windowed lodge, each with its own ceremony lawn, fire pits and Mount Rainier views.	danielle@trinitytreefarm.com	(425) 391-8733	https://www.trinitytreefarm.com/weddings
Treehouse Point	6922 Preston-Fall City Rd SE	Issaquah	Washington			Garden / Outdoor	Outdoor	80		Four forested riverside acres with seven overnight treehouses, booked exclusively for small weddings.	weddings@treehousepoint.com	425-441-8087	https://www.treehousepoint.com/events
Dairyland	12125 Treoski Road	Snohomish	Washington			Barn / Rustic	Indoor & Outdoor	250		Whitewashed barn venue in the Snohomish countryside with two indoor barns, a ceremony garden and its own brewery and distillery.	dairylandvenue@gmail.com	425-367-8827	https://www.dairylandvenue.com/
Woodland Meadow Farms	13428 Shorts School Road	Snohomish	Washington			Garden / Outdoor	Outdoor			Former tree farm turned summer-only forest venue with a birch-lined path, meadow, pond bridge, bridal cottage and fire-pit garden.		425-367-8827	https://www.woodlandmeadowfarms.com/
Bloedel Reserve	7571 NE Dolphin Drive	Bainbridge Island	Washington			Garden / Outdoor	Indoor & Outdoor	100	Luxury	Forest and garden reserve on Bainbridge Island with a French-style historic residence, a back lawn and a swan pond; few events a year.		206-842-7631	https://bloedelreserve.org/weddings/
Hotel Murano	1320 Broadway	Tacoma	Washington			Ballroom / Hotel	Indoor	500		Downtown Tacoma hotel built around a glass-art collection, a walk from the museums and the Chihuly Bridge of Glass.	info@hotelmuranotacoma.com	(253) 238-8000	https://www.hotelmuranotacoma.com/meetings-events/weddings/
Tacoma's Landmark	47 St. Helens Ave	Tacoma	Washington			Historic / Estate	Indoor			Historic Stadium District building with ten ballrooms, including the Temple Theatre and a rooftop ballroom over Commencement Bay.	Sales@TacomasLandmark.com	253-272-2042	https://tacomaslandmark.com/weddings/
Tin Can Alley Tacoma	2620 East G St	Tacoma	Washington			Historic / Estate	Indoor	250		Woman-owned venue in a converted early-1900s tin can factory in the Dome District, mixing industrial bones with a ballroom finish.	info@pjhummel.com		https://www.tincanalleytacoma.com/
Thornewood Castle		Lakewood	Washington			Historic / Estate	Indoor & Outdoor			Tudor Gothic manor on American Lake with Olmsted Brothers gardens, 16th-century stained glass, a private dock and overnight rooms.	info@thornewoodcastle.com	253-584-4393	https://www.thornewoodcastle.com/`,
  },
];

export default batches;
