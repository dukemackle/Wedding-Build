import type { VenueBatch } from "@/lib/venue-batches";

// Georgia venue batches. Every row's State is "Georgia". Add new batches at the end.
const batches: VenueBatch[] = [
  {
    name: "Savannah and Tybee Island",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Victory North	2603 Whitaker Street	Savannah	Georgia			Historic / Estate	Indoor & Outdoor			Converted early-1900s ice factory with a main hall and mezzanine, a sky loft with bridal suite and an urban garden courtyard for ceremonies.			https://www.victorynorthweddings.com
Bethesda Academy	9520 Ferguson Ave	Savannah	Georgia			Historic / Estate	Indoor & Outdoor			School campus with the historic Whitefield Chapel for ceremonies, plus a dining hall and grounds for receptions.		(912) 438-6600	https://www.bethesdaacademy.org
Kehoe House	123 Habersham Street	Savannah	Georgia			Historic / Estate	Indoor & Outdoor			1892 house built by an iron foundry owner, now a 13-room inn hosting elopements and small weddings in its parlour and garden courtyard.	events@verdigreenhotels.com	(912) 232-1020	https://www.kehoehouse.com/say-i-do
The Chapel by the Sea	1114 US-80	Tybee Island	Georgia			Ballroom / Hotel	Indoor & Outdoor	220		Island chapel with vaulted ceilings and arched windows beside its own Grand Ballroom, so ceremony and reception share one site.	taylor@thechapelga.com	(912) 482-0469	https://tybeeweddingchapel.com/
Hotel Tybee	1401 Strand Avenue	Tybee Island	Georgia			Beach / Waterfront	Indoor & Outdoor	110		Beachfront hotel whose GrandView Event Center looks over the Atlantic, with beachfront outdoor space and guest rooms on site.	bloehr@hoteltybee.com	(912) 786-7777	https://www.hoteltybee.com/weddings
Fort McAllister State Park	3894 Fort McAllister Road	Richmond Hill	Georgia			Beach / Waterfront	Outdoor	150		State park on the Ogeechee River around Civil War earthworks, where weddings need park approval and the group shelter seats 150.		(912) 727-2339	https://gastateparks.org/FortMcAllister
`,
  },
];

export default batches;
