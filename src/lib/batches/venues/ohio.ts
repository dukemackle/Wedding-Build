import type { VenueBatch } from "@/lib/venue-batches";

// Ohio venue batches. Every row's State is "Ohio". Add new batches at the end.
const batches: VenueBatch[] = [
  {
    name: "Columbus, Cleveland and Cincinnati",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
The Club at Corazon	7155 Corazon Dr	Dublin	Ohio			Restaurant / Vineyard	Indoor & Outdoor			Dublin club venue with a Tuscan-style clubhouse and both indoor and outdoor ceremony spaces.		614.504.5250	https://www.clubatcorazon.com/weddings
Strongwater	401 W. Town St.	Columbus	Ohio			Restaurant / Vineyard	Indoor & Outdoor			Industrial event space in a Franklinton Arts District warehouse, catered in-house by Milo's Catering.	strongwater@cateringbymilos.com	614-928-3170	https://strongwatercolumbus.com
The Kitchen	231 E. Livingston Ave	Columbus	Ohio			Restaurant / Vineyard	Indoor	140	Classic	German Village cooking venue with two neighbouring event spaces and scratch-made food from local ingredients.	info@thekitchencolumbus.com	614-225-8940	https://www.thekitchencolumbus.com/wedding-venue-columbus-ohio
The Davis-Shai House	301 Central Parkway	Heath	Ohio			Historic / Estate	Indoor & Outdoor	300	Simple	City-owned historic house with two connecting reception rooms, a veranda and landscaped front lawn for ceremonies.	admin@davisshaihouse.com	(740) 788-8942	https://www.davisshaihouse.com/weddings
Landerhaven	6111 Landerhaven Drive	Mayfield Heights	Ohio			Ballroom / Hotel	Indoor & Outdoor			Multi-room banquet centre east of Cleveland with in-house catering, bakery, decor and audio-visual teams.		(440) 449-0700	https://landerhaven.com/wedding-menus/
Stan Hywet Hall & Gardens	714 North Portage Path	Akron	Ohio			Historic / Estate	Indoor & Outdoor	175		Historic manor house and gardens in Akron with garden ceremony sites and receptions in the Manor House or Carriage House.	rentals@stanhywet.org	330-315-3210	https://www.stanhywet.org/weddings
Music Box Supper Club	1148 Main Avenue	Cleveland	Ohio			Restaurant / Vineyard	Indoor & Outdoor	250		Supper club in the Flats on the Cuyahoga riverfront with a rooftop deck for ceremonies and a private bridal suite.		216-242-1250	https://musicboxcle.com/weddings/
Glidden House	1901 Ford Drive	Cleveland	Ohio			Historic / Estate	Indoor & Outdoor	150		1910 French Gothic mansion in University Circle with 60 guest rooms, a garden gazebo and the Juniper Room for receptions.	info@gliddenhouse.com	(216) 231-8900	https://www.gliddenhouse.com/weddings
The Bell Event Centre	444 Reading Rd	Cincinnati	Ohio			Historic / Estate	Indoor & Outdoor	300		Former church with stained glass, vaulted ceilings and a cobblestone courtyard, with in-house catering and a day-of coordinator.		513.852.2787	https://belleventcentre.com/events/weddings/
Krohn Conservatory	1501 Eden Park Drive	Cincinnati	Ohio			Garden / Outdoor	Indoor	150	Simple	1933 art deco glasshouse in Eden Park with palm, fern, desert and orchid houses for ceremonies and receptions.		513.221.2610	https://www.premierparkevents.com/venues/
Gorman Heritage Farm	10052 Reading Rd.	Evendale	Ohio			Barn / Rustic	Outdoor			Working farm museum with a West Lawn ceremony site, open pavilion and marquee tents, and caterer of your choice.		513.563.6663	https://gormanfarm.org/dream-wedding/`,
  },
];

export default batches;
