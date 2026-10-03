import type { VenueBatch } from "@/lib/venue-batches";

// Rhode Island venue batches. Every row's State is "Rhode Island". Add new batches at the end.
const batches: VenueBatch[] = [
  {
    name: "Providence, Newport and coastal Rhode Island",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
The Towers	35 Ocean Rd	Narragansett	Rhode Island			Historic / Estate	Indoor	160		Stone landmark on Ocean Road in Narragansett whose third-floor Great Hall looks out over the Atlantic, with a bride's room and courtyard.	donna@thetowersri.com	401.782.2597	https://www.thetowersri.com/your-event/
Aldrich Mansion	836 Warwick Neck Ave	Warwick	Rhode Island			Historic / Estate	Indoor		Classic	Historic mansion estate on Warwick Neck with water views, a chapel for Catholic ceremonies and six-hour receptions.	tmaggiacomo@aldrichmansion.com	(401) 739-6850	https://www.aldrichmansion.com/weddings
Mount Hope Farm	250 Metacom Ave	Bristol	Rhode Island			Barn / Rustic	Indoor & Outdoor			Nonprofit 127-acre farm in Bristol with a year-round historic barn and a seasonal waterfront Cove Cabin.	info@mounthopefarm.org	401-254-1745	https://www.mounthopefarm.org/weddings
Hotel Viking	1 Bellevue Ave	Newport	Rhode Island			Ballroom / Hotel	Indoor & Outdoor	250		Bellevue Avenue hotel dating from 1926, with the 250-guest Viking Ballroom, the original Bellevue Ballroom, the 1859 Kay Chapel and a courtyard.	sales@hotelviking.com	1-844-806-4895	https://www.hotelviking.com/weddings-and-celebrations
The Chanler at Cliff Walk	117 Memorial Blvd	Newport	Rhode Island			Historic / Estate	Indoor & Outdoor	200		Twenty-room mansion hotel on the Cliff Walk, booked as a whole-house wedding weekend, with up to 100 inside or larger tented parties on Cliff Lawn.		401-847-1300	https://www.thechanler.com/events
Greenvale Vineyards	582 Wapping Rd	Portsmouth	Rhode Island			Restaurant / Vineyard	Indoor & Outdoor			Sixth-generation farm and winery on the Sakonnet River, offering a restored stable plus vineyard and waterside tent sites.		(401) 847-3777	https://greenvale.com/wedding-and-private-events/
Weekapaug Inn	25 Spray Rock Rd	Westerly	Rhode Island			Beach / Waterfront	Indoor & Outdoor			Shoreline inn beside Weekapaug Pond with lawn ceremonies, a tent and a MeetingHouse whose tall windows face the pond and ocean.		855-679-2995	https://weekapauginn.com/weddings/
Spring House Hotel	52 Spring St	Block Island	Rhode Island			Ballroom / Hotel	Indoor & Outdoor			Ocean-view Block Island hotel a ferry ride from the mainland, with lawn ceremonies, a seaside veranda, dining room and parlour for dancing.		401-466-5844	https://springhouseblockisland.com/weddings-events/
The Bohlin	20 Commercial Wharf	Newport	Rhode Island			Beach / Waterfront	Indoor & Outdoor			Marina venue at the Newport Yachting Center with a dockside terrace and a Sperry sailcloth tent among moored yachts.	info@bohlinnewport.com	401-314-2019	https://bohlinnewport.com`,
  },
  {
    name: "Rhode Island: Providence, Bristol and South County",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Kirkbrae Country Club	197 Old River Rd	Lincoln	Rhode Island			Ballroom / Hotel	Indoor & Outdoor	380		Blackstone Valley golf club with a par-72 course, renovated ballrooms, a tented patio and a seasonal bridal garden overlooking the valley.		401-333-1300	https://www.kirkbrae.com/
Galilee Beach Club	220 Sand Hill Cove Rd	Narragansett	Rhode Island			Beach / Waterfront	Indoor & Outdoor	150		Family-owned beach club at the Port of Galilee on the southern tip of Narragansett, with about 250 feet of sand where ceremonies can be held.		401-789-9675	https://www.galileebeachclub.com/
Herreshoff Marine Museum	1 Burnside St	Bristol	Rhode Island			Beach / Waterfront	Indoor & Outdoor	300		Boatbuilding museum on Narragansett Bay in Bristol, with receptions in the Hall of Boats or a large waterfront tent and ceremonies on the pier or lawn.	events@herreshoff.org	401-396-5844	https://herreshoff.org/weddings/
Providence Public Library	150 Empire St	Providence	Rhode Island			Historic / Estate	Indoor			Downtown Providence library with a marble staircase, galleries and reading rooms that can be booked for a wedding ceremony or catered reception.		401-455-8072	https://www.provlib.org/visit-us/reserve-rent-facilities/`,
  },
];

export default batches;
