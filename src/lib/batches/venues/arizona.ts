import type { VenueBatch } from "@/lib/venue-batches";

// Arizona venue batches. Every row's State is "Arizona". Add new batches at the end.
const batches: VenueBatch[] = [
  {
    name: "Phoenix venues",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Royal Palms Resort and Spa	5200 E Camelback Rd	Phoenix	Arizona			Ballroom / Hotel	Indoor & Outdoor			A 1920s-era winter home turned resort on nine acres of gardens at the base of Camelback Mountain, with Mediterranean-style rooms and garden ceremony sites.		602-283-1234	https://www.royalpalmshotel.com/weddings/
Schnepf Farms	22601 E Cloud Rd	Queen Creek	Arizona			Barn / Rustic	Indoor & Outdoor	250		Family farm with three wedding sites: a 1950s farmhouse beside a peach orchard, a pine-shaded outdoor meadow and a 7,000 sq ft 1960s red barn.	weddings@schnepffarms.com	480-987-3100	https://schnepffarmsweddings.com/
The Farm at South Mountain	6106 S 32nd St	Phoenix	Arizona			Garden / Outdoor	Outdoor	250		Farm on an old riverbed in south Phoenix where ceremonies take place in a pecan grove and dinners are served under a canopy or in a walled garden.	info@thefarmatsouthmountain.com	602-276-6360	https://thefarmatsouthmountain.com/weddings/
Superstition Manor	1220 N Signal Butte Rd	Mesa	Arizona			Historic / Estate	Indoor & Outdoor			Eleven-acre estate facing Superstition Mountain with three reception halls (two villas and a barn), each with its own ceremony yard and covered patio.	info@superstitionmanor.com	480-286-7806	https://superstitionmanor.com/
Venue at the Grove	7010 S 27th Ave	Phoenix	Arizona			Garden / Outdoor	Outdoor	225		Exclusive-use property of just over two acres in south Phoenix, set in a pecan orchard wrapped in lights, with a brick reception patio under the trees.	info@venueatthegrove.com	602-456-0803	https://www.venueatthegrove.com/weddings
Hotel Valley Ho	6850 E Main St	Scottsdale	Arizona			Ballroom / Hotel	Indoor & Outdoor	250		Mid-century modern hotel in Scottsdale with a rooftop terrace, a palm-lined lawn, a citrus grove and a ballroom, plus guest rooms on site.		480-376-2600	https://hotelvalleyho.com/weddings/
Wrigley Mansion	2501 E Telawa Trl	Phoenix	Arizona			Historic / Estate	Indoor & Outdoor			1930s hilltop mansion in Phoenix with views over the city and mountains, its own restaurants and a range of event rooms.		602-955-4079	https://wrigleymansion.com/weddings/
El Chorro	5550 E Lincoln Dr	Paradise Valley	Arizona			Restaurant / Vineyard	Indoor & Outdoor			Supper-club restaurant and lodge in Paradise Valley dating from 1937, hosting weddings and events alongside its dining rooms.		480-948-5170	https://www.elchorro.com/
The Wigwam	300 E Wigwam Blvd	Litchfield Park	Arizona			Ballroom / Hotel	Indoor & Outdoor			West Valley resort in Litchfield Park with more than 100,000 sq ft of indoor and outdoor event space and guest rooms on site.		844-239-1641	https://www.wigwamarizona.com/weddings
`,
  },
];

export default batches;
