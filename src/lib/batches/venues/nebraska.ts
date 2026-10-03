import type { VenueBatch } from "@/lib/venue-batches";

// Nebraska venue batches. Every row's State is "Nebraska". Add new batches at the end.
const batches: VenueBatch[] = [
  {
    name: "Omaha, Lincoln, Kearney and Grand Island",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
A Venue on the Ridge	20033 Elkhorn Ridge Drive	Elkhorn	Nebraska			Ballroom / Hotel	Indoor & Outdoor	300	Simple	Family-run Elkhorn hall with a chandelier-lit ballroom, a bricked outdoor ceremony patio overlooking the ridge, and its own catering and decor team.	sales@avenueontheridge.com	402-213-8303	https://www.avenueontheridge.com/
The Steppe Center	11730 Peel Circle	La Vista	Nebraska			Ballroom / Hotel	Indoor	400	Simple	Family-owned banquet hall a few minutes off I-80 in La Vista, with the Birmingham Ballroom, a large service kitchen and a free choice of caterer.	ryan@steppecenter.com	(402) 669-2304	https://www.steppecenter.com/
The Arbor	14040 Arbor Street	Omaha	Nebraska			Garden / Outdoor	Indoor & Outdoor			West Omaha venue run by two sisters, pairing a garden for micro-weddings with an indoor hall that holds parties of up to 300.	info@thearboromaha.com	402-884-2269	https://www.thearboromaha.com/
The Durham Museum	801 S 10th Street	Omaha	Nebraska			Historic / Estate	Indoor			History museum housed in Omaha's Art Deco former Union Station railway terminal, rented out for weddings and receptions.	info@durhammuseum.org	(402) 444-5071	https://durhammuseum.org/museum-rentals/
Omaha Design Center	1502 Cuming Street	Omaha	Nebraska			Ballroom / Hotel	Indoor & Outdoor	550		Industrial 24,000 sq ft building in North Downtown that is home to Omaha Fashion Week, with chandeliers and a patio facing the city skyline.		(402) 819-8792	https://www.omahadesigncenter.com/
Leo Ballroom	2027 Dodge Street	Omaha	Nebraska			Historic / Estate	Indoor	350		Restored 1924 downtown ballroom across from the Joslyn Art Museum, with a working stage, marble staircase and balconies over 12,000 sq ft.		(402) 819-8792	https://www.leoballroom.com/
Lauritzen Gardens	100 Bancroft St.	Omaha	Nebraska			Garden / Outdoor	Indoor & Outdoor		Classic	Omaha's botanical garden, offering themed outdoor gardens, the Quinn Family Oasis and Amphitheater, and indoor rooms for ceremonies and receptions.		402-346-4002	https://www.lauritzengardens.org/space-rental/
Country Pines	6305 West Adams St.	Lincoln	Nebraska			Restaurant / Vineyard	Indoor & Outdoor			Family-owned vineyard venue on 80 acres just outside Lincoln, with a rustic barn, a covered patio and scratch-made catering from its own kitchen.	countrypines1@gmail.com	402-470-3665	https://www.countrypineslincoln.com/
Lincoln Commercial Club	200 N 11th St, Suite 300	Lincoln	Nebraska			Historic / Estate	Indoor			Downtown Lincoln ballroom furnished in turn-of-the-century style, with floor-to-ceiling windows, a mirrored back bar, a library and overnight guest suites.		531-249-1132	https://www.lincolncommercialclub.com/
Seven Willows	7600 Panama Road	Hickman	Nebraska			Barn / Rustic	Indoor & Outdoor	400	Classic	Amish-built post-and-beam barn on a 30-acre horse farm near Hickman, with an outdoor ceremony site among willows beside a pond.	sevenwillowsvenue@gmail.com	(402) 610-3121	https://sevenwillowsvenue.com/
Roca Berry Farm Creekside Barn		Roca	Nebraska			Barn / Rustic	Indoor & Outdoor	400		Restored 1917 barn on a 180-acre family farm south of Lincoln, with a deck overlooking Salt Creek and tiny-home cabins for overnight stays.	Jordan@rocaberryfarm.com	402-525-1999	https://rocaberryfarm.com/pages/weddings
Venue 5 Twenty-Two	1525 Yankee Hill Rd	Lincoln	Nebraska			Ballroom / Hotel	Indoor & Outdoor		Classic	Modern 17,000 sq ft event building in south Lincoln with turfed outdoor spaces, fire pits, a bridal suite and a groom's lounge with putting greens.	lori@venue5twentytwo.com	531-350-5784	https://www.venue5twenty-two.com/
The Village	1920 A Avenue	Kearney	Nebraska			Historic / Estate	Indoor			1940 building in central Kearney converted into an open ballroom with brick walls, wood trusses and steel beams strung with café lights.		(308) 293-0231	https://thevillageevents.com/
Boulder Flatts	4058 Enterprise Avenue	Grand Island	Nebraska			Ballroom / Hotel	Indoor & Outdoor			Modern hall opened in 2022 beside Indianhead Golf Course, with an 8,000 sq ft reception room, 25 chandeliers, a double-sided fireplace and a courtyard.	boulderflatts@gmail.com	308-379-8223	https://www.boulderflatts.com/
Stuhr Museum of the Prairie Pioneer	3133 W US Hwy 34	Grand Island	Nebraska			Historic / Estate	Indoor & Outdoor			Pioneer history museum on more than 200 acres, offering the Stuhr Building, the outdoor Hornady Family Arbor and a small white church for ceremonies.	events@stuhrmuseum.org	(308) 385-5316	https://stuhrmuseum.org/join/weddings/
`,
  },
];

export default batches;
