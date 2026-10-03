import type { VenueBatch } from "@/lib/venue-batches";

// Idaho venue batches. Every row's State is "Idaho". Add new batches at the end.
const batches: VenueBatch[] = [
  {
    name: "Boise and Treasure Valley venues",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Mint Barrel Barn	9107 W McMillan Rd	Nampa	Idaho			Barn / Rustic	Indoor	200		Restored 1910 gambrel barn with 6,000 square feet of original timbers and views over the valley towards the mountains.	info.mintbarrelbarn@gmail.com	208-989-1119	https://www.mintbarrelbarn.com
Honalee Farm Event Center	7010 W Moon Valley Rd	Eagle	Idaho			Barn / Rustic	Indoor & Outdoor			Former 1920s dairy farm with a pond, stream, gazebo and wide lawn, plus an indoor hall with bridal and groom quarters.	info@honaleefarm.com	(208) 286-0533	https://www.honaleefarm.com
Stone Crossing	9600 W Brookside Ln	Boise	Idaho			Historic / Estate	Indoor & Outdoor			Ten-acre estate in the northwest Boise hills, built in 1968, with a stone-walled great house, garden gazebo and tree-lined lawn.		208-501-8050	https://stonecrossing.com/weddings/
The Club at Spurwing	6800 N Spurwing Way	Meridian	Idaho			Ballroom / Hotel	Indoor & Outdoor			Golf club clubhouse in Meridian with the Gold Tee dining room, an east patio over the 18th hole and bridal suites.		208-887-1800	https://www.theclubatspurwing.com/weddings
Chateau des Fleurs	176 S Rosebud Ln	Eagle	Idaho			Ballroom / Hotel	Indoor & Outdoor			Family-owned chateau-style event centre beside the Boise River, with several ballrooms, a restaurant and wildflower gardens.	admin@chateaueagle.com	(208) 947-2840	https://www.chateaueagle.com
The Cottage at Riverbend	2811 W State St	Eagle	Idaho			Historic / Estate	Indoor & Outdoor		Classic	Restored 1930s Spanish revival cottage with lodging and grounds about three miles west of downtown Eagle.		208-473-8820	https://thecottageatriverbend.com
Fox Canyon Vineyards	8184 Fox Canyon Dr	Marsing	Idaho			Restaurant / Vineyard	Indoor & Outdoor	300		Family-owned vineyard and tasting room on the cliffs above the Snake River with valley and mountain views.		208-896-4851	https://foxcanyonvineyards.com
The Vintage Rose		Nampa	Idaho			Garden / Outdoor	Indoor & Outdoor	200	Classic	Just under four acres on the edge of Nampa with mature landscaping, custom structures and water features.	thevintagerosenampa@gmail.com	208-565-6655	https://www.thevintagerosevenue.com
Magnolia Reserve	3575 Wills Rd	Emmett	Idaho			Garden / Outdoor	Indoor & Outdoor			Six-acre country property in Emmett with a reception building framed by floor-to-ceiling windows.	magnoliacottageweddings@gmail.com	208-780-9836	https://www.magnoliacottageweddings.com
Idaho Botanical Garden	2355 Old Penitentiary Rd	Boise	Idaho			Garden / Outdoor	Outdoor			Botanical garden at the foot of the Boise foothills with separate outdoor ceremony spaces booked for weddings from April to October.		(208) 343-8649	https://www.idahobotanicalgarden.org/events
Waters Edge Event Center	287 E Shore Dr	Eagle	Idaho			Ballroom / Hotel	Indoor & Outdoor			Event centre near the Boise River Greenbelt with indoor and outdoor spaces, in-house catering and an on-site bar.	watersedgeevents@gmail.com	(208) 866-8671	https://awatersedge.com
Hidden Gem Events	134 E State Ave	Meridian	Idaho			Historic / Estate	Indoor			Restored 1907 Queen Anne Victorian house in historic downtown Meridian hosting small weddings.		(208) 863-0187	https://www.hiddengemmeridian.com
Ste. Chapelle Winery	19348 Lowell Rd	Caldwell	Idaho			Restaurant / Vineyard	Indoor & Outdoor	600		Winery with a chateau banquet room under stained glass and a shaded vineyard park, overlooking the Snake River Valley.	info@stechapelle.com	(208) 453-7840	https://www.stechapelle.com/private-events
The White Barn at Happy Valley		Nampa	Idaho			Barn / Rustic	Indoor	225	Classic	Refurbished 1920s barn with over 6,000 square feet, antique beams, vaulted ceilings and a hayloft.			https://www.happyvalleybarn.com
The Avery Hotel & Brasserie	1010 W Main St	Boise	Idaho			Ballroom / Hotel	Indoor			Locally owned boutique hotel in a historic downtown Boise building with a neighbourhood brasserie.	info@theaveryboise.com	208-990-1010	https://theaveryboise.com
`,
  },
  {
    name: "More Treasure Valley and North Idaho venues",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Sandstone Vineyards	1888 E Rodeo Ln	Kuna	Idaho			Garden / Outdoor	Indoor & Outdoor			A five-acre vineyard-home property with koi ponds, fountains, a pool, a vine-covered arbor to the ceremony lawn and a lit reception barn, looking toward the Boise foothills.	info@sandstonevineyards.com	(208) 900-8966	https://sandstonevineyards.com/
Settlers Creek	5803 W Riverview Dr	Coeur d'Alene	Idaho			Barn / Rustic	Indoor & Outdoor			A homestead-style property on the Spokane River side of Coeur d'Alene with several lawn amphitheatres, a vineyard trellis, a pond, a silo and a commercial kitchen on site.	info@settlerscreek.com	208-929-2507	https://settlerscreek.com/weddings
Cider Mountain	1808 Cider Rd	Athol	Idaho			Barn / Rustic	Indoor & Outdoor	200		A 160-acre North Idaho property with a lodge, three guest cabins, a covered bar and several ceremony spots, set up for private weekend weddings near Farragut State Park.	info@cidermountain.com		https://cidermountain.com/
High Desert Station	6780 Willis Rd	Star	Idaho			Barn / Rustic	Indoor & Outdoor	1000		A rustic ranch-style event centre in the hills outside Star with a saloon banquet hall, a smaller ranch house with patio and a covered equestrian arena.	info@hmmeats.com	208-467-0999	https://highdesertstation.com/event-spaces
`,
  },
];

export default batches;
