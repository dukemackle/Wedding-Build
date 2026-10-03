import type { VendorBatch } from "@/lib/vendor-batches";

// Nebraska vendor batches. Every row's State is "Nebraska". Add new batches at the end.
const batches: VendorBatch[] = [
  {
    name: "Omaha: photography, planning, florals, music, catering, hair and makeup, cakes and videography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Lathrop Wedding Company	Photography		Omaha	Nebraska	Omaha and the Midwest	Husband-and-wife style team shooting candid, documentary wedding photography and video from one booking.	hello@lathropweddingco.com	712-525-0416	https://lathropweddingco.com/	https://www.instagram.com/lathropweddingco/
Andrea Bibeault	Photography		Omaha	Nebraska	Omaha, Nebraska	Wedding photojournalist who focuses on candids, details and the small moments of the day rather than staged poses.		402-657-3923	https://andreabibeault.com/	https://www.instagram.com/andreabibeault/
Caitlin & Camera	Photography		Omaha	Nebraska	Nebraska and beyond	Omaha photographer shooting natural, documentary-style weddings, plus engagement and family portrait sessions.	caitlinmanley12@gmail.com		https://caitlinandcamera.com/	https://www.instagram.com/caitlinandcamera/
Walnut Studio Events	Planning		Omaha	Nebraska	Nebraska and the Midwest	Boutique Omaha planning studio offering full planning, partial planning and day-of coordination for weddings across the Midwest.	cara@walnutstudioevents.com	719-337-1707	https://walnutstudioevents.com/	
Kimmy Ann Events	Planning		Omaha	Nebraska	Omaha, Nebraska	Omaha planner offering wedding coordination and full-service planning built on a step-by-step approach to the logistics of the day.	kimmy@kimmyannevents.com	417-343-3983	https://www.kimmyannevents.com/	https://www.instagram.com/kimmyannevents/
Elle Seals Events	Planning		Omaha	Nebraska	Omaha, Nebraska	Omaha event designer and coordinator who builds a custom design and plan for each wedding.	elle@elleseals.com	402-980-7347	https://elleseals.com/	https://www.instagram.com/elle.seals.events/
Bouquet	Florals	725 N 98th St	Omaha	Nebraska	Omaha and beyond	Floral design studio in west Omaha known for high-end weddings, large-scale installations and floral workshops.	details@bouquetomaha.com	402-905-0589	https://www.bouquetomaha.com/	https://www.instagram.com/bouquetomaha/
Ethereal Floral Studio	Florals		Omaha	Nebraska	Omaha metro and surrounding areas	Floral studio producing wedding florals in the Omaha metro, from bespoke installations to colourful whimsical tablescapes.			https://etherealfloralstudio.com/	https://www.instagram.com/etherealfloralstudio/
Janousek Florist	Florals	4901 Charles St	Omaha	Nebraska	Omaha, Nebraska	Family-owned Omaha flower shop open since 1913, doing wedding flowers alongside same-day delivery.		402-556-5652	https://janousekflorist.com/	
Ackerman Events	Music		Omaha	Nebraska	Omaha, Lincoln and Council Bluffs	DJ and MC service for weddings, with ceremony audio, reception DJ and dance floor lighting available.	Zach@ackermanevents.com	402-704-4187	https://www.ackermanevents.com/	https://www.instagram.com/ackermanevents/
Mitchell Wedding Services	Music		Elkhorn	Nebraska	Omaha area	Wedding and event DJ service with a professional MC, six-speaker sound system and dance floor lighting.	MitchellWeddingServices@gmail.com	402-917-8216	https://www.mitchellweddingservices.com/	https://www.instagram.com/mitchellweddingservices/
Image Entertainment	Music		Omaha	Nebraska	Omaha, Nebraska	Omaha DJ company covering both intimate gatherings and wedding receptions with hundreds of guests.	imageentertainment402@gmail.com	402-515-3569	https://www.imageentertainmentomaha.com/	
Abraham Catering	Catering		Omaha	Nebraska	Omaha and Lincoln	Four-generation family caterer, in business since 1951, with plated, buffet and station menus for weddings.			https://www.abrahamcatering.com/	https://www.instagram.com/abrahamcatering/
Attitude On Food	Catering	7758 Cass St	Omaha	Nebraska	Omaha and the Midwest	Full-service wedding and event caterer in Omaha since 2002, with fine-dining style menus at approachable prices.		402-341-3663	https://attitudeonfood.com/	https://www.instagram.com/attitudeonfood/
Patricia Catering & Cocktails	Catering		Omaha	Nebraska	Omaha, Bellevue, Papillion, La Vista, Gretna, Elkhorn, Council Bluffs and Lincoln	Omaha caterer since 1986 offering wedding menus plus a cocktail service across the metro and into Lincoln.	info@patriciacatering.com	402-733-6733	https://patriciacatering.com/	https://www.instagram.com/patriciacateringandcocktails/
Hannah Kuhary Makeup	Hair & Makeup		Omaha	Nebraska	Omaha, Nebraska	Omaha makeup artist who works onsite on wedding mornings and favours a modern, natural finish.	hannah.kuhary@gmail.com	952-807-2160	https://www.hannahkuhary.com/	https://www.instagram.com/hkmakeupartist/
Makeup by Madison	Hair & Makeup		Omaha	Nebraska	Omaha, Nebraska	Omaha bridal, event and commercial makeup artist who also helps wedding mornings run smoothly.	madison.schreffler@gmail.com		https://www.makeupxmadison.com/	https://www.instagram.com/makeupxmadisonne/
Model Perfect Airbrush	Hair & Makeup		Omaha	Nebraska	Omaha, with travel to wedding venues	Airbrush makeup and hair company that works at its Omaha location or travels to weddings for an added fee.	modelperfectairbrush@gmail.com		https://www.mpairbrush.com/	https://www.instagram.com/modelperfectairbrush/
Crum Cakes Bakery	Cake	763 N 114th St	Omaha	Nebraska	Omaha, Nebraska	Local Omaha bakery making custom cakes, cupcakes and treats designed around the couple's style.	crumcakesbakery@yahoo.com	402-850-5941	https://crumcakesbakery.com/	
Love More Sweets	Cake		Omaha	Nebraska	Omaha and across Nebraska	Pastry chef Kelsey Ryder makes bespoke wedding cakes with hand-sculpted sugar flowers and private tastings.	kelsey@lovemoresweetsomaha.com		https://lovemoresweetsomaha.com/	https://www.instagram.com/lovemoresweets/
Sweet Magnolias Bake Shop	Cake	813 N 40th St	Omaha	Nebraska	Omaha, Nebraska	Boutique bakery in the Joslyn Castle neighbourhood with a dedicated wedding cake order form and tastings.	sweetmagnoliasbakeshop@gmail.com	402-934-6427	https://www.sweetmagnoliasbakeshop.com/	https://www.instagram.com/sweetmagnoliasbakeshop/
Bobby Jay Films	Videography		Omaha	Nebraska	Omaha and Des Moines	Wedding videographer in Omaha making custom films that reflect each couple's own day, also travelling to Des Moines.	bobbyjayfilms@gmail.com		https://bobbyjayfilms.com/	https://www.instagram.com/bobbyjayfilms/
Heart & Light Co.	Videography		Omaha	Nebraska	Omaha and the Midwest	Documentary-style wedding films with an artful storytelling approach, aimed at luxury weddings in Omaha and beyond.	tess@heartandlightcompany.com		https://www.heartandlightcompany.com/	https://www.instagram.com/heartandlightcompany/
Vogel Films	Videography		Papillion	Nebraska	Omaha metro	Omaha-area wedding video company making custom films of the wedding day and other life's special moments.			https://www.vogelfilms.com/	
`,
  },
];

export default batches;
