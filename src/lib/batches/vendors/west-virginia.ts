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
  {
    name: "Charleston: planning and hair & makeup",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Spa Bliss	Hair & Makeup	1210 Smith Street	Charleston	West Virginia		Downtown Aveda salon and spa doing HD airbrush bridal makeup and special-occasion updos, with service at your location available.	info@spabliss.com	(304) 720-1005	https://spabliss.com/services/makeup-application/	https://www.instagram.com/spablisswv/
Enchanted Events	Planning		Hurricane	West Virginia	Based in Hurricane; travels for weddings	Hurricane planning team led by a certified planner, offering tiered packages from day-of coordination to full planning, with an online couple portal.	get.started@enchantedevents.info	(304) 483-8235	https://www.enchantedevents.info/	https://www.instagram.com/enchantedeventswv/`,
  },
  {
    name: "Morgantown: photography, planning, florals, music, catering, cake, videography and hair & makeup",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Amberlee Christey Photography	Photography		Morgantown	West Virginia	Morgantown and destination weddings worldwide	Award-winning Morgantown wedding and engagement photographer with fourteen years in business who also travels for destination weddings.		(304) 216-5903	https://www.amberleechristeyphotography.com/	https://www.instagram.com/amberleechristeyphotography/
Buonamici Exposures	Photography		Morgantown	West Virginia		Morgantown-based wedding and portrait photographer taking bookings for weddings, engagements and sessions around West Virginia.	buonamiciexposures@gmail.com		https://buonamiciexposures.com/	https://www.instagram.com/buonamiciexposures/
Lunar Media	Videography		Morgantown	West Virginia	Morgantown to Pittsburgh	Two friends offering wedding photography, video and DJ service as one booking, working from Morgantown to Pittsburgh and beyond.	lunar.media.company@gmail.com		https://lunarmediaweddings.com/	https://www.instagram.com/lunarmediaco/
Kathryn Rose Event Company	Planning		Morgantown	West Virginia	West Virginia, greater Pittsburgh and Asheville, North Carolina	Morgantown planners designing adventurous mountaintop and brewery weddings across West Virginia, the Pittsburgh area and Asheville.			https://kreventco.com/	https://www.instagram.com/kathrynroseeventco/
Dream Creations Event Planning	Planning		Morgantown	West Virginia	Morgantown, Deep Creek and Oakland MD, southwestern PA	Planning and coordination for weddings and parties in Morgantown, Deep Creek Lake and southwestern Pennsylvania, with set packages.			https://dreamcreationseventplanning.com/	https://www.instagram.com/dream_creations_event_planning/
Brittany Anne's	Planning		Morgantown	West Virginia		Morgantown rental and planning company offering wedding coordination with two team members on site, plus arches, backdrops and flower walls.	brittanyannesevents@gmail.com	(304) 415-2723	https://brittanyannesevents.com/wedding-coordination	https://www.instagram.com/brittanyannesevents/
Love and Lavender Moments	Planning		Morgantown	West Virginia		Husband-and-wife Morgantown team offering wedding and event coordination, services and rentals, with value packages priced on the site.			https://www.loveandlavendermoments.com/home	
Zaccagnini Morgantown Florist	Florals	735 Chestnut Ridge Rd, Suite E	Morgantown	West Virginia	Morgantown and surrounding areas	Florist formed from two long-running Morgantown shops, making bridal bouquets, ceremony flowers and reception arrangements.		(304) 599-2996	https://www.morgantownflorist.com/shop/weddings	
Bella Fiore Floral	Florals	967 Canyon Road	Morgantown	West Virginia	Morgantown and surrounding areas	Morgantown florist founded by designer Jason Savage, doing wedding bouquets, personal flowers and event arrangements alongside everyday orders.	jasonbellafiore@gmail.com	(304) 777-2472	https://morgantownflowerswv.com/	
Dynamic Entertainment & Lighting Productions	Music		Morgantown	West Virginia	North Central West Virginia	Husband-and-wife DJ and lighting team with 20-plus years between them, offering reception coordination, uplighting and dance-floor effects.	dynamicdj0777@gmail.com	(304) 669-8442	https://dynamicdjwv.com/	
Musicshow Sound	Music		Morgantown	West Virginia		Morgantown production company providing wedding DJ and MC service, sound for live bands, dance-floor and up-lighting, and confetti or CO2 effects.	kevin@musicshowsound.com	(304) 288-3057	https://musicshowsound.com/weddings	
DJ Dave Event Services	Music		Morgantown	West Virginia		Morgantown wedding DJ and MC company that also rents photo booths and offers event planning through a planner on its team.			https://djdeventservices.wixsite.com/home	https://www.instagram.com/djdaverishell/
Madeleine Marie's Catering & Carryout	Catering	260 Green St	Morgantown	West Virginia		Full-service Morgantown caterer with over 25 years of event experience, offering set packages or custom menus plus everyday carryout.	info@madeleinemaries.com		https://www.madeleinemaries.com/events	https://www.instagram.com/madmariescatering/
Mario's Full Bowl Catering	Catering	3117 University Avenue	Morgantown	West Virginia		Morgantown restaurant caterer doing buffet, plated, family-style or boxed menus on site or off site, with custom menus to suit a budget.		(304) 599-4309	https://www.mariosfishbowl.com/catering	https://www.instagram.com/mariosfishbowl/
Lake House Catering	Catering	165 Sunset Beach Road	Morgantown	West Virginia		Lake House restaurant's catering arm, taking orders for parties and celebrations from the Sunset Beach Road kitchen near Morgantown.		(304) 594-0088	https://www.lakehousewv.com/catering/	
Honeycomb Baking	Cake		Morgantown	West Virginia	West Virginia, Pennsylvania and Maryland	Boutique Morgantown bakery making artistic, timeless wedding cakes and cookies, with each design tailored to the couple.		(304) 578-1781	http://www.honeycombbaking.com/	https://www.instagram.com/honeycombbaking/
Megan's Custom Creations	Cake		Morgantown	West Virginia		Morgantown home baker making artistic wedding cakes, cupcakes, macarons and sugar cookies, with $50 tastings credited toward the final order.	meganscookiesandcakes@gmail.com		https://www.meganscustomcreations.com/wedding-cakes	
Honey Bridal Collective	Hair & Makeup		Morgantown	West Virginia	Morgantown and surrounding areas	Salon collective of bridal beauty artists doing hair and makeup on site, with an optional Bridal Preview in its private salon suite.	honeybridalwv@gmail.com	(304) 266-2535	https://www.honeywv.com/bridal	https://www.instagram.com/honeywv_/
Amanda Vicinelly	Hair & Makeup		Morgantown	West Virginia	Morgantown, Uniontown and Pittsburgh	Travelling bridal makeup artist focused on skin-forward looks and colour harmony, taking wedding bookings for 2027.	amandavicinelly@gmail.com	(412) 848-4247	https://www.amandavicinelly.com/	https://www.instagram.com/amandavicinellypromakeupartist/`,
  },
  {
    name: "New River Gorge: photography, videography, florals, music, catering and cake",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Chris Jackson Photography	Photography		Fayetteville	West Virginia	Statewide West Virginia including the New River Gorge, Charleston, Lewisburg and Morgantown	Documentary and fine art wedding photographer in Fayetteville, covering the New River Gorge and elopements across West Virginia and beyond.	chrisphoto304@gmail.com	304.553.3785	https://chrisjacksonphoto.com/	https://www.instagram.com/chrisjacksonphoto/
Sheena Pendley Design + Photography	Photography		Lewisburg	West Virginia	West Virginia, Virginia and Maryland	Husband-and-wife photo and video team in downtown Lewisburg, covering weddings, elopements and engagements across southern West Virginia and Virginia.	hello@sheenapendleydp.com	304.646.9452	https://www.sheenapendleydp.com/	https://www.instagram.com/sheenapendley/
Greenbrier Images	Photography		Lewisburg	West Virginia	Lewisburg and surrounding areas including Beckley, Snowshoe and Virginia	Lewisburg photographer offering wedding photography and films, with portfolio weddings through 2026 and coverage around Beckley and Snowshoe.	info@greenbrierimages.com	304 237 5170	https://www.greenbrierimages.com/	
Lady Mountain Films	Videography		Fayetteville	West Virginia		Fayetteville filmmaker making wedding films and photos, with a focus on adventure elopements and non-traditional weddings since 2017.			https://www.ladymountainfilms.com/	https://www.instagram.com/ladymountainfilms/
Aronfield Weddings	Videography		Beckley	West Virginia	Central and southern West Virginia, over 16 counties	Wedding videography across central and southern West Virginia, with three coverage packages running from two to ten hours.			https://aronfieldweddings.com/	
Xandar Blankenship Photo & Film	Photography		Meadow Bridge	West Virginia	Meadow Bridge, Fayetteville, Oak Hill, Beckley, Mount Hope, Hinton, Lewisburg and Princeton	Meadow Bridge photographer and videographer covering weddings and engagements around Fayetteville, Oak Hill, Beckley and Lewisburg.		(304) 396-6983	https://photographermeadowbridge.com/	https://www.instagram.com/xandarblankenship/
Kelli Carrico Photography	Photography		Beckley	West Virginia		Beckley wedding photographer with over 300 weddings photographed, including work at The Greenbrier Resort, and photography education for others.	kellicarricophotography@hotmail.com		https://www.kellicarricophotography.com/	https://www.instagram.com/kellicarricophotography/
Jaki Good Miller Photography	Photography		Summersville	West Virginia	Summersville and the surrounding region	Summersville photographer offering wedding, senior and family portraits, and a Certified Professional Photographer with a PPA master's degree.	jaki@jakigoodmiller.com	304-940-5254	https://www.jakigoodmiller.com/	
Savannah Confections	Cake		Beckley	West Virginia		Beckley cake and dessert studio making bespoke, from-scratch wedding cakes and confections, with 2026 and 2027 wedding dates open for booking.			https://www.savannahconfections.com/	https://www.instagram.com/savannahconfections/
Designs By Barb & James Inc.	Florals	305 Main Street West	Oak Hill	West Virginia	Oak Hill and surrounding areas	Oak Hill flower shop offering wedding bouquets, ceremony flowers and reception flowers alongside everyday seasonal arrangements.		(304) 469-6006	https://www.designsbybarbandjamesinc.com/	
Greenbrier Cut Flowers & Gifts	Florals	246 Maplewood Avenue	Lewisburg	West Virginia	Lewisburg and surrounding regions	Lewisburg florist with more than twenty years' experience designing wedding packages, from bridal bouquets and ceremony pieces to reception tables.		(304) 645-6694	https://www.greenbriercutflowers.com/	
Glade Creek Floral	Florals	8430 Webster Rd.	Summersville	West Virginia	Summersville and surrounding areas	Family-run Summersville florist making custom arrangements for weddings and other occasions, with delivery across the local area.		(304) 872-3105	https://www.gladecreekfloral.com/	
SunTan Swine BBQ	Catering		Glen Fork	West Virginia	Oceana, Gilbert, Pineville, Glen Daniel, Beckley, Brenton and Mullens	Family-run mobile barbecue caterer from Glen Fork serving weddings with slow-smoked pulled pork, brisket, ribs and wings from a food truck.	SunTanSwineBBQ@Yahoo.com	304-237-1353	https://www.suntanswinebbq.com/	https://www.instagram.com/suntan.swine.bbq/
Hungry Bear Catering	Catering		Fayetteville	West Virginia		Fayetteville caterer offering smoked meats and smokehouse sides for weddings, plus tables, chairs and tents for full-service events.	phgfoodservice@gmail.com	304-719-9153	https://www.hungrybearwv.com/	
Kellen's Kitchen	Catering		Lewisburg	West Virginia	Lewisburg, White Sulphur Springs, Ronceverte, Fairlea, Alderson, Rainelle and Greenbrier County	Lewisburg caterer running since 2004, serving pit-smoked barbecue and offering drop-off catering for Greenbrier County weddings.	kellen@pigsflybbq.com	(304) 249-8124	https://kellenskitchenwv.com/	
Blackwell's Catering	Catering	830 Jefferson Street South	Lewisburg	West Virginia	Lewisburg area, delivery available	Lewisburg chef-owned caterer providing custom menus for plated weddings and fundraisers, with pickup, delivery and event space hire.		304-645-6159	https://www.blackwellscatering.com/	https://www.instagram.com/blackwellsgbc/
Maple Hill Entertainment	Music		Ronceverte	West Virginia	Greenbrier Valley	Ronceverte DJ and announcing service covering weddings, proms, school dances and parties across the Greenbrier Valley.	maplehillentertainment@yahoo.com	304-647-4231	https://www.maplehillentertainment.com/	`,
  },
  {
    name: "Charleston: hair & makeup",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Oasis Spa	Hair & Makeup	33 RHL Blvd	South Charleston	West Virginia		South Charleston day spa and salon offering bridal styling and a bride-to-be package alongside lashes, brows, nails and facials.	oasisspawv@gmail.com	304-747-6116	https://oasisspacharleston.com/	https://www.instagram.com/oasis.spa.wv/`,
  },
  {
    name: "Morgantown: photography, florals, hair & makeup, cake and videography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Kristin Hurley Photography	Photography		Morgantown	West Virginia		Morgantown fine art wedding photographer known for natural, emotional coverage of weddings across West Virginia and nearby Pennsylvania.			https://www.kristinhurleyphotography.com/	
Beverly Hills Florist	Florals	1269 Fairmont Rd	Morgantown	West Virginia		Morgantown flower shop on Fairmont Road that handles wedding flowers by consultation, alongside everyday arrangements and local delivery.	morgantownflowershop@gmail.com	304-983-2899	https://www.morgantownflowershop.com/	
Tuscan Sun Spa and Salon	Hair & Makeup	401 Boyers Ave	Morgantown	West Virginia		Spa and salon on Boyers Avenue with bridal updos, bridal party styling and spa packages for the wedding party before the big day.		304-296-1325	https://tuscanspaandsalon.com/salon/bridal/	https://www.instagram.com/tuscansunspa/
The Cupcakerie	Cake	3200 Collins Ferry Road	Morgantown	West Virginia		Morgantown cupcake café and bakery off Collins Ferry Road that also caters weddings and private events with made-to-order menus.	orders@thecupcakerie.com	304-212-5464	https://thecupcakerie.com/	
Image Studios & Entertainment	Videography		Morgantown	West Virginia		Morgantown studio offering wedding videography packages alongside photography and DJ services, travelling further for a mileage fee.	ljlenhart@imagestudiosllc.com	304-216-2064	https://imagestudiosandentertainment.com/	
GeeCee Media	Videography		Morgantown	West Virginia		Morgantown wedding film company producing cinematic wedding videos and photography, and travelling beyond West Virginia for couples.		304-644-2848	https://www.geeceemedia.com/	`,
  },
  {
    name: "New River Gorge: planning, music, hair & makeup, cake and videography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Gillespie's	Planning	377 Main Street West	White Sulphur Springs	West Virginia		Greenbrier Valley event company offering personalised event planning, sailcloth tents, décor rentals and wedding florals.	sales@gillespies.events		https://gillespies.events/	
West Virginia Elopement Collective	Planning		Fayetteville	West Virginia	New River Gorge, Dolly Sods, Spruce Knob and Blackwater Falls	Weekday elopement planners running all-inclusive days at the New River Gorge and other WV spots, with photo, film and an officiant.			https://westvirginiaelopements.com/	https://www.instagram.com/wvelopementcollective/
Weddings By Leah	Planning		Oak Hill	West Virginia		Oak Hill planner who takes on wedding and event planning by appointment for couples around Fayette County and the New River Gorge.		304-640-0224	https://weddingsbyleah.wixsite.com/leahcoats	
Purpose Entertainment	Music		Beckley	West Virginia	Beckley, Fayetteville, Oak Hill, Lewisburg, Summersville and southern West Virginia	Beckley DJ and MC company covering weddings across southern West Virginia, with lighting and a planning-led approach to the reception.	naybz@purposedjs.com	304-894-4003	https://purposedjs.com/	
Branded Beauty Salon	Hair & Makeup	921 Court St N	Lewisburg	West Virginia		Lewisburg salon with bridal and special-event hair and makeup services alongside colour, extensions, nails and everyday styling.			https://josiepatterson.glossgenius.com/	https://www.instagram.com/brandedbyjosie/
The Studio	Hair & Makeup	348 Webster Street	Lewisburg	West Virginia		Full-service Lewisburg hair and nail salon offering bridal consultations and special-occasion makeup through online booking.			https://square.site/book/SBY34FD55GACG/the-studio-lewisburg-wv	
Fruits of Labor	Cake	161 Main Street	Rainelle	West Virginia		Rainelle café, bakery and culinary training centre making custom wedding cakes for couples who book its full wedding catering.	jordan@fruitsoflaborinc.com	304-438-7425	https://www.fruitsoflaborinc.com/	
Kenzie's Kakes & Coffee	Cake		Beaver	West Virginia		Raleigh County bakery and coffee shop making custom cakes, including wedding and bridal shower cakes, plus cupcakes and cheesecake.			https://www.kenzieskakes.com/	
White Heaven Co	Videography		Nitro	West Virginia	New River Gorge, Fayetteville and the East Coast	Nitro-based photo and film team that regularly shoots New River Gorge weddings, delivering 4K and 6K cinematic wedding films.	booking@whiteheaven.co		https://whiteheaven.co/productions/weddings/locations/fayetteville-wv	`,
  },
  {
    name: "Morgantown: hair & makeup",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Tonique's Trilogy	Hair & Makeup	725 Fairmont Rd, Suite 103	Morgantown	West Virginia		Morgantown salon offering wedding hair and makeup, with bookings handled by phone, text or email.		(304) 212-5558	https://toniquestrilogy.com/	`,
  },
  {
    name: "New River Gorge: cake",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Posh Manna Cake Art	Cake		Oak Hill	West Virginia	Southern West Virginia	Luxury cake and dessert studio making European-style wedding cakes, macarons and pastries, with consultations and tastings.		(304) 673-2592	https://www.poshmanna.com/	https://www.instagram.com/poshmannacakeart/`,
  },
  {
    name: "New River Gorge: music",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
The Cat's Meow Entertainment	Music		Barboursville	West Virginia	All of West Virginia, plus parts of Kentucky and Ohio	All-female DJ trio playing weddings across West Virginia since 2016, with a photo booth and an online planning tool for couples.	thecmentertainment@gmail.com	904-763-6750	https://www.thecmentertainment.com/	https://www.instagram.com/djcatsmeow/
`,
  },
  {
    name: "Huntington: photography, florals",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram	Price from	Price unit
Hedgecock Studio	Photography	826 20th Street	Huntington	West Virginia	Huntington	Huntington portrait studio with a dedicated wedding gallery, which also photographs school and sports events.		(304) 525-4657	https://www.hedgecockphotography.com/			
Archer's Flowers & Gallery	Florals	523 11th Street	Huntington	West Virginia	Huntington, Barboursville, Milton, Ona, Ceredo, Kenova, Proctorville, Chesapeake, South Point	Huntington flower shop and gallery creating wedding and event flowers, with consultations and delivery to nearby Tri-State towns.	archersflowers@hotmail.com	(304) 522-8272	https://archersflowers.com/	https://www.instagram.com/archersflowers/		
Garrison Designs Florist & Interiors	Florals		Huntington	West Virginia	Greater Huntington area	Huntington florist offering ceremony and reception flowers, bridal bouquets, boutonnieres and centrepieces, with consultations and venue delivery.			https://garrisonsdesignsandflorist.com/			
Designs By DJ Florist and Gifts	Florals	6285 East Pea Ridge Road	Huntington	West Virginia	Huntington, Barboursville, Milton, Ona, Ceredo, Culloden, Kenova, Lavalette, Proctorville, Salt Rock	Huntington florist taking wedding flower orders by phone or in person, with delivery to Barboursville, Milton, Ona and other nearby towns.		304-736-2550	https://designsbydjflorist.com/			
Lori Pickens Photography	Photography		Parkersburg	West Virginia	Parkersburg, West Virginia and Ohio	Parkersburg wedding and portrait photographer covering elopements, intimate weddings and larger celebrations across West Virginia and Ohio.			https://loripickens.com/	https://www.instagram.com/loripickensphotography/		
FSTimages	Photography	1704 Staunton Ave	Parkersburg	West Virginia	Parkersburg and West Virginia	Parkersburg photography studio covering weddings, engagements, senior portraits, sports and family sessions from its Staunton Avenue base.	BrittonWasmer@FSTimages.com	304-488-4623	https://www.weddingworldtraveller.com/			
`,
  },
  {
    name: "Eastern Panhandle: photography, music, catering, florals, cake",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram	Price from	Price unit
Aaron May Photo	Photography		Shepherdstown	West Virginia	Martinsburg, Shepherdstown, Harpers Ferry and the wider Eastern Panhandle	Wedding and elopement photographer working from the Shepherdstown area, with most weddings in Berkeley County and no travel fee there.	aaron@aaronmayphoto.com		https://www.aaronmayphoto.com/		5000	package
Frame & Vow	Photography		Martinsburg	West Virginia	Martinsburg, Shepherdstown, Charles Town, Berkeley Springs and the wider Eastern Panhandle	Martinsburg studio offering wedding photography and film from a single team, covering the Panhandle, Shenandoah Valley and further afield.	moises@scmarketingwv.com	304-314-2750	https://www.frameandvow.com/	https://www.instagram.com/frameandvoweddingstudio/		
Love & Sol Photography	Photography	157 Aerie Lane	Harpers Ferry	West Virginia	Harpers Ferry, the DC area and available for travel	Harpers Ferry photography studio shooting weddings and elopements for couples in the Potomac and Shenandoah river area.	hello@loveandsolphoto.com	703-501-1840	https://loveandsolphoto.com/	https://www.instagram.com/love.and.sol/		
Rachel Langerhans Photography	Photography		Kearneysville	West Virginia	Charles Town, Shepherdstown, Harpers Ferry and nearby parts of Virginia, Maryland and Pennsylvania	Kearneysville photographer who covers couples, engagements, elopements and weddings across the eastern Panhandle and neighbouring states.			https://rachellangerhans.zenfolio.com/	https://www.instagram.com/RachelLangerhansPhotography/		
Let the Good Times Roll DJ Service	Music		Martinsburg	West Virginia	Martinsburg and the Eastern Panhandle	Martinsburg DJ service run by a husband and wife, playing weddings, dances and parties since 1996.		304-267-8453	https://djjeffbaker.com/	https://www.instagram.com/djjeffbaker/		
Shenandoah Entertainment	Music		Charles Town	West Virginia	Eastern Panhandle, Northern Virginia, DC, Maryland and the Shenandoah Valley	Charles Town DJ and MC for weddings and events, travelling across the Panhandle and neighbouring regions.	djrayc62@gmail.com	(540) 546-4315	https://www.shenandoahentertainment.com/			
MOJO's Catering	Catering		Charles Town	West Virginia	Charles Town and surrounding areas	Charles Town caterer offering buffet-style wedding menus and food tastings from its own commercial kitchen.	VikingChef@Mojos-Catering.com	301-512-9417	https://mojos-catering.com/			
Gypsy Soul Catering	Catering		Kearneysville	West Virginia	Martinsburg, Ranson, Charles Town, Harpers Ferry, Shepherdstown, Berkeley Springs and Inwood	Kearneysville caterer working across the Panhandle, with full service at one chapel venue and drop-off catering elsewhere.	GypsySoulCatering@gmail.com	(301) 710-8823	https://www.gypsysoulcatering.com/	https://www.instagram.com/gypsysoulcatering/		
Blue Ridge Peach Designs	Florals		Harpers Ferry	West Virginia	Harpers Ferry and surrounding areas within about 25 miles	Harpers Ferry florist creating custom arrangements for weddings and events, with local delivery.	blueridgepeachdesigns@gmail.com	681-260-9867	https://blueridgepeachdesigns.com/			
West Virjeni	Florals		Shepherdstown	West Virginia	Shepherdstown and the surrounding Panhandle	Floral studio just outside Shepherdstown with a dedicated weddings and events page for couples planning flowers.			https://westvirjeni.com/	https://www.instagram.com/westvirjeni/		
Shepherdstown Sweet Shop Bakery	Cake	100 W. German St.	Shepherdstown	West Virginia	Shepherdstown and nearby Panhandle towns	Long-running Shepherdstown bakery making custom wedding cakes, with flavour consultations at the shop.	wvbaker@wvbakery.com	304-876-2432	https://www.wvbakery.com/			
`,
  },
  {
    name: "Charleston: music, catering",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram	Price from	Price unit
DJ Nick Scott	Music		Charleston	West Virginia	Charleston and across the continental US	Charleston-based wedding and event DJ who plays receptions in the Kanawha Valley and travels for bookings across the wider region.	booking@djnickscott.com	304-807-6425	https://www.djnickscott.com/	https://www.instagram.com/djnickscott/		
WV Corner Kitchen	Catering	1701 Bigley Avenue	Charleston	West Virginia	Charleston and nearby Dunbar, South Charleston and Kanawha City	Charleston kitchen providing catering for weddings and rehearsal dinners, with menus for groups from a few dozen up to 500 or more.	mike@wvcornerkitchen.com	304-400-4096	https://wvcornerkitchen.com/	https://www.instagram.com/wvcornerkitchen/		
Olive Tree Cafe & Catering	Catering	333 2nd Avenue Southwest	South Charleston	West Virginia	South Charleston and surrounding Kanawha Valley	South Charleston café serving Mediterranean and continental menus for wedding receptions, corporate lunches and casual gatherings.		304-356-6068	https://olivetreecafeandcatering.com/	https://www.instagram.com/olivetreecafecatering/		
`,
  },
  {
    name: "Morgantown: photography, planning, music, catering",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram	Price from	Price unit
Lowe Creative Co.	Photography		Morgantown	West Virginia	West Virginia, Pennsylvania, Maryland, Ohio, Virginia and DC	Morgantown wedding photographer covering full-day collections across WV and neighbouring states, with travel available when booked ahead.			https://lowecreative.co/weddings	https://www.instagram.com/lowecreativeco/	2000	package
Laura Priestley Photography	Photography		Morgantown	West Virginia	Morgantown and surrounding area	Morgantown photographer for courthouse, elopement and intimate weddings, with all-inclusive coverage priced for local events.			https://www.laurapriestleyphotography.com/wedding-elopement-photography/		1600	package
Sunflower & Sage Photography	Photography		Fairmont	West Virginia	Morgantown, Charleston and beyond	Fairmont photographer for weddings and elopements, taking bookings from couples across Morgantown, Charleston and further afield.	sunflower.sage.photography@gmail.com	681-443-5024	https://www.sunflowerandsagephotog.com/contact-for-wedding-photography/	https://www.instagram.com/sunflower.sage.photography/		
Events By Jessica	Planning		Morgantown	West Virginia	Morgantown	Morgantown planner who designs and runs events from weddings to intimate gatherings, handling the details on the day.	eventsbyjessica97@gmail.com	304-288-9074	https://www.events-by-jessica.com/	https://www.instagram.com/eventsbyjessica97/		
Alex O'Neal Entertainment	Music		Morgantown	West Virginia	Morgantown, Fairmont, Clarksburg and nearby MD and PA	Morgantown wedding DJ focused on receptions, serving north-central West Virginia plus Deep Creek and southwest Pennsylvania.			https://www.alexthedj.com/			
Luxury Event Co	Music		Morgantown	West Virginia	Morgantown and Pennsylvania	Morgantown DJ and event service covering weddings, private parties and corporate events in West Virginia and Pennsylvania.	info@luxuryeventco.com		https://www.luxuryeventco.com/	https://www.instagram.com/luxury_event_co/		
`,
  },
  {
    name: "New River Gorge: florals",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram	Price from	Price unit
Flowers By Nancy	Florals	1215 S Eisenhower Dr	Beckley	West Virginia	Beckley	Beckley florist offering wedding flowers by bridal consultation, from bouquets to ceremony pieces and reception decor.		304-252-3569	https://www.rosefloralwv.com/wedding-flowers			
Snow Thornton Florists	Florals		Beckley	West Virginia	Beckley, Fayetteville and surrounding southern WV towns	Beckley family florist with a weddings range of bridal bouquets and hair-piece arrangements, delivering across Fayette and Raleigh counties.		304-253-7371	https://www.snowthorntonflorist.com/			
`,
  },
  {
    name: "Charleston: photography, music, catering, cake and florals",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram	Price from	Price unit
Jessica Ellis Photography	Photography		Charleston	West Virginia		Charleston-based photographer for weddings and couples, offering relaxed, natural coverage and a free consultation before booking.	hello@jessicaellisphotography.com		https://jessicaellisphotography.com/	https://www.instagram.com/jessicaellisphoto/		
Vinyl Village	Music		Charleston	West Virginia		Specialist vinyl DJ and emcee who meets couples beforehand and builds a custom playlist for weddings and other celebrations in Charleston.	vinylvillagewv@gmail.com		https://www.vinylvillagewv.com/	https://www.instagram.com/vinylvillagewv/		
Lil' Bit of Heaven Cupcakes	Cake	95 Olde Main Street	St. Albans	West Virginia		St. Albans bakery making wedding cakes and wedding cupcake displays to order, with a classic vanilla cake and buttercream as its standard.	cupcakeladywv@hotmail.com	(304) 729-8038	https://www.lilbitofheaven.rocks/			
Flowers On Olde Main	Florals	216 Main Street	St. Albans	West Virginia		Independent St. Albans florist offering bridal and bridesmaid bouquets, ceremony pieces and reception flowers, with consultations by phone.		(304) 721-9764	https://www.flowersonoldemain.com/wedding-party-flowers	https://www.instagram.com/flowersonoldemain/		
`,
  },
  {
    name: "Morgantown: music, videography, cake, catering and florals",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram	Price from	Price unit
Crafted Events	Music		Westover	West Virginia	Morgantown and Monongalia County	Wedding DJ, MC and lighting team based in Westover, with three set packages and no travel fee anywhere in Monongalia County.	bookings@craftedeventspromo.com	(681) 331-8586	https://www.craftedeventspromo.com/weddings	https://www.instagram.com/craftedeventswv/	1200	package
SIX8 Creative	Videography		Morgantown	West Virginia	North Central West Virginia and southwestern Pennsylvania	Morgantown media studio filming cinematic wedding films with optional drone footage, alongside documentary-style wedding photography.	info@six8creative.com		https://www.six8creative.com/weddings		599	package
Linda Jack's Catering	Catering	1907 Morgantown Avenue	Fairmont	West Virginia		Fairmont caterer with a dedicated reception menu, taking date reservations by phone or message for weddings and other events.	lindajack@lindajackscatering.net	(304) 365-2186	https://www.lindajackscatering.net/reception-menu			
Muriale's Italian Kitchen	Catering	1742 Fairmont Avenue	Fairmont	West Virginia		Family Italian restaurant in Fairmont offering wedding catering and receptions in its 2,500 sq ft riverside banquet room or at your venue.		(304) 363-3190	https://www.muriales.com/special-events	https://www.instagram.com/murialesrestaurant/		
Say-Boy's Restaurant	Catering	1228 Country Club Road	Fairmont	West Virginia		Long-running Fairmont restaurant with catering packages for wedding festivities, parties and corporate events.	sayboyrestaurant44@gmail.com	(304) 366-7252	https://sayboysrestaurant.com/catering			
Frame & Flask	Catering		Morgantown	West Virginia	West Virginia and Pittsburgh	Morgantown team offering wedding catering built around a free consultation and custom proposal, alongside private chef dinners and charcuterie.	frameandflask@gmail.com		https://www.frameandflask.com/catering	https://www.instagram.com/frameandflask/		
Donna Flora	Florals		Clarksburg	West Virginia		Locally owned Clarksburg flower shop handling wedding work, with ceremony and reception flowers and a consultation page.		(304) 622-6541	https://shopdonnaflora.com/			
Oliverios Florist	Florals		Bridgeport	West Virginia		Locally owned Bridgeport flower shop that takes on wedding flowers for ceremonies and receptions, with consultations available.		(304) 842-2516	https://oliveriosflorist.com/			
`,
  },
  {
    name: "Eastern Panhandle: planning, music, florals and photography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram	Price from	Price unit
Broad View Events	Planning		Shenandoah Junction	West Virginia	Virginia, Maryland, Washington D.C. and West Virginia	Wedding planning and design from month-of coordination to full planning, with à la carte design, based in Shenandoah Junction.	broadvieweventswv@gmail.com	304-266-9225	https://www.broadviewevents.com/			
MC DJ Service	Music		Hedgesville	West Virginia	Eastern Panhandle, Western Maryland and Northern Virginia	Hedgesville DJ and MC service providing ceremony audio, reception music and announcements for weddings across the Eastern Panhandle.	mcdjservice25@gmail.com	304-270-0383	https://mcdjservice.com/			
Ginger's Flowers & Gifts	Florals	317 West Race Street	Martinsburg	West Virginia		Martinsburg florist making custom wedding and event flowers, with free consultations by appointment.	sales@gingersflowersandgifts.com	(304) 267-8936	https://www.gingersflowersandgifts.com/weddings.htm			
Katrina's Vision	Photography		Martinsburg	West Virginia	West Virginia, Maryland and Virginia	Martinsburg wedding and portrait photographer working across West Virginia, Maryland and Virginia.			https://www.katrinasvision.com/	https://www.instagram.com/katrinasvision/		
`,
  },
  {
    name: "Huntington: cake",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram	Price from	Price unit
Nomada Bakery	Cake	210 11th Street	Huntington	West Virginia		Huntington bakery taking wedding and catering requests alongside its custom large cakes, from a shop at Heritage Station.	baked@nomadabakery.com		https://www.nomadabakery.com/	https://www.instagram.com/nomadabakery/		
`,
  },
  {
    name: "Bluefield and Wheeling: catering and photography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram	Price from	Price unit
David's Downtown	Catering	500 Bland Street	Bluefield	West Virginia	Within 125 miles of Bluefield	Downtown Bluefield restaurant that caters weddings off site, with bespoke menus and decor, and offers all-inclusive event packages.		(304) 325-8145	https://www.davidsdowntown.com/catering			
Miranda Nicole Photo + Video	Photography		Wheeling	West Virginia	Ohio Valley, Wheeling, Martins Ferry, Pittsburgh and across West Virginia, Ohio and Pennsylvania	Wheeling photographer and videographer covering elopements through full-day weddings, with packages for both photo and video coverage.			https://www.mirandanicolephoto.com/Weddings/			
`,
  },
];

export default batches;
