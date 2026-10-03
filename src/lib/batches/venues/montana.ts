import type { VenueBatch } from "@/lib/venue-batches";

// Montana venue batches. Every row's State is "Montana". Add new batches at the end.
const batches: VenueBatch[] = [
  {
    name: "Bozeman, Big Sky and Paradise Valley venues",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
The Chateau Event Center	1568 Cobb Hill Rd	Bozeman	Montana			Barn / Rustic	Indoor & Outdoor	145		A 2,500 sq ft stone-and-stucco hall with beamed ceilings and a covered patio, set on 40 acres under a conservation easement.	montanachateau@outlook.com	406-600-4161	https://thechateaueventcenter.com/weddings
Rockin' TJ Ranch	651 Lynx Ln	Bozeman	Montana			Barn / Rustic	Indoor & Outdoor			A 10-acre property beside Hyalite Creek with a 4,800 sq ft grand hall, groom's cabin and views of the Bridger Mountains.		406-585-0595	https://rockingtjranch.com/weddings/weddings
Firelight Farm	140 Quentin Way	Bozeman	Montana			Barn / Rustic	Indoor & Outdoor		Classic	A renovated 100-year-old two-story barn with reclaimed wood, a silo and dedicated bridal preparation rooms.		406-600-6762	https://firelightfarmmt.com/weddings
The Woodlands at Cottonwood Canyon	141 Old Timber Way	Bozeman	Montana			Barn / Rustic	Indoor & Outdoor			A forested canyon property about ten miles south of Bozeman with a meadow ceremony site, patio, Great Room and honeymoon cabin.		(406) 763-4542	https://montanawoodlands.com
Bodhi Farms	13624 S Cottonwood Rd	Bozeman	Montana			Garden / Outdoor	Outdoor	125		A 35-acre eco resort beside Cottonwood Creek with hand-built cabins, glamping tipis, a sailcloth-tent event park and an aspen-grove garden.	concierge@bodhi-farms.com	(406) 201-1324	https://www.bodhi-farms.com/weddings
Foster Creek Farm	2577 Foster Creek Road	Belgrade	Montana			Barn / Rustic	Indoor & Outdoor	250		A 130-year-old family farm with a restored barn, bridal suite, groom's cabin and lodging, ringed by four mountain ranges.	info@fostercreekfarm.com	(406) 313-2929	https://fostercreekfarm.com
Big Yellow Barn	9466 Springhill Road	Belgrade	Montana			Barn / Rustic	Indoor & Outdoor	150		A historic barn with a patio, deck and lawn, set in open country with mountain views a few minutes from Bozeman.			https://www.bigyellowbarn.com/wedding-packages
Big Vista Ranch	13720 Portnell Rd	Bozeman	Montana			Barn / Rustic	Indoor & Outdoor	300	Classic	A 60-acre ranch outside Bozeman with a 150-seat event lodge, tent space, several ceremony sites and an on-site guest house.	info@bigvistaranch.com	406-920-8804	https://bigvistaranch.com/weddings
Lone Mountain Ranch	750 Lone Mountain Ranch Road	Big Sky	Montana			Barn / Rustic	Indoor & Outdoor	350		A century-old, 25-cabin guest ranch near Yellowstone with a beamed dining hall, covered Ranch Hall and a mountaintop ceremony site.		406-995-4644	https://lonemountainranch.com/weddings
Sage Lodge	55 Sage Lodge Drive	Pray	Montana			Ballroom / Hotel	Indoor & Outdoor			A resort on more than 1,200 acres along the Yellowstone River with an event barn, lodge rooms and four ranch houses under Emigrant Peak.		855-400-0505	https://sagelodge.com/montana-wedding/
Rainbow Ranch Lodge	42950 Gallatin Road	Gallatin Gateway	Montana			Ballroom / Hotel	Indoor & Outdoor	150		A riverside lodge on the Gallatin beneath the Spanish Peaks, with 21 guest rooms and suites, a restaurant and ceremony sites on the bank.	info@rainbowranchbigsky.com	(406) 995-4132	https://rainbowranchbigsky.com/wedding/
Copper Rose Ranch	2173 East River Road	Livingston	Montana			Barn / Rustic	Indoor & Outdoor	250		A century-old Paradise Valley barn, restored with radiant floor heat, plus ten lodgepole cabins and a farmhouse sleeping up to 66.	info@copperroseranch.com	406-229-2016	https://copperroseranch.com/weddings/
Yellowstone Valley Lodge	3840 Highway 89 South	Livingston	Montana			Barn / Rustic	Indoor & Outdoor	200		A riverside lodge with 22 cabins and the Owl's Rest event barn, which has a balcony, wrap-around patio and fire pit, facing the Absarokas.		+1 (406) 333-4787	https://www.yellowstonevalleylodge.com/weddings-events
Star M Barn	4186 Stimson Lane	Belgrade	Montana			Barn / Rustic	Indoor & Outdoor			A historic hand-raised barn on about 34 acres of farmland, roughly 15 minutes from downtown Bozeman, with mountain views.			https://www.starmbarn.com
1889 Barn	12670 Portnell Road	Bozeman	Montana			Barn / Rustic	Indoor & Outdoor	100		A restored 1889 barn on 21 acres in Gallatin Gateway with a spring-fed creek, covered dance floor and its own licensed bar.	the1889barn@gmail.com	406-579-4865	https://www.1889barn.com
Chico Hot Springs Resort	163 Chico Road	Pray	Montana			Historic / Estate	Indoor & Outdoor	180		A National Register resort in Paradise Valley with two hot spring pools, an event centre, a meadow ceremony site and lodging on 700-plus acres.		(406) 333-4933	https://www.chicohotsprings.com/wedding-venue
Sacajawea Hotel	5 North Main Street	Three Forks	Montana			Historic / Estate	Indoor & Outdoor			A historic hotel refurbished in 2010, offering a lawn courtyard with tent, a lobby and a grill dining room for ceremonies and receptions.	events@sacajaweahotel.com	406-285-6515	https://sacajaweahotel.com/weddings
The Lodge at Whitefish Lake	1380 Wisconsin Ave	Whitefish	Montana			Ballroom / Hotel	Indoor & Outdoor	300		A lakeside resort with a 6,366 sq ft ballroom, a windowed lakeside pavilion, a lawn on Whitefish Lake and on-site rooms and cabins.		1-406-863-4000	https://www.lodgeatwhitefishlake.com/weddings
White Raven	6 Plateau Rd	Alberton	Montana			Ballroom / Hotel	Indoor & Outdoor	125		A mountain-plateau venue and retreat above the Clark Fork River with a ballroom, covered verandas, gardens and trails beside Lolo National Forest.			https://www.whiteravenmontana.com
`,
  },
];

export default batches;
