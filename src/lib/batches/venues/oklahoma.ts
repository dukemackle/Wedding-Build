import type { VenueBatch } from "@/lib/venue-batches";

// Oklahoma venue batches. Every row's State is "Oklahoma". Add new batches at the end.
const batches: VenueBatch[] = [
  {
    name: "Tulsa, Jenks, Bixby, Sand Springs, Sperry, Collinsville, Oklahoma City, Edmond, Norman, Yukon and Tuttle",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Five Oaks Lodge	528 E 121st St S	Jenks	Oklahoma			Beach / Waterfront	Indoor & Outdoor	250		Lakeside lodge in Jenks that hosts one wedding at a time, with indoor space for 150 and outdoor space for 250.	nicole@fiveoakslodge.com	918.298.6405	https://www.fiveoakslodge.com
Dream Point Ranch	17400 E 167th St S	Bixby	Oklahoma			Garden / Outdoor	Indoor & Outdoor		Classic	Private 191-acre estate in Bixby with two separate venues, Mountain Crest and Riverbend Chapel, half a mile apart.	sarah@dreampointranch.com	918-900-4850	https://www.dreampointranch.com
Vinterra Event Venue	14515 S Yale Ave	Bixby	Oklahoma			Ballroom / Hotel	Indoor & Outdoor		Classic	Contemporary glass-fronted event hall beside a lake in Bixby, with a grand hall and indoor and outdoor ceremony spaces.		918.882.0822	https://vinterratulsa.com
Discoveryland Ranch	19501 W 41st St	Sand Springs	Oklahoma			Barn / Rustic	Indoor & Outdoor	250		Ninety-five-acre ranch west of Tulsa with a historic outdoor amphitheatre, a stone-fireplace pavilion and a newly built event hall.	info@dlrevents.com	(918) 960-0195	https://www.dlrevents.com
Bellissima Ranch	4833 W 88th St N	Sperry	Oklahoma			Barn / Rustic	Indoor & Outdoor			Twenty-acre rustic ranch with separate ceremony and reception barns, ponds, a pool and overnight suites.		918-361-1541	https://www.tulsaweddingvenue.com
The Lodge at Bridal Creek	5811 Roper Rd	Sperry	Oklahoma			Barn / Rustic	Indoor & Outdoor	200		Country lodge with a 7,500-square-foot main hall overlooking a pond, plus twelve guest cabins on site.		918-376-3267	https://bridalcreekok.com
Philbrook Museum of Art	2727 S Rockford Rd	Tulsa	Oklahoma			Historic / Estate	Indoor & Outdoor	500		Villa-style art museum in Tulsa with terraced gardens, a front lawn and a large garden pavilion for receptions.		(918) 749-7941	https://www.philbrook.org
Coal Creek Winery & Event Center	210 N Sara Rd	Tuttle	Oklahoma			Restaurant / Vineyard	Indoor & Outdoor	450	Classic	Winery estate south-west of Oklahoma City with an indoor event hall, a grand staircase, a bridal suite and an outdoor ceremony site.	info@coalcreekwinery.com	405-482-8685	https://coalcreekok.com
Thunderbird Chapel	11395 E Highway 9	Norman	Oklahoma			Garden / Outdoor	Indoor & Outdoor			Family-run Norman property on nearly forty acres, with a chapel and both indoor and outdoor reception space.		(405) 212-9291	https://www.thunderbirdchapel.com
Vast		Oklahoma City	Oklahoma			Restaurant / Vineyard	Indoor	240		Restaurant on the 49th and 50th floors of Devon Tower, with three private rooms for weddings and skyline views.	Events@VastOKC.com	405.702.7262	https://www.vastokc.com
Clauren Ridge Vineyard & Winery	6000 W Waterloo Rd	Edmond	Oklahoma			Restaurant / Vineyard	Indoor & Outdoor			Working vineyard of about ten acres with a pergola ceremony site, a pond and a temperature-controlled winery for receptions.	kim@claurenridge.com	(405) 412-8630	https://claurenridge.com
The Venue at Forest Lake	3500 N Coltrane Rd	Oklahoma City	Oklahoma			Historic / Estate	Indoor & Outdoor	165		Renovated estate on thirteen acres in Forest Park with a private lake, a chapel, a honeymoon cottage and guest suites.	hello@thevenueatforestlake.com	405-906-5185	https://www.thevenueatforestlake.com
Oklahoma Hall of Fame	1400 Classen Dr	Oklahoma City	Oklahoma			Historic / Estate	Indoor & Outdoor	250		1927 neoclassical building on the National Register, with a grand staircase, a fourth-floor great hall and a courtyard garden.	events@oklahomahof.com		https://www.oklahomahof.com
Myriad Botanical Gardens	301 W Reno Ave	Oklahoma City	Oklahoma			Garden / Outdoor	Indoor & Outdoor			Downtown Oklahoma City botanical garden with landscaped grounds and a choice of indoor and outdoor wedding spaces.		405-445-7080	https://myriadgardens.org
Blose Barn and Garden	301 S Richland Rd	Yukon	Oklahoma			Barn / Rustic	Indoor & Outdoor	150		Ten wooded acres with a century-old barn, a climate-controlled reception room and a renovated house for the wedding party.		(405) 317-8814	https://www.blosebarnandgarden.com
The Warehouse at West Main		Collinsville	Oklahoma			Ballroom / Hotel	Indoor	200	Simple	Four-thousand-square-foot converted warehouse in downtown Collinsville with exposed brick, wooden rafters, steel beams and two dressing rooms.			https://westmaineventcenter.com
`,
  },
];

export default batches;
