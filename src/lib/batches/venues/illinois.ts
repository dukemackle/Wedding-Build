import type { VenueBatch } from "@/lib/venue-batches";

// Illinois venue batches. Every row's State is "Illinois". Add new batches at the end.
const batches: VenueBatch[] = [
  {
    name: "Chicago, suburbs and Springfield",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Room 1520	1520 W Fulton St	Chicago	Illinois			Ballroom / Hotel	Indoor & Outdoor	150	Classic	A 4,000 sq ft West Loop loft with 17-foot ceilings, chandeliers, a built-in marble bar and seasonal rooftop access.	info@room1520.com	312-952-1520	https://room1520.com/weddings-1
The Geraghty	2520 S Hoyne Ave	Chicago	Illinois			Historic / Estate	Indoor			A former paper mill on Chicago's Lower West Side converted into an open, fully customisable event space with in-house lighting and audio.	info@thegeraghty.com	312-376-0880	https://thegeraghty.com/portfolio/wedding-venue/
Stan Mansion	2408 N Kedzie Blvd	Chicago	Illinois			Ballroom / Hotel	Indoor	300	Classic	A restored former Masonic temple on Logan Square's Kedzie Boulevard with a grand ballroom, separate ceremony room and front garden.	Cera@stanmansion.com	773-276-0099	https://www.stanmansion.com/
Warwick Allerton Hotel Chicago	701 N Michigan Ave	Chicago	Illinois			Ballroom / Hotel	Indoor	200		A Jazz Age Michigan Avenue hotel whose Tip Top Tap Ballroom sits on the 23rd floor with panoramic city windows, plus a second ballroom.	sales.warchi@warwickhotels.com	312-274-6428	https://www.warwickhotels.com/warwick-allerton-chicago/meetings-and-events/weddings
Chicago Botanic Garden	1000 Lake Cook Rd	Glencoe	Illinois			Garden / Outdoor	Indoor & Outdoor	275		A 385-acre public garden with 14 event spaces, including the Rose Terrace, English Walled Garden, a waterside pavilion and the indoor Nichols Hall.		847-835-8370	https://www.chicagobotanic.org/private-events
The Morton Arboretum	4100 Illinois Route 53	Lisle	Illinois			Garden / Outdoor	Indoor & Outdoor	300		A tree museum with a three-season pavilion, a glass-walled room overlooking Meadow Lake, a historic library room and a fragrance garden for ceremonies.		630-719-2457	https://mortonarb.org/host-event/wedding-venues/
Danada House	3S501 Naperville Rd	Wheaton	Illinois			Historic / Estate	Indoor & Outdoor	250	Classic	A mid-century forest-preserve estate, once home of racing family Daniel and Ada Rice, with seven garden ceremony sites and a 4,000 sq ft atrium.		630-668-5392	https://danadahouse.org/weddings/
Heritage Prairie Farm	2N308 Brundige Rd	Elburn	Illinois			Barn / Rustic	Indoor & Outdoor	250		A certified organic working farm offering a sailcloth century tent, greenhouse, rustic barn and prairie ceremony spots, with farm-to-table catering.	events@heritageprairiefarm.com	630-443-5989	https://www.heritageprairiefarm.com/weddings
Two Brothers Roundhouse	205 N Broadway	Aurora	Illinois			Restaurant / Vineyard	Indoor & Outdoor	300		A Two Brothers brewery and restaurant beside Aurora's Metra station, with three banquet rooms, a courtyard and a gazebo.	banquets@twobrothersbrewing.com	630-892-0034	https://www.twobrothersbrewing.com/weddings
Lynfred Winery	15 S Roselle Rd	Roselle	Illinois			Restaurant / Vineyard	Indoor	80		A downtown Roselle winery with five private rooms, the largest being the Barrel Room, suited to small weddings and receptions.		630-529-9463	https://www.lynfredwinery.com/host-an-event/
Edwards Place	700 N 4th St	Springfield	Illinois			Historic / Estate	Indoor & Outdoor	50	Simple	A restored antebellum house museum on the Springfield Art Association campus, rented with its front lawn and the attached M.G. Nelson Gallery.	collections@springfieldart.org	217-523-2631	https://www.edwardsplace.org/rental-information
Washington Park Botanical Garden	1740 W Fayette Ave	Springfield	Illinois			Garden / Outdoor	Indoor & Outdoor	120		A park-district garden with a 3,500-plant rose garden, a Roman garden of library columns and a hilltop exhibit hall for receptions.		217-546-4116	https://www.springfieldparks.org/rentals/wedding-venue-rentals/
Hill Prairie Winery	23753 Lounsberry Rd	Oakford	Illinois			Restaurant / Vineyard	Indoor & Outdoor			A family vineyard on land farmed since the early 1800s, with a 100-year-old barn, ponds and vineyard views north-west of Springfield.		217-635-9900	https://www.hillprairiewinery.com/`,
  },
];

export default batches;
