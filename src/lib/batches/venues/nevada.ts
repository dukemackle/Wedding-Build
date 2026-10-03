import type { VenueBatch } from "@/lib/venue-batches";

// Nevada venue batches. Every row's State is "Nevada". Add new batches at the end.
const batches: VenueBatch[] = [
  {
    name: "Las Vegas, Reno and Tahoe venues",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Chapel of the Flowers	1717 Las Vegas Blvd S	Las Vegas	Nevada			Historic / Estate	Indoor & Outdoor	101		Strip chapel founded 65 years ago with ten ceremony spaces, including the Glass Gardens room and an outdoor gazebo, plus on-site reception rooms.	marryme@littlechapel.com	(702) 735-4331	https://www.littlechapel.com
Graceland Wedding Chapel	619 Las Vegas Blvd S	Las Vegas	Nevada			Historic / Estate	Indoor			Small downtown chapel dating to 1939 that began offering Elvis-themed ceremonies in 1977, with a sister chapel nearby seating 32.	weddings@gracelandchapel.com	(702) 382-0091	https://www.gracelandchapel.com
Sunset Gardens	3931 E Sunset Rd	Las Vegas	Nevada			Garden / Outdoor	Indoor & Outdoor			Four-acre garden property open since 1983 with a chapel, terrace and garden rooms, a cellar and a side yard set among twinkle-lit landscaping.	info@sunsetgardens.com	(702) 456-9986	https://www.sunsetgardens.com
Cactus Joe's Blue Diamond Nursery	12740 Blue Diamond Rd	Las Vegas	Nevada			Garden / Outdoor	Indoor & Outdoor			Seven-acre working cactus nursery at the gateway to Red Rock Canyon, with desert garden and greenhouse ceremony spots.	events@cactusjoeslv.com	702-875-1968	https://www.cactusjoeslv.com/weddings-events
A Little White Wedding Chapel	1301 S Las Vegas Blvd	Las Vegas	Nevada			Historic / Estate	Indoor & Outdoor			Chapel operating since 1951 with two indoor chapels, an outdoor gazebo and a drive-through ceremony lane.	reservations@littlewhiteweddingchapel.com	(702) 382-5943	https://www.alittlewhitechapel.com
Lakeside Weddings & Events	2620 Regatta Dr Suite 102	Las Vegas	Nevada			Garden / Outdoor	Indoor & Outdoor			Lakeside property in the Summerlin area with four outdoor garden ceremony sites, an indoor chapel, an atrium and a banquet hall.	Info@lakesideweddings.com	(702) 240-5290	https://lakesideweddings.com
The Grove	8080 Al Carrison St	Las Vegas	Nevada			Garden / Outdoor	Indoor & Outdoor			Outdoor wedding site with an almond orchard, a wooden gazebo, a garden terrace and a water feature, a short drive from the Strip.		702-645-5818	https://www.the-grove.com/wedding-venue-packaging.html
The Terrace Banquet Hall	1361 W Warm Springs Rd	Henderson	Nevada			Ballroom / Hotel	Indoor & Outdoor	380		Henderson banquet hall with a 180-guest Petite Ballroom, a 380-guest Grand Ballroom and a private garden terrace with a waterfall.		702-436-5888	https://theterracelasvegas.com
The Lake Club at SouthShore	100 Strada Di Circolo	Henderson	Nevada			Beach / Waterfront	Indoor & Outdoor			Clubhouse and golf club at Lake Las Vegas with lawn ceremony areas, a sand beach on the lake and mountain views.		(702) 856-8400	https://southshoreccllv.com/events-2/
The Neon Museum	770 Las Vegas Blvd N	Las Vegas	Nevada			Historic / Estate	Indoor & Outdoor	90		Museum of retired Las Vegas signs whose North Gallery holds ceremonies among vintage marquees and neon.		(702) 387-6366	https://www.neonmuseum.org/visit/plan-your-event/sweetheart-weddings
The Mob Museum	300 Stewart Ave	Las Vegas	Nevada			Historic / Estate	Indoor			Museum in a restored 1933 federal courthouse downtown, with ceremonies in the main building and in The Underground speakeasy.	info@themobmuseum.org	702-229-2734	https://themobmuseum.org/events/private-events/weddings/
Forge Social House	553 California Ave	Boulder City	Nevada			Historic / Estate	Indoor & Outdoor	120		Boutique event space in Boulder City with a main hall, a courtyard with bistro lighting and a balcony over the park.		+1 702 293 6743	https://forgesocialhouse.com
The Elm Estate	1401 W 2nd St	Reno	Nevada			Historic / Estate	Indoor & Outdoor	300		Historic property beside the Truckee River with the Elm House, an event centre seating 300 and guest cottages on site.	info@theelmestate.com	(775) 384-9081	https://theelmestate.com
The Chateau at Incline Village	955 Fairway Blvd	Incline Village	Nevada			Garden / Outdoor	Indoor & Outdoor	100		Timber-ceilinged lodge run by the local improvement district, with a golf course tee-box, creekside and beach ceremony spots and lake views.		(775) 832-1240	https://www.yourtahoeplace.com/weddings-venues/the-chateau-at-incline-village/
`,
  },
];

export default batches;
