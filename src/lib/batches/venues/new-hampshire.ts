import type { VenueBatch } from "@/lib/venue-batches";

// New Hampshire venue batches. Every row's State is "New Hampshire". Add new batches at the end.
const batches: VenueBatch[] = [
  {
    name: "Seacoast, lakes and mountains New Hampshire",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Bedford Village Inn	2 Olde Bedford Way	Bedford	New Hampshire			Ballroom / Hotel	Indoor & Outdoor			Inn and boutique hotel built around an original farmhouse, with the Great Hall and Grand Charolais Room for receptions and on-site restaurants for the weekend.	guestservices@bedfordvillageinn.com	603-472-2001	https://www.bedfordvillageinn.com/weddings
LaBelle Winery Amherst	345 State Route 101	Amherst	New Hampshire			Restaurant / Vineyard	Indoor & Outdoor			Winery on 11 acres with two acres of vines, ceremonies among or above the rows, in-house catering and an on-site bistro.		603-672-9898	https://www.labellewinery.com/weddings
Stonehurst Manor	3351 White Mountain Highway	North Conway	New Hampshire			Historic / Estate	Outdoor	100		Country-house inn at the gateway to the White Mountains, hosting tented garden weddings for up to 100 with mountain views and on-site rooms.	stay@stonehurstmanor.com	603-356-3113	https://www.stonehurstmanor.com/weddings
Searles Castle	23 Searles Road	Windham	New Hampshire			Historic / Estate	Indoor & Outdoor			Hilltop stone mansion with gardens and long views, hosting receptions indoors or in a draped tent on the grounds.		(603) 898-6597	https://atthecastle.com/
Saltonstall Farm		Stratham	New Hampshire			Barn / Rustic	Indoor & Outdoor	200	Classic	Third-generation working berry farm with a four-storey, roughly 200-year-old barn and an outdoor ceremony site, booked by the weekend.	sophiesaltonstall@gmail.com	(978) 801-1870	https://www.saltonstallfarm.com/saltonstallfarmbarn
The Barn at Powder Major's Farm		Madbury	New Hampshire			Barn / Rustic	Indoor & Outdoor			Restored 1804 timber-frame barn, 80 by 40 feet, on a Revolutionary-era farm with fields running down to a pond near Durham and Dover.	info@powdermajorsfarm.com	(603) 742-3160	https://www.powdermajorsfarm.com
Timber Hill Farm		Gilford	New Hampshire			Barn / Rustic	Indoor & Outdoor			Conserved hillside farm founded in 1784, with a timber-frame barn milled from its own pines and views over Lake Winnipesaukee to the Presidential Range.	events@timberhillfarm.com	603-409-5557	https://www.timberhillfarm.com/venue
The Victoria Inn	430 High Street	Hampton	New Hampshire			Garden / Outdoor	Indoor & Outdoor	150		Bed and breakfast half a mile from Hampton Beach with a covered garden pavilion, a lawn gazebo, on-site catering and rooms for about 20 guests.	events@thevictoriainn.com		https://thevictoriainn.com/garden-pavilion
Purity Spring Resort		Madison	New Hampshire			Beach / Waterfront	Indoor & Outdoor	200		Family resort on Purity Lake since the 1930s, with ceremonies on a lakeside island reached by footbridge, a summit site at King Pine and an indoor hall for 200.	info@purityspring.com	603.367.8896	https://www.purityspring.com/weddings
Van Horn Estate	31 Manor Dr	Holderness	New Hampshire			Historic / Estate	Indoor & Outdoor	140		Historic estate on 10 acres above Squam Lake, with the 140-guest Mirador event space and inn rooms for a full wedding weekend.	info@manorongoldenpond.com	603-968-3348	https://www.vanhornestate.com/wedding-and-events
Ashworth by the Sea	295 Ocean Boulevard	Hampton	New Hampshire			Ballroom / Hotel	Indoor			Oceanfront hotel on Hampton Beach with four function rooms, including the Rose Room, and more than a century of hosting weddings.	frontdesk@ashworthbythesea.com	603-926-6762	https://www.ashworthhotel.com/weddings`,
  },
  {
    name: "New Hampshire: mountains, lakes and Monadnock",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Eagle Mountain House	179 Carter Notch Rd	Jackson	New Hampshire			Ballroom / Hotel	Indoor & Outdoor			White Mountains hotel with a nine-hole golf course, long veranda and renovated carriage house, holding ceremonies on a tee box facing the peaks.		603-383-9111	https://www.eaglemt.com/weddings
The Inn at Pleasant Lake	853 Pleasant St	New London	New Hampshire			Beach / Waterfront	Indoor & Outdoor	200		Lakefront country inn with roots in 1790, a private beach and views across Pleasant Lake to Mount Kearsarge in the Sunapee region.	events@innatpleasantlake.com	800-626-4907	https://www.innatpleasantlake.com/weddings
Three Chimneys Inn	17 Newmarket Rd	Durham	New Hampshire			Historic / Estate	Indoor & Outdoor	200		Seacoast inn built around a 1649 homestead and a 1795 carriage house, with 23 guest rooms, gardens, arbours and a reflection pool.		603-868-7800	https://www.threechimneysinn.com/weddings
Woodbound Inn	247 Woodbound Rd	Rindge	New Hampshire			Ballroom / Hotel	Indoor & Outdoor	200	Simple	Monadnock-region inn on Contoocook Lake with a ballroom, a playbarn, a private beach and lakeside cabins for guests.		603-532-8341	https://www.woodbound.com/weddings`,
  },
];

export default batches;
