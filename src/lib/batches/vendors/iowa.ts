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
Jene Beauty	Hair & Makeup	815 Office Park Rd, Suite 9	West Des Moines	Iowa	Des Moines metro	West Des Moines esthetician and makeup artist offering bridal makeup, lash services and lessons from a studio suite, with on-site work for wedding parties.		515-867-3430	https://www.jenebeauty.com/	https://www.instagram.com/jenebeauty__/
Feilmeier Films	Videography		Des Moines	Iowa	Des Moines, the Midwest and beyond	Des Moines filmmaker covering weddings alongside lifestyle, travel and commercial work, shooting around Iowa, the wider Midwest and farther afield.			https://www.feilmeierfilms.com/weddings	https://www.instagram.com/feilmeierfilms/
`,
  },
  {
    name: "Cedar Rapids: photography, planning, florals, music, catering, hair and makeup, cakes and videography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Rock Tai Photography	Photography		Cedar Rapids	Iowa	Cedar Rapids and Iowa City	A Cedar Rapids photographer and videographer covering weddings, engagements and wedding films, travelling beyond 20 miles for a fee.	rocktaiphotography@gmail.com		https://rocktaiphotography.com/	https://www.instagram.com/rocktaiphoto/
Unhinged Floral Co.	Florals		Cedar Rapids	Iowa	Cedar Rapids and beyond	A boutique Cedar Rapids wedding florist making whimsical, artistic pieces from unexpected textures and colour combinations.	unhingedfloral@gmail.com		https://www.unhingedfloral.com/	https://www.instagram.com/unhingedfloralco/
Ella Floral Design	Florals		Cedar Rapids	Iowa	Cedar Rapids, Iowa City, Marion, Galena and Eastern Iowa	A family-run boutique floral studio in Cedar Rapids designing lush, timeless wedding flowers across Eastern Iowa.	hello@ellabankblossoms.com		https://www.ellafloraldesign.com/	https://www.instagram.com/ellabankblossoms/
Zest Catering Company	Catering	5977 Mt. Vernon Rd SE	Cedar Rapids	Iowa	Cedar Rapids, Hiawatha, Marion, Iowa City, Coralville, West Branch and Anamosa	A Cedar Rapids caterer offering custom wedding menus from plated and family-style dinners to action stations and charcuterie.		319-261-1032	https://www.zestcateringco.com/	https://www.instagram.com/zestcateringco/
Peppercorn Food Company	Catering	101 3rd Ave SW	Cedar Rapids	Iowa	Eastern Iowa and western Illinois	A scratch-kitchen caterer with a downtown Cedar Rapids base and a second kitchen in Dubuque, serving weddings from simple to grand.	jude@peppercornfoodcompany.com	319-654-6044	https://www.peppercornfoodcompany.com/	https://www.instagram.com/peppercornfoodco/
Goldfinch Tap + Eatery	Catering		Marion	Iowa	Marion area	A Marion restaurant that offers drop-off and full-service catering and a private banquet space for wedding receptions.	hello@goldfinchtap.com	319-246-3238	https://www.goldfinchtap.com/	https://www.instagram.com/goldfinchmarion/
Madisen Timp Weddings	Photography		Cedar Rapids	Iowa	Iowa, with travel across the US	A husband-and-wife Cedar Rapids team shooting weddings as photo and video in digital, film and Super 8, with a documentary approach.	madisentimpweddings@gmail.com		https://madisentimpweddings.com/	
Whitepeak Films	Videography		Cedar Rapids	Iowa		A Cedar Rapids videography company making personal, cinematic wedding films alongside nonprofit documentaries and commercial video.	richie@whitepeakfilms.com	319-640-7663	https://whitepeakfilms.com/	https://www.instagram.com/whitepeakfilms/
Pretty Little Vows	Planning		Cedar Rapids	Iowa	Throughout Iowa	A Cedar Rapids wedding planning and coordination business offering full planning and day-of support to couples across Iowa.	support@prettylittlevows.com		https://www.prettylittlevows.com/	
Sugar Flower Cake Design	Cake		Cedar Rapids	Iowa		A Cedar Rapids cake studio making luxury wedding cakes and groom's cakes, known for hand-made sugar flowers.		319-491-1938	https://www.sugarflowercakedesign.com/	https://www.instagram.com/sugarflowercake101/
Take the Cake Desserts	Cake		Marion	Iowa	Eastern Iowa	A Marion dessert company making wedding cakes and dessert tables by appointment, with consultations by phone or in person.	ttcbusiness2020@gmail.com	319-382-2936	https://www.takethecakedesserts.com/	https://www.instagram.com/takethecakedesserts/
Classic Cakes By Design	Cake		Cedar Rapids	Iowa	Cedar Rapids and Marion	A Cedar Rapids cake bakery with around thirty years' experience making custom wedding cakes, cupcakes, sugar cookies and dessert bars.			https://classiccakesbydesign.com/	
Hydrangea Bloom	Florals		Tiffin	Iowa	Iowa City, Coralville, Cedar Rapids, Des Moines, Davenport and Dubuque	A Tiffin floral design studio, open since 2016, with the owner designing every wedding arrangement personally across the Iowa City corridor.	info@hydrangeabloom.com		https://www.hydrangeabloom.com/	https://www.instagram.com/hydrangeabloomia/
Bellefleur Productions	Videography		Iowa City	Iowa	Iowa City and the Midwest	A two-brother Iowa City team filming cinematic wedding films, combining film-making and event experience.	info@bellefleurproductions.com		https://www.bellefleurproductions.com/	https://www.instagram.com/bellefleurproductions/
Erin Allsup Photography	Photography		Cedar Rapids	Iowa	Cedar Rapids, Eastern Iowa and the Midwest	A Cedar Rapids wedding photographer capturing honest, romantic, film-inspired moments for couples across Eastern Iowa and beyond.			https://erinallsupphotography.com/	https://www.instagram.com/erinallsupphotography/
Iowa Party Starters	Music		Cedar Rapids	Iowa	Iowa	A Cedar Rapids DJ company offering affordable wedding music with event lighting, a photo booth and special effects.	iowapartystarters@gmail.com	319-487-4482	https://www.iowapartystarters.com/	https://www.instagram.com/iowaweddingdj/
Lindsey Michelle MUA	Hair & Makeup		Cedar Rapids	Iowa	Cedar Rapids, mainly on location	A freelance Cedar Rapids makeup artist who works mostly on location for weddings, offering natural but enhanced looks and trials.	lindsey.michelle.mua@gmail.com	319-775-0610	https://lindseymichellemua.com/	https://www.instagram.com/lindseymichellemua/
Vibrations DJ	Music		Cedar Rapids	Iowa	Cedar Rapids, Iowa City, Waterloo, Dubuque and Des Moines	A Cedar Rapids DJ service providing wedding and corporate entertainment across Eastern Iowa, built on repeat business and client referrals.	tony@vibrationsdj.com	319-721-9956	https://vibrationsdj.com/	
DJ Davin Titus	Music		Iowa City	Iowa	Iowa City and destination events	An Iowa City wedding DJ offering sound, dance-floor and uplighting, live mixing and emceeing, who began DJing at the University of Iowa.			https://www.davintitus.com/	https://www.instagram.com/dj_davin_titus/
Beauty Op by S. Mueller	Hair & Makeup	595 Ashley Ct	North Liberty	Iowa	Eastern Iowa and the Midwest	A North Liberty bridal beauty studio with a team of hair and makeup artists, serving Eastern Iowa and the wider Midwest.	beautyop@gmail.com		https://www.beautyopbysm.com/	https://www.instagram.com/beautyopbys.mueller/
Blackbird Events	Planning		Cedar Rapids	Iowa		A Cedar Rapids wedding and event planning business that also offers day-of coordination for couples wanting a stress-free day.	maggie@blackbird-events.com	319-521-0695	https://blackbirdevents.net/	https://www.instagram.com/blkbrdevents/
`,
  },
  {
    name: "Iowa City: florals, catering, hair and makeup, cakes and videography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Studio Bloom Iowa	Florals		Ely	Iowa	Cedar Rapids, Iowa City and East Central Iowa	Boutique wedding florist making garden-style bouquets, ceremony arches and centrepieces with specialty and local blooms, working since 2013.	tiffany@studiobloomiowa.com	319-423-9464	https://studiobloomiowa.com	https://www.instagram.com/studiobloomiowa/
Main Event Catering	Catering	1220 1st Avenue	Coralville	Iowa	Coralville, Iowa City, Cedar Rapids, Amana, Tiffin, West Branch, West Liberty, Solon and within about an hour	Full-service Coralville caterer offering plated entrees, buffets, barbecue and appetisers, with servers, set-up and teardown for weddings.		319-351-0645	https://www.maineventcatering.com/coralville-catering	
Amos Deans Catering	Catering	1829 Mehaffey Bridge Road NE	Solon	Iowa	Eastern Iowa	Scratch-kitchen caterer and food truck in Solon that cooks wedding banquets and plated dinners, and also runs The Exchange on Vine venue.	amosdeans@amosdeans.com	(319) 321-7779	https://www.amosdeans.com	https://www.instagram.com/amosdeansiowa/
Plated Table	Catering	625 S Dubuque St	Iowa City	Iowa	Iowa City area	Iowa City wine shop and event space that caters from-scratch seasonal menus and hosts wedding receptions at its South Dubuque Street home.	platedtable@gmail.com	319-200-3663	https://platedtablecatering.com	https://www.instagram.com/plated.table/
Bread Garden Market	Catering	225 S Linn Street	Iowa City	Iowa	Venues up to about 35 minutes from downtown Iowa City	Downtown Iowa City grocery and bakery whose kitchen team caters weddings, arriving at venues to set up and serve guests.	breadgardenmarketic@gmail.com	319-351-9119	https://breadgardenmarket.com	https://www.instagram.com/breadgardenmarket/
Catered By Charlotte	Catering	580 Hwy 1 West	Iowa City	Iowa	Iowa City, Coralville and surrounding areas	Iowa City caterer operating since 2000 that handles weddings and large events of any size, using fresh ingredients and a full service team.	info@cateredbycharlotte.com	319-321-1577	https://www.cateredbycharlotte.com	https://www.instagram.com/cateredbycharlotte/
Tru Salon	Hair & Makeup	2201 E Grantview Dr, Suite 100	Coralville	Iowa	Coralville, in salon or on location at the wedding	Coralville salon offering bridal hair and makeup in the salon or on location, with a dedicated wedding coordinator and tiered party experiences.	oakdale@tru-salon.com	319-354-2833	https://tru-salon.com	https://www.instagram.com/trusalonia/
Bespoke Beauty LLC	Hair & Makeup		Brooklyn	Iowa	Central and Eastern Iowa, including Cedar Rapids, Iowa City and Des Moines	Brooklyn-based bridal hairstylist who travels to venues across Iowa, known for frizz-free waves and modern buns.	bespokebeauty24@gmail.com		https://www.bespokebeautyllc.com	https://www.instagram.com/bespoke_beauty_llc/
Salon Voche	Hair & Makeup	5940 Rockwell Drive NE	Cedar Rapids	Iowa	Cedar Rapids, Coralville, Iowa City and Marion	Cedar Rapids salon that styles brides and their parties, with consultations and practice appointments before the wedding day.	info@salonvoche.com	(319) 554-9576	https://www.salonvoche.com	https://www.instagram.com/salonvoche/
Thompson & Co. Salon Parlor	Hair & Makeup		Iowa City	Iowa	Iowa City, Coralville and the Corridor	Iowa City salon offering wedding hair and bridal trials, with bridal parties limited to current or past salon guests and their families.		(319) 499-1041	https://thompsoncosalon.com	https://www.instagram.com/tcosalon/
Baked with Grace	Cake		Anamosa	Iowa	Cedar Rapids, Iowa City, the Corridor and the Quad Cities	Anamosa baker making buttercream-only floral wedding cakes, cupcake towers and dessert tables, with delivery available around eastern Iowa.	bakedwithgraceia@gmail.com	(319) 491-3533	https://bakedwithgrace-ia.com	https://www.instagram.com/bakedwithgrace.ia/
Iced Bakery	Cake	361 7th Ave	Marion	Iowa	Marion, Cedar Rapids, Hiawatha, Iowa City and surrounding areas	Made-to-order Marion bakery creating custom-designed cakes plus cookies, cupcakes and pies for weddings and other celebrations.		(319) 389-1328	https://www.icedbakeryllc.com	https://www.instagram.com/icedbakeryllc/
Tip Top Cakes	Cake		Iowa City	Iowa	Eastern Iowa	Iowa City baker creating custom wedding cakes and desserts for couples across eastern Iowa.			https://www.tiptopcakes.com	
Arbor + Light	Videography		Iowa City	Iowa	Weddings anywhere in Iowa and beyond, with travel fees past 60 miles	Husband-and-wife team in Iowa City filming cinematic wedding highlight films, with photography bundles and a lead filmmaker on every wedding.			https://www.arborandlight.com	https://www.instagram.com/arborandlight/
Diamond Label Films	Videography		Iowa City	Iowa	Iowa	Iowa City filmmaker making cinematic wedding films with an authentic storytelling approach, alongside engagement and wedding photography.	diamondlabelfilms@gmail.com		https://www.diamondlabelfilms.com	https://www.instagram.com/iowaweddingvideographer/
`,
  },
  {
    name: "Iowa City: photography, planning, florals and music",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Zak Cooper Photography	Photography		Iowa City	Iowa	Iowa City, the Midwest and destination weddings	Iowa City photographer and videographer covering weddings, engagements and proposals, and travelling across the Midwest.			https://www.zakcooperphotography.com/	https://www.instagram.com/zakcooperphotography/
Torey Rohde Photography	Photography		Iowa City	Iowa	Iowa City, willing to travel	Iowa City photographer shooting candid, documentary-style weddings and engagements, with Super 8 wedding films as an add-on.			https://toreyrohdephotography.com/	https://www.instagram.com/toreyrohde/
Storm Photo Co	Photography		Iowa City	Iowa		Husband-and-wife wedding photography team based in Iowa City, shooting timeless, relaxed coverage of the whole wedding day.			https://www.stormphotoco.com/	https://www.instagram.com/stormphotoco/
Soirée Wedding Planning	Planning		Iowa City	Iowa	Iowa City, Coralville and the wider Midwest	Iowa City planning team offering full-package planning, design, day-of coordination and help with rehearsal dinners and brunches.			https://soireeia.com/	https://www.instagram.com/soireeiowa/
E's Florals	Florals	101 Prairie Rose Ln, Unit 3	Solon	Iowa	Solon, Iowa City, Cedar Rapids, Coralville and North Liberty	Solon florist doing full-service wedding flowers and favours, with DIY bulk flower buckets and silk or dried options.	info@esflorals.com	319-624-3121	https://www.esflorals.com/	https://www.instagram.com/esflorals/
Sueppel's Flowers	Florals	1501 Mall Dr	Iowa City	Iowa	Iowa City, Coralville, North Liberty, Tiffin, Solon, West Branch and nearby towns	Iowa City flower shop making bridal bouquets, ceremony arches and centrepieces, with delivery, set-up and bulk flowers for DIY.	wecare@sueppels.com	(319) 351-1400	https://www.sueppels.com/wedding	https://www.instagram.com/sueppelsflowers/
Every Bloomin' Thing	Florals	418 10th Ave	Coralville	Iowa	Coralville, Iowa City, North Liberty and Tiffin	Coralville flower shop with a dedicated wedding flowers page and a separate wedding and event site for custom designs.		(319) 351-7242	https://www.everybloominthingiowacity.com/	https://www.instagram.com/everybloominthingiowacity/
It's Electric Entertainment	Music		Iowa City	Iowa	Iowa City, Johnson County, Des Moines, Cedar Rapids and destination weddings	Iowa City wedding DJ and MC team with reception games, timeline help, and cold spark, photo booth and lighting add-ons.			https://www.itselectricentertainment.com/	https://www.instagram.com/itselectricentertainment/
Massetone Entertainment	Music		Cedar Rapids	Iowa	Cedar Rapids, Iowa City, Coralville, North Liberty, Tiffin, Solon and eastern Iowa	Cedar Rapids wedding DJ with ceremony sound, custom DJ booths, uplighting, cold sparkler displays and a selfie-station photo booth.	aaron@massetone.com	(563) 340-2319	https://www.cedarrapidsdj.com/	https://www.instagram.com/massetoneentertainment/
JM3 DJs & Productions	Music		Iowa City	Iowa	Iowa City and eastern Iowa	Wedding DJ and MC company with an Iowa City team that mixes live, tailors music to the couple and travels to outlying venues.	events@jm3djs.com		https://jm3djs.com/locations/iowa-city/	https://www.instagram.com/jm3djs/
Twisted Mics	Music		Iowa City	Iowa	Iowa City, Cedar Rapids and the Quad Cities	Wedding DJ company with sound and lighting, optional photo booths and a dedicated event planner for each booking.			https://twistedmics.com/twisted-mics-iowacity/	https://www.instagram.com/twisted_mics/
Energy Wave Entertainment	Music		Cedar Rapids	Iowa	Eastern and central Iowa	Cedar Rapids DJ company playing weddings and corporate events across eastern and central Iowa, with sound and lighting.	info@energywavedj.com		https://energywavedj.com/	https://www.instagram.com/energywavedj/
`,
  },
  {
    name: "Cedar Rapids: planning, videography, hair & makeup, officiant, rentals and transportation",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Elizabeth Bliss Events	Planning		Cedar Rapids	Iowa	Cedar Rapids, Iowa City, Des Moines, Quad Cities and Eastern Iowa	An Iowa wedding planner offering full planning, partial planning and day-of coordination for couples in Cedar Rapids, Iowa City and across Eastern Iowa.	elizabethblissevents@gmail.com	(720) 466-9119	https://www.elizabethblissevents.com/	https://www.instagram.com/elizabeth_bliss_events/
Way Made Film & Photo	Videography		Cedar Rapids	Iowa	Eastern Iowa	A Cedar Rapids husband-and-wife team shooting documentary-style wedding video and photography that favours real moments over posed set-ups.	waymadefilmphoto@gmail.com		https://waymadefilmphoto.com/	https://www.instagram.com/waymadefilmphoto/
Acacia Salon & Spa	Hair & Makeup	1146 Blairs Ferry Rd NE #3	Cedar Rapids	Iowa	Cedar Rapids, Marion, Iowa City and Eastern Iowa	A Cedar Rapids salon offering bridal hair and airbrush makeup with trials, for the bride and her party, in the salon or on location at the venue.	acaciasalonandspacr@gmail.com	(319) 313-4727	https://www.acaciasalonandspacr.com/bridal	https://www.instagram.com/acaciasalonandspacr/
Iowa City Minister	Officiant		Iowa City	Iowa	Eastern Iowa, including Cedar Rapids, North Liberty and the Amana Colonies	A retired chaplain who officiates weddings across Eastern Iowa, with religious, spiritual or non-religious ceremonies and an online inquiry form.	chaplainhall@outlook.com	319-325-1194	https://www.iowacityminister.com/	
R & D Events Rental	Rentals		Cedar Rapids	Iowa	Cedar Rapids, Linn County, Hiawatha, Marion, Coralville and statewide	A Cedar Rapids rental company supplying tents, tables, chairs, linens, decor, portable bars and lighting for weddings, with layout planning help.	office@randdevents.com	319-202-8374	https://randdevents.com/weddings.php	https://www.instagram.com/r_and_d_events/
Black Diamond Limousine	Transportation	840 Liberty Way	North Liberty	Iowa	Cedar Rapids, Iowa City and Eastern Iowa	A North Liberty limousine company with wedding limo hire, serving Cedar Rapids, Iowa City and the wider region from its Liberty Way base.	dispatch@express-limos.com	319-208-3236	https://cedarrapidslimoservice.com/	`,
  },
  {
    name: "Iowa City: planning",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Unique Events of Iowa	Planning		Cedar Rapids	Iowa	The Midwest	A Cedar Rapids event company offering planning, day-of coordination, design, florals, rentals and DJ services for weddings and other events.			https://uniqueeventsiowa.com/	https://www.instagram.com/uniqueeventsiowa/`,
  },
  {
    name: "Fort Dodge: florals and photography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Becker Florist	Florals	1335 1st Ave N	Fort Dodge	Iowa	Fort Dodge and surrounding areas	Family-run Fort Dodge flower shop making wedding bouquets, centrepieces, corsages and boutonnieres, with local delivery in the area.	beckerflorists@gmail.com	(515) 576-1113	https://www.fortdodgeflowersandplants.com/	
Betsy Louise Designs	Photography	16 South 12th Street	Fort Dodge	Iowa		Fort Dodge photography studio offering wedding and engagement session packages alongside family and commercial work for local couples.		(515) 955-4870	https://www.betsylouisedesigns.com/	
Floral Creations Weddings & Events	Florals		Humboldt	Iowa		Boutique Humboldt florist designing ceremony and reception flowers, bouquets and personal flowers for weddings from intimate to large-scale.	fcreat2@gmail.com		https://floralcreationhumboldt.weddingday.pro/	https://www.instagram.com/floral.creations123/`,
  },
  {
    name: "Muscatine: photography and music",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Mississippi Pearl Photography	Photography	204 E 2nd St	Muscatine	Iowa	All of Iowa, including the Quad Cities, Iowa City and Des Moines	Muscatine studio photographing weddings and senior portraits across Iowa and the Quad Cities, with travel available for farther celebrations.	hello@misspearlphoto.com	563-265-1836	https://mississippipearlphotography.com/	https://www.instagram.com/iowaweddingphotographer/
Double A Sound	Music		Muscatine	Iowa	Muscatine, with travel to events	Muscatine DJ offering reception packages on a powerful sound system, plus ceremony music, karaoke and an optional photo booth.	stu@doubleasound.com	563-260-8537	https://www.doubleasound.com/	https://www.instagram.com/double_a_sound_djs/`,
  },
  {
    name: "Le Mars: cakes",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Habitué Coffeehouse & Bakery	Cake	108 Central Ave NE	Le Mars	Iowa	Le Mars, Sioux City, Sioux Falls and Omaha	Custom wedding cakes designed to match your colours and theme, with free tastings, delivery and set-up, plus cupcakes, cookies and mini desserts.	info@habituecoffee.com	712-546-4424	https://habituecoffee.com/wedding-cakes/	https://www.instagram.com/habituecoffee/`,
  },
  {
    name: "Cedar Rapids: videography, music and bridal and formalwear",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Dreamscape Weddings	Videography		Cedar Rapids	Iowa	Cedar Rapids, Iowa City and Eastern Iowa	Cedar Rapids photographer and videographer making full-day and highlight wedding films, with drone shots and video-only coverage on offer.		319-573-3857	https://dreamscapeweddings.com/	https://www.instagram.com/dreamscapewedding/
Center Stage Productions	Music		Cedar Rapids	Iowa	Cedar Rapids, Iowa City, Dubuque, Burlington, Des Moines and surrounding areas	Cedar Rapids wedding DJ and emcee service that also handles ceremony audio, lighting design and help with the day's timeline.		319-210-0607	https://centerstageproductionsdj.com/	https://www.instagram.com/centerstageproductionsdj/
Embody Bridal	Bridal & Formalwear	323 3rd St SE, Suite 100	Cedar Rapids	Iowa		Appointment-only Cedar Rapids bridal boutique stocking gowns across a wide range of sizes and styles, from about $1,500 to $4,500.	hello@embodybridal.com	319-536-1816	https://www.embodybridal.com/	https://www.instagram.com/embodybridal/
D'Luxe Tux	Bridal & Formalwear	1960 51st St NE	Cedar Rapids	Iowa		Cedar Rapids tuxedo and suit shop renting or selling formalwear for wedding parties, with free colour swatches and home try-ons.		319-393-4298	https://dluxe-tux.com/	
Merci's Tailoring	Bridal & Formalwear	2020 Sylvia Ave NE, Unit A	Cedar Rapids	Iowa		Cedar Rapids tailoring studio that alters wedding gowns and formalwear, and offers wedding dress consultations.		319-377-0751	https://www.mercistailoring.com/	https://www.instagram.com/mercis.tailoring/`,
  },
  {
    name: "Iowa City: hair and makeup",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Morgan Lorraine Makeup Artistry	Hair & Makeup		Iowa City	Iowa	Eastern Iowa	Iowa City makeup artist for weddings and photoshoots, with a soft-to-medium glam look and a glowy finish; travels across Eastern Iowa.			https://www.morganlmua.com/	https://www.instagram.com/morganlmua/`,
  },
  {
    name: "Des Moines: planning",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Jade + Ivy Events	Planning		Des Moines	Iowa	Des Moines, with travel for other events	Des Moines planning company offering full and partial planning, day-of coordination, and design with rentals.	jadeandivyevents@gmail.com	515-460-6403	https://jadeandivyevents.com/	https://www.instagram.com/jadeandivyevents/
Honey & Joy Events	Planning	2701 SE Convenience Blvd, Suite 2	Ankeny	Iowa	Des Moines, Cedar Rapids and Iowa City	Ankeny studio offering wedding planning with floral and event design, for romantic, heartfelt celebrations across central and eastern Iowa.	karla@honeyandjoyevents.com	515-372-4697	https://honeyandjoyevents.com/	https://www.instagram.com/honeyandjoyevents/`,
  },
  {
    name: "Quad Cities: planning and photography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Bright DeSigns	Planning		Bettendorf	Iowa	Quad Cities and Iowa City regions, travelling on request	Bettendorf planner and designer providing full wedding planning, vendor management and day-of execution, mainly for the Quad Cities and Iowa City.	BrightDesignsIowa@gmail.com	563-370-5440	http://www.brightdesignsiowa.com/	https://www.instagram.com/brightdesignsiowa/
Wiz of Oz Photography	Photography		Davenport	Iowa	The Quad Cities and beyond	Davenport studio shooting weddings, engagements and portraits around the Quad Cities on both sides of the Mississippi.		563-726-5040	https://www.wizofozphotography.com/	https://www.instagram.com/wizofozphoto/
Giraffe Photography	Photography		Davenport	Iowa	Quad Cities and Davenport	Davenport photography business led by Stephen Folker, covering weddings alongside family, corporate and film production work.		309-738-2329	https://www.giraffephoto.com/	https://www.instagram.com/giraffephotography/`,
  },
  {
    name: "Ames: bridal and formalwear, rentals and cakes",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Pure Bridal	Bridal & Formalwear	306 South 16th St	Ames	Iowa		Ames bridal shop selling wedding dresses from designers including Essense of Australia, Morilee and Stella York, plus accessories.		515-663-2222	https://www.purebridaliowa.com/	https://www.instagram.com/purebridal/
Celebrations Party & Rental Store	Rentals	320 S 3rd St	Ames	Iowa		Ames party and event rental store hiring out furniture, linens, decor and centrepieces, with items that can be reserved online.	celebrationsames@yahoo.com	515-268-9333	http://celebrationsames.com/	https://www.instagram.com/celebrations_ia/
Van Hemert's Dutch Oven Bakery	Cake	219 Duff Ave	Ames	Iowa	Ames and Boone	Ames and Boone bakery known for its award-winning cakes, including wedding cakes, alongside a cafe menu.		515-232-9244	https://dutchovenbakeryiowa.com/	https://www.instagram.com/dutchovenbakeryboone/`,
  },
  {
    name: "Waterloo and Cedar Falls: music",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Ultimate Entertainment	Music		Cedar Falls	Iowa	Iowa	Cedar Falls DJ company that also offers photo booths, decorative lighting, decorating and day-of coordination for weddings.		319-266-0717	https://www.ultimateentertainment.cc/	https://www.instagram.com/uecf/`,
  },
  {
    name: "Dubuque: photography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Seeley Photography	Photography	236 Main St	Dubuque	Iowa	Dubuque, Cedar Rapids and Madison, plus Galena and surrounding areas	Dubuque wedding and portrait studio on Main Street, photographing weddings since 2006 across Iowa, Illinois and Wisconsin.	seeleyphotography@sarahseeley.com	563-581-6367	https://www.sarahseeley.com/	`,
  },
];

export default batches;
