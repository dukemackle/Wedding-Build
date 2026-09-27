// Venue batches researched from each venue's own website (see the commit that
// added each one for sources and what was left out). /admin/venues offers to
// add any rows not yet in the database, so a new batch needs no pasting: add
// it here, merge, and click "Add them".
//
// Each is the same tab-separated table the import panel accepts.

export type VenueBatch = { name: string; tsv: string };

export const VENUE_BATCHES: VenueBatch[] = [
  {
    name: "Austin and Hill Country",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Harper Hill Ranch	Seguin	Texas	29.73351	-97.98662	Barn / Rustic	Indoor & Outdoor	250	Climate-controlled barn and open-air chapel on a working ranch between Austin and San Antonio, with an 1880s ranch house for overnight stays.	amy@harperhillranch.com	(512) 214-1614	https://www.harperhillranch.com
Vista West Ranch	Dripping Springs	Texas	30.27262	-98.15478	Barn / Rustic	Indoor & Outdoor		Rustic barn venue west of Austin with a biergarten and a sister property, The Creek Haus.	events@vistawestranch.com	512-894-3500	https://www.vistawestranch.com
Twisted Ranch	Oatmeal	Texas			Barn / Rustic	Indoor & Outdoor	275	Old West town on 200 acres, with a saloon reception hall, white chapel and a pond for ceremonies.	tricia@twistedranchweddings.com	512-553-5365	https://www.twistedranchweddings.com
Pecan Springs Ranch	Austin	Texas	30.21807	-97.93763	Garden / Outdoor	Indoor & Outdoor	300	Seventeen acres of pecan groves and a pond, with a climate-controlled hall and covered pavilion.	info@pecanspringsranch.com	512-632-1046	https://pecanspringsranch.com
Vintage Oaks Farm	Driftwood	Texas	30.05044	-98.01586	Garden / Outdoor	Indoor & Outdoor	150	Fifteen oak-shaded acres with an open-air chapel, garden pavilion and reception hall.	sissi@vintageoaksfarm.com	1-888-543-3487	https://www.vintageoaksfarm.com
The Allan House	Austin	Texas	30.27412	-97.74564	Historic / Estate	Indoor & Outdoor		1880s Victorian home with a courtyard, three blocks from the Texas Capitol.	events@allanhouse.com	512-478-8653	https://allanhouse.com
Springdale Station	Austin	Texas			Historic / Estate	Indoor & Outdoor		Restored early-1900s train station with two event halls and an acre of private outdoor space.	manager@springdalestation.com		https://springdalestation.com
Mae's Ridge	Johnson City	Texas	30.22485	-98.23958	Barn / Rustic	Indoor & Outdoor		Modern white barn on 28 acres near Dripping Springs, with a covered porch overlooking a courtyard.	info@maesridge.com	512-626-9219	https://www.maesridge.com
HighPointe Estate	Liberty Hill	Texas	30.70109	-97.84478	Barn / Rustic	Indoor & Outdoor		Stone-and-timber event hall and chapel on 42 acres north of Austin.	info@highpointeestate.com	512-636-9200	https://www.highpointeestate.com
The Greenhouse at Driftwood	Driftwood	Texas			Garden / Outdoor	Indoor & Outdoor		Two greenhouses and 50 acres between Onion Creek and Jackson Creek; hosts a limited number of events a year.	info@thegreenhousedriftwood.com	(512) 239-9187	https://www.thegreenhousedriftwood.com
Ma Maison	Dripping Springs	Texas	30.25203	-98.13243	Historic / Estate	Indoor & Outdoor		European-style estate with a chapel, great hall and lakeside garden ceremony sites.	info@themamaison.com	512-777-1642	https://themamaison.com
Hotel Ella	Austin	Texas	30.28272	-97.74524	Ballroom / Hotel	Indoor & Outdoor		Boutique hotel in a historic mansion near the UT campus, with a ballroom and outdoor spaces.	hello@hotelella.com	512-495-1800	https://www.hotelella.com
Kindred Oaks	Georgetown	Texas	30.57822	-97.78273	Garden / Outdoor	Outdoor		Eleven wooded acres with a covered limestone pavilion and outdoor fireplace.	elaine@kindredoaks.com	512-260-9690	https://www.kindredoaks.com
Canyonwood Ridge	Dripping Springs	Texas	30.19188	-98.02969	Garden / Outdoor	Indoor & Outdoor	300	Hill Country venue with an indoor chapel and an outdoor ceremony site.	info@canyonwoodridge.com	512-829-7029	https://www.canyonwoodridge.com
Texas Old Town	Kyle	Texas	29.96974	-97.88839	Barn / Rustic	Indoor & Outdoor	320	Frontier-town venue with four private halls, south of Austin.		512-396-1800	https://texasoldtown.com
Messina Inn	Wimberley	Texas	30.01552	-98.11642	Garden / Outdoor	Indoor & Outdoor	225	Creekside estate with an open-air ballroom and on-site lodging for 37 guests.	info@messinainntx.com		https://messinainntx.com
The Videre Estate	Wimberley	Texas			Historic / Estate	Indoor & Outdoor	300	Estate near Wimberley with a lakeside ceremony deck and reception hall.		(512) 987-2337	https://www.thevidereestate.co
Prima Vista	Wimberley	Texas	30.05053	-98.21306	Garden / Outdoor	Indoor & Outdoor	200	Bring-your-own-beverage venue with a reception hall, covered pavilion and one event per day.	info@primavistaevents.com	(737) 227-0962	https://www.primavistaevents.com
Cypress Falls Event Center	Wimberley	Texas	30.01939	-98.11748	Garden / Outdoor	Indoor & Outdoor	75	Small-wedding venue on Cypress Creek with 22 on-site hotel rooms and a tavern.	info@cypressfallsevents.com	512-847-6595	https://cypressfallsevents.com
La Bonne Vie Ranch	Fredericksburg	Texas	30.19169	-98.95426	Restaurant / Vineyard	Indoor & Outdoor		Two hundred acres with vineyards and a stream near downtown Fredericksburg.	info@labonnevieranch.com	(830) 998-7601	https://labonnevieranch.com
Cross Mountain Vineyards	Fredericksburg	Texas	30.23715	-98.82662	Restaurant / Vineyard	Indoor & Outdoor		Thirty-three-acre farm off Highway 290 with an event space and on-site cottages.		830-928-8019	https://www.crossmountainvenue.com
The Mansion Austin	Austin	Texas	30.28751	-97.74795	Historic / Estate	Indoor & Outdoor		Historic West Campus estate with a grand ballroom.	events@themansionaustin.com	(512) 476-5845	https://www.themansionaustin.com
Chateau Bellevue	Austin	Texas	30.2704	-97.74702	Historic / Estate	Indoor & Outdoor		1874 downtown chateau with a ballroom and courtyard.	sales@chateauatx.com	(512) 472-1336	https://www.chateauatx.com
The Driskill	Austin	Texas	30.26779	-97.74148	Ballroom / Hotel	Indoor		Downtown hotel dating from 1886, with a historic ballroom.		512-439-1234	https://driskillhotel.com
`,
  },
  {
    name: "San Antonio and New Braunfels",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Gruene Estate	New Braunfels	Texas	29.72516	-98.12262	Historic / Estate	Outdoor	225	The original Gruene family farm: 17 acres near the Gruene Historic District with an open-air stained-glass chapel.	info@grueneestate.com	(830) 318-5582	https://www.grueneestate.com
The Chapel at Gruene	New Braunfels	Texas	29.74974	-98.10205	Garden / Outdoor	Indoor & Outdoor	100	Small-wedding venue on 10 acres a mile from Gruene, with an outdoor chapel, reception hall and four cottages sleeping 25.	hello@chapelatgruene.com	(830) 500-5094	https://chapelatgruene.com
Hidden Gem of Gruene	New Braunfels	Texas	29.73548	-98.11021	Garden / Outdoor	Indoor & Outdoor	250	Twenty-one acres near the Guadalupe River with an oak-shaded ceremony site, climate-controlled hall and on-site lodging.	hello@hiddengemofgruene.com	830-310-0013	https://www.hiddengemofgruene.com
Geronimo Oaks	Seguin	Texas	29.72292	-97.97871	Barn / Rustic	Indoor & Outdoor	300	Family-run working ranch with two venues: The Creeks for up to 175 and West Texas for up to 300.	booking@geronimooaks.com	(512) 768-7107	https://www.geronimooaks.com
Paniolo Ranch	Boerne	Texas	29.98544	-98.69084	Garden / Outdoor	Indoor & Outdoor		Ranch bed and breakfast with a stone altar overlooking a lake, an indoor reception hall and an on-site spa.		830-505-1550	https://www.panioloranch.com
Eagle Dancer Ranch	Boerne	Texas	29.97830	-98.67416	Barn / Rustic	Indoor & Outdoor		Climate-controlled rustic venue on the Guadalupe River between Boerne and Sisterdale.	info@eagledancerranch.com	(210) 508-0344	https://www.eagledancerranch.com
Kendall Point	Boerne	Texas	29.79049	-98.60469	Barn / Rustic	Indoor & Outdoor	400	Purpose-built wedding venue from 2011 with wrap-around porches and bridal and groom suites.	kristin@kendallpoint.com	(830) 229-5090	https://www.kendallpoint.com
The Gardens at Old Town Helotes	Helotes	Texas	29.58087	-98.69379	Historic / Estate	Indoor & Outdoor	200	Manor house and landscaped grounds northwest of San Antonio, with all-inclusive packages priced by guest count.		726-263-2977	https://gardensatoldtown.com
La Escondida Celebration Center	Helotes	Texas			Garden / Outdoor	Outdoor	60	Creekside Hill Country property with a pavilion and pond patio, currently booking micro weddings.	info@laescondidacelebrationcenter.com	210-313-4209	https://www.laescondidacelebrationcenter.com
Lost Mission	Spring Branch	Texas	29.81176	-98.47687	Garden / Outdoor	Indoor & Outdoor		Sixty acres with a Spanish-style chapel, reception hall and in-house catering.		210-323-1955	https://www.lostmission.com
The Orchard at Spring Branch	Spring Branch	Texas	29.84366	-98.35946	Barn / Rustic	Indoor & Outdoor	150	Hill Country venue with a chapel, reception spaces and on-site suites.	rick@theorchardatspringbranch.com	(956) 792-3277	https://www.theorchardatspringbranch.com
The Preserve at Canyon Lake	Canyon Lake	Texas	29.87624	-98.19324	Garden / Outdoor	Indoor & Outdoor		A 15,000 sq ft venue on a wildlife preserve, with an indoor chapel, courtyard and ballroom.	info@texaspreserve.com	830-581-2238	https://texaspreserve.com
Weddings at Canyon Lakeview Resort	Canyon Lake	Texas			Beach / Waterfront	Indoor & Outdoor	250	Lakeside ceremony site and ballroom; bookings require a two-night stay in the resort's 16 lodge suites.	sales@canyonlakeviewresort.com		https://www.eventsatcanyonlakeview.com
The Gunter Hotel	San Antonio	Texas	29.42652	-98.49121	Ballroom / Hotel	Indoor		Downtown hotel with a chandelier ballroom and terrace, 311 rooms and 30 suites.		210-227-3241	https://thegunterhotel.com
The Menger Hotel	San Antonio	Texas	29.42524	-98.48694	Ballroom / Hotel	Indoor	300	Hotel on Alamo Plaza dating from 1859, with a grand ballroom and smaller historic rooms.		210-223-4361	https://www.mengerhotel.com
Hotel Emma	San Antonio	Texas	29.44437	-98.48106	Ballroom / Hotel	Indoor & Outdoor	240	Hotel in the former Pearl brewhouse, with historic indoor rooms and outdoor spaces.		(844) 845-7384	https://www.thehotelemma.com
Lambermont Events	San Antonio	Texas	29.44310	-98.46918	Historic / Estate	Indoor & Outdoor		Restored 1894 castle-style mansion with a garden ceremony area and overnight rooms for 10.		210-271-9145	https://lambermontevents.com
The Red Berry Estate	San Antonio	Texas			Historic / Estate	Indoor & Outdoor		Lakeside mansion ten minutes from downtown with a ballroom, veranda and gardens.	theredberryestate@therkgroup.com	(210) 223-2680	https://www.theredberryestate.com
San Antonio Botanical Garden	San Antonio	Texas	29.45769	-98.45955	Garden / Outdoor	Outdoor		Thirty-nine-acre botanical garden minutes from downtown that rents out event spaces.	rentthegarden@sabot.org	(210) 536-1400	https://www.sabot.org
`,
  },
  {
    name: "Fredericksburg, Kerrville, Comfort and Bandera",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Willow Sky Ranch	Willow City	Texas	30.42049	-98.69231	Barn / Rustic	Indoor & Outdoor	125	Family-run 75-acre ranch on the Willow City Loop with an oak-shaded ceremony site, an indoor hall and lodging for 20.	info@willowskyranch.com	(830) 998-5683	https://willowskyranch.com
Grand Oaks Ranch	Fredericksburg	Texas	30.32493	-98.79376	Garden / Outdoor	Outdoor	100	Private 22-acre ranch booked by the weekend, with a farmhouse and six silo homes sleeping 56 and a poolside cocktail hour.		(830) 998-3392	https://www.grandoaksranchfbg.com
Contigo Ranch	Fredericksburg	Texas	30.43922	-98.81132	Barn / Rustic			Ranch north of town with historic cabins and modern cottages for guests, and longhorns and Highland cattle on the land.	info@contigoranch.com	(830) 685-3464	https://contigoranchfredericksburg.com
Hoffman Haus	Fredericksburg	Texas	30.26758	-98.86605	Historic / Estate	Indoor & Outdoor	150	Inn a few blocks from Main Street with a garden ceremony site, a reception hall in an 1840s tobacco barn and 22 rooms on site.	info@hoffmanhaus.com	(830) 997-6739	https://www.hoffmanhaus.com
Becker Vineyards	Fredericksburg	Texas	30.20311	-98.70904	Restaurant / Vineyard	Indoor & Outdoor	300	Estate winery near Stonewall with a covered pavilion facing the sunset for up to 300 and the smaller Lavender Haus for about 100.	info@beckerwines.com	(830) 644-2681	https://www.beckervineyards.com
Barons CreekSide	Fredericksburg	Texas	30.26166	-98.85148	Restaurant / Vineyard	Outdoor		Cabin resort on 26 acres with two creeks and a vineyard, hosting weddings and elopements outdoors among the vines.	stay@baronscreekside.com	(830) 990-4048	https://www.baronscreekside.com
The Riverhill Mansion	Kerrville	Texas	30.02273	-99.13730	Historic / Estate	Indoor & Outdoor	150	Early-1900s mansion on a private country club, with ceremonies by the water, on the lawn or inside; the banquet hall seats 150.		(830) 896-1400	https://riverhillmansion.com
Y.O. Ranch Hotel	Kerrville	Texas	30.06631	-99.11735	Ballroom / Hotel	Indoor	600	Western-themed hotel with over 11,000 sq ft of event space, a ballroom for up to 600 and in-house catering.	reservations@yoranchhotel.com	(830) 257-4440	https://www.yoranchhotel.com
Inn of the Hills	Kerrville	Texas	30.05811	-99.16276	Ballroom / Hotel	Indoor	600	Hotel and conference centre with a 20-foot-ceilinged ballroom for up to 600 and smaller rooms from 10 guests.	reservations@innofthehills.com	(830) 895-5000	https://www.innofthehills.com
Roddy Tree Ranch	Ingram	Texas			Garden / Outdoor	Outdoor	60	Small-wedding site on a 50-acre ranch, with an arch on the Guadalupe River bank and a part-covered pavilion with bar and kitchen.	keith@roddytree.com		https://www.roddytree.com
Spinelli's	Comfort	Texas	29.96641	-98.91262	Historic / Estate	Indoor & Outdoor	250	All-inclusive venue built around a century-old rock chapel, with a dining hall, dance hall, gardens and two guest houses.	info@dreamweddingtx.com	(830) 446-0264	https://www.spinellisvistro.com
Camp Comfort	Comfort	Texas	29.96396	-98.91204	Historic / Estate	Indoor & Outdoor		Restored 1860s landmark on Cypress Creek, now a small hotel, with an 1870 social hall, a creekside lawn and an outdoor stage.		(877) 836-1748	https://camp-comfort.com
Mayan Dude Ranch	Bandera	Texas	29.72050	-99.08797	Barn / Rustic	Indoor & Outdoor		Family-run dude ranch since 1951 on 348 acres along the Medina River, with lodging and indoor and outdoor event spaces.	mayan@mayanranch.com	(830) 796-3312	https://www.mayanranch.com
River Yurt Village	Bandera	Texas			Garden / Outdoor	Indoor & Outdoor	175	Glamping site on 21 acres by the Medina River: a covered pavilion, an optional air-conditioned hall, and yurts sleeping 40 in the package.	riveryurtvillagemanagement@gmail.com	(726) 238-8188	https://riveryurtvillage.com
`,
  },
  {
    name: "Dallas and Fort Worth",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
The Nest at Ruth Farms	Ponder	Texas			Barn / Rustic	Indoor & Outdoor	240	Chapel and all-white barn on a 37-acre estate with two ponds; the barn has 44-foot ceilings and brass chandeliers.		(940) 293-5991	https://thenestatruthfarms.com
The French Farmhouse	Collinsville	Texas	33.50277	-97.00029	Barn / Rustic	Indoor & Outdoor		Family-run, French-styled venue on 56 acres with a chapel, reception hall, covered pavilion and one event a day.	info@thefrenchfarmhousevenue.com	(940) 765-3303	https://thefrenchfarmhousevenue.com
Willow Woods Barn + Studio	Mansfield	Texas	32.53890	-97.17017	Barn / Rustic	Indoor & Outdoor	125	Wooded property outside Mansfield with ceremonies under willows by a pond and a bright white barn for the reception.	willowwoodsbarn@gmail.com	(817) 612-4302	https://mansfieldweddingvenue.com
Knotting Hill Place	Little Elm	Texas	33.15134	-96.97274	Historic / Estate	Indoor & Outdoor	300	Old-world-style estate on Lake Lewisville with a 17,000 sq ft indoor space under 55-foot ceilings and an event lawn.	info@knottinghillplace.com	(469) 444-7844	https://www.knottinghillplace.com
Diamond H3 Ranch	Weatherford	Texas	32.70397	-97.88809	Barn / Rustic	Indoor & Outdoor		Climate-controlled cedar barn and open-air hilltop chapel on a 100-acre Parker County ranch.		(817) 565-6250	https://www.diamondh3ranch.com
Dove Ridge Vineyard	Weatherford	Texas	32.84638	-97.65808	Restaurant / Vineyard	Indoor & Outdoor		Hilltop vineyard with several ceremony sites, a covered patio and a reception room with near floor-to-ceiling windows.	info@doveridgevineyard.com	(817) 444-8172	https://www.doveridgevineyard.com
The Adolphus	Dallas	Texas	32.77966	-96.80040	Ballroom / Hotel	Indoor	400	Historic downtown Dallas hotel with a 19th-floor ballroom and a Grand Ballroom seating up to 350.	hello@adolphus.com	(214) 742-8200	https://www.adolphus.com
Dallas Arboretum	Dallas	Texas	32.82169	-96.71624	Garden / Outdoor	Indoor & Outdoor		Botanical garden with 18 ceremony spots and four reception sites among the gardens.		(214) 515-6615	https://www.dallasarboretum.org
Fort Worth Botanic Garden	Fort Worth	Texas	32.73828	-97.36369	Garden / Outdoor	Indoor & Outdoor		Over 100 acres of gardens, including a Japanese garden and rose gardens, with ceremony and reception sites of many sizes.	events@fwbg.org	(817) 463-4150	https://fwbg.org
BRIK Venue	Fort Worth	Texas	32.73954	-97.32340	Historic / Estate	Indoor & Outdoor		Industrial space near downtown Fort Worth with exposed brick, century-old floors, a courtyard and separate ceremony and reception rooms.	hello@brikvenue.com	(817) 406-2745	https://www.brikvenue.com
`,
  },
  {
    name: "Houston and Galveston",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
The Tremont House	Galveston	Texas	29.30632	-94.79417	Ballroom / Hotel	Indoor	800	Hotel in Galveston's historic Strand district with eight event rooms, a ballroom in the historic Davidson building and a rooftop bar.	info@thetremonthouse.com	(409) 763-0300	https://www.thetremonthouse.com
The Blue Magnolia	Magnolia	Texas	30.22107	-95.52593	Garden / Outdoor	Indoor & Outdoor		All-weather venue opened in 2025 with a ceremony hall whose windows open outdoors, a cocktail lounge and a reception hall under one roof.		(936) 499-7870	https://thebluemagnoliatx.com
The Meekermark	Magnolia	Texas	30.26093	-95.69589	Barn / Rustic	Indoor & Outdoor	200	Open-air chapel and a reconstructed historic barn, built by a family of wedding photographers north of Houston.		(281) 565-4285	https://www.meekermark.com
Sandlewood Manor	Tomball	Texas	30.08592	-95.69043	Historic / Estate	Indoor & Outdoor		27-acre estate with a manor house, chapel, 10,000 sq ft ballroom, pecan orchard, century oak and a pond with a pier.	events@sandlewoodmanor.com	(281) 466-9487	https://www.sandlewoodmanor.com
Balmorhea	Magnolia	Texas	30.14479	-95.66768	Garden / Outdoor	Indoor & Outdoor	340	Mission-style venue on 32 acres with a chapel, a ballroom seating 320, pondside ceremony sites and a bridal cottage.	info@balmorheaevents.com	(281) 356-2305	https://www.balmorheaevents.com
Briscoe Manor	Richmond	Texas	29.64072	-95.81197	Barn / Rustic	Indoor & Outdoor		Private 50-acre estate southwest of Houston with a chapel, a barn banquet hall and outdoor ceremony grounds.	contact@briscoemanor.com	(281) 238-4700	https://www.briscoemanor.com
Agave Estates	Katy	Texas			Garden / Outdoor	Indoor & Outdoor		All-inclusive, one-event-a-day venue with fountains and a tropical feel; catering, bar, DJ and coordinator are in the package.	info@agaveestates.com	(281) 395-5070	https://www.agaveestates.com
Houston Botanic Garden	Houston	Texas	29.68429	-95.26502	Garden / Outdoor	Indoor & Outdoor		Botanic garden with two climate-controlled event tents and outdoor sites including the Woodland Glade, which seats 200.	info@hbg.org	(713) 715-9675	https://hbg.org
McGovern Centennial Gardens	Houston	Texas	29.72113	-95.38739	Garden / Outdoor	Indoor & Outdoor	300	Eight-acre garden in Hermann Park with a modern glass pavilion and an outdoor Celebration Garden seating 300 for a ceremony.	FacilityRentals@hermannpark.org	(713) 524-5876	https://hermannpark.org
`,
  },
];
