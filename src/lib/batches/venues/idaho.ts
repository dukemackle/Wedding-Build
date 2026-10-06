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
Fox Canyon Vineyards	8184 Fox Canyon Dr	Marsing	Idaho			Restaurant / Vineyard	Indoor & Outdoor	300		Family-owned vineyard and tasting room on the cliffs above the Snake River with valley and mountain views.			https://foxcanyonvineyards.com
The Vintage Rose	14095 North Nana Lane	Nampa	Idaho			Garden / Outdoor	Indoor & Outdoor	200	Classic	Just under four acres on the edge of Nampa with mature landscaping, custom structures and water features.	thevintagerosenampa@gmail.com	208-565-6655	https://www.thevintagerosevenue.com
Magnolia Reserve	3575 Wills Rd	Emmett	Idaho			Garden / Outdoor	Indoor & Outdoor			Six-acre country property in Emmett with a reception building framed by floor-to-ceiling windows.	magnoliacottageweddings@gmail.com		https://www.magnoliacottageweddings.com
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
  {
    name: "Sun Valley, McCall, North Idaho and statewide venues",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Knob Hill Inn	960 N Main St	Ketchum	Idaho			Ballroom / Hotel	Indoor	150		Boutique hotel at the north end of Ketchum with event rooms for 14 to 150 guests, its own grill restaurant and rooms for the wedding party.	info@knobhillinn.com	208.726.8010	https://www.knobhillinn.com/wedding-events/
Limelight Hotel Ketchum	151 Main St S	Ketchum	Idaho			Ballroom / Hotel	Indoor & Outdoor	250		Downtown Ketchum hotel with the Silver Creek Ballroom, a fireplace living room and an open plaza that each hold around 250 for a reception.		(855) 441-2250	https://www.limelighthotels.com/ketchum/events/weddings-and-events
Redfish Lake Lodge	401 Redfish Lodge Road	Stanley	Idaho			Beach / Waterfront	Indoor & Outdoor	225		Summer-only lodge on the shore of Redfish Lake in the Sawtooths, hosting tented lakeside weddings with in-house catering and cabins for the couple's guests.	reserve@redfishlake.com	208-774-3536	https://redfishlake.com/weddings/
Idaho Rocky Mountain Ranch	18027 State Hwy 75	Stanley	Idaho			Historic / Estate	Indoor & Outdoor			Historic log guest ranch on some 900 acres in the Sawtooth Valley, with a main lodge and fourteen cabins that can be booked out for a private wedding.	info@idahorocky.com	(208) 725-3000	https://idahorocky.com/private-events/
Galena Lodge	15187 State Highway 75	Ketchum	Idaho			Barn / Rustic	Indoor & Outdoor			Backcountry lodge and trail centre in the Boulder Mountains north of Ketchum, booked for summer and winter weddings well over a year ahead.	info@galenalodge.com	208-726-4010	https://www.galenalodge.com/weddings.html
Sawtooth Botanical Garden	11 Gimlet Rd	Ketchum	Idaho			Garden / Outdoor	Indoor & Outdoor			Community botanical garden south of Ketchum with mountain-view gardens, a sculpture garden and indoor rooms, rented for summer weddings.	info@sbgarden.org	208.726.9358	https://www.sbgarden.org/
Wild Horse Creek Ranch	4387 Wild Horse Creek Road	Mackay	Idaho			Barn / Rustic	Indoor & Outdoor	40		Remote guest ranch below the Pioneer Mountains with a great room, commercial kitchen and bedrooms for a small wedding party staying the weekend.		208.588.2575	https://wildhorsecreekranch.com/
Brundage Mountain Resort	3890 Goose Lake Road	McCall	Idaho			Garden / Outdoor	Outdoor	200		Ski area outside McCall where guests ride the chairlift to a summit ceremony, then come down to a covered 3,200-square-foot pavilion for dinner.			https://brundage.com/weddings/
Jug Mountain Ranch		McCall	Idaho			Garden / Outdoor	Indoor & Outdoor	120		Golf and residential ranch community below Jughandle Mountain south of McCall, with a ceremony site and tipi tents for receptions.		208.634.5072	https://jugmountainranch.com/book-an-event/
Tamarack Resort	311 Village Dr	Tamarack	Idaho			Ballroom / Hotel	Indoor & Outdoor			Year-round mountain resort above Lake Cascade with lodging, a village and the Arling Center for ceremonies and receptions in one place.	info@tamarackidaho.com	208.325.1000	https://tamarackidaho.com/weddings
Talus Rock Retreat		Sandpoint	Idaho			Garden / Outdoor	Indoor & Outdoor	48	Classic	Eighteen-acre wooded retreat a mile from downtown Sandpoint with six guest rooms, gardens and a pool, booked for small weddings with lodging included.	talusrockretreat@gmail.com	(208) 255-8458	https://www.talusrockretreat.com/weddings/
Schweitzer	10000 Schweitzer Mountain Rd	Sandpoint	Idaho			Ballroom / Hotel	Indoor & Outdoor			Ski resort above Sandpoint looking out over Lake Pend Oreille, with mountain-top ceremony sites, lodge reception rooms and on-site hotel rooms.			https://www.schweitzer.com/weddings
The Grove Hotel	245 S Capitol Blvd	Boise	Idaho			Ballroom / Hotel	Indoor & Outdoor			Downtown Boise hotel with a newly renovated grand ballroom and an outdoor terrace with fire pits looking toward the foothills.	sales@grovehotelboise.com	(208) 333-8000	https://www.grovehotelboise.com/weddings
Wishing Well Falls	10668 W Bernt Rd	Hammett	Idaho			Garden / Outdoor	Outdoor	300		Rural garden venue near Glenns Ferry with a creek, waterfall fire pit, several dance and dining decks and room for 300 guests outdoors.	wishingwellfalls@gmail.com	(208) 599-1938	https://www.wishingwellfalls.com/
Mountain View Barn		Jerome	Idaho			Barn / Rustic	Indoor & Outdoor		Simple	Lava-rock and timber barn built in 1912 just north of Twin Falls, with a loft, outdoor ceremony area, on-site catering and a house that sleeps eight.	mountainviewbarn@gmail.com	208-969-0784	https://mountainviewbarnidaho.com/
The Teton Event Center	3885 Crestwood Ln	Idaho Falls	Idaho			Ballroom / Hotel	Indoor		Simple	Event hall in Idaho Falls rented by the hour or the full day, with a list of recommended caterers and simple add-ons such as linens.		(208) 497-0526	https://www.thetetoneventcenter.com/
Big Canyon Acres	39754 Peanuts Lane	Peck	Idaho			Garden / Outdoor	Indoor & Outdoor			Historic 48-acre orchard in the Clearwater River canyon with eight ceremony and reception sites, decor included, suites and a creekside campground.	bigcanyonacres@gmail.com	208-827-6456	https://bigcanyonacres.com/
The Barn at Mader Farm	13506 Hillside Road	Genesee	Idaho			Barn / Rustic	Indoor & Outdoor			Working Palouse wheat farm founded in 1895 near Moscow, with a barn, porches and lawns above the rolling fields.		(208) 790-3337	https://thebarnatmaderfarm.com/
Lindsay Creek Vineyards	3107 Powers Avenue	Lewiston	Idaho			Restaurant / Vineyard	Indoor & Outdoor	300		Winery on the edge of Lewiston beside wheat fields, with an event room and a north lawn and pergola that each seat up to 300.	events@lcvineyards.com	208-746-9463	https://lcvineyards.com/events/book-a-space
`,
  },
];

export default batches;
