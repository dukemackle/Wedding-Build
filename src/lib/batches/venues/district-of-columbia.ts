import type { VenueBatch } from "@/lib/venue-batches";

// District of Columbia venue batches. Every row's State is "District of Columbia". Add new batches at the end.
const batches: VenueBatch[] = [
  {
    name: "Washington venues",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Dumbarton House	2715 Q St NW	Washington	District of Columbia			Historic / Estate	Indoor & Outdoor	160		Federal-period Georgetown house museum with a North Garden for ceremonies and the Belle Vue Room, which seats 160 with the courtyard tented.		(202) 337-2288	https://dumbartonhouse.org/book/venue-details
Tudor Place Historic House & Garden	1644 31st St NW	Washington	District of Columbia			Historic / Estate	Indoor & Outdoor	70		1816 Georgetown house on five and a half acres, with lawns, a boxwood bowling green and an 1867 Dower House for weddings of up to 70.	events@tudorplace.org		https://tudorplace.org/rentals/weddings/
Decatur House	1610 H St NW	Washington	District of Columbia			Historic / Estate	Indoor & Outdoor	220	Classic	Historic house on Lafayette Square run by the White House Historical Association, with a carriage house, parlours and a courtyard seating up to 220.		202-218-4333	https://www.whitehousehistory.org/decatur-house/weddings
Josephine Butler Parks Center	2437 15th St NW	Washington	District of Columbia			Historic / Estate	Indoor & Outdoor	150	Classic	Former embassy mansion of 40 rooms overlooking Meridian Hill Park, with a ballroom seating 150 and terraces, run by a parks nonprofit.	info@washingtonparks.net	(202) 462-7275	https://washingtonparks.net/locations.php
Meridian House	1630 Crescent Pl NW	Washington	District of Columbia			Historic / Estate	Indoor & Outdoor	150		1920s Crescent Place mansion with garden ceremonies, dinner across the Drawing Room and Library for up to 150, and the neighbouring White-Meyer House.	EventRentals@meridian.org	(202) 667-6800	https://meridian.org/rental/
The Whittemore House	1526 New Hampshire Ave NW	Washington	District of Columbia			Historic / Estate	Indoor & Outdoor	180		1890s Dupont Circle mansion with nine rooms, a ballroom for dinners of up to 180 and a courtyard garden, with in-house catering.	events@thewhittemorehouse.com	(202) 232-7363	https://thewhittemorehouse.com/wedding-venue-washington-dc/
Fairmont Washington, D.C., Georgetown	2401 M St NW	Washington	District of Columbia			Ballroom / Hotel	Indoor & Outdoor	350		West End hotel with a Grand Ballroom, the Colonnade and an enclosed courtyard garden for ceremonies, taking weddings of up to 350.	rfp-wdc@fairmont.com	+1 202 429 2400	https://www.fairmont.com/en/hotels/washington-dc/fairmont-washington/weddings.html
The Watergate Hotel	2650 Virginia Ave NW	Washington	District of Columbia			Ballroom / Hotel	Indoor & Outdoor	500		Riverside hotel with a ballroom seating 500 and the Top of the Gate rooftop looking over the Potomac and the Kennedy Center.		1-844-617-1972	https://www.thewatergatehotel.com/weddings/venues
Hotel Washington	515 15th St NW	Washington	District of Columbia			Ballroom / Hotel	Indoor & Outdoor			Hotel beside the White House with historic ballrooms and the VUE rooftop overlooking the Washington Monument for cocktail hours.		+1 202-661-2400	https://weddingvenueswashingtondc.com/
Tabard Inn	1739 N St NW	Washington	District of Columbia			Restaurant / Vineyard	Indoor & Outdoor	70		Dupont Circle inn and restaurant in 19th-century townhouses, with an enclosed garden terrace for ceremonies and period rooms for up to 70.	hotel@tabardinn.com	202-785-1277	https://www.tabardinn.com/events/`,
  },
];

export default batches;
