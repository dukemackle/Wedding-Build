import type { VenueBatch } from "@/lib/venue-batches";

// West Virginia venue batches. Every row's State is "West Virginia". Add new batches at the end.
const batches: VenueBatch[] = [
  {
    name: "West Virginia venues",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
J.Q. Dickinson Salt-Works	4797 Midland Dr	Malden	West Virginia			Historic / Estate	Indoor & Outdoor	200	Simple	Seventh-generation salt farm in the Kanawha Valley with an open courtyard, a covered Lath House, rose garden and salt houses for photos.	events@jqdsalt.com	304-925-7918	https://jqdsalt.com/book-an-event/
White Oak 1838	560 Tyrone Road	Morgantown	West Virginia			Barn / Rustic	Indoor & Outdoor	299		Hand-hewn 1838 white oak barn moved from Ohio to a five-acre site, with 10,000 sq ft of climate-controlled space and covered timber verandas.			https://www.whiteoak1838.com
Bailey Barns Venue	120 Grant Street	Fairview	West Virginia			Barn / Rustic	Indoor & Outdoor	175		Barn venue on a 190-acre Marion County farm with three ceremony sites, a stone fireplace and Friday-to-Sunday wedding bookings.	BaileyBarnsVenue@gmail.com	304-816-7222	https://www.baileybarnsvenue.com/
Hotel Morgan	127 High Street	Morgantown	West Virginia			Ballroom / Hotel	Indoor	220		Restored 1925 hotel on High Street near West Virginia University, with a grand ballroom with fireplace and guest room blocks.	info@hotelmorgan.com	304-292-8200	https://www.hotelmorganweddings.com/
The Venetian Estate	1742 Midland Trail	Milton	West Virginia			Historic / Estate	Indoor & Outdoor	200		Estate of nearly a century between Huntington and Charleston, with a historic house, stable, landscaped grounds and a formal ballroom.	Events@VenetianEstate.com	304-390-4575	https://venetianestate.com/
The Gaines Estate	225 W. Maple Avenue	Fayetteville	West Virginia			Historic / Estate	Indoor & Outdoor	200		Restored 1920s mansion in downtown Fayetteville with three patios, a cocktail lounge and a separate 4,000 sq ft reception hall.	info@gainesestate.com	304-382-7509	https://www.gainesestate.com
Adventures on the Gorge	219 Chestnutburg Road	Lansing	West Virginia			Garden / Outdoor	Indoor & Outdoor			Adventure resort on 350 acres at the rim of the New River Gorge, with 12 event spaces, 123 cabins and rafting or zip lines for guests.		844-823-2684	https://www.adventuresonthegorge.com/groups/weddings-and-elopements
Graycliff Retreat		Shepherdstown	West Virginia			Historic / Estate	Indoor & Outdoor	100		Tuscan-style castle estate above the Potomac taking one wedding per weekend, with lodging for 28, an infinity pool and a riverside deck.	graycliffretreat@gmail.com	301-302-2755	https://graycliffretreat.com/
Cacapon Resort State Park	818 Cacapon Lodge Dr	Berkeley Springs	West Virginia			Ballroom / Hotel	Indoor & Outdoor	200		State park resort of more than 6,000 acres in the Eastern Panhandle, with a lodge, cabins, banquet rooms and a terrace over the golf course.	cacaponsp@wv.gov	304-258-1022	https://wvstateparks.com/parks/cacapon-resort-state-park/groups-meetings-and-weddings/
Pipestem Resort State Park	3405 Pipestem Dr	Pipestem	West Virginia			Ballroom / Hotel	Indoor & Outdoor	500		State park resort above the Bluestone Gorge with two lodges and cabins, a wedding deck for 120 and a conference center seating 500 for banquets.	pipestemsp@wv.gov	304-466-1800	https://wvstateparks.com/parks/pipestem-state-park/groups-meetings-and-weddings/
Hawks Nest State Park	49 Hawks Nest Park Rd	Ansted	West Virginia			Garden / Outdoor	Indoor & Outdoor	80		State park lodge above the New River Gorge with an overlook restaurant that caters events and a historic-area pavilion for 80.	hawksnestsp@wv.gov	304-658-5212	https://wvstateparks.com/parks/hawks-nest-state-park/groups-meetings-and-weddings/`,
  },
];

export default batches;
