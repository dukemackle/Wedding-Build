import type { VenueBatch } from "@/lib/venue-batches";

// New Mexico venue batches. Every row's State is "New Mexico". Add new batches at the end.
const batches: VenueBatch[] = [
  {
    name: "Santa Fe, Taos, Las Cruces and Ruidoso venues",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Inn of the Five Graces	150 East DeVargas St	Santa Fe	New Mexico			Hotel & Resort	Indoor & Outdoor	130		A 27-room boutique hotel in an old downtown Santa Fe neighbourhood, with two walled courtyards, a balcony over San Miguel Mission and the Pink Adobe for receptions.	GuestServices@FiveGraces.com	505.992.0957	https://fivegraces.com/experiences/weddings-celebrations/
Inn and Spa at Loretto	211 Old Santa Fe Trail	Santa Fe	New Mexico			Hotel & Resort	Indoor & Outdoor	200		A downtown Santa Fe hotel beside the 1876 Loretto Chapel, with two ballrooms, a sculpture garden, an event lawn and a penthouse suite with five terraces.	nmreservations@hhandr.com	505-988-5531	https://www.hotelloretto.com/meetings-weddings/weddings
Neptune Event Space		Santa Fe	New Mexico			Ballroom	Indoor & Outdoor	80		A restored adobe home and working art studio on Canyon Road with about 700 square feet indoors and private gardens, plus a nearby gallery for larger groups.		(505) 982-9668	https://www.santafewedding.love/
Rio Grande Winery	5321 N Highway 28	Las Cruces	New Mexico			Vineyard & Winery	Indoor & Outdoor	500		A winery on Highway 28 among pecan orchards near Las Cruces, with five separate event spaces indoors and out and full-service catering.	info@riograndewinery.com	(575) 201-3744	https://riograndewinery.com/
Hotel Encanto de Las Cruces	705 South Telshor Blvd	Las Cruces	New Mexico			Hotel & Resort	Indoor & Outdoor			A Las Cruces resort hotel with a 5,000-square-foot ballroom, a second divisible ballroom, a garden courtyard and a poolside lawn for ceremonies and receptions.	nmreservations@hhandr.com	575-522-4300	https://www.hotelencanto.com/meeting-wedding
Taos Art Museum at Fechin House	227 Paseo del Pueblo Norte	Taos	New Mexico			Museum, Gallery & Rooftop	Indoor & Outdoor	150	Simple	The hand-built adobe home and studio of painter Nicolai Fechin, now a museum, with a mountain-view garden for 150 guests and a studio room for 50.		(575) 758-2690	https://www.taosartmuseum.org/museum-rental.html
Prairie Star Restaurant	288 Prairie Star Rd	Santa Ana Pueblo	New Mexico			Restaurant & Brewery	Indoor & Outdoor			A restored adobe restaurant on a golf course at Santa Ana Pueblo with Sandia Mountain views, private indoor rooms and a patio, hosting weddings since 1986.		505.867.3327	https://prairiestarrestaurant.com/
Inn on La Loma Plaza	315 Ranchitos Rd	Taos	New Mexico			Ranch	Outdoor	75		A walled adobe hacienda in Taos with a secluded garden and ten guest rooms, hired for exclusive use on the wedding day alongside a two-night stay.	info@vacationtaos.com	1-800-530-3040	https://www.vacationtaos.com/Weddings.html
SpiriTaos Gardens		Taos	New Mexico			Garden & Park	Outdoor	24		A flower-filled garden in El Prado near Taos with ponds, a stream, a meadow and a covered ramada, sized for elopements and weddings of up to 24 guests.		720-849-5967	https://www.embracingceremony.com/micro-wedding-venue/
Innsbrook Village	146 Geneva Drive	Ruidoso	New Mexico			Hotel & Resort	Indoor & Outdoor			A mountain resort community in Ruidoso with a clubhouse for ceremonies and receptions, a private lake, a par-3 golf course and rentable townhomes and condos.	resort@innsbrookruidoso.com		https://innsbrookruidoso.com/planning-a-wedding-in-scenic-ruidoso-nm/
Abiquiú Inn	21120 US Highway 84	Abiquiu	New Mexico			Hotel & Resort				An adobe inn on Highway 84 in Abiquiu with garden terraces, a sculpture garden and a cafe, next to the O'Keeffe Welcome Center, open to weddings and gatherings.	info@abiquiuinn.com	505-685-4378	https://www.abiquiuinn.com/events
`,
  },
  {
    name: "Albuquerque, Taos, Las Cruces, Los Alamos and Farmington venues",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
The Blue Door Venue	1750 Calle de Mercado	Las Cruces	New Mexico			Ranch		150		Hacienda-style event venue in Las Cruces that hosts weddings and other celebrations for up to 150 guests.	hello@bluedoorvenue.com	(575) 800-0802	https://bluedoorvenue.com/
Placitas Winery	26 Camino de los Pueblitos	Placitas	New Mexico			Vineyard & Winery	Outdoor			Small family winery in Placitas with an open-air pavilion that it books for weddings and private events.	info@placitaswinery.com	505-363-5606	https://www.placitaswinery.com/weddings
Sombra Antigua Vineyard & Winery	430 La Vina Rd	Anthony	New Mexico			Vineyard & Winery	Outdoor			Vineyard and winery on the Texas line that offers micro, tasting-room and large meadow event sizes for celebrations.	winery@sombraantigua.com	915-241-4349	https://sombraantigua.com/bookevent
Picacho Hills Country Club	6861 Via Campestre	Las Cruces	New Mexico			Country Club & Golf	Indoor & Outdoor			Golf club with a dining room, a private banquet room and an outdoor terrace facing the Organ Mountains for ceremonies and receptions.	bailey@sgmsouthwest.com	575-523-8641	https://www.picachohills.com/event-wedding
Pajarito Lodge	397 Camp May Rd	Los Alamos	New Mexico			Mountain & Lodge	Indoor & Outdoor	160		Ski-area lodge at the base of Pajarito Mountain seating 160 inside and 176 on the deck, with a mountaintop ceremony possible.		(505) 662-5725	https://www.pajarito.ski/weddings/
Hotel Willa	233 Paseo del Pueblo Sur	Taos	New Mexico			Hotel & Resort	Indoor & Outdoor	200		Taos hotel whose lawn faces the Couse pasture and Sangre de Cristo range, plus an indoor gallery holding 100 guests.	taosevents@casetta.com	575.305.7711	https://www.hotelwilla.com/meetings-events
Delta Event Center	233 N Paseo de Onate	Española	New Mexico			Ballroom	Indoor & Outdoor			Event hall in Española with indoor rooms and a garden patio, hosting wedding ceremonies and receptions.	dginnm@gmail.com	505-901-1967	https://www.deltaeventcenter.com
El Zocalo Event Center	264 S Camino del Pueblo	Bernalillo	New Mexico			Ranch	Indoor & Outdoor	200	Simple	Hacienda-style event centre with adobe walls and kiva fireplaces, a 2,400 sq ft historic building and a 3,750 sq ft courtyard.		505-867-8687	https://seesandoval.org/el-zocalo-plaza
Sandia Resort & Casino	30 Rainbow Rd NE	Albuquerque	New Mexico			Hotel & Resort				Casino resort with 50,000 sq ft of event space, including a grand ballroom, mountain views, on-site catering and a wedding team.		(505) 796-7500	https://www.sandiacasino.com/hotel/weddings/
Albuquerque Country Club	601 Laguna Blvd SW	Albuquerque	New Mexico			Country Club & Golf	Indoor & Outdoor			Country club with a windowed ballroom, a bridal room, in-house catering and grounds shaded by old cottonwood trees.		505-247-4111	https://albuquerquecountryclub.org/Events/Weddings_Banquets
Bear Mountain Lodge	60 Bear Mountain Ranch Rd	Silver City	New Mexico			Mountain & Lodge	Indoor & Outdoor			Former 1920s ranch school turned lodge on 178 acres beside the Gila National Forest, taking wedding and elopement enquiries.	info@bearmountainlodge.com	575-538-2538	https://www.bearmountainlodge.com/event-inquiry
Rancho Los Alamos Event Venue	3349A US-64	Waterflow	New Mexico			Ranch	Indoor & Outdoor			Country venue west of Farmington with a barn and saloon, gazebo and stage under cottonwoods, a short walk from the San Juan River.	rancholosalamosnm@gmail.com	(505) 860-5103	https://rancholosalamosnm.com
Hotel Luna Mystica		Taos	New Mexico			Hotel & Resort	Outdoor			Vintage trailer hotel and campground on the Taos mesa with a grass ceremony circle, a 2,400 sq ft covered pavilion and a full buyout option.	reservations@hotellunamystica.com		https://www.hotellunamystica.com
Ruidoso Convention Center	111 Sierra Blanca Dr	Ruidoso	New Mexico			Ballroom	Indoor			Convention centre with an exhibit hall and six meeting rooms that can be divided to suit an intimate or large wedding reception.	sales@ruidosoconventioncenter.com	(575) 258-5445	https://ruidosoconventioncenter.com/weddings
Triple J Ranch Events	215 County Rd 6100	Farmington	New Mexico			Ranch	Indoor & Outdoor			Old-West style setting on a private 300-acre working ranch, with late-1800s buildings including a rustic barn and a saloon.		970-382-1819	https://www.tjrevents.com
`,
  },
  {
    name: "Map fill, eastern and southern towns",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Pecos Flavors Winery + Bistro	412 W 2nd St	Roswell	New Mexico			Vineyard & Winery	Indoor			Downtown Roswell winery and bistro that hosts wedding receptions and private events, with its own sales and catering team.	info@pecosflavorswinery.com	575-627-6265	https://pecosflavorswinery.com/private-rentals-2/
Clovis Civic Center	801 Schepps Blvd	Clovis	New Mexico			Ballroom	Indoor & Outdoor			City civic centre with separate rooms for ceremony, reception and bridal suite, outdoor options, and its own catering menu.	Sales@ClovisCivicCenter.com	575-935-5009	https://www.clovisnm.gov/396
BrickStreet Warehouse	321 N Main St	Clovis	New Mexico			Industrial Loft & Warehouse				Rustic warehouse event space in downtown Clovis, shown by appointment, with wedding packages named Pearl, Ruby, Emerald and Diamond.	brickstreetwarehouse@hotmail.com	575-693-1023	https://www.brickstreetwarehouse.net/
Citizens Bank of Clovis Events Center	1900 E Brady Ave	Clovis	New Mexico			Ballroom	Indoor			County events complex whose indoor pavilion, open since autumn 2025, is set aside for weddings, alongside an arena and livestock hall.	events@curryeventscenter.com	575-935-7000	http://curryeventscenter.com
The Valley Venue		Carlsbad	New Mexico			Ballroom	Indoor			Climate-controlled event hall about ten minutes from downtown Carlsbad, with an open floor plan, bar area and upstairs bridal suite.			https://www.thevvnm.com/
Washington Ranch	18 Rattlesnake Springs Rd	Carlsbad	New Mexico			Ranch	Indoor & Outdoor			Desert ranch of more than 4,000 acres with a main house, kitchen, conference centre and atrium, run by a disability-services charity.		575-785-2228	https://campwashingtonranch.org/
Artesia Center		Artesia	New Mexico			Ballroom	Indoor			City-owned community hall with a 7,000 sq ft main room and a kitchen, bookable for weddings and quinceañeras at hourly rates.			https://www.artesianm.gov/240/Parks
The Barn at Tinsley Crossing	41701 US Highway 70	Portales	New Mexico			Barn & Farm				Barn venue on the US 70 corridor near Portales that hosts weddings and quinceañeras, from large parties to small gatherings.		575-567-2824	https://www.tinsleycrossingbarn.com/weddings-events
The Patio at Heart of the Desert	7288 Hwy 54/70	Alamogordo	New Mexico			Restaurant & Brewery	Outdoor	150		Tuscan-style outdoor patio of 2,350 sq ft among the pistachio trees, with a stage, warming kitchen and sunset views.	events@heartofthedesert.com		https://www.heartofthedesert.com/private-events/
D.H. Lescombes Winery & Bistro Sunset Room	261 Panorama Blvd	Alamogordo	New Mexico			Vineyard & Winery	Indoor	65		Private room at a desert winery and bistro, with wine barrels, plants and a vineyard view, and catering on site.	alamoevents@lescombeswinery.com	575-616-5595	https://lescombeswinery.com/event-space-alamogordo/
Cloudcroft Museum Chapel	1000 Highway 82	Cloudcroft	New Mexico			Museum, Gallery & Rooftop	Indoor			Small log chapel built as a railroad office in 1899, now in the museum's Pioneer Village and rented for small ceremonies.	smhsmuseum@yahoo.com	575-682-2932	https://cloudcroftmuseum.com/chapel/
D.H. Lescombes Winery & Tasting Room	7075 Hwy 549 SE	Deming	New Mexico			Vineyard & Winery	Indoor & Outdoor			Winery with a special events centre, grassy grounds under shade trees and a covered patio, available for weddings.	tastingroom@lescombeswinery.com	(575) 546-1179	https://lescombeswinery.com/locations/deming/
Plaza Hotel Las Vegas	230 Plaza	Las Vegas	New Mexico			Hotel & Resort	Indoor	180		Hotel opened in 1882 on the Old Town Plaza, with the Ilfeld Ballroom, a bridal suite upstairs and a grand staircase.	reservations@plazahotellvnm.com	505-425-3591	https://plazahotellvnm.com/events/`,
  },
  {
    name: "Map fill: Hobbs, Carlsbad",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Rockwind Community Links	5001 Jack Gomez Blvd	Hobbs	New Mexico			Country Club & Golf	Indoor & Outdoor			City-run golf course whose clubhouse and grill host weddings and receptions, with an open green space and outdoor seating nearby.		(575) 397-9297	https://www.rockwindgolfcourse.com/events/weddings-banquets/weddings-receptions
Pecos River Village Conference Center	711 Muscatel Ave	Carlsbad	New Mexico			Ballroom	Indoor			Riverside city-owned conference centre whose Carousel House banquet hall and meeting rooms are open for weddings, with the Carlsbad Chamber handling bookings.		575-887-6516	https://www.carlsbadchamber.com/general-4`,
  },
  {
    name: "Deming: ballroom",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Mimbres Valley Special Events Center	2300 E. Pine Street	Deming	New Mexico			Ballroom	Indoor	700		County-run banquet hall in Deming with a 700-seat ballroom and three conference rooms, advertised for weddings and receptions.	planning_assistant@lunacountynm.us	(575) 543-6620	https://www.cityofdeming.org/residents/mimbres_valley_special_events_center.php`,
  },
  {
    name: "Albuquerque, Santa Fe and northern towns",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price from	Price basis	Description	Email	Phone	Website
Heritage House Inn	4036 Corrales Rd	Corrales	New Mexico			Historic Mansion & Estate	Indoor & Outdoor	180			Turn-of-the-century Victorian farmhouse in Corrales with grounds for ceremonies and receptions, a bridal suite and inn rooms.	inn@heritagehousenm.com	505-221-6141	https://heritagehousenm.com/weddings/
La Grande Maison Lumiere Event Center	3741 NM-528 NW	Albuquerque	New Mexico			Ballroom	Indoor	150			Indoor event hall on Highway 528 that provides chairs, linens, tables and staff for weddings.	info@lagrandemaisonlumiereeventcenter.com	505-639-0048	https://lagrandemaisonlumiereeventcenter.com/
Indian Pueblo Cultural Center	2401 12th St NW	Albuquerque	New Mexico			Museum, Gallery & Rooftop	Indoor & Outdoor	500			Pueblo-run cultural center that rents indoor and courtyard spaces for wedding receptions with on-site catering.		(505) 724-3509	https://indianpueblo.org/meetings-parties-events/
National Hispanic Cultural Center	1701 4th St SW	Albuquerque	New Mexico			Museum, Gallery & Rooftop	Indoor & Outdoor	300	9500	Package	South Valley arts campus with a courtyard, hall and memorial park, offering a wedding package for ceremony and reception.	info.nhcc@state.nm.us	(505) 246-2261	https://nhccnm.org/
Sid Cutter Pilots' Pavilion		Albuquerque	New Mexico			Garden & Park	Indoor & Outdoor	560	600	Rental	City-run pavilion at Balloon Fiesta Park, rentable by the day in three sizes, with an adjacent field panel usable for ceremonies.		505-768-6062	https://cabq.gov/parksandrecreation/parks/balloon-fiesta-park/sid-cutter-pilots-pavilion-facility-information
Balloon Fiesta Park Event Center		Albuquerque	New Mexico			Garden & Park	Indoor & Outdoor	250	750	Rental	City-run banquet hall at Balloon Fiesta Park with an outdoor patio, gazebo, pergola and fire pit.		505-768-6062	https://www.cabq.gov/parksandrecreation/parks/balloon-fiesta-park/event-center-facility-information
The Luna Mansion	119 SW Main St	Los Lunas	New Mexico			Historic Mansion & Estate	Indoor & Outdoor				Historic downtown Los Lunas building offering indoor and outdoor space for weddings and elopements.	lunamansion.events@gmail.com		https://www.thelunamansion.com/
The Magnolia Event Center		Bernalillo	New Mexico			Ballroom	Indoor				Bernalillo event hall that lists weddings among its events and quotes by request.	carolynandlily@themagnoliaeventcenternm.com	719-963-8059	https://themagnoliaeventcenter.org/
The View Event Center		Albuquerque	New Mexico			Ballroom	Indoor & Outdoor				Two-story event space with indoor and outdoor areas and city views, by appointment only.			https://thevieweventcenter.com
Taos Country Club	54 Golf Course Drive	Ranchos de Taos	New Mexico			Country Club & Golf					A desert golf club near Taos with wedding planning offered on its site.		(575) 758-7300	https://www.taoscountryclub.com
Angel Fire Resort		Angel Fire	New Mexico			Hotel & Resort	Indoor & Outdoor	150			A mountain resort in the Sangre de Cristo range with indoor ballroom space, a private wedding pavilion and dedicated wedding planners.	cwhetsell@AngelFireResort.com	575-377-4216	https://www.angelfireresort.com/weddings
Red River Conference Center	101 W River St	Red River	New Mexico			Ballroom	Indoor & Outdoor	400			A town-run exhibit hall seating about 400, with a commercial kitchen, bar service, an outdoor pavilion and a covered bridge for ceremonies.		575-754-1708	http://redriver.org/weddings/
Beck & Bulow Ranch		Lamy	New Mexico			Ranch	Indoor & Outdoor				A working ranch in Lamy hosting weddings in a barn with mountain views and tented setups, with a 100-guest minimum for its Matanza dinner package.			https://www.beckandbulow.com/pages/beck-bulow-ranch`,
  },
];

export default batches;
