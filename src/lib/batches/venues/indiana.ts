import type { VenueBatch } from "@/lib/venue-batches";

// Indiana venue batches. Every row's State is "Indiana". Add new batches at the end.
const batches: VenueBatch[] = [
  {
    name: "Indianapolis and Fort Wayne",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
The Indiana Roof Ballroom	140 W. Washington St.	Indianapolis	Indiana			Ballroom / Hotel	Indoor	1500		Downtown ballroom renovated with new chandeliers, lighting and seating, hosting couples since 1977.		317.236.1870	https://www.indianaroof.com/
Newfields	4000 Michigan Road	Indianapolis	Indiana			Garden / Outdoor	Indoor & Outdoor	375		Art museum campus with the Lilly House terrace, a formal garden for ceremonies and an events pavilion seating 375.		317-923-1331	https://discovernewfields.org/event-rentals/weddings-and-social-gatherings
Bottleworks Hotel	850 Massachusetts Avenue	Indianapolis	Indiana			Ballroom / Hotel	Indoor & Outdoor			Mass Ave hotel in a restored building, with an outdoor Gallery Courtyard, a terrazzo-floored Library and speakeasy-style Club Room.	info@bottleworkshotel.com	317-556-1234	https://www.bottleworkshotel.com/weddings
Mustard Seed Gardens	77 Metsker Lane	Noblesville	Indiana			Barn / Rustic	Indoor & Outdoor	250	Classic	Three acres with a farmhouse, barn with original hardwood floors, a gable, patio and century-old maple trees.	hello@mustardseedgardens.com	317.776.2300	https://www.mustardseedgardens.com/
Conner Prairie	13400 Allisonville Road	Fishers	Indiana			Historic / Estate	Indoor & Outdoor			Living-history museum offering six sites, including the Prairie House, Featherston Barn and the Bluffs, with a venue coordinator.	catering@connerprairie.org	317-776-6000	https://www.connerprairie.org/weddings
Daniel's Vineyard	9061 N 700 W	McCordsville	Indiana			Restaurant / Vineyard	Indoor & Outdoor			Family-owned winery on 22 acres of vines northeast of Indianapolis with several event spaces.		(317) 248-5222	https://www.danielsvineyard.com/private-events
The Sycamore at Mallow Run	7070 West Whiteland Road	Bargersville	Indiana			Restaurant / Vineyard	Indoor & Outdoor			Three event spaces beside the Mallow Run Winery family farm and vineyards south of Indianapolis.	info@sycamoreevents.com	317.530.6463	https://www.sycamoreevents.com/
The History Center	302 East Berry Street	Fort Wayne	Indiana			Historic / Estate	Indoor	160		Museum in Fort Wayne's former city hall, where the old council chambers now serve as the Shields Room for receptions.		260.426.2882	https://fwhistorycenter.org/rentals
Foellinger-Freimann Botanical Conservatory	1100 South Calhoun Street	Fort Wayne	Indiana			Garden / Outdoor	Indoor & Outdoor			Downtown conservatory with three indoor gardens, an outdoor Terrace Garden and landscaped grounds.		260-427-6440	https://www.cityoffortwayne.in.gov/519/Rentals`,
  },
];

export default batches;
