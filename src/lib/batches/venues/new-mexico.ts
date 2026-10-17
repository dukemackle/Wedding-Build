import type { VenueBatch } from "@/lib/venue-batches";

// New Mexico venue batches. Every row's State is "New Mexico". Add new batches at the end.
const batches: VenueBatch[] = [
  {
    name: "Santa Fe, Taos, Las Cruces and Ruidoso venues",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Inn of the Five Graces	150 East DeVargas St	Santa Fe	New Mexico			Historic / Estate	Indoor & Outdoor	130		A 27-room boutique hotel in an old downtown Santa Fe neighbourhood, with two walled courtyards, a balcony over San Miguel Mission and the Pink Adobe for receptions.	GuestServices@FiveGraces.com	505.992.0957	https://fivegraces.com/experiences/weddings-celebrations/
Inn and Spa at Loretto	211 Old Santa Fe Trail	Santa Fe	New Mexico			Ballroom / Hotel	Indoor & Outdoor	200		A downtown Santa Fe hotel beside the 1876 Loretto Chapel, with two ballrooms, a sculpture garden, an event lawn and a penthouse suite with five terraces.	nmreservations@hhandr.com	505-988-5531	https://www.hotelloretto.com/meetings-weddings/weddings
Neptune Event Space		Santa Fe	New Mexico			Historic / Estate	Indoor & Outdoor	80		A restored adobe home and working art studio on Canyon Road with about 700 square feet indoors and private gardens, plus a nearby gallery for larger groups.		(505) 982-9668	https://www.santafewedding.love/
Rio Grande Winery	5321 N Highway 28	Las Cruces	New Mexico			Restaurant / Vineyard	Indoor & Outdoor	500		A winery on Highway 28 among pecan orchards near Las Cruces, with five separate event spaces indoors and out and full-service catering.	info@riograndewinery.com	(575) 201-3744	https://riograndewinery.com/
Hotel Encanto de Las Cruces	705 South Telshor Blvd	Las Cruces	New Mexico			Ballroom / Hotel	Indoor & Outdoor			A Las Cruces resort hotel with a 5,000-square-foot ballroom, a second divisible ballroom, a garden courtyard and a poolside lawn for ceremonies and receptions.	nmreservations@hhandr.com	575-522-4300	https://www.hotelencanto.com/meeting-wedding
Taos Art Museum at Fechin House	227 Paseo del Pueblo Norte	Taos	New Mexico			Historic / Estate	Indoor & Outdoor	150	Simple	The hand-built adobe home and studio of painter Nicolai Fechin, now a museum, with a mountain-view garden for 150 guests and a studio room for 50.		(575) 758-2690	https://www.taosartmuseum.org/museum-rental.html
Prairie Star Restaurant	288 Prairie Star Rd	Santa Ana Pueblo	New Mexico			Restaurant / Vineyard	Indoor & Outdoor			A restored adobe restaurant on a golf course at Santa Ana Pueblo with Sandia Mountain views, private indoor rooms and a patio, hosting weddings since 1986.		505.867.3327	https://prairiestarrestaurant.com/
Inn on La Loma Plaza	315 Ranchitos Rd	Taos	New Mexico			Historic / Estate	Outdoor	75		A walled adobe hacienda in Taos with a secluded garden and ten guest rooms, hired for exclusive use on the wedding day alongside a two-night stay.	info@vacationtaos.com	1-800-530-3040	https://www.vacationtaos.com/Weddings.html
SpiriTaos Gardens		Taos	New Mexico			Garden / Outdoor	Outdoor	24		A flower-filled garden in El Prado near Taos with ponds, a stream, a meadow and a covered ramada, sized for elopements and weddings of up to 24 guests.		720-849-5967	https://www.embracingceremony.com/micro-wedding-venue/
Innsbrook Village	146 Geneva Drive	Ruidoso	New Mexico			Ballroom / Hotel	Indoor & Outdoor			A mountain resort community in Ruidoso with a clubhouse for ceremonies and receptions, a private lake, a par-3 golf course and rentable townhomes and condos.	resort@innsbrookruidoso.com		https://innsbrookruidoso.com/planning-a-wedding-in-scenic-ruidoso-nm/
Abiquiú Inn	21120 US Highway 84	Abiquiu	New Mexico			Ballroom / Hotel				An adobe inn on Highway 84 in Abiquiu with garden terraces, a sculpture garden and a cafe, next to the O'Keeffe Welcome Center, open to weddings and gatherings.	info@abiquiuinn.com	505-685-4378	https://www.abiquiuinn.com/events
`,
  },
  {
    name: "Albuquerque, Taos, Las Cruces, Los Alamos and Farmington venues",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
The Blue Door Venue	1750 Calle de Mercado	Las Cruces	New Mexico			Historic / Estate		150		Hacienda-style event venue in Las Cruces that hosts weddings and other celebrations for up to 150 guests.	hello@bluedoorvenue.com	(575) 800-0802	https://bluedoorvenue.com/
Placitas Winery	26 Camino de los Pueblitos	Placitas	New Mexico			Restaurant / Vineyard	Outdoor			Small family winery in Placitas with an open-air pavilion that it books for weddings and private events.	info@placitaswinery.com	505-363-5606	https://www.placitaswinery.com/weddings
Sombra Antigua Vineyard & Winery	430 La Vina Rd	Anthony	New Mexico			Restaurant / Vineyard	Outdoor			Vineyard and winery on the Texas line that offers micro, tasting-room and large meadow event sizes for celebrations.	winery@sombraantigua.com	915-241-4349	https://sombraantigua.com/bookevent
Picacho Hills Country Club	6861 Via Campestre	Las Cruces	New Mexico			Ballroom / Hotel	Indoor & Outdoor			Golf club with a dining room, a private banquet room and an outdoor terrace facing the Organ Mountains for ceremonies and receptions.	bailey@sgmsouthwest.com	575-523-8641	https://www.picachohills.com/event-wedding
Pajarito Lodge	397 Camp May Rd	Los Alamos	New Mexico			Barn / Rustic	Indoor & Outdoor	160		Ski-area lodge at the base of Pajarito Mountain seating 160 inside and 176 on the deck, with a mountaintop ceremony possible.		(505) 662-5725	https://www.pajarito.ski/weddings/
Hotel Willa	233 Paseo del Pueblo Sur	Taos	New Mexico			Ballroom / Hotel	Indoor & Outdoor	200		Taos hotel whose lawn faces the Couse pasture and Sangre de Cristo range, plus an indoor gallery holding 100 guests.	taosevents@casetta.com	575.305.7711	https://www.hotelwilla.com/meetings-events
Delta Event Center	233 N Paseo de Onate	Española	New Mexico			Ballroom / Hotel	Indoor & Outdoor			Event hall in Española with indoor rooms and a garden patio, hosting wedding ceremonies and receptions.	dginnm@gmail.com	505-901-1967	https://www.deltaeventcenter.com
El Zocalo Event Center	264 S Camino del Pueblo	Bernalillo	New Mexico			Historic / Estate	Indoor & Outdoor	200	Simple	Hacienda-style event centre with adobe walls and kiva fireplaces, a 2,400 sq ft historic building and a 3,750 sq ft courtyard.		505-867-8687	https://seesandoval.org/el-zocalo-plaza
Sandia Resort & Casino	30 Rainbow Rd NE	Albuquerque	New Mexico			Ballroom / Hotel				Casino resort with 50,000 sq ft of event space, including a grand ballroom, mountain views, on-site catering and a wedding team.		(505) 796-7500	https://www.sandiacasino.com/hotel/weddings/
Albuquerque Country Club	601 Laguna Blvd SW	Albuquerque	New Mexico			Ballroom / Hotel	Indoor & Outdoor			Country club with a windowed ballroom, a bridal room, in-house catering and grounds shaded by old cottonwood trees.		505-247-4111	https://albuquerquecountryclub.org/Events/Weddings_Banquets
Bear Mountain Lodge	60 Bear Mountain Ranch Rd	Silver City	New Mexico			Historic / Estate	Indoor & Outdoor			Former 1920s ranch school turned lodge on 178 acres beside the Gila National Forest, taking wedding and elopement enquiries.	info@bearmountainlodge.com	575-538-2538	https://www.bearmountainlodge.com/event-inquiry
Rancho Los Alamos Event Venue	3349A US-64	Waterflow	New Mexico			Barn / Rustic	Indoor & Outdoor			Country venue west of Farmington with a barn and saloon, gazebo and stage under cottonwoods, a short walk from the San Juan River.	rancholosalamosnm@gmail.com	(505) 860-5103	https://rancholosalamosnm.com
Hotel Luna Mystica		Taos	New Mexico			Barn / Rustic	Outdoor			Vintage trailer hotel and campground on the Taos mesa with a grass ceremony circle, a 2,400 sq ft covered pavilion and a full buyout option.	reservations@hotellunamystica.com		https://www.hotellunamystica.com
Ruidoso Convention Center	111 Sierra Blanca Dr	Ruidoso	New Mexico			Ballroom / Hotel	Indoor			Convention centre with an exhibit hall and six meeting rooms that can be divided to suit an intimate or large wedding reception.	sales@ruidosoconventioncenter.com	(575) 258-5445	https://ruidosoconventioncenter.com/weddings
Triple J Ranch Events	215 County Rd 6100	Farmington	New Mexico			Barn / Rustic	Indoor & Outdoor			Old-West style setting on a private 300-acre working ranch, with late-1800s buildings including a rustic barn and a saloon.		970-382-1819	https://www.tjrevents.com
`,
  },
];

export default batches;
