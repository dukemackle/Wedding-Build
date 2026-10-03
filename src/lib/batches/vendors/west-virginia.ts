import type { VendorBatch } from "@/lib/vendor-batches";

// West Virginia vendor batches. Every row's State is "West Virginia". Add new batches at the end.
const batches: VendorBatch[] = [
  {
    name: "Charleston: photography, planning, florals, music, catering, cake and videography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
The Oberports	Photography		Charleston	West Virginia	Charleston, Fayetteville, New River Gorge, Huntington, Morgantown and beyond	Married photography duo documenting weddings and elopements across West Virginia with a thoughtful, artful style.	hello@theoberports.com		https://theoberports.com/	https://www.instagram.com/theoberports/
Emily Ferguson Photography	Photography		Charleston	West Virginia	Charleston, Huntington, Beckley, Parkersburg, Wheeling, Fayetteville, Lewisburg, Morgantown	Husband-and-wife team from the Charleston area offering creative yet timeless wedding and elopement photography statewide.		(304) 205-9647	https://www.efergusonphotography.com/	https://www.instagram.com/emily_ferguson_photography/
Lauren Love Photography	Photography		Charleston	West Virginia	West Virginia and Kentucky; destination weddings	Wedding and engagement photographer covering Charleston, Huntington and resort venues such as Snowshoe, with travel further afield.			https://laurenlovephotography.com/	https://www.instagram.com/laurenlovephotography/
The Breiters	Videography		Charleston	West Virginia	East Coast, Pacific Northwest and destinations abroad	Appalachian photographer and videographer duo making honest, unpolished wedding and elopement films alongside stills.	hello@thebreiters.com		https://thebreiters.com/	https://www.instagram.com/thebreiters/
Charleston Cut Flower Company	Florals	1900 5th Ave	Charleston	West Virginia		Long-running, family-owned Charleston flower shop designing ceremony and reception flowers, bouquets and centrepieces, with consultations.		(304) 343-5116	https://charlestoncutflower.com/pages/wedding-page	
G&S Celebrations	Music		Charleston	West Virginia		Husband-and-wife DJ and MC team covering ceremony, cocktail hour and reception, with dance-floor lighting and a planned timeline.	gscelebrations@gmail.com		https://www.gscelebrations.com/weddings	
Allianz Music Ensembles	Music		Charleston	West Virginia		Musician-run agency booking auditioned string quartets and other ensembles for ceremonies, with custom arrangements and song requests.	ian@allianzmusicensembles.com	(304) 550-3078	https://allianzmusicensembles.com/	https://www.instagram.com/allianzmusicensembles/
DJ Tibbs	Music		Charleston	West Virginia		One-woman wedding DJ blending EDM, disco, funk, Afro-fusion and country into personalised sets for receptions and intimate parties.	brooke.thibodaux@gmail.com	(636) 577-4911	https://www.djtibbs.com/	
Loma Cakes and Catering	Catering		Charleston	West Virginia	West Virginia and Ohio	Woman-owned caterer cooking homestyle buffet and plated wedding menus, with over 35 cake flavours and desserts made in-house.	loma@lomacakes.com		https://www.lomacakes.com/	https://www.instagram.com/lomacakesandcatering/
Spring Hill Pastry Shop	Cake	600 Chestnut St	South Charleston	West Virginia	Kanawha Valley	Neighbourhood pastry shop baking Kanawha Valley wedding cakes for about 70 years, from lace overlays to naked and ombré tiers.		(304) 768-7397	https://www.springhillpastry.com/wedding-cakes	
Sugar Pie Bakery	Cake	94 RHL Blvd	South Charleston	West Virginia		Scratch bakery making hand-decorated wedding cakes, cupcakes and cookies, with an allergy information page and online ordering.	info@sugarpiebakerywv.com	(304) 205-7753	https://www.sugarpiebakerywv.com/	
Rock City Cake Co.	Cake		Charleston	West Virginia		Charleston cake company now working by order only, making wedding cakes alongside cake pops, push pops and event desserts.		(681) 265-9154	https://www.rockcitycakeco.com/	https://www.instagram.com/rockcitycakeco/
Oak + Arrow Films	Videography		Charleston	West Virginia	West Virginia and Kentucky	Husband-and-wife team of Lindsey and Caleb Tackett filming story-led wedding films, with photography offered alongside.			https://oakandarrowfilms.com/	https://www.instagram.com/oakandarrowfilms/
Eye Lens Visuals	Videography		Dunbar	West Virginia	West Virginia, Kentucky, Ohio, Pennsylvania, North Carolina	Family-run Kanawha Valley team offering cinematic wedding films with drone footage, plus photo and DJ bundles under one booking.		(304) 881-7363	https://www.eyelensvisuals.com/	
Coordinated Chaos Co	Planning		Charleston	West Virginia		Planning team led by Taylor Kiser offering day-of coordination for already-planned weddings and full planning with design guidance.	team@coordinatedchaosco.com	(681) 234-4845	https://www.coordinatedchaosco.com/	https://www.instagram.com/coordinatedchaosco_/
Simple Moments Event Designs	Planning		Charleston	West Virginia	West Virginia and destination weddings	Charleston planning duo Stephanie and David offering custom coordination packages, from a few details to full planning and venue décor.	simplemomentswv@gmail.com	(304) 419-4757	https://simplemomentswv.com/	https://www.instagram.com/simplemomentswv/`,
  },
  {
    name: "Charleston: florals, catering and hair & makeup",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Good Sun Florals	Florals		Charleston	West Virginia	Charleston area; travels for events	Charleston-area floral studio led by a West Virginia artist, creating sustainable wedding flowers and running classes and subscriptions.			https://goodsunflorals.com/	
Styles Salon	Hair & Makeup	519 C Street	South Charleston	West Virginia		South Charleston salon doing bridal hair and wedding-party styling, with colour, extensions and blowouts for the rest of the year.		(304) 746-4650	https://stylessalonwv.com/	
Shuckers Catering Services	Catering	70 Olde Main Plaza	St. Albans	West Virginia	St. Albans, Charleston, South Charleston, Nitro, Winfield, Hurricane and beyond	St. Albans seafood and Italian restaurant catering wedding receptions with fresh seafood, comfort classics and custom menus.		(304) 722-1500	https://eatatshuckers.com/shuckers-catering-services/	https://www.instagram.com/eatatshuckers/
L & R Custom Catering	Catering	3380 Teays Valley Road	Hurricane	West Virginia	Putnam, Cabell and Kanawha Counties	Teays Valley barbecue kitchen catering wedding receptions and family celebrations with smoked meats and custom menus.	landrbbq@gmail.com	(304) 757-0707	https://lrcustomcatering.com/	
Art's Flower and Gift Shop	Florals	1227 Ohio Ave.	Dunbar	West Virginia	Dunbar, Charleston, Kanawha City, South Charleston, Nitro, St. Albans, Cross Lanes, Hurricane, Scott Depot	Third-generation Dunbar flower shop open since 1963, arranging wedding and event flowers alongside everyday bouquets and gifts.		(304) 768-1237	https://artsflowershop.com/dunbar-florist-flower-delivery/wedding-flowers/	`,
  },
];

export default batches;
