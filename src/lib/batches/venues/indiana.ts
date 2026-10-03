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
  {
    name: "Indianapolis and Fort Wayne: second batch",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
The Indianapolis Propylaeum	1410 N Delaware St	Indianapolis	Indiana			Historic / Estate	Indoor & Outdoor	100		1890s Victorian mansion on the National Register of Historic Places, with a carriage house for small weddings and a front lawn for larger receptions.			https://www.thepropylaeum.org/venue
502 East Event Centre	502 E Carmel Dr	Carmel	Indiana			Ballroom / Hotel	Indoor	1100		30,000 sq ft event centre north of Indianapolis with nine rooms and in-house catering by Jonathan Byrd's.	hello@experiencebyrds.com	317.843.1234	https://experiencebyrds.com/502-east
Crowne Plaza Indianapolis Downtown Union Station	123 W Louisiana St	Indianapolis	Indiana			Ballroom / Hotel	Indoor	700		Downtown hotel in the old Union Station, whose Grand Hall has a barrel-vaulted glass ceiling and stained-glass wheel windows, with rooms in restored Pullman cars.		(317) 236-7456	https://www.downtownindianapolisweddings.com/
The Sixpence		Zionsville	Indiana			Barn / Rustic	Indoor & Outdoor	300	Classic	Seventeen-acre property northwest of Indianapolis with an 8,000 sq ft barn, a wildflower garden and overnight lodging in its farmhouse, The Homestead.			https://www.thesixpence.com/
Traders Point Creamery	9101 Moore Rd	Zionsville	Indiana			Barn / Rustic	Indoor & Outdoor			Organic dairy farm with a restaurant, where weddings use the Red Barn, the Roost, a garden lawn and deck.		(317) 733-1700	https://www.traderspointcreamery.com/events/
Parkview Field	1301 Ewing St	Fort Wayne	Indiana			Garden / Outdoor	Indoor & Outdoor	220		Downtown minor-league ballpark with suite-level lounges, a rooftop club and an amphitheatre that can be set up for ceremonies.		260.482.6400	https://www.parkviewfield.com/event-spaces
PFW International Ballroom	2101 E Coliseum Blvd	Fort Wayne	Indiana			Ballroom / Hotel	Indoor		Simple	8,325 sq ft ballroom in Walb Union on the Purdue Fort Wayne campus, split into two salons that can be rented separately or together.		260-481-6100	https://www.pfw.edu/special-events/venue-options/walb-union
Clyde Theatre	1808 Bluffton Rd	Fort Wayne	Indiana			Historic / Estate	Indoor			Art Deco cinema from 1951, renovated in 2017-18 as a music venue, with a main hall and the smaller Quimby Hall for private events.		(260) 747-0989	https://clydetheatre.com/private-events/
Joseph Decuis	191 N Main St	Roanoke	Indiana			Restaurant / Vineyard	Indoor & Outdoor	150		Farm-to-table restaurant in a small town southwest of Fort Wayne, with its own farm, a farmstead inn and an inn in town for wedding guests.	info@josephdecuis.com	(260) 672-1715	https://www.josephdecuis.com/weddings/
Lakeside Occasions	2595 S 625 W	Topeka	Indiana			Barn / Rustic	Indoor & Outdoor	250	Simple	Restored 1880s dairy barn on lakeside grounds in northern Indiana's Amish country, with a silo, grain-bin bar and gazebo.		(260) 585-3211	https://lakesideoccasions.com/`,
  },
];

export default batches;
