import type { VendorBatch } from "@/lib/vendor-batches";

// North Dakota vendor batches. Every row's State is "North Dakota". Add new batches at the end.
const batches: VendorBatch[] = [
  {
    name: "Fargo: photography, planning, florals, music, catering, hair and makeup, cakes and videography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Abby Anderson Photography	Photography		Fargo	North Dakota	Fargo, ND and Moorhead, MN	Fargo wedding and portrait photographer with a classic, light-led style aimed at couples who want timeless rather than trendy images.			https://abbyanderson.com/	https://www.instagram.com/abbyanders/
Chelsea Joy Photography	Photography		Fargo	North Dakota		Fargo wedding photographer who works with couples who want a personal day rather than a standard wedding template, in a bright, colour-true style.	chelseajoyphoto@gmail.com		https://chelseajoyphoto.com/	https://www.instagram.com/chelseajoyphotography/
Willow + Rose Photo	Photography		Fargo	North Dakota	North Dakota and Minnesota	Fargo photographer covering weddings alongside portraits, families and milestones, with a storytelling approach to the day.			https://willowandrosephoto.com/	https://www.instagram.com/willowandrose.photo/
Gather Event Planning	Planning		Fargo	North Dakota		Fargo planner offering full-service, partial planning and day-of coordination so couples can be guests at their own wedding.			https://www.plantogather.com/	https://www.instagram.com/plantogather/
Breathe and Relax Events	Planning		Fargo	North Dakota		Fargo wedding planner, designer and day-of coordinator, taking on anything from a single day of coordination to full planning.			https://breatheandrelaxevents.com/	https://www.instagram.com/breatheandrelaxevents/
Say Less Events Co.	Planning		Fargo	North Dakota		Two Fargo coordinators who step in to settle final details and run the wedding day itself, for couples who have planned the rest.	saylesseventsco@gmail.com		https://www.saylesseventsco.com/	https://www.instagram.com/saylesseventsco/
Love Always Floral	Florals	1120 Northern Pacific Ave	Fargo	North Dakota	Fargo and beyond	Fargo studio founded in 2016 making airy, garden-style wedding flowers and installations, working by appointment.	fargo@lovealwaysfloral.com	(701) 205-8710	https://lovealwaysfloral.com/pages/weddings	https://www.instagram.com/lovealwaysfloral/
Shotwell Floral & Greenhouse	Florals	4000 40th St S	Fargo	North Dakota	Fargo, Moorhead, Dilworth, Horace, Oxbow, Hickson and West Fargo	Long-running Fargo florist and greenhouse that also designs wedding and event flowers alongside its everyday deliveries.		(701) 356-9377	https://www.shotwellflorist.com/services/weddings/	https://www.instagram.com/shotwell_floral/
Classic Floral	Florals	29 Sheyenne St	West Fargo	North Dakota	Fargo, West Fargo, Horace, Harwood and Moorhead	West Fargo flower shop offering customisable wedding packages with bouquets and centrepieces made by hand.		701-281-0767	https://westfargoflowers.com/pages/wedding-page	https://www.instagram.com/classicfloralwf/
Powerplay DJ	Music	4151 38th St S Ste C	Fargo	North Dakota	Fargo-Moorhead, Bismarck and across North Dakota, South Dakota and Minnesota	Fargo DJ company with a second base in Bismarck, also supplying karaoke, photo booths and casino nights for wedding receptions.			https://www.powerplaydj.com/	https://www.instagram.com/powerplaydj/
Midnight Express DJs	Music		Fargo	North Dakota	North Dakota, western Minnesota and into Montana	Family-run wedding DJ service going since 1980, quoting plain pricing with no hidden fees and covering Fargo-Moorhead.	tylerexpressdj@gmail.com	(701) 773-6805	https://mexpressdjs.com/	https://www.instagram.com/midnightexpressdj/
GO DJ Eventz	Music		Fargo	North Dakota	North Dakota, South Dakota and Minnesota	Fargo DJ with more than fifteen years behind the decks, supplying sound systems for weddings, corporate events and private parties.	godjeventz@gmail.com	701-999-2098	https://www.godjeventz.com/	
Brew Catering & Events	Catering	635 2nd Ave N	Fargo	North Dakota	Fargo, Moorhead, Wahpeton and surrounding area	Chef-led Fargo caterer with custom menus, specialty buffets and event planning help for weddings among its event types.	events@brewcatering.com	701-369-0333	https://www.brewcatering.com/	https://www.instagram.com/brewcatering/
Savory Catering	Catering	3803 13th Ave S	Fargo	North Dakota	Fargo-Moorhead and beyond	Catering arm of a Fargo hotel, making familiar dishes with extra depth of flavour and custom menus for weddings and other events.	sales@savoryfargo.com	701-277-7353	https://www.savorycateringfargo.com/	https://www.instagram.com/savorycateringfargo/
Artistry Fargo	Hair & Makeup	705 13th Ave E	West Fargo	North Dakota		West Fargo bridal hair and airbrush makeup team that sends two or more stylists at no extra charge, in salon or on location.		701-353-8073	https://artistryfargo.com/weddings	https://www.instagram.com/artistryfargo/
Artistry by Kimberly	Hair & Makeup		Fargo	North Dakota	Fargo-Moorhead, travelling through the Midwest and beyond	Fargo makeup artist for brides who want refined, editorial looks that photograph naturally and last through a long wedding day.			https://www.artistrybykimberly.com/	https://www.instagram.com/artistrybykimberly/
Cassandra L. Hair Studio	Hair & Makeup		West Fargo	North Dakota		West Fargo master cosmetologist doing bridal and special-event hair and makeup, either in the studio or on location.			https://cassandralhairstudio.com/bridal-hair-and-makeup/	https://www.instagram.com/hairbycassl/
Nichole's Fine Pastry & Café	Cake	13 8th St S	Fargo	North Dakota	Fargo-Moorhead, with limited out-of-town delivery	Downtown Fargo bakery and restaurant of over twenty years making custom wedding cakes with European baking traditions.		(701) 232-6430	https://nicholesfinepastry.com/bakery/wedding-events/	https://www.instagram.com/nicholesfinepastry/
Tartan Rose Bakery	Cake		Fargo	North Dakota		Fargo bakery, formerly Love in the Oven, baking custom wedding cakes and desserts from scratch in small batches since 2010.	hello@tartanrosebakery.com		https://www.tartanrosebakery.com/	
Meadowlark Films	Videography		Fargo	North Dakota	Fargo, Minnesota and destination weddings	Fargo wedding film team, founded in 2019, making documentary-style heirloom films built around candid, emotional moments.			https://www.meadowlarkfilms.com/	
Karied Away Video	Videography		Fargo	North Dakota	North Dakota, Minnesota and South Dakota	Fargo wedding videographer offering storytelling films with attention to small details, from highlight reels to full ceremonies.	hello@kariedawayvideo.com		https://kariedawayvideo.com/	https://www.instagram.com/kariedawayvideo/
Eclipse Multimedia & Video	Videography		Fargo	North Dakota		Fargo video company with years of wedding experience, offering tiered ceremony packages with multiple cameras, plus reception coverage.	amy@eclipsemulti.com	(701) 200-9552	https://www.eclipsemulti.com/	
`,
  },
  {
    name: "Fargo: catering and cakes",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
457 Cake	Cake		Fargo	North Dakota	Fargo-Moorhead and surrounding area	Fargo cake decorator making custom cakes, cupcakes and treats for weddings and other events, with delivery around Fargo-Moorhead.	jamie@457cake.com	(701) 552-2469	https://457cake.com/	https://www.instagram.com/457cake/
Spitfire Bar & Grill	Catering	1660 13th Ave E	West Fargo	North Dakota	Fargo-Moorhead	West Fargo wood-fired and smoked BBQ restaurant whose catering team also serves weddings and rehearsal dinners around Fargo-Moorhead.		701-478-8667	https://spitfirebarandgrill.com/catering/west-fargo-catering/	
`,
  },
  {
    name: "Bismarck: planning, florals, photography, videography, hair and makeup and catering",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Behind the Scenes Events	Planning		Bismarck	North Dakota	Bismarck, Fargo and destination weddings	Bismarck wedding planning and month-of coordination team, who also plan honeymoons and destination weddings for North Dakota couples.		701.401.2218	https://behindthescenesevents.net/	https://www.instagram.com/behind.the.scenes.events/
Enticed Bismarck	Planning		Bismarck	North Dakota	Bismarck and Mandan	Full-service wedding and event coordinator handling vendors, budgets, decor set-up and tear-down, with DJ and venue options in Mandan.	enticed.bismarck@gmail.com	701-220-7548	https://www.enticedbismarck.com/	
Mini Blooms by Emil	Florals		Bismarck	North Dakota	Bismarck and beyond	Bismarck florist designing garden-inspired, colourful wedding bouquets, ceremony installations and centrepieces with a touch of whimsy.		701-226-5312	https://minibloomsbyemil.shop/	https://www.instagram.com/minibloomsbyemil/
BWeis Media Weddings	Videography		Bismarck	North Dakota	North Dakota and beyond	Bismarck wedding videographer making story-driven films, limiting bookings to a small number of weddings each year.	bweisbeck@bweismedia.com		https://bweismediaweddings.com/	https://www.instagram.com/bweismedia/
TraceLynn Films	Videography		Bismarck	North Dakota	North Dakota, South Dakota, Minnesota and Montana	Bismarck videographer creating personalised, creative wedding films for couples across the northern plains states.	tracelynnfilms@gmail.com		https://www.tracelynnfilms.com/	https://www.instagram.com/tracelynnfilms/
Great Plains Sound and Media	Videography		Bismarck	North Dakota	Bismarck and North Dakota	Bismarck production collective, established 2023, offering wedding videography with drone footage alongside DJs, live audio and photography.			https://greatplainssound.com/	https://www.instagram.com/greatplainssound/
Paper Hands Media	Photography		Bismarck	North Dakota	Bismarck and North Dakota	Bismarck photographer and videographer documenting weddings with a warm, emotional and personality-led style.	quinnlyn.nelson@gmail.com		http://paperhandsmedia.com/	
Jessica Heller Photography	Photography		Bismarck	North Dakota	Bismarck and North Dakota	Bismarck photographer with 15 years behind the camera, shooting weddings, seniors and families with a relaxed, fun approach to bridal parties.	JessicaHellerPhotography@gmail.com		https://jessicahellerphotography.com/	https://www.instagram.com/jessicahellerphotography/
ily Studios	Photography		Bismarck	North Dakota	Bismarck and North Dakota	Bismarck photographer specialising in weddings, couples and boudoir sessions, with a photobooth available for receptions.			https://www.ilystudios.co/	https://www.instagram.com/ily.studios/
Leyla Alleyne	Photography		Bismarck	North Dakota	Bismarck and Mandan	Bismarck-Mandan wedding, boudoir and portrait photographer who publishes her wedding investment pricing online.			https://www.leylaalleyne.com/	https://www.instagram.com/leyladwellephotography/
Desirae's Makeup & Beauty Lounge	Hair & Makeup		Bismarck	North Dakota	Bismarck	Bismarck makeup studio and beauty shop offering professional makeup applications and dedicated bridal makeup for wedding days.		(701) 751-2312	https://www.desiraesbeautylounge.com/	https://www.instagram.com/desiraesbeautylounge/
Evolve Salon and Spa	Hair & Makeup	1001 West Interstate Avenue, Suite 100	Bismarck	North Dakota	Bismarck	Bismarck salon acting as bridal headquarters, with makeup application and updos for the bride and wedding party.	evolvebismarck@hotmail.com	701-751-7990	https://www.evolvesalonbismarck.com/	https://www.instagram.com/evolvebismarck/
Eden's Edge Salon	Hair & Makeup		Bismarck	North Dakota	Bismarck	Independent Bismarck hairstylist and makeup artist offering colour, cuts and wedding-day hair and makeup.			https://www.edensedgesalon.com/	https://www.instagram.com/edensedgesalon/
Mabel's All Day	Catering		Bismarck	North Dakota	Bismarck	Bismarck food truck serving classic American staples, with mobile catering for weddings, rehearsal dinners and community gatherings.	hello@mabelsallday.com		https://www.mabelsallday.com/	https://www.instagram.com/mabelsallday/
`,
  },
  {
    name: "Bismarck: catering, florals, desserts, photo booth and bridal",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Anima Cucina	Catering	101 N 5th St	Bismarck	North Dakota	Bismarck	Downtown Bismarck Italian restaurant that also caters, from pastry and sandwich platters to hot buffets with delivery, setup and optional on-site staff.		(701) 751-1738	https://www.animacucina.com/	https://www.instagram.com/anima_cucina/
Laughing Sun Brewing	Catering	1023 East Front Ave	Bismarck	North Dakota		Bismarck brewery and BBQ restaurant that caters, with smoked meats, sides and salads plus its own beer for events.		701-751-3881	https://laughingsunbrewing.com/	https://www.instagram.com/laughingsunbrewing/
Roberts Floral & Gifts	Florals	210 N 8th St	Bismarck	North Dakota		Family-run Bismarck florist and gift shop that takes wedding and event flower orders by phone alongside its everyday arrangements.		701-258-8311	https://www.robertsfloral.com/	https://www.instagram.com/robertsfloral/
Just Desserts by Jessie	Desserts		Bismarck	North Dakota		Bismarck home-based bakery making baklava and baklava cheesecake in several flavours, with wedding dessert packages sized to the guest count.	justdessertsbyjessie@outlook.com		https://justdessertsbyjessie.com/	
KZ PhotoBooth	Photo Booth		Bismarck	North Dakota	North Dakota and beyond	Bismarck photo booth company with a DSLR studio booth, a 360-degree slow-motion video booth and a digital drop-off station, staffed at events.		(701) 400-2366	https://www.kzphotobooth.com/	https://www.instagram.com/kzphotobooth/
Bridal n' More	Bridal & Formalwear	115 North 4th Street	Bismarck	North Dakota		Locally owned downtown Bismarck bridal shop with a private bridal suite, gowns in sizes 6 to 26 in stock, and help with wedding timelines.		(701) 223-9742	https://www.bridalnmorebismarck.com/	https://www.instagram.com/bridal_n_more/
`,
  },
  {
    name: "Fargo: music, photography, florals, hair and makeup, decor, officiant, videography and photo booth",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Chris Argenziano Guitar	Music		Fargo	North Dakota	Within 200 miles of Fargo	Classical and acoustic guitarist, plus jazz duos and trios, for wedding ceremonies, cocktail hours and relaxed reception background music.	tophergenz@gmail.com	(701) 205-7894	https://www.eventmusicbychris.com/	https://www.instagram.com/tophergenz/
The Archers	Photography		Fargo	North Dakota	Fargo-Moorhead and beyond	Husband-and-wife team shooting wedding photography and film, alone or bundled, with albums and artwork made to be handed down.	hello@thearchers.studio		https://www.thearchers.studio/	https://www.instagram.com/thearchers.studio/
Floret + Foliage	Florals	5229 51st Ave S, Unit 1	Fargo	North Dakota		Fargo flower shop and studio designing wedding bouquets and event flowers, with delivery, setup, workshops and wearable florals.			https://floretandfoliage.com/	https://www.instagram.com/floretandfoliage/
Faces by Lizzie	Hair & Makeup		Fargo	North Dakota	The Midwest	Solo makeup artist for brides and events, known for soft glam looks, with bridal trials, lashes, lip colour matching and one-to-one lessons.			https://www.facesbylizzie.com/	https://www.instagram.com/facesbylizzie/
Party Rae Balloon Co.	Decor & Lighting		Fargo	North Dakota		Custom balloon garlands, arches and columns for bridal showers and wedding celebrations, with delivery and installation around Fargo.			https://www.partyraeballoonco.com/	https://www.instagram.com/partyraeballoonco/
Love Always Weddings and Parties	Officiant		Fargo	North Dakota	Fargo-Moorhead	Fargo officiant who also hires out tables and chairs, with delivery and optional setup, so ceremony and reception basics come from one team.		(218) 422-6202	https://lovealwaysrentals.com/	https://www.instagram.com/lovealwaysrentals/
Lily Brundin Photos	Photography		Fargo	North Dakota	Fargo, Minnesota and destination elopements	Photographer focused on micro-weddings and elopements, from Fargo and Minnesota ceremonies to destination locations such as Big Sur and Glacier.			https://lilybrundinphotos.com/	
A to Z Creative	Videography		Fargo	North Dakota	North Dakota and beyond	Wedding videographer making cinematic, documentary-style films with a personal approach and regular check-ins before the day.			https://atozcreativend.com/	https://www.instagram.com/atozcreativend/
Odie Booth	Photo Booth		Fargo	North Dakota	Fargo-Moorhead	Husband-and-wife photo booth rentals offering a polished glam booth or a simple selfie station, with custom overlays and instant sharing.	theodiebooth@gmail.com		https://www.odiebooth.co/	https://www.instagram.com/odie.booth/
Boothworks	Photo Booth		Fargo	North Dakota	Eastern North Dakota and western Minnesota	Locally owned, full-service photo booth hire with props, backdrops, custom overlays, instant sharing and an attendant for every event.	steffan@boothworksphoto.com	406-489-1563	http://boothworksphoto.com/	
Pirate Radio Productions	Music		West Fargo	North Dakota		Mobile DJ and production company with set wedding packages, uplighting, a photo booth add-on and rental sound and lighting equipment.		701-799-5672	https://www.pirateradio.productions/	
`,
  },
  {
    name: "Grand Forks: photography, florals and music",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Shelby Rae Photography	Photography		Grand Forks	North Dakota	Grand Forks and beyond	Wedding and portrait photographer who builds a relationship with each couple, covering engagement sessions and the full wedding day.	shelbyrae.contact@gmail.com		https://www.shelbyrphoto.com/	https://www.instagram.com/shelbyrae_photo/
Love Grows & Co	Photography		Grand Forks	North Dakota	Fargo and beyond	Wedding photographer mixing documentary coverage with film, telling the day from the quiet morning through to the last dance.			https://lovegrowsphoto.com/	https://www.instagram.com/lovegrowsphoto/
Dragon Rose Photography	Photography		Grand Forks	North Dakota	Grand Forks and beyond	Faith-led storytelling photographer based near Grand Forks, shooting golden-hour weddings alongside family and senior sessions.			https://dragonrosephotography.com/	https://www.instagram.com/dragonrosephoto/
MJD Photography	Photography		Grand Forks	North Dakota	Greater Grand Forks area	Photographer covering weddings, seniors, families, headshots and events around Greater Grand Forks and the nearby Minnesota side.	mjdphotographygrandforks@gmail.com	612-229-2225	https://www.mjd-photography.com/	
Jalen Nicole Floral	Florals	7 North 3rd St	Grand Forks	North Dakota		Downtown Grand Forks florist offering wedding and event design, trained in floral design and repeatedly voted the city's top florist.	jalen@jalennicolefloral.com		https://www.jalennicolefloral.com/	https://www.instagram.com/jalennicolefloral/
Flowers By Us	Florals		Grand Forks	North Dakota		Family-owned Grand Forks flower shop with ceremony and reception wedding collections and bookable floral consultations.			https://flowersbyus.com/	
BlueJ Entertainment	Music		Grand Forks	North Dakota		Grand Forks wedding DJ with more than 60 weddings behind him, offering custom-mixed playlists and high-energy dance sets.	jay@bluejentertainment.com	701-202-4733	https://www.bluejentertainment.com/	https://www.instagram.com/bluejentertainment.nd/
`,
  },
  {
    name: "Minot: florals and catering",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Pockets Full of Posies	Florals	316 5th Ave NE	Minot	North Dakota		Minot florist with a boho, dried and preserved flower style, taking wedding enquiries through a bridal form and offering workshops.	pocketsfullofposiesnd@gmail.com	701-240-0162	https://www.pocketsfullofposiesnd.com/	
Hometown Elegance Event Catering & Productions	Catering		Minot	North Dakota	Minot area	Event caterer with on-site cooked menus plus decor, draping, linens, rentals and day-of coordination, for weddings large or small.		701-420-0990	https://www.hometownelegance.com/	
Flower Box	Florals	301 W Burdick Expy	Minot	North Dakota		Independent Minot florist since 1972, with a wedding flowers page covering bridal bouquets, attendants' flowers and boutonnieres.	wecare@flowerboxnd.com	(701) 838-9302	https://www.flowerboxnd.com/wedding	https://www.instagram.com/flowerboxminot/
Lexi Lou Florals	Florals	1900 4th Ave NW	Minot	North Dakota		Small Minot flower shop and studio with a storefront, making wedding bouquets and tablescapes as well as sympathy work.			https://shoplexilou.com/	https://www.instagram.com/flowersbylexilou/
`,
  },
  {
    name: "Bismarck: music, transportation, rentals, decor & lighting and florals",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Midnight Express DJs - Bismarck	Music		Bismarck	North Dakota	Bismarck, Mandan and central North Dakota	Family-run Bismarck DJ and MC service operating since 1980, which also supplies its own PA system for live bands and ceremonies.	MidnightExpressBismarck@gmail.com	(701) 690-9591	https://www.midnightexpressbismarck.com/	
BeLoud Entertainment	Music		Bismarck	North Dakota	Bismarck-Mandan, including Sterling, Wilton and New Salem	Bismarck-Mandan mobile DJ company with more than 700 weddings and events behind it, offering clients an online planner for music and timings.		701-214-6271	https://beloudentertainment.com/	
Nightlife Music	Music	1505 East Main Avenue	Bismarck	North Dakota	Bismarck and Mandan	Bismarck music store whose Azure Blue DJ service covers weddings in Bismarck and Mandan, alongside sound and lighting hire.	sales@nightlifemusic.com	701-222-0202	https://www.nightlifemusic.com	https://www.instagram.com/nightlife_music_store/
Nightlife Limousine	Transportation	1505 East Main Avenue	Bismarck	North Dakota	Bismarck and Mandan	Bismarck limousine company for bridal parties, adding dry-ice first-dance fog, confetti cannons, venue uplighting and sound and lighting hire.	rick@nightlifemusic.com	701-222-0202	https://www.nightlifelimousine.com/wedding-1	https://www.instagram.com/nightlife_limousine_official/
Dreamt Events & Rentals	Decor & Lighting		Bismarck	North Dakota		Bismarck decorator offering event design, full-service decorating and tear-down, speaker rentals and day-of coordination for weddings and other events.	dreamt.events.rentals@gmail.com	719-464-9470	https://www.dreamt-events.com/	
The Event Design Agency	Decor & Lighting	1603 East Main Ave	Bismarck	North Dakota		Bismarck decor team offering ceremony, reception and ceiling decor plus a full package, run as the in-house brand of Sixteen03 Main Events.		701.255.6246	https://www.ndeventdesign.com	https://www.instagram.com/ndeventdesign/
Beyond the Blooms	Florals	517 E. Main St Ste. B	Mandan	North Dakota	Mandan and surrounding areas	Mandan flower shop with dedicated pages for wedding bouquets, wedding party flowers, ceremony flowers and reception flowers.		(701) 255-3312	https://www.beyondtheblooms.net/	`,
  },
  {
    name: "Bismarck: photography, catering",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Twelve9 Photography	Photography		Bismarck	North Dakota	North Dakota	Wedding and elopement photographers based in Bismarck, taking bookings across North Dakota and for destination weddings.			https://twelve9photo.com/	https://www.instagram.com/twelve9.photo/
Sixteen03 Main Events	Catering	1603 East Main Ave	Bismarck	North Dakota		Bismarck caterer and event space offering full-service wedding catering and a rental price guide, with an online catering menu.	info@sixteen03mainevents.com	701-255-6246	https://www.sixteen03mainevents.com/	
`,
  },
  {
    name: "Bismarck: planning",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
White Lace Events	Planning	202 E Broadway Ave	Bismarck	North Dakota	Bismarck, Fargo, Dickinson, Grand Forks, Medora and Rapid City	Planning arm of a Bismarck bridal boutique, offering month-of coordination through to full planning, plus guided bouquet-making sessions.	whitelacebridalnd@gmail.com	(701) 258-4142	https://www.whitelacebridalnd.com/	https://www.instagram.com/whitelacebridalnd/
`,
  },
];

export default batches;
