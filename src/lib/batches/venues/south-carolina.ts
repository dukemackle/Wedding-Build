import type { VenueBatch } from "@/lib/venue-batches";

// South Carolina venue batches. Every row's State is "South Carolina". Add new batches at the end.
const batches: VenueBatch[] = [
  {
    name: "Charleston and Greenville venues",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Old Wide Awake	5149 Trexler Ave	Hollywood	South Carolina			Historic / Estate	Indoor & Outdoor	250	Classic	Historic house that once served as a store for the Stono Ferry, rented for the whole day with a bridal suite, travertine patio and built-in bar.		(843) 814-4980	https://oldwideawake.com
Hart Meadows Ranch	2837 Edenvale Rd	Johns Island	South Carolina			Barn / Rustic	Indoor & Outdoor	200		Ten-acre private ranch holding one event a day, with a cypress-ceilinged Oak Hall, a yurt, gardens under live oaks and a small private beach.	contact@hartmeadowsranch.com	843-642-7520	https://www.hartmeadowsranch.com
Avenue	110 E Court St	Greenville	South Carolina			Ballroom / Hotel	Indoor & Outdoor	200		Indoor-outdoor rooftop event space a block from Main Street, designed by Keith Summerour, with catering by Table 301.	info@avenuegreenville.com	864-686-7972	https://www.avenuegreenville.com
Riverain Farm	144 Lindsey Lake Rd	Travelers Rest	South Carolina			Barn / Rustic	Indoor & Outdoor	250	Classic	Family-run farm overlooking Lindsey Lake about 10 miles from downtown Greenville, with lakeside ceremonies and a barn for receptions.	events@riverainfarm.com		https://www.riverainfarm.com
Huguenot Loft at the Peace Center	300 S Main St	Greenville	South Carolina			Historic / Estate	Indoor	200	Classic	Former textile mill loft on the Peace Center campus with wood floors, exposed brick, high ceilings and windows facing the Reedy River.		864-467-3000	https://www.peacecenter.org/host-your-event/huguenot-loft
Lindsey Plantation	750 Camp Creek Rd	Taylors	South Carolina			Historic / Estate	Indoor & Outdoor			Working estate of more than 350 acres with mountain views, an 1890 family home with an indoor chapel, stables, courtyards and five guest bedrooms.	Lindseyplantation@gmail.com	864-304-8664	https://www.lindseyplantation.com
Kersey House	117 W Luke Ave	Summerville	South Carolina			Historic / Estate	Indoor & Outdoor	200		Renovated historic home in downtown Summerville run by chef Nico Romo, with in-house menus and indoor and outdoor event spaces.	info@nicoromohg.com	843-983-1813	https://www.kerseyhousesummerville.com/venue
Wingate Place		Johns Island	South Carolina			Garden / Outdoor	Outdoor	300		Lowcountry property between Charleston and Kiawah with big oaks, a 40x80 framed tent on a concrete pad and a farmhouse for the wedding party.	sarah@wingateplace.com	(843) 408-5963	https://wingateplace.com
Harborside East		Mount Pleasant	South Carolina			Beach / Waterfront	Indoor & Outdoor		Simple	Waterfront event building at Patriots Point facing the harbour and the Ravenel Bridge, with an air-conditioned hall and a partly covered patio.	reservations@harborsideeast.com	843-606-2718	https://www.harborsideeast.com/nav/weddings.html
Old Santee Canal Park	900 Stony Landing Rd	Moncks Corner	South Carolina			Historic / Estate	Indoor & Outdoor			195-acre park on Biggin Creek whose 1840 Stony Landing House on a bluff and creek-view Interpretive Center are rented for weddings and receptions.	parkinfo@oldsanteecanalpark.org	843-899-5200	https://www.oldsanteecanalpark.org/Rentals/Index.aspx
Charlyn Farms	4600 Dacusville Hwy	Marietta	South Carolina			Barn / Rustic	Indoor & Outdoor		Simple	Gated 52-acre property near Table Rock with mountain views and waterfalls, a barn for receptions and an on-site cottage called The Hideaway.	charlynfarms@gmail.com	864-270-1549	https://www.charlynfarms.com
Events at Judson Mill	701 Easley Bridge Rd	Greenville	South Carolina			Historic / Estate	Indoor & Outdoor	500		Refurbished textile mill with two event spaces, the Annex with a terrace and the Smokestack with a courtyard, plus in-house catering and bar.	venues@highspiritshospitality.com	(864) 248-4868	https://www.eventsatjudsonmill.com`,
  },
];

export default batches;
