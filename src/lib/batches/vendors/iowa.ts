import type { VendorBatch } from "@/lib/vendor-batches";

// Iowa vendor batches. Every row's State is "Iowa". Add new batches at the end.
const batches: VendorBatch[] = [
  {
    name: "Des Moines: photography, planning, florals, music, catering, hair and makeup, cakes and videography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Jason Thomas Crocker Photography	Photography	833 42nd St	Des Moines	Iowa	Des Moines, Iowa and the wider Midwest	Des Moines photographer with more than 800 weddings behind him, shooting unobtrusive, natural-looking images without heavy filters.	jason@jasonthomascrocker.com	515-216-0650	https://www.jasonthomascrocker.com/	https://www.instagram.com/jasontcrocker/
The Wedding Format	Photography		Des Moines	Iowa	Des Moines, with travel to Minneapolis, Kansas City, Chicago and Omaha	Husband-and-wife duo mixing digital and film photography with a candid, relaxed style, and offering Super 8mm wedding films.	booking@theweddingformat.com		https://theweddingformat.com/	https://www.instagram.com/theweddingformat/
Corah B Photography	Photography		Des Moines	Iowa	Des Moines and nearby areas including Ames, Omaha and Dubuque	Des Moines wedding photographer focused on small, everyday moments of the day, who also offers bridal boudoir sessions.			https://corahbphotography.com/	https://www.instagram.com/corah.b.photography/
Uniqu Co. Events & Planning	Planning		Des Moines	Iowa	Des Moines area	Down-to-earth Des Moines planner offering day-of coordination and partial planning, with setup and breakdown crews available.			https://uniqucoevents.com/	https://www.instagram.com/uniqucoevents/
Stuart Alexander Productions	Planning	100 Indiana Ave	Des Moines	Iowa		Des Moines event company that plans, coordinates and styles weddings, with rentals, lighting and Indian wedding experience in-house.		515-953-2500	https://www.stuartalexanderproductions.com/	https://www.instagram.com/stuartalexanderproductions/
Everlasting Events	Planning		Des Moines	Iowa	Des Moines and Iowa	Sister-run Des Moines planning company offering full, partial and final-months coordination aimed at budget-conscious couples.			https://www.everlastingeventsdsm.com/	
CamBam Custom Floral	Florals	10536 Justin Dr	Urbandale	Iowa	Des Moines area	Woman-owned studio designing custom wedding bouquets, ceremony installations and reception styling, with rental decor and a la carte options.	cambamcustomfloral@gmail.com	515-468-9600	https://www.cambamcustomfloral.com/	https://www.instagram.com/cambamfloral_llc/
Something Chic Floral	Florals	1905 E.P. True Park Way, Suite 209	West Des Moines	Iowa	Des Moines area	West Des Moines studio focused only on wedding and event flowers, with clean-lined designs and showroom consultations by appointment.	danielle@somethingchicfloral.com	515-556-0835	https://somethingchicfloral.com/	
Bella Flora	Florals	3100 Justin Dr, Suite A	Urbandale	Iowa	Des Moines area	Urbandale floral and event design studio, working since 2004 with an in-house team across a range of styles and budgets.		515-554-6964	https://bellafloraeventdesign.com/	https://www.instagram.com/bellafloradsm/
Marquee Events	Music		Des Moines	Iowa	Des Moines and central Iowa	Des Moines DJ company pairing MCs with lighting design and optional live musicians, and a regular at the city's hotel and downtown venues.	info@marqueeeventsiowa.com	515-957-7770	https://www.marqueeeventsdjs.com/	https://www.instagram.com/marqueeeventsdjs/
DSM Dance Party DJs	Music		Des Moines	Iowa	Iowa	Des Moines wedding DJs who add dance floors, lighting and effects to keep the reception busy from the first song.	booking@dsmdancepartydjs.com	515-512-2003	https://www.dsmdancepartydjs.com/	https://www.instagram.com/dsmdancepartydjs.co/
Yeti House Entertainment	Music		Ankeny	Iowa	Central Iowa	Ankeny DJ and emcee service for weddings, school dances and private parties, also running weekly trivia nights across the metro.	djyetihouse@gmail.com	515-729-3096	https://www.yetihouseentertainment.com/	https://www.instagram.com/djyetihouse/
Christiani's VIP Catering Service	Catering	1150 E Diehl Ave	Des Moines	Iowa	Des Moines area	Family-run Des Moines caterer with more than 40 years behind it, supplying linens, china, uniformed staff and a banquet captain.	christianiscatering1@gmail.com	515-287-3169	https://www.christianiscatering.com/	
Gateway Market	Catering	2002 Woodland Ave	Des Moines	Iowa	Des Moines	Independent Des Moines specialty grocer and cafe, with a bakery and chef-led kitchen that also caters weddings and events off-site.	info@gatewaymarket.com	515-243-1754	https://www.gatewaymarket.com/	https://www.instagram.com/gatewaymarket/
Tangerine Food Co	Catering	900 Keosauqua Way, Suite 131	Des Moines	Iowa	Des Moines	Downtown Des Moines caterer that also hosts events in its own studio-building space, serving fresh, locally sourced menus.	info@tangerinefoodco.com	515-720-7510	https://www.tangerinefoodco.com/	
DSM Salon	Hair & Makeup	849 42nd St	Des Moines	Iowa	Des Moines	Des Moines salon with a dedicated bridal team trained across hair and skin types, matching each bride to a stylist through a short survey.			https://dsmsalon.com/	https://www.instagram.com/dsmsalonia/
Salon Au	Hair & Makeup	1325 SW Oralabor Rd, Suite 216	Ankeny	Iowa	Ankeny and Des Moines, in-salon or on location	Ankeny salon with a bridal team offering wedding hair and makeup in the salon or on location, led by stylist Michelle Golden.	info@salonau.com	833-244-9360	https://www.salonau.com/	https://www.instagram.com/salonauiowa/
Sweet Cactus Bakery	Cake		Pleasant Hill	Iowa	Des Moines area	Pleasant Hill bakery run by Erin Leutscher making custom wedding cakes and cupcakes from the couple's own design ideas and reference photos.	sweetcactusbakery19@gmail.com	515-321-9174	https://www.sweetcactusbakery.com/	https://www.instagram.com/sweetcactusbakery/
Parinda Cupcakes	Cake		Des Moines	Iowa	Des Moines	Home-based Des Moines baker making designer wedding cakes with hand-piped buttercream flowers, plus simpler pre-designed cakes for tighter budgets.	may@parindacupcakes.com	515-771-3342	https://www.parindacupcakes.com/	https://www.instagram.com/parindacupcakes/
Bake Sale Customs	Cake		Des Moines	Iowa	Des Moines area	Des Moines custom cake and dessert bakery that makes wedding cakes, known for star and heart-shaped designs and quality ingredients.			https://www.bakesalecustoms.com/	https://www.instagram.com/bakesalecustoms/
Reed Shepherd Films	Videography		Des Moines	Iowa	Iowa, and travels widely	Des Moines wedding filmmaker making upbeat, personality-led films with teaser, feature and aerial options, and happy to travel.			https://reedshepherdfilms.com/	https://www.instagram.com/reedshepherdfilms/
5 Point Visuals	Videography		Des Moines	Iowa	Iowa	Des Moines filmmaker-photographer who keeps wedding days low-key and unposed, also offering photo booth rental.			https://5pointvisuals.com/	https://www.instagram.com/kyle_starcevich/
`,
  },
  {
    name: "Des Moines: hair and makeup and videography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Jene Beauty	Hair & Makeup	815 Office Park Rd, Suite 9	West Des Moines	Iowa	Des Moines metro	West Des Moines esthetician and makeup artist offering bridal makeup, lash services and lessons from a studio suite, with on-site work for wedding parties.	jenebeautyinfo@gmail.com	515-867-3430	https://www.jenebeauty.com/	https://www.instagram.com/jenebeauty__/
Feilmeier Films	Videography		Des Moines	Iowa	Des Moines, the Midwest and beyond	Des Moines filmmaker covering weddings alongside lifestyle, travel and commercial work, shooting around Iowa, the wider Midwest and farther afield.			https://www.feilmeierfilms.com/weddings	https://www.instagram.com/feilmeierfilms/
`,
  },
];

export default batches;
