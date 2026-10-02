import type { VenueBatch } from "@/lib/venue-batches";

// Michigan venue batches. Every row's State is "Michigan". Add new batches at the end.
const batches: VenueBatch[] = [
  {
    name: "Metro Detroit and Grand Rapids",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Meadow Brook Hall	350 Estate Dr	Rochester	Michigan			Historic / Estate	Indoor & Outdoor		Luxury	Tudor-revival mansion built 1926-1929 on the Oakland University campus, with a two-storey ballroom, a grand staircase and formal gardens with a climate-controlled garden tent.	mbhevent@oakland.edu	(248) 364-6200	https://www.meadowbrookhall.org/weddings
The Roostertail	100 Marquette Dr	Detroit	Michigan			Beach / Waterfront	Indoor	800		Family-run riverfront event house on the Detroit River since 1958, with the Marine Room surrounded by water on three sides and the larger Palm River Room facing the skyline.	info@roostertail.com	(313) 822-1234	https://www.roostertail.com/
Royal Park Hotel	600 E University Dr	Rochester	Michigan			Ballroom / Hotel	Indoor & Outdoor	550		Boutique hotel of 143 rooms beside the Paint Creek Trail in downtown Rochester, with a grand ballroom, a Belgian glass conservatory over a fountain garden and an open-air pavilion.		(248) 652-2600	https://www.royalparkhotelmi.com/weddings-and-social-events.htm
The Townsend Hotel	100 Townsend St	Birmingham	Michigan			Ballroom / Hotel	Indoor			Downtown Birmingham hotel whose ballroom divides into four salons, with the Tea Lobby, Clancy and Regency rooms for smaller parts of the day and guest room blocks upstairs.	groupres@townsendhotel.com		https://www.townsendhotel.com/weddings
The War Memorial	32 Lake Shore Dr	Grosse Pointe Farms	Michigan			Beach / Waterfront	Indoor	450		Nonprofit on the 1910 Alger Estate on Lake St. Clair, pairing the Italian Renaissance Alger House for small groups with a lakefront ballroom and in-house catering.		(313) 881-7511	https://www.warmemorial.org/weddings
The Whitney	4421 Woodward Ave	Detroit	Michigan			Restaurant / Vineyard	Indoor & Outdoor	350		Restaurant inside the 1894 pink-granite David Whitney Jr. mansion in Midtown, using its many dining rooms and a summer garden for ceremonies and receptions.	events@thewhitney.com	(313) 832-5700	https://www.thewhitney.com/private-dining-1
Cobblestone Farm	2781 Packard Rd	Ann Arbor	Michigan			Barn / Rustic	Indoor	190		City-run historic farm park whose three-storey oak timber-frame barn has a loft, a warming kitchen, climate control and changing rooms.	cfinfo@a2gov.org	(734) 794-6230	https://www.a2gov.org/parks-and-recreation/parks-and-places/cobblestone-farm/
Ford Piquette Avenue Plant	461 Piquette Ave	Detroit	Michigan			Historic / Estate	Indoor			National Historic Landmark factory from 1904 where the Model T was first built, now a car museum that hosts receptions among its early Fords.	gingerzb@fordpiquetteplant.org	(313) 872-8759	https://www.fordpiquetteplant.org/private-rentals/
Frutig Farms: The Valley	7650 Scio Church Rd	Ann Arbor	Michigan			Barn / Rustic	Indoor & Outdoor			Family-owned farm west of Ann Arbor with a restored 19th-century barn, rented for the whole weekend with its outbuildings and outdoor ceremony spaces.		(313) 657-6882	https://www.frutigfarms.com/
Barn 1888	1888 128th Ave	Hopkins	Michigan			Barn / Rustic	Indoor & Outdoor	200		Restored 1888 barn on 20 acres between Grand Rapids and Kalamazoo, with an outdoor chapel garden, a lower level for dancing and a pavilion with a stone fireplace.	barn1888events@gmail.com	(616) 446-5747	https://www.barn1888.com/
The Goei Center	818 Butterworth SW	Grand Rapids	Michigan			Historic / Estate	Indoor	400		Event hall in the former Kindel Furniture building on the West Side, with a 14,000 sq ft main hall, the separate Kindel Room and an in-house bar.	info@thegoeicenter.com		https://www.thegoeicenter.com/
Amway Grand Plaza	187 Monroe Ave NW	Grand Rapids	Michigan			Ballroom / Hotel	Indoor			Downtown hotel by the Grand River with several ballrooms including the Imperial, Ford and Pantlind, an on-site salon and spa, and guest rooms for out-of-town guests.	weddings@ahchospitality.com	(616) 776-6400	https://www.amwaygrand.com/weddings
Hydrangea Blu Barn	5716 11 Mile Rd NE	Rockford	Michigan			Barn / Rustic	Indoor & Outdoor			Barn venue north of Grand Rapids offering barn, barn-and-tent and full-weekend packages, with a bridal suite and groomsmen quarters on site.	events@hydrangeablubarn.com	(616) 255-6716	https://www.hydrangeablubarn.com/weddings
Grand Rapids Public Museum	272 Pearl St NW	Grand Rapids	Michigan			Historic / Estate	Indoor	270	Simple	Riverside history museum whose first-floor galleria under a hanging fin whale skeleton hosts receptions, with ceremonies in its theatre or planetarium.	tjapkes@grpm.org	(616) 929-1718	https://www.grpm.org/rent/`,
  },
];

export default batches;
