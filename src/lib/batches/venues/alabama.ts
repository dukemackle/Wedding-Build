import type { VenueBatch } from "@/lib/venue-batches";

// Alabama venue batches. Every row's State is "Alabama". Add new batches at the end.
const batches: VenueBatch[] = [
  {
    name: "Birmingham and Huntsville",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
The Florentine Building	2101 2nd Avenue North	Birmingham	Alabama			Historic / Estate	Indoor	300		Downtown building whose upstairs ballroom began in 1926 as the Club Florentine dance hall, with a street-level café for smaller gatherings and in-house catering.	events@florentinebuilding.com	(205) 503-4470	https://florentinebuilding.com/ballroom/
Sloss Furnaces	20 32nd Street North	Birmingham	Alabama			Historic / Estate	Indoor & Outdoor			National Historic Landmark ironworks on a 32-acre site, with a modern visitor centre hall and outdoor spaces beside the old blast furnaces.	events@slossfurnaces.org	(205) 254-2025	https://www.slossfurnaces.org/events
Events at Haven	2515 6th Ave S	Birmingham	Alabama			Historic / Estate	Indoor			Restored 1924 Mack Truck building in the Lakeview District, with 20,000 sq ft of brick-walled space, a stage, a permanent bar and a bridal suite.	info@eventsathaven.com	(205) 536-7233	https://eventsathaven.com/
Cahaba Brewing Co.	4500 5th Ave South, Building C	Birmingham	Alabama			Restaurant / Vineyard	Indoor & Outdoor	120		Brewery in the historic Continental Gin building in Avondale/Woodlawn, renting its Barrel Room, taproom and covered patio.		(205) 578-2616	https://cahababrewing.com/rent-the-space/
Windwood Equestrian	4848 Highway 11	Birmingham	Alabama			Barn / Rustic	Indoor & Outdoor			Equestrian estate of more than 200 acres south of Birmingham, with European-style stables, courtyards, an arena and riverside ceremony spots.	events@windwoodequestrian.com	(205) 901-9737	https://www.windwoodequestrian.com/weddings-and-events-venue/alabama
Park Crest Event Facility	2030 Little Valley Rd	Hoover	Alabama			Garden / Outdoor	Indoor & Outdoor	260		Three spaces in Hoover: a garden with a pavilion, a two-level carriage house with chandeliers and a long double-sided fireplace, and a coach house with a large bar.	info@parkcrestevents.com	(205) 822-7275	https://www.parkcrestevents.com/
Oris & Oak	613 Sanders Road	Hoover	Alabama			Barn / Rustic	Indoor & Outdoor			Part of the old Smith Farm in Bluff Park, with an air-conditioned barn, a large pavilion and a guest house for getting ready.		(205) 866-8891	https://www.orisandoak.com/
Renaissance Birmingham Ross Bridge Golf Resort & Spa	4000 Grand Ave	Hoover	Alabama			Ballroom / Hotel	Indoor & Outdoor			Golf and spa resort on the Robert Trent Jones Golf Trail, with a ballroom, a terrace and guest rooms on site.		(205) 916-7677	https://www.marriott.com/en-us/hotels/bhmhv-renaissance-birmingham-ross-bridge-golf-resort-and-spa/events/
Rosewood Hall	2850 19th Street South	Homewood	Alabama			Ballroom / Hotel	Indoor	500		Event hall on the ground floor of Homewood City Hall at SoHo Square, with three rooms and a terrazzo foyer that open into one space.			https://rosewoodhall.com/
The Sonnet House	1487 Montevallo Road SW	Leeds	Alabama			Historic / Estate	Indoor & Outdoor			1918 farmhouse on 18 acres beside the Little Cahaba River, with in-house catering, flowers and planning.	TheSonnetHouse@gmail.com	(205) 699-7490	https://www.thesonnethouse.com/
The Ledges	32 Castle Down Drive	Huntsville	Alabama			Ballroom / Hotel	Indoor & Outdoor	270		Mountaintop golf clubhouse in stone and slate with a ballroom, a veranda and views across southeast Huntsville; non-members can book weddings.	azanlunghi@theledges.com		https://theledges.com/SpecialEvents/Weddings_and_Special_Events
106 Jefferson	106 Jefferson Street South	Huntsville	Alabama			Ballroom / Hotel	Indoor & Outdoor			Downtown lifestyle hotel with a ground-floor ballroom, a private dining room and patio, and a rooftop for daytime ceremonies.	experience@106jefferson.com	(256) 288-0128	https://www.106jefferson.com/weddings
U.S. Space & Rocket Center	One Tranquility Base	Huntsville	Alabama			Historic / Estate	Indoor			Space museum whose Davidson Center hall holds receptions beneath a Saturn V rocket, with in-house catering.	spevents@spacecamp.com	(256) 721-7173	https://rocketcenter.com/hostanevent/
Weeden House Museum	300 Gates Avenue	Huntsville	Alabama			Historic / Estate	Indoor & Outdoor	175	Simple	1819 house museum in the Twickenham historic district, renting its ground floor, porch and garden for weddings.		(256) 536-7718	https://weedenhousemuseum.com/events
A.M. Booth's Lumberyard	108 Cleveland Ave NW	Huntsville	Alabama			Restaurant / Vineyard	Indoor & Outdoor			Old lumberyard site near downtown turned into a restaurant and music venue, with a banquet hall, courtyard and a 1924 dining rail car.		(256) 651-5437	https://www.amboothslumberyard.com/weddings
Monte Sano State Park Event Lodge	5105 Nolen Ave	Huntsville	Alabama			Garden / Outdoor	Indoor & Outdoor			State park lodge on top of Monte Sano with a hearth-lined main hall and a terrace over the bluff.	monte.sanostpk@dcnr.alabama.gov	(256) 534-3757	https://www.alapark.com/parks/monte-sano-state-park/event-lodge
New Gooch Place	500 Gooch Lane	Madison	Alabama			Ballroom / Hotel	Indoor	275		Event centre near Huntsville airport with a large hall and stage, a smaller hall and a kitchen for caterers.		(256) 951-2575	https://newgoochplace.com/
The Magnolia Room	216 Moulton St E	Decatur	Alabama			Historic / Estate	Indoor	160		3,000 sq ft hall in Decatur's downtown historic district with high ceilings, original hardwood floors and a bridal suite.	Info@TMRDecatur.com	(256) 580-6160	https://themagnoliaroomdecatur.com/weddings
Heritage Corner Farm	687 Kinnard Mill Rd	Hazel Green	Alabama			Barn / Rustic	Indoor & Outdoor			Family Christmas tree farm with a modern barn beside a seven-acre lake and pier.	Spencer@ChristmasAtTheCorner.com	(256) 804-5855	https://heritagecornerfarm.com/
`,
  },
];

export default batches;
