import type { VenueBatch } from "@/lib/venue-batches";

// Iowa venue batches. Every row's State is "Iowa". Add new batches at the end.
const batches: VenueBatch[] = [
  {
    name: "Des Moines, Ames, Cedar Rapids, Iowa City, Davenport and Dubuque",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Rollins Mansion	2801 Fleur Dr	Des Moines	Iowa			Historic / Estate	Indoor & Outdoor			A 1920s mansion on landscaped grounds near Gray's Lake, with a garden level, great hall, terrace and a separate cottage for getting ready.	info@rollinsmansion.com	515-657-7288	https://www.rollinsmansion.com/weddings
The Keller Brick Barn	25967 T Ave	Dallas Center	Iowa			Barn / Rustic	Indoor & Outdoor	175	Simple	A climate-controlled 1930 brick barn on a family farm west of Des Moines, with a landscaped courtyard, gardens and a fire pit.	kellerbrickbarn@gmail.com	515-897-9828	https://www.kellerbrickbarn.com/weddings
Glen Oaks Country Club	1401 Glen Oaks Dr	West Des Moines	Iowa			Ballroom / Hotel	Indoor & Outdoor	300		A country club clubhouse with a ballroom, covered veranda and a lawn overlooking the golf course for ceremonies.		515-221-9000	https://www.glenoakscc.com/weddings
Bash Events & Catering	1312 Locust St	Des Moines	Iowa			Ballroom / Hotel	Indoor			A multi-level downtown event hall with bridal and groom suites, in-house catering and bar, and tables, chairs and linens included.	info@bashdsm.com	515-330-2848	https://www.bashdsm.com/weddings
Jasper Winery	2400 George Flagg Pkwy	Des Moines	Iowa			Restaurant / Vineyard				An urban winery with a tasting room and events space close to downtown Des Moines that also hosts weddings and private events.	info@jasperwinery.com	515-282-9463	https://www.jasperwinery.com/
The HarMac	411 6th Ave SE	Cedar Rapids	Iowa			Historic / Estate	Indoor & Outdoor			A 1922 hardware warehouse downtown turned industrial-style venue with two adjoining rooms, a bar, getting-ready suites and a rooftop.	hello@theharmac.com	319-895-2429	https://theharmac.com/
Reiman Gardens	1407 University Blvd	Ames	Iowa			Garden / Outdoor	Indoor & Outdoor		Simple	Iowa State University's botanical garden, with a conservatory, a garden room and outdoor ceremony spaces among its flower beds.	rentrg@iastate.edu	515-294-6356	https://reimangardens.com/weddings
The Celebration Farm	4696 Robin Woods Ln NE	Iowa City	Iowa			Barn / Rustic	Indoor & Outdoor	450		A farm north of Iowa City with a Double Round Barn, a timber-frame barn and an outdoor amphitheatre for ceremonies.	events@thecelebrationfarm.com	319-800-9212	https://thecelebrationfarm.com/
Wooden Wheel Vineyards	1179 Hwy 92	Keota	Iowa			Restaurant / Vineyard	Indoor & Outdoor	300		A restored 1860s barn on a vineyard in south-east Iowa, with a bridal suite in the loft, a patio, an arbor and a wedding gazebo.		641-636-2180	https://woodenwheelvineyards.com/weddings
Renwick Mansion	901 Tremont Ave	Davenport	Iowa			Historic / Estate	Indoor & Outdoor	150		An Italian Revival villa on four acres in Davenport with a tower, eight bedrooms to rent, and room for a tent on the grounds.	sarah@renwickmansion.net	563-484-0202	https://renwickmansion.net/weddings/
Hotel Julien Dubuque	200 Main St	Dubuque	Iowa			Ballroom / Hotel	Indoor & Outdoor	300		A historic downtown hotel on the Mississippi with a Grande Ballroom, a River Room and a river terrace.	info@hoteljuliendubuque.com	563-556-4200	https://www.hoteljuliendubuque.com/weddings-special-events
White Knot Barn	11805 R45 Hwy	Prole	Iowa			Barn / Rustic	Indoor & Outdoor			A barn on 140 acres of farmland with a vineyard, bridal suite and groom's room, about twenty minutes south of Des Moines.	kurtis@whiteknotbarn.com	515-971-0408	https://www.whiteknotbarn.com/
Eastbank Venue + Lounge	97 3rd Ave SE	Cedar Rapids	Iowa			Historic / Estate	Indoor		Classic	A restored downtown building with a ceremony and reception hall, a speakeasy-style lounge and two getting-ready lounges overlooking the river.		319-365-0759	https://www.eastbankvenue.com/investment
Grand River Center	500 Bell St	Dubuque	Iowa			Ballroom / Hotel	Indoor & Outdoor	600		A conference centre on the Mississippi riverfront with a Grand Ballroom, an all-glass River Room with a veranda, and a pre-function patio.		563-690-4500	https://www.grandrivercenter.com/weddings
`,
  },
];

export default batches;
