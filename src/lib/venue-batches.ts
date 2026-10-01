// Venue batches researched from each venue's own website (see the commit that
// added each one for sources and what was left out). /admin/venues offers to
// add any rows not yet in the database, so a new batch needs no pasting: add
// it here, merge, and click "Add them".
//
// Each is the same tab-separated table the import panel accepts. Latitude and
// Longitude can be left blank: the import pins those venues to their town's
// centre, so don't spend research time on coordinates. Aim for 40-60 venues
// across several regions per PR -- each PR costs a build and a merge
// whatever its size.

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
  {
    name: "Brenham, Round Top, Waco and Bryan–College Station",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Rockin' Star Ranch	Brenham	Texas	30.24123	-96.30468	Barn / Rustic	Indoor & Outdoor		Nearly 150 acres of ponds, woods and pasture with cabins on site and horse rides and skeet shooting for guests.	info@rockinstarbrenham.com	(800) 778-3196	https://www.rockinstarbrenham.com
Liesel Farm	Round Top	Texas			Barn / Rustic	Indoor & Outdoor		Farmhouse venue in Round Top with a cathedral-style ceremony space, a banquet hall, an outdoor bar and four guest houses.	info@lieselfarm.com		https://lieselfarm.com
STORIES Venue & Bistro	Waco	Texas	31.55438	-97.13444	Historic / Estate	Indoor & Outdoor		Historic downtown Waco building with original hardwoods, four floors of event space including a rooftop terrace, and in-house dining.	stories@anthemwaco.com	(254) 307-0447	https://anthemstories.com
The Palladium	Waco	Texas	31.55505	-97.13385	Historic / Estate	Indoor	300	Former 1895 department store in downtown Waco with a 7,000 sq ft hall, a stage and a caterer's kitchen.	TheWacoPalladium@gmail.com	(254) 716-7252	https://wacopalladium.com
The County Line	Abbott	Texas			Barn / Rustic			Events venue just off I-35 near West, about 20 minutes north of Waco, hosting weddings and live music.	booking@countylineevents.com	(254) 405-5529	https://www.countylineevents.com
Gathering Oaks Retreat	Crawford	Texas	31.59614	-97.34174	Garden / Outdoor	Outdoor		Secluded 30-acre retreat west of Waco with an oak grove, covered pavilion and 20 bedrooms booked with the wedding.	info@gatheringoaksretreat.com	(254) 307-1819	https://www.gatheringoaksretreat.com
The Barn BCS	Bryan	Texas			Barn / Rustic	Indoor		Modern all-white barn with wood ceilings and lots of natural light, 15 minutes from downtown Bryan and College Station.	thebarnbcs@gmail.com	(979) 200-9912	https://www.thebarnbcs.com
Peach Creek Ranch	College Station	Texas	30.49509	-96.29753	Barn / Rustic	Indoor & Outdoor		Ranch venue with a Great Room, courtyard and ceremony grounds, cottages for guests and 24- or 48-hour wedding packages.		(979) 574-1325	https://www.peachcreekranch.com
Astin Mansion	Bryan	Texas	30.67419	-96.37739	Historic / Estate	Indoor & Outdoor		1920 mansion on the National Register of Historic Places, with gardens and indoor and outdoor ceremony spots.	astinmansion@gmail.com	(979) 822-9999	https://www.astinmansion.com
`,
  },
  {
    name: "Coastal Bend, South Padre and the Rio Grande Valley",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Art Center of Corpus Christi	Corpus Christi	Texas	27.79201	-97.39255	Beach / Waterfront	Indoor		Arts centre on the Corpus Christi bayfront with several event rooms and views over the bay, for parties from 5 to 500.	info@artcentercc.org	(361) 884-6406	https://www.artcentercc.org
The Courtyard at Gaslight Square	Corpus Christi	Texas	27.78216	-97.39874	Historic / Estate	Indoor & Outdoor		Courtyard under a big light-strung oak with two indoor rooms, run by a catering company that also plans the day.	office@diamondpointcatering.com	(361) 884-1399	https://www.thecourtyardatgaslight.com
The Ranch at San Patricio	Mathis	Texas			Barn / Rustic	Indoor & Outdoor	300	Two wedding venues with chapels, indoor halls and a pond on a ranch between Corpus Christi and Mathis, plus a guest house.		(361) 816-7337	https://ranchatsanpatricio.com
The Lighthouse Inn at Aransas Bay	Rockport	Texas	28.06021	-97.03439	Beach / Waterfront	Indoor & Outdoor		Bayfront inn with a gazebo for small ceremonies by the water and two indoor rooms for up to 40 guests each.	info@lighthousetexas.com	(361) 790-8439	https://www.lighthousetexas.com
Isla Grand Beach Resort	South Padre Island	Texas	26.08832	-97.16421	Beach / Waterfront	Indoor & Outdoor		Beachfront resort on South Padre Island with about 10,000 sq ft of event space, from the beach to the ballroom.	reservations@islagrand.com	(800) 292-7704	https://www.islagrand.com
The Livery Venue	Brownsville	Texas	25.90360	-97.49802	Ballroom / Hotel	Indoor & Outdoor	500	Event centre in Brownsville with indoor and outdoor spaces for up to 500, serving the Rio Grande Valley and South Padre.	liveryat10th@gmail.com	(956) 243-5570	https://www.theliveryvenue.com
Casa De Soles Event Center	San Benito	Texas			Garden / Outdoor	Indoor & Outdoor		Rio Grande Valley venue with courtyard, pavilion and garden ceremony sites plus indoor space.		(956) 639-0160	https://www.casadesoleseventcenter.com
`,
  },
  {
    name: "Tyler, Longview and East Texas",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Sunset Oaks	Tyler	Texas	32.41571	-95.39676	Garden / Outdoor	Indoor & Outdoor	175	Venue with a chapel and a reception hall whose roll-up glass doors open it to the outdoors; all-inclusive packages, micro weddings and elopements.	info@sunsetoaksvenue.com	(903) 730-5047	https://sunsetoaksvenue.com
The Villa	Tyler	Texas	32.39941	-95.38146	Historic / Estate	Indoor & Outdoor		Villa-style venue north of Tyler with indoor ceremony and reception halls, landscaped grounds and all-inclusive packages.	bookings@thevillatyler.com	903-597-0002	https://www.thevillatyler.com
The Claremore	Tyler	Texas			Historic / Estate	Indoor	185	Light-filled modern minimalist venue in central Tyler, opened in 2021 by two photographers, with a sliding divider wall and all-inclusive packages.	hello@theclaremore.com	903-258-8412	https://theclaremore.com
Cedars of Lebanon	Tyler	Texas	32.28656	-95.28952	Ballroom / Hotel	Indoor & Outdoor	200	Ballroom with a stage on eight acres with a small lake; couples may bring their own caterer.	cedarsoftyler@gmail.com	(903) 561-3646	https://thecedarstyler.com
Kalico Creek	Tyler	Texas	32.20937	-95.30362	Barn / Rustic	Indoor & Outdoor	200	Farmhouse venue in a 55-acre forest three miles from Loop 49, for indoor or outdoor ceremonies.		(903) 969-0803	https://www.kalicocreek.com
The Venue at Orchard Farms	Troup	Texas	32.10263	-95.14353	Barn / Rustic	Indoor & Outdoor	200	Meadows, a six-acre lake and an open-air chapel, with a heated and cooled reception barn and a kitchen open to caterers or do-it-yourselfers.		(903) 842-5052	https://thevenueatorchardfarms.com
Dove Hollow Estate	Longview	Texas			Barn / Rustic	Indoor & Outdoor		Family-run venue in the East Texas woods with an all-black chapel, indoor and outdoor reception spaces and on-site lodging.	admin@dovehollowestate.com	903-239-1867	https://dovehollowestate.com
Wylde Acres	Longview	Texas	32.53200	-94.69195	Garden / Outdoor	Indoor & Outdoor		Pine lodge on 16 wooded acres with a 3,000 sq ft wrap-around porch, a fishing pond and seven bedrooms sleeping 18; elopements to all-inclusive.		(903) 738-9328	https://wyldeacres.com
The Chateau of Longview	Longview	Texas	32.58079	-94.73822	Historic / Estate	Indoor & Outdoor	200	Venue with a wedding barn, a main house sleeping 14 and a bunk house sleeping six.	Bethany.thechateaulgv@gmail.com	903-237-8310	https://www.thechateaulgv.com
The Hendo Ranch	Henderson	Texas	32.04318	-94.90642	Barn / Rustic	Indoor & Outdoor		Ranch of about 240 acres booked by the night or weekend, with five cabins sleeping 36, a pool and room for the rehearsal dinner and farewell brunch on site.		(214) 206-4280	https://thehendoranch.com
The Fredonia Hotel	Nacogdoches	Texas	31.60444	-94.65364	Ballroom / Hotel	Indoor	1000	Downtown hotel dating from 1955, with 20,000 sq ft of event space and in-house catering.	info@thefredonia.com	(936) 564-1234	https://www.thefredonia.com
`,
  },
  {
    name: "Lubbock, Amarillo and the Permian Basin",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Cotton Court Hotel	Lubbock	Texas	33.58454	-101.85280	Ballroom / Hotel	Indoor & Outdoor		Downtown boutique hotel with indoor and outdoor event spaces, in-house catering and rooms for guests.		806.758.5800	https://www.cottoncourthotel.com
Eberley Brooks Events	Lubbock	Texas	33.53429	-102.00746	Barn / Rustic	Indoor & Outdoor	400	Locally owned venue in west Lubbock with a barn for up to 400, the Salle De David for up to 200, a great room for 50 and a chapel.		806-777-0422	https://eberleybrooks.com
Autumn Oaks Event Center	Ropesville	Texas	33.44715	-102.04228	Garden / Outdoor	Indoor & Outdoor	400	Reception hall with a landscaped courtyard, wrap-around porch, pergola and covered fireplace patio, southwest of Lubbock.	info@autumnoakslubbock.com	806.370.7482	https://www.autumnoakslubbock.com
Cornerstone Ranch	Amarillo	Texas			Barn / Rustic	Indoor & Outdoor	500	Family-owned, climate-controlled venue with indoor and outdoor ceremony sites and no room flip between ceremony and reception.	cornerstoneranchamarillo@gmail.com	(806) 681-4319	https://www.cornerstoneranchevents.com
Starlight Canyon	Amarillo	Texas	35.06367	-101.81111	Historic / Estate	Outdoor		Bed and breakfast on six acres in upper Palo Duro Canyon, eleven miles south of Amarillo, with four cabins and a lodge built by the Civilian Conservation Corps in 1933.	slc@starlightcanyon.com	(806) 622-2382	https://www.starlightcanyon.com
The Resplendent Garden	Amarillo	Texas	35.09499	-101.80828	Garden / Outdoor	Outdoor		Landscaped private garden between Amarillo and Canyon, run by a local landscaping family.	s.nistler@me.com	(806) 622-3135	https://www.resplendentgarden.com
Knotting Hill	Amarillo	Texas	35.04661	-102.04106	Garden / Outdoor	Indoor & Outdoor	200	Hilltop venue between Amarillo and Canyon overlooking a lake canyon, with a pergola ceremony site, courtyard and indoor hall.	havenranch@yahoo.com	806-678-6707	https://www.knottinghillevents.com
Lantana Acres	Odessa	Texas	31.90130	-102.39960	Barn / Rustic	Indoor & Outdoor		Farm venue with an outdoor Garden Haus barn, a courtyard with a silo and pond, a ballroom and a banquet hall.	info@lantanaacres.com	432.360.3061	https://www.lantanaacres.com
`,
  },
  {
    name: "El Paso and Marfa",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
The Plaza Hotel Pioneer Park	El Paso	Texas	31.75871	-106.48885	Ballroom / Hotel	Indoor & Outdoor		Downtown hotel that opened in the 1930s, with a ballroom and a rooftop for weddings and an in-house event team.		(915) 440-7666	https://www.plazahotelelpaso.com
Hotel Paso Del Norte	El Paso	Texas	31.75779	-106.48913	Ballroom / Hotel	Indoor		Downtown landmark hotel with 32,000 sq ft of event space, including a crystal-chandelier ballroom and the Pancho Villa Ballroom for up to 100.		(915) 534-3000	https://www.hotelpdn.com
Main Room Event Center	El Paso	Texas	31.75765	-106.48130	Historic / Estate	Indoor		Event venue in a 1915 building in the downtown historic district, with venue-only and all-inclusive packages.	mainroomevents@gmail.com	(915) 777-2525	https://mainroomevents.com
Grace Gardens Event Center	El Paso	Texas	31.90147	-106.62529	Garden / Outdoor	Indoor & Outdoor		Upper Valley venue with four ballrooms, four ceremony sites including a pavilion on a pond island, and an in-house pastry chef.		915-877-2745	https://www.elpasogracegardens.com
The Copper Fountain	El Paso	Texas	31.84246	-106.58017	Ballroom / Hotel	Indoor		A 2,600 sq ft indoor event space on Doniphan Drive with a private room and bar, and table, chair and dinnerware rentals.		(915) 313-4844	https://copperfountainvenue.com
Hacienda Sol y Luna	El Paso	Texas	31.68269	-106.14129	Garden / Outdoor	Indoor & Outdoor		Hacienda-style venue in El Paso's Lower Valley with catering and custom packages; Spanish spoken, tours by appointment.	HaciendaSolyLunaep@gmail.com	(915) 990-6912	https://www.solylunahacienda.com
Marfa Spirit Co.	Marfa	Texas	30.30976	-104.02413	Restaurant / Vineyard	Indoor		Distillery and tasting room in the historic Godbold feed mill, hosting weddings and private dinners.		(432) 426-6651	https://www.themarfaspirit.com
`,
  },
  {
    name: "More Dallas–Fort Worth: Aubrey, McKinney, Grapevine and Kaufman",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Brighton Abbey	Aubrey	Texas	33.23712	-96.97474	Historic / Estate	Indoor & Outdoor		European-style estate on five acres with a glass chapel in the gardens, a chandeliered reception hall and an event lawn; sister venue to Knotting Hill Place.		469.444.7848	https://www.brightonabbey.com
Rustic Grace Estate	Van Alstyne	Texas	33.42195	-96.62058	Barn / Rustic	Indoor & Outdoor		Vintage-style country estate just north of McKinney.		972-737-3259	https://www.rusticgraceestate.com
Stone Crest Venue	New Hope	Texas	33.21039	-96.56595	Barn / Rustic	Indoor & Outdoor		Rustic-industrial hall on 20 hilltop acres near McKinney, with an open vendor policy, BYOB and an outdoor fire pit.	info@stonecrestvenue.com	972.544.6848	https://www.stonecrestvenue.com
The Emerson	Kaufman	Texas	32.63084	-96.32133	Garden / Outdoor	Indoor & Outdoor		Sixteen acres southeast of Dallas with a little white chapel designed by Leanne Ford, plus in-house bar service and day-of coordination.	loveclub@emersonvenue.com	214.534.5882	https://www.emersonvenue.com
The Filter Building	Dallas	Texas	32.8191	-96.73264	Historic / Estate	Indoor & Outdoor		Historic building on the shore of White Rock Lake, run by a nonprofit whose rental income funds community rowing programs.			https://www.thefilterbuilding.com
Hickory Street Annex	Dallas	Texas			Historic / Estate	Indoor & Outdoor		Century-old industrial buildings around a courtyard near downtown, with a bright warehouse hall under a pitched wood ceiling.	michelle@hickorystreetannex.com		https://hickorystreetannex.com
Rosewood Mansion on Turtle Creek	Dallas	Texas	32.80338	-96.80679	Ballroom / Hotel	Indoor & Outdoor		Luxury hotel built around a 1920s mansion, with a promenade and pavilion among its event spaces.	themansion@rosewoodhotels.com	214 559 2100	https://www.rosewoodhotels.com/en/mansion-on-turtle-creek-dallas
The Joule	Dallas	Texas	32.78077	-96.79829	Ballroom / Hotel	Indoor		Downtown hotel in a restored neo-Gothic landmark, with a wedding and catering team.		214.748.1300	https://www.thejouledallas.com
Hotel Crescent Court	Dallas	Texas	32.79389	-96.8043	Ballroom / Hotel	Indoor & Outdoor		Uptown hotel with 226 rooms and suites and about 19,000 sq ft of event space.		214.871.3200	https://www.crescentcourt.com
The Ashton Hotel	Fort Worth	Texas	32.75376	-97.33071	Ballroom / Hotel	Indoor		Downtown boutique hotel in a 1915 building on Main Street, part of Historic Hotels of America.	info-ashton@theashtonhotel.com	(817) 332-0100	https://www.theashtonhotel.com
Hotel Drover	Fort Worth	Texas	32.78589	-97.34501	Ballroom / Hotel	Indoor & Outdoor		Hotel on Mule Alley in the Fort Worth Stockyards, with private dining rooms and a backyard for special occasions.	hello@hoteldrover.com	817-755-5557	https://www.hoteldrover.com
Stoney Ridge Villa	Azle	Texas	32.82771	-97.60191	Historic / Estate	Indoor & Outdoor		Family-owned, Mediterranean-style hilltop villa northwest of Fort Worth with views of the downtown skyline.	info@stoneyridgevilla.com	(682) 730-6176	https://www.stoneyridgevilla.com
Hotel Vin	Grapevine	Texas	32.93283	-97.07694	Ballroom / Hotel	Indoor & Outdoor		Hotel at the edge of Grapevine's historic Main Street with a ballroom, a rooftop terrace, in-house catering and rooms for guests.			https://www.hotelvin.com
`,
  },
  {
    name: "More Houston: The Woodlands, Lake Conroe and Galveston",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Château St Cyr	Montgomery	Texas	30.40822	-95.78549	Historic / Estate	Indoor & Outdoor		A 13,000 sq ft estate on 18 acres in the Montgomery countryside, with 11 bedrooms sleeping up to 40 guests and two kitchens for caterers.	events@waverlymanor.com		https://www.thewaverlycollection.com/chateau-st-cyr
Waverly Manor	New Waverly	Texas			Garden / Outdoor	Indoor & Outdoor		A 7,500 sq ft event hall holding 300 indoors, with a lakeside gazebo for ceremonies, plus a manor house sleeping 19; sister venue to Château St Cyr.	events@waverlymanor.com		https://www.thewaverlycollection.com/waverly-manor
Villa de Lago	Montgomery	Texas	30.3946	-95.65422	Beach / Waterfront	Indoor & Outdoor		Intimate venue on the Lake Conroe shoreline with overnight space for up to 26 guests.	events@waverlymanor.com		https://www.thewaverlycollection.com/villa-de-lago
Olde Dobbin Station	Montgomery	Texas			Historic / Estate	Indoor & Outdoor		Family-run venue near Lake Conroe built from buildings dating to the late 1800s and early 1900s, with full-service or DIY packages.	info@oldedobbinstation.com	(936) 828-0790	https://www.oldedobbinstation.com
The Woodlands Resort	The Woodlands	Texas	30.14857	-95.47379	Ballroom / Hotel	Indoor & Outdoor		Resort in the Piney Woods with lakeside lawns, ballrooms and terraces, and wedding packages.		281.364.6301	https://www.woodlandsresort.com
The Houstonian Hotel, Club & Spa	Houston	Texas	29.76699	-95.45756	Ballroom / Hotel	Indoor & Outdoor		Wooded 27-acre resort near Memorial Park with indoor and outdoor venues and an on-site spa.	reservations@houstonian.com	(713) 680-2626	https://www.houstonian.com
The Post Oak Hotel	Houston	Texas	29.75153	-95.45615	Ballroom / Hotel	Indoor		Uptown luxury hotel with wedding and private-dining venues and several restaurants on site.		346.227.5000	https://www.thepostoak.com
Hotel Granduca	Houston	Texas	29.75805	-95.45761	Ballroom / Hotel	Indoor & Outdoor		Uptown Park hotel with large rooms and suites and a wedding and events team.		(713) 418-1000	https://www.granducahouston.com
Hotel ZaZa Museum District	Houston	Texas			Ballroom / Hotel	Indoor & Outdoor		Museum District hotel with wedding packages, in-house catering and room blocks for guests.			https://www.hotelzaza.com/houston-museum-district
Hotel ICON	Houston	Texas	29.76285	-95.36034	Ballroom / Hotel	Indoor	250	Downtown hotel in the 1911 Union National Bank building; its Aventine Ballroom seats 250 for a ceremony or 150 for a reception.	contact@hotelicon.com	(713) 224-4266	https://www.hotelicon.com
Grand Galvez	Galveston	Texas	29.29196	-94.7858	Ballroom / Hotel	Indoor & Outdoor		Oceanfront hotel on the Seawall dating from 1911, with historic ballrooms.	info@grandgalvez.com	409-765-7721	https://www.grandgalvez.com
Moody Gardens	Galveston	Texas	29.27464	-94.85241	Garden / Outdoor	Indoor & Outdoor		Island resort with a hotel, pyramid attractions and gardens, hosting weddings across its venues.		(409) 683-4000	https://www.moodygardens.org
`,
  },
  {
    name: "Temple, Belton, Salado, Abilene, San Angelo and Wichita Falls",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Cathedral Oaks Event Center	Belton	Texas	31.06478	-97.44663	Historic / Estate	Indoor & Outdoor		A 6,800 sq ft event centre with limestone and hardwood finishes on six oak-covered acres between Temple and Belton, plus the smaller Magnolia House.		254.939.6257	https://www.cathedral-oaks.com
Hidden Creek at StoneHaus	Belton	Texas	31.11376	-97.53265	Garden / Outdoor	Indoor & Outdoor		Family-owned property on five acres of live oaks with a creek and three ceremony sites, offering all-inclusive, micro-wedding and venue-only packages.		(254) 541-7741	https://www.hiddencreekatstonehaus.com
Rustic Acres Event Center	Belton	Texas	30.97903	-97.49419	Barn / Rustic	Indoor & Outdoor	350	Twenty-two acres between Belton and Salado with 5,500 sq ft of indoor space.	rusticacreseventcenter@gmail.com	254-791-9010	https://www.rusticacreseventcenter.com
La Rio Mansion	Belton	Texas			Historic / Estate	Indoor & Outdoor		Spanish-style venue with archways and gardens set among fields and oaks, built for open-air weddings.	weddings@lariomansion.com	(254) 833-7670	https://www.lariomansion.com
Stagecoach Inn	Salado	Texas	30.94273	-97.53741	Ballroom / Hotel	Indoor & Outdoor	175	Historic inn among heritage oaks with a ballroom for 175, an oak-shaded ceremony field, a pool pavilion and rooms for guests.	hello@stagecoachsalado.com	(254) 947-5111	https://www.stagecoachsalado.com
The Grace Museum	Abilene	Texas	32.44953	-99.73436	Historic / Estate	Indoor & Outdoor	400	Downtown museum with six rental spaces, including a historic ballroom for 200, a courtyard for 280 and a rooftop terrace for 150.	events@thegracemuseum.org	325.673.4587	https://thegracemuseum.org/rent-the-grace/
The Warehouse	Abilene	Texas	32.45199	-99.73142	Historic / Estate	Indoor		Historic downtown building with exposed brick, balcony seating, a built-in bar and room for a band.		325-670-0061	http://www.warehouseonwalnut.com
Sabrina Cedars	Abilene	Texas	32.32328	-99.88966	Barn / Rustic	Indoor & Outdoor		Two-storey white barn set below a hillside southwest of Abilene.	info@sabrinacedars.com	(325) 338-4327	https://www.sabrinacedars.com
Vista Cielo Rosa	Christoval	Texas	31.20487	-100.49884	Garden / Outdoor	Indoor & Outdoor		Hilltop venue on 21 acres south of San Angelo, with air-conditioned indoor space, landscaped lawns and a bridal suite.	kelley@vistacielorosa.com	(325) 271-2405	https://www.vistacielorosa.com
Stars on the Concho	San Angelo	Texas	31.596	-100.62903	Barn / Rustic	Indoor & Outdoor	350	Former horse ranch on the Concho River 15 miles north of San Angelo, with a main hall barn, covered space for 350 and an outdoor dance floor.		(325) 465-0491	https://starsontheconcho.com
Daisy Place at Wichita River Retreat	Wichita Falls	Texas	33.89762	-98.61253	Garden / Outdoor	Outdoor	300	Sixteen wooded acres by the Wichita River with a covered pavilion seating up to 300 and a house sleeping 10.	wichitariverretreat@gmail.com	940-704-6550	https://www.wichitariverretreat.com
French Country Farms	Wichita Falls	Texas	33.91873	-98.57284	Barn / Rustic	Indoor & Outdoor		Wedding barn on 20 acres just outside Wichita Falls, with indoor and outdoor ceremony spaces.	info@frenchcountryfarms.com	940-235-2528	https://www.frenchcountryfarms.com
Venue 79	Wichita Falls	Texas	33.83372	-98.52125	Ballroom / Hotel	Indoor		A 6,000 sq ft modern event hall south of Wichita Falls.		(940) 782-7720	https://www.venue79.com
`,
  },
  {
    name: "Austin outskirts: Lake Travis, Georgetown, Round Rock, Bastrop and Lockhart",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Lakeway Resort and Spa	Lakeway	Texas	30.37363	-97.98762	Ballroom / Hotel	Indoor & Outdoor	300	Lake Travis resort whose Vistas Ballroom seats 300 under vaulted ceilings with floor-to-ceiling lake views, plus two smaller ballrooms.	sales@lakewayresortandspa.com	(512) 261-6600	https://www.lakewayresortandspa.com
Villa Antonia	Jonestown	Texas	30.46731	-97.95256	Historic / Estate	Indoor & Outdoor		Italian-style villa near Lake Travis with several ceremony and reception spaces and bridal and groom suites.		(512) 689-2157	https://www.villaantonia.com
Garey House	Georgetown	Texas	30.59517	-97.7882	Historic / Estate	Indoor & Outdoor		Former private estate in the city's Garey Park, with a pond, waterfall and oak-shaded grounds, run by Georgetown Parks and Recreation.	gareyhouse@georgetowntexas.gov	512-930-6801	https://gareyhouse.georgetown.org
Angel Springs Event Center	Georgetown	Texas	30.62627	-97.83888	Garden / Outdoor	Indoor & Outdoor	200	Hill Country venue with an oak-canopied entrance, outdoor ceremony space and a high-ceilinged ballroom seating 200, plus lodging.	info@angelspringsevents.com	(512) 957-9994	https://www.angelspringsevents.com
The Texas Hall	Round Rock	Texas	30.5368	-97.74526	Barn / Rustic	Indoor & Outdoor	120	Barn-style hall on five acres near Brushy Creek, with an oak-shaded ceremony site, a pool and gazebo, a guesthouse and DIY-to-full-service packages.	texashallevents@gmail.com	512.947.3812	https://www.thetexashall.com
Angel Mountain Events	Bastrop	Texas	30.1432	-97.25706	Garden / Outdoor	Indoor & Outdoor	125	Hilltop venue with a candlelit chapel and indoor reception hall, rebuilt by its owners after the Bastrop wildfires.	info@angelmountainevents.com	(512) 695-0932	https://angelmountainevents.com
Comanche Country Ranch	Lockhart	Texas	29.81837	-97.70366	Barn / Rustic	Indoor & Outdoor		A 130-acre ranch with an Old West town of a chapel, saloon and bunkhouse, and a 3,500 sq ft climate-controlled pavilion for receptions.		512.541.0979	https://comanchecountryranch.com
Wild Roots	Lockhart	Texas	29.81746	-97.55606	Garden / Outdoor	Indoor & Outdoor	200	Wooded venue with several ceremony sites, a 2,500 sq ft indoor hall seating 200, and glamping and tiny homes for 28 overnight guests.	info@wildrootslockhart.com	(512) 893-7400	https://www.wildrootslockhart.com
Luna Gardens	Lockhart	Texas	29.89851	-97.65232	Garden / Outdoor	Outdoor		Venue-only open-air garden with lawns and pond views, five minutes from downtown Lockhart.		(512) 546-7733	https://www.lunagardenstx.com
`,
  },
  {
    name: "More San Antonio: downtown, Helotes and Castroville",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
McNay Art Museum	San Antonio	Texas	29.48505	-98.45917	Historic / Estate	Indoor & Outdoor	250	Texas's first modern art museum, in a Spanish Colonial Revival mansion on 23 acres; receptions seat up to 250, and an approved caterer and a planner are required.	rentals@mcnayart.org	(210) 824-5368	https://www.mcnayart.org/weddings/
Ivy Hall	San Antonio	Texas			Garden / Outdoor	Indoor & Outdoor		Southtown garden venue in a converted 1950s gas station and mechanic shop, with a banquet hall, a screened porch and on-site catering.			http://ivyhallevents.com
Rio Plaza	San Antonio	Texas	29.42435	-98.49042	Historic / Estate	Indoor & Outdoor		Stone-fronted downtown venue steps from the River Walk, with several rooms, rooftop spaces over the skyline and private elevator access.	amanda@rioplaza.net	210-223-9141	https://www.rioplaza.net
Hotel Valencia Riverwalk	San Antonio	Texas	29.4264	-98.49205	Ballroom / Hotel	Indoor & Outdoor	160	Spanish-style boutique hotel on the River Walk with an open-air courtyard for 120 and indoor spaces for up to 160.	weddingsa@valenciagroup.com	210.220.3081	https://www.hotelvalencia-riverwalk.com
Kimpton Santo	San Antonio	Texas	29.42031	-98.48825	Ballroom / Hotel	Indoor & Outdoor		Hotel between downtown and Southtown with historic suites and an interior courtyard under live oaks.		(210) 222-1000	https://santohotelsanantonioriverwalk.com
Sagrado Vineyard	San Antonio	Texas	29.73621	-98.49755	Restaurant / Vineyard	Indoor & Outdoor		Vineyard north of the city with a chapel, a reception hall with full kitchen, dressing suites and a bed and breakfast overlooking the vines.		(210) 219-9054	https://www.sagradovineyard.com
Scenic Springs	Helotes	Texas	29.6208	-98.6852	Historic / Estate	Indoor & Outdoor	225	Historic family estate with park-style gardens, a brook, century oaks and a beamed ballroom.		866-966-3009	https://www.wedgewoodweddings.com/scenicsprings
Hofmann Ranch	Castroville	Texas			Barn / Rustic	Indoor & Outdoor	300	A 370-acre working ranch with longhorns, a ballroom with double oak staircases, a pavilion and an outdoor fireplace lookout, 25 minutes from San Antonio.		866-966-3009	https://www.wedgewoodweddings.com/hofmannranch
Hillside Texas	Castroville	Texas	29.34831	-98.89821	Ballroom / Hotel	Indoor & Outdoor	200	French-country boutique hotel with 38 rooms on a 13-acre hillside above the Medina River valley, with a ballroom and a terrace for sunset ceremonies.		830-538-3200	https://www.hillsidetexas.com
`,
  },
  {
    name: "Oklahoma City, Edmond and Guthrie",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Harn Homestead	Oklahoma City	Oklahoma			Historic / Estate	Indoor & Outdoor		Historic homestead museum on North Lincoln Boulevard that rents its grounds for weddings and offers photography packages.	diane@harnhomestead.com	405-235-4058	https://www.harnhomestead.com
The Barn at The Woods	Edmond	Oklahoma			Barn / Rustic	Indoor & Outdoor		Forty acres with a 115-year-old barn, a farmhouse, a cottage and on-site guest rooms.	info@barnatthewoods.com	405-609-7715	https://www.barnatthewoods.com
The Westwood	Guthrie	Oklahoma			Barn / Rustic	Indoor & Outdoor	325	Contemporary barn built in 2023, with an indoor ceremony space and a lakeside site overlooking Lake Juanita.	info@westwoodbarn.com	405-260-8944	https://www.westwoodbarn.com
Timber Valley Ranch	Edmond	Oklahoma			Barn / Rustic	Indoor & Outdoor		Wooded valley north of Edmond with rock bluffs, a wooden bridge and a modern black event building.	timbervalleyranch@gmail.com	(405) 655-5306	https://www.thetimbervalleyranch.com
The Bower	Edmond	Oklahoma			Historic / Estate	Indoor & Outdoor	450	European-inspired private estate with a ballroom, gardens and lodging for 18, booked as all-inclusive weekend packages.	info@thebowervenue.com		https://www.thebowervenue.com
Willowbrook Reserve at The Springs	Edmond	Oklahoma			Garden / Outdoor	Indoor & Outdoor	320	Wooded venue with a climate-controlled chapel and both indoor and outdoor ceremony options.	edmond@thespringsevents.com	(405) 757-5352	https://springsvenue.com/edmond/
Aurora Grove at The Springs	Blanchard	Oklahoma			Garden / Outdoor	Indoor & Outdoor	320	Outdoor ceremony site with a stone bridge, plus an indoor chapel and reception hall south of Norman.	norman@thespringsevents.com	(405) 206-2341	https://springsvenue.com/norman/
The Manor	Edmond	Oklahoma			Historic / Estate	Indoor & Outdoor	300	Estate built in 1938 on a 100-acre ranch in Deer Creek, with barns, guest houses and event halls.		(405) 340-1701	https://themanorok.com
The McGranahan Barn	Yukon	Oklahoma			Barn / Rustic	Indoor & Outdoor	300	Timber-frame barn with a patio and open grounds west of Oklahoma City.		405-698-2276	https://www.mcgranahanbarn.com
Skirvin Hilton	Oklahoma City	Oklahoma			Ballroom / Hotel	Indoor		Downtown hotel open since 1911, with 18,500 sq ft of event space.		405-702-8547	https://www.skirvinhilton.com
Boathouse Vows	Oklahoma City	Oklahoma			Beach / Waterfront	Indoor & Outdoor		Four Boathouse District buildings on the Oklahoma River, including the Devon Boathouse and the Chesapeake Finish Line Tower.			https://www.riversportokc.org/private-events/weddings/
`,
  },
  {
    name: "Tulsa and Green Country",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Dresser Mansion	Tulsa	Oklahoma			Historic / Estate	Indoor	225	Historic mansion where the whole house, including a billiards room and full catering kitchen, is open to the couple on the day.	info@dressermansion.com	(918) 585-5157	https://www.dressermansion.com
Spain Ranch	Jenks	Oklahoma			Barn / Rustic	Indoor & Outdoor	250	Forty-four acres with the White Barn, a 4,800 sq ft post-and-beam barn, and the Black Barn chapel for 100.			https://www.spainranch.com
The Venue at Woodbridge Ranch	Broken Arrow	Oklahoma			Barn / Rustic	Indoor & Outdoor	365	Owner-operated country venue opened in 2024, with modern amenities.	venue.ranch@gmail.com	(918) 231-0282	https://www.thevenueatwb.com
The Silo Event Center	Tulsa	Oklahoma			Barn / Rustic	Indoor & Outdoor		All-inclusive venue with a ballroom, outdoor ceremony spaces and an on-site restaurant, Copper Dome.		(918) 447-2724	https://siloeventcenter.com
Willow Creek Mansion	Broken Arrow	Oklahoma			Historic / Estate	Indoor & Outdoor	125	Mansion built in 1904 that opened as an event centre in 2017, with a climate-controlled Grand Ballroom and oak-shaded ceremony grounds.	info@willowcreekmansion.com	918-258-0400	https://www.willowcreekmansion.com
T-Rise Ranch	Terlton	Oklahoma			Barn / Rustic	Indoor & Outdoor		Family-owned 30 acres west of Tulsa with a reception barn, woodland chapel and farmhouse lodging.		(918) 240-9438	https://www.talitharisevenue.com
The Mayo Hotel	Tulsa	Oklahoma			Ballroom / Hotel	Indoor & Outdoor		Downtown hotel from 1925 with the Crystal Ballroom, a Grand Hall and a penthouse rooftop lounge.	sales@themayohotel.com	918-582-6296	https://www.themayohotel.com
Harwelden Mansion	Tulsa	Oklahoma			Historic / Estate	Indoor & Outdoor		1923 English Tudor mansion on the National Register, on a city block overlooking the Arkansas River, now also a bed and breakfast.	info@harwelden.com	918-960-0714	https://www.harwelden.com
Tulsa Botanic Garden	Tulsa	Oklahoma			Garden / Outdoor	Outdoor		Botanic garden in the Osage Hills, eight miles northwest of downtown Tulsa.		918-289-0330	https://www.tulsabotanic.org
POSTOAK Lodge & Retreat	Tulsa	Oklahoma			Garden / Outdoor	Indoor & Outdoor		Retreat centre on Tulsa's north side with on-site lodging and a zipline canopy tour.		918-425-2112	https://www.postoaklodge.com
Bright Morning Farm	Sand Springs	Oklahoma			Garden / Outdoor	Outdoor		Farm that has hosted weddings, reunions and concerts for more than 20 years.	info@brightmorningfarm.com		https://www.brightmorningfarm.com
`,
  },
  {
    name: "Shreveport–Bossier",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Sainte Terre	Benton	Louisiana			Barn / Rustic	Indoor & Outdoor		All-inclusive wedding venue north of Bossier City.	events@sainteterre.com	(318) 936-9544	https://www.sainteterre.com
Venue de LaChute	Shreveport	Louisiana			Historic / Estate	Indoor & Outdoor		1920s mansion on the Red River with oak-shaded lawns and a carriage-house reception space.	venuedelachute@gmail.com	318-572-2475	https://www.venuedelachute.com
Silver Lake Ballroom	Shreveport	Louisiana			Ballroom / Hotel	Indoor		14,000 sq ft across four rooms on the first floor of the historic Hunter Building downtown.		318-426-3066	https://www.silverlakeballroom.com
North Market Venue	Shreveport	Louisiana			Ballroom / Hotel	Indoor	150	Vintage-style hall two blocks north of downtown, with in-house planning, decorating and florals.		(318) 425-4437	https://www.northmarketvenue.com
Riverwalk Event Venue at Shreveport Aquarium	Shreveport	Louisiana			Beach / Waterfront	Indoor & Outdoor		Red River event space with views of the Texas Street Bridge light shows.			https://www.shreveportaquariumevents.com
American Rose Center	Shreveport	Louisiana			Garden / Outdoor	Indoor & Outdoor		The American Rose Society's gardens, with outdoor ceremony sites, a chapel and an event center.	eventcoordinator@rose.org	318-938-5402	https://rose.org/venue/
The Barn at Leone Farm	Grand Cane	Louisiana			Barn / Rustic	Indoor & Outdoor		Rustic barn with a full kitchen, bar and several gathering areas south of Shreveport.	thebarnatleonefarm@gmail.com	(318) 871-0662	https://www.thebarnatthefarm.com
Los Paloma Event Center	Benton	Louisiana			Garden / Outdoor	Indoor & Outdoor		Sporting-clays range with an event center that hosts weddings and banquets.		318-465-7507	https://lospaloma.com
`,
  },
  {
    name: "Albuquerque and Corrales",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Los Poblanos	Los Ranchos de Albuquerque	New Mexico			Historic / Estate	Indoor & Outdoor		Historic inn and organic farm with lavender fields, on-site dining and a spa.		(855) 486-1380	https://lospoblanos.com
Hotel Andaluz	Albuquerque	New Mexico			Ballroom / Hotel	Indoor	200	Historic downtown hotel with eight wedding spaces, including the Barcelona Ballroom and a room opening onto a rooftop terrace.		(505) 242-9090	https://www.hotelandaluz.com
Hotel Albuquerque at Old Town	Albuquerque	New Mexico			Ballroom / Hotel	Indoor & Outdoor	300	Old Town hotel with a 14,000 sq ft ballroom, the San Isidro chapel for 150 and an 18th-century hacienda event space.		505-843-6300	https://www.hotelabq.com
Hotel Chaco	Albuquerque	New Mexico			Ballroom / Hotel	Indoor & Outdoor		AAA Four Diamond hotel with a fifth-floor rooftop and contemporary Native American art throughout.		1-855-997-8208	https://www.hotelchaco.com
Albuquerque Garden Center	Albuquerque	New Mexico			Garden / Outdoor	Indoor & Outdoor		Nonprofit garden center with demonstration gardens and a Japanese pavilion for ceremonies.	info@abqgardencenter.org	505-296-6020	https://www.albuquerquegardencenter.org
Casas de Suenos Old Town Historic Inn	Albuquerque	New Mexico			Historic / Estate	Indoor & Outdoor	160	1938 inn on the National Register, with a garden gazebo, a 4,800 sq ft reception hall and 21 casitas.	reservations@casasdesuenos.com	(505) 767-1000	https://www.casasdesuenos.com
El Pinto	Albuquerque	New Mexico			Restaurant / Vineyard	Indoor & Outdoor		New Mexican restaurant open since 1962, with patios for weddings and private events.	elpinto@elpinto.com	(505) 898-1771	https://www.elpinto.com
Old Town Farm	Albuquerque	New Mexico			Garden / Outdoor	Indoor & Outdoor		Twelve-acre farm with gardens, pastures and a big red barn, known for green weddings.	linda@oldtownfarm.com	(505) 764-9116	https://oldtownfarm.com
Hotel Parq Central	Albuquerque	New Mexico			Ballroom / Hotel	Indoor & Outdoor	150	Locally owned restored hotel in Huning Highlands with a rooftop lounge looking over downtown and the mountains.	info@hotelparqcentral.com	(505) 242-0040	https://www.hotelparqcentral.com
Nature Pointe	Tijeras	New Mexico			Garden / Outdoor	Indoor & Outdoor		Venue in the Sandia Mountain foothills, with tables, linens, décor and an event coordinator included.	info@naturepointeweddings.com	(505) 286-4971	https://naturepointeweddings.com
The Event Center at Sandia Golf Club	Albuquerque	New Mexico			Ballroom / Hotel	Indoor & Outdoor	500	5,000 sq ft of indoor event space and a patio with mountain views on a championship golf course.		505-798-3990	https://www.sandiagolf.com/venue/
Casa Perea Art Space	Corrales	New Mexico			Historic / Estate	Indoor & Outdoor		5,600 sq ft historic adobe with a 62-foot wooden dance floor, on a landscaped acre with a wisteria pergola.	casapereaartspace@gmail.com	(505) 503-7636	https://www.casapereaartspace.com
D.H. Lescombes Winery & Bistro	Albuquerque	New Mexico			Restaurant / Vineyard	Indoor		Old Town winery bistro that hosts private tastings, weddings and group events.			https://www.lescombeswinery.com/eventspaceabq/
Desert Harbor Retreat	Sandia Park	New Mexico			Garden / Outdoor	Outdoor		Thirty-four off-grid high-desert acres for private elopements and micro-weddings, with a single casita.	anchor@desertharbor.org	505-252-0558	https://www.desertharborretreat.com
`,
  },
  {
    name: "Santa Fe, Taos and Northern New Mexico",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
El Rey Court	Santa Fe	New Mexico			Ballroom / Hotel	Indoor & Outdoor		Adobe motor court from 1936 on old Route 66, with 86 rooms, five acres of gardens and several ceremony and reception spaces.	info@elreycourt.com	505-982-1931	https://www.elreycourt.com
Eldorado Hotel & Spa	Santa Fe	New Mexico			Ballroom / Hotel	Indoor		Downtown hotel with 219 rooms, within walking distance of the Plaza, with meeting and wedding spaces.		505-988-4455	https://www.eldoradohotel.com
Hotel St. Francis	Santa Fe	New Mexico			Ballroom / Hotel	Indoor		Historic boutique hotel in downtown Santa Fe that hosts weddings and meetings.		505-983-5700	https://www.hotelstfrancis.com
La Posada de Santa Fe	Santa Fe	New Mexico			Ballroom / Hotel	Indoor & Outdoor		Resort a few blocks from the Plaza with several reception and ceremony venues, including the historic Staab House.		505-986-0000	https://www.laposadadesantafe.com
La Fonda on the Plaza	Santa Fe	New Mexico			Ballroom / Hotel	Indoor		Hotel on the historic Santa Fe Plaza with on-site catering and room blocks for wedding guests.		505-982-5511	https://www.lafondasantafe.com
Inn of the Turquoise Bear	Santa Fe	New Mexico			Historic / Estate	Indoor & Outdoor		Bed and breakfast in a once-private historic estate near downtown, suited to elopements and small weddings.		505-983-0798	https://www.turquoisebear.com
Santa Fe Botanical Garden	Santa Fe	New Mexico			Garden / Outdoor	Outdoor		Botanical garden on Museum Hill, available for private rentals.		505-471-9103	https://www.santafebotanicalgarden.org
Bishop's Lodge	Santa Fe	New Mexico			Ballroom / Hotel	Indoor & Outdoor		Auberge resort in the foothills north of town, bordering national forest, with guest rooms, casitas and a bunkhouse.		505-390-2323	https://auberge.com/bishops-lodge/
El Rancho de las Golondrinas	Santa Fe	New Mexico			Historic / Estate	Indoor & Outdoor		Living history museum south of Santa Fe, with buildings dating to the 1700s, rented for weddings and celebrations.		(505) 471-2261	https://www.golondrinas.org
Blame Her Ranch	Ribera	New Mexico			Barn / Rustic	Indoor & Outdoor	250	Ranch at 7,000 feet, under an hour from Santa Fe, with four event spaces and overnight lodging for up to 66.	BlameHerManager@gmail.com	575-577-6269	https://www.blameherranch.com
Leaping Deer Ranch	Las Vegas	New Mexico			Garden / Outdoor	Indoor & Outdoor	120	Mountain ranch stay and wellness centre near Las Vegas, NM, with an outdoor ceremony site and an event hall for up to 120.	colin@leapingdeerranch.com	(505) 595-7244	https://www.leapingdeerranch.com
Log River Ranch	Chama	New Mexico			Barn / Rustic	Indoor & Outdoor		Family-owned ranch on the Rio Chama, hosting weddings since 2019, with log cabins for overnight guests.	info@logriverranch.com	(575) 209-4410	https://logriverranch.com
El Monte Sagrado	Taos	New Mexico			Ballroom / Hotel	Indoor & Outdoor		Luxury wellness resort in Taos that hosts weddings and meetings.		855-846-8267	https://www.elmontesagrado.com
Sagebrush Inn & Suites	Taos	New Mexico			Ballroom / Hotel	Indoor & Outdoor		Taos hotel with indoor and outdoor wedding venues, a cantina and live music.	info@sagebrushinn.com	575-758-2254	https://www.sagebrushinn.com
Historic Taos Inn	Taos	New Mexico			Historic / Estate	Indoor & Outdoor		Historic adobe inn with several courtyards and on-site dining, hosting intimate weddings.	hello@taosinn.com	(575) 758-2233	https://www.taosinn.com
`,
  },
  {
    name: "Northwest Arkansas and Eureka Springs",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Stone Chapel at MattLane Farm	Fayetteville	Arkansas			Garden / Outdoor	Indoor & Outdoor		Stone chapel on landscaped farm grounds 15 minutes from downtown Fayetteville.	mattlanefarm@gmail.com	(479) 871-0789	https://stonechapelnwa.com
Botanical Garden of the Ozarks	Fayetteville	Arkansas			Garden / Outdoor	Indoor & Outdoor		Botanical garden with themed gardens and a butterfly house, rented for weddings and events.	info@bgozarks.org	(479) 750-2620	https://www.bgozarks.org
Inn at Carnall Hall	Fayetteville	Arkansas			Ballroom / Hotel	Indoor		Inn on the University of Arkansas campus with more than 3,000 sq ft of event space.		479-582-0400	https://www.innatcarnallhall.com
The Ravington	Centerton	Arkansas			Historic / Estate	Indoor		Intimate venue in a 1909 building with 18-foot ceilings, exposed brick and reclaimed wood floors.		479-903-3518	https://theravington.com
Kindred North	Centerton	Arkansas			Barn / Rustic	Indoor & Outdoor	300	A 5,200 sq ft climate-controlled ceremony and reception hall, plus a tree-lined outdoor ceremony site for 300.	booking@kindrednorth.com		https://www.kindrednorth.com
Osage House	Cave Springs	Arkansas			Garden / Outdoor	Indoor & Outdoor		Two venues, The Hall + Chapel and The Reserve, each with suites for both partners.	info@osagehouse.com	479-257-7888	https://www.osagehouse.com
The Ballroom at I Street	Bentonville	Arkansas			Ballroom / Hotel	Indoor		Ballroom in central Bentonville with a bridal party house in a renovated 1930s home.	events@theballroomatistreet.com		https://www.theballroomatistreet.com
Record	Bentonville	Arkansas			Ballroom / Hotel	Indoor & Outdoor	1000	Downtown event space with exposed brick and several halls, the largest holding up to 1,000.			https://www.recorddowntown.com
The Apollo on Emma	Springdale	Arkansas			Historic / Estate	Indoor		Former theatre in historic downtown Springdale, now a wedding and event space.	theapolloonemma@gmail.com		https://theapolloonemma.com
Sassafras Springs Vineyard	Springdale	Arkansas			Restaurant / Vineyard	Indoor & Outdoor	250	Winery near Fayetteville with chapel ruins, a stables hall seating 250 for a ceremony, and on-site lodging.	info@sassafrasspringsvineyard.com	479-419-4999	https://www.sassafrasspringsvineyard.com
Thorncrown Chapel	Eureka Springs	Arkansas			Historic / Estate	Indoor		Glass-and-timber chapel in the Ozark woods, 48 feet tall with 425 windows, hosting weddings since 1980.	felicia@thorncrownweddings.com		https://www.thorncrown.com
1886 Crescent Hotel & Spa	Eureka Springs	Arkansas			Ballroom / Hotel	Indoor & Outdoor		Historic hotel on 15 acres with five indoor and outdoor wedding venues, 72 rooms and four cottages.			https://crescenthotelwedding.com
Basin Park Hotel	Eureka Springs	Arkansas			Ballroom / Hotel	Indoor & Outdoor	100	Downtown hotel with a ballroom and a rooftop Crow's Nest; ceremony-and-reception packages for up to 100.	sales@basinpark.com	(855) 700-9434	https://basinparkhotelweddings.com
`,
  },
  {
    name: "Little Rock, Hot Springs and Central Arkansas",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
The Castle on Stagecoach	Little Rock	Arkansas			Historic / Estate	Indoor & Outdoor		Castle-style venue with intimate indoor rooms and expansive grounds for outdoor events.		501-960-0658	https://www.thecastleonstagecoach.com
Wildwood Park for the Arts	Little Rock	Arkansas			Garden / Outdoor	Indoor & Outdoor		Park in west Little Rock with a theatre, pavilion, gazebo, lawn and arboretum to rent.			https://www.wildwoodpark.org
Rusty Tractor Vineyards	Little Rock	Arkansas			Restaurant / Vineyard	Indoor & Outdoor	300	Vineyard with the Sunset Lodge event space overlooking the vines and a restored 100-year-old dairy barn.	info@rtvwine.com		https://www.rustytractorvineyards.com
Pine Haven Venue	Little Rock	Arkansas			Garden / Outdoor	Indoor & Outdoor		Modern venue in the pine forest with a chapel, garden ceremony area and patios.	hello@pinehavenvenue.com	501-559-5959	https://www.pinehavenvenue.com
The Capital Hotel	Little Rock	Arkansas			Ballroom / Hotel	Indoor		Gilded Age hotel downtown that has hosted Little Rock's events for over a century.	info@capitalhotel.com	(501) 374-7474	https://www.capitalhotel.com
The Arlington Resort Hotel & Spa	Hot Springs	Arkansas			Ballroom / Hotel	Indoor		Historic resort hotel with a thermal bathhouse, hosting weddings and celebrations.	info@arlingtonhotel.com	(501) 623-7771	https://www.arlingtonhotel.com
Garvan Woodland Gardens	Hot Springs	Arkansas			Garden / Outdoor	Indoor & Outdoor	200	University of Arkansas botanical garden on 210 acres, with Anthony Chapel for up to 200 and several garden sites.	GWGweds@uark.edu	501-262-9608	https://www.garvangardens.org
The Pines	Conway	Arkansas			Barn / Rustic	Indoor & Outdoor		Renovated horse farm with a barn, stables, courtyard, pond and overnight suites.	thepinesconway@gmail.com	501-380-0035	https://www.thepinesconway.com
Bella Terra Estate	Cabot	Arkansas			Barn / Rustic	Indoor & Outdoor		Ten acres of pastureland with an outdoor ceremony site and two guest cabins.		501-231-1727	https://www.bellaterraestate.com
`,
  },
  {
    name: "Baton Rouge and Acadiana",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
River Terrace at the Shaw Center for the Arts	Baton Rouge	Louisiana			Beach / Waterfront	Indoor & Outdoor	300	Glass-enclosed room and terrace overlooking the Mississippi, for 300 seated or 400 standing.	info@shawcenter.org	225-346-5001	https://www.shawcenter.org
Oak Lodge	Baton Rouge	Louisiana			Ballroom / Hotel	Indoor		Reception venue with three event spaces in a New Orleans style.	mary@oaklodgeonline.com	225-291-6257	https://oakparcevents.com
Parc 73	Prairieville	Louisiana			Ballroom / Hotel	Indoor		Reception venue with several event spaces, run alongside its sister venue Oak Lodge.	mary@parc73.com	225-744-3344	https://www.parc73.com
Cajun Mansion	Youngsville	Louisiana			Historic / Estate	Indoor & Outdoor	200	All-inclusive venue near Lafayette, from micro weddings of 20-45 to celebrations of 200.	info@cajunmansion.com	337-223-4722	https://cajunmansion.com
Rip Van Winkle Gardens	New Iberia	Louisiana			Garden / Outdoor	Indoor & Outdoor		Gardens on Jefferson Island with a renovated reception hall, the Orangerie and Acadian-style guest cottages.	rvw.1073@gmail.com	(337) 359-8525	https://www.ripvanwinklegardens.com
`,
  },
  {
    name: "New Orleans",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Race + Religious	New Orleans	Louisiana			Historic / Estate	Indoor & Outdoor		Three-building property in the Lower Garden District with whimsical indoor rooms and brick courtyards full of greenery.	info@raceandreligious.com	(504) 523-0890	https://www.raceandreligious.com
Broussard's	New Orleans	Louisiana			Restaurant / Vineyard	Indoor & Outdoor	650	French Quarter restaurant open since 1920 with a courtyard; weddings from 50 in the Josephine Room to 650 when combined with the Hermann-Grima House next door.		504-581-3866	https://www.broussards.com
Arnaud's	New Orleans	Louisiana			Restaurant / Vineyard	Indoor	220	French Quarter restaurant spread over 11 historic buildings and 17 dining rooms, including the art deco Count's Room for 220 seated.	sales@arnauds.com	504-523-5433	https://www.arnaudsrestaurant.com
Antoine's	New Orleans	Louisiana			Restaurant / Vineyard	Indoor	300	New Orleans' oldest restaurant, open since 1840, with private rooms for 2 to 300; the Large Annex seats 220.		(504) 581-4422	https://antoines.com
Commander's Palace	New Orleans	Louisiana			Restaurant / Vineyard	Indoor	350	Garden District restaurant with private rooms for up to 96 and full buyouts seating 350.	info@commanderspalace.com	(504) 899-8221	https://www.commanderspalace.com
The Court of Two Sisters	New Orleans	Louisiana			Restaurant / Vineyard	Indoor & Outdoor	500	French Quarter restaurant with the neighbourhood's largest courtyard, hosting ceremonies and receptions of up to 500.	Court2si@courtoftwosisters.com	(504) 522-7261	https://www.courtoftwosisters.com
Hotel Monteleone	New Orleans	Louisiana			Ballroom / Hotel	Indoor	325	Family-owned French Quarter hotel since 1886 with over 27,000 sq ft of event space; weddings of up to 325.		504-523-3341	https://www.hotelmonteleone.com
Bourbon Orleans Hotel	New Orleans	Louisiana			Ballroom / Hotel	Indoor & Outdoor	250	French Quarter hotel whose Orleans Ballroom, once part of the 1800s Orleans Theatre, seats 175 or 250 for a reception, with a balcony facing St. Louis Cathedral.		(855) 771-5214	https://www.bourbonorleans.com
The Windsor Court	New Orleans	Louisiana			Ballroom / Hotel	Indoor & Outdoor		Downtown luxury hotel with eight wedding spaces, from a grand ballroom to intimate salons, and a courtyard send-off.	weddings@thewindsorcourt.com	(504) 523-6000	https://thewindsorcourt.com
Royal Sonesta New Orleans	New Orleans	Louisiana			Ballroom / Hotel	Indoor & Outdoor	450	Bourbon Street hotel with a Grand Ballroom for receptions of up to 450 and a courtyard.	rsnosales@sonesta.com	(504) 586-0300	https://www.sonesta.com/royal-sonesta/la/new-orleans/royal-sonesta-new-orleans
The Columns	New Orleans	Louisiana			Historic / Estate	Indoor & Outdoor	350	St. Charles Avenue hotel in a historic mansion, with a patio and porch for full buyouts of up to 350.	events@thecolumns.com	504-899-9308	https://thecolumns.com
The Chloe	New Orleans	Louisiana			Historic / Estate	Indoor & Outdoor	225	Fourteen-room boutique hotel in an Uptown mansion, booked for full-weekend wedding buyouts, with receptions of up to 225 standing.	info@thechloenola.com	(504) 541-5500	https://thechloenola.com
Degas House	New Orleans	Louisiana			Historic / Estate	Indoor & Outdoor		Esplanade Avenue home of the painter Edgar Degas, now a bed and breakfast with a courtyard shaded by oaks and palms.	events@degashouse.com	(504) 821-5009	https://www.degashouse.com
The Elms Mansion	New Orleans	Louisiana			Historic / Estate	Indoor & Outdoor		Italianate mansion on St. Charles Avenue in the Garden District, hosting weddings in its rooms and gardens since 1969.	info@elmsmansion.com	504-895-9200	https://www.elmsmansion.com
Marigny Opera House	New Orleans	Louisiana			Historic / Estate	Indoor		Former church in the Marigny that now runs as a non-profit arts venue; wedding fees support local artists.	info@marignyoperahouse.org	504-948-9998	https://marignyoperahouse.org
Generations Hall	New Orleans	Louisiana			Historic / Estate	Indoor	2000	Restored 1820s sugar refinery in the Warehouse District with three event spaces, several bars and outside catering allowed at no extra charge.	tsana@generationshall.com	(504) 568-1700	https://generationshall.com
Pitot House	New Orleans	Louisiana			Historic / Estate	Outdoor	150	Historic Creole house on Bayou St. John with a 10,000 sq ft meadow for ceremonies and receptions of up to 150.	events@louisianalandmarks.org	(504) 482-0312	https://www.pitothouse.org
New Orleans Pharmacy Museum	New Orleans	Louisiana			Historic / Estate	Indoor & Outdoor		The 1823 French Quarter apothecary of America's first licensed pharmacist, now a museum with a tropical courtyard for ceremonies and receptions.	pharmacymuseum@gmail.com	504-490-6263	https://pharmacymuseum.org
New Orleans Museum of Art	New Orleans	Louisiana			Garden / Outdoor	Indoor & Outdoor	1200	City Park museum whose Great Hall, Coleman Courtyard and Besthoff Sculpture Garden host weddings; the Great Hall holds 1,200 standing.	events@noma.org	504-658-4100	https://noma.org
New Orleans City Park	New Orleans	Louisiana			Garden / Outdoor	Indoor & Outdoor		Nine wedding sites across 1,300 acres, including the Peristyle, the Pavilion of the Two Sisters and the Arbor Room in the Botanical Garden.		504-488-2896	https://neworleanscitypark.org
Ogden Museum of Southern Art	New Orleans	Louisiana			Historic / Estate	Indoor & Outdoor	700	Warehouse District museum with Goldring Hall for receptions of up to 700, a rooftop terrace and a historic library hall for 300.	events@ogdenmuseum.org	504-539-9600	https://ogdenmuseum.org
`,
  },
  {
    name: "Northshore and Acadiana",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Southern Hotel	Covington	Louisiana			Ballroom / Hotel	Indoor & Outdoor		Century-old hotel in downtown Covington with courtyards, ballrooms and in-house catering.	guestservices@southernhotel.com	844-866-1907	https://www.southernhotel.com
Warehouse 535	Lafayette	Louisiana			Historic / Estate	Indoor & Outdoor		Converted warehouse in the heart of Lafayette with three event rooms and an outdoor space.	denise@warehouse535.com		https://warehouse535.com
Maison Madeleine	Breaux Bridge	Louisiana			Historic / Estate	Indoor & Outdoor	200	1840s Creole cottage on the National Register, in gardens on Lake Martin; weddings of up to 200.	grace@maisonmadeleine.com	337-332-4555	https://www.maisonmadeleine.com
`,
  },
  {
    name: "Mississippi Gulf Coast",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
The White House Hotel	Biloxi	Mississippi			Ballroom / Hotel	Indoor & Outdoor		Historic hotel on Beach Boulevard with a ballroom and a terrace looking over the Mississippi Sound.	info@whitehousebiloxi.com		https://www.whitehousebiloxi.com
Ohr-O'Keefe Museum of Art	Biloxi	Mississippi			Garden / Outdoor	Indoor & Outdoor		Museum campus of Frank Gehry-designed buildings among old live oaks, rented for weddings.	rentals@georgeohr.org	228-374-5547	https://georgeohr.org
Mississippi Aquarium	Gulfport	Mississippi			Beach / Waterfront	Indoor & Outdoor		Aquarium on a 5.8-acre campus with a 360-degree tunnel, indoor and outdoor exhibits and in-house catering.	events@msaquarium.org	(228) 241-1300	https://www.msaquarium.org
Gulf Hills Hotel + Resort	Ocean Springs	Mississippi			Beach / Waterfront	Indoor & Outdoor		Ocean Springs' only waterfront hotel, on the bayou since 1927.	guestservices@raintravelcollection.com	(228) 875-4211	https://www.gulfhillshotel.com
Walter Anderson Museum of Art	Ocean Springs	Mississippi			Historic / Estate	Indoor & Outdoor		Museum of the Gulf Coast painter's work, with galleries open to guests and an 1800s art cottage for smaller gatherings.		228-872-3164	https://www.walterandersonmuseum.org
`,
  },
  {
    name: "Mobile and Bellingrath",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Bragg-Mitchell Mansion	Mobile	Alabama			Historic / Estate	Indoor & Outdoor		1855 mansion rented with its first floor, patio and grounds for ceremonies and receptions.		251-471-6364	https://braggmitchellmansion.com
Historic Oakleigh	Mobile	Alabama			Historic / Estate	Outdoor	100	1830s Greek Revival house on three acres of grounds, with a cottage used as a bridal suite; weddings of up to 100.	events@historicoakleigh.org	251-432-1281	https://www.historicoakleigh.com
Fort Condé Inn	Mobile	Alabama			Historic / Estate	Indoor & Outdoor		Boutique hotel made of early-1800s homes in a private downtown enclave under a canopy of oaks.	info@fortcondeinn.com	(251) 405-5040	https://www.fortcondeinn.com
Bellingrath Gardens and Home	Theodore	Alabama			Garden / Outdoor	Indoor & Outdoor	80	Sixty-five acres of gardens around the Bellingrath estate, with ceremonies and receptions all year and the Magnolia Room for 80 indoors.		251-459-8868	https://bellingrath.org
`,
  },
  {
    name: "Memphis",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Woodruff-Fontaine House	Memphis	Tennessee			Historic / Estate	Indoor & Outdoor	150	1871 Victorian mansion museum hosting weddings in its carriage house and garden, with a photo session inside the house.	contact@woodruff-fontaine.org	901-526-1469	https://www.woodruff-fontaine.org
Memphis Brooks Museum of Art	Memphis	Tennessee			Historic / Estate	Indoor	250	Art museum in Overton Park with a rotunda, galleries and an auditorium seating 250.		901-544-6200	https://www.brooksmuseum.org
Loflin Yard	Memphis	Tennessee			Garden / Outdoor	Indoor & Outdoor		Two acres downtown with patios, a waterway, covered decks and three bars, handling catering and details in house.	info@loflinyard.com	901-453-4777	https://www.loflinyard.com
Metal Museum	Memphis	Tennessee			Garden / Outdoor	Indoor & Outdoor		Museum on a bluff over the Mississippi, with a gazebo made of historic castings for sunset ceremonies.	info@metalmuseum.org	901-774-6380	https://www.metalmuseum.org
The Guest House at Graceland	Memphis	Tennessee			Ballroom / Hotel	Indoor & Outdoor	1000	Hotel at Graceland with the Chapel in the Woods for up to 100 and a ballroom for up to 1,000.		901-473-6005	https://guesthousegraceland.com
Shelby Farms Park	Memphis	Tennessee			Garden / Outdoor	Indoor & Outdoor		Large city park with lakes, a garden pavilion, a ballroom and an on-site catering kitchen.	info@shelbyfarmspark.org	(901) 723-0147	https://www.shelbyfarmspark.org
`,
  },
  {
    name: "Jackson, Hattiesburg and Oxford",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Fairview Inn	Jackson	Mississippi			Historic / Estate	Indoor & Outdoor		Historic boutique hotel framed by two century-old magnolias, hosting weddings for over twenty years.		601-948-3429	https://fairviewinn.com
Duling Hall	Jackson	Mississippi			Historic / Estate	Indoor & Outdoor	500	Former 1928 elementary school in Fondren, now a music and event hall seating about 250 or 500 standing.		(601) 292-7121	https://dulinghall.com
The Mill at MSU	Starkville	Mississippi			Historic / Estate	Indoor	1000	Restored 1902 mill at Mississippi State with exposed beams, original brick and space for up to 1,000.			https://www.devalumni.msstate.edu/millatmsu
The Lyric Oxford	Oxford	Mississippi			Historic / Estate	Indoor		Restored former theatre steps from the Oxford Square, with a two-level hall, built-in bars and in-house sound and lighting.	info@thelyricoxford.com	(662) 234-5333	https://thelyricoxford.com
The Jefferson	Oxford	Mississippi			Ballroom / Hotel	Indoor & Outdoor	1500	Venue five miles from the Square with a column-free Grand Hall and other rooms overlooking an eight-acre lake.	info@thejeffersonoxford.com	662-550-3065	https://thejeffersonoxford.com
The Lodge at Live Strive Farms	Oxford	Mississippi			Barn / Rustic	Indoor & Outdoor	286	Glass chapel and reception hall on 170 acres of countryside, with overnight lodging for 10.		(662) 444-8141	https://thelodgems.com
The Simmons House	Water Valley	Mississippi			Historic / Estate	Indoor & Outdoor		Restored 1871 Greek Revival home and inn about 20 miles from Oxford.	hello@thesimmonshouse.com	(662) 714-4006	https://www.thesimmonshouse.com
The Crawford House & Gardens	Hattiesburg	Mississippi			Historic / Estate	Indoor & Outdoor		Historic house and gardens in downtown Hattiesburg.	info@thecrawfordhouseandgardens.com	(228) 669-3835	https://www.thecrawfordhouseandgardens.com
The White Rose at Waterloo Farms	Hattiesburg	Mississippi			Barn / Rustic	Indoor & Outdoor	250	Early-1940s farm in the countryside outside town, with a rustic barn, gardens and lodging.	waterloofarms73@gmail.com	(601) 270-1709	https://www.waterloofarms.com
Bridlewood Event Venue	Hattiesburg	Mississippi			Barn / Rustic	Indoor & Outdoor	300	Restored barns and oak-shaded ceremony sites, with a sister venue in Madison and on-site lodging.	info@bridlewoodeventvenue.com		https://bridlewoodeventvenue.com
The Bottling Company	Hattiesburg	Mississippi			Historic / Estate	Indoor	1000	Renovated 1915 bottling plant in the downtown historic district, 12,780 sq ft for up to 1,000.		(601) 577-8683	https://www.thebottlingcompanyhattiesburg.com
The Bezerra Downtown	Hattiesburg	Mississippi			Ballroom / Hotel	Indoor		Wedding and event venue opened in 2023 in downtown Hattiesburg.		(601) 255-3900	https://thebezerradowntown.com
The Venue at Sycamore Oaks	Hattiesburg	Mississippi			Ballroom / Hotel	Indoor	180	Indoor venue with two halls and all-inclusive packages; ceremonies for 180 seated.	admin@venueatsycamoreoaks.com	(601) 337-2584	https://www.venueatsycamoreoaks.com
`,
  },
  {
    name: "Birmingham and Tuscaloosa",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Iron City	Birmingham	Alabama			Historic / Estate	Indoor		Restored 1929 building that runs as a music venue, with a sunken dance floor, a mezzanine and in-house catering.	events@ironcitybham.com		https://ironcitybham.com
Kress BHM	Birmingham	Alabama			Historic / Estate	Indoor & Outdoor		The 1937 Kress Building downtown, with a rooftop and a ballroom to rent.	info@locallinkbham.com	205-314-0522	https://www.kressbhm.com
Avondale Brewing Co.	Birmingham	Alabama			Historic / Estate	Indoor	140	Event space above the brewery with exposed brick and beams; 90 seated or 140 part-standing.		205-936-8861	https://www.avondalebrewing.com
Vulcan Park and Museum	Birmingham	Alabama			Garden / Outdoor	Indoor & Outdoor		Park around the giant iron statue of Vulcan, with an observation tower over the city.		205-933-1409	https://visitvulcan.com
Gabrella Manor	Birmingham	Alabama			Historic / Estate	Indoor & Outdoor	200	Historic venue with flagstone ceremony aisles for up to 200 and small packages for up to 35.	office@gabrellamanor.com	205-833-9754	https://www.gabrellamanor.com
Grand Bohemian Hotel Mountain Brook	Mountain Brook	Alabama			Ballroom / Hotel	Indoor & Outdoor		Art-filled hotel with a courtyard, an indoor backup space and a rooftop.	GBMB_Sales@pivothotelgroup.com	(205) 414-0505	https://www.grandbohemianmountainbrook.com
Aldridge Gardens	Hoover	Alabama			Garden / Outdoor	Indoor & Outdoor		Thirty acres of gardens around a six-acre lake, with several garden ceremony sites.	info@aldridgegardens.com	205-739-6558	https://aldridgegardens.com
Camelot Manor	Westover	Alabama			Garden / Outdoor	Indoor & Outdoor	225	1880 home with grounds and a pavilion for up to 225, southeast of Birmingham.		205-222-1329	https://www.camelotmanor.net
Southern House & Garden	Knoxville	Alabama			Barn / Rustic	Indoor & Outdoor	250	All-inclusive venue between Birmingham and Tuscaloosa with a barn, a vintage chapel for 250 and English gardens.	info@southernhouseandgarden.com	(205) 345-5767	https://www.southernhouseandgarden.com
The Stables at Cypress Creek	Tuscaloosa	Alabama			Historic / Estate	Indoor & Outdoor	120	Equestrian estate on 17 acres with four ceremony sites, for micro weddings and weddings of up to 120.		205-650-1552	https://www.thestablesatcypresscreek.com
Historic Tuscaloosa	Tuscaloosa	Alabama			Historic / Estate	Indoor & Outdoor		Preservation society renting the Jemison-Van de Graaff Mansion, the Battle-Friedman House and the Old Tavern.	info@historictuscaloosa.org	205-758-2238	https://www.historictuscaloosa.org
`,
  },
  {
    name: "Huntsville and Montgomery",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Burritt on the Mountain	Huntsville	Alabama			Historic / Estate	Indoor & Outdoor		Mountaintop museum with a 1930s mansion, a gazebo, a historic church and views over Huntsville.		(256) 536-2882	https://burrittonthemountain.com
Huntsville Botanical Garden	Huntsville	Alabama			Garden / Outdoor	Indoor & Outdoor	350	Garden with the lakeside Isenberg Grand Hall seating 350, a carriage house and an arbor.	rentals@hsvbg.org	256-830-4447	https://hsvbg.org
Huntsville Museum of Art	Huntsville	Alabama			Historic / Estate	Indoor		Art museum in Big Spring Park renting its galleries and rooms for weddings and receptions.		256-535-4350	https://hsvmuseum.org
Stovehouse	Huntsville	Alabama			Historic / Estate	Indoor & Outdoor	650	Converted stove factory with food, music and several halls from 20 to 650.			https://www.stovehouse.com
Meadow Creek Farm	Huntsville	Alabama			Barn / Rustic	Indoor & Outdoor	250	Barn venue on six acres with seating for 250.	info@meadowcreekfarmweddings.com	(256) 859-5373	https://www.meadowcreekfarmweddings.com
The 1616 House	Montgomery	Alabama			Historic / Estate	Indoor & Outdoor		Restored historic house in Montgomery with a carriage house.	events@the1616house.com	334-216-7585	https://www.the1616house.com
Alley Station	Montgomery	Alabama			Historic / Estate	Indoor & Outdoor		Downtown venue with a ballroom, a rooftop terrace and a brick-walled warehouse.	info@alleystation.com	334-239-7014	https://www.alleystation.com
Venue 901	Montgomery	Alabama			Ballroom / Hotel	Indoor & Outdoor	100	Modern venue with a 5,000 sq ft walled courtyard, for events under 100 guests.	venue901@gmail.com	334-649-4804	https://venue901mgm.com
`,
  },
  {
    name: "Nashville, Franklin and Middle Tennessee",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Riverwood Mansion	Nashville	Tennessee			Historic / Estate	Indoor & Outdoor	300	Greek Revival mansion with marble fireplaces, chandeliers and year-round gardens under old magnolias.	events@riverwoodmansion.com	(615) 228-8892	https://www.riverwoodmansion.com
Cheekwood Estate & Gardens	Nashville	Tennessee			Garden / Outdoor	Indoor & Outdoor	350	Historic estate and botanical garden with eleven event spaces, from small garden rooms to the mansion and Swan Lawn.		615-354-6377	https://www.cheekwood.org
Belle Meade Historic Site & Winery	Nashville	Tennessee			Historic / Estate	Indoor & Outdoor	200	Boxwood-garden ceremonies in front of a Greek Revival mansion, with receptions in a climate-controlled brick Carriage House.	info@visitbellemeade.com	615-356-0501	https://visitbellemeade.com
Clementine Hall	Nashville	Tennessee			Historic / Estate	Indoor & Outdoor	300	Rebuilt 1889 hall with two event rooms and a walled New Orleans-style courtyard; seats 200 for dinner.	heythere@dragonpark.co	(615) 800-3635	https://www.clementinehall.com
Scarritt Bennett Center	Nashville	Tennessee			Historic / Estate	Indoor & Outdoor		Gothic stone campus near Music Row with wedding packages for ceremonies and receptions.	sales@scarrittbennett.org	(615) 340-7500	https://www.scarrittbennett.org
The Bell Tower	Nashville	Tennessee			Historic / Estate	Indoor		Former downtown church with vaulted ceilings, exposed beams, tall windows and a whiskey tasting room.		615.369.6474	https://www.thebelltower.com
Estelle	Nashville	Tennessee			Historic / Estate	Indoor & Outdoor	95	Small-wedding venue in East Nashville: a garden under a magnolia, dinner in a historic home, then dancing in the Carriage House.	sales@infinityhospitality.net	615.369.6474	https://www.estellenashville.com
Loveless Events	Nashville	Tennessee			Barn / Rustic	Indoor & Outdoor	200	The Loveless Barn and Harpeth Room beside the Loveless Cafe on Highway 100, with a lawn and courtyard.		615.724.7991	https://lovelessevents.com
Drakewood Farm	Goodlettsville	Tennessee			Historic / Estate	Indoor & Outdoor	200	Forty acres 15 minutes from downtown Nashville with an 1850s mansion, stone cottage, three barns and a 4,000 sq ft reception pavilion.	drakewoodfarm@gmail.com	(615) 513-7273	https://www.drakewoodfarm.com
Ravenswood Mansion	Brentwood	Tennessee			Historic / Estate	Indoor & Outdoor	300	1825 mansion on 400 acres of parkland, booked one event a day, with a stone patio seating 250.		615-946-0389	https://www.ravenswoodmansion.com
Cedarmont Farm	Franklin	Tennessee			Barn / Rustic	Indoor & Outdoor		Forty acres with an 1815 home, an event barn, a pond and a pool, plus a bridal house.		615-682-1815	https://www.cedarmontfarm.com
The Harpeth	Franklin	Tennessee			Ballroom / Hotel	Indoor & Outdoor		Downtown Franklin hotel with a courtyard and grand staircase for ceremonies and the Riverside Ballroom for receptions.	info@harpethhotel.com	615-206-7510	https://harpethhotel.com
Graystone Quarry	Franklin	Tennessee			Garden / Outdoor	Indoor & Outdoor		Limestone-and-timber event spaces with slide-away glass walls on 160 acres of streams, ponds and quarry cliffs.	info@graystonequarry.com		https://www.graystonequarry.com
Mint Springs Farm	Nolensville	Tennessee			Barn / Rustic	Indoor & Outdoor		All-inclusive venue in the rolling hills of Williamson County, half an hour from Nashville.	info@mintspringsfarmtn.com	615-212-5529	https://mintspringsfarmtn.com
The Barn at Sycamore Farms	Arrington	Tennessee			Barn / Rustic	Indoor & Outdoor		Climate-controlled cedar barn with verandas, plus ceremony sites on a pond island and under a 100-year-old sycamore.		(615) 395-8266	https://www.sycamorefarmsevents.com
Cedar Springs at Bone Hollow	Lebanon	Tennessee			Barn / Rustic	Indoor & Outdoor		Farm east of Nashville with a meadow ceremony site, a climate-controlled historic barn and two restored cabins to stay in.	events@cedarspringstn.com	(615) 444-5993	https://cedarspringstn.com
The Estate at Cherokee Dock	Lebanon	Tennessee			Historic / Estate	Indoor & Outdoor		Fifteen lakefront acres on Old Hickory Lake with several event spaces, including The Conservatory.		615.369.6474	https://cherokeedock.com
The Adalea	Chapmansboro	Tennessee			Historic / Estate	Indoor & Outdoor		Historic house on 143 acres northwest of Nashville with several outdoor ceremony sites, including one by a koi pond.	info@theadalea.com	(615) 685-3303	https://www.theadalea.com
Cascata Springs	Lewisburg	Tennessee			Garden / Outdoor	Indoor & Outdoor		Italian-style villa with a waterfall, flower gardens, a wooded ceremony site and a covered event space over a three-acre lake, plus on-site lodging.		931-993-6477	https://www.cascatasprings.com
`,
  },
  {
    name: "Chattanooga and Signal Mountain",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
The Read House	Chattanooga	Tennessee			Ballroom / Hotel	Indoor & Outdoor	400	Historic downtown hotel with the mirrored Silver Ballroom for up to 400, smaller rooms and a formal fountain garden.		(423) 266-4121	https://www.readhousehotel.com
The Hotel Chalet	Chattanooga	Tennessee			Ballroom / Hotel	Indoor & Outdoor	176	Hotel at the Chattanooga Choo Choo terminal with a ballroom and outdoor spaces; seats 176 for dinner.	events@thehotelchalet.com	423.266.5000	https://thehotelchalet.com
Common House Chattanooga	Chattanooga	Tennessee			Historic / Estate	Indoor & Outdoor		Social club in the 1920s YMCA with Ruby Hall for receptions, a garden for ceremonies and guest rooms facing Lookout Mountain.	chattanooga.events@commonhouse.com		https://www.commonhouse.com/chattanooga
Skyline Loft at Ruby Falls	Chattanooga	Tennessee			Ballroom / Hotel	Indoor	104	Event loft in the Ruby Falls castle on Lookout Mountain, looking over the Tennessee River; seats 104, or 250 standing.		(423) 821-2544	https://www.rubyfalls.com/discover/event-venue/
McCoy Farm & Gardens	Signal Mountain	Tennessee			Garden / Outdoor	Indoor & Outdoor	200	Thirty-eight acres with a stone manor house, formal gardens, woodland and a pavilion, 15 minutes from downtown.	weddings@mccoywalden.org	423-598-1658	https://mccoyfarmandgardens.com
Mountain Oaks Manor	Ooltewah	Tennessee			Historic / Estate	Indoor		Manor with tea rooms and event spaces suited to small weddings.		423-561-9454	https://www.mountainoaksmanor.com
Howe Farms	Georgetown	Tennessee			Barn / Rustic	Indoor & Outdoor		Three hundred and fifty acres north of Chattanooga with seven separate venues, including a vineyard hall, apple barn and hilltop chapel.		423.380.1001	https://howefarmstn.com
`,
  },
  {
    name: "Knoxville and the Smokies",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Museum of Appalachia	Clinton	Tennessee			Historic / Estate	Indoor & Outdoor	200	Sixty-acre pioneer village north of Knoxville with a 19th-century log chapel, barn-side fields and a barn-style hall seating 200.	bookings@museumofappalachia.org	(865) 494-7680	https://www.museumofappalachia.org
Mabry-Hazen House	Knoxville	Tennessee			Historic / Estate	Indoor & Outdoor		House museum built by 1858 on a hill above downtown, renting its grounds for private events and weddings.	director@mabryhazen.com	(865) 522-8661	https://www.mabryhazen.com
Dara's Garden	Knoxville	Tennessee			Garden / Outdoor	Outdoor		Twenty acres of gardens in South Knoxville with an old quarry and a historic house; small-wedding packages for 60 or fewer.		865-609-3272	https://www.darasgarden.com
Ijams Nature Center	Knoxville	Tennessee			Garden / Outdoor	Indoor & Outdoor		Nature centre in South Knoxville with secluded indoor and outdoor wedding sites.		865-577-4717	https://www.ijams.org/weddings-rentals
The Mill & Mine	Knoxville	Tennessee			Historic / Estate	Indoor		Music hall in the Old City that hosts private events.	info@themillandmine.com		https://themillandmine.com
The Pavilion at Hunter Valley Farm	Knoxville	Tennessee			Beach / Waterfront	Outdoor		Lakeside pavilion in west Knoxville for ceremonies and receptions.		865-315-4571	https://www.huntervalleyfarmtn.com
RT Lodge	Maryville	Tennessee			Ballroom / Hotel	Indoor & Outdoor	200	Lodge booked whole for a wedding weekend, with guest rooms, dining rooms and a Sperry tent for receptions.	weddings@rtlodge.com	(865) 981-9800	https://www.rtlodge.com
The Lake at Willow Oaks	Maryville	Tennessee			Barn / Rustic	Indoor & Outdoor		Post-and-beam granary, private lake and mountain views across 150 acres, with a covered veranda.	willowoaksvenue@gmail.com	865-233-7050	https://www.willowoaksvenue.com
Blackberry Farm	Walland	Tennessee			Ballroom / Hotel	Indoor & Outdoor	140	Luxury farm resort in the Smokies foothills with ceremonies facing the mountains and receptions in Bramble Hall; packages sleep up to 140.	groupsales@blackberryfarm.com		https://www.blackberryweddings.com
Dancing Bear Lodge	Townsend	Tennessee			Garden / Outdoor	Indoor & Outdoor	200	Lodge and bistro with a gazebo lawn, open-air pavilion, event centre and fireside dining room.		(865) 448-6000	https://dancingbearlodge.com
Tremont Lodge & Resort	Townsend	Tennessee			Ballroom / Hotel	Indoor & Outdoor	120	Stone-and-timber mountain lodge with a ceremony lawn, patio and the Spruce Room for receptions.	venue@tremontevents.com	(865) 390-2986	https://tremontevents.com
Country Manor Acres	Townsend	Tennessee			Barn / Rustic	Indoor & Outdoor	500	Several mountain-view ceremony sites and the Appalachian Party Barn, with lodging on site.		865.448.9652	https://www.countrymanoracres.com
Historic Seaton Springs Farm	Sevierville	Tennessee			Barn / Rustic	Indoor & Outdoor		1880s farm near Dollywood with a chapel, lakeside and gazebo sites, a cantilever barn and a restored farmhouse.	info@seatonspringsfarm.com	(865) 446-2662	https://www.seatonspringsfarm.com
Honeysuckle Hills	Pigeon Forge	Tennessee			Barn / Rustic	Indoor	30	Pine-walled chapel in the loft of a barn, for up to 30 guests.	regina@honeysucklehills.com	865-368-5569	https://honeysucklehills.com
Chapel in the Hollow	Seymour	Tennessee			Garden / Outdoor	Outdoor	35	Private woodland chapel by a creek in the Smokies foothills, for up to 35 guests.	chapelinthehollow@gmail.com	865-696-5348	https://chapelinthehollow.com
`,
  },
  {
    name: "Atlanta and around",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Callanwolde Fine Arts Center	Atlanta	Georgia			Historic / Estate	Indoor & Outdoor		27,000 sq ft Tudor Revival mansion on a 12-acre Druid Hills estate, with terraces, a fountain and lawns.	info@callanwolde.org	(404) 872-5338	https://callanwolde.org
Rhodes Hall	Atlanta	Georgia			Historic / Estate	Indoor & Outdoor	150	The "Castle on Peachtree", a stone mansion inspired by the German Rhineland; seats 100 for dinner or 150 for a cocktail reception.		404-885-7800	https://rhodeshall.org
Swan House Gardens at Atlanta History Center	Atlanta	Georgia			Historic / Estate	Indoor & Outdoor	300	Gardens of the 1928 Swan House on the History Center's Buckhead campus, which also has a ballroom and terraces.	PrivateEvents@atlantahistorycenter.com	404-814-4090	https://www.atlantahistorycenter.com/private-events/
Atlanta Botanical Garden	Atlanta	Georgia			Garden / Outdoor	Indoor & Outdoor		Midtown garden with ceremonies in the Rose Garden or Japanese Garden and receptions in Day Hall.	specialevents@atlantabg.org	404-591-1585	https://www.atlantabg.org
Ventanas	Atlanta	Georgia			Ballroom / Hotel	Indoor & Outdoor	550	About 10,000 sq ft downtown over two levels, with floor-to-ceiling skyline windows, a terrace and a rooftop helipad.	ventanasatlanta@lvmgt.com	(404) 766-3867	https://www.ventanasatlanta.com
The Stanley House	Marietta	Georgia			Historic / Estate	Indoor & Outdoor	120	1895 Victorian mansion and inn four blocks from Marietta Square, with all-inclusive weddings.	info@thestanleyhouse.com	770-426-1881	https://www.thestanleyhouse.com
Carl House	Auburn	Georgia			Historic / Estate	Indoor & Outdoor	280	All-inclusive venue: a white-columned home on four acres of gardens, with a 4,000 sq ft ballroom seating 135 (280 buffet).	info@carlhouse.com	(770) 586-0095	https://www.carlhouse.com
Chateau Elan	Braselton	Georgia			Restaurant / Vineyard	Indoor & Outdoor		Winery resort on 3,500 acres northeast of Atlanta, with over a dozen spaces including ballrooms, vineyards and a glass-topped atrium.	sales@chateauelan.com	(678) 425-0900	https://www.chateauelan.com
The Inn at Serenbe	Chattahoochee Hills	Georgia			Garden / Outdoor	Indoor & Outdoor		Inn in the Serenbe community south of Atlanta, with outdoor sites among hills and woods, the Oak Ballroom, and rooms and homes sleeping up to 174.	events@serenbeinn.com		https://www.serenbe.com
Dunaway Gardens	Newnan	Georgia			Garden / Outdoor	Indoor & Outdoor		350-acre retreat with century-old gardens, a restored amphitheatre and 85 rooms, treehouses and cottages.	info@dunawaygardens.com	(770) 400-5860	https://www.dunawaygardens.com
Foxhall Resort	Douglasville	Georgia			Garden / Outdoor	Indoor & Outdoor		1,100-acre resort 25 minutes from Atlanta, with ceremony sites among the pines, the Stables, and clay shooting and ATV rides for guests.	sales@foxhallresort.com	(770) 489-4380	https://www.foxhallresortweddings.com
The Tate House	Tate	Georgia			Historic / Estate	Indoor & Outdoor	180	Pink marble mansion north of Atlanta with garden ceremonies and ballroom receptions.	events@tatehouse.com	770-735-3122	https://www.tatehouse.com
Barnsley Resort	Adairsville	Georgia			Historic / Estate	Indoor & Outdoor		Resort around the ruins of a 19th-century manor house, with gardens, and cottages and an inn for guests.		770-773-7480	https://www.barnsleyresort.com
`,
  },
  {
    name: "Savannah and the Golden Isles",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
The Mackey House	Savannah	Georgia			Historic / Estate	Indoor & Outdoor	200	Colonial-style family estate on 150 private lakeside acres minutes from downtown.		912-234-7404	https://www.mackeyhouse.com
Red Gate Farms	Savannah	Georgia			Barn / Rustic	Indoor & Outdoor		Farm with a renovated red barn and meadow, and the Grainery, a former storehouse with retractable walls and an outdoor amphitheatre.	venueinfo@redgatefarms.com	912-581-4745	https://www.redgatefarms.com
Ships of the Sea Maritime Museum	Savannah	Georgia			Garden / Outdoor	Indoor & Outdoor		Greek Revival William Scarbrough House, with the largest private gardens in the historic district, a block from City Market.	info@shipsofthesea.org	912-232-1511	https://www.shipsofthesea.org
Forsyth Park Inn	Savannah	Georgia			Historic / Estate	Outdoor	45	Victorian bed and breakfast on Forsyth Park, with small ceremonies in its courtyard garden (25 guests June to September).	InnKeeper@ForsythParkInn.com	(912) 233-6800	https://www.forsythparkinn.com
Davenport House Museum	Savannah	Georgia			Garden / Outdoor	Outdoor		1820s house museum whose walled courtyard garden, with an arbour for vows, is rented for private weddings.	info@davenporthousemuseum.org	(912) 236-8097	https://www.davenporthousemuseum.org
Perry Lane Hotel	Savannah	Georgia			Ballroom / Hotel	Indoor & Outdoor		Downtown hotel with a glass-enclosed rooftop ballroom, a terrace and a rooftop lawn.		912-415-9000	https://www.perrylanehotel.com
Hotel Bardo	Savannah	Georgia			Ballroom / Hotel	Indoor & Outdoor		Hotel on Forsyth Park, formerly the Mansion on Forsyth Park, with ballrooms and a courtyard.	hello@staybardo.com	912-238-5158	https://www.staybardo.com
Jekyll Island Club Resort	Jekyll Island	Georgia			Ballroom / Hotel	Indoor & Outdoor		Gilded Age club hotel with oceanfront and riverside sites and three historic island cottages for events.		912-319-4348	https://www.jekyllclub.com
The King and Prince Resort	St. Simons Island	Georgia			Beach / Waterfront	Indoor & Outdoor		Oceanfront resort with a ballroom and outdoor reception sites.		(912) 638-3631	https://www.kingandprince.com
Sea Island	Sea Island	Georgia			Beach / Waterfront	Indoor & Outdoor		Resort with a heart-pine chapel and ballroom at The Cloister, oak-shaded lawns at The Lodge and Rainbow Island on the Black Banks River.		844-633-5416	https://www.seaisland.com
`,
  },
  {
    name: "North Georgia mountains and wine country",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Montaluce Winery	Dahlonega	Georgia			Restaurant / Vineyard	Indoor & Outdoor		Tuscan-style winery and restaurant with villas on site.	info@montaluce.com	706-867-4060	https://www.montaluce.com
Kaya Vineyard & Winery	Dahlonega	Georgia			Restaurant / Vineyard	Indoor & Outdoor	200	Winery with cottages; packages include eight hours of venue time, vendors, photography and catering.	info@kayavineyards.com	706-219-3514	https://www.kayavineyards.com
Wimpy Farms	Dahlonega	Georgia			Barn / Rustic	Indoor & Outdoor	200	Farm of over 100 acres at the foot of the mountains, with its original barn for 50 and Legacy Hall for 200.	nicole@wimpyfarm.com	706-864-6074	https://www.wimpyfarms.com
Tiger Mountain Vineyards	Tiger	Georgia			Restaurant / Vineyard	Indoor & Outdoor	150	Sixty-acre estate winery in the Blue Ridge Mountains.	events@tigerwine.com	(706) 782-4777	https://www.tigerwine.com
The Falls at Blue Ridge	Ellijay	Georgia			Garden / Outdoor	Indoor & Outdoor	300	Venue among waterfalls, creeks and a lake, with a ballroom with retractable glass walls, a courtyard for 300 and a pavilion for 100.	info@thefallsatblueridge.com	(877) 743-2557	https://thefallsatblueridge.com
Brasstown Valley Resort	Young Harris	Georgia			Ballroom / Hotel	Indoor & Outdoor	250	Mountain resort with a Waterfall Lawn and Sunset Terrace for ceremonies, an open-air pavilion, a ballroom seating 250 and stables for 70.	scarey@brasstownvalley.com	706-379-4764	https://brasstownvalley.com
Glen-Ella Springs Inn	Clarkesville	Georgia			Historic / Estate	Indoor & Outdoor	150	Country inn usually booked whole for weekend weddings; its 16 rooms sleep about 36.	info@glenella.com	706-754-7295	https://glenella.com
Lake Rabun Hotel	Lakemont	Georgia			Historic / Estate	Indoor & Outdoor	100	Historic lake hotel and restaurant, with the Forest Lodge, opened in 2020 in private woods, for larger weddings.	lakerabunhotel@yahoo.com	(706) 782-4946	https://www.lakerabunhotel.com
`,
  },
  {
    name: "Athens, Madison, Macon and Augusta",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
State Botanical Garden of Georgia	Athens	Georgia			Garden / Outdoor	Indoor & Outdoor		The University of Georgia's botanical garden, which rents out its gardens and indoor spaces for events.	sbgrent@uga.edu	706-542-1244	https://botgarden.uga.edu
The James Madison Inn	Madison	Georgia			Ballroom / Hotel	Indoor & Outdoor		Downtown inn whose Variety Works, a restored 1870s building, hosts weddings, plus a 3,400 sq ft conference centre.		(706) 342-7040	https://www.jamesmadisoninn.com
Hay House	Macon	Georgia			Historic / Estate	Indoor	100	Georgia Trust mansion that seats 75 or holds 100 standing; it has no air conditioning.		(478) 742-8155	https://hayhouse.org
The Partridge Inn	Augusta	Georgia			Ballroom / Hotel	Indoor & Outdoor		Historic hotel with 143 rooms, event rooms, and a free guest shuttle within three miles.	thepartridgeinn@northph.com	706-737-8888	https://www.partridgeinn.com
Sacred Heart Cultural Center	Augusta	Georgia			Historic / Estate	Indoor & Outdoor	275	Former church with a 7,000 sq ft Great Hall seating 275 and a courtyard garden.	denise@sacredheartaugusta.org	706-826-4700	https://sacredheartaugusta.org
`,
  },
  {
    name: "Charleston and the islands",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Magnolia Plantation and Gardens	Charleston	South Carolina			Garden / Outdoor	Indoor & Outdoor	250	Ceremonies beneath live oaks beside the Ashley River, with receptions at the Carriage House (150 with a dance floor, 250 without).	info@magnoliaplantation.com	(843) 571-1266	https://www.magnoliaplantation.com
Boone Hall Plantation	Mount Pleasant	South Carolina			Historic / Estate	Indoor & Outdoor		The waterfront Cotton Dock, plus a front lawn, a patio and a back lawn over the tidal marshes.	nataliek@boonehallplantation.com	843-884-4371	https://www.boonehallplantation.com
Wentworth Mansion	Charleston	South Carolina			Historic / Estate	Indoor & Outdoor		Mansion hotel with 21 rooms, a lawn with magnolia and live oak, and the Tiffany-glassed Grand Mansion Suite for vows.	wm-concierge@charminginns.com	843-853-1886	https://wentworthmansion.com
The Cedar Room	Charleston	South Carolina			Historic / Estate	Indoor		Private event space in the 1881 Cigar Factory in downtown Charleston.		(843) 793-4103	https://www.thecedarroom.com
High Cotton	Charleston	South Carolina			Restaurant / Vineyard	Indoor	150	East Bay Street restaurant with exposed brick and heart pine floors; seats 100 or 150 for a reception.	kneighbours@hallmanagementgroup.com	(843) 724-3815	https://www.highcottoncharleston.com
Live Oak Charleston	Charleston	South Carolina			Ballroom / Hotel	Indoor & Outdoor		Historic District hotel with more than 5,000 sq ft of event space.		843-718-2327	https://www.liveoakhotelcharleston.com
The Dewberry	Charleston	South Carolina			Ballroom / Hotel	Indoor & Outdoor	200	Hotel with a ballroom under a brass palmetto chandelier, an ivy-covered walled garden and eighth-floor rooftop rooms.	concierge@dewberryhotels.com	843-558-8000	https://thedewberrycharleston.com
Hotel Bennett	Charleston	South Carolina			Ballroom / Hotel	Indoor & Outdoor		Peninsula hotel with a ballroom and a rooftop space over the city.		843-203-0922	https://www.hotelbennett.com
Zero George	Charleston	South Carolina			Historic / Estate	Indoor & Outdoor		Five restored 1804 residences and carriage houses around a private courtyard on East Bay.		843-817-7900	https://www.zerogeorge.com
Charleston Harbor Resort & Marina	Mount Pleasant	South Carolina			Beach / Waterfront	Indoor & Outdoor	350	Waterfront resort and marina across the harbour from downtown, with event spaces for up to 350.		(843) 856-0028	https://www.charlestonharborresort.com
Kiawah Island Golf Resort	Kiawah Island	South Carolina			Beach / Waterfront	Indoor & Outdoor		Beach resort 21 miles from Charleston whose planners can run a week of events around the wedding.		(800) 654-2924	https://www.kiawahresort.com
Wild Dunes Resort	Isle of Palms	South Carolina			Beach / Waterfront	Indoor & Outdoor		Oceanfront resort with beach ceremonies and indoor receptions.		866-359-5593	https://www.wilddunes.com
`,
  },
  {
    name: "Beaufort, Bluffton and Hilton Head",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Hewitt Oaks	Bluffton	South Carolina			Garden / Outdoor	Indoor & Outdoor	350	All-inclusive venue under live oaks that holds one wedding a day, with a 10-bedroom bed and breakfast for the wedding party.	hello@hewittoaks.com	843-284-6686	https://www.hewittoaks.com
Kirks Mansion	Bluffton	South Carolina			Historic / Estate	Indoor & Outdoor		Historic estate and boutique hotel on 12 acres under moss-draped live oaks.	rosehillmansionsc@gmail.com	854-257-7090	https://www.kirksmansion.com
The Grove at Stoney Creek	Bluffton	South Carolina			Garden / Outdoor	Indoor & Outdoor		Ranch-style event venue among old live oaks.	info@thegroveatstoneycreek.com	(854) 345-0716	https://www.thegroveatstoneycreek.com
Heyward House	Bluffton	South Carolina			Historic / Estate	Outdoor		Historic house museum in Old Town Bluffton near the May River, with grounds rented for weddings.	Nicki@HistoricBluffton.org	843-757-6293	https://www.heywardhouse.org
Anchorage 1770	Beaufort	South Carolina			Historic / Estate	Indoor & Outdoor		Waterfront boutique hotel in historic Beaufort, with porches and a fourth-floor rooftop.		843-525-1770	https://anchorage1770.com
Rhett House Inn	Beaufort	South Carolina			Historic / Estate	Indoor & Outdoor		1820s inn among live oaks in downtown Beaufort, for small weddings and events.	info@rhetthouseinn.com	(843) 524-9030	https://rhetthouseinn.com
The Sea Pines Resort	Hilton Head Island	South Carolina			Beach / Waterfront	Indoor & Outdoor		Island resort with in-house catering and the Champions Ballroom at Harbour Town.		(866) 561-8802	https://www.seapines.com
`,
  },
  {
    name: "Upstate, Midlands and the Grand Strand",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Hotel Domestique	Travelers Rest	South Carolina			Ballroom / Hotel	Indoor & Outdoor	300	Countryside hotel at the foot of the Blue Ridge, with ceremonies for 300 on its helipad and receptions in the fountain courtyard.	events@hoteldomestique.com		https://www.hoteldomestique.com
The Oaks	Anderson	South Carolina			Historic / Estate	Indoor & Outdoor	375	European-style estate on 200 acres 30 miles from Greenville, with a pine-beamed hall and a 30-foot glass wall.	theoaksweddingvenue@gmail.com	(864) 293-3606	https://theoaksweddingvenue.com
Greenbrier Farms	Easley	South Carolina			Barn / Rustic	Indoor & Outdoor		All-inclusive working farm a short drive from downtown Greenville.		(864) 855-9782	https://www.greenbrierfarms.com
Riverbanks Zoo & Garden	Columbia	South Carolina			Garden / Outdoor	Indoor & Outdoor	500	Zoo and botanical garden with wedding sites for 15 up to 500 guests.	planyourevent@riverbanks.org	803-602-0900	https://www.riverbanks.org
1208 Washington Place	Columbia	South Carolina			Historic / Estate	Indoor		1924 bank building near the State House, with its original vaults, marble library and two ballrooms.	sales@columbiaconvention.com	(803) 318-3910	https://1208washingtonplace.com
Historic Columbia	Columbia	South Carolina			Historic / Estate	Outdoor		Gardens of the Hampton-Preston Mansion, Robert Mills Carriage House and Woodrow Wilson Family Home, rented for weddings.		(803) 252-7742	https://www.historiccolumbia.org
The Willcox	Aiken	South Carolina			Ballroom / Hotel	Indoor & Outdoor		Historic hotel, restaurant and spa in downtown Aiken.	info@thewillcox.com	803-648-1898	https://www.thewillcox.com
Pawleys Plantation	Pawleys Island	South Carolina			Ballroom / Hotel	Indoor & Outdoor	360	Golf club whose Plantation Ballroom seats 360 over the 18th green and a saltwater marsh.		843-237-6083	https://www.pawleysplantation.com
Hopsewee	Georgetown	South Carolina			Historic / Estate	Indoor & Outdoor		18th-century river plantation with ceremonies under live oaks on the North Santee and a tearoom cottage for receptions.	mail@hopsewee.com	(843) 546-7891	https://www.hopsewee.com
`,
  },
  {
    name: "Asheville and the North Carolina mountains",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Biltmore	Asheville	North Carolina			Historic / Estate	Indoor & Outdoor		America's largest home and its historic gardens, with eight ceremony and reception settings across the estate.		800.411.3812	https://www.biltmore.com/weddings/
Claxton Farm	Weaverville	North Carolina			Barn / Rustic	Indoor & Outdoor		Family farm north of Asheville hosting mountain farm weddings.	events@claxtonfarm.net	(828) 658-1390	https://www.claxtonfarm.com
The North Carolina Arboretum	Asheville	North Carolina			Garden / Outdoor	Indoor & Outdoor		Public garden in the Blue Ridge with ceremony sites such as the Heritage Garden, a fountain for cocktail hour and an event lawn.	events@ncarboretum.org	(828) 412-8568	https://ncarboretum.org/weddings-rentals/private-events/
Asheville Botanical Garden	Asheville	North Carolina			Garden / Outdoor	Outdoor	30	Small garden next to UNC Asheville that allows simple ceremony-only weddings of up to 30, at the gazebo, bridges or Sunshine Meadow.	events@ashevillebotanicalgarden.org	828-252-5190	https://ashevillebotanicalgarden.org/weddings-at-the-gardens/
Highland Brewing	Asheville	North Carolina			Restaurant / Vineyard	Indoor & Outdoor		Asheville's original craft brewery, with a tri-level event centre and rooftop facing the Blue Ridge and a Barrel Room for under 80.		(828) 299-3370	https://highlandbrewing.com/private-events/
Serenity Ridge	Mill Spring	North Carolina			Garden / Outdoor	Outdoor		Twenty-five acres with Blue Ridge views near Lake Lure and Tryon, with a ceremony lawn, open-air reception pavilion and lodging for 36.	events@serenityridgenc.com		https://www.serenityridgenc.com
Castle Ladyhawke	Tuckasegee	North Carolina			Historic / Estate	Indoor & Outdoor	125	Castle-style venue at Bear Lake Reserve with a multi-level outdoor terrace and in-house catering.	info@castleladyhawke.com	(828) 341-6511	https://castleladyhawke.com
Hawkesdene	Andrews	North Carolina			Historic / Estate	Indoor & Outdoor	125	Private estate in the Smokies with cottages, an open-air pavilion, covered bridge, alpaca stable and a reception gallery.	info@hawkesdene.com	828-321-6027	https://hawkesdene.com/wedding/
Chetola Resort	Blowing Rock	North Carolina			Ballroom / Hotel	Indoor & Outdoor		Seventy-five-acre resort in Blowing Rock with lakeside ceremonies and in-house catering.	guestservices@chetola.com	828.295.5500	https://www.chetola.com/north-carolina-wedding-venues
Leatherwood Mountains	Ferguson	North Carolina			Barn / Rustic	Outdoor		Mountain resort of cabins and an on-site restaurant, with a creekside ceremony meadow beside an 1842 homestead.	info@leatherwoodmountains.com	336-973-5044	https://leatherwoodmountains.com/weddings-groups/
`,
  },
  {
    name: "Charlotte and the Triad",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
The Duke Mansion	Charlotte	North Carolina			Historic / Estate	Indoor & Outdoor		Historic inn in Myers Park with a ceremony lawn and garden terrace, taking at most 25 weddings a year.	frontdesk@dukemansion.org	704-714-4400	https://www.dukemansion.org/weddings/
The Ballantyne	Charlotte	North Carolina			Ballroom / Hotel	Indoor & Outdoor		Resort hotel in south Charlotte with two ballrooms, a rose garden and event lawns.		(704) 248-4020	https://www.theballantynehotel.com/weddings
Alexander Homestead	Charlotte	North Carolina			Historic / Estate	Indoor & Outdoor	220	Queen Anne Victorian on eight acres of gardens, with a ballroom and a garden ceremony site.		866-966-3009	https://www.wedgewoodweddings.com/venues/alexander-homestead
Pleasant Grove Farm	Charlotte	North Carolina			Barn / Rustic	Indoor & Outdoor		Women-owned venue on 20 acres in northwest Charlotte with a historic home and barn.		(704) 703-1774	https://www.pleasantgrovefarmvenue.com
Separk Mansion	Gastonia	North Carolina			Historic / Estate	Indoor & Outdoor	200	1919 Italian Renaissance Revival mansion on the National Register, with a ballroom, veranda and formal gardens.		866-966-3009	https://www.wedgewoodweddings.com/venues/separk-mansion
Reynolda	Winston-Salem	North Carolina			Historic / Estate	Outdoor		The R.J. Reynolds estate, with ceremonies in its historic gardens and photography on the museum grounds.	gardens@reynolda.org	336.758.5593	https://reynolda.org/about/weddings/
Graylyn Estate	Winston-Salem	North Carolina			Historic / Estate	Indoor & Outdoor		1930s Norman-style estate owned by Wake Forest University, run as a hotel and conference centre.		336-758-2425	https://www.graylyn.com
Proximity Hotel	Greensboro	North Carolina			Ballroom / Hotel	Indoor & Outdoor	200	Eco-minded boutique hotel hosting weddings for 20 to 200.	sales@qwrh.com	336-478-9123	https://www.proximityhotel.com/weddings/
JH Adams Inn	High Point	North Carolina			Historic / Estate	Indoor	125	Historic inn on North Main Street with event space in the main inn and next-door Elizabeth House for up to 125.		336-882-3267	https://jhadamsinn.com/events/
Childress Vineyards	Lexington	North Carolina			Restaurant / Vineyard	Indoor & Outdoor		Yadkin Valley winery with private event spaces and a micro-wedding package for 8 to 30.		336.236.9463	https://childressvineyards.com/private-events/
Shelton Vineyards	Dobson	North Carolina			Restaurant / Vineyard	Indoor & Outdoor		Yadkin Valley winery with private events catered from its Harvest Grill and tours and tastings for guests.	info@sheltonvineyards.com	336.366.4724	https://www.sheltonvineyards.com/private-corporate-events/
`,
  },
  {
    name: "Raleigh, Durham, Chapel Hill and Pinehurst",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
The Umstead Hotel and Spa	Cary	North Carolina			Ballroom / Hotel	Indoor & Outdoor		Luxury hotel with wooded grounds, a lakeside terrace, a lawn and a ballroom.	sales@theumstead.com	(919) 447-4000	https://www.theumstead.com/weddings
Washington Duke Inn	Durham	North Carolina			Ballroom / Hotel	Indoor & Outdoor	600	Hotel on the Duke campus whose Presidents Ballroom opens onto a terrace and seats 400, with 600 for a ceremony.		919.490.0999	https://www.washingtondukeinn.com/weddings-and-occasions/durham-wedding-venues
Sarah P. Duke Gardens	Durham	North Carolina			Garden / Outdoor	Outdoor		Fifty-five-acre public garden at Duke University that rents out ceremony sites.	gardens@duke.edu	919-684-3698	https://gardens.duke.edu/weddings/
Merrimon-Wynne House	Raleigh	North Carolina			Historic / Estate	Indoor & Outdoor		1876 mansion on Blount Street, restored in 2014, with an outdoor ceremony site and chandeliered main house.		919.906.1026	https://www.merrimonwynne.com/weddings
The Historic Wakefield Barn	Wake Forest	North Carolina			Barn / Rustic	Indoor & Outdoor		Preserved historic barn north of Raleigh for weddings and elopements.	thehistoricwakefieldbarn@gmail.com		https://www.historicwakefieldbarn.com
The Carolina Inn	Chapel Hill	North Carolina			Ballroom / Hotel	Indoor & Outdoor		UNC's hotel since 1924, with courtyards, ballrooms and a black-and-white dance floor.	info@carolinainn.com	919.933.2001	https://www.carolinainn.com
Fearrington Village	Pittsboro	North Carolina			Garden / Outdoor	Indoor & Outdoor		Country village and inn between Chapel Hill and Pittsboro with garden ceremonies and historic reception rooms.	weddings@fearrington.com		https://fearrington.com/pages/weddings
Haw River Ballroom	Saxapahaw	North Carolina			Historic / Estate	Indoor		Ballroom in a restored mill on the Haw River.	karina@hawriverballroom.com		https://www.hawriverballroomweddings.com
Pinehurst Resort	Pinehurst	North Carolina			Ballroom / Hotel	Indoor & Outdoor		Golf resort whose venues include the 1901 Carolina Hotel, the Holly Inn and Lake Pinehurst.		855-235-8507	https://www.pinehurst.com/weddings/
`,
  },
  {
    name: "Wilmington and the Outer Banks",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Airlie Gardens	Wilmington	North Carolina			Garden / Outdoor	Outdoor	300	Former private garden near Wrightsville Beach with live oaks and formal gardens, for up to 300.	airlieinfo@nhcgov.com	910-798-7700	https://airliegardens.org/weddings/
Bellamy Mansion Museum	Wilmington	North Carolina			Historic / Estate	Indoor & Outdoor	50	Antebellum house museum downtown, rented for private events of up to 50.		910.251.3700	https://www.bellamymansion.org/private-events.html
Brooklyn Arts Center	Wilmington	North Carolina			Historic / Estate	Indoor & Outdoor	250	Former church with stained glass and two-storey windows for 250, plus The Annex for 140 and a walled garden.		(910) 859-4615	https://www.brooklynartsnc.com
Thalian Hall	Wilmington	North Carolina			Historic / Estate	Indoor	150	1858 theatre and city hall whose second-floor assembly room hosts private functions for 50 to 150.		910.632.2285	https://www.thalianhall.org/our-venues
Shell Island Resort	Wrightsville Beach	North Carolina			Beach / Waterfront	Indoor & Outdoor		Oceanfront resort with beach ceremonies and Wrightsville Beach's only ocean-view ballroom.		910-344-0888	https://www.shellisland.com/beachside-weddings/
Bald Head Island Club	Bald Head Island	North Carolina			Beach / Waterfront	Indoor & Outdoor	100	Private club whose Ocean Terrace has a white archway for ceremonies and seats 100.		910 457 7300	https://www.bhiclub.net/web/pages/weddings
Elizabethan Gardens	Manteo	North Carolina			Garden / Outdoor	Indoor & Outdoor	400	Gardens in Fort Raleigh National Historic Site, from a sunken garden for 50 to the Great Lawn for 400.	info@elizabethangardens.org	(252) 473-3234	https://www.elizabethangardens.org/wedding-event-locations/
108 Budleigh	Manteo	North Carolina			Historic / Estate	Indoor		Downtown Manteo ballroom a block from the waterfront, with vaulted ceilings and stained glass.	info@108Budleigh.com	(252) 305-7399	https://108budleigh.com
Currituck Beach Lighthouse	Corolla	North Carolina			Beach / Waterfront	Outdoor	150	Historic lighthouse grounds for ceremonies of up to 150; no receptions.		(252) 453-4939	https://obcinc.org/obx-wedding-venues/
The Sanderling Resort	Duck	North Carolina			Beach / Waterfront	Indoor & Outdoor		Oceanfront resort with private beaches, a lawn, a 2025 Sunset Ballroom and a loft in its historic lifesaving station.	info@thesanderling.com	855.412.7866	https://www.thesanderling.com/weddings/
`,
  },
  {
    name: "Richmond and the James River",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Maymont	Richmond	Virginia			Historic / Estate	Indoor & Outdoor		Victorian estate and public park with a mansion and gardens, rented for weddings.	info@maymont.org	804-525-9000	https://maymont.org/host-your-event/
Lewis Ginter Botanical Garden	Richmond	Virginia			Garden / Outdoor	Indoor & Outdoor		Botanical garden north of downtown with ceremony and reception sites, and semi-private elopements for under 25.		804.262.9887	https://www.lewisginter.org/visit/facility-rental/weddings/
Main Street Station	Richmond	Virginia			Historic / Estate	Indoor		Working downtown train station whose glass-walled Shed holds over 3,000, alongside the historic Headhouse.		804-646-3800	https://mainstreetstationrichmond.com
Mankin Mansion	Richmond	Virginia			Historic / Estate	Indoor & Outdoor		Brick mansion on the city's east side with a lawn ceremony site and patio.	info@mankinmansion.com	804-737-7773	https://www.mankinmansion.com/weddings
Hanover Tavern	Hanover	Virginia			Historic / Estate	Indoor & Outdoor	150	Historic tavern north of Richmond with wedding packages for up to 40, 100 or 150 and a patio with a fire pit.		(804) 537-5050	https://hanovertavern.org/weddings/
The Estate at River Run	Maidens	Virginia			Historic / Estate	Indoor & Outdoor		Georgian Revival mansion of 22,000 sq ft on 62 acres over the James River, reserved for one wedding at a time.	hello@theestateatriverrun.com	804.887.0171	https://www.theestateatriverrun.com/weddings
Berkeley Plantation	Charles City	Virginia			Historic / Estate	Indoor & Outdoor		James River plantation whose 18th-century mansion takes ceremonies and receptions for up to 50, with larger events on the grounds.	info@berkeleyplantation.com	(804) 829-6018	https://berkeleyplantation.com/weddings/
`,
  },
  {
    name: "Charlottesville, the Blue Ridge and the Shenandoah Valley",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Boar's Head Resort	Charlottesville	Virginia			Ballroom / Hotel	Indoor & Outdoor		University of Virginia resort on 600 acres with spaces for the wedding and the whole weekend.		(434) 296-2181	https://www.boarsheadresort.com/wedding
The Clifton	Charlottesville	Virginia			Historic / Estate	Indoor & Outdoor		Historic country inn outside Charlottesville offering wedding weekends.	reception@the-clifton.com		https://www.the-clifton.com/weddings
Pippin Hill Farm & Vineyards	North Garden	Virginia			Restaurant / Vineyard	Indoor & Outdoor	200	Vineyard with two ceremony lawns and The Granary for 200, plus a room for 70.		434-202-8063	https://www.pippinhillfarm.com/pippin-hill-weddings-events/
Veritas Vineyards & Winery	Afton	Virginia			Restaurant / Vineyard	Indoor & Outdoor		Blue Ridge winery hosting weddings, with an 1836 farmhouse for lodging and events of up to 50.	events@veritaswines.com	(540) 456-8000	https://veritaswines.com/weddings
King Family Vineyards	Crozet	Virginia			Restaurant / Vineyard	Indoor & Outdoor		Family winery west of Charlottesville with Blue Ridge views.		(434) 823-7800	https://kingfamilyvineyards.com/vineyard-wedding/
Montfair Resort Farm	Crozet	Virginia			Garden / Outdoor	Outdoor		Outdoor mountain venue on 129 acres with a spring-fed lake and cottage lodging for up to 54.	montfair@montfairresortfarm.com	(434) 823-5202	https://montfairresortfarm.com/weddings/
Oak Ridge Estate	Arrington	Virginia			Historic / Estate	Indoor & Outdoor		Circa-1802 estate on 4,800 acres of Blue Ridge farmland, with historic buildings and a one-mile horse track.	info@oakridgeestate.com	434-409-8592	https://www.oakridgeestate.com
Early Mountain Vineyards	Madison	Virginia			Restaurant / Vineyard	Indoor & Outdoor	200	Wine-country venue whose hall seats 200, with an outdoor ceremony arbor and mountain views.	cheers@earlymountain.com	540.948.9005	https://www.earlymountain.com/weddings
Wintergreen Resort	Wintergreen	Virginia			Ballroom / Hotel	Indoor & Outdoor		Mountain resort with ceremonies on the Blue Ridge Overlook and receptions in the Commonwealth Ballroom.		(434) 325-8139	https://www.wintergreenresort.com/weddings/
Hotel Madison	Harrisonburg	Virginia			Ballroom / Hotel	Indoor		Downtown hotel with the Shenandoah Ballroom and smaller rooms for cocktails and luncheons.	info@hotelmadison.com	(540) 564-0200	https://www.hotelmadison.com/weddings-shenandoah-valley
The Hotel Roanoke	Roanoke	Virginia			Ballroom / Hotel	Indoor & Outdoor		Tudor-style hotel of more than 140 years with garden ceremonies and ballroom receptions.		540-853-8264	https://www.hotelroanoke.com/virginia_weddings/
`,
  },
  {
    name: "Northern Virginia hunt and wine country",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Salamander Middleburg	Middleburg	Virginia			Ballroom / Hotel	Indoor & Outdoor	300	Resort with 168 rooms, a Grand Ballroom for 250, a terrace, a culinary garden and an equestrian centre.		540-326-4000	https://salamanderresort.com/gatherings/weddings/overview
Goodstone Inn	Middleburg	Virginia			Historic / Estate	Indoor & Outdoor		Country inn with cottages and suites and indoor and outdoor wedding sites.	chobbs@goodstone.com	540-687-3333	https://www.goodstone.com/wedding
Airlie	Warrenton	Virginia			Ballroom / Hotel	Indoor & Outdoor		Hotel and conference centre on 300 acres of countryside near Washington DC.	sales@airlie.com	(540) 347-1300	https://www.airlie.com/wedding-venues-in-warrenton-va
Stone Tower Winery	Leesburg	Virginia			Restaurant / Vineyard	Indoor & Outdoor		Hilltop winery with an indoor ceremony room, a chandeliered ballroom and a barrel room for cocktail hour.	info@stonetowerwinery.com	(703) 777-2797	https://www.stonetowerwinery.com/occasions/weddings/
Shadow Creek	Purcellville	Virginia			Barn / Rustic	Indoor & Outdoor	300	Equestrian barn on 200 acres in Loudoun wine and horse country, for up to 300.	info@weddingsatshadowcreek.com	540-454-8115	https://weddingsatshadowcreek.com
Breaux Vineyards	Purcellville	Virginia			Restaurant / Vineyard	Indoor & Outdoor	150	Winery up the Short Hill Mountain whose Grand Acadia Room seats 150, with a fireside room for 40.	events@breauxvineyards.com	540-668-6299	https://www.breauxvineyards.com/view/wedding/
Bluemont Vineyard	Bluemont	Virginia			Restaurant / Vineyard	Indoor & Outdoor	200	Mountainside winery whose Stable seats 200, with a stone cottage among the vines.	cheers@bluemontvineyard.com	540-554-8439	https://www.bluemontvineyard.com/celebrate-your-love
Rixey Manor	Rixeyville	Virginia			Historic / Estate	Indoor & Outdoor		1801 manor on 30 acres hosting one wedding a weekend, with a rooftop, ballroom and lodging for 14.	info@rixeymanor.com	(540) 212-4545	https://www.rixeymanor.com
Great Marsh Estate	Bealeton	Virginia			Historic / Estate	Indoor & Outdoor	200	Georgian manor and restored mid-1800s stables, booked exclusively for weddings of up to 200.	info@greatmarshestate.com	540.783.4584	https://www.greatmarshestate.com
Morais Vineyards & Winery	Bealeton	Virginia			Restaurant / Vineyard	Indoor & Outdoor		Fauquier County winery hosting weddings and events.	hello@moraisvineyards.com	540-326-6336	https://moraisvineyards.com
Chateau O'Brien	Markham	Virginia			Restaurant / Vineyard	Indoor & Outdoor	80	Hillside winery renting for four-hour weddings of up to 80; guests must be 21 or older.	howard@chateauobrien.com	540-364-6441	https://chateauobrien.com/weddings-2/
The Winery at Bull Run	Centreville	Virginia			Restaurant / Vineyard	Outdoor	200	Winery beside Manassas battlefield with a porch ceremony site and the Hillwoods Ruins for up to 200.			https://wineryatbullrun.com/weddings-fairfax-county-virginia/
`,
  },
  {
    name: "Williamsburg, Norfolk and the Chesapeake",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Kingsmill Resort	Williamsburg	Virginia			Ballroom / Hotel	Indoor & Outdoor	300	James River resort whose Grand Ballroom takes 300 and Burwell Ballroom 150.		757.253.8237	https://kingsmill.com/weddings/
The Williamsburg Winery	Williamsburg	Virginia			Restaurant / Vineyard	Indoor & Outdoor	200	Winery on 200 acres of vines and woods whose Wessex Hall seats 200, with the 28-room Wedmore Place hotel.	weddings@wmbgwine.com	(757) 884-2603	https://williamsburgwinery.com/weddings
Chrysler Museum of Art	Norfolk	Virginia			Historic / Estate	Indoor		Art museum downtown renting its galleries and Glass Studio for weddings.	events@chrysler.org	757-333-6299	https://chrysler.org/weddings-rentals/
Hermitage Museum & Gardens	Norfolk	Virginia			Garden / Outdoor	Indoor & Outdoor		Arts-and-crafts house museum with waterfront gardens on the Lafayette River.			https://thehermitagemuseum.org/venuerentals/weddings/
The Tides Inn	Irvington	Virginia			Beach / Waterfront	Indoor & Outdoor		Chesapeake Bay resort on the Northern Neck with wedding packages and waterfront venues.	sales@tidesinn.com	(804) 438-4416	https://tidesinn.com/irvington-va-hotel-event-venues/weddings/
`,
  },
  {
    name: "Orlando and Central Florida",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
The Alfond Inn	Winter Park	Florida			Ballroom / Hotel	Indoor & Outdoor		Boutique hotel off Park Avenue with garden ceremonies, a conservatory and the Park Avenue Ballroom.		(407) 645-6611	https://thealfondinn.com/meetings-events/weddings
Harry P. Leu Gardens	Orlando	Florida			Garden / Outdoor	Indoor & Outdoor		Botanical garden near downtown with wedding packages through approved caterers.		407.246.2620	https://www.leugardens.org/Events/Weddings
Maitland Art & History Museums	Maitland	Florida			Historic / Estate	Indoor & Outdoor		Museum campus centred on a 1930s artists' colony, rented for weddings.	events@artandhistory.org	407-539-2181	https://artandhistory.org/host-an-event/weddings/
Bok Tower Gardens	Lake Wales	Florida			Garden / Outdoor	Indoor & Outdoor		National Historic Landmark garden around the 1929 marble and coquina Singing Tower; receptions seat up to 80.		(863) 734-1225	https://boktowergardens.org/weddings/
Club Lake	Apopka	Florida			Garden / Outdoor	Outdoor	200	Outdoor venue north of Orlando for 50 to 200 guests, with ceremony and reception seating included.			https://clublakevenue.com/weddings-and-events/
Bella Collina	Montverde	Florida			Ballroom / Hotel	Indoor & Outdoor		Tuscan-style club and resort in the hills west of Orlando.		407-469-4001	https://www.bellacollina.com/weddings-events/events
The Howey Mansion	Howey-in-the-Hills	Florida			Historic / Estate	Indoor & Outdoor		Historic mansion in Lake County offering wedding tours.		407.906.4918	https://www.thehoweymansion.com/wedding-tours.html
`,
  },
  {
    name: "Tampa Bay, Sarasota and Southwest Florida",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Armature Works	Tampa	Florida			Historic / Estate	Indoor & Outdoor	550	Restored riverfront streetcar warehouse with three wedding venues, the largest for 150 to 550.	info@armatureworks.com		https://www.armatureworks.com/wedding-venues-tampa/
The Don CeSar	St. Pete Beach	Florida			Ballroom / Hotel	Indoor & Outdoor		The 1920s 'Pink Palace' beach hotel on the Gulf.	info@doncesar.com	(844) 338-1501	https://www.doncesar.com
The Birchwood	St. Petersburg	Florida			Ballroom / Hotel	Indoor		Boutique hotel in a 1924 building on Beach Drive with a fourth-floor Grand Ballroom.		727.896.1080	https://thebirchwood.com
The Ringling	Sarasota	Florida			Historic / Estate	Outdoor	400	Ringling estate on Sarasota Bay; Ca' d'Zan is an outdoor-only venue, and packages run up to 400 guests.			https://www.ringling.org/about-ringling/venue-rentals/weddings/
Marie Selby Botanical Gardens	Sarasota	Florida			Garden / Outdoor	Indoor & Outdoor		Forty-five acres of bayfront gardens downtown with indoor and outdoor event spaces.	info@selby.org	941.366.5731	https://selby.org
Edison and Ford Winter Estates	Fort Myers	Florida			Historic / Estate	Outdoor		The winter homes of Thomas Edison and Henry Ford, with ceremony packages on a palm-shaded lawn facing the sunset.		239-335-3689	https://www.edisonfordwinterestates.org/private-rentals/wedding-ceremonies/
Luminary Hotel & Co.	Fort Myers	Florida			Ballroom / Hotel	Indoor & Outdoor		Downtown riverfront hotel whose Caloosa Ballroom holds up to 2,300.		(833) 918-1512	https://www.luminaryhotel.com/gather/weddings-celebrations/
South Seas	Captiva Island	Florida			Beach / Waterfront	Indoor & Outdoor		Island resort at the north end of Captiva with beach wedding venues.	info@southseas.com		https://www.southseas.com/gather/weddings/
'Tween Waters Island Resort	Captiva	Florida			Beach / Waterfront	Indoor & Outdoor		Resort between the Gulf and Pine Island Sound with five wedding venues.		239-472-5161	https://tween-waters.com/wedding-venues/
`,
  },
  {
    name: "Miami, Palm Beach and the Keys",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Vizcaya Museum and Gardens	Miami	Florida			Historic / Estate	Indoor & Outdoor	300	Bayfront villa with exclusive use of its courtyard, terraces and gardens in the evening, for up to 300.	facility.rentals@vizcaya.org	305-856-8189	https://vizcaya.org/visit-2/wedding-events/
Deering Estate	Miami	Florida			Historic / Estate	Indoor & Outdoor		Historic estate on 450 acres along Biscayne Bay, run by Miami-Dade Parks.		305-235-1668	https://deeringestate.org/venue-rentals/miami-wedding-venues/
Villa Woodbine	Miami	Florida			Historic / Estate	Indoor & Outdoor		Old Miami mansion in Coconut Grove rented for weddings and events.		305-858-6660	https://www.villa-woodbine.com
Ancient Spanish Monastery	North Miami Beach	Florida			Historic / Estate	Indoor & Outdoor		Medieval Spanish cloister rebuilt in Florida, now an active church that hosts weddings.			https://www.spanishmonastery.com
The Biltmore Hotel	Coral Gables	Florida			Ballroom / Hotel	Indoor & Outdoor		1926 landmark hotel with garden, ballroom and open-air ceremony sites.		305 445 1926	https://biltmorehotel.com/coral-gables-event-venues/wedding/
Fairchild Tropical Botanic Garden	Coral Gables	Florida			Garden / Outdoor	Indoor & Outdoor	250	Tropical garden open since 1938, with sites from a courtyard for 60 to the Tropical Arboretum for 250.	weddings@fairchildgarden.org	877-723-3933	https://fairchildgarden.org/garden-wedding-miami/
Bonnet House	Fort Lauderdale	Florida			Historic / Estate	Indoor & Outdoor		Historic house on 35 acres between the ocean and the Intracoastal.		(954) 703-2608	https://www.bonnethouse.org/weddings/
Morikami Museum and Japanese Gardens	Delray Beach	Florida			Garden / Outdoor	Outdoor	150	Japanese gardens with five ceremony sites for up to 35 and a tented area for groups over 150.	morikami@pbc.gov	561-495-0233	https://morikami.org/weddings-ceremonies/
The Breakers	Palm Beach	Florida			Ballroom / Hotel	Indoor & Outdoor		Oceanfront Italian Renaissance-style resort hotel.	reservations@thebreakers.com		https://www.thebreakers.com/events/weddings-celebrations/
Casa Marina Key West	Key West	Florida			Beach / Waterfront	Indoor & Outdoor		1920 oceanfront hotel with the original Flagler Ballroom, a Grand Ballroom and an oceanfront lawn.	EYWCM_Key_West_Weddings@hilton.com	305.293.6217	https://casamarinaresort.com/weddings/
Hawks Cay Resort	Duck Key	Florida			Beach / Waterfront	Indoor & Outdoor		Middle Keys resort with a wedding team to coordinate venues, menus and guest rooms.		305-743-7000	https://www.hawkscay.com/weddings/
Cheeca Lodge & Spa	Islamorada	Florida			Beach / Waterfront	Indoor & Outdoor	750	Oceanfront resort with the Upper Keys' largest ballroom, for up to 750, and a smaller ballroom for 130.		(305) 664-4651	https://www.cheeca.com/weddings
`,
  },
  {
    name: "St. Augustine, North Florida and the Panhandle",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Lightner Museum	St. Augustine	Florida			Historic / Estate	Indoor	225	Museum in the former Hotel Alcazar with wedding packages for 40 to 225.	info@lightnerweddings.com	904-217-0077	https://weddings.lightnermuseum.org
The Treasury on the Plaza	St. Augustine	Florida			Historic / Estate	Indoor		Downtown venue on the Plaza, run by the same team as Lightner Museum weddings.	info@thetreasurycollection.com	904-217-0077	https://treasuryontheplaza.com
Villa Zorayda Museum	St. Augustine	Florida			Historic / Estate	Indoor	10	1883 Gilded Age home downtown, rented for elopements of up to 10.	info@villazorayda.com	904-829-9887	https://villazorayda.com/st-augustine-elopement-wedding-ceremony/
Ponte Vedra Inn & Club	Ponte Vedra Beach	Florida			Beach / Waterfront	Indoor & Outdoor		Oceanfront resort with beach weddings and over 300 rooms for guests.	innwedding@pvresorts.com	(904) 273-7700	https://www.pontevedra.com/weddings
Goodwood Museum & Gardens	Tallahassee	Florida			Historic / Estate	Indoor & Outdoor	200	Plantation house on 21 acres of oaks and heirloom gardens, with a Carriage House for receptions of 200.	jabixler@goodwoodmuseum.org	850-877-4202	https://www.goodwoodmuseum.org/weddings/
Hotel Duval	Tallahassee	Florida			Ballroom / Hotel	Indoor	250	Downtown hotel whose Horizon Grand Ballroom takes 250.	info@hotelduval.com	850-224-6000	https://www.hotelduval.com/wedding-venues-tallahasse
WaterColor Inn & Resort	Santa Rosa Beach	Florida			Beach / Waterfront	Indoor & Outdoor	200	30A resort with beach venues and a BoatHouse on Western Lake for up to 200.	WaterColorWedding@stjoe.com	(850) 534-5017	https://www.watercolorresort.com/groups/weddings
Rosemary Beach	Rosemary Beach	Florida			Beach / Waterfront	Indoor & Outdoor		30A beach town with wedding venues and help with preparations.		(866) 348-8952	https://rosemarybeach.com/weddings/
Hotel Effie	Miramar Beach	Florida			Ballroom / Hotel	Indoor & Outdoor		Hotel at Sandestin near Destin hosting beach and destination weddings.		850-351-3000	https://www.hoteleffie.com/weddings
Henderson Beach Resort	Destin	Florida			Beach / Waterfront	Indoor & Outdoor	175	Resort beside Henderson Beach State Park with a Grand Lawn for 175 and the Destin and Crystal ballrooms.	reservations@hendersonbeachresort.com	(855) 741-2777	https://www.hendersonbeachresort.com/gather/weddings/
`,
  },
  {
    name: "Louisville and Northern Kentucky",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
The Brown Hotel	Louisville	Kentucky			Ballroom / Hotel	Indoor		Downtown hotel that has hosted Louisville's events since 1923.	awilliams@brownhotel.com	888-888-5252	https://www.brownhotel.com/louisville-weddings
The Henry Clay	Louisville	Kentucky			Historic / Estate	Indoor		Historic downtown building with chandeliered ballrooms and other event spaces.		(502) 676-3032	https://thehenryclay.com
Conrad-Caldwell House Museum	Louisville	Kentucky			Historic / Estate	Indoor & Outdoor		1893 Arthur Loomis mansion in Old Louisville, known as Louisville's Castle.			https://www.conradcaldwell.org/weddings
Historic Locust Grove	Louisville	Kentucky			Historic / Estate	Indoor & Outdoor		Historic site minutes from downtown with indoor and outdoor spaces for ceremonies and receptions.	marketing@locustgrove.org	(502) 897-9845	https://locustgrove.org/rent/
The Olmsted	Louisville	Kentucky			Historic / Estate	Indoor & Outdoor		1920s building on the 80-acre campus of the former Masonic Widows and Orphans Home, for ceremonies and receptions.			https://www.theolmsted.com
Oxmoor Farm	Louisville	Kentucky			Historic / Estate	Indoor & Outdoor		Bullitt family farm dating from 1787, rented for private events.	events@oxmoorbourbon.com		https://oxmoorfarm.org/rental/
Hurstbourne Country Club	Louisville	Kentucky			Ballroom / Hotel	Indoor & Outdoor		East End country club hosting weddings and events.		502-420-1754	https://www.hurstbournecc.com/Events-Weddings
Angel's Envy Distillery	Louisville	Kentucky			Restaurant / Vineyard	Indoor		Downtown distillery with a private event space and buyouts for 10 to 400, popular for rehearsal dinners and welcome parties.			https://www.angelsenvy.com/us/en/host-your-event/
Yew Dell Botanical Gardens	Crestwood	Kentucky			Garden / Outdoor	Indoor & Outdoor		Botanical garden east of Louisville with wedding, ceremony and private event rentals.			https://yewdellgardens.org/weddings-private-events/
Hermitage Farm	Goshen	Kentucky			Barn / Rustic	Indoor & Outdoor		Working horse farm northeast of Louisville.	hermitagefarm@theindigoroad.com	502.398.9289	https://www.hermitagefarm.com/private-events/weddings/
Bernheim Forest and Arboretum	Clermont	Kentucky			Garden / Outdoor	Indoor & Outdoor		Arboretum and forest south of Louisville with a hilltop event centre and outdoor wedding sites.	rentals@bernheim.org		https://bernheim.org/visit/rentals/
Hotel Covington	Covington	Kentucky			Ballroom / Hotel	Indoor		Boutique hotel across the river from Cincinnati with its own wedding and events team.	guestservices@hotelcovington.com	859-905-6600	https://hotelcovington.com/weddingeventsteam/
Newport Syndicate	Newport	Kentucky			Ballroom / Hotel	Indoor		Event venue across from Cincinnati with reception rooms for weddings of all sizes.			https://www.newportsyndicate.com/weddings
`,
  },
  {
    name: "Lexington, the Bluegrass and Bowling Green",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
The Kentucky Castle	Versailles	Kentucky			Historic / Estate	Indoor & Outdoor		Castle hotel in horse country with a ballroom, greenhouse, rooftop and east terrace.		(859) 256-0322	https://www.thekentuckycastle.com/weddings
Ashland, the Henry Clay Estate	Lexington	Kentucky			Historic / Estate	Indoor & Outdoor		Henry Clay's estate, rented for private events and weddings.		(859) 266-8581	https://henryclay.org/events/private-events-weddings/
Spindletop Hall	Lexington	Kentucky			Historic / Estate	Indoor & Outdoor		University of Kentucky's historic mansion and club, with indoor and outdoor ceremony and reception spaces.		859.255.2777	https://www.spindletophall.org
The Campbell House	Lexington	Kentucky			Ballroom / Hotel	Indoor		Hotel whose Bluegrass Ballroom covers 3,600 sq ft, with buffet and plated packages.		859.255.4281	https://www.thecampbellhouse.com/weddings/
Talon Winery	Lexington	Kentucky			Restaurant / Vineyard	Indoor & Outdoor	250	Winery with an indoor-outdoor hall for 200 to 250 facing its pond and vineyard.		859-971-3214	https://www.talonwine.com/weddings/
Castle & Key Distillery	Frankfort	Kentucky			Historic / Estate	Indoor & Outdoor	300	Restored historic distillery with a sunken garden for ceremonies of 150 and indoor receptions for up to 300.		502.395.9070	https://castleandkey.com/pages/weddings
Shaker Village of Pleasant Hill	Harrodsburg	Kentucky			Historic / Estate	Indoor & Outdoor		Restored Shaker village on 3,000 acres, with a tobacco barn, the 1820 Meeting House and on-site lodging.			https://shakervillageky.org/weddings/
Warrenwood Manor	Danville	Kentucky			Historic / Estate	Indoor & Outdoor	50	Historic house with a small-wedding package for up to 50.			https://warrenwoodmanor.com/weddings
Elk Creek Vineyards	Owenton	Kentucky			Restaurant / Vineyard	Indoor & Outdoor		Winery between Louisville, Lexington and Cincinnati hosting weddings.	info@ecvwinery.com		https://www.elkcreekvineyards.com
Lost River Cave	Bowling Green	Kentucky			Garden / Outdoor	Indoor & Outdoor	300	Cave and nature park whose Cave Club, in one of the largest cave entrances in the US, holds 300.	rentals@lostrivercave.org	270.393.0077	https://www.lostrivercave.org/weddings-rentals/
`,
  },
  {
    name: "West Virginia",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
The Greenbrier	White Sulphur Springs	West Virginia			Ballroom / Hotel	Indoor & Outdoor		Historic mountain resort hotel.		(844) 837-2466	https://www.greenbrier.com/gather/weddings/
General Lewis Inn	Lewisburg	West Virginia			Historic / Estate	Indoor & Outdoor		Historic inn offering venues and catering for weddings.			https://www.generallewisinn.com/weddings-events
The Resort at Glade Springs	Daniels	West Virginia			Ballroom / Hotel	Indoor & Outdoor	300	Southern West Virginia resort with venues for up to 300 and on-site lodging and spa.		304-763-0892	https://www.gladesprings.com/weddings/
Oglebay	Wheeling	West Virginia			Garden / Outdoor	Indoor & Outdoor	150	Park resort with lodge, cabins and cottages, and an outdoor ceremony setting for 150.		304-243-4062	https://oglebay.com/groups/weddings/
Stonewall Resort	Roanoke	West Virginia			Beach / Waterfront	Indoor & Outdoor		Lakeside resort with a lodge, cottages and lake houses for guests.	hello@stonewallresort.com	304-269-7400	https://www.stonewallresort.com/weddings/
Adaland Mansion	Philippi	West Virginia			Historic / Estate	Indoor & Outdoor		Historic mansion with buffets served in the formal dining room and guests seated in an open-air pavilion.	adaland1@adaland.org	304-457-1587	https://adaland.org/plan-your-event/weddings/
Canaan Valley Resort	Davis	West Virginia			Ballroom / Hotel	Indoor & Outdoor		State park resort in the Allegheny highlands hosting groups and weddings.	group@canaanresort.com	304-866-4121	https://www.canaanresort.com/resort/groups-weddings
Lakeview Golf Resort	Morgantown	West Virginia			Ballroom / Hotel	Indoor & Outdoor		Golf resort with on-site rooms for wedding guests.		304-594-1111	https://www.lakeviewresort.com/weddings
Bavarian Inn	Shepherdstown	West Virginia			Ballroom / Hotel	Indoor & Outdoor		Inn above the Potomac with wedding packages.	booking@bavarianinnwv.com	304-876-2551	https://www.bavarianinnwv.com/weddings/
`,
  },
  {
    name: "Baltimore, Annapolis and the Eastern Shore",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
American Visionary Art Museum	Baltimore	Maryland			Historic / Estate	Indoor & Outdoor	400	Inner Harbor museum whose Jim Rouse Visionary Center seats 400 for dinner, with a sculpture barn and garden.	rentals@avam.org		https://www.avam.org/rentals/weddings/jim-rouse-visionary-center
The Maryland Zoo	Baltimore	Maryland			Garden / Outdoor	Indoor & Outdoor		Zoo in Druid Hill Park with historic settings and elopements or receptions by the penguin habitat.	rentals@marylandzoo.org	410-396-7102	https://www.marylandzoo.org/groups-and-parties/weddings/
Cylburn Arboretum	Baltimore	Maryland			Garden / Outdoor	Indoor & Outdoor		City arboretum with a historic mansion, rented through Baltimore City.	garden.events@baltimorecity.gov	410-396-4860	https://cylburn.org/rent/
Gramercy Mansion	Stevenson	Maryland			Historic / Estate	Indoor & Outdoor	150	Bed and breakfast with gardens and trails, an atrium seating 150 and a carriage house for 75.			https://www.gramercymansion.com/weddings-events
Elkridge Furnace Inn	Elkridge	Maryland			Historic / Estate	Indoor & Outdoor	250	1810 manor house of nine rooms with 1800s European mantels; tables and chairs for 250 included.			https://www.elkridgefurnaceinn.com/weddings
William Paca House & Garden	Annapolis	Maryland			Historic / Estate	Indoor & Outdoor		Colonial house and garden in the historic district, run by Historic Annapolis.	info@annapolis.org	410.267.7619	https://www.annapolis.org/support/venue-rental/
Historic London Town & Gardens	Edgewater	Maryland			Garden / Outdoor	Indoor & Outdoor		Anne Arundel's original county seat: 23 acres of gardens and historic buildings on the water.			https://historiclondontown.org/rentals/weddings/
Herrington on the Bay	North Beach	Maryland			Beach / Waterfront	Indoor & Outdoor		Chesapeake Bay venue with a lawn, the Chesapeake Ballroom and the Harbourview Ballroom for 60 to 100.	info@herringtononthebay.com	410-741-5101	https://www.herringtononthebay.com/weddings
Inn at Perry Cabin	St. Michaels	Maryland			Beach / Waterfront	Indoor & Outdoor		Waterfront inn on the Miles River.	Concierge@innatperrycabin.com	410.745.2200	https://www.innatperrycabin.com/weddings-events/
`,
  },
  {
    name: "Frederick and the Washington suburbs",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Catoctin Hall	Myersville	Maryland			Barn / Rustic	Indoor & Outdoor		Event venue and grounds in the Catoctin foothills west of Frederick.	events@musketridge.com		https://www.catoctinhall.com/venue
Linganore Winecellars	Mt. Airy	Maryland			Restaurant / Vineyard	Indoor & Outdoor		Family winery east of Frederick hosting weddings.	info@linganorewines.com	(301) 831-5889	https://www.linganorewines.com
Brookside Gardens	Wheaton	Maryland			Garden / Outdoor	Indoor & Outdoor		Public garden run by Montgomery Parks, one of its event centres for weddings.		(301) 495-2595	https://montgomeryparks.org/event-center/
`,
  },
  {
    name: "Washington, DC",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Anderson House	Washington	District of Columbia			Historic / Estate	Indoor	130	Society of the Cincinnati's mansion with a private ballroom and marble staircase, for up to 130.	events@societyofthecincinnati.org	202.785.2040	https://www.societyofthecincinnati.org/weddings/
The Mayflower Hotel	Washington	District of Columbia			Ballroom / Hotel	Indoor		Historic downtown hotel with a grand State Ballroom.		(202) 347-3000	https://www.themayflowerhotel.com/weddings/
The Hay-Adams	Washington	District of Columbia			Ballroom / Hotel	Indoor & Outdoor		Hotel across Lafayette Square from the White House, for rehearsal dinner through post-wedding brunch.	sales@hayadams.com	202.638.6600	https://www.hayadams.com/weddings/
Willard InterContinental	Washington	District of Columbia			Ballroom / Hotel	Indoor		Historic hotel on Pennsylvania Avenue with ceremonies, receptions, teas and brunches.		888 424 6835	https://washington.intercontinental.com/willard-weddings/
National Museum of Women in the Arts	Washington	District of Columbia			Historic / Estate	Indoor	200	1908 former Masonic Temple with a chandeliered ballroom and a performance hall for 200.	specialeventsinquiry@nmwa.org	202-783-5000	https://nmwa.org/host-event/
Arts Club of Washington	Washington	District of Columbia			Historic / Estate	Indoor & Outdoor	200	James Monroe's former home with parlors for 60, a gallery for 100 and a patio for 200.		202-331-7282	https://artsclubofwashington.org/weddings-and-receptions/
President Woodrow Wilson House	Washington	District of Columbia			Historic / Estate	Indoor & Outdoor		Wilson's Embassy Row home, rented for weddings and other occasions.			https://woodrowwilsonhouse.org
U.S. National Arboretum	Washington	District of Columbia			Garden / Outdoor	Indoor & Outdoor		Arboretum whose events are booked through the Friends of the National Arboretum.	info@fona.org	202-544-8733	https://www.fona.org/rentals/
The LINE DC	Washington	District of Columbia			Ballroom / Hotel	Indoor		Adams Morgan hotel whose ballroom holds over 500 or splits into three rooms.	info@thelinehotel.com	(202) 588-0525	https://www.thelinehotel.com/dc/weddings/
District Winery	Washington	District of Columbia			Restaurant / Vineyard	Indoor & Outdoor		Urban winery with a riverfront covered terrace and a ballroom.			https://www.districtwinery.com/weddings/
`,
  },
  {
    name: "Delaware",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Winterthur Museum, Garden & Library	Winterthur	Delaware			Garden / Outdoor	Indoor & Outdoor		Du Pont estate of nearly 1,000 acres with a 60-acre garden and indoor sites.		302-888-4681	https://www.winterthur.org/weddings-and-events/
Hagley Museum and Library	Wilmington	Delaware			Historic / Estate	Indoor & Outdoor	200	Original du Pont powder works with three event facilities, from 20 guests indoors to 200 outdoors.	askhagley@hagley.org	302-658-2400	https://www.hagley.org/weddings-hagley
Hotel Rodney	Lewes	Delaware			Ballroom / Hotel	Indoor		Boutique hotel in downtown Lewes that hosts weddings and receptions.	info@hotelrodneydelaware.com	(302) 645-6466	https://www.hotelrodneydelaware.com
`,
  },
  {
    name: "Philadelphia, the Main Line and Bucks County",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Morris Arboretum & Gardens	Philadelphia	Pennsylvania			Garden / Outdoor	Indoor & Outdoor	175	Ninety-two acres in Chestnut Hill with five ceremony sites; receptions for up to 175, or 155 with a dance floor.	rentals@morrisarboretum.org	215.247.5777	https://www.morrisarboretum.org/plan-event/weddings
The Barnes Foundation	Philadelphia	Pennsylvania			Historic / Estate	Indoor & Outdoor		Art museum on the Parkway with event spaces including a garden pavilion for receptions of 70.	info@barnesfoundation.org	215.278.7000	https://www.barnesfoundation.org/host-an-event
Pennsylvania Academy of the Fine Arts	Philadelphia	Pennsylvania			Historic / Estate	Indoor		Historic art academy and museum on North Broad Street, rented for weddings and events.	events@pafa.org	215-972-2049	https://www.pafa.org/about/event-rentals
The Franklin Institute	Philadelphia	Pennsylvania			Historic / Estate	Indoor		Science museum on the Parkway hosting weddings with Seravezza Catering.	guestservices@fi.edu	215.448.1200	https://fi.edu/en/plan-an-event
Awbury Arboretum	Philadelphia	Pennsylvania			Garden / Outdoor	Indoor & Outdoor		Germantown arboretum with a historic house and farm, rented through Peachtree Catering.	portico@peachtreecatering.com	215-849-2855	https://awbury.org/venue-rentals/
Front & Palmer	Philadelphia	Pennsylvania			Historic / Estate	Indoor		Fishtown event venue seating 220 for dinner and dancing, or 325 for cocktails.			https://frontandpalmer.com
Joseph Ambler Inn	North Wales	Pennsylvania			Historic / Estate	Indoor & Outdoor	200	Country inn with banquet rooms for 200, a farmhouse and overnight rooms for guests.		215-362-7500	https://josephamblerinn.com/weddings/
Normandy Farm	Blue Bell	Pennsylvania			Barn / Rustic	Indoor & Outdoor		Historic farm hotel with a grand ballroom, silos for dancing and on-site rooms.			https://www.normandyfarm.com/wedding-venue-blue-bell-pa
Inn at Barley Sheaf	Holicong	Pennsylvania			Historic / Estate	Indoor & Outdoor	300	Bucks County estate hosting one wedding at a time, with catering included, for up to 300.	Info@BarleySheaf.com	215.794.5104	https://www.barleysheaf.com/weddings/
Crossing Vineyards and Winery	Washington Crossing	Pennsylvania			Restaurant / Vineyard	Indoor & Outdoor	200	Bucks County winery with winery weddings for 25 to 75 and a tented vista for 75 to 200.			https://www.crossingvineyards.com/winery-weddings
`,
  },
  {
    name: "Lancaster, Hershey and Gettysburg",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Cork Factory Hotel	Lancaster	Pennsylvania			Ballroom / Hotel	Indoor		Hotel in a converted cork factory with adaptable event spaces.	info@corkfactoryhotel.com	717.735.2075	https://www.corkfactoryhotel.com/weddings
Excelsior	Lancaster	Pennsylvania			Historic / Estate	Indoor		Downtown venue with the Empire Room and Grande Salon, above catacombs where beer was brewed from 1852.	kelly@excelsiorlancaster.com		https://www.excelsiorlancaster.com/weddings
Historic Rock Ford	Lancaster	Pennsylvania			Historic / Estate	Indoor & Outdoor		National Register property on 33 wooded acres, rented for weddings.	info@historicrockford.org	717-392-7223	https://www.historicrockford.org/weddings-rentals-1
The Barn at Silverstone	Lancaster	Pennsylvania			Barn / Rustic	Indoor & Outdoor	200	Estate with a barn hall for up to 200, a bridal mansion and a courtyard.			https://www.thebarnatsilverstone.com
The Hotel Hershey	Hershey	Pennsylvania			Ballroom / Hotel	Indoor & Outdoor	250	1933 hotel with garden ceremonies, the Starlight Terrace Ballroom and receptions for up to 250.		717-534-8830	https://www.thehotelhershey.com/celebrations/weddings.php
Hotel Gettysburg	Gettysburg	Pennsylvania			Ballroom / Hotel	Indoor		Historic hotel on Lincoln Square.	info@hotelgettysburg.com	717-337-2000	https://hotelgettysburg.com/weddings/
`,
  },
  {
    name: "Pittsburgh, the Laurel Highlands and the Poconos",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Phipps Conservatory and Botanical Gardens	Pittsburgh	Pennsylvania			Garden / Outdoor	Indoor & Outdoor		Victorian glasshouse and gardens in Schenley Park.		412-622-6914	https://www.phipps.conservatory.org/plan-your-event/weddings/
Carnegie Museums of Pittsburgh	Pittsburgh	Pennsylvania			Historic / Estate	Indoor		Art and natural history museums in Oakland, plus receptions at the Andy Warhol Museum.	NSSpecialEventSales@carnegiemuseums.org	412-622-3131	https://carnegiemuseums.org/plan-your-event/weddings-at-the-museums/
Mansions on Fifth	Pittsburgh	Pennsylvania			Historic / Estate	Indoor & Outdoor		Historic Fifth Avenue estate hotel in Shadyside for ceremony and reception on site.	events@mansionsonfifth.com	412.381.5105	https://www.mansionsonfifth.com/weddings.php
The Priory Hotel	Pittsburgh	Pennsylvania			Ballroom / Hotel	Indoor & Outdoor	350	North Side hotel with the Grand Hall ballroom for 350 seated and a courtyard.	info@thepriory.com	(412) 231-3338	https://www.thepriory.com/special-events.php
The Barn at Fallingwater	Mill Run	Pennsylvania			Barn / Rustic	Indoor & Outdoor		Barn on the Fallingwater grounds in the Laurel Highlands, rented for weddings.		724-329-8501	https://fallingwater.org/visit/events/weddings/
Skytop Lodge	Skytop	Pennsylvania			Ballroom / Hotel	Indoor & Outdoor		Pocono mountain resort with the Evergreen Ballroom and wedding packages including a night at the lodge.		(570) 595-8939	https://www.skytop.com/group-events/weddings-venues/
The Pines at Woodloch	Hawley	Pennsylvania			Ballroom / Hotel	Indoor & Outdoor	45	Pocono resort hosting intimate weddings of 15 to 45 and elopements.		570.685.8000	https://www.woodloch.com/celebrate-weddings/
The Settlers Inn	Hawley	Pennsylvania			Historic / Estate	Indoor & Outdoor		Pocono inn with a garden for dining and dancing.			https://www.thesettlersinn.com/wedding-venues-poconos-pa
Stroudsmoor Country Inn	Stroudsburg	Pennsylvania			Ballroom / Hotel	Indoor & Outdoor		Pocono inn with several private event spaces, each with its own ceremony and reception sites.		(570) 421-6431	https://www.stroudsmoorweddings.com
`,
  },
  {
    name: "North Jersey and the Hudson waterfront",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Liberty House	Jersey City	New Jersey			Beach / Waterfront	Indoor & Outdoor	325	Liberty State Park venue facing the Statue of Liberty and the Manhattan skyline, with a ballroom for 325 and ceremony gardens.		201-761-0025	https://bylandmark.com/venues/liberty-house
Hudson House	Jersey City	New Jersey			Beach / Waterfront	Indoor & Outdoor	400	Waterfront venue in Port Liberté across the Hudson from Manhattan, with a rooftop space for after-parties.		201-761-0025	https://bylandmark.com/venues/hudson-house
Pleasantdale Chateau	West Orange	New Jersey	40.78576	-74.26506	Historic / Estate	Indoor & Outdoor		Chateau-style estate hosting indoor and outdoor weddings, known for its kitchen.	info@pleasantdale.com	(973) 731-5600	https://www.pleasantdale.com
The Estate at Florentine Gardens	River Vale	New Jersey	41.0142	-74.00677	Garden / Outdoor	Indoor & Outdoor		Bergen County estate that hosts one wedding at a time, with a grand ballroom, year-round gardens and in-house catering.		201-666-0444	https://www.florentinegardens.com
Perona Farms	Andover	New Jersey			Barn / Rustic	Indoor & Outdoor	275	Family-run since 1917 on a former dairy farm, with a 1930s barn and two other halls, the largest for 275.	info@peronafarms.com	973.729.6161	https://www.peronafarms.com
Crystal Springs Resort	Hamburg	New Jersey			Ballroom / Hotel	Indoor & Outdoor		Sussex County resort with garden and cliffside ceremony sites and ballrooms and pavilions across two hotels.		(855) 891-2117	https://www.crystalgolfresort.com
Rock Island Lake Club	Sparta	New Jersey	41.05228	-74.62791	Beach / Waterfront	Indoor & Outdoor		Lakeside venue hosting one wedding a day, with indoor or outdoor ceremonies, a cocktail deck and in-house catering.	info@rockislandlakeclub.com	973.512.3995	https://www.rockislandlakeclub.com
`,
  },
  {
    name: "Somerset Hills, Hunterdon and Princeton",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
The Bernards Inn	Bernardsville	New Jersey			Historic / Estate	Indoor		Boutique hotel in the Somerset Hills with over a century of history, hosting wedding receptions.		908.766.0002	https://www.bernardsinn.com
Stone House at Stirling Ridge	Warren	New Jersey	40.63459	-74.51904	Garden / Outdoor	Indoor & Outdoor		Stone-and-glass venue inspired by Frank Lloyd Wright, with a ballroom, a lodge and Watchung Mountain views; an on-site farm supplies the kitchen.		(908) 754-1222	https://bylandmark.com/our-venues/venue-showcase-stone-house/
The Ryland Inn	Whitehouse Station	New Jersey	40.58411	-74.76999	Historic / Estate	Indoor & Outdoor	240	Estate dating from 1796 with a ballroom for 240, a coach house for 200, gardens and on-site cottages.		201-761-0025	https://bylandmark.com/venues/ryland-inn
Farmhouse	Hampton	New Jersey			Barn / Rustic	Indoor & Outdoor	265	340-year-old estate with a ballroom for 265, The Silo for 170, and a barn reconstructed on site from Pennsylvania.		201-761-0025	https://bylandmark.com/venues/farmhouse
Olde Mill Inn	Basking Ridge	New Jersey			Ballroom / Hotel	Indoor		Inn offering ballroom weddings and smaller ones in its Grain House.		908-221-1100	https://www.oldemillinn.com
Fiddler's Elbow Country Club	Bedminster	New Jersey			Historic / Estate	Indoor & Outdoor		English manor clubhouse and grounds on land once given over to peach orchards.		(908) 439-2123	https://www.fiddlerselbow.com
Five Birds Farm	Ringoes	New Jersey			Barn / Rustic	Indoor & Outdoor	250	Family-run Hunterdon farm with a restored barn, cottages and flower fields, and a working train station guests can ride to from Flemington.	events@fivebirdsfarm.com	908-905-0042	https://www.fivebirdsfarm.com
Born to Run Farm	Glen Gardner	New Jersey			Garden / Outdoor	Outdoor		Family-owned outdoor wedding venue on a Hunterdon County farm.	Joseph@borntorunfarm.com	973-349-0129	https://www.borntorunfarm.com
Park Château Estate & Gardens	East Brunswick	New Jersey	40.42625	-74.41824	Historic / Estate	Indoor & Outdoor	400	French château-style venue on 15 acres, halfway between Manhattan and Philadelphia, with a ballroom, chapel and gardens.		732-238-4200	https://parkchateau.com
Morven Museum & Garden	Princeton	New Jersey			Historic / Estate			National Historic Landmark and New Jersey's first governor's mansion, rented for weddings.	info@morven.org	609-924-8144	https://www.morven.org
Nassau Inn	Princeton	New Jersey			Ballroom / Hotel	Indoor		Inn on Palmer Square, hosting weddings in its ballroom since 1937.		(609) 921-7500	https://www.nassauinn.com
The Ashford Estate	Allentown	New Jersey			Historic / Estate	Indoor & Outdoor		Thirty acres among preserved farmland with a barn chapel, carriage house, ballroom and a floating gazebo.		609-208-0404	https://weddingsofdistinctionnj.com/venues/the-ashford-estate/
`,
  },
  {
    name: "The Jersey Shore and Long Beach Island",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Windows on the Water	Sea Bright	New Jersey			Beach / Waterfront	Indoor & Outdoor		Oceanfront venue with ceremonies and cocktail hour on the beach and receptions in the ballroom.	mike@njwindowsonthewater.com	(732) 842-8463	https://www.windowsonthewater.com
Molly Pitcher Inn	Red Bank	New Jersey			Beach / Waterfront	Indoor & Outdoor		Inn with cocktails on a Navesink River promenade and a water-view ballroom.		(732) 747-2500	https://www.themollypitcher.com
Wave Resort	Long Branch	New Jersey			Ballroom / Hotel	Indoor & Outdoor		Oceanfront hotel whose High Crest event space has over 7,000 sq ft indoors and out.	sales@waveresort.com	(732) 612-9283	https://www.waveresort.com
The English Manor	Ocean	New Jersey	40.25441	-74.03194	Historic / Estate	Indoor & Outdoor		Manor that hosts one wedding at a time, with garden or ballroom ceremonies.	info@theenglishmanor.com	732-776-8558	https://theenglishmanor.com
The Berkeley Oceanfront Hotel	Asbury Park	New Jersey			Ballroom / Hotel	Indoor & Outdoor		Oceanfront hotel with ballrooms, the chandeliered Palm Court and a rooftop lookout.			https://www.berkeleyhotelnj.com
The Asbury	Asbury Park	New Jersey			Ballroom / Hotel	Indoor & Outdoor		Rock 'n' roll-themed hotel with a terrace and rooftop, and a bowling alley next door.		732-774-7100	https://www.theasburyhotel.com
The Mill Lakeside Manor	Spring Lake Heights	New Jersey			Beach / Waterfront	Indoor & Outdoor		Hosts one wedding at a time, with lakeside ceremonies outdoors or behind floor-to-ceiling windows, and a ballroom.		732-449-1800	https://themilllakesidemanor.com
The Shore Club	Spring Lake	New Jersey			Ballroom / Hotel	Indoor		Three event rooms and a 60-room hotel on site.		732-449-3666	https://www.theshoreclubnj.com
Clarks Landing Yacht Club	Point Pleasant	New Jersey			Beach / Waterfront	Indoor		Waterfront venue hosting one wedding at a time, with a glass-enclosed ceremony space and all-inclusive packages.		732-899-5559	https://clarkslandingweddings.com
Bonnet Island Estate	Manahawkin	New Jersey			Beach / Waterfront	Indoor & Outdoor		Private island estate on the way to Long Beach Island, with a boathouse chapel, ballroom and twelve guest suites.		(609) 494-9100	https://weddingsofdistinctionnj.com/venues/bonnet-island-estate/
Mallard Island Estate	Manahawkin	New Jersey			Beach / Waterfront	Indoor & Outdoor	250	Barnegat Bay estate surrounded by water, with a boathouse chapel, a ballroom for 250 and ten suites.		(609) 494-9100	https://weddingsofdistinctionnj.com/venues/mallard-island-estate/
The Mainland	Manahawkin	New Jersey			Ballroom / Hotel	Indoor & Outdoor		Event space at the Holiday Inn with a terrace room and grounds.	events@themainlandnj.com	609-481-6115	https://weddingsofdistinctionnj.com/venues/the-mainland/
Hotel LBI	Ship Bottom	New Jersey			Ballroom / Hotel	Indoor & Outdoor		Long Beach Island hotel styled on early-1900s grand hotels, with a rooftop bar.		609-467-8000	https://hotellbi.com
`,
  },
  {
    name: "Cape May and South Jersey",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Congress Hall	Cape May	New Jersey			Ballroom / Hotel	Indoor & Outdoor		America's first seaside resort, from 1816, with a grand ballroom and lawn.		(888) 944-1816	https://www.caperesorts.com/congress-hall
The Southern Mansion	Cape May	New Jersey			Historic / Estate	Indoor & Outdoor		Restored Victorian mansion from about 1860 with a ballroom and an acre and a half of gardens.	frontdesk@southernmansion.com	609-884-7171	https://www.southernmansion.com
Willow Creek Winery	Cape May	New Jersey			Restaurant / Vineyard	Indoor & Outdoor	350	Vineyard with garden settings, cottages for overnight guests and a life-size Alice in Wonderland chessboard.	info@willowcreekwinerycapemay.com	609.770.8782	https://www.willowcreekwinerycapemay.com
ICONA Avalon	Avalon	New Jersey			Beach / Waterfront	Indoor & Outdoor		Beachfront resort among the dunes, with beach ceremonies and a ballroom.			https://iconaweddings.com/venues/avalon
ICONA Diamond Beach	Diamond Beach	New Jersey			Beach / Waterfront	Indoor & Outdoor	300	Resort on a private beach with tented beach ceremonies and a third-floor ballroom for up to 300.			https://iconaweddings.com/venues/diamond-beach
The Reeds at Shelter Haven	Stone Harbor	New Jersey			Beach / Waterfront			Waterfront hotel in Stone Harbor hosting weddings.		609-368-0100	https://reedsatshelterhaven.com
Deauville Inn	Strathmere	New Jersey			Beach / Waterfront	Indoor & Outdoor		Waterfront inn with a dining room, a sunset deck and beach ceremony sites.		(609) 263-2080	https://www.deauvilleinn.com
The Mansion on Main Street	Voorhees	New Jersey	39.84857	-74.95284	Ballroom / Hotel	Indoor & Outdoor	350	Three ballrooms, an indoor ceremony pavilion and French gardens with waterfalls, 20 minutes from Philadelphia.	info@mansiononmainstreet.com	856-751-1717	https://www.mansiononmainstreet.com
The Merion	Cinnaminson	New Jersey	40.00016	-74.99163	Ballroom / Hotel	Indoor & Outdoor		South Jersey hall with four ballrooms and a garden for ceremonies, open for over 60 years.		(856) 829-2111	https://www.themerion.com
Valenzano Winery	Shamong	New Jersey	39.78489	-74.71726	Restaurant / Vineyard	Indoor & Outdoor		Winery with the Winemaker's Ballroom and an outdoor pavilion, catered by Summit Catering.		(609) 268-6731	https://www.valenzanowine.com
`,
  },
  {
    name: "Hudson Valley",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Mohonk Mountain House	New Paltz	New York			Historic / Estate	Indoor & Outdoor	130	Victorian resort on a glacial lake in the Shawangunks, with garden ceremonies and a Victorian parlour; weddings from 40 to 130 guests.		(845) 256-2053	https://www.mohonk.com/weddings
Hutton Brickyards	Kingston	New York			Beach / Waterfront	Indoor & Outdoor		Former brickyard on 100 Hudson riverfront acres that supplied the Empire State Building, with riverside ceremonies and on-site lodging.		(845) 514-4853	https://www.huttonbrickyards.com
Glenmere Mansion	Chester	New York			Historic / Estate	Indoor & Outdoor		Gilded Age estate hotel on 150 acres with 15 rooms and a barn in the meadow for larger receptions; the whole estate can be booked.	information@glenmeremansion.com	845.469.1900	https://www.glenmeremansion.com
Troutbeck	Amenia	New York			Historic / Estate	Indoor & Outdoor		250-acre estate hotel on the Webutuck River with river cottages for guests.		(845) 789-1555	https://www.troutbeck.com
Lyndhurst Mansion	Tarrytown	New York			Historic / Estate	Indoor & Outdoor		1838 Gothic Revival mansion and gardens above the Hudson.	lyndhurst@savingplaces.org	914-631-4481	https://www.lyndhurst.org
Beekman Arms & Delamater Inn	Rhinebeck	New York			Ballroom / Hotel	Indoor		Inn in continuous operation since 1766, with event rooms in the village of Rhinebeck.		(845) 876-7077	https://www.beekmandelamaterinn.com
Rokeby	Red Hook	New York			Historic / Estate	Outdoor		400-acre Hudson River estate built in 1815 and still owned by the family, with views of the Catskills.			https://www.eventsatrokeby.com
Wildflower Farms	Gardiner	New York			Garden / Outdoor	Indoor & Outdoor		140-acre resort with meadow and woodland ceremonies facing the Shawangunk Ridge.		855.472.3188	https://auberge.com/wildflower-farms/
`,
  },
  {
    name: "Long Island and the Hamptons",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
OHEKA Castle	Huntington	New York			Historic / Estate	Indoor & Outdoor		1919 mansion with a grand ballroom and formal gardens; its first bride married there that year.	reservations@oheka.com	631-659-1400	https://www.oheka.com
Old Westbury Gardens	Old Westbury	New York			Garden / Outdoor	Indoor & Outdoor		Early-1900s country estate with preserved gardens and period rooms, rented for private events.	info@oldwestburygardens.org	(516) 333-0048	https://www.oldwestburygardens.org
Planting Fields	Oyster Bay	New York			Garden / Outdoor	Indoor & Outdoor		109-acre historic estate with a main house and gardens.	info@plantingfields.org	(516) 922-9210	https://www.plantingfields.org
Wölffer Estate Vineyard	Sagaponack	New York			Restaurant / Vineyard	Indoor & Outdoor		55-acre Hamptons vineyard with indoor and outdoor event spaces.		631-537-5106	https://www.wolffer.com
East Wind Long Island	Wading River	New York			Ballroom / Hotel	Indoor & Outdoor		North Fork catering estate on 26 acres with several ballrooms and a vineyard setting.		631.929.6585	https://www.eastwindlongisland.com
The Vineyards at Aquebogue	Aquebogue	New York			Restaurant / Vineyard	Indoor & Outdoor		North Fork estate with a garden ceremony site, vine-covered patio and ballroom; exclusive use and no site fee.		631-722-3200	https://www.vineyardsataquebogue.com
Gurney's Montauk	Montauk	New York			Beach / Waterfront	Indoor & Outdoor		Oceanfront resort where every room faces the Atlantic.			https://www.gurneysresorts.com
Montauk Yacht Club	Montauk	New York			Beach / Waterfront	Indoor & Outdoor		Sixteen-acre marina resort on Star Island with a great lawn, ballroom and 106 rooms.		631.668.3100	https://www.montaukyachtclub.com
`,
  },
  {
    name: "Brooklyn",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Greenpoint Loft	Brooklyn	New York	40.72875	-73.95916	Historic / Estate	Indoor & Outdoor		Restored pre-war warehouse with a timber-beamed loft and a rooftop facing the Manhattan skyline.		1-718-310-3040	https://www.greenpointloft.com
26 Bridge	Brooklyn	New York	40.70389	-73.98469	Historic / Estate	Indoor	250	Former DUMBO metal factory with brick walls and skylights; 250 seated.		1-718-310-3040	https://www.26bridge.com
Wythe Hotel	Brooklyn	New York	40.72208	-73.95778	Ballroom / Hotel	Indoor & Outdoor		Williamsburg hotel in a 1901 factory, with industrial event spaces and rooftop access.	info@wythehotel.com	718-460-8000	https://www.wythehotel.com
Brooklyn Winery	Brooklyn	New York	40.71722	-73.95513	Restaurant / Vineyard	Indoor	300	Williamsburg urban winery hosting weddings of up to 300, with food and drink included.			https://www.bkwinery.com
Brooklyn Botanic Garden	Brooklyn	New York	40.66927	-73.9622	Garden / Outdoor	Indoor & Outdoor		Botanic garden offering weddings and ceremony-only packages.			https://www.bbg.org
`,
  },
  {
    name: "Finger Lakes, Adirondacks and Cooperstown",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Belhurst Castle	Geneva	New York			Historic / Estate	Indoor & Outdoor		Seneca Lake castle and two other hotels, with no venue fee.		(315) 781-0201	https://www.belhurst.com
Ventosa Vineyards	Geneva	New York			Restaurant / Vineyard	Indoor & Outdoor		Seneca Lake winery with a ceremony pavilion, ballroom and vineyard views.	info@ventosavineyards.com	(315) 719-0000	https://www.ventosavineyards.com
Glenora Wine Cellars	Dundee	New York			Restaurant / Vineyard	Indoor & Outdoor		The first winery on Seneca Lake, with vineyard ceremonies and guest rooms.		1-800-243-5513	https://www.glenora.com
Once Finger Lakes	Penn Yan	New York			Restaurant / Vineyard	Indoor & Outdoor	150	Seneca Lake tasting room with a lakeview deck, lawn and a tent for 150.	info@oncefingerlakes.com	(315) 694-7197	https://www.oncefingerlakes.com
Inns of Aurora	Aurora	New York			Historic / Estate	Indoor & Outdoor	200	Seven restored historic houses on 350 acres by Cayuga Lake, with a lakeside tent for 200.		315.364.8888	https://www.innsofaurora.com
The Sherwood Inn	Skaneateles	New York			Historic / Estate	Indoor & Outdoor		Inn from 1807 on Skaneateles Lake with indoor and outdoor event spaces.	jcarter@thesherwoodinn.com	315-685-3405	https://sherwoodinns.com
The Otesaga Resort Hotel	Cooperstown	New York			Ballroom / Hotel	Indoor & Outdoor		Historic resort on Otsego Lake with lakeside ceremony and reception spaces.	OtesagaHotel@Otesaga.com	(607) 544-2550	https://www.otesaga.com
The Sagamore	Bolton Landing	New York			Ballroom / Hotel	Indoor & Outdoor		Lake George island resort with over 140 years of history and lake and mountain views.		866.384.1944	https://www.opalcollection.com/sagamore/
Mirror Lake Inn	Lake Placid	New York			Ballroom / Hotel	Indoor & Outdoor		Four-diamond Adirondack inn on Mirror Lake.	info@mirrorlakeinn.com	(518) 523-2544	https://www.mirrorlakeinn.com
`,
  },
  {
    name: "Connecticut",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Saltwater Farm Vineyard	Stonington	Connecticut			Restaurant / Vineyard	Indoor & Outdoor		Vineyard on old coastal farmland and a WWII-era private airfield outside Stonington village.	jmaloney@saltwaterfarmvineyard.com	(860) 415-9072	https://www.saltwaterfarmvineyard.com
Jonathan Edwards Winery	North Stonington	Connecticut	41.46492	-71.87428	Restaurant / Vineyard	Indoor & Outdoor		Hilltop winery among 20 acres of vines and old stone walls, with a micro-wedding package for small guest lists.	tori@jedwardswinery.com	(860) 535-0202	https://jedwardswinery.com
Mystic Seaport Museum	Mystic	Connecticut			Beach / Waterfront	Indoor & Outdoor	200	Nineteen-acre maritime museum on the Mystic River; the waterfront Boat Shed at Siegel Point holds 200 and the Meeting House 120.	info@mysticseaport.org	860-572-0711	https://mysticseaport.org
Wadsworth Mansion at Long Hill	Middletown	Connecticut	41.54016	-72.67709	Historic / Estate	Indoor & Outdoor		Early-1900s country estate on 103 acres, with Beaux Arts ballrooms and a terrace looking out over the grounds.		860-347-1064	https://www.wadsworthmansion.com
The Inn at Longshore	Westport	Connecticut	41.1146	-73.3586	Beach / Waterfront	Indoor & Outdoor	300	Historic inn whose lawn runs down to Long Island Sound, seating 300, with fourteen guest rooms upstairs.	info@innatlongshore.com	203-226-3316	https://www.innatlongshore.com
Mayflower Inn & Spa	Washington	Connecticut	41.62758	-73.30823	Ballroom / Hotel	Indoor & Outdoor	150	Litchfield Hills inn on 58 acres with 35 rooms; receptions for up to 150 in the boxwood-hedged Shakespeare Garden.		(866) 217-0869	https://auberge.com/mayflower
Winvian Farm	Morris	Connecticut	41.69505	-73.20084	Historic / Estate	Indoor & Outdoor		A 113-acre Litchfield Hills resort with 18 cottages for guests, hosting full-size and petite weddings.	info@winvian.com	860-567-9600	https://www.winvian.com
Lord Thompson Manor	Thompson	Connecticut	41.96381	-71.86938	Historic / Estate	Indoor & Outdoor		1918 manor on 42 Olmsted-designed acres, booked by the weekend with all 13 rooms and every meal from rehearsal dinner to farewell brunch.	mail@lordthompsonmanor.com	(860) 923-3886	https://lordthompsonmanor.com
`,
  },
  {
    name: "Newport and Rhode Island",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Rosecliff	Newport	Rhode Island			Historic / Estate	Indoor & Outdoor	160	1902 Gilded Age mansion run by the Preservation Society, with Newport's largest private ballroom (160 for dinner and dancing) and oceanfront lawns.		401-847-1000	https://www.newportmansions.org
Castle Hill Inn	Newport	Rhode Island			Beach / Waterfront	Indoor & Outdoor		Forty acres at the mouth of Narragansett Bay with half a mile of coastline, garden ceremonies, a sailcloth-tent reception and 33 rooms.		(401) 849-3800	https://www.castlehillinn.com
Belle Mer	Newport	Rhode Island			Beach / Waterfront	Indoor & Outdoor	500	Seven acres of lawn on Narragansett Bay seating 500 for dinner and dancing, with the smaller Water Salon for intimate ceremonies.			https://longwoodvenues.com/venues/newport-oceanfront-event-venue/
Newport Vineyards	Middletown	Rhode Island	41.52949	-71.27327	Restaurant / Vineyard	Indoor & Outdoor		Fifty-acre vineyard minutes from downtown Newport, with meadow ceremonies among the vines and an awninged terrace if it rains.		401-848-5161	https://newportvineyards.com
Glen Manor House	Portsmouth	Rhode Island	41.55925	-71.23965	Historic / Estate	Indoor & Outdoor		1920s manor house built for the Taylor family's Glen Farm estate, with a ballroom and grounds for ceremonies.	glenmanor@morins.com	(401) 683-4177	https://glenmanorhouse.com
Blithewold	Bristol	Rhode Island	41.6545	-71.2649	Garden / Outdoor	Indoor & Outdoor		Bayside garden estate: ceremonies in the North Garden, cocktails in the mansion and dinner in a 40' x 100' tent on the ten-acre Great Lawn.		(401) 253-2707	https://www.blithewold.org
Linden Place	Bristol	Rhode Island	41.67067	-71.27658	Historic / Estate	Indoor & Outdoor		Historic mansion with a grand ballroom and a sculpture-filled rose garden for outdoor ceremonies.	info@lindenplace.org	(401) 253-0390	https://www.lindenplace.org
Ocean House	Westerly	Rhode Island			Ballroom / Hotel	Indoor & Outdoor		Forbes Five-Star resort above the Atlantic in Watch Hill, with 49 rooms and weekend-long weddings.		401-584-7000	https://www.oceanhouseri.com
`,
  },
  {
    name: "Boston, the North Shore, Worcester County and the Berkshires",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Boston Harbor Hotel	Boston	Massachusetts			Ballroom / Hotel	Indoor	250	Hotel on Rowes Wharf whose ballroom, with 19-foot ceilings and harbor windows on three sides, holds 250.		617-439-7000	https://www.bostonharborhotel.com
The Great House on the Crane Estate	Ipswich	Massachusetts			Historic / Estate	Indoor & Outdoor		1920s Stuart-style mansion at Castle Hill, with ceremonies on the Grand Allée above Crane Beach and dinner in a sailcloth tent on the terrace.	castlehill@thetrustees.org	978-356-4351	https://thetrustees.org/content/great-house-castle-hill-venue-rental/
Long Hill	Beverly	Massachusetts			Garden / Outdoor	Indoor & Outdoor		1920s brick house built by the Sedgwick family, set in a public garden laid out as a series of garden rooms.		617-542-7696	https://thetrustees.org/content/long-hill-venue-rental/
deCordova Sculpture Park and Museum	Lincoln	Massachusetts	42.42837	-71.31245	Garden / Outdoor	Indoor & Outdoor		Sculpture park above Flint's Pond: ceremonies on the Sculpture Terrace, cocktails in Dewey Family Hall and dinner in a sailcloth tent.		617-542-7696	https://thetrustees.org/content/decordova-venue-rental/
Willowdale Estate	Topsfield	Massachusetts			Historic / Estate	Indoor & Outdoor		Early-1900s Craftsman and Tudor Revival stone mansion in a 720-acre state forest on the Ipswich River, with in-house catering.	info@willowdaleestate.com	978-887-8211	https://www.willowdaleestate.com
The Barn at Gibbet Hill	Groton	Massachusetts			Barn / Rustic	Indoor & Outdoor	240	Renovated barn at the foot of Gibbet Hill, just off Groton's Main Street, holding up to 240 with a dance floor.	barn@gibbethill.com	(978) 448-3233	https://www.barnatgibbethill.com
New England Botanic Garden at Tower Hill	Boylston	Massachusetts	42.35673	-71.72968	Garden / Outdoor	Indoor & Outdoor		Botanic garden with ceremonies in the Secret Garden or Limonaia and in-season receptions in the glass Orangerie; elopements for up to 30.	info@nebg.org	508-869-6111	https://nebg.org
The Red Lion Inn	Stockbridge	Massachusetts	42.28238	-73.31273	Historic / Estate	Indoor & Outdoor		Historic village inn with antique-filled private rooms, a flower-filled courtyard and a florist on the main floor.	info@redlioninn.com	(413) 298-5545	https://www.redlioninn.com
Hancock Shaker Village	Pittsfield	Massachusetts			Barn / Rustic	Indoor & Outdoor	270	Twenty Shaker buildings on 750 acres, with an event tent for 270, heirloom gardens for ceremonies and a timber-frame hall for 75.	kjacobson@hancockshakervillage.org	413-443-0188	https://hancockshakervillage.org
`,
  },
  {
    name: "Cape Cod and the Islands",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Chatham Bars Inn	Chatham	Massachusetts			Beach / Waterfront	Indoor & Outdoor		Oceanfront resort with over 200 rooms, ceremonies on its private beach and receptions under a sailcloth tent.	welcome@chathambarsinn.com	508-945-0096	https://www.chathambarsinn.com
Wequassett Resort and Golf Club	Harwich	Massachusetts	41.72046	-69.99924	Beach / Waterfront	Indoor & Outdoor		Resort on Pleasant Bay with waterfront ceremonies, garden receptions and cottages for the whole wedding weekend.	info@wequassett.com	(508) 432-5400	https://wequassett.com
Wychmere Beach Club	Harwich Port	Massachusetts			Beach / Waterfront	Indoor & Outdoor		Beach club between Wychmere Harbor and Nantucket Sound, with the indoor-outdoor Dune and the Ocean Room.		(508) 432-1000	https://wychmere.com
Ocean Edge Resort & Golf Club	Brewster	Massachusetts			Ballroom / Hotel	Indoor & Outdoor		Resort with a century-old mansion, a grand ballroom and ceremonies on the beach, the lawn or by the pool.		508-896-9000	https://www.oceanedgeweddings.com
Harbor View Hotel	Edgartown	Massachusetts			Ballroom / Hotel	Indoor & Outdoor		Martha's Vineyard hotel from 1891 overlooking Edgartown Harbor, with receptions on the Great Lawn and in the Edgartown Ballroom.		508-431-8495	https://harborviewhotel.com
White Elephant	Nantucket	Massachusetts			Beach / Waterfront	Indoor & Outdoor	300	Hotel on Nantucket Harbor with ceremonies on the Harborview Lawn; the whole property can be booked for weddings up to 300.	inquiries@whiteelephantnantucket.com	800-445-6574	https://www.whiteelephantnantucket.com
`,
  },
  {
    name: "Vermont",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Woodstock Inn & Resort	Woodstock	Vermont			Ballroom / Hotel	Indoor & Outdoor	225	Village resort shaped by Laurance Rockefeller, with ceremony and reception spaces for 2 to 225 guests.		800-448-7900	https://www.woodstockinn.com
Trapp Family Lodge	Stowe	Vermont			Ballroom / Hotel	Indoor & Outdoor	250	Resort on 2,600 acres above Stowe with a lawn ceremony site, a seasonal tent for 100-250 and the fireplace Mozart Room for about 80 in winter.		800-826-7000	https://www.vontrappresort.com
Hildene	Manchester	Vermont			Historic / Estate	Indoor & Outdoor		The Lincoln family's 412-acre estate, with a Georgian Revival mansion, a sprawling lawn and a formal garden from 1908.	celebrations@hildene.org	(802) 227-7443	https://hildene.org
Basin Harbor	Vergennes	Vermont			Beach / Waterfront	Indoor & Outdoor	300	Lake Champlain resort with tented weddings for 300 or more on the waterfront or airstrip, and inn rooms, cottages and houses for guests.	stay@basinharbor.com	802-475-2311	https://www.basinharbor.com
Riverside Farm	Pittsfield	Vermont	43.77248	-72.81315	Barn / Rustic	Indoor & Outdoor	500	Three restored barns with cottages, cabins and stables on more than 700 acres, hosting up to 500.	events@riversidefarm.com	802-746-8822	https://riversidefarmweddings.com
The Essex Resort & Spa	Essex	Vermont	44.50705	-73.07891	Ballroom / Hotel	Indoor & Outdoor	240	Resort outside Burlington with indoor rooms and outdoor spaces for elopements up to weekend-long weddings; the largest room seats about 240.		802-878-1100	https://www.essexresort.com
Sugarbush Resort	Warren	Vermont	44.14508	-72.87839	Ballroom / Hotel	Indoor & Outdoor		Mad River Valley ski resort with mountaintop ceremonies, reception venues and its own lodging for guests.			https://www.sugarbush.com/weddings/home
Jay Peak Resort	Jay	Vermont	44.93275	-72.49381	Barn / Rustic	Indoor & Outdoor	250	Mountain resort near the Canadian border with a post-and-beam Clubhouse Barn seating 180, a pond arbor and a summit reached by tram; receptions for 50 to 250.	weddings@jaypeakresort.com	802-327-2181	https://jaypeakresort.com
`,
  },
  {
    name: "New Hampshire",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Mountain View Grand	Whitefield	New Hampshire			Ballroom / Hotel	Indoor & Outdoor		White Mountains resort dating from 1865 on 1,700 acres, with the domed Crystal Ballroom and a Presidential Ballroom.	info@mountainviewgrand.com	603-837-0032	https://www.mountainviewgrand.com
Wentworth by the Sea	New Castle	New Hampshire	43.06335	-70.7266	Ballroom / Hotel	Indoor & Outdoor		Grand seaside hotel outside Portsmouth, with garden ceremonies, two ballrooms and poolside lobster bakes for the wedding weekend.		603-422-7322	https://www.opalcollection.com/wentworth/
Castle in the Clouds	Moultonborough	New Hampshire	43.7172	-71.31365	Historic / Estate	Indoor & Outdoor		1914 Arts and Crafts mansion high above Lake Winnipesaukee, with a Carriage House terrace and room for a tented reception.		(603) 476-5900	https://www.castleintheclouds.org
Pickering House Inn	Wolfeboro	New Hampshire			Barn / Rustic	Indoor & Outdoor		Ten-room inn in downtown Wolfeboro with a restored 1800s barn and patios, a stroll from the Winnipesaukee waterfront.	stay@pickeringhousewolfeboro.com	603-569-6948	https://www.pickeringhousewolfeboro.com
Mill Falls at the Lake	Meredith	New Hampshire			Beach / Waterfront	Indoor & Outdoor		Lakeside resort with the Church Landing waterfront on Meredith Bay, the Winnipesaukee Ballroom and a rooftop terrace at Chase House.		844-745-2931	https://www.millfalls.com
Flag Hill Distillery & Winery	Lee	New Hampshire	43.08328	-71.02789	Restaurant / Vineyard	Indoor & Outdoor	300	Vineyard and distillery with vine-side ceremonies, a tent for up to 300, a post-and-beam barn for cooler months and in-house catering.	events@flaghill.com	(603) 659-2949	https://www.flaghill.com
`,
  },
  {
    name: "Maine",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Black Point Inn	Scarborough	Maine	43.53429	-70.31686	Beach / Waterfront	Indoor & Outdoor	70	Inn on Prouts Neck with ocean on three sides; ceremonies on the West Lawn and Point weddings for 40-70 guests.	events@blackpointinn.com	(207) 883-2500	https://www.blackpointinn.com
Inn by the Sea	Cape Elizabeth	Maine	43.56775	-70.22798	Beach / Waterfront	Indoor & Outdoor	175	Inn a boardwalk away from Crescent Beach, with a lawn and gardens and a sailcloth tent seating 175.		207-799-3134	https://innbythesea.com
Harraseeket Inn	Freeport	Maine			Ballroom / Hotel	Indoor	175	Freeport inn with courtyard ceremonies, the Casco Bay Ballroom for up to 175 and 94 rooms for guests.			https://www.harraseeketinn.com
Cliff House Maine	Cape Neddick	Maine			Beach / Waterfront	Indoor & Outdoor		Clifftop resort between Ogunquit and York with the North Point Lawn for ceremonies and an oceanview Atlantic Ballroom.		855-210-6901	https://www.cliffhousemaine.com
Hidden Pond	Kennebunkport	Maine			Barn / Rustic	Indoor & Outdoor		Birch-forest resort with a ceremony garden, an Event Barn with a wall of windows and full buyouts of its 56 rooms.	info@hiddenpondmaine.com	888-967-9050	https://www.hiddenpondmaine.com
`,
  },
  {
    name: "Manhattan, the Bronx and Westchester",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Lotte New York Palace	New York	New York			Ballroom / Hotel	Indoor & Outdoor		Midtown hotel in the landmark Villard Mansion, with the chandeliered Villard Ballroom, the Madison Avenue Courtyard and suites for weddings up to 50.	balongi@lottenypalace.com	212-888-7000	https://www.LNYPweddings.com
Tavern on the Green	New York	New York			Restaurant / Vineyard	Indoor & Outdoor		Landmark restaurant inside Central Park at West 67th Street, hosting ceremonies and receptions.	events@tavernonthegreen.com	212-877-8684	https://www.tavernonthegreen.com
The Skylark	New York	New York			Restaurant / Vineyard	Indoor & Outdoor	150	Midtown rooftop lounge seating 80 for a ceremony and dinner, or up to 150 for a cocktail-style reception.	info@theskylarknyc.com	212-257-4577	https://www.theskylarknyc.com
Wave Hill	Bronx	New York	40.89788	-73.91127	Garden / Outdoor	Indoor & Outdoor	180	Public garden above the Hudson with evening ceremonies at the Pergola, a tented terrace at Wave Hill House and seating for 180 in the Mark Twain Room.	abigail.parsons@wavehill.org	718-549-3200	https://www.wavehill.org
Mansion on Broadway	White Plains	New York			Historic / Estate	Indoor		Historic mansion with a grand foyer staircase, hosting one event at a time with its own in-house catering.	events@mansiononbroadway.com	914-949-6900	https://mansiononbroadway.com
`,
  },
  {
    name: "Chicago and the western suburbs",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Galleria Marchetti	Chicago	Illinois			Garden / Outdoor	Indoor & Outdoor	375	Italian-inspired venue with a courtyard, a tented Pavilion ballroom seating 375 and the glass-roofed La Pergola for 150.	info@galleriamarchetti.com	312-563-0495	https://www.galleriamarchetti.com
Morgan's on Fulton	Chicago	Illinois			Restaurant / Vineyard	Indoor & Outdoor	200	All-inclusive West Loop venue with in-house catering, its own furniture and a four-season rooftop terrace; up to 200, or 150 seated.	events@morgansonfulton.com		https://www.morgansonfulton.com
Salvage One	Chicago	Illinois			Barn / Rustic	Indoor & Outdoor	250	Architectural salvage warehouse with a wisteria courtyard for 200-250 and an indoor ceremony space of church pews and chandeliers.	events@salvageone.com	312-733-0098	https://salvageone.com
Cantigny Park	Wheaton	Illinois			Garden / Outdoor	Indoor & Outdoor		The McCormick estate's gardens and water features, with receptions at Le Jardin, Tribune Hall or Woodside Pavilion.	weddings@cantigny.org	630-260-8145	https://cantigny.org
`,
  },
  {
    name: "Michigan and Wisconsin",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Grand Hotel	Mackinac Island	Michigan			Ballroom / Hotel	Indoor & Outdoor		Island hotel reached by ferry and horse-drawn carriage, with vows exchanged on what it bills as the world's longest porch.	reservations@grandhotel.com	906-847-3331	https://www.grandhotel.com
Black Star Farms	Suttons Bay	Michigan			Restaurant / Vineyard	Indoor & Outdoor	175	Leelanau winery estate with an inn, trails and an equestrian centre; seats 175 indoors, more with a tent.	events@blackstarfarms.com	231-944-1258	https://blackstarfarms.com
Castle Farms	Charlevoix	Michigan			Historic / Estate	Indoor & Outdoor	300	Stone castle with courtyard ceremonies and the chandeliered King's Great Hall over the gardens and Reflection Pond; up to 300.	info@castlefarms.com	(231) 237-0884	https://castlefarms.com
The Pfister Hotel	Milwaukee	Wisconsin			Ballroom / Hotel	Indoor		Historic downtown hotel with newly renovated ballrooms for weddings large and small.		(414) 273-8222	https://www.thepfisterhotel.com
Hotel Metro	Milwaukee	Wisconsin			Ballroom / Hotel	Indoor	75	Boutique hotel with a ballroom and attached atrium for ceremonies and receptions up to 75.	info@hotelmetro.com	414-272-1937	https://www.hotelmetro.com
Lake Lawn Resort	Delavan	Wisconsin			Beach / Waterfront	Indoor & Outdoor		Lakefront resort dating from 1878 near Lake Geneva, with two lakeside ceremony sites and beamed indoor rooms.	contact@lakelawnresort.com	262-728-7950	https://www.lakelawnresort.com
`,
  },
  {
    name: "Minnesota and Ohio",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Semple Mansion	Minneapolis	Minnesota			Historic / Estate	Indoor		Turn-of-the-century mansion in the Whittier neighborhood, home to a third-floor ballroom billed as the state's largest original residential one.	katherine@semplemansion.com	612-290-4448	https://www.semplemansion.com
Nicollet Island Pavilion	Minneapolis	Minnesota			Historic / Estate	Indoor & Outdoor	525	Restored 1893 boiler-works hall with exposed brick, riverfront views of the bridges and skyline, and an adjoining tent.		(612) 253-0255	https://www.mintahoe.com/venues/nicollet-island-pavilion/
Landmark Center	Saint Paul	Minnesota			Historic / Estate	Indoor		Historic downtown Saint Paul federal courthouse building whose glass-roofed Musser Cortile atrium hosts receptions.	hilari@landmarkcenter.org	651-292-3293	https://www.landmarkcenter.org
Water Street Inn	Stillwater	Minnesota			Ballroom / Hotel	Indoor & Outdoor		Victorian-era riverfront hotel with on-site catering and all-inclusive wedding and micro-wedding packages.	Info@waterstreetinn.us	651-439-6000	https://waterstreetinn.us
Glensheen	Duluth	Minnesota			Historic / Estate	Indoor & Outdoor	60	Lakeside historic mansion estate on Lake Superior that now focuses on intimate weddings.		(218) 726-8932	https://glensheen.d.umn.edu
Bluefin Bay Family of Resorts	Tofte	Minnesota			Beach / Waterfront	Indoor & Outdoor	75	North Shore resort offering a lakeside ballroom and beach patio for small weddings on Lake Superior.	info@bluefinbay.com	218-663-7296	https://www.bluefinbay.com
Cleveland Botanical Garden	Cleveland	Ohio			Garden / Outdoor	Indoor & Outdoor	220	Formal gardens and glasshouse in University Circle with Japanese and Sunken Garden ceremony sites and only one wedding hosted at a time.	hscotese@holdenfg.org	216.707.2846	https://holdenfg.org/cleveland-botanical-garden
Cleveland History Center	Cleveland	Ohio			Historic / Estate	Indoor & Outdoor		Seven-acre University Circle campus with a courtyard garden, gallery banquet space and a vintage-car rotunda.		(216) 721-5722	https://www.wrhs.org/plan-visit/places-to-visit/cleveland-history-center
Franklin Park Conservatory and Botanical Gardens	Columbus	Ohio			Garden / Outdoor	Indoor & Outdoor		Columbus botanical garden with a glass Palm House, the Veridian hall and celebration garden, and the Wells Barn.		614-715-8100	https://www.fpconservatory.org
Columbus Museum of Art	Columbus	Ohio			Historic / Estate	Indoor & Outdoor	200	Downtown art museum offering a pavilion, ceremony court and sculpture garden with a dedicated event manager.		614.715.8532	https://www.columbusmuseum.org
Monastery Event Center	Cincinnati	Ohio			Historic / Estate	Indoor & Outdoor		Restored 1873 chapel and monastery in Mt. Adams with a guest house, used for weddings and corporate events.			https://monasteryeventcenter.com
Rhinegeist Brewery	Cincinnati	Ohio			Restaurant / Vineyard	Indoor & Outdoor	250	Over-the-Rhine brewery with a clubhouse, taproom and rooftop, plus a dedicated coordinator for each event.		513-381-1367	https://www.rhinegeist.com
`,
  },
  {
    name: "Missouri and Indiana",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
The Barnett on Washington	St. Louis	Missouri			Historic / Estate	Indoor & Outdoor	180	Restored 1921 Mission-style building in the Grand Center arts district, listed on the National Register of Historic Places, with on-site catering.		(314) 252-0702	https://barnettonwashington.com
612North	St. Louis	Missouri			Historic / Estate	Indoor		Event venue with three spaces (VUE, ARC and KOR) in the 1882 Cutlery Building in Laclede's Landing, with in-house catering.	events@612north.com		https://www.612north.com
Lemp Mansion	St. Louis	Missouri			Historic / Estate	Indoor		Historic Lemp family brewery-baron mansion in south St. Louis that also runs as a restaurant and inn, with wedding and banquet facilities.		314-664-8024	https://www.lempmansion.com
Piper Palm House	St. Louis	Missouri			Garden / Outdoor	Indoor & Outdoor		Historic greenhouse conservatory in Tower Grove Park that hosts weddings and private events.	info@towergrovepark.org	(314) 771-2679	https://www.towergrovepark.org
Weston Red Barn Farm	Weston	Missouri			Barn / Rustic	Indoor & Outdoor		Working 19th-century farmstead north of Kansas City with two wedding barns, the Red Barn and the Timber Barn, and more than 20 years of weddings.	info@westonredbarnfarm.com	(816) 386-5437	https://www.westonredbarnfarm.com
Union Station Kansas City	Kansas City	Missouri			Historic / Estate	Indoor & Outdoor		Historic downtown station with a Grand Hall, Grand Plaza and several other rental spaces for weddings.		(816) 460-2000	https://www.unionstation.org
Tinker House Events	Indianapolis	Indiana			Historic / Estate	Indoor		1915 landmark building on the Monon Trail with an industrial-loft look of exposed brick and timber beams.			https://www.tinkerhouseevents.com
Historic Saint Joseph Hall	Indianapolis	Indiana			Historic / Estate	Indoor & Outdoor		Event center run by North Street Events on East North Street, with flexible indoor and outdoor spaces for weddings and parties.	Will@northstevents.com	463-206-2127	http://www.northstevents.com
Black Iris Estate	Carmel	Indiana			Historic / Estate	Indoor & Outdoor		Thirteen-acre estate near Indianapolis with a Southern-style mansion, gardens and the Willow Chapel, with catering by Thomas Caterers.		463-223-4556	https://www.blackirisestate.com
Ritz Charles	Carmel	Indiana			Ballroom / Hotel	Indoor & Outdoor		Event company operating since 1985 with a chapel, ballrooms and a garden pavilion for weddings.		(317) 846-9158	https://www.ritzcharles.com
Embassy Theatre	Fort Wayne	Indiana			Historic / Estate	Indoor		Downtown Fort Wayne theatre that rents its spaces for weddings and social events.	info@fwembassytheatre.org	260.424.6287	https://fwembassytheatre.org
The Inn at Irwin Gardens	Columbus	Indiana			Historic / Estate	Indoor & Outdoor		Historic bed-and-breakfast on Fifth Street that rents out its grounds and rooms for weddings and private events.		812-376-3663	https://www.irwingardens.com
The Barn at Mount Liberty	Nashville	Indiana			Barn / Rustic	Indoor & Outdoor		Restored, temperature-controlled barn on 110 acres in Brown County, with a historic cabin and a stables space.	info@mountlibertyfarms.com	(812) 994-0034	https://www.thebarnatmountliberty.com
The Old Barn at Brown County	Nashville	Indiana			Barn / Rustic	Indoor & Outdoor		Restored barn in the Brown County hills that hosts one event at a time, with exclusive use from Friday setup through Sunday morning.	OldBarnAtBrownCounty@gmail.com	(812) 720-4079	https://www.theoldbarnatbrowncounty.com
`,
  },
  {
    name: "Des Moines, Omaha and Wichita",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Salisbury House & Gardens	Des Moines	Iowa			Historic / Estate	Indoor & Outdoor		Landmark 1920s mansion inspired by King's House in Salisbury, England, with 16th-century English oak woodwork, offered for weddings.	contactus@salisburyhouse.org	(515) 274-1777	https://www.salisburyhouse.org
Des Moines Heritage Center	Des Moines	Iowa			Historic / Estate	Indoor & Outdoor		Restored former train depot in the historic East Village with an event center and a historic depot space for weddings.	sarah@desmoinesheritagetrust.org	515.943.0641	https://www.desmoinesheritagecenter.org
Greater Des Moines Botanical Garden	Des Moines	Iowa			Garden / Outdoor	Indoor & Outdoor		Downtown botanical garden offering ceremonies beneath its glass dome conservatory or among the seasonal outdoor gardens.			https://dmbotanicalgarden.com
Joslyn Castle & Gardens	Omaha	Nebraska			Historic / Estate	Indoor & Outdoor		Scottish Baronial mansion on 5.5 acres of grounds, rented for weddings and private events.	info@joslyncastle.com	(402) 595-2199	https://www.joslyncastle.com
The Palazzo Wedding and Event Venue	Omaha	Nebraska			Ballroom / Hotel	Indoor & Outdoor	400	Classic ballroom with high ceilings, chandeliers and gold-and-white decor, plus outdoor green space for ceremonies.	events@omahapalazzo.com	402-933-9186	https://www.omahapalazzo.com
Kansas Aviation Museum	Wichita	Kansas			Historic / Estate	Indoor		Museum in Wichita's original 1935 municipal airport terminal, rented for private events against a backdrop of aircraft.	info@kansasaviationmuseum.org	(316) 683-9242	https://www.kansasaviationmuseum.org
The Hudson	Wichita	Kansas			Historic / Estate	Indoor & Outdoor		Industrial-chic downtown event venue in the Commerce Street arts district, with an outdoor patio.		316.600.7930	https://thehudsonict.com
`,
  },
  {
    name: "Denver, Boulder, Colorado Springs and the Colorado mountains",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Mile High Station	Denver	Colorado			Historic / Estate	Indoor & Outdoor		Restored industrial building just west of downtown with exposed brick and steel beams, a patio and in-house sound and TV systems.	mhs@pouringiton.com	(720) 946-7721	https://www.milehighstation.com
The Oxford Hotel	Denver	Colorado			Ballroom / Hotel	Indoor		Denver's 1891 LoDo hotel with a ballroom and smaller event rooms, catering through its Urban Farmer restaurant, and on-site guest rooms.		(833) 524-0368	https://www.theoxfordhotel.com
Denver Botanic Gardens	Denver	Colorado			Garden / Outdoor	Indoor & Outdoor		Botanical garden that takes private events and weddings at its York Street site near Cheesman Park and at Chatfield Farms in Littleton.		(720) 865-3500	https://www.botanicgardens.org
The Colorado Chautauqua	Boulder	Colorado			Historic / Estate	Indoor & Outdoor		National Historic Landmark at the foot of the Flatirons, with historic cottages, lodge spaces, a dining hall and event catering for weddings.		(303) 442-3282	https://www.chautauqua.com
Boulder Dushanbe Teahouse	Boulder	Colorado			Restaurant / Vineyard	Indoor & Outdoor		Tea house and restaurant on Boulder Creek that books the teahouse, creekside patio and tea garden for weddings and private events.	info@boulderteahouse.com	(303) 442-4993	https://boulderteahouse.com
Garden of the Gods Resort & Club	Colorado Springs	Colorado			Ballroom / Hotel	Indoor & Outdoor		Mesa-top resort facing Garden of the Gods Park, with event space, terraces and red-rock and Pikes Peak views, plus lodge rooms, cottages and casitas.		(719) 632-5541	https://www.gardenofthegodsresort.com
The Mining Exchange Hotel	Colorado Springs	Colorado			Ballroom / Hotel	Indoor & Outdoor		Boutique hotel in a 1902 downtown building with two ballrooms, an outdoor terrace and in-house catering for weddings.		(719) 323-2000	https://www.miningexchangehotel.com
The Broadmoor	Colorado Springs	Colorado			Ballroom / Hotel	Indoor & Outdoor	1000	Historic luxury resort, open since 1918, with chapels, lodges, ballrooms and mountain terraces, plus the Cloud Camp mountaintop setting.		(844) 602-3343	https://www.broadmoor.com
The Stanley Hotel	Estes Park	Colorado			Historic / Estate	Indoor & Outdoor	1000	Historic mountain hotel with several wedding spaces, including the Long Peak Lawn with Rocky Mountain views and the glass-walled Pavilion beside a private pond.	sales@stanleyhotel.com	(970) 577-4000	https://www.stanleyhotel.com
Black Canyon Inn	Estes Park	Colorado			Barn / Rustic	Indoor & Outdoor	200	Mountain lodging property with two wedding venues, The Boulders and The Homestead, offering indoor and outdoor ceremony spots plus catering and bar service.		(970) 652-8544	https://www.blackcanyoninn.com
Taharaa Mountain Lodge and Twin Owls Steakhouse	Estes Park	Colorado			Ballroom / Hotel	Indoor & Outdoor		Small mountain lodge with a steakhouse, set at the foot of Lily Mountain with ceremony sites overlooking the Estes Valley.		(970) 577-0027	https://www.taharaa.com
Betty Ford Alpine Gardens	Vail	Colorado			Garden / Outdoor	Outdoor	50	Nonprofit botanical garden near Vail Village whose open-air Rooftop Terrace looks out to the Gore Range, available for ceremonies, receptions and elopements in summer and early fall.	connect@BettyFordAlpineGardens.org	(970) 476-0103	https://bettyfordalpinegardens.org
`,
  },
  {
    name: "Phoenix, Scottsdale, Tucson and Sedona",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
The Phoenician	Scottsdale	Arizona			Ballroom / Hotel			Resort at the base of Camelback Mountain, 6000 E Camelback Rd, with multiple wedding venues, dining, a spa and golf.		(480) 941-8200	https://www.thephoenician.com
Mountain Shadows Resort Scottsdale	Paradise Valley	Arizona			Ballroom / Hotel	Outdoor		Paradise Valley resort with wedding spaces that include the Mountain Shadows Lawn, the Camelback Overlook and a rooftop deck.		855.485.1417	https://www.mountainshadows.com
Hermosa Inn	Paradise Valley	Arizona			Ballroom / Hotel			Boutique hideaway with 43 casitas, landscaped gardens, Camelback Mountain views and a restaurant, offering weddings and celebrations.		800-241-1210	https://azhideawaycollection.com/hermosa-inn/
The Boulders Resort & Spa	Carefree	Arizona			Ballroom / Hotel			Waldorf Astoria resort at 34631 N Tom Darlington Dr with unique wedding venues, two golf courses and a large spa.		480-488-9009	https://www.theboulders.com
Desert Botanical Garden	Phoenix	Arizona			Garden / Outdoor			Phoenix garden with desert landscapes for weddings and private events, with on-site venue planners, approved caterers and free guest parking.		(480) 941-1225	https://www.dbg.org
Arizona Biltmore	Phoenix	Arizona			Ballroom / Hotel			Frank Lloyd Wright-inspired resort at 2400 E Missouri Ave with indoor and outdoor event spaces and a dedicated wedding planning team.		602-955-6600	https://www.arizonabiltmore.com
Arizona Inn	Tucson	Arizona			Ballroom / Hotel	Indoor & Outdoor	200	Historic Tucson inn with ceremonies under open skies followed by receptions in elegant interiors, for weddings of 30 to 200 guests.		520-325-1541	https://www.arizonainn.com
L'Auberge de Sedona	Sedona	Arizona			Ballroom / Hotel			Sedona resort on L'Auberge Lane with creekside cottages, cliffside rooms and a five-bedroom private home, hosting weddings and gatherings.	info@lauberge.com	855-905-5745	https://www.lauberge.com
Enchantment Resort	Sedona	Arizona			Ballroom / Hotel			Resort in Boynton Canyon with private casitas and suites, hosting weddings and gatherings on site.		(928) 282-2900	https://www.enchantmentresort.com
`,
  },
  {
    name: "Las Vegas, Reno and Lake Tahoe",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Red Rock Resort	Las Vegas	Nevada			Ballroom / Hotel	Indoor & Outdoor		Casino resort at 11011 W Charleston Blvd with wedding spaces that include terraces with Strip and canyon views, poolside settings and private ballrooms.	RRSales@Stationcasinos.com	702.797.7016	https://redrockresort.com
Wynn Las Vegas	Las Vegas	Nevada			Ballroom / Hotel	Indoor & Outdoor	120	Resort at 3131 Las Vegas Blvd with the Lilac and Lavender salons, the outdoor Primrose Courtyard and ballrooms for larger groups.		(702) 770-7400	https://www.wynnlasvegas.com/weddings
Peppermill Resort Spa Casino	Reno	Nevada			Ballroom / Hotel	Indoor		Reno resort at 2707 S Virginia St with wedding chapels and the two-story Skyline Wedding Suite looking out to the Sierra.		775.689.7244	https://www.peppermillreno.com/events/weddings/
Edgewood Tahoe Resort	Stateline	Nevada			Ballroom / Hotel	Indoor & Outdoor		Lakefront resort at Stateline with the North Lawn, the 17th green and the Willow Ballroom with a heated deck; it does not host elopements.		888-881-8659	https://www.edgewoodtahoe.com/weddings
`,
  },
  {
    name: "Salt Lake City and Park City",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
This Is The Place Heritage Park	Salt Lake City	Utah			Historic / Estate	Indoor & Outdoor		Living-history park at 2601 E Sunnyside Ave with a dozen-plus wedding spaces, including Pine Valley Chapel and the Garden Place, against Wasatch Mountain views.	cservice@thisistheplace.org	801-924-7507	https://www.thisistheplace.org/weddings
Natural History Museum of Utah	Salt Lake City	Utah			Historic / Estate	Indoor & Outdoor	450	Museum at 301 Wakara Way in the foothills above Salt Lake City, with the Canyon, Canyon Terrace and Swaner Forum for receptions.		801-581-6927	https://nhmu.utah.edu/weddings
Stein Eriksen Lodge Deer Valley	Park City	Utah			Ballroom / Hotel	Indoor & Outdoor		Mountain lodge at 7700 Stein Way with the Stein Ballroom, Olympic Ballroom, Flagstaff Room and the Flagstaff Mountain Deck.		(435) 649-3700	https://www.steinlodge.com/weddings
Deer Valley Resort	Park City	Utah			Ballroom / Hotel	Indoor & Outdoor	300	Ski resort with on-mountain wedding venues: Empire Canyon Lodge, Silver Lake Lodge and Cushing's Cabin (summer only), plus Orion Meadow for ceremonies.			https://www.deervalley.com/weddings
`,
  },
  {
    name: "Boise, Sun Valley and Bozeman",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Hotel Renegade	Boise	Idaho			Ballroom / Hotel	Indoor		Downtown Boise hotel at 1110 W Grove St with the Overland Ballroom, a rooftop ballroom on the eighth floor with mountain and skyline views.		208.776.1110	https://hotelrenegade.com
Boise Brewing	Boise	Idaho			Restaurant / Vineyard	Indoor		Community-owned brewery and restaurant at 521 W Broad St that takes private event reservations in its expanded taproom and dining space.	info@boisebrewing.com	(208) 342-7655	https://www.boisebrewing.com
Sun Valley Resort	Sun Valley	Idaho			Ballroom / Hotel	Indoor & Outdoor		Mountain resort at 1 Sun Valley Rd with eight wedding venues, from the Trail Creek Pavilion and Trail Creek Cabin to River Run Lodge, the Roundhouse and the Limelight Ballroom.	weddings@sunvalley.com	(208) 622-2047	https://www.sunvalley.com/weddings
Gallatin River Hideaway	Bozeman	Montana			Garden / Outdoor	Outdoor	300	Two outdoor venues along the Gallatin River at 135 Hideaway Dr: the tree-lined Creekside Venue (up to 200) and the Bridal Veil Venue meadow (up to 300), with on-site cabins.	grhideaway@gmail.com	406-209-1199	https://www.gallatinriverhideaway.com
Heritage Ranch	Bozeman	Montana			Barn / Rustic	Indoor & Outdoor		45-acre ranch about ten minutes from Bozeman with a lodge, a converted-stable luxury barn, a cabin and glamping tents, with views of the Bridger, Spanish Peaks and Tobacco Root ranges.		425-210-1763	https://heritageranchmt.com
Hardscrabble Ranch	Bozeman	Montana			Barn / Rustic	Indoor & Outdoor	200	78-acre mountain guest ranch outside Bozeman on Brackett Creek with event space for 200-plus and lodging for up to 54 guests on site.			https://www.hardscrabbleranch.com
`,
  },
  {
    name: "Jackson Hole, Cheyenne, Bend, Hood River and Portland",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Jackson Hole Mountain Resort	Teton Village	Wyoming			Ballroom / Hotel	Indoor & Outdoor	400	Ski resort offering mountain wedding venues including Rendezvous Lodge at 9,095 feet (reached by gondola), Piste Private Dining and Trapper's at Solitude Station with a lawn and outdoor fireplaces.		307-733-2292	https://www.jacksonhole.com/weddings
Spring Creek Ranch	Jackson	Wyoming			Barn / Rustic	Indoor & Outdoor	300	Ranch resort at 1600 N East Butte Rd with the outdoor Sagebrush Vista (Teton views), the Sagebrush Ballroom, the Sage Overlook stables area and villas for small dinners.		(307) 733-8833	https://www.springcreekranch.com/weddings
Wyoming Hereford Ranch	Cheyenne	Wyoming			Barn / Rustic	Indoor & Outdoor		Historic working ranch at 1114 Hereford Ranch Rd, established in 1883, offering ranch-style weddings and events.		(307) 634-1905	https://www.wyomingherefordranch.com
Cheyenne Botanic Gardens	Cheyenne	Wyoming			Garden / Outdoor	Indoor & Outdoor	300	Garden at 710 S Lions Park Dr with ceremony spaces from the Lily Pond and Conservatory to the Peace Garden, the Glade and the Cottonwood Grove, plus Orangerie and Solar Patio receptions.		307.637.6458	https://www.botanic.org/reserve/weddings/
Historic Governors' Mansion	Cheyenne	Wyoming			Historic / Estate	Indoor & Outdoor	24	State historic site at 300 E 21st St where only the Carriage House (with side lawns) is rentable, for small weddings, showers and parties; the mansion itself is not available.		307-777-7878	https://wyoparks.wyo.gov/index.php/activities-amenities-historic-gov/events-weddings-historic-governors-mansion
Tetherow	Bend	Oregon			Ballroom / Hotel	Indoor & Outdoor		Golf resort at 61240 Skyline Ranch Rd with the Event Pavilion, the divisible Newberry-Zaal Ballroom and an outdoor ceremony lawn overlooking the Cascades, plus on-site lodging.		(844) 431-9701	https://www.tetherow.com/weddings
Juniper Preserve	Bend	Oregon			Ballroom / Hotel	Indoor & Outdoor	150	Golf and wellness resort at 65600 Pronghorn Club Dr that hosts one wedding per day, with the Chanterelle Ballroom, Overlook Room, Lava Cave and an island pavilion.	guest.services@juniperpreserve.com	866.320.5024	https://juniperpreserve.com/weddings
Hood River Hotel	Hood River	Oregon			Ballroom / Hotel	Indoor	120	Downtown hotel at 102 Oak St with a renovated 2,500 sq ft ballroom, the Emerald Room for intimate events and full-hotel buyout packages.	sales@hoodriverhotel.com	(541) 386-1900	https://www.hoodriverhotel.com/weddings
The Evergreen	Portland	Oregon			Historic / Estate	Indoor	200	Restored 1908 building at 618 SE Alder St, woman-owned since 2016, with one main event space plus the Voysey speakeasy room for up to 65.	info@theevergreenpdx.com	503-476-1811	https://www.theevergreenpdx.com
Lan Su Chinese Garden	Portland	Oregon			Garden / Outdoor	Indoor & Outdoor	250	Chinese garden at 239 NW Everett St rentable after public hours, with the garden (bridged lake, pavilions) and a two-floor teahouse.		503-228-8131	https://lansugarden.org/private-events/weddings/
`,
  },
  {
    name: "Seattle, Woodinville, Snoqualmie, Blaine, Poulsbo and the Willamette Valley",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Columbia Tower Club	Seattle	Washington			Ballroom / Hotel	Indoor		Private club on the 75th floor of Columbia Tower at 701 5th Ave, hosting weddings for non-members with in-house catering, bar options and a dance floor.		206-622-2010	https://www.invitedclubs.com/clubs/columbia-tower-club/host/weddings
Smith Tower	Seattle	Washington			Historic / Estate	Indoor & Outdoor	70	Historic Art Deco tower at 506 2nd Ave where weddings take over the 35th-floor Observatory, with an open-air deck and views of Elliott Bay.		206.624.0414	https://smithtower.com/weddings/
Willows Lodge	Woodinville	Washington			Ballroom / Hotel	Indoor & Outdoor		Wine-country lodge at 14580 NE 145th St on five acres of gardens by the Sammamish River, with the Sammamish Ballroom, a patio and a Garden Gazebo, plus on-site lodging.		425-424-3900	https://willowslodge.com/washington-state-weddings
Salish Lodge & Spa	Snoqualmie	Washington			Ballroom / Hotel	Indoor & Outdoor	100	Lodge at 6501 Railroad Ave SE perched above Snoqualmie Falls, with a Hidden Terrace ceremony space, a ballroom and packages for 24 to 100 guests.		(425) 888-2556	https://www.salishlodge.com/wedding
Semiahmoo Resort, Golf & Spa	Blaine	Washington			Ballroom / Hotel	Indoor & Outdoor		Waterfront resort at 9565 Semiahmoo Pkwy near the Canadian border that hosts weddings and takes proposal requests through its site.		855-917-3767	https://semiahmoo.com/
Kiana Lodge	Poulsbo	Washington			Garden / Outdoor	Indoor & Outdoor		Waterfront lodge at 14976 NE Sandy Hook Rd with a main lodge, gardens and shoreline settings for weddings and private events.	Info@kianalodge.com	1-866-738-4307	https://kianalodge.com
Stoller Family Estate	Dayton	Oregon			Restaurant / Vineyard	Indoor & Outdoor	150	Experience Center at 16161 NE McDougall Rd overlooking a 225-acre vineyard, with a main room for up to 150, outdoor space and three guest houses; on-site catering and a planner are required.	events@stollerwinegroup.com	(503) 864-3404	https://www.stollerfamilyestate.com
`,
  },
  {
    name: "San Diego and La Jolla",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Paradise Point Resort & Spa	San Diego	California			Ballroom / Hotel	Indoor & Outdoor		44-acre island resort at 1404 Vacation Rd on Mission Bay with waterfront gardens, lagoons and bayfront lawns, and over 60,000 sq ft of indoor and outdoor event space.		858-274-4630	https://www.paradisepoint.com/san-diego-weddings/
Hotel del Coronado	Coronado	California			Ballroom / Hotel	Indoor & Outdoor		Historic beachfront resort at 1500 Orange Ave with the Crown Room ballroom, Windsor Lawn, private Del Beach and Victorian spaces.		1-619-435-6611	https://hoteldel.com/gather/weddings/
The Lodge at Torrey Pines	La Jolla	California			Ballroom / Hotel	Indoor & Outdoor		Resort at 11480 N Torrey Pines Rd with several wedding venues and wedding collections, quoted through its inquiry form.		(858) 453-4420	https://www.lodgetorreypines.com/weddings
`,
  },
  {
    name: "Los Angeles area: first batch",
    tsv: `Name	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Description	Email	Phone	Website
Descanso Gardens	La Cañada Flintridge	California			Garden / Outdoor	Outdoor		Botanical garden at 1418 Descanso Dr offering weddings in the Rose Garden, Boddy House and other garden spots, with exclusive on-site catering through Flora Events.	visitorcenter@descansogardens.org	818-949-4291	https://www.descansogardens.org/events/weddings/
Hummingbird Nest Ranch	Simi Valley	California			Historic / Estate	Indoor & Outdoor		Estate at 2940 Kuehner Dr in the Santa Susana Mountains with a Spanish villa, olive groves, fountains, lawns and vineyards, and 14 on-site guest accommodations.	erica@hbnest.com	805-579-8000	https://www.hummingbirdnestranch.com/
Calamigos Ranch Resort & Spa	Malibu	California			Ballroom / Hotel	Indoor & Outdoor		400-acre resort at 327 S Latigo Canyon Rd in the Santa Monica Mountains with gardens, oak groves, bungalows and a spa; weddings are booked through its events site.		(818) 575-4400	https://www.calamigosranch.com/
Greystone Mansion	Beverly Hills	California			Historic / Estate	Indoor & Outdoor		Historic Doheny Greystone Estate at 905 Loma Vista Dr, run by Friends of Greystone; the mansion opens only for special events including weddings.	friends@greystonemansion.org	(310) 285-1000	https://greystonemansion.org/
`,
  },
];
