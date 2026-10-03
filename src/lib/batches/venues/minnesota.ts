import type { VenueBatch } from "@/lib/venue-batches";

// Minnesota venue batches. Every row's State is "Minnesota". Add new batches at the end.
const batches: VenueBatch[] = [
  {
    name: "Minneapolis–Saint Paul, Stillwater, Duluth and the North Shore",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Hope Glen Farm	10276 East Point Douglas Rd S	Cottage Grove	Minnesota			Barn / Rustic	Indoor & Outdoor	280		Working farm dating to 1860 beside Cottage Grove Ravine Regional Park, with a barn, vineyard ceremony site and a wedding-night suite.		612-202-2886	https://www.hopeglenfarm.com
Union Depot	214 4th St E	Saint Paul	Minnesota			Historic / Estate	Indoor			Restored 1920s railway station whose high-ceilinged Waiting Room hosts ceremonies and receptions, with a smaller Red Cap Room and getting-ready suites.		651-202-2700	https://www.uniondepot.org/plan-your-event/weddings/
Agate Acres Farm	1109 Two Harbors Rd	Two Harbors	Minnesota			Barn / Rustic	Indoor & Outdoor	160		Sixty-acre North Shore flower farm with a historic red barn, forest paths and a half mile of river frontage near Lake Superior.	events@agateacres.com		https://www.agateacres.com/weddingpackages
Pier B Resort	800 W Railroad St	Duluth	Minnesota			Beach / Waterfront	Indoor & Outdoor	180		Harbourside hotel with a ballroom and rooftop deck facing the Duluth marina, Bayfront Park and the Aerial Lift Bridge.		218-481-8888	https://www.pierbresort.com/weddings/
Fitger's Inn	600 E Superior St	Duluth	Minnesota			Ballroom / Hotel	Indoor & Outdoor	150		Lakefront hotel and event complex in a former brewery, with a Lake Superior view room, ballroom and courtyard.		(218) 722-8826	https://fitgers.com/wedding-and-group-private-events/
Lutsen Mountains Summit Chalet	467 Ski Hill Rd	Lutsen	Minnesota			Garden / Outdoor	Indoor & Outdoor	175		Mountaintop chalet with outdoor ceremony spots over Lake Superior and on-site resort lodging for wedding guests.	legendaryweddings@midwestfamilyskiresorts.com	(218) 663-7281	https://www.lutsen.com/plan-purchase/groups-weddings/weddings-at-lutsen
Parley Lake Winery	8280 Parley Lake Rd	Waconia	Minnesota			Restaurant / Vineyard	Indoor & Outdoor	200	Simple	Working vineyard and orchard of about 125 acres with a historic apple barn, several vineyard ceremony spots and a lake-view stage.	info@parleylake.com		https://www.parleylakewinery.com/weddings
The Saint Paul Hotel	350 Market St	Saint Paul	Minnesota			Ballroom / Hotel	Indoor			Historic downtown hotel with over 14,000 square feet of event space, ballroom receptions and guest rooms for the wedding party.		651-228-3886	https://www.saintpaulhotel.com/weddings/
W.A. Frost & Company	374 Selby Ave	Saint Paul	Minnesota			Restaurant / Vineyard	Indoor & Outdoor			Cathedral Hill restaurant in the historic Dacotah Building with private dining rooms, a fireside room and a garden patio for small weddings.	host@wafrost.com	(651) 224-5715	https://www.wafrost.com/private-events
Minnesota Landscape Arboretum	3675 Arboretum Dr	Chaska	Minnesota			Garden / Outdoor	Indoor & Outdoor	300		University of Minnesota arboretum with over 1,200 acres of gardens, a conservatory and nearly two dozen indoor and outdoor wedding spaces.		(612) 301-4353	https://arb.umn.edu/weddings
Lafayette Club	2800 Northview Rd	Minnetonka Beach	Minnesota			Beach / Waterfront	Indoor & Outdoor	500		Lake Minnetonka club whose century-old crystal ballroom has an enclosed veranda, plus a lakeview deck and a bayside garden for ceremonies.		952-471-6411	https://www.lafayetteclub.com/weddings
Bruentrup Heritage Farm	2170 County Road D E	Maplewood	Minnesota			Barn / Rustic	Indoor & Outdoor	160		Historic farmstead on 22 acres of restored prairie and oak savanna, centred on a 1905 barn with Arts and Crafts gardens.	events@MaplewoodMuseum.org	(651) 748-8645	https://maplewoodmuseum.org/site-rental/
Machine Shop	300 2nd St SE	Minneapolis	Minnesota			Historic / Estate	Indoor			Open, flexible industrial hall in Northeast Minneapolis's St. Anthony neighbourhood, a short walk from the Mississippi.	eventmanagers@damico.com	612-238-4444	https://machineshopmpls.com
Oak Glen Golf Course	1599 McKusick Rd N	Stillwater	Minnesota			Garden / Outdoor	Indoor & Outdoor	400		Golf course just outside Stillwater whose Royal Oak reception room has a fireplace and dance floor, with two outdoor ceremony sites.		651-439-6981	https://oakglengolf.com/weddings
`,
  },
];

export default batches;
