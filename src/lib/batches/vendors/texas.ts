import type { VendorBatch } from "@/lib/vendor-batches";

// Texas vendor batches. Every row's State is "Texas". Add new batches at the end.
const batches: VendorBatch[] = [
  {
    name: "Hill Country: music, videography, cake, planning, florals, hair and makeup, bar, rentals, transport, bridal, photo booths and more",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Midnight Flyer Band	Music		Dripping Springs	Texas	Texas Hill Country	Dripping Springs band playing Tex-Mix covers and originals for wedding receptions, private parties and corporate events.			https://midnightflyerband.com/	
Dynamic Celebrations	Music		Austin	Texas	Dripping Springs, Wimberley, Marble Falls and the wider Texas Hill Country	Austin-based wedding DJ, MC and photo booth company working regularly at Hill Country venues, with officiants also available.	info@dynamiccelebrations.com	512-628-4656	https://dynamiccelebrations.com/	https://www.instagram.com/dynamiccelebrations/
A. Ward Weddings and Events	Music		Austin	Texas	Central Texas, San Antonio and the Hill Country	Austin DJ and MC service offering sound, uplighting and photo booth hire for weddings across Central Texas, operating since 2006.			https://www.atxdjaaron.com/	https://www.instagram.com/atxdjaaron/
Boogie Down DJs	Music		San Antonio	Texas	San Antonio, Boerne and surrounding areas	San Antonio wedding DJ company that also plays proms, quinceañeras and corporate events, and serves Boerne.		210-473-3012	https://boogiedowndjs.us/	
Gold Leader Films	Videography		Fredericksburg	Texas	Fredericksburg, Kerrville, Boerne, San Antonio and Austin	Documentary-style wedding films for couples around the Hill Country, alongside commercial and social media video work.	info@goldleaderfilms.com	830-708-3518	https://goldleaderfilms.com/	https://www.instagram.com/goldleader_films/
Hill Country Video	Videography		Austin	Texas	Fredericksburg, Wimberley, Dripping Springs, Bandera, Kerrville and Johnson City	Austin studio filming weddings, elopements and ranch events across the Hill Country, with drone coverage standard and no travel fee at most venues.			https://hillcountryvideo.com/	
Wildflower Cinema	Videography		New Braunfels	Texas	Texas Hill Country	New Braunfels wedding cinematography business making story-led films for Hill Country couples, with photography also available.	ashley@wildflowercinema.com		https://wildflowercinema.com/	https://www.instagram.com/wildflowercinema/
Hill Country Bakehouse	Cake	200 Main Street	Marble Falls	Texas	Marble Falls and the Highland Lakes	Marble Falls bakery making custom wedding cakes, cupcakes and cookies, with consultations and design collaboration for each couple.	order@hillcountrybakehouse.com	830-572-5007	https://hillcountrybakehouse.com/	https://www.instagram.com/hillcountrybakehouse/
Cake Llama	Cake		Wimberley	Texas	Central Texas	Wimberley dessert caterer making wedding cakes, cake pops and sweet tables for weddings and other events.	Makeitsweet@cakellama.com	210-792-4566	https://www.cakellama.com/	https://www.instagram.com/cake_llama/
Heaven-Pathways-Earth (Rev. Dr. Sheryl T. Martin)	Officiant		Wimberley	Texas	Within 50 miles of Wimberley	Interfaith minister in Wimberley officiating weddings and vow renewals, with optional premarital counselling and ceremony add-ons.		559-779-5510	https://www.heavenpathwaysearth.com/	
Hill Country Selfies	Photo Booth		Fredericksburg	Texas	Fredericksburg and the surrounding Hill Country	Fredericksburg photo booth hire with HD camera, lighting, props and instant digital sharing for weddings and parties.		830-446-3201	https://hillcountryselfies.com/	
Boerne Photo Booth Co.	Photo Booth		Boerne	Texas	Boerne, Fair Oaks Ranch, Bulverde, Comfort and Helotes	Boerne photo booth hire with open-air, 360 video, audio guest book and magic mirror options, staffed by an attendant for weddings.	hello@boernephotoboothco.com	210-722-3512	https://boernephotoboothco.com/	
Hitch & Click	Photo Booth		Johnson City	Texas	Fredericksburg, Dripping Springs, Blanco, Marble Falls, Wimberley and Central Texas	Family-run Johnson City business hiring out a vintage 1950s-style photo booth trailer, with attendant, props and printed strips.			https://www.hitchandclick.com/	
Snaps To Remember	Photo Booth		Spring Branch	Texas	San Antonio, Boerne, Kerrville, Marble Falls and the Texas Hill Country	Spring Branch photo booth company offering mirror, print, glam and digital booths for weddings, corporate events and parties.			https://snapstoremember.com/	https://www.instagram.com/snapstoremembertx/
Weddings by Wendi	Planning		San Marcos	Texas	Austin, Dripping Springs, San Marcos, New Braunfels, Fredericksburg, Wimberley and the Hill Country	Wedding planning and day-of coordination for couples marrying in Austin and the Texas Hill Country, drawing on more than 300 weddings.	concierge@weddingsbywendi.com	512-766-9776	https://weddingsbywendi.com/	
Grant Your Wish Weddings	Planning		Austin	Texas	Dripping Springs, Wimberley, Fredericksburg, Marble Falls, Blanco, Johnson City, New Braunfels	Austin-based coordinator offering day-of and month-of wedding coordination, with a focus on outdoor and ranch weddings across the Hill Country.	hello@grantyourwishweddings.com		https://grantyourwishweddings.com/	https://www.instagram.com/grantyourwishweddings/
House Call Bar Services	Bar		Fredericksburg	Texas	Fredericksburg and the Texas Hill Country	Fredericksburg mobile bar offering craft cocktail service for weddings and other events, including dedicated wedding bartending packages.	housecallbarservices@gmail.com		https://housecallbarservices.com/	https://www.instagram.com/housecallbarservices/
Bartenders4You	Bar		San Antonio	Texas	San Antonio, New Braunfels, Boerne, Austin, Fredericksburg	San Antonio mobile bar company providing wedding bartenders and handcrafted cocktails, travelling to Boerne, Fredericksburg and New Braunfels.			https://bartenders4you.com/	https://www.instagram.com/bartenders4you/
Hill Country Event Rentals	Rentals		New Braunfels	Texas	Austin, New Braunfels, San Antonio and the Texas Hill Country	New Braunfels rental company supplying tents, tables, chairs, linens, bars, dance floors and lighting for events across the Hill Country.	events@rentalshc.com	512-255-0646	https://hillcountryeventrentals.com/	https://www.instagram.com/hceventrentals/
Five Star Party & Event Rentals	Rentals	1492 Medina Hwy	Kerrville	Texas	Texas Hill Country	Kerrville rental and design company supplying furniture, linens, lighting, tents, dance floors and stages for Hill Country weddings and events.	fsraccounting@yahoo.com	830-896-0282	https://fivestarpartyrental.com/	https://www.instagram.com/fivestarpartyevents/
290 Wine Shuttle	Transportation	308 S Washington St	Fredericksburg	Texas	Fredericksburg and the 290 Wine Trail	Fredericksburg shuttle company running wine-trail tours and offering private wedding and event transportation around the Hill Country.	wineshuttle290@yahoo.com	210-724-7217	https://290wineshuttle.com/	https://www.instagram.com/290wineshuttle/
Hill Country Limousine Service	Transportation		Kerrville	Texas	Kerrville, Boerne, Comfort, Fredericksburg, Ingram, Junction and the Hill Country	Family-run Kerrville chauffeur service operating since 1985, offering wedding transport, airport runs and wine tours across the Hill Country.		830-896-1429	https://hillcountrylimos.com/	
Fiancée Bridal Boutique (Boerne)	Bridal & Formalwear	116 S Main St	Boerne	Texas	Kendall County and north San Antonio	Boerne bridal boutique with made-to-order and off-the-rack gowns, plus plus-size styles, dress cleaning and preservation.	boerne@fianceebridalboutique.com	830-431-8687	https://fianceebridalboutique.com/	https://www.instagram.com/fianceebridalboutique/
LD Bridal	Bridal & Formalwear	412 River Road, Suite 104	Boerne	Texas		Boerne boutique offering private, by-appointment gown fittings alongside mother-of-the-bride dresses and bridal accessories.		830-331-9232	https://www.ldbridalboutique.com/	https://www.instagram.com/ld_bridal/
Sacrament Bridal	Bridal & Formalwear	401 E Auguste Street	Fredericksburg	Texas		Appointment-only Fredericksburg boutique selling designer wedding gowns alongside men's formal wear.		830-733-2135	https://www.sacramentbridal.com/	https://www.instagram.com/sacrament.bridal/
Dragonfly Designs	Stationery & Invitations		Austin	Texas	Austin area, the Hill Country and nationwide	Austin stationery studio designing custom wedding invitations, save-the-dates and day-of paper for couples in the Hill Country and beyond.			https://invitationsbydragonflydesigns.com/	https://www.instagram.com/dragonflydes/
Belle Vita Blooms	Florals		Fredericksburg	Texas	Fredericksburg and surrounding areas	Fredericksburg event florist focused on weddings, creating bridal party flowers and venue florals with 15 years of experience.	bellevitablooms@gmail.com	281-782-3656	https://www.bellevitablooms.com/	https://www.instagram.com/bellevitablooms/
Glashaus Floral Design	Florals	606 N Llano Street	Fredericksburg	Texas	Texas Hill Country	Fredericksburg flower shop designing seasonal, whimsical arrangements for weddings and everyday occasions, with gifts and local delivery.	info@glashausfloral.com	830-998-1247	https://www.glashausfloral.com/	https://www.instagram.com/glashausfloral/
Front St. Floral	Florals	419 Front St	Comfort	Texas	Comfort and surrounding areas	Family-owned Comfort florist making bridal bouquets, ceremony arrangements and reception flowers for Hill Country weddings.	laurie@frontstfloral.com	210-386-6776	https://www.frontstfloral.net/	https://www.instagram.com/frontstfloral/
Jolie Belle Beauty Bar	Hair & Makeup	664 S. Walnut Avenue	New Braunfels	Texas	New Braunfels, San Antonio, Austin and the Texas Hill Country	New Braunfels hair and makeup team for brides and bridal parties, working across the Hill Country, San Antonio and Austin.	joliebelle.beautybar@gmail.com		https://www.joliebellebeautybar.com/	https://www.instagram.com/joliebelle.beautybar/
Anastasia MUA	Hair & Makeup		Austin	Texas	Austin, Dripping Springs, Kyle, Driftwood, Wimberley	Onsite wedding hair and makeup team based in Austin, travelling to Dripping Springs, Wimberley and Driftwood weddings.	info@anastasiamua.com		https://www.anastasiamua.com/	https://www.instagram.com/anastasiamuatx/
On Location Hair and Makeup	Hair & Makeup		San Antonio	Texas	San Antonio, Boerne, New Braunfels, Fredericksburg, Kerrville, Dripping Springs	San Antonio hair and makeup artist offering airbrush bridal makeup and styling, travelling to weddings in Boerne, Fredericksburg and Kerrville.	cgreen89@aol.com	210-722-6979	https://www.onlocationtx.com/	https://www.instagram.com/reneegreen89/
Makeup by Adrienn & Team	Hair & Makeup		Austin	Texas	Austin and Dripping Springs	Austin bridal hair and makeup team that also works at Dripping Springs and Driftwood wedding venues.	beautybyadrienn@gmail.com	949-272-6092	https://makeupbyadrienn.com/	https://www.instagram.com/makeupbyadriennandteam/
`,
  },
  {
    name: "Killeen, Harker Heights, Temple and Salado: planning, florals, cake, catering and music",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Milestone Memories & Events	Planning	2501 South W.S. Young Drive, Suite 209	Killeen	Texas		Killeen planner and showroom offering hourly consulting, day-of coordination or full wedding planning, with rentals and a venue to hire.		(254) 630-1008	https://www.milestonememoriesandevents.com/	
Botanical Jane	Florals		Temple	Texas	Temple, Waco and Austin	Floral design studio creating custom wedding flowers, with a portfolio drawn from Austin-area venues and a base in Temple.	info@botanicaljane.com		https://botanicaljane.com/	https://www.instagram.com/botanicaljane/
Wonderland Flowers	Florals		Temple	Texas	Temple, Killeen, Belton, Harker Heights, Salado and Central Texas	Temple studio florist making hand-crafted floral designs for weddings and events, with delivery across Bell County and nearby towns.	wonderlandflowers81@gmail.com	(682) 808-2973	https://www.wonderlandflowers.com/	https://www.instagram.com/wonderlandflowers/
Morgan Pearl Bakery	Cake	2415 N Main Street	Belton	Texas		Belton bakery making custom wedding cakes, late-night bites and interactive dessert stations, with tastings by appointment when the shop is closed.	info@morganpearlcakes.com	254-314-6304	https://morganpearlcakes.com/	https://www.instagram.com/morganpearlcakes/
Texas Bites Bakery	Cake		Killeen	Texas		Self-taught home baker in Killeen making custom wedding cakes and cupcakes, with a quote form, a published flavour list and wedding pricing.	texasbitesbakery@gmail.com	254-249-4934	https://www.texasbitesbakery.com/	https://www.instagram.com/texasbitesbakery/
Arboniche's Fine Catering	Catering	4013 Chaparral Rd	Killeen	Texas		Killeen caterer run since 2004 by a chef and his wife, serving buffets for 50 to 1,000-plus guests, with custom menus and china and table rentals.		254-519-4300	https://www.arbonichesfinecatering.com/	
Let Us Do The Cooking	Catering	111 S Main Street	Nolanville	Texas		Full-service caterer founded in 2006 near Killeen, handling plated dinners and buffets for weddings, military balls and corporate events.	admin@letusdothecooking.com	(254) 554-2665	https://www.letusdothecooking.com/	
DJ JayJacq Entertainment	Music		Killeen	Texas	Killeen, Harker Heights, Copperas Cove, Belton, Temple and Central Texas	Killeen mobile DJ playing weddings, reunions and parties, with R&B, jazz, reggae and disco in the mix, plus karaoke and a photo booth rental.	dj.jayjacq@gmail.com	254.462.7183	https://gjjacquot.wixsite.com/djjayjacq	https://www.instagram.com/dj.jayjacq/`,
  },
  {
    name: "El Paso: planning and cake",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
El Paso's Bakery	Cake	3300 Fort Blvd	El Paso	Texas		Mexican bakery making pastries, cakes and breads from scratch, with specialty cakes and catering for weddings and quinceañeras.		(915) 300-6909	https://elpasosbakery.com	https://www.instagram.com/elpasosbakery/
Greggerson's Cake Cottage	Cake	2050 Trawood Dr #9	El Paso	Texas		Neighbourhood bakery known for its almond buttercream, selling ready-made and custom cakes and cupcakes for special occasions.		(915) 591-5690	https://www.greggersonscakecottage.com	https://www.instagram.com/greggersonselpaso/
Imagine Events	Planning	7365 Remcon Circle, Suite C-301	El Paso	Texas	El Paso	Event coordination and design firm with 18 years' experience, offering full planning or day-of support for weddings, plus rentals and vendor coordination.	veronica@imagineeventplanners.com	(915) 833-2300	https://www.imagineeventplanners.com	
I Do Weddings & Events	Planning	11233 Rojas Drive	El Paso	Texas	El Paso and across the United States	Full-service wedding planning and event design company with over 22 years' experience, also offering decoration, catering and equipment rentals.	cody@idoweddingsevents.net	915-771-7788	https://www.idoeventsep.com	https://www.instagram.com/idoweddingseventsep/
That One Chica Event Planner	Planning		El Paso	Texas	El Paso and surrounding areas, plus destination events	Planner Paola offers full wedding planning, day-of coordination, tent draping and event design, with 8-plus years in the industry.	pq.eventdesigner@gmail.com	(915) 600-3381	https://thatonechicaeventdesigner.com	https://www.instagram.com/urpartyplanner_pao/
Jocabed Cajiga Event Design	Planning		El Paso	Texas	El Paso and Ciudad Juárez	Bilingual wedding planner and event designer working since 2015, covering full planning and design for couples in El Paso and Juárez.	info@jocabedcajiga.com		https://www.jocabedcajiga.com	https://www.instagram.com/jocabed.planner/`,
  },
  {
    name: "Corpus Christi, South Padre and the Rio Grande Valley: music",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Dj Art Mobile Dj Service	Music		McAllen	Texas	the Rio Grande Valley	McAllen mobile DJ with around 35 years in the trade, supplying music, sound and lighting for weddings and quinceañeras across the Valley.		(956) 821-3140	https://djartrgv.com/	https://www.instagram.com/djartrgv/
Mariachi Xochipilli	Music		McAllen	Texas	Rio Grande Valley: McAllen, Mission, Edinburg, Pharr, Weslaco, Harlingen, San Benito, South Padre Island and more	Mariachi band established in 2010 and based in McAllen, playing weddings, quinceañeras, religious events and other celebrations across the Valley.		956.221.3652	https://www.mariachixochipilli.com/	https://www.instagram.com/mariachixochipilli/
Mariachi Nuevo Tenampa	Music		McAllen	Texas	Rio Grande Valley and South Texas: McAllen, Mission, Edinburg, Weslaco, Harlingen, San Benito and more	McAllen mariachi group, 39 years in business according to its site, performing at weddings and other celebrations around the Valley.	juanperezm197512@gmail.com	(956) 530-5313	https://mariachinuevotenampa.com/	
El Mariachi Loco de McAllen TX	Music		Pharr	Texas	McAllen area	Pharr-based mariachi offering a dedicated wedding service alongside quinceañeras, parties and funerals.		(956) 558-3788	https://www.mariachilocodemcallentx.com/	
AB Event Productions	Music		Weslaco	Texas	McAllen, Hidalgo County and the wider Rio Grande Valley, with travel across Texas	Weslaco company supplying DJ, bilingual MC, audio, lighting and LED screens, plus a bilingual wedding officiant for Valley events.	abraham@abeventproductions.com	(956) 325-4294	https://abeventproductions.com/	https://www.instagram.com/abeventproductions/
Groove Knight	Music		Corpus Christi	Texas	Corpus Christi and throughout Texas	Corpus Christi party band playing weddings every week, with hundreds of couples booked and shows listed for autumn 2026.	bookings@grooveknight.com	512.358.4911	https://www.grooveknight.com/	`,
  },
  {
    name: "Killeen, Harker Heights, Temple and Salado: florals, hair and makeup, photo booth and photography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
CenTex Mirror Photo Booth Co.	Photo Booth		Harker Heights	Texas	Harker Heights, Killeen, Copperas Cove, Temple, Round Rock, Waco, Austin	Mirror photo booth hire for weddings and other events, with a dedicated weddings page, working across Bell and Coryell counties and out towards Austin.	centexmirrorphotobooth@gmail.com	(254) 368-9360	https://centexmirrorphotobooth.com/	https://www.instagram.com/centexmirror_photobooth_co/
Woods Flowers	Florals	1415 W Avenue H	Temple	Texas	Temple, Belton, Killeen, Salado, Harker Heights, Gatesville, Jarrell, Fort Hood	Family florist in Temple that supplies peonies, ranunculus and other wedding blooms, with weddings handled through its own separate wedding site.	woods.bloomingfields@yahoo.com	(254) 778-8506	https://woodsbloomingfields.com/	https://www.instagram.com/woodsflowerstemple/
Precious Memories Florist & Gifts	Florals	17 N 2nd St	Temple	Texas	Temple	Downtown Temple florist making bridal bouquets, arches, centrepieces and head-table garlands, with pricing quoted after a phone consultation.		(254) 778-2242	https://www.preciousmemoriesflorist.com/wedding-flowers	
Bloomingfields Florist	Florals		Salado	Texas	Temple, Killeen, Belton, Harker Heights, Salado, Nolanville, Jarrell, Troy, Little River	Florist trading since 1950 that does bridal bouquets, ceremony arches and reception centrepieces, with set-up and wedding consultations included.	wecare@beltonflowers.com	(254) 774-8822	https://www.beltonflowers.com/wedding	
Expressions Hair & Nail Salon	Hair & Makeup		Temple	Texas	Temple	Salon offering hair styling and makeup for brides and whole bridal parties, from natural to glam looks, with free consultations.		(254) 570-0002	https://www.expressionshairandnailsalontx.com/updos-and-makeup	https://www.instagram.com/expressions_hairandnail/
PhotosByIvan LLC	Photography		Killeen	Texas	Killeen and surrounding Central Texas, with Austin by arrangement	Killeen-first photographer, working since 2016, covering weddings, elopements and engagements for couples, with Austin sessions available.			https://www.photosbyivantx.com/about/	`,
  },
  {
    name: "Tyler and East Texas: photography, planning, florals, music, catering, cake, videography, hair & makeup",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Annie Austin Photography	Photography		Tyler	Texas	Tyler, East Texas and Dallas-Fort Worth	Film-inspired wedding photography for couples marrying in Tyler and across East Texas, with local venues named on the site.			https://annieaustinphoto.com/tyler-texas-wedding-photographer/	https://www.instagram.com/annieaustin.photo/
Hampton Moments Photography	Photography		Tyler	Texas	Tyler, Lindale, Van, Longview, Jacksonville, Nacogdoches and Dallas-Fort Worth	Wedding and elopement photographer based in Tyler, covering full-day weddings in Tyler, Lindale, Longview, Jacksonville and Nacogdoches.	info@hamptonmoments.com		https://www.hamptonmoments.com/weddings	https://www.instagram.com/hamptonmoments/
Silverlight Visions Photo & Film	Photography		White Oak	Texas	Longview, White Oak, Tyler, Kilgore, Marshall and surrounding East Texas towns	Wedding and elopement photography with wedding videography, serving Longview, Tyler, Kilgore and Marshall, and happy to travel further.	silverlightvisions@gmail.com	(903) 240-0538	https://www.silverlightvisionsphotoandfilm.com/	
RSVP Event Planning	Planning		Tyler	Texas	Tyler and East Texas	Certified wedding planner in Tyler offering full planning and design from save-the-date through to the wedding day.	brooke@rsvpeventplanning.com	(903) 571-9629	https://rsvpeventplanning.com/	https://www.instagram.com/rsvpeventplanning/
Simply Yours By Design	Planning	504 State Hwy 110 N, Ste C	Whitehouse	Texas	Tyler, Whitehouse and East Texas	Whitehouse planning studio offering full-service wedding planning, day-of coordination and event design, with services tailored to budget.	simplyyoursbydesign@hotmail.com	(903) 372-4728	https://www.simplyyoursbydesign.com/	https://www.instagram.com/simplyyoursbydesign.tyler/
ETX Mystical Events	Planning		Longview	Texas	Longview and surrounding East Texas	Longview wedding planner offering full and partial planning, day-of coordination, destination weddings and officiant services, with a wedding gallery.			https://etxmysticalevents.com/	https://www.instagram.com/etxmysticalevents/
Garden Style	Florals	4809 Old Bullard Rd #200	Tyler	Texas	Tyler and East Texas	Tyler flower shop in La Piazza Shopping Center, designing custom wedding bouquets and arrangements around each couple's style.	wava@gardenstylefloraldesign.com	(903) 526-0664	https://gardenstylefloraldesign.com/	https://www.instagram.com/gardenstylefloraldesign/
Olive Branch Flower Bar	Florals	14662 St Hwy 155 S, Suite A200	Tyler	Texas	Tyler and surrounding East Texas	Modern floral studio making wedding bouquets, centrepieces and larger installations, and offering DIY bloom packages for couples.	olivebranchflowerbar@gmail.com	(903) 521-4897	https://www.olivebranchflowerbar.com/	https://www.instagram.com/olivebranchflowerbar/
Primrose Flower Emporium	Florals	504 State Hwy 110 N, Suite C	Whitehouse	Texas	Whitehouse, Tyler, Lindale, Jacksonville, Bullard and East Texas	Family-run Whitehouse flower shop making bridal and bridesmaid bouquets, boutonnieres and reception centrepieces.		(903) 509-3839	https://www.flowersbyprimrose.com/wedding-flowers	https://www.instagram.com/flowersbyprimrose/
Heart Light and Sound	Music		Tyler	Texas	Tyler and surrounding East Texas	Tyler DJ service for wedding receptions, with dance floor lighting, uplighting and ceremony sound for recorded or live music.		(903) 980-1532	https://www.heartlightsound.com/	https://www.instagram.com/heartlightandsound/
LJDJs TX	Music		Tyler	Texas	Tyler and Longview	DJ and MC service for wedding receptions in Tyler and Longview, including custom entrances and coordination with other vendors.		(903) 253-7024	https://www.ljdjstx.com/	
E-Motion Entertainment	Music		Longview	Texas	Longview and East Texas	Longview DJ for wedding ceremonies and receptions, with sound, dance floor lighting, a planning app and optional photo booth hire.	wyatt@e-motionentertainment.com		https://www.e-motionentertainment.com/weddings	https://www.instagram.com/e_motion_entertainment/
Perfect Catering	Catering		Longview	Texas	Longview, Tyler and the wider East Texas area	Longview caterer run by Lori Valenti since 2008, handling about 70 to 80 weddings a year with chefs, staff and bartenders.	info@perfectcateringonline.com	(903) 236-2895	https://perfectcateringonline.com/weddings/	https://www.instagram.com/perfectcatering/
The Grove Kitchen & Gardens	Catering	3500 Old Jacksonville Hwy	Tyler	Texas	Tyler and East Texas	Tyler restaurant whose kitchen caters wedding receptions, rehearsal dinners and bridal luncheons with seasonal menus built around each couple.	events@thegrovetyler.com	(903) 939-0209	https://www.thegrovetyler.com/catering	https://www.instagram.com/thegrovetyler/
Edible Art Specialty Cakes & Cookies	Cake	504 W. South St.	Longview	Texas	Longview and East Texas	Longview bakery making custom wedding cakes and decorated cookies, with tastings and a deposit taken to book each wedding date.	EdibleArt@SBCglobal.net	(903) 234-2114	https://www.edibleartcakesandcookies.com/weddingcakes	https://www.instagram.com/edibleartcakesandcookies/
Southern Charm Bakery	Cake	1225 N. Pacific St.	Mineola	Texas	Mineola and surrounding East Texas	Mineola bakery that makes custom wedding and celebration cakes, plus pies, cupcakes and cookies, with gluten-free and vegan options.	southerncharmbaker@gmail.com	(903) 638-6400	https://www.southerncharmbakery.com/	
Poppy Cakes Baking Co.	Cake		Nacogdoches	Texas	Nacogdoches and East Texas	Small Nacogdoches bakery making custom buttercream cakes, cake pops and cake pucks for weddings, using flour it mills itself.	lauren@poppycakesbakingco.com		https://poppycakesbakingco.com/	https://www.instagram.com/poppycakesbakingco/
A Thousand Word Productions	Videography		Tyler	Texas	Tyler, Longview and East Texas	Tyler video company run by a former NBC/FOX producer, filming weddings and events with FAA-certified drone footage across East Texas.	nathanbrowning@a1000word.com	(903) 839-7200	https://www.athousandword.net/	
TX Wedding Videography	Videography	422 East Main Street	Nacogdoches	Texas	Nacogdoches, Lufkin, Tyler and East Texas	Nacogdoches wedding videographer producing cinematic wedding films since 2018, with packages and payment plans for East Texas couples.	info@txweddingvideography.com	(940) 367-7343	https://txweddingvideography.com/	
Victoria Morris Makeup Artistry	Hair & Makeup		Longview	Texas	Longview, Tyler and East Texas	Longview makeup artist with over 14 years of experience, doing bridal makeup for the bride and her whole party.	VAMStudioLLC@gmail.com	(903) 930-4347	https://www.victoriamorrismua.com/weddings	https://www.instagram.com/victoriamorrismua/
Chey Cosmetics	Hair & Makeup		Tyler	Texas	Tyler and across Texas	Tyler makeup artist working since 2018, offering a soft, radiant bridal look for elopements through to large weddings.	info@cheycosmetics.com		https://www.cheycosmetics.com/	https://www.instagram.com/cheycosmetics/
`,
  },
  {
    name: "Dallas–Fort Worth: music, catering, hair & makeup, videography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
It's Your Night Entertainment	Music	312 N Oak St	Roanoke	Texas	Dallas–Fort Worth, Weatherford, Keller, Azle, Aubrey, Burleson	Wedding DJ and MC company that also supplies live musicians, event lighting and photo booths for couples across Dallas–Fort Worth.	hello@itsyournight.com	(214) 390-9701	https://www.itsyournight.com/	https://www.instagram.com/itsyournight/
Party Time Texas	Music	330 Industrial Blvd, Ste 106	McKinney	Texas	Dallas–Fort Worth, McKinney, Frisco, Plano, Allen, Richardson, Southlake, Grapevine, Garland, Arlington, Denton, Irving	McKinney entertainment company supplying wedding DJs who build playlists around the couple's tastes and keep the day to time.	Sales@Partytimetexas.com	(214) 340-8000	https://www.partytimetexas.com/what-we-do/weddings/wedding-djs/	https://www.instagram.com/partytimetexas/
Masters of Ceremony Entertainment	Music		McKinney	Texas	Dallas–Fort Worth, East Texas, Texoma, southern Oklahoma	Wedding MC and DJ service that adds uplighting, monogram projections and dance-floor effects, working across North and East Texas.	mastersofceremony@ymail.com	(214) 412-2720	https://www.mastersofceremonydj.com/	
Tastefully Yours Catering	Catering	1959 W Southlake Blvd, Suite 120	Southlake	Texas	Dallas–Fort Worth, Southlake, Coppell	Southlake caterer building wedding menus around the venue, season and guest count, from plated dinners to carving stations, with tastings.		(817) 749-0896	https://tastefully-yours.com/	https://www.instagram.com/tastefullyyourscatering_dfw/
OnSiteGlam	Hair & Makeup		Dallas	Texas	Dallas, Plano, Frisco, McKinney, Southlake, Arlington, Fort Worth	Travelling bridal hair and makeup service for Dallas–Fort Worth venues and hotel suites, with trials and bridal party and mother-of-the-bride packages.			https://www.onsiteglam.com/dallas-fort-worth-bridal-hair-makeup/	
Lemon Ivory Beauty	Hair & Makeup		Dallas	Texas	Dallas, Fort Worth, Plano, Frisco, McKinney, Southlake, Grapevine, Arlington	On-location bridal makeup and hair artist who travels to venues, hotels and homes across Dallas–Fort Worth and offers a free consultation call.	lemonivorybeauty@gmail.com	(469) 850-0146	https://www.lemonivorybeauty.com/	https://www.instagram.com/lemonivorybeauty/
Kiss This Makeup	Hair & Makeup		Dallas	Texas	Dallas, Highland Park, University Park, Plano, Frisco, Fort Worth	Bridal hair and makeup team that travels to venues, hotels and homes, with touch-up cover for larger bridal parties.	info@kissthismakeup.com	(877) 977-5477	https://kissthismakeup.com/dallas/	https://www.instagram.com/kissthismakeup/
Birdy Beauty	Hair & Makeup		Fort Worth	Texas	Fort Worth, Dallas–Fort Worth	Fort Worth hair and makeup team built around bridal packages for the bride, the wedding party and finishing touches, in studio or on site.	info@birdybeauty.com	(817) 965-2296	https://birdybeauty.com/	https://www.instagram.com/birdybeautydfw/
H&K Cinema	Videography		Dallas	Texas	Dallas, Fort Worth, Highland Park, Plano, destination weddings	Dallas wedding filmmaker led by Hunter Gregory, who has shot weddings since 2014 and also offers photography and brand films.		(817) 870-6641	https://www.hkcinemas.com/dallas-wedding-videographer	
Ripperton Films	Videography		Fort Worth	Texas	Fort Worth, Dallas, destination weddings	Husband-and-wife team in Fort Worth making cinematic wedding films and storytelling photography, filming weddings since 2014.			https://rippertonfilms.com/cinematography	https://www.instagram.com/rippertonfilms/
`,
  },
  {
    name: "Houston: photography, planning, music, catering, hair & makeup, videography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Plum Tree Studios	Photography		Houston	Texas	Houston, destination weddings	Houston wedding photographer shooting in a documentary style, also offering personal branding and family sessions.	patricia@plumtreestudios.com	(713) 874-4096	https://www.plumtreestudios.com/	https://www.instagram.com/plumtreestudios/
Schwartz & Woodward	Planning		Houston	Texas	Houston, destination weddings	Husband-and-wife planning firm offering full planning and day-of coordination for Houston couples, plus destination weddings.	joann@schwartzwoodward.com	(713) 780-1282	https://www.schwartzwoodward.com/	https://www.instagram.com/schwartzwoodward/
Undercover Band	Music		Houston	Texas	Houston	Houston wedding and party band whose lineup scales from five to fourteen players, with audio, lighting and DJ services also available.	info@undercoverband.com	(832) 595-4679	https://www.undercoverband.com/	https://www.instagram.com/undercoverbandtx/
Richard Brown Orchestra	Music		Houston	Texas	Houston	Live music for weddings from string quartets and ensembles to a full dance band, playing ceremonies, dinners and receptions since 1996.	richard@richardbrownmusic.com		https://www.richardbrownmusic.com/	
Xceptional DJ's + Photo Booths	Music		Houston	Texas	Houston and surrounding areas	Houston wedding DJ and photo booth company that says it has served local weddings since 1997, also covering fundraisers, proms and parties.	info@thehoustondjs.com	(281) 206-2670	https://thehoustondjs.com/	https://www.instagram.com/djforresthouston/
Keif's Catering	Catering		Houston	Texas	Houston	Houston caterer with a published wedding menu of appetisers, salads, entrées and sides, with vegan and gluten-free options.	keifscatering@gmail.com	(713) 530-5921	https://keifscatering.com/wedding-catering-menu/	https://www.instagram.com/keifscatering/
Lilly Bridal Artistry	Hair & Makeup	16310 Texas 249 Access Rd, Ste 304	Houston	Texas	Houston, destination weddings	On-location bridal hair and makeup team working in a soft-glam style for Houston weddings and destinations.	Inquire@lillybridalartistry.com		https://lillybridalartistry.com/	https://www.instagram.com/lilly_artistry/
Blush Artistry (Texas Hair & Makeup Team)	Hair & Makeup		Houston	Texas	Houston, Cypress	Large on-location, on-demand hair and makeup team for Houston weddings and special events, founded by Joella Williams.			https://blushartistrytx.com/	https://www.instagram.com/blushartistrytx/
Simple Beauty Artistry	Hair & Makeup		Houston	Texas	Houston, Spring	Houston bridal hair and makeup team that says it has over twenty years' experience across brides and wedding parties.	info@simplebeautyartistry.com	(832) 276-8668	https://www.simplebeautyartistry.com/	https://www.instagram.com/simplebeautyartistry/
Analisa Hastings Hair and Makeup	Hair & Makeup	27326 Robinson Rd, Ste 201	Conroe	Texas	Houston, Conroe	Houston-area bridal hair and makeup artist who takes only two or three weddings per date and works with a signed contract and retainer.	analisa@analisahastings.com	(346) 413-4516	https://analisahastings.com/	https://www.instagram.com/analisahastingshairandmakeup/
Naukhaas	Hair & Makeup		Houston	Texas	Houston, travel available	Houston makeup studio specialising in South Asian bridal looks for Hindu, Muslim, Sikh and mixed weddings, with travel available.			https://www.naukhaas.com/south-asian-bridal-makeup-services	https://www.instagram.com/naukhaas/
Amor Wedding Films	Videography	9000 Southwest Fwy	Houston	Texas	Houston, Texas, destination weddings	Houston studio offering cinematic wedding films and documentary-style photography, including Lebanese and South Asian weddings.	info@amortexas.com	(713) 331-5155	https://amortexas.com/wedding-videographer-in-houston/	https://www.instagram.com/amor.texas/
Good Omen	Videography		Houston	Texas	Houston, Texas, destination weddings	Houston photo and film studio shooting documentary-style wedding films, some on Super 8, with an editorial finish.			https://goodomenco.com/wedding-video-pricing	https://www.instagram.com/goodomen.weddings/
Sculpting With Time	Videography		Houston	Texas	Houston, destination weddings	Husband-and-wife Houston filmmakers making award-winning wedding films, many at destination weddings.	info@sculptingwithtime.com	(713) 485-9700	https://www.sculptingwithtime.com/	https://www.instagram.com/sculptingwithtime/
Candlelight Weddings	Videography		Houston	Texas	Houston, Texas	Houston photo and video team covering Hindu, Sikh, Pakistani Muslim, Bangladeshi and Guyanese weddings, including multi-day events, since 2000.	surinder@candlelightstudio.com	(832) 410-2877	https://candlelightstudio.com/	https://www.instagram.com/candlelightweddingshouston/
`,
  },
  {
    name: "Killeen, Harker Heights, Temple and Salado: music",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
G Fire Productions	Music		Harker Heights	Texas	Harker Heights, Killeen, Texas	Harker Heights DJ company that publishes wedding package prices for DJ and MC, ceremony and reception sound, and uplighting.	gfirepro71@yahoo.com	(254) 291-5625	https://www.gfireproductions.com/djpackages-texas	https://www.instagram.com/gfireproductions/
`,
  },
  {
    name: "Waco, Bryan–College Station and Brenham: cake, videography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Sweetness Desserts	Cake	2034 N Valley Mills Dr	Waco	Texas	Waco	Waco bakery selling cupcakes, truffles and brownies, taking pre-orders for wedding and celebration cakes.	laura@sweetnessdesserts.com	(254) 756-0590	https://www.sweetnessdesserts.com/	https://www.instagram.com/sweetness_desserts/
Around The World	Cake	119 N 12th St	Waco	Texas	Waco	Waco bakery making custom cakes for birthdays, engagements and weddings, with published prices by cake size.	Aroundtheworldwaco@gmail.com	(254) 307-0614	https://www.aroundtheworldwaco.co/custom	
Camvision Productions	Videography		Waco	Texas	Waco, Texas	Waco photographer and videographer shooting weddings alongside brand films and Western lifestyle content.	chris@camvisionproductions.com	(254) 709-4556	https://www.camvisionproductions.com/	https://www.instagram.com/camvisionproductions/
`,
  },
  {
    name: "Lubbock and Amarillo: hair & makeup, cake, videography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Lovestruck Artistry	Hair & Makeup		Lubbock	Texas	Lubbock, Midland, across Texas	Lubbock and Midland team doing bridal and wedding party hair and makeup, with trials, travelling to venues across Texas.			https://lovestruckartistry.com/	
Looks By Mariah	Hair & Makeup		Lubbock	Texas	Lubbock	Lubbock makeup artist for brides and special events (makeup only, no hair), taking bookings for 2027 and 2028.	looksbymariah4@gmail.com		https://looksbymariah.com/	https://www.instagram.com/looksbymariah/
Mosaic Beauty + Boutique	Hair & Makeup	2800 Civic Cir, Suites 900-1000	Amarillo	Texas	Amarillo, Texas Panhandle	Amarillo studio and boutique whose bridal team styles brides, mothers and wedding parties, with trials and on-location service.	kendra@beautyisamosaic.com		https://beautyisamosaic.com/	https://www.instagram.com/mosaicbeautyandboutique/
Sweet Creations (#cakesbyMarsha)	Cake	1308 Broadway	Lubbock	Texas	Lubbock	Downtown Lubbock bakery making wedding cakes to the couple's own ideas, with non-refundable deposits and a one-week change cut-off.	cakesbymarsha@yahoo.com	(806) 701-5875	https://sweetcreationslubbock.net/	
Cranberry Lab	Videography		Lubbock	Texas	Lubbock, Wolfforth, Shallowater, Plainview, Levelland, Austin, Hill Country, Dallas	Lubbock studio making cinematic wedding films, with more than 285 weddings filmed and destination work on request.	thecranberrylab@gmail.com		https://www.thecranberrylab.com/lubbock-wedding-videographer	https://www.instagram.com/cranberrylab/
Solmates	Videography	705 S Grant, Unit 21	Amarillo	Texas	Amarillo, Canyon, Bushland, Palo Duro Canyon, Texas Panhandle	Amarillo wedding videographer with four published film packages starting at $1,000 and a cinematic, story-led style.	martin@solmatesvideo.com	(806) 223-0253	https://solmatesvideo.com/	
`,
  },
  {
    name: "Hill Country: cake, videography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Cakes Couture	Cake		New Braunfels	Texas	New Braunfels, Uptown New Braunfels	New Braunfels cake studio making custom event and wedding cakes, quoted from a design photo and guest count, with tastings.	1cakescouture@gmail.com	(409) 998-4107	https://www.cakescouturenb.com/	https://www.instagram.com/cake_couture80/
Videography by Henry	Videography		New Braunfels	Texas	New Braunfels, Austin–San Antonio region	New Braunfels videographer covering wedding prep, ceremony and reception, with multi-camera, highlight, raw footage and drone options.	info@videographybyhenry.com		https://www.videographybyhenry.com/	https://www.instagram.com/videography_by_henry/
`,
  },
  {
    name: "Austin: cake",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Alba Artisan Bakery	Cake		Austin	Texas	Austin	Austin bakery making custom wedding cakes and dessert tables, with gluten-free requests handled and tastings booked through the site.	info@albaartisanbakery.com		https://www.albaartisanbakery.com/	https://www.instagram.com/albacakedesign/
`,
  },
  {
    name: "Dallas–Fort Worth: music",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Outspoken Visions	Music	12801 N Stemmons Fwy #901	Dallas	Texas	Dallas; destination weddings	Dallas company offering wedding DJ and MC services, sound, dance floor lighting and special effects, with over 15 years of events behind it.	info@outspokenvisions.com	972-275-6783	https://outspokenvisions.com/	https://www.instagram.com/outspokenvisions/
`,
  },
  {
    name: "Houston: videography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Cakewalk Films	Videography		Houston	Texas	Houston; Austin; Dallas	Boutique Houston film company making cinematic wedding films, with weddings also covered in Austin and Dallas.	info@cakewalkfilms.com	832-534-2253	https://www.cakewalkfilms.com/	https://www.instagram.com/cakewalkfilms/
Jacob Alexander Films	Videography		Houston	Texas	Houston; Texas Hill Country; destination weddings	Houston wedding videographer making documentary-style films, with packages for full days, elopements and destination weddings.			https://jacobalexanderfilms.com/	
`,
  },
  {
    name: "San Antonio, New Braunfels and Boerne: videography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Infinity Video & Photo	Videography	2202 Castello Way	San Antonio	Texas	San Antonio; Austin; Houston; South Texas	San Antonio wedding video and photography studio working since 1999, taking only one or two events each weekend.	info@infinityweddings.com	(210) 744-5566	https://infinityweddings.com/	https://www.instagram.com/infinityvideophoto/
Made In Texas Productions	Videography		San Antonio	Texas	San Antonio; Texas Hill Country	San Antonio videographer making cinematic wedding films with drone shots and professional audio, delivered in six to eight weeks.			https://www.madeintexasproductions.com/	https://www.instagram.com/made_in_texas_productions/
`,
  },
  {
    name: "Hill Country: videography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Hill Country Wedding Co.	Videography		Wimberley	Texas	Wimberley; Texas Hill Country; destination weddings	Wimberley photography and film team shooting weddings across Texas and at destinations, with several wedding film collections.	info@hillcountryweddingco.com		https://www.hillcountryweddingstories.com/	
`,
  },
  {
    name: "Killeen, Harker Heights, Temple and Salado: planning, hair & makeup",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
JLynn Events Planning	Planning		Killeen	Texas	Killeen	Killeen event planner covering weddings, corporate and social events, from the first consultation through to the event itself.	jlynn.diaz7@gmail.com	787-554-0521	https://www.jlynneventsplanning.com/	https://www.instagram.com/jlynneventsplanning/
Everlasting Designs and Decor	Planning		Killeen	Texas	Killeen	Killeen event decor, party planning and rental service, with weddings and bridal showers among the celebrations it styles.			https://everlastingdesignanddecor.com/	
Salon Salado	Hair & Makeup		Salado	Texas	Salado; Bell County	Salado hair salon offering updos, colour and makeup, with wedding preparation handled on request.		254-760-0942	https://www.salonsalado.com/	
`,
  },
  {
    name: "Tyler and East Texas: catering, hair & makeup, videography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Hair Barn	Hair & Makeup	2900 Old Henderson Hwy, Ste 5	Tyler	Texas	Tyler	Tyler hair salon offering bridal updos, half-up styles and soft waves, with a trial first and bridal party bookings welcome.	hacketthairdesigns@gmail.com	(903) 944-0863	https://tylerhairbarn.com/	
Video Magic Productions	Videography	5520 Old Bullard Road, Suite 115	Tyler	Texas	Tyler; Lindale; East Texas; travels nationwide	Tyler video crew with decades of experience making wedding highlight reels and full-length cinematic films for East Texas couples.	vmppro@live.com	903-530-3841	https://videomagicpro.com/	https://www.instagram.com/videomagicprotx/
Tyler Pro Video	Videography		Tyler	Texas	Tyler; East Texas	Tyler videographers covering weddings in Tyler and the surrounding East Texas area, alongside portrait and general video work.	michael@tylerprovideo.com	940-594-1642	https://tylerprovideo.com/	
`,
  },
  {
    name: "Waco, Bryan–College Station and Brenham: videography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Jake Gleim Wedding Photo & Video	Videography		Waco	Texas	Waco and surrounding Central Texas communities	Waco filmmaker offering edited wedding films with all raw footage and drone coverage, alone or paired with photography.	contact@jakegleim.com	(254) 221-6887	https://jakegleim.com	
`,
  },
  {
    name: "Killeen, Harker Heights, Temple and Salado: hair & makeup, videography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Be.You.Tiful Salon	Hair & Makeup	108 N Main Street	Belton	Texas	Belton and Central Texas	Downtown Belton salon offering bridal hair and makeup with trials, airbrush, wedding-party pricing and on-site or at-home service.	beltonbeyoutifulsalon@gmail.com	254-939-7499	https://www.beltonbeyoutifulsalon.com/weddings	https://www.instagram.com/beyoutifulsalon/
`,
  },
  {
    name: "Tyler and East Texas: catering, planning",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Don Juan Catering	Catering	114 S Horace Ave	Tyler	Texas	Tyler	Tyler Mexican restaurant family catering weddings with fajita platters, enchilada combinations and parrillada spreads, plus custom menus on request.		(903) 204-4027	https://www.donjuantyler.com/catering-tyler-texas/	
Wildflower Events & Design Co.	Planning		Tyler	Texas	East Texas	Tyler planning and design studio for weddings and events, with a free consultation and support from first meeting to the last dance.	info@wildflowereventsdesignco.com	(903) 504-7903	https://www.wildflowereventsdesignco.com/	
`,
  },
  {
    name: "Waco, Bryan\u2013College Station and Brenham: cake, catering, videography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Rio Brazos Cuisine	Catering	1523 Herring Avenue	Waco	Texas		Waco caterer for weddings with plated dinners, stations, buffets or family style, plus custom menus and tastings with a chef and planner.		254-235-9136	https://riobrazoscatering.com/weddings	https://www.instagram.com/riobrazoscuisine/
San Angel Photo + Film	Videography		Bryan	Texas	College Station, Bryan, Brenham, Montgomery and Austin	Bilingual husband-and-wife team filming modern, colourful weddings, with packages built around one photographer, two videographers or both.	info@sanangelphoto.com		https://www.sanangelphoto.com/	https://www.instagram.com/sanangelphoto/
Fabulous Fare	Cake		Bryan	Texas	Bryan and College Station	Appointment-only Bryan bakery making multi-tier wedding cakes and groom's cakes, with wedding and event consultations.		(979) 324-4256	https://fabulousfare.com/	https://www.instagram.com/fabfarebcs/
`,
  },
  {
    name: "Lubbock and Amarillo: catering, planning, videography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
RANE Designs	Planning		Lubbock	Texas	Lubbock and surrounding areas	Lubbock wedding planner offering full planning and day-of coordination, with custom packages and in-person planning meetings.	info@designsbyrane.com	806-336-4866	https://www.designsbyrane.com	https://www.instagram.com/rane.designs/
Sweets + Meats	Catering	3300 S Coulter, Suite 5	Amarillo	Texas		Amarillo shop that designs custom charcuterie boards for each event, and says it can help with wedding catering as well.		(806) 331-0105	https://www.sweetsmeats.com/	https://www.instagram.com/sweets_meats/
`,
  },
  {
    name: "El Paso: hair & makeup",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Bijoux Belles Hair & Makeup	Hair & Makeup	10105 Montwood Suite J	El Paso	Texas	El Paso, Texas and New Mexico, plus destination weddings	El Paso studio sending hair and makeup artists on location for weddings, with looks tailored to each client's style and event details.	info@bijouxbellesstudio.com	915-256-4803	https://www.bijouxbellesstudio.com/	https://www.instagram.com/bijouxbelles/
`,
  },
  {
    name: "Texas map fill: Laredo, Victoria, Eagle Pass, Lake Jackson, Corsicana, Paris, Big Spring, Stephenville, Plainview, Palestine, Brownwood, Alice, Bay City: florals, photography, cake, music, catering, hair & makeup, bar",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Jenny King Photography	Photography		Victoria	Texas		Victoria wedding photographer shooting romantic, emotive portraits, with an experienced, relaxed approach to the whole wedding day.	jenny@jennykingphotography.com		https://jennykingphotography.com/	https://www.instagram.com/jenny_king_photography/
Sweet Fountainz Bakery	Cake	5805 John Stockbauer Dr	Victoria	Texas	Victoria, with delivery to venues within 35 miles	Victoria bakery baking custom wedding cakes in couples own flavours, designs and colours, delivered to the venue.		361-575-4715	https://sweetfountainzbakery.com/wedding-cakes	https://www.instagram.com/sweetfountainzbakery/
Allison's Floral & Gift Shop	Florals	415 W Hillside Rd	Laredo	Texas		Laredo florist offering bridal bouquets, wedding party flowers and ceremony and reception arrangements, with custom orders and Spanish pages.		956-724-5833	https://www.allisonsfloralandgiftshop.com/	
Eva's Flower Shop & Gifts	Florals	1915 N Veterans Blvd	Eagle Pass	Texas		Eagle Pass florist since 1991 designing custom wedding flowers, from bouquets to arches, with consultations and silk and decor rentals.		830-757-0109	https://www.evasflowershopandgifts.com/wedding-flowers	
Emily McNeel Photography	Photography		Corsicana	Texas		Corsicana wedding photographer with Classic, Luxe and Exclusive packages from intimate elopements to full-day and destination weddings.	emilymcneelphotos@gmail.com		https://www.emilymcneelphotography.com/	https://www.instagram.com/emilymcneelphotos/
DarKer Side DJs & Photo Booths	Music	506 S Brooks St	Brazoria	Texas		Wedding DJ, lighting and photo booth company with more than twenty years of experience, working from Brazoria and the Houston area.	darkersidedjs@darkersidedjs.com	281-542-3555	https://www.darkersidedjs.com/	
Made You Blush	Hair & Makeup		Lake Jackson	Texas		Team of hair and makeup artists focused on weddings, offering bridal trials, airbrush makeup and bridesmaid styling.			https://www.madeyoublushtx.com/	https://www.instagram.com/madeyoublushtx/
Paris Texas Mobile Bar	Bar		Paris	Texas	Paris and North Texas	TABC-certified mobile bar service that sets up a full bar at weddings and other events, indoors or out, in and around Paris.		(903) 517-9303	https://parismobilebar.com	
Mexia Photography	Photography		Big Spring	Texas		Big Spring photographer covering weddings, families and graduations, with a husband-and-wife team and drone coverage at weddings.	mexiaphotographyllc@gmail.com		https://www.mexiaphotography.com/	https://www.instagram.com/mexiaphotographyllc/
B & A MediaTech	Music		Stephenville	Texas	North Texas	DJ and live sound company serving Stephenville and Granbury weddings, with photo booth and LED video wall options for receptions.	contact@bamediatech.com	(682) 719-3412	https://www.bamediatech.com/	
The Red Umbrella Bakery	Cake	2029 W Washington St, Suite 220	Stephenville	Texas		Stephenville bakery taking custom cake orders for weddings, parties and birthdays alongside everyday treats.	emilyt@theredumbrellabakery.com	254-434-5016	https://www.theredumbrellabakery.com/	https://www.instagram.com/theredumbrellatx/
Scott's Flowers	Florals	200 W College St	Stephenville	Texas	Stephenville	Locally owned Stephenville florist since 1978 that designs wedding flowers and event arrangements alongside everyday bouquets.		(254) 965-5979	https://www.stephenvillescottsflowers.com/	
Kan Del's Floral, Candles & Gifts	Florals	605 Amarillo Street	Plainview	Texas	Plainview	Florist and gift shop making custom bridal bouquets, centrepieces and ceremony flowers, with pricing agreed at a bridal consultation.		806-288-0256	https://www.kandelsflowershop.com/	https://www.instagram.com/kan_dels/
WeekEnds Take Out BBQ and Catering	Catering	2206 W 5th St	Plainview	Texas		West Texas barbecue caterer whose wedding packages can add prime rib and beef tenderloin, serving events from family dinners to large celebrations.	weekendsbbq@gmail.com	806-292-1423	https://weekendsbbq.com/	https://www.instagram.com/weekendsbbq/
Flowers by Pat	Florals	616 W Oak St	Palestine	Texas	Palestine	Palestine florist designing each wedding to order, from bouquets and corsages to arches, centrepieces and on-site decorating, with themed ideas.		903-729-0631	https://www.flowersbypatflorist.com/	
The Flower Shop	Florals	1734 Crockett Rd	Palestine	Texas	Palestine	Wedding flower boutique offering bridal bouquets, aisle petals, arches and centrepieces, delivered and set up to suit the venue and timeline.	wecare@theflowershoppalestinetx.com	903-727-0510	https://www.theflowershoppalestinetx.com/	https://www.instagram.com/theflowershop_boutique/
The Party Doc Wedding DJs	Music		Brownwood	Texas	Brownwood and Central Texas, with travel to Abilene, San Angelo and further	Brownwood wedding DJ with over 30 years behind the decks, offering sound, an emcee, lighting and optional up-lighting and monogram gobos.		844-489-2378	https://brownwoodweddingdjs.com/	
Rose Image	Florals	1525 E Main St	Alice	Texas	Alice	Alice florist creating custom-designed wedding flowers with themed options, plus consultations, on-site decorating and arch and candelabra rentals.		361-664-7000	https://www.roseimageflowers.com/	
Alice Floral & Gift	Florals	512 E Front St	Alice	Texas	Alice	Alice florist and gift shop doing bridal and attendant bouquets, ceremony flowers and centrepieces, with candelabra, topiary and arch rentals.		361-664-9999	https://www.alicefloral.com/	
Bay City Floral	Florals	2133 Avenue G	Bay City	Texas		Downtown Bay City florist designing bridal bouquets plus ceremony and reception flowers to the couple's vision, with full floral set-up.		979-245-9492	https://baycityfloral.net/	https://www.instagram.com/bay_city_floral/
`,
  },
  {
    name: "Map fill: Lufkin, Nacogdoches, Gainesville, Sherman, Brazosport and small towns: Florals, Catering, Photography, Cake, Desserts",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Grandough Baking Co.	Cake	1705 Feagin Dr	Lufkin	Texas	Lufkin and Nacogdoches	Bakery making custom tiered and naked wedding cakes and groom's cakes, with tastings by appointment and event catering.	grandough@yahoo.com	(936) 632-1005	https://grandough.com/wedding-cakes/	
The Flower Pot	Florals	304 E Denman Ave	Lufkin	Texas		Lufkin florist designing bridal bouquets, ceremony arrangements and centrepieces, with candelabra, arch and topiary rentals.		(936) 632-8400	https://www.theflowerpottexas.com/wedding-flowers	
Texas Custom Catering	Catering	691 E Texas Rd	Lufkin	Texas	Lufkin area	Lufkin caterer serving wedding receptions, corporate events and parties with fresh-made menus.	aperfectweddingllc@gmail.com	(936) 635-4236	https://www.texascustomcatering.com/our-services	
WNW Photography	Photography		Nacogdoches	Texas	East Texas, Houston and Dallas	Nacogdoches photographer who shoots natural, candid weddings, engagements and elopements, and will travel for destination work.	wnwcreatives@gmail.com		https://www.wnw-photography.com/	https://www.instagram.com/wnw_photography/
99ndco	Photography		Nacogdoches	Texas	Nacogdoches, Houston and Dallas	Husband-and-wife duo in Nacogdoches shooting cinematic, true-to-colour wedding stories with a film-inspired look.			https://99ndco.com	https://www.instagram.com/99ndco/
Mike's Barbeque House	Catering		Nacogdoches	Texas	Nacogdoches	Barbecue caterer offering chipped beef, sandwiches, catfish and sides for weddings, reunions and large parties.		(936) 560-1676	https://www.mikesbarbequehouse.net/nacogdoches-tx-catering-service	
Vine and Branches	Florals	401 N Grand Ave	Gainesville	Texas	Dallas-Fort Worth and southern Oklahoma	Gainesville florist designing fresh, silk or mixed wedding flowers for celebrations of roughly 25 to 250 guests.	info@vineandbranchesgainesville.com	(940) 612-1829	https://www.vineandbranchesgainesville.com/weddings	https://www.instagram.com/vineandbranchesgainesville/
Gene's Photos	Photography		Gainesville	Texas	Gainesville and Muenster	Gainesville photography business covering weddings, portraits, seniors and aerials, meeting couples wherever they choose.		(940) 665-4742	https://genesphotos.com/	
Country Florist	Florals	1520 Texoma Pkwy	Sherman	Texas	Sherman and nearby areas	Sherman florist with over 40 years in business, arranging ceremony and reception flowers and bouquets after a phone consultation.		(903) 892-0114	https://www.countryfloristshermantx.com/about_us.php	
Amanda Elaine Photography	Photography		Sherman	Texas	Sherman, Denison, McKinney and the Texoma area	Sherman studio photographing weddings, families and seniors across Texoma and north Dallas suburbs.			https://amandaelainephotography.com/2025/02/28/wedding-photographer-sherman-tx/	https://www.instagram.com/amandaelainephoto/
Cakery Lane	Cake		Lake Jackson	Texas	Lake Jackson	Lake Jackson custom bakery hand-sculpting wedding and groom's cakes to order, by appointment only.			https://www.cakerylane.com/	https://www.instagram.com/cakerylanellc/
Talk About Good	Catering	2105 N Brazosport Blvd	Freeport	Texas	Brazosport area	Freeport restaurant and caterer serving Southern and Cajun dishes for weddings, private events and corporate parties.		(979) 233-0665	https://talkaboutgood.biz/	
Littlejohn's Catering	Catering	513 W Lingleville Rd	Stephenville	Texas	Erath County and beyond	Stephenville caterer offering buffet, table-service or drop-off menus from casual country to black tie, plus charcuterie boards.	sherrilittlejohn@yahoo.com	(254) 842-4260	https://www.littlejohnstx.com/catering	
Amy's Cookie Co. and Bakery	Desserts	227 East Jackson St	El Campo	Texas		El Campo bakery turning out big soft cookies, cakes and brownies, and taking custom orders for weddings, bridal showers and other celebrations.	amyscookiecoorders@gmail.com		https://amyscookiecoandbakery.com/	https://www.instagram.com/amyscookiecoandbakery/
Heather Crump Photography	Photography		Victoria	Texas		Victoria wedding and portrait photographer who favours natural light and a timeless, sophisticated look in the images she delivers.	hello@heathercrump.com		https://heathercrump.com/	https://www.instagram.com/heatherncrump/
Desert Rose Flowers & Gifts	Florals	1302 Simmons Avenue	Jourdanton	Texas	Jourdanton, Pleasanton and Poteet	Family florist in Jourdanton offering bridal bouquets, bridesmaids' flowers, ceremony arrangements and reception centrepieces.		830-769-3585	https://www.lesleysflowersandgifts.com/	https://www.instagram.com/lesleysflowersandgifts/
Gloria's Floral Shop	Florals	314 NW Ave. B	Andrews	Texas		Andrews flower shop that arranges bridal and bridesmaid bouquets, boutonnieres, ceremony flowers and reception centrepieces, with consultations by phone.		432-523-2096	https://www.gloriasfloralshop.com/wedding-flowers	
Chocolate Tulip	Florals	517 North Main	Borger	Texas		Borger florist with wedding packages covering bouquets, corsages and boutonnieres, ceremony decor and reception flowers, planned at a bridal consultation.		806-273-3718	https://www.chocolatetulip.com/wedding-flowers	https://www.instagram.com/chocolatetulipboutique/
Family Blooms	Florals	440 Oriente Drive	Pleasanton	Texas		Pleasanton flower shop making wedding bouquets, wedding-party flowers, ceremony pieces and reception arrangements for couples in the area.		830-281-2131	https://www.pleasantontxflorist.com/wedding-flowers	
Thyme & Elegance Catering	Catering	409 N. Beaton Street	Corsicana	Texas	Navarro County	Corsicana caterer cooking personalised menus for weddings and parties, with a gourmet, from-scratch approach and options for gluten-free and vegan diets.	thymeandelegancecatering@gmail.com	903-602-5000	https://www.thymeandelegance.com/	https://www.instagram.com/thymeandelegancecatering/
J&S BBQ	Catering	2025 N Center St	Bonham	Texas	Fannin County	Family-run Bonham barbecue business with a food truck and a catering service for weddings, slow-smoking its meats and making its own rubs and sauces.	cutterace1@gmail.com	903-647-0829	https://jsbbque.com/	https://www.instagram.com/Jsbbqfoodtruckbonhamtx/
Big Country Flowers	Florals		Sweetwater	Texas	Sweetwater and Abilene	Full-service Sweetwater florist with over 25 years of experience, handling wedding flowers alongside everyday and sympathy orders.	sweetwaterflorist@gmail.com	325-236-4304	http://sweetwaterflowershops.com/	
The Flower Box & Gifts	Florals		Sweetwater	Texas		Sweetwater florist offering wedding consultations by phone, in person or email, with ceremony and reception flowers delivered to the venue.		325-235-8676	https://swtflowerbox.com/collections/wedding	
`,
  },
  {
    name: "Map fill: Mount Pleasant, Uvalde, Hereford, Dumas, El Campo, Lake Jackson: Florals, Photography, Music, Catering",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Designs by Lisa	Florals	1101 W 16th St	Mount Pleasant	Texas		Florist doing bridal and attendant bouquets, ceremony and reception arrangements, on-site decorating and arch or candelabra hire.		(903) 572-7964	https://www.designsbylisatx.com/wedding-flowers	
Laura's Cheesecake & Cafe	Catering	109 N Madison Ave	Mount Pleasant	Texas		Downtown cheesecake bakery and cafe that also caters wedding celebrations and other events.	info@laurascheesecake.com	(903) 577-8177	https://laurascheesecakeandcafe.com/	https://www.instagram.com/laurascheesecakeandcafe/
The Flower Patch	Florals	214 S Getty St	Uvalde	Texas		Uvalde florist offering wedding consultations, bouquets, ceremony and reception flowers, arches, and wedding and party hire.		(830) 278-2583	https://www.theflowerpatchuvaldetx.com/wedding-flowers	https://www.instagram.com/flowerpatchofuvalde/
Flowers West	Florals	506 S 25 Mile Ave	Hereford	Texas	Hereford area	Long-running Hereford flower shop with a weddings and quinceañeras section on its website.		(806) 364-6452	https://www.flowerswesthfd.com/	
Flowers Etc. LLC	Florals	523 S Dumas Ave	Dumas	Texas		Dumas florist doing wedding consultations, bouquets, ceremony and cake-table flowers, arches, and wedding and party hire.		(806) 935-7924	https://www.flowersetcdumastx.com/wedding-flowers	
Floral Gardens	Florals	802 W Jackson St	El Campo	Texas		El Campo florist offering bridal party flowers, ceremony decor, reception centrepieces and on-site wedding consultations.		(979) 543-2705	https://www.floralgardens.biz/wedding-flowers	
Cristal Malek Photography	Photography		El Campo	Texas	Houston, El Campo and Wharton	Relaxed, airy wedding photography from El Campo, with elopement and full-day packages and a day-after session.		(979) 578-2823	https://www.cristalmalekphotography.com/weddings	
Wild Roots Photography	Photography		Lake Jackson	Texas	Southern Brazoria County and the Texas Gulf Coast	Lake Jackson photographers covering weddings with two photographers on every collection, serving southern Brazoria County and the Gulf Coast.			https://wildrootsphotography.com/weddings	https://www.instagram.com/wild_roots_photographytx/
`,
  },
  {
    name: "Map fill: Brownwood, Sulphur Springs, Pampa",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Be Okay Photography	Photography		Brownwood	Texas		Brownwood photographer offering wedding packages from a two-hour essentials package to full-day coverage, plus engagement sessions and portraits.			https://beokayphotography.com/	https://www.instagram.com/be_okay_photography/
The Sticks BBQ	Catering	3501 US-377	Brownwood	Texas	Brown County and nearby Central Texas towns	Family-owned Brownwood barbecue joint since 2001 that smokes brisket, ribs and sausage and offers BBQ catering for larger groups.		(325) 646-2315	https://sticksbbq.com/	
Whoops-A-Daisy Flower Co.	Florals	128 S Davis St	Sulphur Springs	Texas	Sulphur Springs	Downtown Sulphur Springs flower shop that arranges wedding bouquets, wedding party flowers, and ceremony and reception arrangements.	vickibassham@icloud.com	(903) 885-2554	https://www.whoopsadaisyflowerco.com/	
The Plaza Restaurant	Catering	1201 N Hobart St	Pampa	Texas		Tex-Mex restaurant in Pampa that caters wedding receptions and rehearsal dinners, with fajita bars and enchilada dinners.			https://www.theplazarestaurant.com/catering/	`,
  },
  {
    name: "Killeen, Harker Heights, Temple and Salado: photography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Hunter Bee Photography	Photography		Killeen	Texas	Bell County, Williamson County and the greater Austin area, including Harker Heights, Belton, Temple and Salado	Wedding and elopement photographer near Killeen who mixes digital with 35mm film and Super 8, and also travels for destination weddings.	hunterbeephotography@gmail.com		https://hunterbeephotography.com/	https://www.instagram.com/hunterbee.co/`,
  },
];

export default batches;
