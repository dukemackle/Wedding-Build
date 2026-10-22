import type { VenueBatch } from "@/lib/venue-batches";

// South Dakota venue batches. Every row's State is "South Dakota". Add new batches at the end.
const batches: VenueBatch[] = [
  {
    name: "Sioux Falls, Rapid City and the Black Hills, Brookings, Mitchell and Aberdeen",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Sanford Barn	2510 E 54th St N	Sioux Falls	South Dakota			Barn & Farm	Indoor & Outdoor	250		A 10,000-square-foot event barn on the north side of Sioux Falls with a bridal room, outdoor patio and fire pit.		(605) 312-7990	https://www.sanfordbarn.com/
Emerald Pines Barn	7621 W Maple St	Sioux Falls	South Dakota			Barn & Farm	Indoor & Outdoor	350		A purpose-built event barn with a grand hall on more than five acres of evergreen-lined grounds west of Sioux Falls.	events@emeraldpinesbarn.com	605-351-8463	https://emeraldpinesbarn.com/
Highland Conference Center	2000 Highland Way	Mitchell	South Dakota			Ballroom	Indoor	400		A ballroom-based conference centre in Mitchell linked by indoor walkway to two hotels, with on-site catering.	jill@highlandconferencecenter.com	605-990-1575	https://highlandconferencecenter.com/weddings
Hotel Alex Johnson	523 Sixth St	Rapid City	South Dakota			Hotel & Resort	Indoor			A Tudor-inspired downtown hotel that opened in 1928, with several ballrooms and guest rooms for wedding parties.	generalmanager@alexjohnson.com	605-342-1210	https://www.alexjohnson.com/groups/wedding-accommodations/
The Dakota Event Center	720 Lamont St	Aberdeen	South Dakota			Ballroom	Indoor			A banquet complex in Aberdeen with several halls, an on-site restaurant and two neighbouring hotels for guests.	info@dakotaeventcenter.com	605-725-2641	https://dakotaeventcenter.com/weddings/
Schadé Vineyard and Winery	21095 463rd Ave	Volga	South Dakota			Vineyard & Winery	Outdoor			A working vineyard and winery near Brookings with an outdoor tent for ceremonies and receptions and a guest house on site.	info@schadevineyard.com	605-627-5545	https://schadevineyard.com/
Mosaic Arts & Events	500 N Main Ave	Sioux Falls	South Dakota			Ballroom	Indoor	232		A quartzite and brick building from 1887 in uptown Sioux Falls, later renovated as an arts centre with an atrium and main hall.		605-271-9500	https://www.mosaicsiouxfalls.com/celebrate/weddings/
Washington Pavilion	301 S Main Ave	Sioux Falls	South Dakota			Ballroom	Indoor & Outdoor	300		A downtown Sioux Falls arts and science centre in a renovated historic building, with a hall stage, lobby, café and sculpture garden for weddings.	info@washingtonpavilion.org	(605) 367-6000	https://www.washingtonpavilion.org/plan-your-event/weddings/
ICON Event Hall	402 N Main Ave	Sioux Falls	South Dakota			Industrial Loft & Warehouse	Indoor & Outdoor	400		A preserved former John Deere factory building in downtown Sioux Falls with exposed brick, quartzite walls and a patio.	info@iconsiouxfalls.com	605-444-4266	https://iconsiouxfalls.com/weddings/
LuxeFalls Venue	2517 S Shirley Ave	Sioux Falls	South Dakota			Ballroom	Indoor & Outdoor	200		An all-inclusive event hall in south Sioux Falls with an indoor ceremony space, a small outdoor ceremony area and a bridal suite.	info@luxefallsvenue.com	605-650-8870	https://www.luxefallsvenue.com/
The UPB	8084 Erickson Ranch Rd	Rapid City	South Dakota			Barn & Farm	Indoor & Outdoor	150		A small barn with a patio and meadow in the hills near Rapid City, with loft and patio suites for the couple to stay in.		(605) 519-1422	https://www.the-upb.com/black-hills-wedding-venue/
The Meadow Barn at Country Orchard	1690 Willow St W	Harrisburg	South Dakota			Barn & Farm	Indoor & Outdoor	400		A tall event barn set among more than 50 acres of apple orchard south of Sioux Falls, with a veranda and chapel on the grounds.	events@themeadowbarn.com	605-370-2786	https://themeadowbarn.com/
High Country Guest Ranch	12138 Ray Smith Dr	Hill City	South Dakota			Ranch	Indoor & Outdoor	300		A guest ranch in the Black Hills west of Hill City with an indoor hall, outdoor ceremony space and on-site cabins for guests.		605-574-9003	https://highcountryranch.com/weddings/
Good Roots Farm & Gardens	3712 Medary Ave	Brookings	South Dakota			Barn & Farm	Indoor & Outdoor			A 40-acre family farm north of Brookings with a restored century-old barn, three yards, gardens and several ceremony spots.	goodrootsevents@gmail.com	(605) 691-9291	https://www.goodrootsfarmandgardens.com/
Moccasin Creek Country Club	4807 130th St NE	Aberdeen	South Dakota			Country Club & Golf	Indoor & Outdoor	200		A country club on the edge of Aberdeen with several banquet spaces, indoor and outdoor settings and its own catering.	contact@moccasincreek.com	(605) 226-0900	https://www.moccasincreekcc.com/Weddings_Events
McCrory Gardens	631 22nd Ave	Brookings	South Dakota			Garden & Park	Indoor & Outdoor			A 25-acre botanical garden on the South Dakota State University campus with formal gardens and an indoor Great Hall.	sdsu.mccrorygardens@sdstate.edu	605-688-6707	https://www.sdstate.edu/mccrory-gardens
The Farmhouse Barn	21305 Harp Rd	Sturgis	South Dakota			Barn & Farm	Indoor & Outdoor			A heated and cooled 4,000-square-foot barn on 20 acres in the Black Hills, with a farmhouse cottage that serves as the bridal suite.	thefarmhousebarn@gmail.com		https://www.thefarmhousebarn.com/
Silver Spur Ranch	10078 Wagon Wheel Trl	Belle Fourche	South Dakota			Ranch	Indoor & Outdoor	325		A 20-acre ranch venue in the northern Black Hills with a climate-controlled Grand Hall, outdoor ceremony area and honeymoon suite.		(605) 858-1853	https://www.silverspursd.com/weddings
`,
  },
  {
    name: "Rapid City and Spearfish",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Hay Camp Brewing Co.	601 Kansas City Street	Rapid City	South Dakota			Restaurant & Brewery	Indoor	120		Downtown Rapid City craft brewery with a 3,000 sq ft event hall under an art-deco roof, seating 120 for dinner and 250 standing.	haycampbrewing@gmail.com	(605) 718-1167	https://www.haycampbrewing.com/event-booking
The Barn at Aspen Acres	11011 Kellem Lane	Spearfish	South Dakota			Barn & Farm	Indoor & Outdoor	400	Classic	White-walled 2019 barn with chandeliers on an aspen-lined Spearfish property with Black Hills views, plus a social hall and A-frame cabins for lodging.	events@blackhillsbarn.com	(605) 545-2624	https://www.blackhillsbarn.com/thebarn
`,
  },
  {
    name: "Pierre, Brookings, Madison, Black Hills and Sioux Falls",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Spearfish Canyon Lodge	10619 Roughlock Falls Rd	Lead	South Dakota			Mountain & Lodge	Indoor & Outdoor	250		An all-inclusive lodge in Spearfish Canyon with a creekside ceremony spot, a stone-fireplace Great Room, a banquet room and 57 rooms, suites, cabins and creekside units on site.		605-584-3435	https://spfcanyon.com/weddings
Sylvan Lake Lodge Auditorium	24572 SD Highway 87	Custer	South Dakota			Mountain & Lodge	Indoor & Outdoor	250		An all-wood auditorium of about 3,000 square feet at the top of Needles Highway in Custer State Park, with tall forest-view windows and a connected lakeview deck for ceremonies.	info@custerresorts.com	605-255-4672	https://www.custerresorts.com/groups-events/weddings/sylvan-lake-lodge-auditorium-weddings
The Chapel Sioux Falls	610 S Dakota Ave	Sioux Falls	South Dakota			Chapel & Church	Indoor	75		A restored 1934 chapel building near downtown Sioux Falls with a full kitchen, gathering rooms and four king bedrooms that sleep up to 10 overnight guests.	sfchapelrental@gmail.com	(605) 376-1847	https://sfchapel.com/
Wilbert Square Event Center	931 25th Ave	Brookings	South Dakota			Hotel & Resort	Indoor			A newer Brookings event centre attached to a Comfort Inn & Suites, with a 10,400-square-foot grand ballroom, breakout rooms and a pre-function space.		605-692-2484	https://www.wilbertsquareeventcenter.com/
Silver Creek Events	45081 SD Highway 34	Madison	South Dakota			Ballroom	Indoor & Outdoor			A wedding and event venue on 14 landscaped acres west of Madison with indoor and outdoor spaces, a gated entrance and a library of loaner decor.	info@silvercreekevents.net	605-933-1902	https://www.silvercreekevents.net/
The Dakota Center	912 N Dakota St	Vermillion	South Dakota			Ballroom	Indoor			A Vermillion event venue with a main space plus two additional rooms for smaller and larger groups.	events@thedakotacenter.com	(605) 223-0033	https://www.thedakotacenter.com/
Old Sanctuary	928 4th St	Brookings	South Dakota			Historic Mansion & Estate	Indoor			A Brookings wedding and event venue with a 3D online tour and separate pages for facilities and FAQs.		605-692-4859	https://www.oldsanctuary.com/
Ramkota Hotel & Conference Center Pierre	920 W Sioux Ave	Pierre	South Dakota			Hotel & Resort	Indoor	600		A Pierre hotel with a roughly 6,400-square-foot ballroom and 686-square-foot dance floor, in-house catering and a free guest room for the couple.		(605) 224-6877	https://www.ramkotapierre.com/groups-meetings/weddings
Pine Haven Venue & Lodging	13514 S Highway 16	Rapid City	South Dakota			Mountain & Lodge		250		A 19-acre Black Hills venue at the base of Storm Mountain with a reception space, a full liquor licence, 30 log cabins that sleep 162 and RV sites.	pinehavensd@gmail.com	605-515-1276	https://www.pinehavenblackhills.com/venue-events
Missouri Avenue Event Center	217 W Missouri Ave	Pierre	South Dakota			Ballroom	Indoor & Outdoor	150		A Pierre event centre and wine and ale house near the river with an indoor bar, room for 150 inside and 100 outdoors, and views of LaFramboise Island.	MissouriAvenueEvents@gmail.com		https://missouriavenueevents.com/
`,
  },
  {
    name: "Statewide: Sioux Falls, Black Hills, Watertown, Pierre, Yankton, Aberdeen and Brookings",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Riviera Events & Catering	26665 481st Ave	Brandon	South Dakota			Ballroom	Indoor & Outdoor	300		A rural event hall between Brandon and Sioux Falls with an in-house caterer, a full bar and a patio for up to 75 guests.	info@rivierasiouxfalls.com	(605) 413-8780	https://www.rivierasiouxfalls.com/venue
Besler's Cadillac Ranch	19314 Helmer Rd	St. Onge	South Dakota			Ranch	Indoor & Outdoor			A Black Hills ranch of over a thousand acres on the Red Water River with a two-story reception barn, chapel, gazebo and covered bridge.	beslerscadillacranch@gmail.com	605.391.6791	https://beslerscadillacranch.com/
Diamond Spur Events Center	23826 Mill Iron Dr	Rapid City	South Dakota			Ranch	Indoor & Outdoor	300	Classic	A 7,000-square-foot ranch-style hall near Hill City with a 33-foot-ceiling Cullinan Hall, two bridal suites and a patio and lawn.	info@diamondspurevents.com		https://www.diamondspurevents.com/weddings
Prairie View Event Hall	27091 Kerslake Pl	Tea	South Dakota			Ballroom	Indoor & Outdoor	450		A light-filled 7,500-square-foot hall with cedar beams between Tea and Sioux Falls, with bridal and groom suites and open catering.	prairievieweventhall@gmail.com	(605) 743-4327	https://www.prairieviewevents.com/weddings-events
Joy Ranch of South Dakota	16633 448th Ave	Florence	South Dakota			Ranch	Indoor & Outdoor			A 126-acre horse ranch near Watertown with a lakeside hill, a historic church and a rustic reception hall for ceremonies and dancing.		605-886-4622	https://www.joyranchofsd.org/weddings
The Goss Opera House	100 E Kemp Ave	Watertown	South Dakota			Museum, Gallery & Rooftop	Indoor	275		A downtown Watertown opera house with a 275-seat dining hall, a smaller landing and studio, and a second-floor bridal retreat.	info@thegossoperahouse.com	(605) 753-0200	https://thegossoperahouse.com/weddings/
Lewis & Clark Resort	43496 Shore Dr	Yankton	South Dakota			Hotel & Resort	Indoor			A lakeside resort near Yankton whose 4,000-square-foot lodge has an 1,800-square-foot gathering room, kitchen and six bedrooms.	reservations@lewisandclarkresort.com	605-665-2680	https://www.lewisandclarkresort.com/
Larkspur Landing	1908 N Garfield Ave	Pierre	South Dakota			Hotel & Resort	Indoor	650		A 15,000-square-foot event centre in Pierre that opened in 2024, with bridal and groom suites, a long bar and a prep kitchen.	larkspurlanding605@gmail.com	605-380-7663	https://www.larkspurlanding605.com/
Bennett Barn	47439 214th St	Aurora	South Dakota			Barn & Farm	Indoor & Outdoor			A 1938 family barn near Brookings with a dance-floor loft, a covered lean-to, a back patio bar and open lawn and trees for ceremonies.	bennettbarnsd@gmail.com	605-690-3246	https://bennettbarn.net/thebarn/
Drifters Event Center	325 E Hustan Ave	Fort Pierre	South Dakota			Ballroom	Indoor	300		A modern riverfront event centre at Riverwalk Landing on the Missouri, with in-house catering and bar and lounges for the wedding party.		605.220.5014	https://www.driftersbarandgrille.com/weddings/
Generations Weddings & Events	7775 Palmer Ln	Rapid City	South Dakota			Ballroom	Indoor & Outdoor		Simple	A family-run Rapid City venue with several outdoor ceremony sites, a reception hall, and a guest house that sleeps 16.	GenerationsWeddingsAndEvents@gmail.com	(605) 390-0614	https://www.generationsweddingsandevents.com/wedding-packages
Blue Haven Barn and Gardens	46594 268th St	Sioux Falls	South Dakota			Barn & Farm	Indoor & Outdoor	500		A barn and gardens west of Sioux Falls, with terraced grounds, a newer 500-seat Atrium and a 100-seat Retreat for smaller weddings.	info@bluehavenbarn.com	605-215-1377	https://www.bluehavenbarn.com/
Old Courthouse Museum	200 W 6th St	Sioux Falls	South Dakota			Museum, Gallery & Rooftop	Indoor & Outdoor			A historic courthouse in downtown Sioux Falls whose courtroom, law library, hallway and outdoor plaza can be rented for weddings.		(605) 367-4210	https://www.siouxlandmuseums.com/index.php/welcome-to-the-siouxland-heritage-museums/rental-facilities/
Gate City Events & Lodging	47947 W 5th St	Canton	South Dakota			Ballroom	Indoor & Outdoor	350		A 7,200-square-foot rustic event centre on 15 acres at Canton, with an 11-unit motel, a rental home and a campground nearby.	gceventsllc@gmail.com	605-214-4604	https://www.gceventsllc.com/canton-sd-wedding-venues
`,
  },
  {
    name: "Map fill: Huron",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Crossroads Hotel and Huron Event Center	100 4th St SW	Huron	South Dakota			Hotel & Resort	Indoor			Downtown Huron hotel joined to the Huron Event Center and arena, giving weddings large indoor halls, an on-site restaurant and lodging for guests.	reservations@crossroadshotel.com	(800) 876-5858	https://crossroadshotelhuron.com/`,
  },
];

export default batches;
