import type { VenueBatch } from "@/lib/venue-batches";

// Missouri venue batches. Every row's State is "Missouri". Add new batches at the end.
const batches: VenueBatch[] = [
  {
    name: "Kansas City and St. Louis",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
The Guild KC	1621 Locust St	Kansas City	Missouri			Ballroom / Hotel	Indoor & Outdoor	250		A converted automotive warehouse in Kansas City with a 6,500 sq ft hall under exposed trusses and a 5,000 sq ft courtyard garden.	info@theguildkc.com	816-471-8550	https://theguildkc.com/weddings/
Loose Mansion	101 E Armour Blvd	Kansas City	Missouri			Historic / Estate	Indoor			A restored 1907 mansion near Armour Boulevard with about 15,000 sq ft of rooms, carved mahogany woodwork, fireplaces and an on-site bed and breakfast.			https://loosemansion.com/
The Elms Hotel & Spa	401 Regent St	Excelsior Springs	Missouri			Ballroom / Hotel	Indoor & Outdoor			A historic spa hotel open for more than 130 years, with two ballrooms, a garden gazebo for ceremonies and a 28,000 sq ft spa.		816-630-5500	https://www.elmshotelandspa.com/weddings.htm
White Iron Ridge	815 State Route 92 Hwy	Smithville	Missouri			Barn / Rustic	Indoor & Outdoor		Classic	A gambrel-roofed event barn on the edge of Smithville with arched ceilings, iron chandeliers and overnight guest suites on site.	amanda@whiteironridge.com	816-866-8996	https://whiteironridge.com/investment-wedding
Powell Gardens	1609 NW US Highway 50	Kingsville	Missouri			Garden / Outdoor	Indoor & Outdoor	200	Classic	A botanical garden east of Kansas City with a chapel, a lakeside Grand Hall and a Missouri Barn among its themed gardens.	events@powellgardens.org	816-697-2600	https://powellgardens.org/weddings/
Longview Estate	1200 SW Longview Park Dr	Lee's Summit	Missouri			Historic / Estate	Indoor & Outdoor	250		R.A. Long's 1914 mansion on more than 10 acres, with a lawn and sunken garden for ceremonies and a conservatory for receptions.		816-761-6669	https://www.longviewmansion.com/
Chandler Hill Vineyards	596 Defiance Rd	Defiance	Missouri			Restaurant / Vineyard	Indoor & Outdoor	250		A Missouri wine-country winery with a tasting room and covered deck overlooking its vines and the surrounding hills.	brooke@chandlerhillvineyards.com	636-798-2675	https://www.chandlerhillvineyards.com/weddings
The Cheshire	6300 Clayton Rd	St. Louis	Missouri			Ballroom / Hotel	Indoor	250	Classic	A boutique hotel by Forest Park whose upstairs reception room keeps the building's original vaulted, dark-beamed ceiling.	cheshire@cheshirestl.com	314-647-7300	https://www.cheshirestl.com/weddings-events/cheshire-weddings
The Noble	3611 S Grand Blvd	St. Louis	Missouri			Historic / Estate	Indoor	220		A 1928 South Grand bank building restored to its Art Deco detail, keeping the original vault, columns and chandeliers.	info@culinarycanvasstl.com	314-252-8130	https://thenoblestl.com/weddings/
The Hawthorn	2231 Washington Ave	St. Louis	Missouri			Ballroom / Hotel	Indoor	500		A downtown event hall of over 10,000 sq ft near City Stadium, with two full bars and four suites with private showers.	events@thehawthornstl.com	314-887-0877	https://www.thehawthornstl.com/
Missouri Botanical Garden	4344 Shaw Blvd	St. Louis	Missouri			Garden / Outdoor	Indoor & Outdoor			A 79-acre botanical garden in south St. Louis with indoor and outdoor ceremony and reception sites booked through its in-house caterer.		314-577-0200	https://www.missouribotanicalgarden.org/events-classes/private-events-rentals`,
  },
  {
    name: "Kansas City and St. Louis: second batch",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
The Bauer	115 W 18th St	Kansas City	Missouri			Historic / Estate	Indoor			An event floor at the top of the former Bauer Machine Works building in the Crossroads Arts District, with a flexible open plan and historic detail.	info@thebrideandthebauer.com	816-984-8533	https://www.thebauereventspace.com/
The Abbott	1901 Cherry St	Kansas City	Missouri			Ballroom / Hotel	Indoor & Outdoor	500		A Crossroads Arts District industrial building with exposed brick and high ceilings, seating up to 500, plus an open-air rooftop terrace with skyline views.		816-332-0274	https://www.theabbottvenue.com/
Nelson-Atkins Museum of Art	4525 Oak St	Kansas City	Missouri			Historic / Estate	Indoor & Outdoor	450	Luxury	An art museum whose 40-foot-high Kirkwood Hall, lined with twelve black-and-white marble columns and tapestries, seats 450, with Rozzelle Court and a modern lobby too.	eventrentals@nelson-atkins.org	816-751-1234	https://nelson-atkins.org/events/event-rental/
Hawthorne House	6008 NW Bell Rd	Parkville	Missouri			Garden / Outdoor	Indoor & Outdoor			A Northland wedding venue running since 1997, with a garden gazebo for outdoor ceremonies, an indoor chapel and a reception hall.	support@thehawthornehouse.com	816-384-3630	https://www.thehawthornehouse.com/
Feasts of Fancy	1427 W 9th St	Kansas City	Missouri			Historic / Estate	Indoor & Outdoor	250		A caterer-run event space in the Historic West Bottoms, open since 2001, with a dance floor and a private walled courtyard garden.			https://feastsoffancy.com/
UNION	1721 Baltimore Ave	Kansas City	Missouri			Historic / Estate	Indoor	200		A 7,500 sq ft Crossroads building put up in 1929 as a film-processing centre, with exposed brick, open beams and wood floors, rented by the day.	party@union.828venues.com	913-213-3494	https://union.828venues.com/
Casa Loma Ballroom	3354 Iowa Ave	St. Louis	Missouri			Ballroom / Hotel	Indoor	850		A south St. Louis ballroom opened in 1927 near Cherokee Street, known for its 5,000 sq ft floating dance floor and still running public dance nights.	pvbrannon@aol.com	314-282-2258	https://www.casalomaballroom.com/
Hotel Saint Louis	705 Olive St	St. Louis	Missouri			Ballroom / Hotel	Indoor & Outdoor			A downtown Autograph Collection hotel offering a ballroom and a rooftop pool terrace for receptions, with a suite for the couple on the night.	stleventsales@hotelsaintlouis.com	314-241-4300	https://www.hotelsaintlouis.com/weddings
Moonrise Hotel	6177 Delmar Blvd	St. Louis	Missouri			Ballroom / Hotel	Indoor & Outdoor			A space-themed boutique hotel on the Delmar Loop with Apollo and Gemini event rooms, a rooftop garden bar and an eighth-floor room under a solar-panel roof.	Catering@MoonriseHotel.com	314-721-1111	https://moonrisehotel.com/meetings-events/weddings/
St. Louis Union Station	1820 Market St	St. Louis	Missouri			Ballroom / Hotel	Indoor			A restored downtown railway terminal, now a Curio Collection hotel, with an arched, mosaic Grand Hall, four ballrooms and the glass-roofed Midway train shed.	info@stlouisunionstation.com	314-923-3900	https://www.stlouisunionstation.com/private-events
Defiance Ridge Vineyards	2711 S Hwy 94	Defiance	Missouri			Restaurant / Vineyard	Indoor & Outdoor			A winery with its own winemaker and kitchen on Highway 94 in St. Charles County wine country, open year-round with indoor and outdoor event space.	info@defianceridge.com	636-798-2288	https://www.defianceridgevineyards.com/weddings-events
The Sheldon	3648 Washington Blvd	St. Louis	Missouri			Historic / Estate	Indoor	350		A Grand Center concert hall and gallery building with a 712-seat hall for ceremonies, a beamed-ceiling ballroom with a stage and a room looking toward the Cathedral Basilica.		314-533-9900	https://www.thesheldon.org/venue-rentals/`,
  },
];

export default batches;
