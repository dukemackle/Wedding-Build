import type { VenueBatch } from "@/lib/venue-batches";

// Wyoming venue batches. Every row's State is "Wyoming". Add new batches at the end.
const batches: VenueBatch[] = [
  {
    name: "Jackson Hole and Wyoming venues",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Trailborn Jackson Hole	400 E Snow King Ave	Jackson	Wyoming			Ballroom / Hotel	Indoor & Outdoor			A resort hotel at the foot of Snow King Mountain on the edge of downtown Jackson, with several gathering spaces, two bars and a spa.	jacksonhole-gatherings@trailborn.com	(866) 912-8442	https://www.trailborn.com/jackson-hole/
The Wort Hotel	50 N Glenwood St	Jackson	Wyoming			Ballroom / Hotel	Indoor			A 1941 hotel on the National Register of Historic Places beside Jackson town square, with about 4,000 square feet of event space in four rooms.		(307) 733-2190	https://www.worthotel.com/meeting-events/
Hotel Jackson	120 N Glenwood St	Jackson	Wyoming			Ballroom / Hotel	Indoor			A boutique hotel just off Jackson town square with suites that have gas fireplaces, plus an in-house concierge team that arranges wedding catering and venues.	info@hoteljackson.com	(307) 733-2200	https://www.hoteljackson.com/jackson-hole-concierge/jackson-hole-weddings/
Bentwood Inn	4250 Raven Haven Rd	Wilson	Wyoming			Barn / Rustic	Indoor & Outdoor	200		A reclaimed-timber lodge in Wilson with a three-story river rock fireplace, four acres of lawn and Teton views, rented as a whole property.	info@bentwoodinn.com	307-739-1411	https://www.bentwoodinn.com/weddings
Trail Creek Ranch	7100 West Trail Creek Rd	Wilson	Wyoming			Barn / Rustic	Outdoor			A historic ranch at about 6,280 feet near Wilson with private cabins and suites, horse pastures and views of the Tetons.	TrailCreekRanch@msn.com	307-690-2610	https://trailcreekranch.com
Moose Head Ranch		Moose	Wyoming			Barn / Rustic	Outdoor		Classic	A dude ranch in Jackson Hole offering its event site to weddings in the off season, with unobstructed views of the Teton range.		307-733-3141	https://www.mooseheadranch.com/weddings
Black Fox on Welsh	1000 Welsh Ln	Laramie	Wyoming			Barn / Rustic	Indoor & Outdoor	118		A rustic venue on the edge of Laramie with two connected climate-controlled rooms, an upstairs getting-ready suite and mountain views.	info@blackfoxonwelsh.com	307.460.8677	https://www.blackfoxonwelsh.com
Trail End State Historic Site	400 Clarendon Ave	Sheridan	Wyoming			Historic / Estate	Outdoor		Simple	A 3.8-acre estate around the 1913 Kendrick Mansion in Sheridan, with several lawns, a rose garden and a carriage house courtyard for outdoor ceremonies.		307-674-4589	https://wyoparks.wyo.gov/index.php/activities-amenities-trail-end/events-weddings-trail-end
Little America Hotel Cheyenne	2800 W Lincolnway	Cheyenne	Wyoming			Ballroom / Hotel	Indoor & Outdoor			An 80-acre hotel resort with 185 rooms, a chandeliered grand ballroom, indoor ceremony rooms, two lawns and a nine-hole golf course.		(307) 775-8433	https://cheyenne.littleamerica.com/weddings-celebrations/
Terry Bison Ranch Resort	51 I-25 Service Rd E	Cheyenne	Wyoming			Barn / Rustic	Indoor & Outdoor			A working bison ranch south of Cheyenne with a meadow, gazebo, saloon-style hall, cabins for the wedding party and self-catering allowed.		(307) 634-4171	https://terrybisonranch.com/weddings
Riata Ranch Event Center	826 Arena Ln	Cheyenne	Wyoming			Barn / Rustic	Indoor			A western-style indoor arena and event centre on open prairie outside Cheyenne that also hosts rodeos and horse boarding.	riataranch88@gmail.com	307-316-3180	https://www.riatarancharena.com/weddings-events
Prairie Sky Venue	1120 Highway 50	Gillette	Wyoming			Barn / Rustic	Indoor & Outdoor	250		A venue six miles south of Gillette with a 5,000 square foot grand hall, a fireside room and a chapel built in 1922.	Events@prairieskyvenue.com	307-622-9200	https://www.prairieskyvenue.com
TA Ranch	28623 Old Highway 87	Buffalo	Wyoming			Barn / Rustic	Indoor & Outdoor			A family-owned ranch working since 1880 with restored 150-year-old buildings, several event spaces and on-site lodging in the Homestead.	info@taranch.us	307-684-5833	https://www.taranchweddings.com
`,
  },
  {
    name: "More Jackson Hole and Wyoming venues",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Brush Creek Ranch		Saratoga	Wyoming			Barn / Rustic	Indoor & Outdoor			A 30,000-acre working ranch resort with a 1934 cowboy chapel, a lodge and spa and creekside dining spots, hosting multi-day all-inclusive weddings.	reservations@brushcreekranch.com	307-327-5284	https://www.brushcreekranch.com/group-retreats/weddings
Diamond Cross Ranch	24000 N Gun Barrel Flats Rd	Jackson	Wyoming			Barn / Rustic	Outdoor			A historic family ranch founded in 1912 beside Grand Teton National Park, with a big red barn for receptions, open pasture and unobstructed views of the Tetons.	weddings@diamondcrossranch.com	307-543-2015	https://www.diamondcrosswedding.com/
The Barn at Heiner Ranch	2752 Thayne Bedford Rd	Thayne	Wyoming			Barn / Rustic	Indoor & Outdoor	100		A 1928 dairy barn in Star Valley, restored with a loft reception space, a former milking parlour for cocktails and a hillside ceremony site reached by horse-drawn wagon.		435-213-7746	https://heinerranch.com/
`,
  },
];

export default batches;
