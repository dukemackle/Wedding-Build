import type { VenueBatch } from "@/lib/venue-batches";

// Delaware venue batches. Every row's State is "Delaware". Add new batches at the end.
const batches: VenueBatch[] = [
  {
    name: "Delaware venues",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Chase Center on the Riverfront	815 Justison Street	Wilmington	Delaware			Ballroom / Hotel	Indoor	750		Large event centre on the Christina River with two ballrooms and a connected Westin hotel for guests.		302-425-3929	https://centerontheriverfront.com/special-events/
DuPont Country Club	1001 Rockland Rd	Wilmington	Delaware			Ballroom / Hotel	Indoor			Brandywine Valley country club with the DuPont and Christiana ballrooms plus the separate Brantwyn Estate mansion.		(302) 654-4435	https://www.dupontcountryclub.com/weddings-events
University and Whist Club	805 North Broom Street	Wilmington	Delaware			Historic / Estate	Indoor			Private club in the historic Tilton Mansion and Carriage House that books one all-inclusive wedding per day.		(302) 658-5125	https://www.universityandwhistclub.com/Weddings
Hotel du Pont	42 W. 11th Street	Wilmington	Delaware			Ballroom / Hotel	Indoor	275	Luxury	Downtown hotel opened in 1913 whose gilded French neoclassical Gold Ballroom hosts receptions with rooms upstairs.	reservations@hoteldupont.com	302.594.3100	https://www.hoteldupont.com/weddings-events/weddings
Bellevue Hall	901 Philadelphia Pike	Wilmington	Delaware			Historic / Estate	Indoor & Outdoor	250		1855 former du Pont mansion inside Bellevue State Park with lawn ceremonies, gardens and tented or indoor receptions.		302-305-2657	https://jamhospitality.com/venues/bellevue-hall/
The Barn at Cauffiel Estate	1016 Philadelphia Pike	Wilmington	Delaware			Barn / Rustic	Indoor & Outdoor	150		1928 Colonial Revival estate in Bellevue State Park with a restored bank barn and Delaware River views.		302-305-2657	https://jamhospitality.com/venues/the-barn-at-cauffiel/
The Carriage House at Rockwood Park	4671 Washington Street Extension	Wilmington	Delaware			Garden / Outdoor	Indoor & Outdoor			Carriage house on an 1854 country estate set within a six-acre garden with plantings dating to the 1850s.		302-472-2433	https://rockwoodcarriagehouse.com/weddings/
The Farmhouse	5600 Old Capitol Trail	Wilmington	Delaware			Historic / Estate	Indoor & Outdoor	190		Family-run historic estate on four acres with a willow-shaded ceremony site, terrace hall and wrap-around deck.	info@thefarmhousede.com	302-999-8477	https://www.thefarmhousede.com/weddings
Deerfield Golf Club	507 Thompson Station Road	Newark	Delaware			Ballroom / Hotel	Indoor & Outdoor	500		Public golf club on 145 state-owned acres by White Clay Creek State Park, with a ballroom and outdoor terrace.		302-368-6640	https://www.deerfieldgolfclub.com/weddings/
King Cole Farm	1730 Bayside Drive	Dover	Delaware			Barn / Rustic	Indoor & Outdoor	300	Classic	Dover farm with a climate-controlled pole barn, gazebo, garden room and a main house for weekend stays.		302-405-5595	https://www.kingcolefarm.com/
Loblolly Acres	3893 Turkey Point Road	Viola	Delaware			Barn / Rustic	Indoor & Outdoor	150	Classic	Kent County farm with the chandelier-lit Magnolia Barn, an outdoor stage and a pavilion for larger groups.	loblollyacresevents@gmail.com	302-632-6797	https://www.loblollyacres.com/bookings
Cobalt Manor	47 East Commerce St.	Smyrna	Delaware			Historic / Estate	Indoor & Outdoor	100		Restored 1868 Italianate mansion and cafe in Smyrna with a Victorian patio for small weddings.	bookings@cobaltmanor.com	1-888-272-9812	https://www.cobaltmanor.com/cobalt-weddings
Nassau Valley Vineyards	32165 Winery Way	Lewes	Delaware			Restaurant / Vineyard	Indoor & Outdoor	350	Simple	Lewes winery with an 8,400 sq ft event hall, patios, lawns and a grove of old sycamore trees.	mail@nassauvalley.com	302.645.9463	https://www.nassauvalley.com/facility-rental/
Salero on the Beach	511 North Boardwalk	Rehoboth Beach	Delaware			Beach / Waterfront	Indoor & Outdoor	150		Eighth-floor restaurant in the Henlopen Hotel on the boardwalk, looking out over the ocean, with beach ceremony setups.	dawnhorton@saleroonthebeach.com	(302) 841-2229	https://saleroonthebeach.com/events/weddings/
Atlantic Sands Hotel & Conference Center	1 Baltimore Avenue	Rehoboth Beach	Delaware			Beach / Waterfront	Indoor			Oceanfront boardwalk hotel with conference and banquet space for wedding receptions and rooms for guests.		(302) 227-2511	https://www.atlanticsandshotel.com/
Baywood Weddings	32267 Clubhouse Way	Millsboro	Delaware			Ballroom / Hotel	Indoor & Outdoor	300		Golf clubhouse near Rehoboth with a remodelled 260-guest ballroom, patio, library and a 300-guest tented lawn.	meredith@baywoodclubhouse.com		https://baywoodweddings.com/
Brittingham Farms Lavender & Lambs	22518 Phillips Hill Road	Millsboro	Delaware			Barn / Rustic	Indoor & Outdoor	150	Classic	Fourth-generation family farm founded in 1930 with lavender fields, sheep and a 150-seat wedding barn.	laura@brittinghamfarms.com		https://www.brittinghamfarms.com/weddings`,
  },
];

export default batches;
