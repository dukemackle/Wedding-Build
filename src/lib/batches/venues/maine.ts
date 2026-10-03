import type { VenueBatch } from "@/lib/venue-batches";

// Maine venue batches. Every row's State is "Maine". Add new batches at the end.
const batches: VenueBatch[] = [
  {
    name: "Portland and coastal Maine",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Pineland Farms	15 Farm View Drive	New Gloucester	Maine			Barn / Rustic	Indoor & Outdoor			Working farm north of Portland with an English garden and Victorian gazebo for ceremonies, a tented patio for receptions, a barn and guest houses.		(207) 688-4539	https://www.pinelandfarms.org/weddings
Spruce Point Inn	88 Grandview Ave	Boothbay Harbor	Maine			Beach / Waterfront	Indoor & Outdoor			Oceanside resort in Boothbay Harbor with lodges, cottages, a dock, a spa and three restaurants on site.	spi@sprucepointinn.com	207-633-4152	https://www.sprucepointinn.com/weddings
Nonantum Resort	95 Ocean Avenue	Kennebunkport	Maine			Beach / Waterfront	Indoor & Outdoor	300		Waterfront resort in Kennebunkport with marina and lighthouse views, lawns, in-house catering and 109 guest rooms.	stay@nonantumresort.com	888-205-1555	https://www.nonantumweddings.com
Cellardoor Winery	367 Youngtown Road	Lincolnville	Maine			Restaurant / Vineyard	Indoor & Outdoor	500	Classic	Vineyard below the Camden Hills with a 10,000 sq ft covered pavilion beside the vines, a 1790s barn tasting room and a farmhouse for smaller gatherings.	info@cellardoorfarm.com	(207) 763-4478	https://mainewine.com/venue/
Beech Ridge Barn	21 Beech Ridge Road	Scarborough	Maine			Barn / Rustic	Indoor & Outdoor	225		Restored 1800s barn on 25 acres with a ceremony patio and veranda, plus two five-bedroom houses for the wedding party.	Bridget@beechridgebarn.com	917-536-8828	https://www.beechridgebarn.com
The Barn at Hatch Point	1411 River Road	Bowdoinham	Maine			Barn / Rustic	Indoor & Outdoor	175		Modern black barn on the Kennebec River facing Swan Island, with patios, two bars and ten cabins plus a master cabin on site.	kelly@thebarnathatchpoint.com	207-807-7697	https://thebarnathatchpoint.com
Brick South at Thompson's Point	15 Resurgam Place	Portland	Maine			Historic / Estate	Indoor			Brick-and-beam hall of 25,000 sq ft with high ceilings and windows onto the Fore River, part of the Thompson's Point complex.	events@thompsonspointmaine.com		https://thompsonspoint.com/wedding/
Portland Regency Hotel & Spa	20 Milk Street	Portland	Maine			Ballroom / Hotel	Indoor & Outdoor	200		Downtown Portland hotel with a spa, a roof terrace over downtown, the Atlantic Room and nearby Mariner's Church for events.	sales@theregency.com	(207) 774-4200	https://www.theregency.com/weddings
Camden Harbour Inn	83 Bayview Street	Camden	Maine			Historic / Estate	Indoor & Outdoor	110		Small inn above Camden harbour with about 20 rooms and suites, a villa and its own restaurant, Natalie's, suited to intimate weddings.	info@camdenharbourinn.com	(207) 236-4200	https://www.camdenharbourinn.com/celebrate
The 1812 Farm	1297 Bristol Road	Bristol	Maine			Barn / Rustic	Indoor & Outdoor	130		All-inclusive three-acre farm with a restored antique barn, gardens, a pond, an Airstream bar car and lodging for 14 guests.	info@the1812farm.com	207.563.6007	https://www.the1812farm.com
Wells Reserve at Laudholm	342 Laudholm Farm Rd	Wells	Maine			Historic / Estate	Indoor & Outdoor	250	Classic	Historic saltwater farm on a 2,250-acre reserve with a barn, a farmhouse with a wrap-around porch, trails and a walk to the beach.	tracy@laudholm.org	207-646-1555	https://wellsreserve.org/visit/facilities/wedding-venue
Gilsland Farm (Maine Audubon)	20 Gilsland Farm Road	Falmouth	Maine			Garden / Outdoor	Outdoor	150		Wildlife sanctuary with a tented apple orchard and open field, and the L.L.Bean Great Room as an indoor backup for smaller groups.	rentals@maineaudubon.org	207.781.2330	https://maineaudubon.org/rentals-special-events/`,
  },
];

export default batches;
