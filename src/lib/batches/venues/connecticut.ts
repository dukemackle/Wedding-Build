import type { VenueBatch } from "@/lib/venue-batches";

// Connecticut venue batches. Every row's State is "Connecticut". Add new batches at the end.
const batches: VenueBatch[] = [
  {
    name: "Hartford and central Connecticut",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Pond House Cafe	1555 Asylum Ave	West Hartford	Connecticut			Garden / Outdoor	Indoor & Outdoor	165		Restaurant inside Elizabeth Park whose Garden Room has cathedral windows and a fieldstone fireplace, with a private terrace over the pond.	cafe@pondhousecafe.com	860-231-8823	https://pondhousecafe.com/weddings/
The Mill on the River	989 Ellington Rd	South Windsor	Connecticut			Beach / Waterfront	Indoor & Outdoor			Riverside banquet house with a waterfront ceremony spot and two reception rooms, the River Room and the upstairs Rafters Room.		860-289-7929	https://www.millweddings.com
Lyman Orchards	70 Lyman Rd	Middlefield	Connecticut			Garden / Outdoor	Indoor & Outdoor	265		Family farm since 1741 spread over 1,100 acres of orchards and golf course, with a tented reception for 265 and the historic Lyman Homestead for smaller parties.	bcritchley@lymanorchards.com	860-349-6046	https://lymanorchards.com/wedding-venues/
Webb Barn at Webb-Deane-Stevens Museum	211 Main St	Wethersfield	Connecticut			Barn / Rustic	Indoor & Outdoor	135		A 19th-century barn with a slate patio on an eight-acre museum campus in Old Wethersfield, beside a Colonial Revival flower garden.	events@wdsmuseum.org	860-529-0612	https://wdsmuseum.org/rent-the-webb-barn/
Butler-McCook House & Garden	396 Main St	Hartford	Connecticut			Historic / Estate	Indoor & Outdoor	225	Simple	Downtown Hartford historic house with a restored garden and the neighbouring Amos Bull House, whose event room keeps its exposed beams and original brick.	rentals@ctlandmarks.org	860-247-8996	https://ctlandmarks.org/properties/butler-mccook-house-garden/
Phelps-Hatheway House & Garden	55 S Main St	Suffield	Connecticut			Historic / Estate	Indoor & Outdoor	160	Simple	Eighteenth-century house on Suffield green with Federal-period rooms, formal gardens and an 1867 barn that seats 75, tented for larger parties.	rentals@ctlandmarks.org	860-247-8996	https://ctlandmarks.org/properties/phelps-hatheway-house-garden/
Delamar West Hartford	1 Memorial Rd	West Hartford	Connecticut			Ballroom / Hotel	Indoor & Outdoor	250		Boutique hotel with spa whose 3,700 sq ft Mystic Ballroom has floor-to-ceiling garden windows, plus a Great Lawn and private terrace for warm months.		860-937-2500	https://www.delamar.com/hotels/delamar-west-hartford/wedding-venues-west-hartford
The Hartford Club	46 Prospect St	Hartford	Connecticut			Historic / Estate	Indoor			Private downtown club founded in 1873 that opens its clubhouse and seven-plus event rooms to non-members for weddings.	frontdesk@hartfordclub.com	860-522-1271	https://hartfordclub.com/weddings-events/
Nathan Hale Homestead	2299 South St	Coventry	Connecticut			Barn / Rustic	Indoor & Outdoor	250	Simple	The 1776 family home of Nathan Hale, a National Historic Landmark, with an 18th-century English barn and a 19th-century dairy barn; tented weddings for about 250.	rentals@ctlandmarks.org	860-247-8996	https://ctlandmarks.org/properties/nathan-hale-homestead/`,
  },
];

export default batches;
