import type { VendorBatch } from "@/lib/vendor-batches";

// Kansas vendor batches. Every row's State is "Kansas". Add new batches at the end.
const batches: VendorBatch[] = [
  {
    name: "Wichita: photography, planning, florals, music, catering, hair and makeup, cakes and videography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Eric Tran Photography	Photography		Wichita	Kansas	Wichita	A Wichita photographer shooting weddings in a fine art and photojournalistic style, with more than a decade of experience.			https://www.erictranphoto.com/	https://www.instagram.com/erictranphotography/
Alycia Rife Photography	Photography		Wichita	Kansas	Wichita	A Wichita-based wedding photographer who documents emotion-filled moments for couples who want lasting memories.	alyciarifephotography@gmail.com		https://alyciarifephotography.com/	https://www.instagram.com/alyciarifephotography/
Chris & Lara	Photography		Wichita	Kansas	Wichita	A husband-and-wife photography team in Wichita who aim to make couples feel at ease and supported through the wedding day.			https://chrisandlara.com/	https://www.instagram.com/chrisandlara/
Blush Events	Planning		Wichita	Kansas	Wichita	A Wichita wedding planner offering full planning, partial planning and month-of coordination for classic-style weddings.			https://blusheventsict.com/	https://www.instagram.com/blusheventsict/
Ambiance Events	Planning		Wichita	Kansas	Wichita	A Wichita event designer founded in 2014 who plans weddings, corporate events and nonprofit galas with a luxury focus.			https://ambiancewichita.com/	https://www.instagram.com/ambianceevents/
Kansas Event Planning	Planning		Wichita	Kansas	Wichita area	A Wichita-raised planner offering day-of coordination and wedding planning, alongside corporate events and showers.	kansaseventplanning@gmail.com	316-304-3302	https://www.kansaseventplanning.com/	https://www.instagram.com/kansaseventplanning/
Free State Flora	Florals		Wichita	Kansas	Wichita	A Wichita florist for weddings and events, working in a natural, organic style for bouquets, altars and arrangements.			https://www.freestateflora.com/	https://www.instagram.com/freestateflora/
Limestone Floral	Florals		Wichita	Kansas	Wichita and surrounding areas	A Wichita design studio led by Hannah Reynolds, creating seasonal, nature-led flowers for weddings and events.			https://limestonefloral.com/	https://www.instagram.com/limestonefloral/
Flower Factory Flowers	Florals	7130 W Maple St	Wichita	Kansas	Wichita	A Wichita flower shop offering wedding consultations and custom arrangements for ceremonies and receptions.	flowerfactory1@yahoo.com	316-262-9202	https://www.wichitaflowerfactory.com/	https://www.instagram.com/flowerfactoryflowerswichita/
DanceMan DJ Services	Music		Wichita	Kansas	Wichita	A Wichita wedding and event DJ company with a long local history, booking dates by signed contract.	djej9817@gmail.com	316-558-0057	https://www.thedancemandj.net/	https://www.instagram.com/the.dance.man.dj/
HiFi Productions	Music		Wichita	Kansas	Wichita	A Wichita entertainment company offering wedding DJs and a dueling pianos show with two pianos and a drummer.		316-617-2730	https://www.hifiproductions.net/	https://www.instagram.com/hifi.productions/
Musicfit	Music		Wichita	Kansas	Wichita and Kansas	A Wichita DJ service for weddings and parties that also supplies lighting, sound and dance floor rental.	dj@musicfit.net	316-858-0653	https://www.musicfit.net/	
Culinary Catering	Catering	6730 W Central Ave	Wichita	Kansas	Wichita and surrounding area	A Wichita caterer founded in 2016 offering full-service catering, bar service and a banquet room for weddings and events.		316-448-5352	https://culinarycatering.com/	https://www.instagram.com/culinarycateringks/
Blue Moon Caterers	Catering	524 S Seneca St	Wichita	Kansas	Wichita and southern Kansas	A Wichita caterer operating since 2002, handling menus, bar service, linens and staffing for weddings and corporate events.		316-612-4694	https://www.bluemooncaterers.com/	https://www.instagram.com/bluemoon.caterers/
Rent The Chef Catering	Catering		Valley Center	Kansas	Wichita area	A Valley Center caterer known for wedding taco bars, also serving private dinners and corporate events across the Wichita area.		316-308-5556	https://rentthechefcatering.com/	https://www.instagram.com/rentthechefcatering/
Curls Gone Wild Salon	Hair & Makeup	313 N Mead	Wichita	Kansas	Wichita (travels to you)	A downtown Wichita salon with a bridal team that has done 300-plus weddings and specialises in naturally curly hair.	info@curlsgonewildsalon.com	316-640-0238	https://www.curlsgonewildsalon.com/bridal	https://www.instagram.com/curlsgonewildsalonict/
Bon Salon by Yazi	Hair & Makeup	413 North Hillcrest Street	Wichita	Kansas	Wichita	A Wichita salon run by Yazi Duarte, who specialises in bridal styling alongside colour and hair restoration services.	bonsalonyazi@gmail.com	316-871-7228	https://www.bonsalonbyyazi.com/	https://www.instagram.com/bonsalon_by_yazi/
Artistic Cakes	Cake	8985 W Central Ave	Wichita	Kansas	Wichita	A Wichita bakery with several decades of experience designing custom wedding cakes to each couple's brief after a consultation.	cakeplan@yahoo.com	316-729-0059	https://www.artisticcakes.com/	
Cameo Cakes	Cake	2401 West 13th North	Wichita	Kansas	Wichita	A Wichita sweet shop that has baked custom cakes for weddings and other celebrations since 1967.	rj@cameocakes.com	316-681-2253	https://cameocakes.com/	
Bagatelle Bakery	Cake	6801 East Harry Street	Wichita	Kansas	Wichita	A family-run Wichita bakery and cafe of about forty years that offers wedding cakes and catering.	bagatelle@latourinc.com	316-684-5662	https://bagatellebakery.com/	https://www.instagram.com/BagatelleBakery/
The Brickhouse Films	Videography		Wichita	Kansas	Wichita	A Wichita video production company that specialises in wedding films and cinematography.	mary@thebrickhousefilms.com	316-265-1105	https://www.thebrickhousefilms.com/	https://www.instagram.com/thebrickhousefilms/
Flourish Films	Videography		Wichita	Kansas	Wichita	A husband-and-wife videography duo in Wichita focused on intimate weddings, who also travel for shoots.	hey@flourish-films.com	316-734-7646	https://www.flourish-films.com/	https://www.instagram.com/flourish_films/
The Axmanns	Videography		Wichita	Kansas	Wichita and Austin, Texas	A Wichita husband-and-wife team shooting weddings as photo and cinematic film, with a focus on creative use of light.	hello@theaxmanns.com		https://theaxmanns.com/	https://www.instagram.com/theaxmanns/
`,
  },
  {
    name: "Wichita: hair and makeup",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Blushed Beauty Co.	Hair & Makeup	128 N Oliver Ave	Wichita	Kansas	Wichita	A Wichita team of independent artists and stylists offering bridal hair and makeup, led by a cosmetologist licensed since 2011.	info@blushedbeautyco.com	316-683-7350	https://www.blushedbeautyco.com/	https://www.instagram.com/blushedbeautyco.ict/
`,
  },
  {
    name: "Lawrence and Topeka: photography, planning, florals, music, catering, hair and makeup, cakes and videography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Emily Henry Photography	Photography		Lawrence	Kansas	Lawrence and northeast Kansas	A husband-and-wife Lawrence team shooting documentary-style weddings, who also offer wedding videography and nonprofit work.			https://www.emilyhenryphotography.com/	
Amanda & Camera	Photography		Lawrence	Kansas	Lawrence, Kansas	A Lawrence photographer who covers proposals, engagements and weddings, taking bookings for 2026 and 2027.			https://www.amandaandcamera.com/	https://www.instagram.com/amandaandcamera/
Worth a 1000 Words Studios	Photography	2632 SE Ohio Ave	Topeka	Kansas	Topeka	A Topeka portrait studio in its own building at 27th and Ohio, offering wedding photography packages alongside portrait sessions.		785-271-7000	https://www.wortha1000wordstopeka.com/	
Love In Lawrence	Planning		Lawrence	Kansas	Lawrence and surrounding areas	A Lawrence planning and styling business led by Stacie Alldritt, offering planning from day-of coordination to full service.	stacie@loveinlawrence.com		https://www.loveinlawrence.com/	
Along Came Abby	Planning		Topeka	Kansas	Topeka, Kansas City, Lawrence and Manhattan	A Topeka event planning company working since 2013 on weddings, galas and destination celebrations, with a sister decor rental firm.	info@alongcameabby.com		https://www.alongcameabby.com/	https://www.instagram.com/along_came_abby/
Chinell's Floral and Event Design	Florals	917 N Kansas Ave	Topeka	Kansas	Topeka and northeast Kansas	A Topeka floral and event styling studio making custom flowers for weddings, from romantic garden looks to modern designs.	Ariel@Chinells.com		https://www.chinells.com/	https://www.instagram.com/chinellseventdesign/
Bittersweet Floral and Design	Florals		Lawrence	Kansas	Lawrence, Eudora, Baldwin, Tonganoxie and De Soto	A Lawrence flower studio doing design-forward, seasonal arrangements, with a dedicated weddings page and local delivery.	bittersweetfloral@sunflower.com	785-843-5954	https://www.bittersweet-floral.com/	https://www.instagram.com/bittersweet.floral/
Blooms on Boswell	Florals	1300 SW Boswell	Topeka	Kansas	Topeka and surrounding areas	A Topeka flower shop offering wedding flowers and event florals alongside everyday arrangements and delivery.	bloomsonboswell@gmail.com	785-272-2749	https://bloomsonboswell.com/	https://www.instagram.com/bloomsonboswell/
Musical Knights	Music		Topeka	Kansas	Northeast Kansas	A Topeka DJ and MC duo with over 25 years in the business who bring two DJs to every wedding to coordinate with other vendors.		785-357-8585	https://musicalknights.com/	
Sound Origin Productions	Music		Topeka	Kansas	Topeka, Manhattan, Lawrence and surrounding area	A Topeka DJ and lighting company for weddings and dances that also rents out a separate photo booth service.	djako@soundoriginproductions.com	785-289-2919	https://www.soundoriginproductions.com/	
Evan Williams Catering	Catering	700 California	Lawrence	Kansas	Kansas City, Lawrence and Topeka	A Lawrence boutique caterer producing customised menus for weddings, social and corporate events in the Kansas City to Topeka corridor.		785-843-8530	https://evanwilliamscatering.com/	https://www.instagram.com/evanwilliamscatering/
Bon Bon	Catering	804 Pennsylvania St	Lawrence	Kansas	Lawrence and the region	A Lawrence caterer with a seasonal, chef-driven wedding menu covering plated, family-style and cocktail hour service, plus rehearsal dinners.		785-856-2275	https://www.bonbonlawrence.com/	https://www.instagram.com/bonbonlawrence/
2 Chefs Catering	Catering	2518 SW 17th Street	Topeka	Kansas	Topeka	A family-run Topeka caterer, led by Ryan and Tricia Peterson, serving handmade menus for weddings, corporate events and parties.	2Chefs@TopekaCatering.com	785-408-1210	https://www.topekacatering.com/	https://www.instagram.com/2_chefs785/
The Hive Salon	Hair & Makeup	3009 W 6th Street	Lawrence	Kansas	Lawrence, Topeka, Baldwin, Ottawa and Kansas City	A Lawrence salon with a wedding team offering in-salon and on-site bridal hair and makeup, including a non-gendered styling policy.	info@thehivelawrence.com	785-424-7024	https://www.thehivelawrence.com/	https://www.instagram.com/thehivesalon_lfk/
Cooper Cake Co.	Cake		Lawrence	Kansas	Lawrence, Kansas City and Topeka	A Lawrence cake decorator making wedding cakes, cookies, cupcakes, cakesicles and macarons for weddings and bridal showers.			https://www.coopercake.co/	https://www.instagram.com/coopercakeco/
Confectionary Disasters LLC	Cake		Topeka	Kansas	Topeka	A Topeka custom cake baker and pastry-school graduate making tiered wedding cakes, groom's cakes and chocolate fountains.	confectionarydisasters@gmail.com	785-408-4016	https://www.confectionarydisasters.com/	
MMM Cupcakes	Cake		Topeka	Kansas	Topeka	A Topeka cupcake bakery started in 2014 that makes wedding cupcakes and specialty cakes in a range of flavours.		785-845-1338	https://topekacupcakes.com/	https://www.instagram.com/mmmcupcakes24/
Films by Brooke	Videography		Lawrence	Kansas	Lawrence, travelling nationwide	A Lawrence videographer making quiet, observational wedding and lifestyle films, with limited wedding dates for 2026.			https://filmsbybrooke.com/	https://www.instagram.com/films.by.brooke/
Jacob Gill Wedding Videography	Videography		Topeka	Kansas	Topeka and across Kansas	A Topeka wedding filmmaker with an easygoing, camera-light approach who works alongside photographers across Kansas.			https://jacobgillweddingvideo.com/	https://www.instagram.com/jacobgillweddingvideography/
`,
  },
];

export default batches;
