import type { VenueBatch } from "@/lib/venue-batches";

// Kansas venue batches. Every row's State is "Kansas". Add new batches at the end.
const batches: VenueBatch[] = [
  {
    name: "Wichita, Johnson County, Lawrence and Topeka",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
The Oaks	9575 W 73rd St N	Valley Center	Kansas			Garden / Outdoor	Indoor & Outdoor	150		A 27-acre riverside property on the Arkansas River with a pond, patio and both indoor and outdoor ceremony spaces north of Wichita.	info@theoaks-ks.com		https://www.theoaks-ks.com/
The Highlands	7575 E 101st St N	Valley Center	Kansas			Barn / Rustic	Indoor & Outdoor	500		A 20-acre prairie property with ponds and a creek for outdoor ceremonies and a stone-fireplace hall with bridal suites for receptions.	thehighlandswichita@gmail.com	316-259-9510	https://www.thehighlandswichita.com/
The Vail	210 N Mosley St	Wichita	Kansas			Ballroom / Hotel	Indoor			An event hall in Old Town Wichita run alongside the Hotel at Old Town, used for weddings and corporate gatherings.	thevail@hotelatoldtown.com	316-867-2527	https://www.thevailwichita.com/
Venue 54	5025 E Kellogg	Wichita	Kansas			Historic / Estate	Indoor & Outdoor	151		A renovated historic building on East Kellogg with exposed brick, glass roll-up doors and a parking-lot area that can host tents.		316-624-5454	https://venue54wichita.com/
Ambassador Hotel Wichita	104 S Broadway	Wichita	Kansas			Ballroom / Hotel	Indoor	144		A boutique downtown hotel with event rooms for ceremonies and receptions, an on-site steakhouse and a shuttle within five miles.	wichitaconcierge@ambassadorhc.com	316-239-7100	https://www.ambassadorwichitaks.com/weddings
Seasons Venue at O.J. Watson Park		Wichita	Kansas			Garden / Outdoor	Indoor & Outdoor	100	Simple	A city-run event building in O.J. Watson Park with an interior room, exterior area and gazebo, rented by the day.			https://www.wichita.gov/674/Seasons-Venue
The Barn at Grace Hill	678 South Grace Hill Road	Newton	Kansas			Barn / Rustic	Indoor & Outdoor		Classic	A modern white barn north of Wichita with bridal and groom suites, a caterer's prep kitchen and on-site lodging.	info@thebarnatgracehill.com	316-804-8105	https://thebarnatgracehill.com/
Eberly Farm	13111 W 21st St N	Wichita	Kansas			Garden / Outdoor	Indoor & Outdoor			A family-run farm on Wichita's west side with a pavilion, scenic grounds and a fountain, hosting weddings and receptions.	events@eberlyfarm.com	316-722-3580	https://www.eberlyfarm.com/
The Mint	12345 W 95th St	Lenexa	Kansas			Ballroom / Hotel	Indoor & Outdoor	350		An 18,000-square-foot event building near I-435 with a ballroom, second event space, prep suites and a patio with garage doors.		913-245-9275	https://www.kcmint.com/
Stone Manor on 79th	7400 W 79th Street	Overland Park	Kansas			Historic / Estate	Indoor	300		The 1908 Strang Line Car Barn in downtown Overland Park, renovated with stone walls, a barrel-vault wood ceiling and chandeliers.			https://stonemanorkc.com/
The English Barn		Louisburg	Kansas			Barn / Rustic	Indoor & Outdoor	200		A 20-acre private property north of Louisburg with gardens, a grand hall, bridal suites and a chalet south of Kansas City.			https://theenglishbarn.com/
Olathe Conference Center	10401 S Ridgeview Road	Olathe	Kansas			Ballroom / Hotel	Indoor & Outdoor	800		A hotel-attached conference centre with a large ballroom, an outdoor terrace and Embassy Suites rooms next door.		913-353-9280	https://olatheconferencecenter.com/
Stony Point Hall	1514 N 600th Road	Baldwin City	Kansas			Historic / Estate	Indoor & Outdoor	200		A restored historic hall on 14 partly wooded acres in the Vinland Valley with indoor and outdoor spaces.	info@stonypointhall.com	785-594-2225	https://www.stonypointhall.com/
The Brownstone	4020 NW 25th St	Topeka	Kansas			Barn / Rustic	Indoor & Outdoor	200	Classic	A converted 1920s dairy barn with a silo bar, two bridal lounges and four ceremony spots on the grounds.	events@thebrownstonetopeka.com	785-235-0057	https://thebrownstonetopeka.com/
Veranda Venue	1431 North 1900 Rd	Lawrence	Kansas			Barn / Rustic	Indoor & Outdoor	250		An eight-acre Victorian-styled property with gardens, a two-storey open barn and guest suites on site.	veranda@ironstoneevents.com	785-841-1265	https://verandavenue.com/
Historic Taylor Barn	1827 East 1150 Road	Lawrence	Kansas			Barn / Rustic	Indoor & Outdoor	125	Simple	An 1879 stone barn on a working farm that has hosted weddings since 2007, open May to October.		785-550-9332	https://www.historictaylorbarn.com/
`,
  },
];

export default batches;
