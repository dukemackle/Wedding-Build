import type { VenueBatch } from "@/lib/venue-batches";

// North Dakota venue batches. Every row's State is "North Dakota". Add new batches at the end.
const batches: VenueBatch[] = [
  {
    name: "Fargo, Bismarck–Mandan, Grand Forks and Minot",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Brewhalla		Fargo	North Dakota			Restaurant / Vineyard	Indoor	360		Brewery, market and 40-room boutique hotel complex with two event halls, the larger seating 360, beside the Drekker brewery.		701-532-0506	https://brewhalla.co/weddings/
The Pines	4487 165th Ave SE	Davenport	North Dakota			Barn / Rustic	Indoor & Outdoor	400		Two barn-style event buildings, Pines White and Pines Black, on a 17-acre rural property about ten miles from the Fargo-West Fargo metro.		(701) 645-3274	https://thepinesvenue.com/weddings/
Lake Elsie Wedding Barn	16602 94th St SE	Hankinson	North Dakota			Barn / Rustic	Indoor & Outdoor	300		Historic Gothic-arch barn and a 60 by 60 foot pavilion on five acres between two lakes, with an on-site bed and breakfast.		701-640-9692	https://lakeelsieweddingbarn.com/
Sixteen03 Main Events	1603 East Main Ave	Bismarck	North Dakota			Historic / Estate	Indoor	450		Event centre in a 1916 warehouse that later housed the Sweetheart Bakery, with exposed industrial rooms and in-house catering.	info@sixteen03mainevents.com	701-255-6246	https://sixteen03mainevents.com/
Bonanzaville	1351 Main Ave W	West Fargo	North Dakota			Historic / Estate	Indoor			Pioneer-village museum grounds where couples can book the event centre, a hangar, a church or a town hall for the ceremony and reception.	Cstoddard@Bonanzaville.com	701-282-2822	https://www.bonanzaville.org/copy-of-venues
1908 House	14881 13th St NE	Hatton	North Dakota			Barn / Rustic	Indoor & Outdoor			Five-acre property with a Victorian house, a renovated two-story barn, a large tent and a riverside ceremony spot with white church pews.	1908houseevents@gmail.com	701-261-0497	https://1908house.com/
Avalon Events Center	2525 9th Ave S	Fargo	North Dakota			Ballroom / Hotel	Indoor	250		Event centre in south Fargo with five ballrooms from a 20-guest board room to a 250-plus main hall, plus in-house catering.		(701) 478-9600	https://avaloneventscenter.com/events/weddings/
Fargo Air Museum	1609 19th Ave N	Fargo	North Dakota			Historic / Estate	Indoor & Outdoor			Aviation museum whose two hangars and ramp host ceremonies and receptions among restored aircraft, with a micro-wedding option for 75.		701-293-8043	https://fargoairmuseum.org/weddings
The Olive Ann Hotel	14 N 4th St	Grand Forks	North Dakota			Ballroom / Hotel	Indoor	350		Boutique hotel in downtown Grand Forks with a fifth-floor event space, a small lounge and the separate Opal event space around the corner.	info@theoliveannhotel.com	(701) 670-1354	https://www.theoliveannhotel.com/weddings
Regency Event Center	104 1st Ave SE	Minot	North Dakota			Historic / Estate	Indoor	250		All-inclusive event hall on the second floor of the former downtown YMCA, with a high-ceilinged ballroom seating 250.	events@regencyminot.com	701-630-6400	https://www.regencyminot.com/
The Post	3711 Highway 1806 S	Mandan	North Dakota			Historic / Estate	Indoor			Remodelled event hall south of Mandan, surrounded by historic buildings that serve as photo backdrops.		701-306-9887	https://www.thepostmandan.com/
Central Station	111 Collins Ave	Mandan	North Dakota			Restaurant / Vineyard	Indoor			Industrial-style bar and event space in Mandan with a full bar of local beer and cocktails, rented out for wedding receptions.	centralstationmandan@gmail.com	(701) 751-2244	https://www.centralstationmandan.com/events/
The Barn at 52 Pines	3220 Grayson Dr	Burlington	North Dakota			Barn / Rustic	Indoor & Outdoor	300	Simple	Large all-season barn a few miles outside Minot with two prep suites, outdoor ceremony areas and seating included for up to 300.	reservations@52pines.com	(701) 822-0408	https://www.52pines.com/
South 40 Events		Bismarck	North Dakota			Barn / Rustic	Indoor & Outdoor			Former dairy-farm barn with two floors, plus a converted pole-barn pavilion and two outdoor ceremony sites on farmland outside Bismarck.	info@southfortyevents.com	(719) 650-4984	https://www.southfortyevents.com/
Prairie Meadows Events	3835 Highway 3	Dawson	North Dakota			Barn / Rustic	Indoor & Outdoor	511		Family farm on 30 acres between Bismarck and Jamestown with a barn, vintage chapel, farmhouse, wedding pavilion and camping for guests.	Prairiemeadowsevents@gmail.com	701-316-0216	https://www.pmevenue.com/
`,
  },
  {
    name: "Fargo, Grand Forks, Hatton and Ayr",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Jasper Hotel	215 Broadway N	Fargo	North Dakota			Ballroom / Hotel	Indoor			Boutique downtown Fargo hotel whose event spaces have views over the city and host weddings, rehearsals and day-after brunches.	info@jasperfargo.com	(701) 532-2150	https://jasperfargo.com/spaces/weddings/
Plains Art Museum	704 1st Ave N	Fargo	North Dakota			Historic / Estate	Indoor	150		Art museum in downtown Fargo where the timber-beamed Landfield Atrium seats up to 150 for receptions among the galleries.		701-551-6100	https://plainsart.org/facility-rentals/
Naastad Acres	14969 16th Street NE	Hatton	North Dakota			Barn / Rustic	Indoor & Outdoor	450		Wedding-focused farm built around a little red barn, with a pergola courtyard, a bull pen event space and on-site rooms for up to 35 guests.		701-317-8221	https://www.naastadacreshatton.com/weddingsevents
Lone Oak Farm Event Venue	14641 28th Street SE	Ayr	North Dakota			Barn / Rustic	Indoor & Outdoor	350		Forty-acre Red River Valley farmstead with a 30-foot-ceilinged barn grand hall, a tiered stone amphitheatre for ceremonies and over a mile of walking paths.	loneoakfarmvenue@gmail.com	701-639-0055	https://www.loneoakfarmvenue.com/the-venue
Alerus Center	1200 South 42nd Street	Grand Forks	North Dakota			Ballroom / Hotel	Indoor	600		Large Grand Forks events centre whose ballroom can be divided into a junior, single or entire ballroom, taking weddings from 50 to over 600 guests.		701-792-1200	https://www.aleruscenter.com/
`,
  },
  {
    name: "Statewide: Devils Lake, Grand Forks, Bismarck, Minot and Medora",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Eastbay Campground (Odessa Event Center)	3892 Eastbay Road	Warwick	North Dakota			Beach / Waterfront	Indoor & Outdoor	400		Lakeside event hall on the east shore of Devils Lake with vaulted ceilings, a balcony and a gazebo, plus in-house catering.	info@eastbaycampground.com	701-398-5184	https://eastbaycampground.com/event-center/
Bagg Bonanza Farm	8025 169th Ave SE	Mooreton	North Dakota			Barn / Rustic	Indoor			Fully finished barn on a National Historic Landmark bonanza farm near Mooreton, hosting weddings, receptions and showers.	baggbonanzafarm@gmail.com	(701) 361-6572	https://www.baggbonanzafarm.com/weddings
Empire Arts Center	415 DeMers Avenue	Grand Forks	North Dakota			Ballroom / Hotel	Indoor			Downtown Grand Forks arts centre whose gallery can host wedding receptions, with a theatre and studio stage also available to hire.	info@empireartscenter.com	701-746-5500	https://www.empireartscenter.com/rent
Gorecki Alumni Center	3501 University Ave	Grand Forks	North Dakota			Ballroom / Hotel	Indoor	225	Simple	University alumni centre with a community room, lobby and bridal rooms, plus a campus chapel on the English Coulee for ceremonies.	events@thegorecki.com	701-777-2611	https://undalumni.org/gorecki-alumni-center/weddings.html
North Dakota's Gateway to Science	1600 Canary Ave	Bismarck	North Dakota			Ballroom / Hotel	Indoor & Outdoor	320		Science centre on the Missouri River with a wrap-around deck for ceremonies and an atrium and upstairs space for the reception.	events@gscience.org	701-751-6912	https://gatewaytoscience.org/visit/private-event-rentals/weddings/
Scandinavian Heritage Park	1020 South Broadway	Minot	North Dakota			Garden / Outdoor	Indoor & Outdoor		Simple	Nordic heritage park in Minot where couples marry in a replica Gol stave church or on the grounds outdoors, with fees published.	scandha@srt.com	701-852-9161	https://scandinavianheritage.org/rental-fees
The Shores at Woodland Resort	1012 Woodland Drive	Devils Lake	North Dakota			Beach / Waterfront	Indoor & Outdoor	400		Lakeside event hall at Woodland Resort on Devils Lake, with a waterfront patio, ceremony area, get-ready suites and on-site catering.	Shores@gondtc.com	(701) 662-5996	https://www.theshoresevents.com
Belle Mehus Auditorium	201 North 6th Street	Bismarck	North Dakota			Historic / Estate	Indoor			Historic downtown Bismarck auditorium rented for weddings, with event coordinators to help couples plan the day.		701-355-1370	https://bismarckeventcenter.com/weddings/
Town Square Showhall (Medora)		Medora	North Dakota			Ballroom / Hotel	Indoor	230	Simple	Indoor hall in downtown Medora with overhead string lighting, seating plated dinners for up to 200 or buffets for 230.		701-394-8815	https://medora.com/groups/venues/
`,
  },
  {
    name: "Statewide: Fargo, Bismarck, Mandan, Dickinson, Medora and Fort Ransom",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Sanctuary Events Center	670 4th Ave N	Fargo	North Dakota			Historic / Estate	Indoor		Simple	Full-service downtown Fargo event venue for weddings and concerts, with in-house caterer Chef's Table and a full-day all-inclusive wedding package.	info@sanctuaryevents.com	(701) 404-9006	https://www.sanctuaryevents.com/
Synclaire	613 1st Avenue N	Fargo	North Dakota			Historic / Estate	Indoor			Three-storey, 20,000 square foot downtown Fargo building from the early 1900s with a Great Hall, a two-storey Grand Ballroom on the second floor, a gallery and third-floor dressing suites.			https://www.synclairevenue.com/
Ivy & Rose Warehouse	22 14 1/2 St N	Fargo	North Dakota			Ballroom / Hotel	Indoor			Downtown Fargo warehouse that doubles as an artists' studio space and hosts weddings and other events.	helloivyandrose@gmail.com		https://www.ivyandrosewarehouse.com/
The 44 Venue	15 Main Ave	Colfax	North Dakota			Ballroom / Hotel	Indoor & Outdoor	400		Modern venue on the edge of Colfax with a Legacy Hall under 25-foot ceilings, a terrace for ceremonies overlooking a pond, a patio and getting-ready suites.		(701) 428-1264	https://the44venue.com/
Venue Twenty5	3796 ND Highway 25	Mandan	North Dakota			Barn / Rustic	Indoor & Outdoor	220		Six-plus acres of tree rows holding a former schoolhouse with a bar and two stone fireplaces, plus a heated pavilion and an outdoor deck and patio.	hello@venuetwenty5.com	701-306-9887	https://www.venuetwenty5.com/
Eclipse Venue	118 S 3rd Street	Bismarck	North Dakota			Ballroom / Hotel	Indoor	300		Downtown Bismarck venue with exposed brick, large windows and a private bridal suite, able to host ceremony and reception in the same room.	hello@eclipsevenue.com	(701) 955-9171	https://www.eclipsevenue.com/
August House Venue	10860 33rd St SW	Dickinson	North Dakota			Garden / Outdoor	Indoor & Outdoor	300		Light-filled white-walled event venue on 20 acres south-west of Dickinson, with indoor and outdoor bars and ceremony options.	augusthousevenue@gmail.com		https://augusthousevenue.com/
Badlands Ministries (Medora)	3892 Bible Camp Road	Medora	North Dakota			Barn / Rustic	Indoor & Outdoor	200		Badlands camp and retreat site renting a 200-seat dining hall and a 100-seat chapel for weddings, with cabins and a retreat centre for guests to stay on site.		701-290-8482	https://www.badlandsministries.org/site
Stiklestad Lodge	6459 119th Avenue SE	Fort Ransom	North Dakota			Barn / Rustic	Indoor & Outdoor	88	Simple	Rural lodge in the Sheyenne valley running since 1993, with a main lodge, learning centre, event centre, eight guest cabins and outdoor wedding grounds.	info@stiklestadlodge.com	701-973-2149	https://www.stiklestadlodge.com/
Lewis & Clark Riverboat	1700 River Road	Bismarck	North Dakota			Beach / Waterfront				Missouri River riverboat run by the Fort Abraham Lincoln Foundation that takes wedding ceremonies, receptions and private charters.		701-255-4233	https://www.lewisandclarkriverboat.com/
North Dakota Heritage Center and State Museum	612 East Boulevard Avenue	Bismarck	North Dakota			Historic / Estate	Indoor & Outdoor	90		State museum in Bismarck whose glass Northern Lights Atrium can be rented after hours, with the Badlands Plaza outside for receptions.	history@nd.gov	701-328-2666	https://statemuseum.nd.gov/about/rentals
`,
  },
];

export default batches;
