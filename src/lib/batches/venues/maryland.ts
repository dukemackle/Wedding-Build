import type { VenueBatch } from "@/lib/venue-batches";

// Maryland venue batches. Every row's State is "Maryland". Add new batches at the end.
const batches: VenueBatch[] = [
  {
    name: "Baltimore and Annapolis venues",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Overhills Mansion	916 S. Rolling Road	Catonsville	Maryland			Historic / Estate	Indoor & Outdoor		Classic	Century-old Catonsville mansion run by Whitehouse Caterers, with a ceremony patio for 180, a reception tent and in-house menus.		410-744-0040	https://overhillsmansion.com/weddings/
The Liriodendron	502 W Gordon Street	Bel Air	Maryland			Historic / Estate	Indoor & Outdoor	120	Simple	1898 Palladian summer home of Hopkins founding doctor Howard Kelly, with a wisteria canopy, two porticos and a fountain garden.	info@liriodendron.com	(410) 879-4424	https://liriodendron.com/weddings/
Baltimore Museum of Industry	1415 Key Highway	Baltimore	Maryland			Historic / Estate	Indoor & Outdoor			1860s oyster cannery on a five-acre harbour campus, with a waterside terrace and galleries that can open to guests.	info@thebmi.org	410.727.4808	https://www.thebmi.org/host-an-event/bmi-weddings/
The Engineers Club	11 West Mount Vernon Place	Baltimore	Maryland			Historic / Estate	Indoor			Gilded Age Garrett-Jacobs Mansion on Mount Vernon Place, home of the Engineering Society of Baltimore since 1961.		(410) 539-6914	https://www.esb.org/weddings
The Grand Baltimore	225 N Charles St	Baltimore	Maryland			Ballroom / Hotel	Indoor			Downtown events building with 19 ballrooms across 45,000 square feet and its own inner chapel.		(410) 826-5368	https://thegrandbaltimore.com/weddings/
Evergreen Museum & Library	4545 N. Charles Street	Baltimore	Maryland			Historic / Estate	Indoor & Outdoor	170	Classic	Garrett family country house of 1878 to 1952, with a fountain terrace, gardens and a brick carriage house with a tented patio.	privateeventsoffice@jhu.edu	(443) 840-9585	https://evergreenevents.library.jhu.edu/rental-information/weddings-at-the-evergreen/
Hotel Revival	101 West Monument St	Baltimore	Maryland			Ballroom / Hotel	Indoor & Outdoor	75		Mount Vernon boutique hotel with event rooms for up to 75 and a rooftop Garden Room for 45.	info@hotelrevivalbaltimore.com	410-727-7101	https://hotelrevivalbaltimore.com/meetings-events/weddings
Kent Island Resort	500 Kent Manor Drive	Stevensville	Maryland			Barn / Rustic	Indoor & Outdoor	275		Resort around a historic manor house on Thompson Creek, with a barn-style Farmstead, a sailcloth Pavilion and a waterside Garden House.	events@kentislandresort.com	(410) 643-5757	https://www.kentislandresort.com/weddings/
Chesapeake Bay Beach Club	500 Marina Club Road	Stevensville	Maryland			Beach / Waterfront	Indoor & Outdoor	310		Bayfront resort past the Bay Bridge with four ballrooms, the largest for 310, and guest rooms across four properties.		(410) 604-5900	https://www.baybeachclub.com/weddings
Tidewater Inn	101 East Dover St.	Easton	Maryland			Ballroom / Hotel	Indoor			Downtown Easton hotel of 86 rooms with two ballrooms and a carriage house a block away at the Tidewater House.	mbennett@tidewaterinn.com	410.822.1300	https://tidewaterinn.com/weddings
Chesapeake Bay Maritime Museum	213 N. Talbot St.	St. Michaels	Maryland			Beach / Waterfront	Indoor & Outdoor			18-acre museum campus on the Miles River with over 2,000 feet of waterfront, a boat shed and cove-side lawns.	lclark@cbmm.org	410.745.4998	https://www.cbmmweddings.com/
Kurtz's Beach	2070 Kurtz Avenue	Pasadena	Maryland			Beach / Waterfront	Indoor & Outdoor	240		Family-run bayfront grounds in Pasadena with the Bay Room ballroom, a gazebo lawn, pavilions and dressing cottages.	info@kurtzsbeach.com	(410) 255-1280	https://www.kurtzsbeach.com/waterfront-weddings-banquets-maryland/
Celebrations at the Bay	2042 Knollview Ave	Pasadena	Maryland			Beach / Waterfront	Indoor & Outdoor	400		All-inclusive Chesapeake Bay venue with a ballroom, a tented ballroom and the smaller Knollview House.	info@celebrationsatthebay.com	301-572-7744	https://www.celebrationsatthebay.com/
Annapolis Waterfront Hotel	80 Compromise Street	Annapolis	Maryland			Ballroom / Hotel	Indoor & Outdoor	450		Downtown hotel on Annapolis Harbor with a ballroom and harbourside patio, each for up to 450.		888-773-0786	https://www.annapoliswaterfront.com/gatherings/weddings-occasions`,
  },
];

export default batches;
