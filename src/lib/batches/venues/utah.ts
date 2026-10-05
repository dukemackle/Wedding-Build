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
Siempre	1283 E. Mike Weir Drive	Draper	Utah			Ballroom / Hotel	Indoor & Outdoor	500		A foothill event venue in Draper with a columned rotunda, two private gardens, two indoor ballrooms and mountain views.	info@siempreutah.com	801.508.4851	https://siempreutah.com
La Caille	9565 Wasatch Boulevard	Sandy	Utah			Restaurant / Vineyard	Indoor & Outdoor	250		A vineyard estate at the base of Little Cottonwood Canyon with a year-round greenhouse atrium, gardens, a lounge and a canyon-view patio.		(801) 942-1751	https://www.lacaille.com/venues
The Fifth Floor	2411 Kiesel Avenue Suite 502	Ogden	Utah			Ballroom / Hotel	Indoor			An upper-floor event space in downtown Ogden with vaulted ceilings, skylights, exposed brick and a bistro-lit dance floor.	hello@thefifthfloorutah.com	801-252-5366	https://thefifthfloorutah.com/weddings/
The Madison Venue	298 24th Street #250	Ogden	Utah			Historic / Estate	Indoor	374		A former courthouse ballroom inside the 1905 to 1909 Old Ogden Post Office, with tall windows, chandeliers and an atrium.	MadisonVenueUT@gmail.com	801-441-2211	https://madisonvenue.com
Eldredge Manor	564 West 400 North	Bountiful	Utah			Historic / Estate	Indoor & Outdoor		Simple	A mansion built in 1896 by the Eldredge family in central Bountiful, with ballrooms and maintained grounds for ceremonies and receptions.	info@eldredgemanor.com	(801) 292-5501	https://eldredgemanor.com
Garden Gate Event Center	197 East 500 South	Bountiful	Utah			Historic / Estate	Indoor & Outdoor			A 1912 former ward meetinghouse in downtown Bountiful, now an event centre with indoor halls and outdoor garden areas.	info@gardengatevenue.com	801-660-0198	https://www.gardengatevenue.com
Red Butte Garden	300 Wakara Way	Salt Lake City	Utah			Garden / Outdoor	Indoor & Outdoor			A 100-acre botanical garden in the foothills east of the University of Utah, with the Orangerie, a Rose House and a rose garden for ceremonies.	information@redbutte.utah.edu	(801) 585-0556	https://redbuttegarden.org/weddings-receptions/
The St. Regis Deer Valley	2300 Deer Valley Drive East	Park City	Utah			Ballroom / Hotel	Indoor & Outdoor	230		A slope-side resort hotel at Deer Valley with an Astor Ballroom, a terrace and a grand lawn facing the Wasatch mountains.		+1-435-940-5700	https://www.marriott.com/en-us/hotels/slcxr-the-st-regis-deer-valley/events/
`,
  },
  {
    name: "Provo, Utah County and Wasatch Back venues",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Sleepy Ridge Weddings	730 S Sleepy Ridge Dr	Orem	Utah			Garden / Outdoor	Indoor & Outdoor	250		A golf course venue above Utah Lake with the Sunset Room and balcony and a garden patio with a gazebo and waterfall.	info@sleepyridgeweddings.com	801-899-8000	https://www.sleepyridgeweddings.com
Walker Farms	26 S 500 E	Lindon	Utah			Barn / Rustic	Indoor & Outdoor	150	Classic	A newly built all-white barn at the base of Mount Timpanogos with bridal and groom suites, a kitchen and an outdoor pavilion.		801-899-5102	https://walkerfarms.com
Castle Park Weddings & Events	110 South Main St	Lindon	Utah			Ballroom / Hotel	Indoor			An event hall on Lindon's Main Street that allows outside vendors without extra fees and offers optional in-house services.	info@castleparkevents.com	801-899-9483	https://castleparkevents.com
Knot & Pine	45 E 200 N	Alpine	Utah			Barn / Rustic	Indoor		Simple	A historic barn in Alpine with dark wood and exposed beams, set up for weddings and receptions.	contactus@knotandpine.com	801-770-4642	https://www.knotandpine.com
5th East Hall	455 E 200 S	American Fork	Utah			Ballroom / Hotel	Indoor		Simple	A downtown American Fork event hall used for wedding receptions and ceremonies, with published low hourly package pricing.	contactus@5theasthall.com	385-293-3663	https://5theasthall.com
Northampton House	198 W 300 N	American Fork	Utah			Historic / Estate	Indoor	178		A 1903 historic building in American Fork whose Monarch Room has stained-glass windows.	info@northamptonhouse.com	385-324-9973	https://northamptonhouse.com
River Bridge Event Center	1225 S Main Street	Spanish Fork	Utah			Ballroom / Hotel	Indoor & Outdoor			A Spanish Fork venue with outdoor ceremony spaces and a reception hall, set among open land with mountain views.	info@riverbridgeeventcenter.com	801-663-1134	https://www.riverbridgeeventcenter.com
Amavi Event Venue	160 N Main Street	Spanish Fork	Utah			Ballroom / Hotel	Indoor	225		A modern wedding and reception hall on Spanish Fork's Main Street, priced as a more affordable option.	info@amavivenue.com	435-776-5877	https://www.amavivenue.com
The Chillon	710 East Center Street	Spanish Fork	Utah			Historic / Estate	Indoor & Outdoor			A restored landmark building in historic Spanish Fork with indoor and outdoor spaces and in-house catering.		801-798-3006	https://www.chillon.com
La Fete	120 N University Ave	Provo	Utah			Ballroom / Hotel	Indoor	180		A French-inspired reception venue in Provo, a few minutes from the Provo City Center Temple.	info@lafetevenue.com	385-585-1040	https://www.lafetevenue.com
The Blake	407 W 100 S	Provo	Utah			Ballroom / Hotel	Indoor	300	Simple	A Provo event venue for receptions and ceremonies with a published peak Saturday rental fee.	theblakevenue@gmail.com	385-286-2002	https://www.theblakevenue.com
The Ivory Hall	388 W Center St	Provo	Utah			Ballroom / Hotel	Indoor	200	Simple	A Provo event venue built around a 4,000 square foot great hall.	hello@theivoryhall.com	801-882-7022	https://www.theivoryhall.com
The Rooftop Lehi	139 N Hunters Grove Ln	Lehi	Utah			Ballroom / Hotel	Indoor & Outdoor	280		A Lehi venue with a 3,200 square foot Overlook hall, a courtyard and mountain views.	info@therooftoplehi.com	801-448-7714	https://www.therooftoplehi.com
The Oz Wedding & Event Center	1008 S 1100 W	Lehi	Utah			Ballroom / Hotel	Indoor & Outdoor			A Lehi venue with a grand hall, chandeliers, checkered floors, dressing rooms and a patio.	bookings@theozvenue.com	801-877-3081	https://www.theozeventcenter.com
Sundance Mountain Resort	8841 N Alpine Loop Rd	Sundance	Utah			Garden / Outdoor	Indoor & Outdoor			A mountainside resort on the slopes of Mount Timpanogos with an inn, cottages and mountain homes for wedding stays.		801-223-4070	https://www.sundanceresort.com/weddings/
Springville Museum of Art	126 E 400 S	Springville	Utah			Historic / Estate	Indoor & Outdoor			A 1937 Spanish colonial revival art museum in Springville with a sculpture garden, rented for weddings.	SMAinfo@springvilleutah.gov	801-489-2727	https://www.smofa.org/rentals
The Barn at Wall Brothers Orchards	918 UT-198	Santaquin	Utah			Barn / Rustic	Indoor & Outdoor		Simple	An orchard barn event venue in Santaquin at the southern end of Utah County.	info@thebarneventvenue.com	801-876-1374	https://thebarneventvenue.com
Homestead Resort	700 N Homestead Dr	Midway	Utah			Ballroom / Hotel	Indoor & Outdoor	300		A 190-acre resort in Midway with a 17,636 square foot barn among its wedding spaces.		435-654-1102	https://homesteadmidwayutah.com/weddings/
River Bottoms Ranch	1374 N River Road	Midway	Utah			Barn / Rustic	Indoor & Outdoor	175		A Midway ranch with a 2,200 square foot timber pavilion and 360-degree views of Mount Timpanogos.		435-503-4379	https://riverbottomsranch.com/weddings
Kimball Terrace	675 Main Street	Park City	Utah			Ballroom / Hotel	Indoor & Outdoor	175	Classic	A Main Street Park City venue with a 4,500 square foot hall and an 1,800 square foot terrace.	info@culinarycrafts.com	801-225-6575	https://www.kimballterrace.com
McCune Mansion	200 North Main St	Salt Lake City	Utah			Historic / Estate	Indoor			A Victorian castle-style mansion in Salt Lake City, entered by appointment and used for weddings and other events.	info@mccunemansion.com	801-531-8866	https://mccunemansion.com
The Ballroom at the Commercial Club	32 E Exchange Place	Salt Lake City	Utah			Historic / Estate	Indoor	250		A downtown Salt Lake City ballroom in a building that has hosted gatherings since 1909.	events@theballroomslc.com	801-699-3897	https://www.commercialclubslc.com
`,
  },
];

export default batches;
