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
];

export default batches;
