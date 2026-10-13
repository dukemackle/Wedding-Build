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
Brush Creek Ranch	66 Brush Creek Ranch Road	Saratoga	Wyoming			Barn / Rustic	Indoor & Outdoor			A 30,000-acre working ranch resort with a 1934 cowboy chapel, a lodge and spa and creekside dining spots, hosting multi-day all-inclusive weddings.	reservations@brushcreekranch.com	307-327-5284	https://www.brushcreekranch.com/group-retreats/weddings
Diamond Cross Ranch	24000 N Gun Barrel Flats Rd	Jackson	Wyoming			Barn / Rustic	Outdoor			A historic family ranch founded in 1912 beside Grand Teton National Park, with a big red barn for receptions, open pasture and unobstructed views of the Tetons.	weddings@diamondcrossranch.com	307-543-2015	https://www.diamondcrosswedding.com/
The Barn at Heiner Ranch	2752 Thayne Bedford Rd	Thayne	Wyoming			Barn / Rustic	Indoor & Outdoor	100		A 1928 dairy barn in Star Valley, restored with a loft reception space, a former milking parlour for cocktails and a hillside ceremony site reached by horse-drawn wagon.		435-213-7746	https://heinerranch.com/
`,
  },
  {
    name: "Casper, Laramie, Cody and Sheridan venues",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Deerwood Ranch Weddings and Events	599 WY-11	Laramie	Wyoming			Barn / Rustic	Indoor & Outdoor	160		Family-run barn venue on a working ranch of about 4,700 acres on the Middle Fork River below the Snowy Range, with a bridal suite, kitchen and hayrides.		(307) 760-0645	https://deerwoodbarn.com/
Double Diamond X Ranch	3453 Southfork Road	Cody	Wyoming			Barn / Rustic	Indoor & Outdoor	150	Classic	End-of-the-road ranch in the Upper South Fork Valley offering a historic log lodge, western saloon, event pavilion and riverfront ceremony spots, from late May to early October.	info@ddxranchwyoming.com		https://www.ddxranchwyoming.com/weddings
West Fork	2700 Micro Rd	Casper	Wyoming			Barn / Rustic	Indoor & Outdoor	200		Casper lodge venue with seven bedrooms for the weekend, room for 200 guests outside and 50 inside, and optional turnkey food, drinks and decor from the owner.		307-259-3860	https://westforkwyoming.com/events
Bessemer Mountain Lodge	14500 Hwy 220	Casper	Wyoming			Beach / Waterfront	Indoor & Outdoor			Private hilltop lodge on the North Platte River that hosts riverside ceremonies, outdoor receptions and rehearsal dinners, and sleeps 12 for the wedding party.	kyrstin@bessemermountainlodge.com	307-262-4762	https://www.bessemermountainlodge.com/weddings
Events at The M	234 E 1st St	Casper	Wyoming			Historic / Estate	Indoor	350		Downtown Casper building renovated in 2022 for weddings and events, with tables, chairs, linens and set-up included and room for 350 guests.	info@eventsatthem.com	307-439-4812	https://www.eventsatthem.com/events
Ramkota Hotel & Conference Center	800 N Poplar St	Casper	Wyoming			Ballroom / Hotel	Indoor			Casper hotel with a 6,400 square foot ballroom and dance floor, in-house catering, guest room blocks and a complimentary shuttle for wedding parties.	casheim@ramkotacasper.com	307-266-6000	https://www.westernheritagehotelandconferencecenter.com/groups-meetings/weddings
Casper Country Club	4149 Country Club Road	Casper	Wyoming			Ballroom / Hotel	Indoor	150		Private country club at the foot of Casper Mountain with a 150-guest ballroom, smaller clubhouse rooms, and an events team that plans menus with its kitchen.		307-235-5777	https://www.caspercountryclub.com/events
BR Infinity Event Center	1081 Herrick Lane	Laramie	Wyoming			Barn / Rustic	Indoor & Outdoor		Simple	Modern barn on Browns Creek Angus Ranch with a bridge to an outdoor ceremony space, a full bar, cabins, a bridal salon and a honeymoon suite; day rental $3,500.			https://www.brinfinityevents.com/
The Powder Horn	23 Country Club Lane	Sheridan	Wyoming			Ballroom / Hotel	Indoor & Outdoor			Private golf club in the Bighorn foothills that hosts weddings with an events coordinator, sample menus and dining rooms for 30 to 125 guests.		307-673-4800	https://www.thepowderhorn.com/weddings-events
Gratitude Sheridan	450 S Thurmond Street	Sheridan	Wyoming			Historic / Estate	Indoor	30		1920 Victorian on Residence Hill with six bedrooms and a wrap-around porch, used for small receptions, rehearsal dinners and bridal showers; sleeps 12.			https://gratitudesheridan.com
`,
  },
  {
    name: "Cheyenne, Laramie, Casper, Cody and Wyoming venues",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Cheyenne Depot Museum	121 West 15th Street	Cheyenne	Wyoming			Historic / Estate	Indoor			A historic railroad depot whose chandeliered lobby can be rented for full-day or half-day events.	cdmrentals@cheyennedepotmuseum.org	307.632.3905	https://www.cheyennedepotmuseum.org/lobby-rentals
Historic Atlas Theatre		Cheyenne	Wyoming			Historic / Estate	Indoor	241	Simple	A century-old downtown building with a theatre auditorium that has a stage, screen and sound system, rented for weddings with tables and chairs included.	rentals@littletheatre.org	307-638-6543	https://www.cheyennelittletheatre.org/rentals/
Blue Community Events Center	2401 E Pershing Blvd	Cheyenne	Wyoming			Ballroom / Hotel	Indoor & Outdoor	300		A modern event hall of nearly 7,000 square feet at a credit union headquarters, with a built-in bar, pre-function lounge and sliding doors to an outdoor plaza.	shannon.barela@bluefcu.com	1-800-368-9328	https://www.bluefcu.com/events-center/
Laramie Plains Museum (Ivinson Mansion and Stevens Center)	603 East Ivinson Avenue	Laramie	Wyoming			Historic / Estate	Indoor & Outdoor			A Victorian mansion museum with a beamed-ceiling reception hall that has a stage and kitchen, plus a landscaped east lawn for ceremonies.	lpmdirector@laramiemuseum.org	(307) 742-4448	https://www.laramiemuseum.org/rentals
Rustic Elegance Venue	18193 State Highway 220	Casper	Wyoming			Barn / Rustic	Indoor & Outdoor			A riverfront property on the North Platte with a barn and lodge for receptions, riverside ceremony spots and on-site lodging for up to 48 guests.		(307) 462-1917	https://rusticelegancevenue.com/
Hogadon Basin Lodge	2500 W Hogadon Rd	Casper	Wyoming			Barn / Rustic	Indoor & Outdoor	140		A ski-area lodge on Casper Mountain with an indoor hall, outdoor patios and views over Casper.		(307) 235-8441	https://hogadonlodge.com/
Paradise Valley Country Club	70 Magnolia	Casper	Wyoming			Ballroom / Hotel	Indoor & Outdoor			A golf-course clubhouse banquet room with views over the course and a sunset staging area for ceremonies.		(307) 234-9146	https://paradisevalleyccwyo.com/banquets-weddings
Buffalo Bill Center of the West	720 Sheridan Ave	Cody	Wyoming			Historic / Estate	Indoor & Outdoor			A museum complex whose Draper Natural History Museum hosts indoor ceremonies and whose sculpture gardens have lawns and amphitheaters for summer weddings.	events@centerofthewest.org	307-578-4000	https://centerofthewest.org/visit/facility-rentals/
K3 Guest Ranch	30 Nielsen Trail	Cody	Wyoming			Barn / Rustic	Indoor & Outdoor			A guest ranch just outside Cody with indoor and outdoor ceremony spots, mountain views and lodging for the wedding party.	info@k3guestranch.com	307-587-2080	https://k3guestranch.com/groups/
Barrows Z3 Retreat	700 Main Street	Ralston	Wyoming			Garden / Outdoor	Outdoor			A small historic-cabin retreat with English gardens for outdoor ceremonies, a cabin kitchen and lodging for up to 14.	niina@pacbell.net	(949) 887-8935	https://www.barrowsz3retreat.com/events-venue
Elk Heart at Pine	6249 County Rd 211	Pine Bluffs	Wyoming			Barn / Rustic	Indoor & Outdoor		Simple	A family ranch with a timber-frame barn and covered porches for receptions and a ceremony site with bluff views, about 30 minutes from Cheyenne.	hello@elkheartatpine.com		https://elkheartatpine.com/
Teton Cabins	24000 N Gun Barrel Flats Rd	Moran	Wyoming			Barn / Rustic	Indoor & Outdoor	250	Classic	A boutique ranch with a main lodge, lawns and guest cabins that hosts small weddings and uses the adjoining Big Red Barn lawn for up to 250 guests.	weddings@tetoncabins.com		https://www.tetoncabins.com/host-your-wedding
Turpin Meadow Ranch		Moran	Wyoming			Barn / Rustic	Indoor & Outdoor			A guest ranch on the Buffalo Fork River whose grand lodge hosts weddings, sold as custom buy-out packages.	office@turpinmeadowranch.com	307-543-2000	https://turpinmeadowranch.com/events/weddings/
`,
  },
];

export default batches;
