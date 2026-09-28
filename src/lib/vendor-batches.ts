// Vendor batches researched from each vendor's own website, starting from the
// preferred-vendor lists Austin venues publish (see the commit that added each
// one for sources and what was left out). /admin/vendors offers to add any
// rows not yet in the database: add a batch here, merge, and click "Add them".
//
// Columns: Name, Category (one of VENDOR_LISTING_CATEGORIES), City, State,
// Service area, Description, Email, Phone, Website, Instagram. Latitude and
// Longitude can be added but needn't be: vendors are pinned near their town's
// centre. Write descriptions in our own words, never copy reviews, and leave
// out a vendor with no working site. Aim for 40-60 vendors per PR.

export type VendorBatch = { name: string; tsv: string };

export const VENDOR_BATCHES: VendorBatch[] = [
  {
    name: "Austin: photography, planning, catering, florals and music",
    tsv: `Name	Category	City	State	Service area	Description	Email	Phone	Website	Instagram
Emily Boone Photography	Photography	Austin	Texas		Candid, fine-art wedding and portrait photography that mixes documentary coverage with polished portraits.			https://www.emilyboone.com	https://www.instagram.com/emilyanneboone/
Hyde Park Photography	Photography	Austin	Texas	Austin and destination weddings	Award-winning wedding photography and cinematic video, booked separately or together.			https://www.hydeparkphoto.com	https://www.instagram.com/hydeparkphoto/
Lyndsay Lyon Photography	Photography	Austin	Texas	Texas and destination weddings	Wedding and lifestyle photographer covering engagements, bridals and the day itself around Central Texas.	lyndsaylyonphotography@gmail.com		https://www.lyndsayphoto.com	
Jingaling Photography	Photography	Austin	Texas	Austin and destination weddings	Documentary-style wedding photography and video, with editorial portraits and cinemagraphs.			https://www.jingalingphotography.com	https://www.instagram.com/jingalingphotography/
Alyssa Jarae Photography	Photography	Austin	Texas	Greater Austin	Editorial and documentary-style wedding photography with a soft, elegant colour edit.			https://alyssajaraephotography.com	https://www.instagram.com/alyssajaraephotography/
Deepicka Mehta Photography & Cinematography	Photography	Austin	Texas	Austin and worldwide	Luxury wedding photography and film blending photojournalism with editorial portraits; experienced with South Asian weddings.	info@deepickamehta.com		https://www.deepickamehta.com	https://www.instagram.com/deepickamehtaphotography/
Svetlana Photography	Photography	Austin	Texas	Austin and across Texas	Wedding photographer since 2002, with a lot of experience photographing Indian weddings.			https://www.lanafoto.com	https://www.instagram.com/svetlanaphotography_atx/
Jarrah Marie Photography	Photography	Austin	Texas	Texas and Colorado	Timeless, classic wedding photography with detailed planning help before the day.	jarrahmarie@gmail.com	(512) 317-2083	https://www.jarrahmariephotography.com	https://www.instagram.com/jarrahmariephotography/
Mylah Renae Photography	Photography	Austin	Texas	Austin and the Hill Country	Wedding photography focused on natural, emotional moments and timeless portraits.	hello@mylahrenae.com		https://www.mylahrenae.com	https://www.instagram.com/mylahrenae/
Amber Fletcher Photography	Photography	Austin	Texas		Wedding, engagement and bridal portrait photography in and around Austin.	amberfletcherphotography@yahoo.com		https://www.amberfletcher.com	https://www.instagram.com/amberfletcher.ym/
A Bride a Day	Planning	Austin	Texas	Greater Austin and Dallas–Fort Worth	Wedding coordination that takes over logistics and runs the ceremony and reception on the day.	abrideadayweddings@gmail.com		https://www.abrideaday.com	https://www.instagram.com/abrideadayweddings/
Ashley Nicole Affair	Planning	Austin	Texas	Texas and New Mexico	Full-service wedding planning team with decades of combined experience in the Austin area.			https://www.ashleynicoleaffair.com	
Clay & Vine	Planning	Austin	Texas	Central Texas and beyond	Full planning, partial planning, design and day-of coordination for weddings.	info@clayandvineevents.com		https://clayandvine.com	https://www.instagram.com/_clayandvine/
Kristin Catter Events	Planning	Austin	Texas		Wedding planning, design and coordination with a detail-driven, personalised approach.	info@kristincatterevents.com		https://www.kristincatterevents.com	https://www.instagram.com/kristincatterevents/
Red Book Events	Planning	Austin	Texas	Austin and the Hill Country	Full-service planning and coordination, plus bar service and curated rentals.	info@redbookevents.co	512-983-0793	https://redbookevents.co	https://www.instagram.com/redbookevent/
Pearl Events Austin	Planning	Austin	Texas	Austin and beyond	Planning and design studio handling design, hospitality and production for weddings.	info@pearleventsaustin.com	512-487-7047	https://pearleventsaustin.com	https://www.instagram.com/pearleventsaustin/
Simply XO Events	Planning	Austin	Texas	Austin and destination weddings	Full-service and partial wedding planning, design and coordination.	hello@simplyxoevents.com		https://www.simplyxoevents.com	https://www.instagram.com/simplyxoevents/
Glitzzy Events	Planning	Austin	Texas	Austin	Planners specialising in Indian and fusion weddings, from venue search to running every event of the celebration.	glitzzyevents@gmail.com	512-293-8786	https://glitzzyevents.com	https://www.instagram.com/glitzzyevents/
The Cordial Host	Planning	Austin	Texas	Austin and beyond	Month-of coordination through full-service planning, plus custom guest gifting and vintage sourcing.	hello@thecordialhost.com	737-333-7600	https://thecordialhost.com	https://www.instagram.com/cordialhost/
Crave Catering	Catering	Austin	Texas	Greater Austin	Full-service caterer since 1999 with custom menus and event staff for weddings.	info@crave-catering.com	(512) 828-5797	https://crave-catering.com	https://www.instagram.com/cravecateringtx/
Hank's Catering	Catering	Austin	Texas		Buffet and plated catering from the Hank's restaurant kitchen, with breads and pastries made in-house.			https://hankscateringaustin.com	https://www.instagram.com/hankscatering.austin/
PEJ Events	Catering	Austin	Texas	Austin, Dripping Springs, Round Rock, Cedar Park and Georgetown	Full-service caterer serving chef-driven modern Texas food with custom wedding menus.	info@pejevents.com	512-388-7650	https://pejevents.com	https://www.instagram.com/pej_events/
Rosemary's Catering	Catering	San Antonio	Texas	San Antonio, Austin and the Hill Country	Family-run full-service caterer since 1946, with custom menus for weddings across Central Texas.			https://www.rosemaryscatering.com	https://www.instagram.com/rosemaryscatering/
SoHo Events	Catering	Dripping Springs	Texas	Austin and the Hill Country	Full-service wedding catering and floral design from one team.	hello@sohoevents.com	512-910-8762	https://sohoevents.com	https://www.instagram.com/sohoeventco/
The Peached Tortilla	Catering	Austin	Texas	Austin	Asian-Southern fusion from the Austin restaurant and food truck, with full-service wedding catering and bar packages.	catering@thepeachedtortilla.com	512-222-8781	https://www.thepeachedtortilla.com/catering	https://www.instagram.com/peachedtortilla/
MML Catering & Events	Catering	Austin	Texas	Austin	Catering from MML Hospitality, the group behind several Austin restaurants, formerly Word of Mouth Catering.	info@mmlcatering.com	(512) 472-9500	https://www.mmlcatering.com	https://www.instagram.com/mmlcatering/
The Salt Lick	Catering	Driftwood	Texas	Austin and the Hill Country	Hill Country barbecue institution that caters weddings and hosts private events at its Driftwood pit.			https://saltlickbbq.com	https://www.instagram.com/saltlickbbq/
Flora Fetish	Florals	Austin	Texas	Austin and destination events	Award-winning floral studio designing everything from classic luxury to garden-style wedding flowers.	info@florafetish.com	512-293-9686	https://florafetish.com	https://www.instagram.com/florafetish/
Jordan Flowers & Events	Florals	Pflugerville	Texas	Austin and nationwide	Floral and event design studio known for large installations and statement pieces.			https://www.jordanflowersandevents.com	https://www.instagram.com/jordanflowersevent/
Jo.An Floral Design	Florals	Manchaca	Texas	Texas and Hawaii	Custom wedding florals, draping and event styling.	design@joanflorals.com	512-293-0785	https://www.joanflorals.com	https://www.instagram.com/jo.anfloraldesign/
Monarch Florals	Florals	Austin	Texas		Custom, one-of-a-kind floral arrangements for weddings and events.	brian@monarchflorals.com	512-219-6666	https://monarchflorals.com	https://www.instagram.com/monarchfloralsatx/
Visual Lyrics Floral Artistry	Florals	Cedar Park	Texas	Cedar Park and the north Austin suburbs	Three-generation family florist offering full-service wedding flowers and rental pieces, sourcing from local growers.		512-297-1228	https://visuallyrics.com	https://www.instagram.com/visuallyrics.floral/
Wild Bunches Floral	Florals	Austin	Texas	Austin and the Hill Country	Full-service wedding and event florist designing custom work since 2007.			https://www.wildbunchesfloral.com	https://www.instagram.com/wildbunchesfloral/
ZuZu's Petals Floral Studio	Florals	Georgetown	Texas	Georgetown, Leander and the Austin area	Custom wedding florals, full-service or à la carte.		512-986-7800	https://www.zuzuspetalsaustin.com	https://www.instagram.com/zuzuspetalsaustin/
Rosehip Flora	Florals	Austin	Texas	Austin and beyond	Boutique floral design studio creating custom wedding flowers since 2002.	erin@rosehipflora.com	512-917-6513	https://www.rosehipflora.com	https://www.instagram.com/rosehipflora/
Exodus Sound Company	Music	Austin	Texas	Worldwide	Live musicians through dinner and a DJ for dancing, booked as one package.	info@exodussound.co	(832) 655-5189	https://www.exodussound.co	https://www.instagram.com/markthedj/
Innovative DJ Entertainment	Music	Austin	Texas		Bilingual DJ company that also does lighting, video, photo booths and live music.	info@innodj.com	512-300-9851	https://www.innodj.com	https://www.instagram.com/innovativedj/
Premier Entertainment	Music	Austin	Texas	Texas and beyond	Bilingual wedding DJs, with photo booth and live musician add-ons.		512-956-8734	https://premieraustindjs.com	https://www.instagram.com/thepremierdjs/
Cap City Band	Music	Austin	Texas	Austin, Dallas, Houston, San Antonio and Denver	High-energy live dance band for weddings, covering many genres.		(512) 705-6541	https://www.capcityband.com	https://www.instagram.com/capcityband/
Uptown Drive	Music	Austin	Texas	Texas, Colorado and California	Live wedding band with a consistent lineup of professional musicians.		(512) 705-6541	https://www.uptowndrive.com	https://www.instagram.com/uptown_drive/
Mariachi Capitàl	Music	Austin	Texas	Austin and Central Texas	Professional mariachi band for ceremonies, receptions and serenades.		(512) 831-7020	https://www.mariachicapital.com	https://www.instagram.com/mariachiatx/
Sienna String Quartet	Music	Austin	Texas	Austin and San Antonio	String quartet and ensembles for ceremonies and cocktail hours, playing classical to contemporary.			https://www.siennaquartet.com	https://www.instagram.com/siennastringquartet/
Musical Discovery Chamber Players	Music	Austin	Texas	Austin	Classical musicians for ceremonies and receptions, from a soloist to a full ensemble.			https://www.musical-discovery.com	https://www.instagram.com/musicaldiscoverycaustin/
`,
  },
];
