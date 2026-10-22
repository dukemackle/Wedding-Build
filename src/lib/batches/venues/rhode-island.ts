import type { VenueBatch } from "@/lib/venue-batches";

// Rhode Island venue batches. Every row's State is "Rhode Island". Add new batches at the end.
const batches: VenueBatch[] = [
  {
    name: "Providence, Newport and coastal Rhode Island",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
The Towers	35 Ocean Rd	Narragansett	Rhode Island			Historic Mansion & Estate	Indoor	160		Stone landmark on Ocean Road in Narragansett whose third-floor Great Hall looks out over the Atlantic, with a bride's room and courtyard.	donna@thetowersri.com	401.782.2597	https://www.thetowersri.com/your-event/
Aldrich Mansion	836 Warwick Neck Ave	Warwick	Rhode Island			Historic Mansion & Estate	Indoor		Classic	Historic mansion estate on Warwick Neck with water views, a chapel for Catholic ceremonies and six-hour receptions.	tmaggiacomo@aldrichmansion.com	(401) 739-6850	https://www.aldrichmansion.com/weddings
Mount Hope Farm	250 Metacom Ave	Bristol	Rhode Island			Barn & Farm	Indoor & Outdoor			Nonprofit 127-acre farm in Bristol with a year-round historic barn and a seasonal waterfront Cove Cabin.	info@mounthopefarm.org	401-254-1745	https://www.mounthopefarm.org/weddings
Hotel Viking	1 Bellevue Ave	Newport	Rhode Island			Hotel & Resort	Indoor & Outdoor	250		Bellevue Avenue hotel dating from 1926, with the 250-guest Viking Ballroom, the original Bellevue Ballroom, the 1859 Kay Chapel and a courtyard.	sales@hotelviking.com	1-844-806-4895	https://www.hotelviking.com/weddings-and-celebrations
The Chanler at Cliff Walk	117 Memorial Blvd	Newport	Rhode Island			Historic Mansion & Estate	Indoor & Outdoor	200		Twenty-room mansion hotel on the Cliff Walk, booked as a whole-house wedding weekend, with up to 100 inside or larger tented parties on Cliff Lawn.		401-847-1300	https://www.thechanler.com/events
Greenvale Vineyards	582 Wapping Rd	Portsmouth	Rhode Island			Vineyard & Winery	Indoor & Outdoor			Sixth-generation farm and winery on the Sakonnet River, offering a restored stable plus vineyard and waterside tent sites.		(401) 847-3777	https://greenvale.com/wedding-and-private-events/
Weekapaug Inn	25 Spray Rock Rd	Westerly	Rhode Island			Beach & Coast	Indoor & Outdoor			Shoreline inn beside Weekapaug Pond with lawn ceremonies, a tent and a MeetingHouse whose tall windows face the pond and ocean.		855-679-2995	https://weekapauginn.com/weddings/
Spring House Hotel	52 Spring St	Block Island	Rhode Island			Beach & Coast	Indoor & Outdoor			Ocean-view Block Island hotel a ferry ride from the mainland, with lawn ceremonies, a seaside veranda, dining room and parlour for dancing.		401-466-5844	https://springhouseblockisland.com/weddings-events/
The Bohlin	20 Commercial Wharf	Newport	Rhode Island			Beach & Coast	Indoor & Outdoor			Marina venue at the Newport Yachting Center with a dockside terrace and a Sperry sailcloth tent among moored yachts.	info@bohlinnewport.com	401-314-2019	https://bohlinnewport.com`,
  },
  {
    name: "Rhode Island: Providence, Bristol and South County",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Kirkbrae Country Club	197 Old River Rd	Lincoln	Rhode Island			Country Club & Golf	Indoor & Outdoor	380		Blackstone Valley golf club with a par-72 course, renovated ballrooms, a tented patio and a seasonal bridal garden overlooking the valley.		401-333-1300	https://www.kirkbrae.com/
Galilee Beach Club	220 Sand Hill Cove Rd	Narragansett	Rhode Island			Ballroom	Indoor & Outdoor	150		Family-owned beach club at the Port of Galilee on the southern tip of Narragansett, with about 250 feet of sand where ceremonies can be held.		401-789-9675	https://www.galileebeachclub.com/
Herreshoff Marine Museum	1 Burnside St	Bristol	Rhode Island			Museum, Gallery & Rooftop	Indoor & Outdoor	300		Boatbuilding museum on Narragansett Bay in Bristol, with receptions in the Hall of Boats or a large waterfront tent and ceremonies on the pier or lawn.	events@herreshoff.org	401-396-5844	https://herreshoff.org/weddings/
Providence Public Library	150 Empire St	Providence	Rhode Island			Museum, Gallery & Rooftop	Indoor			Downtown Providence library with a marble staircase, galleries and reading rooms that can be booked for a wedding ceremony or catered reception.		401-455-8072	https://www.provlib.org/visit-us/reserve-rent-facilities/`,
  },
  {
    name: "Rhode Island: Newport, Providence, Warwick, South County and Block Island",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Rockville Weddings	61 Camp Yawgoog Rd	Rockville	Rhode Island			Mountain & Lodge	Indoor & Outdoor	300		Wooded 2,000-acre camp property in Hopkinton with pondside ceremony sites, an open-air dining lodge built in 2021 and cabins for overnight guests.	RockvilleWeddings@gmail.com	(401) 426-5568	https://www.rockvilleweddings.com
The Atlantic Inn	359 Roslyn Rd	New Shoreham	Rhode Island			Hotel & Resort	Indoor & Outdoor			Hilltop Block Island inn on six acres of lawns and gardens with water views and a veranda for ceremonies and receptions.		401.466.5883	https://www.atlanticinn.com
Warwick Country Club	394 Narragansett Bay Ave	Warwick	Rhode Island			Country Club & Golf	Indoor			Waterfront Warwick club on Narragansett Bay that hosts weddings and receptions with a bay backdrop.		(401) 739-0550	https://www.warwickcc.com
OceanCliff Hotel	65 Ridge Rd	Newport	Rhode Island			Beach & Coast	Indoor & Outdoor	200		Ten-acre oceanfront resort in Newport with a Grand Ballroom, a manicured ceremony lawn, a cocktail patio and 24 guest rooms.		401.619.7924	https://www.newportexperience.com/venues/oceancliff/
Regatta Place	5 Marina Plaza	Newport	Rhode Island			Beach & Coast	Indoor & Outdoor	180		Striped chandelier-lit tent in the Goat Island Marina, with a dockside patio and views across Newport Harbor.	hello@newportexperience.com	401.849.6683	https://www.newportexperience.com/venues/regatta-place/
Roger Williams Park Botanical Center	1000 Elmwood Ave	Providence	Rhode Island			Garden & Park	Indoor	150	Classic	Greenhouse conservatory in Roger Williams Park with a koi pond and 45-foot palms, plus a Mediterranean Room for dinner and dancing for 80.			https://rogerwilliamsparkevents.com/the-botanical-center/
Providence Athenaeum	251 Benefit St	Providence	Rhode Island			Museum, Gallery & Rooftop	Indoor			Nineteenth-century membership library on Benefit Street that can be rented for ceremonies, receptions and parties.	info@providenceathenaeum.org	401-421-6970	https://providenceathenaeum.org/about/building-rental/
Quidnessett Country Club	950 N Quidnessett Rd	North Kingstown	Rhode Island			Country Club & Golf	Indoor & Outdoor			Country club above Narragansett Bay on the North Kingstown and East Greenwich line with banquet rooms, a gazebo and indoor or tented outdoor ceremonies.		(401) 884-1100	https://quidnessett.com/weddings-events/
Kinney Bungalow	505 Point Judith Rd	Narragansett	Rhode Island			Barn & Farm	Indoor & Outdoor		Simple	Turn-of-the-century town-owned farmhouse in Narragansett with a grand hall looking over the farm and a courtyard for ceremonies, open May through October.	eventscoordinator@narragansettri.gov	401.788.2573	https://www.kinneybungalow.com/
Wannamoisett Country Club	96 Hoyt Ave	Rumford	Rhode Island			Country Club & Golf	Indoor & Outdoor	200		Rumford golf club with a ballroom and dance floor, options for an outdoor ceremony and only one wedding booked per day.			https://www.wannamoisett.com/Weddings
Harbor Lights	150 Gray St	Warwick	Rhode Island			Country Club & Golf	Indoor & Outdoor			Warwick Neck property combining a marina, golf course, pool and restaurant, with seaside ceremonies over Narragansett Bay.	info@harborlightsri.com	(401) 737-6353	https://harborlightsri.com/weddings/
The Reserve on Dorrance	60 Dorrance St	Providence	Rhode Island			Historic Mansion & Estate	Indoor	375		Former Federal Reserve building downtown with coffered ceilings, stained-glass windows and 1920s marble, hosting up to 375 in its main space.	sales@ghosp.com	(401) 585-8005	https://ghospitality.net/venues/the-reserve/
Lavender Waves Farm	3814 Commodore Perry Hwy	Wakefield	Rhode Island			Barn & Farm	Outdoor	150		Fourteen-acre farm in South Kingstown with a gazebo ringed by about 4,000 lavender plants, a reception tent and resident animals.			https://lavenderwavesfarm.com/weddings
Kinney Azalea Gardens	2391 Kingstown Rd	Kingston	Rhode Island			Garden & Park	Outdoor			Nonprofit sixteen-acre woodland garden and nursery with more than 500 azalea varieties and an arboretum, offering weddings and private events.	info@kfgfriends.org	(401) 218-0797	https://www.kinneyazaleagardens.com/
North Beach Clubhouse	170 Clarke Rd	Narragansett	Rhode Island			Beach & Coast	Indoor & Outdoor			Town-run clubhouse right on Narragansett Beach with panoramic Atlantic views and a wide deck over the sand.	eventscoordinator@narragansettri.gov	401.788.2573	https://www.northbeachclubhouse.com/
Newport Art Museum	76 Bellevue Ave	Newport	Rhode Island			Museum, Gallery & Rooftop	Indoor & Outdoor	400		Bellevue Avenue art museum offering galleries for dinners and a porch and grounds, which can be tented, for up to 400.	hello@newportartmuseum.org	(401) 848-8200	https://www.newportartmuseum.org/rentals`,
  },
];

export default batches;
