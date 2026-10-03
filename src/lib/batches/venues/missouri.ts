import type { VenueBatch } from "@/lib/venue-batches";

// Missouri venue batches. Every row's State is "Missouri". Add new batches at the end.
const batches: VenueBatch[] = [
  {
    name: "Kansas City and St. Louis",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
The Guild KC	1621 Locust St	Kansas City	Missouri			Ballroom / Hotel	Indoor & Outdoor	250		A converted automotive warehouse in Kansas City with a 6,500 sq ft hall under exposed trusses and a 5,000 sq ft courtyard garden.	info@theguildkc.com	816-471-8550	https://theguildkc.com/weddings/
Loose Mansion	101 E Armour Blvd	Kansas City	Missouri			Historic / Estate	Indoor			A restored 1907 mansion near Armour Boulevard with about 15,000 sq ft of rooms, carved mahogany woodwork, fireplaces and an on-site bed and breakfast.			https://loosemansion.com/
The Elms Hotel & Spa	401 Regent St	Excelsior Springs	Missouri			Ballroom / Hotel	Indoor & Outdoor			A historic spa hotel open for more than 130 years, with two ballrooms, a garden gazebo for ceremonies and a 28,000 sq ft spa.		816-630-5500	https://www.elmshotelandspa.com/weddings.htm
White Iron Ridge	815 State Route 92 Hwy	Smithville	Missouri			Barn / Rustic	Indoor & Outdoor		Classic	A gambrel-roofed event barn on the edge of Smithville with arched ceilings, iron chandeliers and overnight guest suites on site.	amanda@whiteironridge.com	816-866-8996	https://whiteironridge.com/investment-wedding
Powell Gardens	1609 NW US Highway 50	Kingsville	Missouri			Garden / Outdoor	Indoor & Outdoor	200	Classic	A botanical garden east of Kansas City with a chapel, a lakeside Grand Hall and a Missouri Barn among its themed gardens.	events@powellgardens.org	816-697-2600	https://powellgardens.org/weddings/
Longview Estate	1200 SW Longview Park Dr	Lee's Summit	Missouri			Historic / Estate	Indoor & Outdoor	250		R.A. Long's 1914 mansion on more than 10 acres, with a lawn and sunken garden for ceremonies and a conservatory for receptions.		816-761-6669	https://www.longviewmansion.com/
Chandler Hill Vineyards	596 Defiance Rd	Defiance	Missouri			Restaurant / Vineyard	Indoor & Outdoor	250		A Missouri wine-country winery with a tasting room and covered deck overlooking its vines and the surrounding hills.	brooke@chandlerhillvineyards.com	636-798-2675	https://www.chandlerhillvineyards.com/weddings
The Cheshire	6300 Clayton Rd	St. Louis	Missouri			Ballroom / Hotel	Indoor	250	Classic	A boutique hotel by Forest Park whose upstairs reception room keeps the building's original vaulted, dark-beamed ceiling.	cheshire@cheshirestl.com	314-647-7300	https://www.cheshirestl.com/weddings-events/cheshire-weddings
The Noble	3611 S Grand Blvd	St. Louis	Missouri			Historic / Estate	Indoor	220		A 1928 South Grand bank building restored to its Art Deco detail, keeping the original vault, columns and chandeliers.	info@culinarycanvasstl.com	314-252-8130	https://thenoblestl.com/weddings/
The Hawthorn	2231 Washington Ave	St. Louis	Missouri			Ballroom / Hotel	Indoor	500		A downtown event hall of over 10,000 sq ft near City Stadium, with two full bars and four suites with private showers.	events@thehawthornstl.com	314-887-0877	https://www.thehawthornstl.com/
Missouri Botanical Garden	4344 Shaw Blvd	St. Louis	Missouri			Garden / Outdoor	Indoor & Outdoor			A 79-acre botanical garden in south St. Louis with indoor and outdoor ceremony and reception sites booked through its in-house caterer.		314-577-0200	https://www.missouribotanicalgarden.org/events-classes/private-events-rentals`,
  },
];

export default batches;
