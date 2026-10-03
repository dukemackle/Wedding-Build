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
];

export default batches;
