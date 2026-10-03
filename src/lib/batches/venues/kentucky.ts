import type { VenueBatch } from "@/lib/venue-batches";

// Kentucky venue batches. Every row's State is "Kentucky". Add new batches at the end.
const batches: VenueBatch[] = [
  {
    name: "Louisville and Lexington: second batch",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Galt House Hotel	140 N Fourth St	Louisville	Kentucky			Ballroom / Hotel	Indoor	1600		Riverfront downtown hotel on the Ohio River with more than 40 event spaces, a 23,000 sq ft Grand Ballroom and guest rooms on site.	info-galthotel@galthotel.com	502-589-5200	https://www.galthouse.com/weddings/
Whitehall	3110 Lexington Rd	Louisville	Kentucky			Historic / Estate	Indoor & Outdoor	250		Antebellum mansion furnished as it was in 1909, with a formal garden for ceremonies and a garden terrace for tented receptions.		(502) 897-2944	https://www.historicwhitehall.org/weddings
Farmington Historic Home	3033 Bardstown Rd	Louisville	Kentucky			Historic / Estate	Indoor & Outdoor	300	Simple	1816 Federal-style Speed family home on 18 acres in the Highlands, with formal gardens, a great lawn and a 4,800 sq ft open-air pavilion.	Michael@historichomes.org	502-452-9920	https://visitfarmington.org/rentals/
Frazier Kentucky History Museum	829 W Main St	Louisville	Kentucky			Historic / Estate	Indoor			History museum on West Main Street's Museum Row that rents its galleries and spaces, up to a full buyout, for weddings.	info@fraziermuseum.org	(502) 753-5663	https://www.fraziermuseum.org/rent-the-museum
The Barn at Magnolia Farm	6701 Briar Ridge Rd	Mount Eden	Kentucky			Barn / Rustic	Indoor & Outdoor		Simple	Family-run heated and air-conditioned rustic barn on a 20-acre former herb farm about 25 minutes from Louisville.		(855) 949-4022	https://www.thebarnatmagnoliafarm.com/
The Barn at Springhouse Gardens	185 W Catnip Hill Rd	Nicholasville	Kentucky			Barn / Rustic	Indoor & Outdoor	80		Restored tobacco barn with a loft beside a garden centre south of Lexington, with a gazebo, lawn and farmhouse on the grounds.	thebarn@springhousegardens.com	859-327-9849	https://www.springhousegardens.com/the-barn
Limestone Hall	215 W Main St	Lexington	Kentucky			Historic / Estate	Indoor	300	Simple	Third floor of downtown Lexington's 1898 Richardsonian Romanesque courthouse, with two event rooms joined by a domed rotunda.	hello@limestonehall.com	859-230-5365	https://www.limestonehall.com/
The Carrick House	312 N Limestone	Lexington	Kentucky			Historic / Estate	Indoor			Nineteenth-century mansion on North Limestone joined to a glass-roofed banquet space, run by Lundy's catering.	summer@lundyscatering.com	859-255-0717	https://www.carrickhouse.com/
Rotherwood Events	3565 Paris Rd	Winchester	Kentucky			Historic / Estate	Indoor & Outdoor			1887 Victorian estate east of Lexington with a restored mansion, a Grand Carriage Hall barn for receptions and outdoor ceremony sites.	info@rotherwoodevents.com	(859) 513-3498	https://www.rotherwoodevents.com/
The Manchester Reserve	903 Manchester St	Lexington	Kentucky			Historic / Estate	Indoor			Exposed-brick hall with large windows and chandeliers on Manchester Street in Lexington's Distillery District.			https://www.themanchesterreserve.com/`,
  },
];

export default batches;
