import type { VenueBatch } from "@/lib/venue-batches";

// Tennessee venue batches. Every row's State is "Tennessee". Add new batches at the end.
const batches: VenueBatch[] = [
  {
    name: "Nashville, Knoxville and Memphis",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Union Station Hotel Nashville	1001 Broadway	Nashville	Tennessee			Ballroom / Hotel	Indoor			Hotel inside Nashville's former central railway terminal on Broadway, with ceremony and reception rooms and guest rooms in the same building.		(615) 726-1001	https://www.unionstationhotelnashville.com/celebrate/weddings/
The Hermitage Hotel	231 6th Avenue N	Nashville	Tennessee			Ballroom / Hotel	Indoor	200		Downtown hotel of more than a century with a grand ballroom, lobby and veranda for receptions and 122 rooms and suites upstairs.		(615) 244-3121	https://thehermitagehotel.com/wedding-nashville-tn/
Two Rivers Mansion	3130 McGavock Pike	Nashville	Tennessee			Historic / Estate	Indoor & Outdoor	400	Simple	1859 Italianate mansion on 14 acres of lawn in Two Rivers Park, holding about 100 indoors and larger weddings under a tent.	info@friendsoftworivers.com	(615) 639-0676	https://friendsoftworivers.com/events-at-two-rivers-mansion/
Travellers Rest Historic House Museum	636 Farrell Parkway	Nashville	Tennessee			Historic / Estate	Indoor & Outdoor			John Overton's 1799 house museum with a formal garden, magnolia-shaded meadows and a restored barn with a limestone fireplace.		(615) 832-8197	https://historictravellersrest.org/book-an-event
Homestead Manor	4683 Columbia Pike	Thompson's Station	Tennessee			Historic / Estate	Indoor & Outdoor	400	Classic	48-acre estate dating to 1819, with a renovated reception barn and patio and outdoor ceremony sites.	info@homesteadmanor.com	(615) 854-8052	https://homesteadmanor.com/weddings/
Knoxville Botanical Garden and Arboretum	2743 Wimpole Avenue	Knoxville	Tennessee			Garden / Outdoor	Indoor & Outdoor	200	Classic	44-acre public garden with stone terraces, an ivy-lined stone greenhouse and the glass-walled Dogwood Center for receptions.		(865) 862-8717	https://www.knoxgarden.org/private-events
Castleton Estate	150 Cedar Grove Road	Loudon	Tennessee			Garden / Outdoor	Indoor & Outdoor	700		Gated 110-acre estate with several themed garden settings, a manor house, a vineyard garden and a carriage house among open pasture.	info@castletonestate.com	(865) 376-9040	https://www.castletonestate.com/
Marble Springs State Historic Site	1220 W. Governor John Sevier Highway	Knoxville	Tennessee			Historic / Estate	Outdoor		Simple	Former home of Governor John Sevier, kept as a state historic site on more than 30 wooded acres with meadows and streams.	info@marblesprings.net		https://www.marblesprings.net/site-rental
Historic Ramsey House	2614 Thorn Grove Pike	Knoxville	Tennessee			Historic / Estate	Indoor & Outdoor	300	Simple	1797 stone house on more than 100 acres of original farmland, with outdoor ceremonies, an 80-guest reception room, a bridal cottage and a groom's cabin.	info@ramseyhouse.org	(865) 546-0745	https://www.ramseyhouse.org/private-events/weddings/
The Tennessean Hotel	531 Henley St.	Knoxville	Tennessee			Ballroom / Hotel	Indoor	80		Downtown boutique hotel with three event rooms suited to smaller weddings and guest rooms upstairs.		(865) 232-1800	https://www.thetennesseanhotel.com/weddings/
Dixon Gallery and Gardens	4339 Park Avenue	Memphis	Tennessee			Garden / Outdoor	Indoor & Outdoor			Art museum with formal gardens, where ceremonies take place on the South Lawn or Bowlin Stage and receptions in the Hughes Pavilion.	info@dixon.org	(901) 761-5250	https://www.dixon.org/venue-rental
Memphis Botanic Garden	750 Cherry Road	Memphis	Tennessee			Garden / Outdoor	Indoor & Outdoor	600		96 acres of specialty gardens for ceremonies of almost any size, with indoor rooms on site for receptions.	info@membg.org	(901) 636-4100	https://membg.org/garden-weddings/
The Peabody Memphis	149 Union Avenue	Memphis	Tennessee			Ballroom / Hotel	Indoor			Downtown hotel that has hosted weddings since 1869, with ballrooms and smaller rooms of many sizes under one roof.		(901) 529-4154	https://peabodymemphis.com/weddings/
The Columns	45 South Main St.	Memphis	Tennessee			Historic / Estate	Indoor	800		1929 bank lobby of 20,000 square feet with 22 marble pillars, now run as a downtown event hall.		(901) 674-6813	https://www.resourceentertainment.com/the-columns
Mallory-Neely House	652 Adams Ave	Memphis	Tennessee			Historic / Estate	Indoor			Historic house museum in the Victorian Village district, run by the Museum of Science & History and rented for weddings.		(901) 636-2362	https://moshmemphis.com/calendar-events/event-rentals/mallory-neely-house/
`,
  },
];

export default batches;
