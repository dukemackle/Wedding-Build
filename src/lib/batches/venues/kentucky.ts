import type { VenueBatch } from "@/lib/venue-batches";

// Kentucky venue batches. Every row's State is "Kentucky". Add new batches at the end.
const batches: VenueBatch[] = [
  {
    name: "Louisville and Lexington: second batch",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Galt House Hotel	140 N Fourth St	Louisville	Kentucky			Hotel & Resort	Indoor	1600		Riverfront downtown hotel on the Ohio River with more than 40 event spaces, a 23,000 sq ft Grand Ballroom and guest rooms on site.	info-galthotel@galthotel.com	502-589-5200	https://www.galthouse.com/weddings/
Whitehall	3110 Lexington Rd	Louisville	Kentucky			Historic Mansion & Estate	Indoor & Outdoor	250		Antebellum mansion furnished as it was in 1909, with a formal garden for ceremonies and a garden terrace for tented receptions.		(502) 897-2944	https://www.historicwhitehall.org/weddings
Farmington Historic Home	3033 Bardstown Rd	Louisville	Kentucky			Historic Mansion & Estate	Indoor & Outdoor	300	Simple	1816 Federal-style Speed family home on 18 acres in the Highlands, with formal gardens, a great lawn and a 4,800 sq ft open-air pavilion.	Michael@historichomes.org	502-452-9920	https://visitfarmington.org/rentals/
Frazier Kentucky History Museum	829 W Main St	Louisville	Kentucky			Museum, Gallery & Rooftop	Indoor			History museum on West Main Street's Museum Row that rents its galleries and spaces, up to a full buyout, for weddings.	info@fraziermuseum.org	(502) 753-5663	https://www.fraziermuseum.org/rent-the-museum
The Barn at Magnolia Farm	6701 Briar Ridge Rd	Mount Eden	Kentucky			Barn & Farm	Indoor & Outdoor		Simple	Family-run heated and air-conditioned rustic barn on a 20-acre former herb farm about 25 minutes from Louisville.		(855) 949-4022	https://www.thebarnatmagnoliafarm.com/
The Barn at Springhouse Gardens	185 W Catnip Hill Rd	Nicholasville	Kentucky			Barn & Farm	Indoor & Outdoor	80		Restored tobacco barn with a loft beside a garden centre south of Lexington, with a gazebo, lawn and farmhouse on the grounds.	thebarn@springhousegardens.com	859-327-9849	https://www.springhousegardens.com/the-barn
Limestone Hall	215 W Main St	Lexington	Kentucky			Ballroom	Indoor	300	Simple	Third floor of downtown Lexington's 1898 Richardsonian Romanesque courthouse, with two event rooms joined by a domed rotunda.	hello@limestonehall.com	859-230-5365	https://www.limestonehall.com/
The Carrick House	312 N Limestone	Lexington	Kentucky			Historic Mansion & Estate	Indoor			Nineteenth-century mansion on North Limestone joined to a glass-roofed banquet space, run by Lundy's catering.	summer@lundyscatering.com	859-255-0717	https://www.carrickhouse.com/
Rotherwood Events	3565 Paris Rd	Winchester	Kentucky			Historic Mansion & Estate	Indoor & Outdoor			1887 Victorian estate east of Lexington with a restored mansion, a Grand Carriage Hall barn for receptions and outdoor ceremony sites.	info@rotherwoodevents.com	(859) 513-3498	https://www.rotherwoodevents.com/
The Manchester Reserve	903 Manchester St	Lexington	Kentucky			Historic Mansion & Estate	Indoor			Exposed-brick hall with large windows and chandeliers on Manchester Street in Lexington's Distillery District.			https://www.themanchesterreserve.com/`,
  },
  {
    name: "Louisville and Lexington: third batch",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Mellwood Art Center	1860 Mellwood Ave	Louisville	Kentucky			Museum, Gallery & Rooftop	Indoor & Outdoor	650	Classic	Former 1904 Fischer meat-packing plant turned artists' studio complex, with five event rooms led by the 12,500-square-foot Van Gogh Ballroom and its courtyard.		(502) 895-3650	https://www.mellwoodartcenter.com/events-portal/
Kentucky Derby Museum	704 Central Ave	Louisville	Kentucky			Museum, Gallery & Rooftop	Indoor & Outdoor	350		Racing museum at the gates of Churchill Downs, with a domed Great Hall, a glass-doored Oaks Garden Terrace and a second-floor gallery whose balcony overlooks the track.		(502) 637-1111	https://www.derbymuseum.org/rent/weddings
Waterfront Botanical Gardens	1435 Frankfort Ave	Louisville	Kentucky			Garden & Park	Indoor & Outdoor	220		Riverside botanical garden between Frankfort Avenue and River Road, with a glass-walled education centre, patios over Beargrass Creek, a water wall and plazas for tented receptions.			https://waterfrontgardens.org/rentals/
Harper Hall	177 N Upper St	Lexington	Kentucky			Ballroom	Indoor	295	Simple	Two-storey downtown hall a block from Gratz Park, with an open first floor for ceremonies and an open second floor for receptions.	info@HarperHallLex.com	(859) 492-1473	https://www.harperhalllex.com/
Holly Hill Events at Fasig-Tipton	2400 Newtown Pike	Lexington	Kentucky			Barn & Farm	Indoor & Outdoor	300		Event spaces on the grounds of the Fasig-Tipton Thoroughbred auction company, including a fieldstone-and-plank Seattle Slew hall, a barn-sided Kentucky Room opening onto a paddock and outdoor pavilions.	events@hollyhillinn.com	(859) 685-0330	https://www.hollyhilleventsky.com/venues
The Gillespie	421 W Market St	Louisville	Kentucky			Ballroom	Indoor	400		Former downtown bank turned 24,000-square-foot ballroom with marble walls and floors, 40-foot painted ceilings, a chandeliered mezzanine and the original vault-era gates and mail chute.	info@thegillespie.com	(502) 584-8080	https://www.thegillespie.com/grandballroom
Heartland of Versailles	1470 Clifton Rd	Versailles	Kentucky			Historic Mansion & Estate	Indoor & Outdoor	220		Victorian house from around 1886 on 30 wooded acres west of Versailles, listed on the National Register in 2018, with tented lawn receptions, patios and dressing rooms.	laura@heartlandofversailles.com	(859) 396-1505	https://heartlandofversailles.com/`,
  },
  {
    name: "Bowling Green, Owensboro and central Kentucky: fourth batch",
    tsv: `Name	Address	City	State	Website
Terrapin Hill Farm		Harrodsburg	Kentucky	https://www.terrapinhillfarm.com/
South Union Shaker Village		Auburn	Kentucky	https://southunionshakervillage.com/weddings-events-at-susv/
Green Turtle Bay Resort & Marina	239 Jetty Dr	Grand Rivers	Kentucky	https://www.greenturtlebay.com/celebrations
Queenslake		Georgetown	Kentucky	https://queenslake.com/
Chenault Vineyards	2284 Barnes Mill Rd	Richmond	Kentucky	https://www.chenaultvineyards.com/
Lynwood Estate		Richmond	Kentucky	https://www.lynwoodestate.com/
The Whitestone Barn		Bowling Green	Kentucky	https://www.thewhitestonebarn.com/
The Barn at Twin Creeks	333 P. Kinkade Rd	Auburn	Kentucky	https://www.thebarnattwincreeks.com/
Naimoli Estate	6000 Harmony Grove Rd	Hopkinsville	Kentucky	https://www.naimoliestate.com/
Windridge Country Club		Owensboro	Kentucky	https://www.windridgecc.com/
Shelby Hills Farm		Shelbyville	Kentucky	https://www.shelbyhillsfarm.com/`,
  },
  {
    name: "Bowling Green, Danville and Murray: fifth batch",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Ironwood Farm	455 Old Richardsville Rd	Bowling Green	Kentucky			Barn & Farm	Indoor & Outdoor			Pre-Civil War estate built in 1852 on a 500-acre farm above the Barren River, with a restored farmhouse, a thoroughbred horse barn and rolling lawns for ceremonies.	jen@ironwoodofbg.com	270-535-2744	https://ironwoodofbg.com/
The Potter Farm Events	1100 Rich Pond Rd	Bowling Green	Kentucky			Barn & Farm	Indoor & Outdoor	300	Simple	Historic barn on 20 acres south of Bowling Green with an outdoor ceremony lawn, a bridal cottage, groom's quarters and a large parking lot.	tonya@thepotterfarmevents.com	(270) 784-1632	https://thepotterfarmevents.com/weddings/
Highland Stables	1301 B Hunts Ln	Bowling Green	Kentucky			Barn & Farm	Indoor & Outdoor			Former horse-boarding stable on a 168-acre family farm ten minutes from downtown, now a full-time wedding venue with indoor and outdoor ceremony spaces and a bridal suite.	info@highlandstablesbg.com	270.393.2111	https://www.highlandstablesbg.com/
The Barn at White Oaks	675 Grant Rd	Murray	Kentucky			Barn & Farm	Indoor & Outdoor			All-white custom-built barn on 28 acres of farmland in Murray, with a clubhouse, several ceremony sites and separate bridal and groom's suites.	info@thebarnatwhiteoaks.com		https://www.thebarnatwhiteoaks.com/
Bluegrass Wedding Barn	3050 Mitchellsburg Rd	Danville	Kentucky			Barn & Farm	Indoor & Outdoor	250		Barn on 76 acres of a Bluegrass horse farm, run as an all-inclusive wedding experience with an on-site team and a floor plan designed around each couple.	events@bluegrassweddingbarn.com	(859) 324-1424	https://www.bluegrassweddingbarn.com/
Driscoll Estate	3301 Taylorsville Rd	Taylorsville	Kentucky			Historic Mansion & Estate	Indoor & Outdoor	300		33 acres of Kentucky hills about half an hour from Louisville, with a reception hall, a manor with themed guest rooms, a patio and a pool.	driscollestate@gmail.com	(502) 905-2755	https://www.driscollestate.com/louisville-wedding-venue`,
  },
  {
    name: "Western, central, northern and eastern Kentucky: sixth batch",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
314 Exchange	314 Mount Mercy	Pewee Valley	Kentucky			Barn & Farm	Indoor & Outdoor	120	Simple	A 3,500 sq ft brick-walled historic hall joined by double doors to a covered reclaimed barn, with a pavilion, garden ceremony spots and an on-site bridal suite and lodging for the wedding party.	314exchange@gmail.com	(502) 349-5884	https://314exchange.com/
The Willows at Lantern Lake	460 Golfcourse Road	Leitchfield	Kentucky			Lake & River	Indoor & Outdoor	150	Simple	A 22-acre lakeside property with a gazebo ceremony spot, a bright event space and a three-bedroom house for the couple to stay in.	thewillowsatlanternlake@gmail.com	502-230-5874	https://www.thewillowsatlanternlake.com
Burdoc Farms	1655 Pleasant Grove Road	Crofton	Kentucky			Barn & Farm	Indoor & Outdoor		Simple	A 700-acre western Kentucky farm with a woodland gazebo and overlook for ceremonies, a Chapel Barn and Tobacco Barn, and a greenhouse-style reception space beside a pond with swans.	info@burdocfarms.com	270.348.1483	https://burdocfarms.com/
White Chateau at Cecil Farms	8753 Mulligan Road	Owensboro	Kentucky			Barn & Farm	Indoor & Outdoor			A white event building on the Cecil family's working horse farm just outside Owensboro, with rolling-hill views and sunset light, open to a limited number of weddings each year.	events@whitechateau.com	(270) 929-1445	https://www.whitechateau.com/
The Tucker Homestead	1595 Mannsville Rd	Bradfordsville	Kentucky			Barn & Farm	Indoor & Outdoor			A 1910 farm home restored in 2010, with a terrace and fireplace, a covered patio and landscaped grounds in central Kentucky.	thetuckerhomestead@yahoo.com	270-337-2121	https://www.thetuckerhomestead.com/
The Haycraft	319 E Dixie Ave	Elizabethtown	Kentucky			Ballroom	Indoor			A former garage near downtown Elizabethtown turned event hall, with a large and a small room, a mural patio and a vintage gas pump.	thehaycraftetown@gmail.com	(502) 957-6029	https://www.thehaycraftetown.com/
I Do at The Barn	919 Charlie Norris Rd	Richmond	Kentucky			Barn & Farm	Indoor & Outdoor	200	Simple	A roughly 5,000 sq ft climate-controlled barn with indoor and outdoor ceremony spots, a connected pavilion, linens included and a stock of decorations couples can use.	idoatthebarn@gmail.com	606-524-5543	https://idoatthebarnky.com/
Celebration Barn	2855 Fisherville Road	Finchville	Kentucky			Barn & Farm		200	Simple	A family-run barn between Louisville and Frankfort whose weekend rental runs from the rehearsal through next-morning cleanup, with tables and chairs for 200.	CelebrationBarn1@gmail.com	502-494-9879	https://celebrationbarnky.com/
The Barn at Cedar Grove	1000 Brockman Keltner Road	Greensburg	Kentucky			Barn & Farm	Indoor & Outdoor			A restored tobacco barn about 100 years old, with woodland and meadow ceremony spots, open fields and lawn, near Green River Lake.		270-378-1915	https://www.barnatcedargrove.com/
Yates Event Center	2760 State Route 121 North	Murray	Kentucky			Ballroom	Indoor & Outdoor	300		A 27-acre pond-side property with two event rooms, a glass-doored chapel for indoor or outdoor ceremonies, a clubhouse, an 800 sq ft bridal suite and a catering kitchen.		(270) 293-1121	https://www.yateseventcenter.net/
Renee's Event Center	2946 Cairo Rd	Paducah	Kentucky			Barn & Farm	Indoor & Outdoor			A farm estate built in 1907 and renovated for events in 2000, with landscaped grounds, an original rustic barn, an open field and tents, rented as the whole site.	jenny-renees@comcast.net	(270) 441-0077	https://www.reneeseventcenter.com/
The Silo Event Center	110 John Rives Road	Hopkinsville	Kentucky			Barn & Farm	Indoor & Outdoor	400		A dairy-barn style climate-controlled event center on 30 acres near I-24, with a silo entrance, an outdoor ceremony space and separate getting-ready houses.	info@thesiloevents.com	270-632-6230	https://www.thesiloevents.com/
The Grand Lodge on Fifth	121 North 5th Street	Paducah	Kentucky			Mountain & Lodge	Indoor			A historic downtown Paducah building with hardwood floors and chandeliers, with in-house bar and catering services.	admin@thegrandlodgeonfifth.com	270-273-4079	https://thegrandlodgeonfifth.com/
The Stone House at Silver Creek	1920 Curtis Pike	Richmond	Kentucky			Barn & Farm	Indoor & Outdoor			A 51-acre creekside farm with an 1790 stone house used as dressing suites, a restored tobacco barn and a newer Atrium building, with ceremony spots in a tea garden, greenhouse and lawn.	Bookings@TheStoneHouseAtSilverCreek.com	859-951-2929	https://thestonehouseatsilvercreek.com/
The Barn at Mills Farm	8069 Barbourville Road	London	Kentucky			Barn & Farm	Indoor & Outdoor			A family-restored tobacco barn with an outdoor ceremony lawn, an indoor Reagan Room for weather backup and two cottages for the wedding party.		(606) 627-4200	https://thebarnatmillsfarm.com/
Cave Hill Vineyard & Winery	2115 Smith Ridge Rd	Eubank	Kentucky			Vineyard & Winery	Indoor & Outdoor	200		A working Kentucky Wine Trail vineyard with a climate-controlled 3,200 sq ft pavilion, an outdoor grapevine gazebo and a bride's house, just north of Lake Cumberland.	info@cavehillvineyard.com	606-423-3453	https://cavehillvineyard.com/weddings/
The Thoroughbred Center	3380 Paris Pike	Lexington	Kentucky			Barn & Farm	Indoor & Outdoor	300	Simple	A working horse-training farm hosting weddings in a converted holding barn (Stableview Hall), a fireplace lounge and an outdoor Paddock with pasture views.	Events@TheThoroughbredCenter.com	859.293.1853	https://www.thethoroughbredcenter.com/weddings-events
The Barn at Belle Hills	895 Violet Rd	Crittenden	Kentucky			Barn & Farm	Indoor & Outdoor	500	Simple	A family-run 70-acre farm off I-75 with a climate-controlled rustic barn, a fireplace and chandelier, and a grass ceremony lawn with an Amish-built gazebo.	hello@bellehillsvenue.com	(859) 653-2401	https://www.bellehillsvenue.com/
The Prestant	720 York Street	Newport	Kentucky			Chapel & Church	Indoor	120		A former nondenominational church in downtown Newport turned event venue, with several rooms, a bridal suite, a chef's kitchen and a full bar.	kgosney@theprestant.com	859-393-3811	https://theprestant.com/
Wiedemann Hill Mansion	1102 Park Avenue	Newport	Kentucky			Historic Mansion & Estate	Indoor			A Local and National Historic Landmark mansion in the hills of Newport, built for entertaining and offered for weddings and intimate events.		(859) 689-3524	https://whillmansion.com/wedding-venue/
The Madison Event Center	700 Madison Avenue	Covington	Kentucky			Ballroom	Indoor			A downtown Covington event venue with four named rooms (Royale, Grande, Emerald and Crystal), linked to the Hotel Covington family of event spaces.	info@madisoneventcenter.com	(859) 261-1117	https://madisoneventcenter.com/
Historic Boone Tavern Hotel	100 Main St	Berea	Kentucky			Restaurant & Brewery	Indoor			A 1909 landmark hotel and restaurant steps from downtown Berea that hosts wedding receptions and celebrations in its restored event rooms.		1-859-985-3700	https://boonetavernhotel.com/
Cliffview Resort	455 Cliffview Rd	Campton	Kentucky			Hotel & Resort	Indoor & Outdoor	200		A Red River Gorge resort with a reception hall for up to 200, ceremonies on Overlook Point above the gorge, a lodge with an outdoor deck and luxury cabins for lodging.	reservations@cliffviewresort.com	606-668-6222	https://cliffviewresort.com/host-an-event/weddings/
The Overlook Event Center		Pikeville	Kentucky			Ballroom	Indoor	350		A 350-person event center in Bob Amos Park overlooking the Pikeville Cut Through and part of downtown, hosting weddings and receptions.	valerie@appwirelessarena.com	606-444-5500	https://overlookeventscenter.com/`,
  },
  {
    name: "Glasgow and Cave City: map fill",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Stable House Event Venue	750 Pritchardsville Road	Glasgow	Kentucky			Barn & Farm	Indoor & Outdoor	100	Simple	Nearly century-old horse barn with 9,000 square feet indoors, an outdoor grass arena, a bridal suite apartment and three published wedding packages.	stablehousevenue@gmail.com		https://www.stablehousevenue.com/
Grand Victorian Inn	5 Old Dixie Hwy	Park City	Kentucky			Hotel & Resort	Indoor & Outdoor	55		Historic bed and breakfast with a dining room for up to 55 and four outdoor ceremony spots, including a pergola walk and rolling pasture views.	grandvictorian@msn.com	270-590-1935	https://grandvictorianinnky.com/
Cave Area Conference Center	502 Mammoth Cave St	Cave City	Kentucky			Ballroom	Indoor			Convention centre by Interstate 65 with over 24,000 square feet of flexible indoor space, an in-house catering menu and a fully equipped bar for receptions.	events@cavecity.com	(270) 773-3131	https://cavecityconventioncenter.com/
Willow Oaks Golf Club	350 Country Club Rd	Glasgow	Kentucky			Country Club & Golf	Indoor & Outdoor			Greek Revival clubhouse above the 18th green with a grand ballroom, covered veranda, and indoor and outdoor spots for ceremony, reception or brunch.	info@willowoaksgolf.com		https://willowoaksgolf.com/
`,
  },
];

export default batches;
