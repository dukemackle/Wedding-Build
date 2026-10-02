import type { VenueBatch } from "@/lib/venue-batches";

// Colorado venue batches. Every row's State is "Colorado". Add new batches at the end.
const batches: VenueBatch[] = [
  {
    name: "Denver venues",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Hudson Gardens	6115 S Santa Fe Dr	Littleton	Colorado			Garden / Outdoor	Indoor & Outdoor	175		A 30-acre garden in Littleton with a rose garden, an open-air pavilion, lawns and a small indoor inn among its ceremony and reception spaces.		303-797-8565	https://hudsongardens.org/host/
Boettcher Mansion	900 Colorow Rd	Golden	Colorado			Historic / Estate	Indoor & Outdoor	150	Classic	A stone-and-timber mansion in the forest atop Lookout Mountain, owned by Jefferson County, with a vaulted fireside room and a wooded patio.	BoettcherMansion@jeffco.us	720-497-7630	https://www.jeffco.us/1797/Weddings-Social-Events
Evergreen Lake House	29612 Upper Bear Creek Rd	Evergreen	Colorado			Beach / Waterfront	Indoor & Outdoor	200	Classic	A log lodge on the shore of Evergreen Lake with a stone-fireplace great room, a smaller octagon room and an outdoor deck for ceremonies.	rholterman@eprdco.gov	720-880-1100	https://www.evergreenrecreation.com/Lake-House-Rental
Highlands Ranch Mansion	9950 E Gateway Dr	Highlands Ranch	Colorado			Historic / Estate	Indoor & Outdoor		Classic	A historic mansion on a working ranch inside a planned 250-acre historic park, with landscaped grounds and wide open views.	hrmansionevents@highlandsranch.org	303-791-0177	https://highlandsranchmansion.com/
Moss Denver	200 N Santa Fe Dr	Denver	Colorado			Historic / Estate	Indoor	200	Classic	An industrial brick building in the Santa Fe Art District, booked whole, with a glass-ceilinged ceremony room and a chandelier hall lit by factory windows.	info@mossdenver.com	303-534-5403	https://www.mossdenver.com/
Chief Hosa Lodge	27661 Genesee Ln	Golden	Colorado			Historic / Estate	Indoor & Outdoor	100		Denver's first mountain lodge, opened in 1918 and built of local stone and timber, with fireplaces and a large patio facing the Continental Divide.	Park.Permits@denvergov.org	720-913-0700	https://denvergov.org/Government/Agencies-Departments-Offices/Agencies-Departments-Offices-Directory/Parks-Recreation/Park-Permits/Event-Facilities/Chief-Hosa-Lodge
`,
  },
];

export default batches;
