import type { VenueBatch } from "@/lib/venue-batches";

// Oklahoma venue batches. Every row's State is "Oklahoma". Add new batches at the end.
const batches: VenueBatch[] = [
  {
    name: "Tulsa, Jenks, Bixby, Sand Springs, Sperry, Collinsville, Oklahoma City, Edmond, Norman, Yukon and Tuttle",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Five Oaks Lodge	528 E 121st St S	Jenks	Oklahoma			Beach / Waterfront	Indoor & Outdoor	250		Lakeside lodge in Jenks that hosts one wedding at a time, with indoor space for 150 and outdoor space for 250.	nicole@fiveoakslodge.com	918.298.6405	https://www.fiveoakslodge.com
Dream Point Ranch	17400 E 167th St S	Bixby	Oklahoma			Garden / Outdoor	Indoor & Outdoor		Classic	Private 191-acre estate in Bixby with two separate venues, Mountain Crest and Riverbend Chapel, half a mile apart.	sarah@dreampointranch.com	918-900-4850	https://www.dreampointranch.com
Vinterra Event Venue	14515 S Yale Ave	Bixby	Oklahoma			Ballroom / Hotel	Indoor & Outdoor		Classic	Contemporary glass-fronted event hall beside a lake in Bixby, with a grand hall and indoor and outdoor ceremony spaces.		918.882.0822	https://vinterratulsa.com
Discoveryland Ranch	19501 W 41st St	Sand Springs	Oklahoma			Barn / Rustic	Indoor & Outdoor	250		Ninety-five-acre ranch west of Tulsa with a historic outdoor amphitheatre, a stone-fireplace pavilion and a newly built event hall.	info@dlrevents.com	(918) 960-0195	https://www.dlrevents.com
Bellissima Ranch	4833 W 88th St N	Sperry	Oklahoma			Barn / Rustic	Indoor & Outdoor			Twenty-acre rustic ranch with separate ceremony and reception barns, ponds, a pool and overnight suites.		918-361-1541	https://www.tulsaweddingvenue.com
The Lodge at Bridal Creek	5811 Roper Rd	Sperry	Oklahoma			Barn / Rustic	Indoor & Outdoor	200		Country lodge with a 7,500-square-foot main hall overlooking a pond, plus twelve guest cabins on site.		918-376-3267	https://bridalcreekok.com
Philbrook Museum of Art	2727 S Rockford Rd	Tulsa	Oklahoma			Historic / Estate	Indoor & Outdoor	500		Villa-style art museum in Tulsa with terraced gardens, a front lawn and a large garden pavilion for receptions.		(918) 749-7941	https://www.philbrook.org
Coal Creek Winery & Event Center	210 N Sara Rd	Tuttle	Oklahoma			Restaurant / Vineyard	Indoor & Outdoor	450	Classic	Winery estate south-west of Oklahoma City with an indoor event hall, a grand staircase, a bridal suite and an outdoor ceremony site.	info@coalcreekwinery.com	405-482-8685	https://coalcreekok.com
Thunderbird Chapel	11395 E Highway 9	Norman	Oklahoma			Garden / Outdoor	Indoor & Outdoor			Family-run Norman property on nearly forty acres, with a chapel and both indoor and outdoor reception space.		(405) 212-9291	https://www.thunderbirdchapel.com
Vast	333 W Sheridan Ave	Oklahoma City	Oklahoma			Restaurant / Vineyard	Indoor	240		Restaurant on the 49th and 50th floors of Devon Tower, with three private rooms for weddings and skyline views.		405.702.7262	https://www.vastokc.com
Clauren Ridge Vineyard & Winery	6000 W Waterloo Rd	Edmond	Oklahoma			Restaurant / Vineyard	Indoor & Outdoor			Working vineyard of about ten acres with a pergola ceremony site, a pond and a temperature-controlled winery for receptions.	kim@claurenridge.com	(405) 412-8630	https://claurenridge.com
The Venue at Forest Lake	3500 N Coltrane Rd	Oklahoma City	Oklahoma			Historic / Estate	Indoor & Outdoor	165		Renovated estate on thirteen acres in Forest Park with a private lake, a chapel, a honeymoon cottage and guest suites.		405-906-5185	https://www.thevenueatforestlake.com
Oklahoma Hall of Fame	1400 Classen Dr	Oklahoma City	Oklahoma			Historic / Estate	Indoor & Outdoor	250		1927 neoclassical building on the National Register, with a grand staircase, a fourth-floor great hall and a courtyard garden.			https://www.oklahomahof.com
Myriad Botanical Gardens	301 W Reno Ave	Oklahoma City	Oklahoma			Garden / Outdoor	Indoor & Outdoor			Downtown Oklahoma City botanical garden with landscaped grounds and a choice of indoor and outdoor wedding spaces.		405-445-7080	https://myriadgardens.org
Blose Barn and Garden	301 S Richland Rd	Yukon	Oklahoma			Barn / Rustic	Indoor & Outdoor	150		Ten wooded acres with a century-old barn, a climate-controlled reception room and a renovated house for the wedding party.		(405) 317-8814	https://www.blosebarnandgarden.com
The Warehouse at West Main	1011 W Main St	Collinsville	Oklahoma			Ballroom / Hotel	Indoor	200	Simple	Four-thousand-square-foot converted warehouse in downtown Collinsville with exposed brick, wooden rafters, steel beams and two dressing rooms.			https://westmaineventcenter.com
`,
  },
  {
    name: "Stillwater and Muskogee",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
The Range	1819 N Range Road	Stillwater	Oklahoma			Garden / Outdoor	Indoor & Outdoor	300		White-brick event hall outside Stillwater with a fireplace main hall, bridal and groom suites, a pond-side ceremony space and a relocated covered bridge at the entrance.		(405) 385-9312	https://www.therangeok.com/
Eight Ten Ranch	800 N Country Club Rd	Muskogee	Oklahoma			Barn / Rustic	Indoor & Outdoor	250	Simple	Modern farmhouse barn on eighteen acres with an all-white reception hall, floor-to-ceiling windows and a cedar-arbor ceremony site beside a pond.		(918) 616-9864	https://www.eighttenranch.com/weddings
`,
  },
  {
    name: "Oklahoma City, Tulsa and statewide: more Oklahoma venues",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Prairie Haven Events	7500 W Highway 33	Guthrie	Oklahoma			Barn / Rustic	Indoor			A climate-controlled prairie-side event venue outside Guthrie with separate bridal and groom suites and a prep kitchen for caterers.	prairiehavenevents@yahoo.com	405-446-9866	https://www.prairiehavenevents.com/
Lee's Grand Lake Resort	24800 South 630 Road	Grove	Oklahoma			Beach / Waterfront	Indoor & Outdoor	200		A family lakefront resort on Grand Lake where vows can be held in a cedar-bedded lakefront garden, with cabins and a marina on the property.	getlost@leesresort.com	918-786-4289	https://www.leesresort.com/weddings
Rocky Meadow Farm	4900 E 488 Rd	Claremore	Oklahoma			Barn / Rustic	Indoor	100		A working farm near Claremore whose farmhouse-style event building has a bridal suite, groom's room and pastoral views, plus a petting zoo option.			https://www.rockymeadowfarmok.com/weddings
Three Twenty on Main	320 W. Will Rogers Blvd	Claremore	Oklahoma			Ballroom / Hotel	Indoor	120		An event space in historic downtown Claremore with a ballroom and gallery, a catering kitchen and an open vendor policy.	susan@320onmain.com		https://www.320onmain.com/
Bell Tower Event Center	218 N. 3rd Ave	Durant	Oklahoma			Historic / Estate	Indoor	300		A 1923 downtown Durant church turned wedding venue, with a chapel, a vaulted loft and a parlor with tiled ceilings and chandeliers.	teddy@gabbart.com	580-931-9474	https://www.belltowerdurant.com/
The Legacy at MK Ranch	19495 E. Balentine Road	Tahlequah	Oklahoma			Barn / Rustic	Indoor & Outdoor		Simple	An 8,500-square-foot farmhouse-style barn just outside Tahlequah with over fifty windows and private bride and groom suites.	thelegacyok@gmail.com	918-543-5494	https://www.thelegacyok.com/
Crystal Forest Venue	263 Crooked Oaks Lane	Hochatown	Oklahoma			Garden / Outdoor	Indoor & Outdoor	250		An eight-acre wooded estate near Broken Bow with a glass-walled pavilion whose 50-foot wall lifts open to a deck over a pond.			https://www.crystalforestvenue.com/
Stokely Event Center	10111 East 45th Pl	Tulsa	Oklahoma			Ballroom / Hotel	Indoor			A Tulsa event hall decked with local and Route 66 memorabilia, offering a wedding suite and flexible ceremony and banquet seating.	stokelyevents@gmail.com	918-600-4448	https://stokelyeventcenter.com/
Wells Farm Barn & Pavilion	4091 E Franklin Rd	Norman	Oklahoma			Barn / Rustic	Indoor & Outdoor	200		A working Norman Christmas tree farm that hosts weddings under a covered pavilion or among the pines, with a small climate-controlled indoor room.	wellschristmastrees@gmail.com	405-887-1298	https://wellschristmastrees.com/pages/wedding-venue-norman-ok
The Venue at Freedom Farms	4701 N Porter Ave	Norman	Oklahoma			Barn / Rustic	Indoor & Outdoor			A conservation-easement farm in Norman along the Little River watershed, with an indoor venue plus separate bridal house and groom's suite.	Venue@jacksonfreedomfarms.net	405-657-7823	https://www.jacksonfreedomfarms.net/
81 Ranch	5220 N US Highway 81	Enid	Oklahoma			Barn / Rustic	Indoor & Outdoor	300	Classic	A ranch venue north of Enid with ceremony areas indoors and out and a large reception hall, with tables, chairs and linens set up by staff.	brandi@81ranch.com	580-768-6040	https://www.81ranch.com/
BarDew Valley Inn	93420 W1400 Road	Bartlesville	Oklahoma			Ballroom / Hotel	Indoor & Outdoor			A themed-suite country inn near Bartlesville that lets wedding parties stay on site and hold the ceremony in landscaped grounds.	bardewvalleyinn@gmail.com	918-397-2404	https://www.bardewinn.net/weddings
Frank Phillips Home	1107 Cherokee Ave	Bartlesville	Oklahoma			Historic / Estate				The former Bartlesville residence of oilman Frank Phillips, now a historic-house museum that rents its rooms for weddings and receptions.		918-336-2491	https://www.frankphillipshome.org/elegant-event-venue
The Wichita Wildflower	25775 State Highway 58	Lawton	Oklahoma			Garden / Outdoor	Indoor & Outdoor	125	Simple	A Lawton-area wedding venue looking toward the Wichita Mountains and Lake Lawtonka, with indoor and outdoor ceremony options and bridal suites.			https://www.thewichitawildflower.com/
The Bluestem Manor	9942 North 52nd Street West Ave	Sperry	Oklahoma			Garden / Outdoor	Indoor & Outdoor			An 80-acre Sperry property north of Tulsa with fire pits, a covered cocktail area and bridal and groom suites.		918-277-9400	https://bluestemmanor.com/
The Farmstead	6820 Econtuchka Rd	Shawnee	Oklahoma			Barn / Rustic	Indoor & Outdoor	200		A renovated venue on a century-old family farm east of Oklahoma City, with a homestead bridal house, a wedding tree and a corn barn.	info@farmsteadvenue.com		https://www.farmsteadvenue.com/
Legacy Event Center Ardmore	309 E. Main Street	Ardmore	Oklahoma			Ballroom / Hotel	Indoor & Outdoor			A downtown Ardmore banquet hall with a courtyard and patio, bridal suites and a list of preferred vendors.	leeann@legacyardmore.com	580-220-5830	https://www.legacyardmore.com/
GAST Event Center	1429 Terrace Drive	Tulsa	Oklahoma			Historic / Estate	Indoor		Simple	A 1929 Gothic-style Tulsa building whose Great Hall has hardwood floors, vaulted ceilings, antique chandeliers and stained glass.			https://gasteventcenter.com/
Rose Briar Place	11900 N Council Rd	Oklahoma City	Oklahoma			Historic / Estate	Indoor & Outdoor			A European-inspired Oklahoma City wedding venue operating since 2008 with in-house catering and an all-inclusive package approach.	info@rosebriarplace.com		https://rosebriarplace.com/
Hidden Oaks	12550 North Mustang Road	Piedmont	Oklahoma			Garden / Outdoor	Indoor & Outdoor			A wooded Piedmont property with forested ceremony and reception spaces and a large white pole tent.	info@hiddenoaksok.com		https://hiddenoaksok.com/
Prairie Song Events	402621 W 1600 Rd	Dewey	Oklahoma			Barn / Rustic				A prairie wedding venue just outside Dewey that offers tiered packages and tours by appointment.	prairiesongevents@gmail.com	918-440-7033	https://prairiesongevents.com/
Sparks Vineyard & Winery	51310 East 970 Road	Sparks	Oklahoma			Restaurant / Vineyard	Indoor & Outdoor			A working Lincoln County vineyard and winery with a tasting room that also hosts weddings and other private events.	info@sparksvineyard.com	405-650-0996	https://www.sparksvineyard.com/
Coles Garden	1415 Northeast 63rd Street	Oklahoma City	Oklahoma			Garden / Outdoor	Indoor & Outdoor			A 13-acre Oklahoma City sculpture-garden property, once a statue museum, with waterfalls, gardens and indoor event rooms.	inquiries@colesgarden.net	405-478-1529	https://colesgarden.net/
The Ponds at Mable Farms	998 Pleasant Road	Ardmore	Oklahoma			Barn / Rustic	Indoor & Outdoor			A forty-acre farm venue northeast of Ardmore near the Arbuckle Mountains with a shiplap-interior barn and several ponds.	thepondsatmablefarms@aol.com		https://mablefarms.com/
Greenleaf Barn	6815 S 321st E Ave	Broken Arrow	Oklahoma			Barn / Rustic	Indoor & Outdoor	175		A white-interior, climate-controlled barn on a tree-lined country road east of Broken Arrow, with two outdoor ceremony spots and a prep kitchen.	greenleafbarnok@gmail.com		https://greenleafbarn.com/
`,
  },
];

export default batches;
