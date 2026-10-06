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
];

export default batches;
