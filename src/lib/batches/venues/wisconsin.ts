import type { VenueBatch } from "@/lib/venue-batches";

// Wisconsin venue batches. Every row's State is "Wisconsin". Add new batches at the end.
const batches: VenueBatch[] = [
  {
    name: "Milwaukee, Waukesha, Madison, Lake Geneva and Door County",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
The Ivy House	906 S Barclay St	Milwaukee	Wisconsin			Ballroom / Hotel	Indoor & Outdoor			Milwaukee event hall with a greenery-filled ballroom and an ivy-covered outdoor patio used for ceremonies.	events@ivyhousemke.com	414-539-3339	https://ivyhousemke.com
The Grain Exchange	225 E Michigan St	Milwaukee	Wisconsin			Historic / Estate	Indoor	350		Three-storey hall of nearly 10,000 square feet in downtown Milwaukee's Mackie Building, with frescoes and stone walls and exclusive in-house catering.	geinfo@bartolottas.com	414-727-6980	https://www.bartolottas.com/catering/venues/grain-exchange
The Pabst Mansion	2000 W Wisconsin Ave	Milwaukee	Wisconsin			Historic / Estate	Indoor	50		Historic brewer's mansion and house museum that rents its period rooms for micro weddings and small receptions.	info@pabstmansion.com	(414) 931-0808	https://www.pabstmansion.com/rental-info
Villa Terrace Museum and Gardens	2220 N Terrace Ave	Milwaukee	Wisconsin			Historic / Estate	Indoor & Outdoor			Mediterranean-style museum villa on a bluff above Lake Michigan, designed by David Adler, with terraced gardens used for ceremonies and receptions.		(414) 293-5678	https://www.villaterrace.org/host_your_event/rental_options_fees/
Rustic Manor 1848	3115 State Road 83	Hartland	Wisconsin			Barn / Rustic	Indoor & Outdoor	275		Event barn on a 12-acre property with a hayloft, outdoor patio with firepit, and a six-bedroom stone house for the wedding party.	hello@rusticmanor1848.com	262-528-3115	https://www.rusticmanor1848.com
Lilac Acres		Waukesha	Wisconsin			Barn / Rustic	Indoor & Outdoor	175		Countryside farm venue with a ceremony barn, reception hall, licensed bar and patio, and an event house where the couple can stay overnight.	info@lilacacres.com	(262) 875-7002	https://www.lilacacres.com
SALT at Newport Shores	320 N Lake St	Port Washington	Wisconsin			Beach / Waterfront	Indoor & Outdoor	125		Modern event space beside the Port Washington marina with Lake Michigan views, a waterfront promenade and exclusive catering by From Scratch.		(262) 618-4661	https://saltatnewportshores.com
Monona Terrace	1 John Nolen Dr	Madison	Wisconsin			Ballroom / Hotel	Indoor & Outdoor			Frank Lloyd Wright-designed convention centre on Lake Monona with a Madison Ballroom, rooftop gardens and in-house catering.	info@mononaterrace.com	608-261-4000	https://www.mononaterrace.com/weddings/
The Edgewater	1001 Wisconsin Pl	Madison	Wisconsin			Ballroom / Hotel	Indoor & Outdoor			Lakefront hotel on Lake Mendota with a 6,150 square foot Grand Ballroom behind tall windows, lakeside terraces, a plaza and a rooftop bar.		608-535-8200	https://www.theedgewater.com/edgewater-wedding-weekend/
The Madison Club	5 E Wilson St	Madison	Wisconsin			Ballroom / Hotel	Indoor	225		Private downtown Madison club near the lake offering inclusive wedding packages for 50 to 225 guests that bundle in a membership.	reception@madisonclub.org	608-255-4861	https://www.madisonclub.org/madisonclubweddings
Memorial Union	800 Langdon St	Madison	Wisconsin			Historic / Estate	Indoor			University of Wisconsin student union on Lake Mendota, with the Great Hall and Tripp Commons available for receptions to Wisconsin Union members.	events@union.wisc.edu	(608) 262-2511	https://union.wisc.edu/host-your-event/weddings
Olbrich Botanical Gardens	3330 Atwood Ave	Madison	Wisconsin			Garden / Outdoor	Indoor & Outdoor	150		Public botanical garden with a glass-walled Evjue Commons reception room opening onto the Lussier Terrace patio.			https://www.olbrich.org/private-event-rentals
The Abbey Resort	269 Fontana Blvd	Fontana	Wisconsin			Beach / Waterfront	Indoor & Outdoor	400		Lake Geneva resort in Fontana with a Harbor Lawn and West Shore Pavilion for lakeside ceremonies, plus a spa and guest rooms.	info@theabbeyresort.com	800-709-1323	https://www.theabbeyresort.com/lake-geneva-weddings/
The Landmark Resort	4929 Landmark Dr	Egg Harbor	Wisconsin			Ballroom / Hotel	Indoor & Outdoor	200		Door County resort in Egg Harbor with a 200-guest reception room, a terrace over the bay and a Flagship Garden for ceremonies.		920-868-3205	https://www.thelandmarkresort.com/en/weddings/
`,
  },
];

export default batches;
