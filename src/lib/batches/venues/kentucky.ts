import type { VenueBatch } from "@/lib/venue-batches";

// Kentucky venue batches. Every row's State is "Kentucky". Add new batches at the end.
const batches: VenueBatch[] = [
  {
    name: "Louisville and Lexington: second batch",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Galt House Hotel	140 N Fourth St	Louisville	Kentucky			Ballroom / Hotel	Indoor	1600		Riverfront downtown hotel on the Ohio River with more than 40 event spaces, a 23,000 sq ft Grand Ballroom and guest rooms on site.	info-galthotel@galthotel.com	502-589-5200	https://www.galthouse.com/weddings/
Whitehall	3110 Lexington Rd	Louisville	Kentucky			Historic / Estate	Indoor & Outdoor	250		Antebellum mansion furnished as it was in 1909, with a formal garden for ceremonies and a garden terrace for tented receptions.		(502) 897-2944	https://www.historicwhitehall.org/weddings
Farmington Historic Home	3033 Bardstown Rd	Louisville	Kentucky			Historic / Estate	Indoor & Outdoor	300	Simple	1816 Federal-style Speed family home on 18 acres in the Highlands, with formal gardens, a great lawn and a 4,800 sq ft open-air pavilion.	Michael@historichomes.org	502-452-9920	https://visitfarmington.org/rentals/
Frazier Kentucky History Museum	829 W Main St	Louisville	Kentucky			Historic / Estate	Indoor			History museum on West Main Street's Museum Row that rents its galleries and spaces, up to a full buyout, for weddings.	info@fraziermuseum.org	(502) 753-5663	https://www.fraziermuseum.org/rent-the-museum
The Barn at Magnolia Farm	6701 Briar Ridge Rd	Mount Eden	Kentucky			Barn / Rustic	Indoor & Outdoor		Simple	Family-run heated and air-conditioned rustic barn on a 20-acre former herb farm about 25 minutes from Louisville.		(855) 949-4022	https://www.thebarnatmagnoliafarm.com/
The Barn at Springhouse Gardens	185 W Catnip Hill Rd	Nicholasville	Kentucky			Barn / Rustic	Indoor & Outdoor	80		Restored tobacco barn with a loft beside a garden centre south of Lexington, with a gazebo, lawn and farmhouse on the grounds.	thebarn@springhousegardens.com	859-327-9849	https://www.springhousegardens.com/the-barn
Limestone Hall	215 W Main St	Lexington	Kentucky			Historic / Estate	Indoor	300	Simple	Third floor of downtown Lexington's 1898 Richardsonian Romanesque courthouse, with two event rooms joined by a domed rotunda.	hello@limestonehall.com	859-230-5365	https://www.limestonehall.com/
The Carrick House	312 N Limestone	Lexington	Kentucky			Historic / Estate	Indoor			Nineteenth-century mansion on North Limestone joined to a glass-roofed banquet space, run by Lundy's catering.	summer@lundyscatering.com	859-255-0717	https://www.carrickhouse.com/
Rotherwood Events	3565 Paris Rd	Winchester	Kentucky			Historic / Estate	Indoor & Outdoor			1887 Victorian estate east of Lexington with a restored mansion, a Grand Carriage Hall barn for receptions and outdoor ceremony sites.	info@rotherwoodevents.com	(859) 513-3498	https://www.rotherwoodevents.com/
The Manchester Reserve	903 Manchester St	Lexington	Kentucky			Historic / Estate	Indoor			Exposed-brick hall with large windows and chandeliers on Manchester Street in Lexington's Distillery District.			https://www.themanchesterreserve.com/`,
  },
  {
    name: "Louisville and Lexington: third batch",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Mellwood Art Center	1860 Mellwood Ave	Louisville	Kentucky			Ballroom / Hotel	Indoor & Outdoor	650	Classic	Former 1904 Fischer meat-packing plant turned artists' studio complex, with five event rooms led by the 12,500-square-foot Van Gogh Ballroom and its courtyard.		(502) 895-3650	https://www.mellwoodartcenter.com/events-portal/
Kentucky Derby Museum	704 Central Ave	Louisville	Kentucky			Historic / Estate	Indoor & Outdoor	350		Racing museum at the gates of Churchill Downs, with a domed Great Hall, a glass-doored Oaks Garden Terrace and a second-floor gallery whose balcony overlooks the track.		(502) 637-1111	https://www.derbymuseum.org/rent/weddings
Waterfront Botanical Gardens	1435 Frankfort Ave	Louisville	Kentucky			Garden / Outdoor	Indoor & Outdoor	220		Riverside botanical garden between Frankfort Avenue and River Road, with a glass-walled education centre, patios over Beargrass Creek, a water wall and plazas for tented receptions.			https://waterfrontgardens.org/rentals/
Harper Hall	177 N Upper St	Lexington	Kentucky			Ballroom / Hotel	Indoor	295	Simple	Two-storey downtown hall a block from Gratz Park, with an open first floor for ceremonies and an open second floor for receptions.	info@HarperHallLex.com	(859) 492-1473	https://www.harperhalllex.com/
Holly Hill Events at Fasig-Tipton	2400 Newtown Pike	Lexington	Kentucky			Barn / Rustic	Indoor & Outdoor	300		Event spaces on the grounds of the Fasig-Tipton Thoroughbred auction company, including a fieldstone-and-plank Seattle Slew hall, a barn-sided Kentucky Room opening onto a paddock and outdoor pavilions.	events@hollyhillinn.com	(859) 685-0330	https://www.hollyhilleventsky.com/venues
The Gillespie	421 W Market St	Louisville	Kentucky			Ballroom / Hotel	Indoor	400		Former downtown bank turned 24,000-square-foot ballroom with marble walls and floors, 40-foot painted ceilings, a chandeliered mezzanine and the original vault-era gates and mail chute.	info@thegillespie.com	(502) 584-8080	https://www.thegillespie.com/grandballroom
Heartland of Versailles	1470 Clifton Rd	Versailles	Kentucky			Historic / Estate	Indoor & Outdoor	220		Victorian house from around 1886 on 30 wooded acres west of Versailles, listed on the National Register in 2018, with tented lawn receptions, patios and dressing rooms.	laura@heartlandofversailles.com	(859) 396-1505	https://heartlandofversailles.com/`,
  },
  {
    name: "Bowling Green, Owensboro and central Kentucky: fourth batch",
    tsv: `Name	City	State	Website
Terrapin Hill Farm	Harrodsburg	Kentucky	https://www.terrapinhillfarm.com/
South Union Shaker Village	Auburn	Kentucky	https://southunionshakervillage.com/weddings-events-at-susv/
Green Turtle Bay Resort & Marina	Grand Rivers	Kentucky	https://www.greenturtlebay.com/celebrations
Queenslake	Georgetown	Kentucky	https://queenslake.com/
Chenault Vineyards	Richmond	Kentucky	https://www.chenaultvineyards.com/
Lynwood Estate	Richmond	Kentucky	https://www.lynwoodestate.com/
The Whitestone Barn	Bowling Green	Kentucky	https://www.thewhitestonebarn.com/
The Barn at Twin Creeks	Auburn	Kentucky	https://www.thebarnattwincreeks.com/
Naimoli Estate	Hopkinsville	Kentucky	https://www.naimoliestate.com/
Windridge Country Club	Owensboro	Kentucky	https://www.windridgecc.com/
Shelby Hills Farm	Shelbyville	Kentucky	https://www.shelbyhillsfarm.com/`,
  },
  {
    name: "Bowling Green, Danville and Murray: fifth batch",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Ironwood Farm	455 Old Richardsville Rd	Bowling Green	Kentucky			Historic / Estate	Indoor & Outdoor			Pre-Civil War estate built in 1852 on a 500-acre farm above the Barren River, with a restored farmhouse, a thoroughbred horse barn and rolling lawns for ceremonies.	jen@ironwoodofbg.com	270-535-2744	https://ironwoodofbg.com/
The Potter Farm Events	1100 Rich Pond Rd	Bowling Green	Kentucky			Barn / Rustic	Indoor & Outdoor	300	Simple	Historic barn on 20 acres south of Bowling Green with an outdoor ceremony lawn, a bridal cottage, groom's quarters and a large parking lot.	tonya@thepotterfarmevents.com	(270) 784-1632	https://thepotterfarmevents.com/weddings/
Highland Stables	1301 B Hunts Ln	Bowling Green	Kentucky			Barn / Rustic	Indoor & Outdoor			Former horse-boarding stable on a 168-acre family farm ten minutes from downtown, now a full-time wedding venue with indoor and outdoor ceremony spaces and a bridal suite.	info@highlandstablesbg.com	270.393.2111	https://www.highlandstablesbg.com/
The Barn at White Oaks	675 Grant Rd	Murray	Kentucky			Barn / Rustic	Indoor & Outdoor			All-white custom-built barn on 28 acres of farmland in Murray, with a clubhouse, several ceremony sites and separate bridal and groom's suites.	info@thebarnatwhiteoaks.com		https://www.thebarnatwhiteoaks.com/
Bluegrass Wedding Barn	3050 Mitchellsburg Rd	Danville	Kentucky			Barn / Rustic	Indoor & Outdoor	250		Barn on 76 acres of a Bluegrass horse farm, run as an all-inclusive wedding experience with an on-site team and a floor plan designed around each couple.	events@bluegrassweddingbarn.com	(859) 324-1424	https://www.bluegrassweddingbarn.com/
Driscoll Estate	3301 Taylorsville Rd	Taylorsville	Kentucky			Garden / Outdoor	Indoor & Outdoor	300		33 acres of Kentucky hills about half an hour from Louisville, with a reception hall, a manor with themed guest rooms, a patio and a pool.	driscollestate@gmail.com	(502) 905-2755	https://www.driscollestate.com/louisville-wedding-venue`,
  },
];

export default batches;
