import type { VenueBatch } from "@/lib/venue-batches";

// Utah venue batches. Every row's State is "Utah". Add new batches at the end.
const batches: VenueBatch[] = [
  {
    name: "Salt Lake City, Ogden and Park City venues",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Millcreek Inn	5802 East Mill Creek Canyon Road	Salt Lake City	Utah			Garden / Outdoor	Indoor & Outdoor		Luxury	A canyon property three miles up Millcreek Canyon with mountain-ringed lawns, gardens and rustic banquet halls with fireplaces.	events@millcreekinn.com	(801) 278-7927	https://www.millcreekinn.com
Memorial House at Memory Grove Park	375 North Canyon Road	Salt Lake City	Utah			Historic / Estate	Indoor & Outdoor	300		A 1920s hall in Memory Grove Park with a fireplace, chandeliers, a south lawn and garden ceremony spots, run by Preservation Utah.	memorialhouse@preservationutah.org	(801) 521-7969	https://memorialhouse-utah.com
Sweet Magnolia Venues	270 North Main Street	Kaysville	Utah			Barn / Rustic	Indoor		Simple	A small decorated event hall on Kaysville's Main Street in a rustic-modern farmhouse style, with tables and decor included.	sweetmagnoliavenues@gmail.com	801-347-9009	https://www.sweetmagnoliavenues.com
Gardner Village	1100 West 7800 South	West Jordan	Utah			Historic / Estate	Indoor & Outdoor	400		A village built around an old pioneer-era flour mill and silo, with restored homes, covered bridges, a banquet hall and an outdoor plaza.		801.938.1999	https://www.gardnervillage.com/weddings
Cactus & Tropicals	2735 South 2000 East	Salt Lake City	Utah			Garden / Outdoor	Indoor & Outdoor			A plant nursery venue with tropical gardens and a glass-ceilinged greenhouse interior, at the foot of the Salt Lake valley's east bench.		(801) 485-2542	https://www.cactusandtropicals.com
The Grand America Hotel	555 South Main Street	Salt Lake City	Utah			Ballroom / Hotel	Indoor & Outdoor			A downtown hotel with 775 guest rooms, a crystal-chandeliered Grand Ballroom and a central courtyard for ceremonies.		801-258-6000	https://www.grandamerica.com/weddings
Siempre		Draper	Utah			Ballroom / Hotel	Indoor & Outdoor	500		A foothill event venue in Draper with a columned rotunda, two private gardens, two indoor ballrooms and mountain views.	info@siempreutah.com	801.508.4851	https://siempreutah.com
La Caille	9565 Wasatch Boulevard	Sandy	Utah			Restaurant / Vineyard	Indoor & Outdoor	250		A vineyard estate at the base of Little Cottonwood Canyon with a year-round greenhouse atrium, gardens, a lounge and a canyon-view patio.		(801) 942-1751	https://www.lacaille.com/venues
The Fifth Floor	2411 Kiesel Avenue Suite 502	Ogden	Utah			Ballroom / Hotel	Indoor			An upper-floor event space in downtown Ogden with vaulted ceilings, skylights, exposed brick and a bistro-lit dance floor.	hello@thefifthfloorutah.com	801-252-5366	https://thefifthfloorutah.com/weddings/
The Madison Venue	298 24th Street #250	Ogden	Utah			Historic / Estate	Indoor	374		A former courthouse ballroom inside the 1905 to 1909 Old Ogden Post Office, with tall windows, chandeliers and an atrium.	MadisonVenueUT@gmail.com	801-441-2211	https://madisonvenue.com
Eldredge Manor	564 West 400 North	Bountiful	Utah			Historic / Estate	Indoor & Outdoor		Simple	A mansion built in 1896 by the Eldredge family in central Bountiful, with ballrooms and maintained grounds for ceremonies and receptions.	info@eldredgemanor.com	(801) 292-5501	https://eldredgemanor.com
Garden Gate Event Center	197 East 500 South	Bountiful	Utah			Historic / Estate	Indoor & Outdoor			A 1912 former ward meetinghouse in downtown Bountiful, now an event centre with indoor halls and outdoor garden areas.	info@gardengatevenue.com	801-660-0198	https://www.gardengatevenue.com
Red Butte Garden	300 Wakara Way	Salt Lake City	Utah			Garden / Outdoor	Indoor & Outdoor			A 100-acre botanical garden in the foothills east of the University of Utah, with the Orangerie, a Rose House and a rose garden for ceremonies.	information@redbutte.utah.edu	(801) 585-0556	https://redbuttegarden.org/weddings-receptions/
The St. Regis Deer Valley	2300 Deer Valley Drive East	Park City	Utah			Ballroom / Hotel	Indoor & Outdoor	230		A slope-side resort hotel at Deer Valley with an Astor Ballroom, a terrace and a grand lawn facing the Wasatch mountains.		+1-435-940-5700	https://www.marriott.com/en-us/hotels/slcxr-the-st-regis-deer-valley/events/
`,
  },
];

export default batches;
