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
];
