import type { VendorBatch } from "@/lib/vendor-batches";

// Montana vendor batches. Every row's State is "Montana". Add new batches at the end.
const batches: VendorBatch[] = [
  {
    name: "Bozeman: photography, planning, florals, music, catering, hair and makeup, cake and videography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Jessie Moore Photography	Photography	111 S. Grand studio 224	Bozeman	Montana	Bozeman, Montana and the surrounding region	Wedding and engagement photographer with nearly 20 years of experience, working from a downtown Bozeman studio.	jessie@jessiemoorephotography.com	406-396-2567	https://www.jessiemoorephotography.com/	https://www.instagram.com/jessiemoorephotography/
Merissa Lambert Photography	Photography		Bozeman	Montana	Montana and beyond, including destination weddings	Bozeman wedding and elopement photographer shooting in a documentary and styled mix since 2009.			https://merissalambert.com/	https://www.instagram.com/merissalambertphotography/
Alyssa Johnson Photography	Photography		Bozeman	Montana	Montana and beyond, including destination weddings and elopements	Bozeman photographer covering weddings and elopements in a candid, documentary style, plus couples and family sessions.	AlyssaJohnsonPhotoMT@gmail.com	(406) 579-7628	https://alyssajohnsonphotography.com/	https://www.instagram.com/alyssajohnson_photography/
Aly Kaufman Photography	Photography		Bozeman	Montana	Bozeman and Montana, including Big Sky, Missoula, Whitefish and Glacier	Bozeman wedding and elopement photographer with a light-filled, timeless style, also offering family and boudoir sessions.			https://www.alykaufmanphotography.com/	https://www.instagram.com/alykaufmanphotography/
Well Wed Montana	Planning		Bozeman	Montana	Montana mountain wedding venues	Bozeman planning company handling venue selection, florals, catering and full production for mountain weddings.	joe@wellwedmontana.com		https://www.wellwedmontana.com/	https://www.instagram.com/wellwedmontana/
Bijou Weddings by Design	Planning		Bozeman	Montana	Montana and destination weddings	Bozeman planning and design firm offering bespoke, highly personalised wedding planning since 2016, including destination events.			https://bijouweddingsbydesign.com/	
Prairie and Peak Events	Planning		Bozeman	Montana	Montana destination weddings	Bozeman planner running multi-day destination weddings, with venue coordination, vendor management and event design.	ryan@prairieandpeakevents.com		https://www.prairieandpeakevents.com/	
Poppy & August	Florals	1285 North Rouse Avenue Suite 1D	Bozeman	Montana		Bozeman flower shop doing full-service weddings and prix fixe wedding florals with no contracts or minimums.	hello@poppyaugustflorals.com	(406) 209-7732	https://poppyaugustflorals.com/	https://www.instagram.com/poppy_and_august/
Florally	Florals		Bozeman	Montana	Bozeman and Big Sky, Montana, and beyond	Wedding and event florist designing classic, organic and romantic arrangements for Bozeman and Big Sky venues.		(406) 539-9951	https://www.florallybozeman.com/	https://www.instagram.com/florally.bozeman/
The Flower Bar	Florals	875 Bridger Drive Unit G	Bozeman	Montana	Bozeman, Big Sky and Paradise Valley	Bozeman floral studio offering full-service wedding florals and a la carte options for southwest Montana weddings.	hello@theflower.bar		https://www.theflower.bar/	
Joe's DJ Service	Music		Belgrade	Montana	Bozeman, Gallatin Valley, Big Sky and across Montana and northern Wyoming	Mobile DJ company focused on weddings across the Gallatin Valley, with more than 3,000 weddings played to date.	joesmobiledj@gmail.com	(406) 624-9756	https://www.joesdj.com/	https://www.instagram.com/joesdjservice/
Savvy	Music		Bozeman	Montana	Bozeman, Big Sky, Paradise Valley and greater Montana	Bozeman party and wedding band playing pop and rock hits from the 80s to today, with live band karaoke on offer.			https://savvytheband.com/	https://www.instagram.com/savvytheband/
Gather 406	Catering		Bozeman	Montana	Montana	Catering company for weddings and events handling menus, food, bar service and event coordination across Montana.	gather.406@gmail.com	406.581.5435	https://www.gather406.com/	https://www.instagram.com/gather406/
Chef Greg Montana	Catering		Bozeman	Montana	Bozeman, Big Sky, Paradise Valley, the Yellowstone Club and across Montana	Private chef and wedding caterer writing custom menus with local and organic ingredients, with tastings offered.	greg@chefgregmontana.com	(303) 725-2654	https://chefgregmontana.com/	https://www.instagram.com/chefgregmontana/
Lone Peak Provisions	Catering	85 Mill Town Loop, Unit D	Bozeman	Montana	Four Corners and the Gallatin Valley	Family-run Four Corners deli that also caters events, with a dedicated events email and phone line for bookings.	events@lonepeakprovisions.com	406-551-2077	https://lonepeakprovisions.com/	https://www.instagram.com/lonepeak_provisions/
Emily Young Artistry	Hair & Makeup		Bozeman	Montana	Bozeman, MT	Bozeman makeup and hair artist offering bridal looks plus lash extensions, with online booking available.			https://www.emilyyoungartistry.com/	https://www.instagram.com/emilyyoungartistry/
Ethereal Hair & Makeup Artistry	Hair & Makeup		Bozeman	Montana		Bozeman bridal hair and makeup team that books far ahead and also styles engagement and portrait sessions.	etherealhairmakeup@gmail.com		https://www.etherealhairmakeup.com/	https://www.instagram.com/etherealhairmakeup/
Revive Salon & Spa	Hair & Makeup		Bozeman	Montana		Bozeman salon offering bridal hair and makeup for the bride and bridesmaids, plus lashes and facials.			https://revivesalonbozeman.com/bridal-services	https://www.instagram.com/revivesalonbozeman/
Elle's Belles Bakery	Cake	2968 N 27th Ave, Unit A	Bozeman	Montana	Bozeman area, with nationwide shipping	Bozeman bakery making custom wedding cakes, cookies, cupcakes and desserts by hand since 2003.			https://www.ellesbelles.com/	https://www.instagram.com/ellesbellesbakery/
Sweet and Tarte	Cake		Bozeman	Montana	Bozeman, the Gallatin Valley and beyond	Bakery specialising in modern wedding cakes, plus macarons, cupcakes and dessert shooters.	kaitlyn@sweetandtarte.com	406-219-7082	https://sweetandtarte.com/	https://www.instagram.com/sweetand_tarte/
Taylor Mountain Films	Videography		Bozeman	Montana	Montana, willing to travel	Two-person Bozeman team filming weddings and elopements, with photo and video packages.		(207) 778-1714	https://www.taylormtnfilms.com/	https://www.instagram.com/taylormtnfilms/
Eterna Films	Videography		Bozeman	Montana	Bozeman and Big Sky region, with destination weddings	Bozeman wedding videographers with over a decade of experience filming storytelling-style wedding films.			https://eternafilms.com/	https://www.instagram.com/eternafilms/
Peak Productions	Videography		Bozeman	Montana	Montana, available for worldwide travel	Bozeman videographer making cinematic wedding films for Montana destination weddings.	brian@peakproductionsmt.com		https://www.peakproductionsmt.com/	
`,
  },
  {
    name: "Bozeman: music and cake",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Party People Montana	Music	3508 Laramie Dr, Suite 2-B	Bozeman	Montana	Bozeman, Big Sky, Paradise Valley, Belgrade, Helena and West Yellowstone	Wedding DJs and MCs with photo booths, uplighting, monogram projection and a planning app, covering ceremony through reception.		(406) 414-9777	https://partypeoplemt.com/weddings	https://www.instagram.com/partypeoplemt/
DJ Titan Productions	Music		Bozeman	Montana	Southwest Montana	Owner-run wedding DJ and emcee service using flat-rate pricing, wireless mics and dance-floor lighting, working one-to-one with couples.			https://www.djtitanproductions.com/weddings/	
Cupcake Mountain Cupcakery	Cake	218 North 7th Avenue	Bozeman	Montana	Bozeman and surrounding community	Family-run cupcake bakery making wedding cakes from cupcake tiers and custom wedding cupcakes, with fifteen flavours baked daily.		(406) 577-2787	https://bozemancupcakery.com/	https://www.instagram.com/cupcakemountain/
`,
  },
  {
    name: "Missoula: photography, planning, florals, catering and cake",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Carin Rene Photo	Photography		Missoula	Montana	Western Montana	Missoula wedding photographer, formerly a physician assistant, capturing days as they unfold without stiff posing across western Montana.	carin@carinrene.com	(406) 201-5148	https://carinrene.com/	https://www.instagram.com/carinrenephoto/
Renske Photo	Photography		Missoula	Montana	Western Montana and beyond	Fine art wedding photographer based in Missoula, mixing documentary coverage with editorial touches for weddings across western Montana.			https://renskephoto.com/	https://www.instagram.com/renskephoto/
Events by Autumn	Planning		Stevensville	Montana	Missoula, Flathead, Whitefish, Bitterroot, Glacier, Bozeman and Big Sky	Bitterroot Valley planner offering fine art wedding planning and design, pairing couples with vendors to suit their style and budget.	Hello@EventsbyAutumn.com	(406) 880-0592	https://www.eventsbyautumn.com/	https://www.instagram.com/eventsbyautumn/
Habitat Events	Planning		Missoula	Montana	Missoula, Philipsburg, Big Sky, Bozeman, Whitefish and Flathead Lake	Planning and production studio offering wedding coordination, floral design and a rental collection for weddings across western Montana.			https://www.habitatevents.com/	https://www.instagram.com/habitatevents/
Agile Goat Flower Farm & Design Studio	Florals		Missoula	Montana		Flower farm and design studio just outside Missoula, growing its own seasonal blooms for nature-inspired wedding florals, by appointment.	agilegoatflowerfarm@gmail.com	(406) 544-7118	https://www.agilegoatflowerfarm.com/	https://www.instagram.com/agilegoatflowerfarm/
Earth Within Flowers	Florals		Missoula	Montana		Missoula flower shop focused on sustainable floristry, offering full wedding florals, dried wedding flowers, a la carte pieces and workshops.		(406) 240-1367	https://earthwithin.com/	https://www.instagram.com/earthwithinflowers/
Riversong Gourmet	Catering	101 North Johnson Street	Missoula	Montana		Missoula wedding and event caterer cooking with regeneratively grown ingredients, which also runs a tiny event space for small gatherings.	riversonggourmet@gmail.com	(406) 240-0914	https://www.riversonggourmet.net/	https://www.instagram.com/riversonggourmet/
Bernice's Bakery	Cake		Missoula	Montana		Missoula bakery and cafe making wedding cakes and cupcakes alongside everyday cakes, pies, pastries and a breakfast and lunch menu.		406-728-1358	https://bernicesbakerymt.com/	https://www.instagram.com/bernicesbakerymt/
`,
  },
  {
    name: "Whitefish: photography, florals, catering, music and cake",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Thewmatt Photography	Photography		Whitefish	Montana	Montana and destination weddings	Whitefish photographer Matt Wetzler shooting destination weddings in an editorial, unposed style, alongside portrait and motorsport work.	matt@thewphoto.com		https://www.thewmattphotography.com/	https://www.instagram.com/thewmatt/
Mum's Weddings	Florals	520 2nd Street East	Whitefish	Montana		Family-owned florist in downtown Whitefish designing wedding flowers, with a rental catalogue of decor to go alongside the arrangements.	hello@mumsflowers.net	406.862.2757	https://www.mumsflowers.net/	https://www.instagram.com/mumsweddings/
Flathead Farmworks	Florals		Kalispell	Montana		Urban flower farm in downtown Kalispell growing seasonal cut flowers and designing florals for weddings and events around the Flathead.			https://www.flatheadfarmworks.com/	https://www.instagram.com/flatheadfarmworks/
Forage Catering	Catering		Whitefish	Montana		Flathead Valley caterer voted Best Chef in Whitefish in 2022 and 2023, cooking for weddings, private dinner parties and special events.	forage406@gmail.com	(406) 871-1711	https://www.foragecatering406.com/	
Big Mountain DJs	Music		Whitefish	Montana	Kalispell, Whitefish, Glacier Park and greater Montana	Wedding and event DJ company run by Flathead Valley DJ Nick Ferrington, who has played over 300 weddings, with photobooths available.	info@bigmountaindjs.com	(406) 270-5710	https://www.bigmountaindjs.com/	https://www.instagram.com/bigmountaindjs/
The Cake Girl	Cake		Whitefish	Montana		Whitefish bakery making custom wedding and elopement cakes, many gluten-free, vegan or dairy-free, plus allergen-friendly desserts.	thecakegirlwhitefish@gmail.com		https://www.thecakegirlwhitefish.com/	https://www.instagram.com/thecakegirlwhitefish/
Brulee Bake House	Cake		Kalispell	Montana		Kalispell cake studio baking one-of-a-kind wedding cakes from scratch with no templates, plus custom cakes for birthdays and graduations.	Info@bruleebakehouse.com		https://www.bruleebakehouse.com/	https://www.instagram.com/thebruleebakehouse/
`,
  },
  {
    name: "Missoula: photography, planning, florals, music, catering, hair and makeup, cake and videography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Infinite Photography and Film	Photography		Missoula	Montana	Missoula and beyond	Missoula wedding photographer and filmmaker who also offers planning help, covering couples from engagement through the day.	hello@sayidahdupuis.com	406-396-0783	https://www.infinitephotoandfilm.com/	https://www.instagram.com/infinitephotographymissoula/
Life as a Voyager	Photography		Missoula	Montana	Montana, including Glacier and Grand Teton, plus Idaho and Washington	Missoula-based wedding and elopement photographer shooting digital and film, with Super 8 video as an add-on.	hello@lifeasavoyager.org		https://lifeasavoyager.org/	https://www.instagram.com/lifeasavoyager/
Epic Events	Planning		Missoula	Montana	Missoula and surrounding areas	Missoula wedding planner and coordinator offering full planning, partial planning and day-of coordination packages.	epiceventsmt@gmail.com	406-261-6799	https://www.epiceventsmt.com/	https://www.instagram.com/epiceventsmt/
Emerald Isle Events	Planning		Missoula	Montana	Western Montana	Missoula day-of coordinator who runs the timeline and vendors so couples can enjoy their wedding.	emeraldisleevents@gmail.com		https://www.emeraldisle.events/	https://www.instagram.com/emeraldisle.events/
Bustle + Blush	Planning		Missoula	Montana	Western Montana	Event and wedding planner offering day-of coordination, setup and teardown, wedding consulting and rentals.	bustle.blush@gmail.com	406-396-9429	https://www.bustleandblush.com/	https://www.instagram.com/bustleandblush_missoula/
Habitat Floral Studio	Florals		Missoula	Montana	Missoula and Montana	Woman-owned downtown Missoula flower shop and event studio doing custom wedding and event floral design.	hello@habitatfloralstudio.com		https://habitatfloralstudio.com/	https://www.instagram.com/habitatfloralstudio/
Millay & Meadowlark Flower Farm	Florals		Missoula	Montana	Missoula and Western Montana	Missoula flower farm designing seasonal wedding and event florals from its own fields.	millayandmeadowlark@gmail.com	406-529-6543	https://www.millayandmeadowlark.com/	https://www.instagram.com/millayandmeadowlark/
Primrose Views	Florals		Missoula	Montana	Montana	Missoula florist offering full-service fresh wedding florals alongside artificial bouquets and flower rentals.	Primroseviews22@gmail.com	(406) 273-8802	https://www.primroseviews.com/	https://www.instagram.com/primrose_views/
RMF Entertainment	Music		Missoula	Montana	Montana, including Missoula, Bozeman, Big Sky and Whitefish	Missoula DJ and MC team that also supplies live musicians, jazz and photo booths for weddings and events.	hello@rmfdjs.com	(406) 531-2321	https://www.rmfdjs.com/	https://www.instagram.com/rmf_entertainment/
Kaleidoscope Entertainment	Music		Missoula	Montana	Missoula, Hamilton and Butte	Wedding DJ service in Missoula that also rents karaoke, photo booths and lawn games.		(406) 721-1798	https://www.kscopeentmt.com/wedding-dj	
Peak Audio	Music		Missoula	Montana	Missoula and Kalispell	Wedding DJ and sound company with Missoula and Kalispell offices, also renting audio gear.		406.616.2988	https://www.peakaudiomontana.com/missoula-wedding-dj	
Pulse Entertainment	Music		Missoula	Montana	Montana, Idaho and Washington	Mobile DJ company based in Missoula that plays weddings, proms and corporate events and will travel across the region.	booking@pulse-entertainment-djs.com	(406) 404-6357	https://www.pulse-entertainment-djs.com/	
A Moveable Feast	Catering		Missoula	Montana	Western Montana	Missoula wedding caterer with a mobile kitchen cooking on site, also offering rehearsal dinners and personal chef work.	amoveablefeastmissoula@gmail.com	(406) 544-8390	https://amoveablefeastmissoula.com/	
The Silk Road Catering	Catering		Missoula	Montana	Missoula and Western Montana	Missoula caterer cooking from scratch with global menus, building each wedding menu a la carte.	silkroadcatering@gmail.com	406-541-0752	https://www.silkroadcatering.com/	https://www.instagram.com/thesilkroadspices/
Burton's Classic Hair Co.	Hair & Makeup	3410 S. Reserve St	Missoula	Montana	Western Montana	Long-running Missoula salon offering bridal hair and makeup in the salon or on site at the venue.	burtonshair@gmail.com	406-721-8889	https://burtonshair.com/bridal/	https://www.instagram.com/burtonshair/
Sugar Tree Hair Salon	Hair & Makeup		Missoula	Montana	Missoula	Missoula salon with a wedding team of hair stylists and makeup artists, also offering lash services.	weddings@sugartreebridal.com		https://www.sugartreebridal.com/	https://www.instagram.com/sugartree_hairsalon/
Skin Chic	Hair & Makeup		Missoula	Montana	Missoula	Missoula medical spa whose artists do bridal makeup and trial lessons for the bride and her party.		406-541-8466	https://www.skinchic.com/makeup	https://www.instagram.com/skinchic406/
artcakeMT	Cake		Missoula	Montana	Missoula	Missoula custom cake studio making cakes and cupcakes from specialty ingredients, booking weddings by inquiry.	artcakemt@gmail.com		https://www.artcakemt.com/	https://www.instagram.com/artcakemt/
Morning Birds Bakery	Cake	223 West Broadway Street	Missoula	Montana	Missoula	Downtown Missoula bakery taking custom cake orders alongside its everyday pastries.	birds@morningbirdsbakery.com	406-540-4333	https://www.morningbirdsbakery.com/custom-cakes	https://www.instagram.com/morningbirdsbakery/
Reid Graham Weddings	Videography		Missoula	Montana	Montana and destinations	Missoula videographer making cinematic wedding and elopement films with a relaxed, personal approach.			https://www.reidgrahamweddings.com/	https://www.instagram.com/reidgrahamvisuals/
Bliss & Bloom	Videography		Missoula	Montana	Montana	Missoula wedding videographer and photographer, also running the ZooTown photo booth, with six wedding seasons behind her.			https://www.blissandbloommedia.com/	https://www.instagram.com/blissandbloommedia/
Slikati Photography	Videography	126 E Broadway, Suite H	Missoula	Montana	Missoula and Montana	Downtown Missoula studio shooting weddings since 2010 and offering wedding films alongside photography.	inquiries@slikati.com	(406) 274-0592	https://slikati.com/	https://www.instagram.com/slikatimissoula/
`,
  },
  {
    name: "Whitefish: photography, music, catering, hair and makeup and cake",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Jeremiah & Rachel Photography	Photography	315 Michaels Slough Rd	Columbia Falls	Montana	Destination weddings and elopements, worldwide	Husband-and-wife team from the Flathead Valley shooting weddings on film and recording Super 8mm wedding films alongside the photographs.	hello@jeremiahandrachel.com	406-471-2855	https://jeremiahandrachel.com/	https://www.instagram.com/jeremiahdanielphotog/
Stan Todorov Photography	Photography		Kalispell	Montana	Glacier National Park and the Flathead Valley	Kalispell elopement and wedding photographer who guides couples through Glacier permits and timelines and is an ordained officiant too.	st.photolens@gmail.com		https://www.stantodorov.com/	https://www.instagram.com/stantodorovphotography/
Jennifer Mooney Photography	Photography		Whitefish	Montana	Glacier National Park and Montana, with select destination work	Whitefish photographer with a fine-art style, covering weddings and elopements in Glacier National Park for adventurous couples.	hello@jennifermooney.com	406-465-5219	https://jennifermooney.com/	https://www.instagram.com/jenniferphoto/
Mountain Life Photography	Photography		Whitefish	Montana	Whitefish and Glacier National Park	Whitefish studio led by a photographer with more than twenty years behind the lens, shooting weddings, elopements and family portraits.	info@mountainlifephotography.com		https://www.mountainlifephotography.com/	https://www.instagram.com/mt_life_photography/
Lovelight Photography	Photography		Kalispell	Montana	Glacier National Park, Kalispell, Whitefish and Bigfork	Kalispell wedding and elopement photographers working in a documentary style with natural, true-to-life colour editing.			https://www.lovelightmontana.com/	https://www.instagram.com/lovelightmontana/
Majestic Mountain Beauty	Hair & Makeup	905 Wisconsin Ave	Whitefish	Montana	Flathead County, Whitefish, Columbia Falls, Kalispell and West Glacier	Collective of hairstylists and makeup artists who travel to wedding parties, including Glacier National Park elopements.	Info@MajesticMountainBeauty.com	406-926-0190	https://www.majesticmountainbeauty.com/	https://www.instagram.com/mmtnbeauty/
Project Lex	Hair & Makeup		Kalispell	Montana	Northwest Montana, including Glacier National Park and Missoula	Kalispell bridal hair and makeup artist using techniques made to last through windy outdoor ceremonies and Glacier elopements.	alexis.raab@gmail.com	406-471-7444	https://www.projectlexmua.com/	https://www.instagram.com/projectlex_mua/
Covet Beauty Bridal	Hair & Makeup		Whitefish	Montana	Whitefish and beyond, including destination weddings	Whitefish bridal beauty team with a concierge service that matches each client to the hair or makeup artist suiting their style.			https://www.covetbeautybridal.com/	https://www.instagram.com/covetbeautybridal/
Mirabelle Salon & Spa	Hair & Makeup	420 W. Center Street	Kalispell	Montana		Kalispell salon offering bridal hair and makeup with trials, either in the salon or with a team that comes to your venue or hotel.	mirabellesalon@gmail.com	406-257-4155	https://www.mirabellesalon.com/services/bridal	https://www.instagram.com/mirabellesalon/
Reecia's Salon and Spa	Hair & Makeup	110 Lupfer Avenue	Whitefish	Montana		Whitefish salon with a dedicated bridal hair artist and makeup artist, offering wedding styling with trial appointments.	reecias.info@gmail.com	406-863-9900	https://reeciasalonandspa.com/bridalservices/	https://www.instagram.com/reeciasalonandspa/
SGBridal	Hair & Makeup		Kalispell	Montana	Northwest Montana, with travel available	Licensed cosmetologist in Kalispell specialising in bridal hair, from elopements to full wedding parties and reception styling.			https://www.sgbridalhair.com/	
YO DJ! Disc Jockeys	Music		Whitefish	Montana	The Flathead Valley, including Kalispell, Polson and Glacier	Whitefish mobile DJ whose owner performs at every event himself, often alongside a protege DJ, for weddings across the Flathead Valley.		406-860-0699	https://www.yodjdiscjockeys.com/	
Destination DJ	Music		Kalispell	Montana	The Flathead Valley	Kalispell DJ company with a dedicated weddings page and simple package options, running events across the valley since 2007.	sam@destinationdj.biz	406-212-2314	https://www.destinationdj.biz/	https://www.instagram.com/ddj406/
Mike Murray Tunes	Music		Kalispell	Montana	Northwest Montana, including Kalispell, Whitefish and Columbia Falls	Kalispell singer-songwriter who plays ceremonies and receptions, drawing on over a thousand live performances and seven albums.			https://www.mikemurraytunes.com/weddings/	https://www.instagram.com/mikemurraytunes/
Farmer Meets Foodie	Catering	27 Lesley Avenue	Somers	Montana	Flathead Valley, Glacier and across Montana	Somers caterer cooking seasonal menus from organic, local ingredients for weddings around Kalispell, Whitefish and Flathead Lake.			https://www.farmermeetsfoodiemt.com/wedding-event-catering	https://www.instagram.com/farmer_meets_foodie/
Gina MacNeil Catering	Catering		Kalispell	Montana		Kalispell caterer with menus spanning Mexican, barbecue, Italian and Hawaiian, plus appetisers, desserts and charcuterie for events.		406-407-2000	https://www.cateringkalispell.com/	
Montana Wildflour Baking Co.	Cake		Whitefish	Montana		Whitefish baker making every cake to order, with tastings and consultations at the kitchen by appointment.			https://www.montanawildflour.com/about-us	`,
  },
  {
    name: "Billings: photography, planning, florals, music, catering, hair and makeup, cake and videography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Vande Studios	Photography		Billings	Montana	Billings, Red Lodge and Laurel	Billings photography studio covering weddings, portraits and events, with wedding packages for couples around Yellowstone County.		(406) 850-2684	https://www.vandephotography.net/	https://www.instagram.com/vande_studios/
Sara Nagel Photography	Photography		Billings	Montana	Billings and Montana	Billings wedding photographer whose weekends are mostly weddings, with family and senior portraits alongside.			https://saranagelphotography.com/	https://www.instagram.com/saranagelphotography/
406 Memories	Photography		Billings	Montana	Billings, Helena, Red Lodge and Glacier National Park	Billings team offering wedding photography with videography and DJ services, working at venues around Montana.			https://www.406memories.com/	https://www.instagram.com/406memories/
Bitterroot & Blue Wedding and Event Planning	Planning		Billings	Montana	Billings, Bridger, Roundup and Red Lodge	Billings planner offering full wedding planning and day-of coordination for couples in the city and nearby towns.	bitterrootandblue@gmail.com		https://www.bitterrootandblue.com/	https://www.instagram.com/bitterrootandblue/
Ivory Crane Events	Planning		Billings	Montana	Billings and surrounding area	Billings planner handling full and partial wedding planning, day-of coordination, officiant services and design with setup and teardown.	ivorycraneevents@gmail.com		https://www.ivorycraneevents.com/	https://www.instagram.com/ivorycraneevents/
Gainan's Flowers	Florals		Billings	Montana	Billings, Big Sky, Red Lodge, Flathead Lake and northern Wyoming	Long-running Billings florist designing wedding flowers, with bridal consultations by appointment and destination weddings across the region.		406-245-6434	https://www.gainansweddings.com/	
Plantasia Flowers, Plants & Gifts	Florals	605 West Main Street	Laurel	Montana	Laurel and Billings area	Laurel flower shop offering bridal bouquets, altar and sweetheart table designs, and ceremony, reception and party flower packages.		(406) 628-7574	https://www.floristbillingsmontana.com/	https://www.instagram.com/plantasia_flowers/
Rimrock Flower Farm	Florals		Roundup	Montana	Billings, Roundup, Lewistown, Livingston, Bozeman and Red Lodge	Flower farm in Roundup supplying locally grown, garden-style wedding florals to couples in Billings and across central and southern Montana.			https://www.rimrockflowerfarm.com/	https://www.instagram.com/rimrockflowerfarm/
DJ Benefit	Music		Billings	Montana	Billings	Billings DJ for weddings, corporate events and private parties, with set packages and add-on ceremony coverage.			https://www.djbenefit.com/	https://www.instagram.com/djbenefit/
DJ Dubb Events	Music		Billings	Montana	Billings	Billings mobile DJ with about ten years of experience playing weddings, private parties, proms and corporate events.	jordan@djdubbevents.com		https://djdubbevents.com/	https://www.instagram.com/djdubbevents/
Montana Outlaw BBQ	Catering	109 N 35th Street	Billings	Montana	Billings and Montana	Billings barbecue restaurant that caters weddings and other events with customisable buffet and full-service menus.	info@montanaoutlawbbq.com	(406) 534-2230	https://www.montanaoutlawbbq.com/	https://www.instagram.com/montanaoutlawbbq/
Scratch Kitchen Billings	Catering		Billings	Montana	Billings area	Billings caterer serving scratch-made plated and family-style dinners, buffets and appetisers for weddings and larger celebrations.			https://www.scratchkitchenbillings.com/	
Happy Pairings MT	Catering		Billings	Montana	Billings, Laurel and Yellowstone County	Mobile charcuterie catering that travels to weddings, corporate gatherings and community events around Billings and Laurel.		406-200-1227	https://happypairingsmt.com/	https://www.instagram.com/happypairingsm/
Empire Salon	Hair & Makeup	212 N 29th St	Billings	Montana	Billings	Downtown Billings salon where independent stylists do bridal hair and makeup, including trials, wedding parties and day-of styling.		(406) 255-0684	https://empirebillings.com/	https://www.instagram.com/empirebillings/
Plush Skincare Studio & Medical Aesthetics	Hair & Makeup	1423 38th St West Suite #1	Billings	Montana	Billings	Billings skincare studio with a bridal service for wedding-day hair and makeup, with bookings by appointment.	plushskincarestudio@gmail.com	(406) 969-2018	https://plushskincarestudio.com/	https://www.instagram.com/plush.studios.aesthetics/
Bluebird Sweets	Cake		Billings	Montana	Billings and Big Sky Country	Billings cake bakery making custom wedding and event cakes from scratch, with a portfolio, menu and inquiry form.	hello@bluebirdsweets.com		https://bluebirdsweets.com/	https://www.instagram.com/bluebirdsweetsofmt/
Flours Bakery	Cake	2695 King Ave W	Billings	Montana	Billings	Billings bakery taking custom orders for cakes, including wedding cakes, alongside its pastries, breads and desserts.			https://floursbakerymt.com/	https://www.instagram.com/floursbakerymt/
Samuel Roland Films	Videography		Billings	Montana	Billings and beyond	Billings videographer producing wedding films alongside commercial video, and willing to travel to out-of-town weddings.	sam@samuelrolandfilms.com	406.690.3228	https://samuelrolandfilms.com/	https://www.instagram.com/samuelrolandfilms/`,
  },
  {
    name: "Whitefish: planning, florals and videography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Big Day Celebrations	Planning		Kalispell	Montana	Northwest Montana, including Kalispell, Whitefish, Bigfork and Glacier National Park	Kalispell planning and design firm, trading since 2011, that focuses on full-service wedding weekends, micro weddings and elopements.			https://bigdaycelebrations.com/	https://www.instagram.com/bdcelebrations/
An Epic Elopement	Planning		Kalispell	Montana	Northwest Montana, including Glacier National Park	Kalispell company arranging all-inclusive elopements and micro weddings with local vendors already lined up for the couple.	info@anepicelopement.com	406-282-4024	https://anepicelopement.com/	https://www.instagram.com/anepicelopement/
Painted Rock Floral Designs	Florals		Whitefish	Montana	Flathead Valley, including Whitefish	Boutique floral studio creating bouquets, centrepieces and event styling shaped around each couple's palette and budget.		(631) 704-3221	https://paintedrockfloraldesigns.com/	https://www.instagram.com/paintedrockflowers/
Skeeter Johnston Productions	Videography		Kalispell	Montana	Flathead Valley, Glacier National Park, Bigfork, Polson, Plains and Bozeman	Local videographer making tailored wedding and elopement films across the Flathead Valley and Glacier National Park for over ten years.	skeeterjohnstonproductions@gmail.com	406-471-4345	https://www.skeeterjohnstonproductions.com/	https://www.instagram.com/skeeterjohnstonproductions/
Glacier Wedding Films	Videography		Kalispell	Montana	Montana, including the Flathead Valley and Glacier National Park	Kalispell film company offering bespoke wedding and elopement videos that couples can build from separate highlight, teaser and documentary pieces.	contact@glacierweddingfilms.com	406-897-8300	https://glacierweddingfilms.com/	https://www.instagram.com/glacierweddingfilms/
On The Fly Films	Videography		Kalispell	Montana	Flathead Valley and Glacier National Park, with travel included for Flathead Valley venues	Montana photographer and videographer pairing romantic wedding and elopement films with photos, with Flathead Valley travel included.	otffilmsmt@gmail.com		https://ontheflyfilmsmt.com/	https://www.instagram.com/ontheflyfilms/`,

  },
  {
    name: "Whitefish: Planning",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Studio Margot	Planning		Whitefish	Montana		Boutique Whitefish planning studio offering full-service wedding planning, with European-inspired design and curated rentals.	hello@studiomargot.events		https://www.studiomargot.events/	https://www.instagram.com/studio.margot.events/`,
  },
  {
    name: "Bozeman: Rentals, Officiant",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Montana Party Rentals	Rentals	17 All West Trail	Bozeman	Montana	Montana	Bozeman rental company with tables, chairs, linens, tenting, lighting, tabletop and decor for weddings, delivering across Montana.	info@montanapartyrentals.com	406-586-7727	https://www.montanapartyrentals.com/wedding/	https://www.instagram.com/montanapartyrentals/
Weddings of the Wild	Officiant		Bozeman	Montana		Bozeman non-denominational officiant for adventure weddings, elopements and vow renewals, including horse-themed ceremony packages.	weddingsofthewild@gmail.com	406-209-6567	https://www.weddingsofthewild.com/	
Big Sky Country Minister	Officiant		Bozeman	Montana	Within 500 miles of Bozeman	Bozeman-based minister who officiates weddings and elopements, with a free consultation by phone, video or in person before booking.	info@bigskycountryminister.com	406-580-5002	https://www.bigskycountryminister.com/	`,
  },
  {
    name: "Missoula: Photo Booth",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
ZooTown Booth	Photo Booth		Missoula	Montana	Montana	Missoula photo booth rental for weddings and other events, available across Montana.	info@zootownbooth.com		https://www.zootownbooth.com/	https://www.instagram.com/zootownbooth/`,
  },
  {
    name: "Billings: Rentals, Music",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Revelry & Co	Rentals		Billings	Montana	Billings, Shepherd, Red Lodge, Laurel and Miles City	Billings rental and design company supplying wedding furniture, linens and decor, with planning and coordination packages for couples in Yellowstone County.	revelryeventsmt@gmail.com	(406) 281-0933	https://revelrycompanymt.com/	https://www.instagram.com/revelry_and_company/
Freakin' Awesome DJ Service	Music		Billings	Montana	Billings and surrounding areas	Billings DJ and MC service for wedding receptions, with sound, custom uplighting and monogrammed lighting, plus equipment rentals.		(406) 259-3000	https://freakinawesome.com/	
Montana Premiere Entertainment	Music	1935 Lampman Dr, Unit B	Billings	Montana	Billings and the surrounding region	Billings entertainment company offering wedding DJ and MC packages alongside tent, table, chair, linen and lighting rentals for events.	dave@mtpremiere.com	(406) 697-4301	https://mtpremiere.com/	https://www.instagram.com/montanapremiereentertainment/`,
  },
  {
    name: "Billings: hair & makeup and planning",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
The Beauty Barr	Hair & Makeup		Billings	Montana	Billings and Montana	Licensed esthetician and makeup artist doing bridal and bridal-party makeup, plus skincare and spa makeup parties, for Billings couples.		406-850-5805	https://beautybarrmt.com/	https://www.instagram.com/thebeautybarrmt/
Rustic Sage Salon	Hair & Makeup	203 S Broadway Ave	Red Lodge	Montana	Red Lodge and the Billings area	Red Lodge salon whose owner has styled weddings for 15 years, with a boho bridal look and event styling.		406-425-1563	https://www.rusticsagesalon.com/	
Weddings by Sara	Planning		Missoula	Montana	Missoula and throughout Montana	Missoula planner handling venue and vendor recommendations, timelines and wedding-day management, including long-distance destination weddings.	info@weddingsbysara.com	406-260-0665	https://weddingsbysara.com/	https://www.instagram.com/weddingsbysaramt/
Moments by Allie + Ashley	Planning		Missoula	Montana	Across Montana	Missoula event planning duo that plans weddings and other celebrations, with full-service planning anywhere in the state.	info@momentseventcoordinating.com		https://www.momentseventcoordinating.com/	https://www.instagram.com/momentsbyallie.ashley/
Harper House Events	Planning		Missoula	Montana	Montana	Missoula planner offering full and partial wedding planning, day-of coordination, event design, rentals and a photo booth.		707-208-6612	https://harperhouseevents.com/	https://www.instagram.com/harper_house_events/
`,
  },
  {
    name: "Billings: videography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
A & A Weddings	Videography		Columbus	Montana	Billings, Bozeman, Paradise Valley, Red Lodge, Glacier and Yellowstone	Columbus-based married duo making documentary-style wedding films, from highlight reels to feature films, with drone and timelapse footage.	Info@AandAweddings.com	+1 262 719 9518	https://aandaweddings.com	https://www.instagram.com/a_and_a__weddings/
`,
  },
  {
    name: "Helena: photography, planning, florals, music, catering, hair & makeup, cake, photo booth",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Erika May Photography	Photography		Helena	Montana	Helena, Missoula, Bozeman and further afield	Helena-based photographer covering weddings, elopements and engagements across Montana and beyond, with a natural, adventurous style.	erikamayphotography@gmail.com	(928) 243-0001	https://erikamayphotography.com/	https://www.instagram.com/erikamayphotography/
Floating Leaf Studios	Photography	104 E Broadway St #7	Helena	Montana		Helena studio offering wedding photography and wedding videography packages alongside commercial and portrait work.		(406) 996-1101	https://www.floatingleafstudios.com/	https://www.instagram.com/floatingleafstudios/
Kelly Van Dyke Photography	Photography		Helena	Montana		Helena photographer with a weddings gallery and engagement sessions, and client reviews from couples she has photographed.			https://kellyvandykephotography.com/	https://www.instagram.com/kellyvandykephotography/
Image 406 Photography	Photography		Helena	Montana	Montana, including Butte, Missoula, Bozeman, Glacier, Billings and Great Falls	Helena photographer who travels across Montana for weddings and elopements, with a particular fondness for ranch weddings.			https://www.image406photography.com/	
Maj Lewis Photography	Photography		Helena	Montana		Helena photographer for couples, families and elopements, using natural light and simple prompts for relaxed, genuine photos.			https://www.majlewisphoto.com/	https://www.instagram.com/maj.lewis.photo/
Elite Interactions Weddings & Events	Planning		Helena	Montana	Helena, Bozeman, Big Sky, Livingston and across Montana	Wedding planner and coordinator serving Helena and the rest of Montana, offering planning and day-of coordination for couples.		(406) 437-1744	https://www.eliteinteractionsevents.com/	https://www.instagram.com/elite_interactions/
Party Factory	Planning		Helena	Montana		Helena party and event planner that coordinates and decorates receptions, with DJ and catering available through the same team.		406-422-7735	https://partyfactorymt.com/	
The Floral Cottage	Florals	2620 N Sanders St.	Helena	Montana	Helena; delivery area varies	Helena florist designing custom wedding flowers, from bridal bouquets to table centrepieces, booked through a phone consultation.		(406) 442-7969	https://www.thefloralcottage.net/wedding-flowers	
Knox Flowers & Gifts	Florals		Helena	Montana	Greater Helena area	Helena flower shop with a wedding design service for custom ceremony flowers and centrepieces across the greater Helena area.			https://knoxflowershop.weddingflorals.net/	
UpBeat Entertainment	Music		Helena	Montana		Helena DJ business offering wedding DJ services as well as corporate events and private parties around the area.	upbeatmt@gmail.com	406-590-0151	https://upbeat406.com/	https://www.instagram.com/upbeat406/
Star Struck Entertainment	Music	33 Clover View Dr	Helena	Montana		Helena DJ service that specialises in weddings as well as large corporate and social events; prices are given on enquiry.			https://www.starstruckent.net/	
Bad Betty's Barbecue	Catering	812 Front Street	Helena	Montana		Helena barbecue restaurant that caters wedding receptions, corporate events and backyard gatherings, with pickup or delivery.	cater@badbettysbarbecue.com	406.459.2303	https://badbettysbarbecue.com/catering	https://www.instagram.com/badbettysbarbecue/
Silver Star Steak Company	Catering	833 Great Northern Blvd	Helena	Montana	Helena	Helena steakhouse offering catering for weddings, corporate events and private parties.		(406) 495-0677	https://silverstarsteakco.com/catering/	https://www.instagram.com/silverstarsteakco/
Eat Greekish Catering	Catering	603 N Montana Ave	Helena	Montana	Helena Valley; travel charges apply beyond	Helena Greek-style caterer for weddings, office parties and family events, serving the Helena Valley with travel fees further out.			https://www.eatgreekish.com/catering-eatgreekish-restaurant	https://www.instagram.com/eatgreekish/
406 Makeup Artistry	Hair & Makeup		Helena	Montana	Central and southwest Montana	Mother-and-daughter team in Helena specialising in on-location wedding makeup across central and southwest Montana.	info@406makeupartistry.com	406-202-0962	https://www.406makeupartistry.com/	https://www.instagram.com/toni_thomas_mua/
TW Cosmetology	Hair & Makeup		Helena	Montana		Helena stylist offering bridal hair and makeup with a required trial, working from The Collective and travelling to venues for a mileage fee.	waddelltatelynne@gmail.com	406-916-1745	https://thecollectivehelena.com/twcosmetology	https://www.instagram.com/twcosmetology/
Gypsy Hair Salon	Hair & Makeup	110 6th Ave	Helena	Montana	Montana (traveling bridal hairstyling)	Helena salon where Kara Bryant styles bridal hair and travels around Montana for weddings and events.		406-410-4646	https://www.gypsyhairsalon.com/	https://www.instagram.com/gypsyhairsalon/
Park Avenue Bakery	Cake	44 South Park Avenue	Helena	Montana		Helena bakery making tiered wedding cakes, cupcake displays and dessert stations from scratch, with prices per serving listed online.		(406) 449-8424	https://www.parkavenuebakery.net/weddings/	
Rockin' Heart K Desserts	Cake		Boulder	Montana	Boulder, Whitehall, Helena, Bozeman and Butte	Licensed home baker in Boulder making cakes, cupcakes and cookies for weddings across Boulder, Helena, Whitehall, Bozeman and Butte.	rockinheartkdesserts@gmail.com	406.210.1068	https://rockinheartkdesserts.com/	
Helena Photo Booths	Photo Booth		Helena	Montana		Helena photo booth rental company covering wedding receptions and other events, with a client thank-you from a local wedding.		406-461-4344	https://www.helenaphotobooths.com/	https://www.instagram.com/helenaphotography41/
`,
  },
  {
    name: "Great Falls: photography, music, cake, catering, planning, florals",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Perfect Sound DJ Service	Music		Great Falls	Montana	Great Falls and the whole state	Great Falls DJ and sound company providing music and entertainment for weddings and live bands since 2001.	corey@psdjservice.com	406-899-1011	http://www.psdjservice.com/	https://www.instagram.com/psdjservice/
Kosmic Radio Entertainment	Music		Great Falls	Montana		Great Falls DJ, karaoke and event entertainment business that also takes wedding bookings and holds a 2022 WeddingWire award.	rcbrown3.rb@gmail.com	406-781-5921	https://www.kosmicradio.com/	
White Bear Baking Co.	Cake		Great Falls	Montana	Great Falls, local only	Certified home bakery making custom wedding cakes and cupcakes, with consultations and tastings, for couples in Great Falls.	whitebearbakingco@gmail.com		https://www.whitebearbakingco.com/	https://www.instagram.com/white_bear_baking_co/
Good Eats Catering	Catering		Great Falls	Montana		Family-owned Great Falls caterer that offers wedding feasts for receptions and small ceremonies, including serving stations and tableware setup.		406-452-0773	https://www.goodeatsmt.com/	
EH Weddings & Events, LLC	Planning		Great Falls	Montana	Great Falls, with a mileage fee beyond	Great Falls planner offering full and partial planning, day-of coordination, elopements and micro weddings.	eh.weddingsevents@gmail.com		https://www.ehweddingsevents.com/	
Rivers Edge Floral	Florals	1720 Front St	Fort Benton	Montana	Fort Benton	Fort Benton florist supplying wedding bouquets, wedding party flowers, ceremony and reception arrangements.		(406) 622-5241	https://www.riversedgefortbenton.com/	
`,
  },
  {
    name: "Bozeman: photography, planning, florals, music, catering, hair & makeup, cake",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Kindzerski Photography	Photography		Bozeman	Montana		Natural-light photographer based in Bozeman covering weddings of every size, elopements and couples sessions.			https://www.kindzerskiphotography.com/	https://www.instagram.com/kindzerskiphotography/
Something Blue	Planning		Bozeman	Montana		Bozeman wedding planner offering full planning and day-of support for couples marrying locally or from further afield.			https://www.somethingbluemt.com/	https://www.instagram.com/somethingblue_mt/
Indigo & Violet Co.	Florals		Bozeman	Montana	Gallatin Valley, Big Sky	Boutique Bozeman florist creating wedding and event flowers for the Gallatin Valley and Big Sky venues.	Indigoviolet.floral@gmail.com		http://indigovioletfloral.com/	https://www.instagram.com/indigo.violet.floral/
Just A Taste Catering	Catering	614 West Griffin Drive, Suite B	Bozeman	Montana		Bozeman caterer for wedding receptions of all sizes, offering menu tastings before couples decide.		(406) 599-6705	https://bozemancatering.com/wedding-catering	https://www.instagram.com/justatastebozeman/
Canyon River Spa & Salon	Hair & Makeup		Bozeman	Montana		Bozeman salon and spa offering bridal hair and makeup packages, in the salon or at your wedding location.	info@canyonriverspa.com		https://canyonriverspa.com/bridal	https://www.instagram.com/canyonriverspasalon/
Bowl & Arrow	Cake		Bozeman	Montana	Bozeman, Big Sky	Private chef and wedding cake designer in Bozeman, making flavour-led cakes styled on Montana landscapes.	jess@bowlandarrow.co	(406) 350-0915	https://www.bowlandarrow.co/	https://www.instagram.com/bowlandarrow.co/
History in the Making Special Events	Planning		Bozeman	Montana	Southwestern Montana, including Big Sky	Bozeman planning company handling weddings, elopements and day-of coordination across south-west Montana.			https://www.historyeventsmt.com/	
Bombus Botanics	Florals		Bozeman	Montana		Floral design studio on a flower farm in Bozeman, growing and sourcing seasonal blooms for weddings and events.			https://www.bombusbotanics.com/	https://www.instagram.com/bombusbotanics/
`,
  },
  {
    name: "Missoula: photography, planning, music, catering, hair & makeup, cake, videography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Mike Williams Photography	Photography	817 South Higgins Ave	Missoula	Montana		Missoula photography studio on South Higgins Avenue covering families, graduates and weddings for local couples.		(406) 549-4474	https://mikewilliamsphotography.com/	https://www.instagram.com/mikewilliamsphotographymt/
Blush+Bloom Events	Planning		Missoula	Montana	Montana	Missoula company providing wedding planning, coordination and bartending services across Montana.	blushanbloom@gmail.com		https://www.blushanbloomevents.com/	https://www.instagram.com/blushanbloomeventsmt/
River & Range Catering	Catering		Missoula	Montana	Missoula	Full-service Missoula caterer offering wedding and event catering and bartending.	info@riverandrange.catering		https://www.riverandrange.catering/	https://www.instagram.com/rivernrangecatering/
The Beauty Haven Co	Hair & Makeup	425 N. 5th Street, Suite C	Missoula	Montana		Missoula salon offering hair styling, colour and a dedicated bridal hair and makeup service.		1-406-926-3060	https://www.thebeautyhavenco.com/	https://www.instagram.com/beauty_havenco/
Baked by Bee Rad	Cake		Missoula	Montana	Missoula and surrounding areas	Custom cake artist in Missoula taking orders online, with wedding packages and cakes for the surrounding areas.	bakedbybeerad@gmail.com	406-515-9700	https://bakedbybeerad.com/	https://www.instagram.com/bakedbybeerad/
Tami Renae Photo & Films	Videography		Missoula	Montana		Missoula photo and film duo shooting wedding and elopement films in Montana and beyond.			https://tamirenae.com/montana-wedding-videography/	https://www.instagram.com/tamirenaephotography/
River City Eats	Catering		Missoula	Montana		Missoula food truck and caterer taking weddings, with on-site pig roasting as a speciality.		(406) 272-5446	https://www.rivercityeats.net/	https://www.instagram.com/mslarivercityeats/
`,
  },
  {
    name: "Whitefish: planning, florals, music, catering, videography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Always Planning Events	Planning		Kalispell	Montana	Flathead Valley	Kalispell wedding and event planner offering consultations, planning and coordination across the Flathead Valley.	alwaysmara@gmail.com	1-406-890-1354	https://www.alwaysplanningevents.com/	
Flathead Farmworks	Florals		Kalispell	Montana	Flathead Valley, Whitefish, Bigfork	Kalispell urban flower farm designing wedding florals from locally grown seasonal stems, with delivery and setup.			https://www.flatheadfarmworks.com/weddings-and-events	https://www.instagram.com/flatheadfarmworks/
YO DJ! Disc Jockeys	Music		Whitefish	Montana	Flathead Valley, Kalispell, Polson	Whitefish mobile DJ service covering weddings and parties around the Flathead Valley.		+1 406-860-0699	https://www.yodjdiscjockeys.com/about-us/	
The Kopper Kitchen	Catering		Kalispell	Montana	Flathead Valley	Kalispell caterer with wedding menus for the Flathead Valley and a small event space west of town.	eat@thekopperkitchen.com		https://www.thekopperkitchen.com/	https://www.instagram.com/thekopperkitchen/
Jerad Hill Photography	Videography		Kalispell	Montana	Kalispell, Flathead Valley, Glacier Country	Kalispell studio offering wedding photography and film across the Flathead Valley and Glacier Country.	hi@jeradhillphotography.com	406-325-7500	https://jeradhillphotography.com/services/weddings/	https://www.instagram.com/jeradhillphoto/
Rose Mountain Floral	Florals	344 S Main St	Kalispell	Montana	Kalispell, Whitefish, Bigfork	Family-owned downtown Kalispell flower shop with a weddings and events page and consultations.		406-752-7673	https://rosemountainfloral.com/weddings-events.html	https://www.instagram.com/rosemountain_floral/
Mum's Flowers	Florals	520 East Second Street	Whitefish	Montana	Whitefish, Kalispell, Columbia Falls	Downtown Whitefish flower shop delivering to Kalispell and Columbia Falls and taking wedding orders.		406-862-2757	https://mumsflowersonline.com/	https://www.instagram.com/mumsflowersmt/
`,
  },
  {
    name: "Billings: photography, florals, music, catering, hair & makeup, videography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Vande Studios	Photography		Billings	Montana	Red Lodge, Laurel	Billings photography company covering weddings, portraits and headshots, also serving Red Lodge and Laurel.			https://vandestudios.com/	https://www.instagram.com/vande_studios/
Blush Florals & Co.	Florals		Billings	Montana	Billings and beyond	Billings wedding and event floral design studio run by a single designer, creating florals for Billings couples and beyond.	jewlz@blushfloralsco.com		https://www.blushfloralsco.com/	https://www.instagram.com/blushflorals.co/
Big Zay DJ and MC	Music		Billings	Montana	Billings and Montana	Billings wedding DJ and MC offering packages for the ceremony and reception, with clean transitions between moments.	zaylynbyoung@gmail.com	+1 406-647-4436	https://dj.bigzay.com/	https://www.instagram.com/zaylyny/
Southern Hospitality Catering	Catering		Billings	Montana		Billings caterer founded in 2018 as Georgia John's Southern Hospitality, now serving events of up to 400 guests.			https://southernhospitalitymt.com/	https://www.instagram.com/southernhospitalitybygj/
Plush Skincare Studio	Hair & Makeup	1423 38th St West Suite #1	Billings	Montana		Billings skincare studio with a bridal page offering trials and packages for bridal parties.	plushskincarestudio@gmail.com	(406) 969-2018	https://plushskincarestudio.com/bridal/	https://www.instagram.com/plush.studios.aesthetics/
Montana Diaries	Videography		Billings	Montana		Billings videographer and photographer filming weddings and elopements, including in Red Lodge.	shayna@montanadiaries.com		https://montanadiaries.com/	
FM Entertainment	Music		Billings	Montana		Billings DJ service for weddings and events, with enquiries handled by email and phone through its contact page.	inbox@fmentmt.com	406-534-9888	https://www.fmentmt.com/contact	https://www.instagram.com/fmentertainmentmt/
Stacked, A Montana Grill	Catering	106 North Broadway	Billings	Montana	Billings	Billings restaurant building catering packages for weddings and engagement parties by group size and budget.		(406) 534-8702	https://stackedamontanagrill.com/catering	
`,
  },
];

export default batches;
