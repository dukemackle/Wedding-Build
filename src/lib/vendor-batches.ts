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
  {
    name: "Austin: hair and makeup, videography, cake, officiants and rentals",
    tsv: `Name	Category	City	State	Service area	Description	Email	Phone	Website	Instagram
blush n' bangs	Hair & Makeup	Austin	Texas	Austin, Houston and beyond	On-location wedding hair and makeup focused on a natural, polished look.		(281) 989-5378	https://www.blushnbangs.com	https://www.instagram.com/blushnbangs/
Nia Ford Beauty	Hair & Makeup	Austin	Texas	Austin and nationwide	Bridal makeup artist, formerly I Bless Faces Artistry, who also teaches makeup classes.	niaford@iblessfacesartistry.com	737-247-1902	https://www.niafordbeauty.com	https://www.instagram.com/niafordbeauty/
LoLa Beauty	Hair & Makeup	Austin	Texas	Texas, Colorado and California	Award-winning bridal hair and makeup team known for romantic, soft wedding looks.			https://www.lolabeautyatx.com	https://www.instagram.com/lolabeautyatx/
LUX Beauty & Bridal	Hair & Makeup	Austin	Texas	Austin	Large team of hair and makeup artists covering weddings of any size, including big bridal parties.	hello@luxbeautyandbridal.com	903-354-4821	https://www.luxbeautyandbridal.com	
All Dolled Up	Hair & Makeup	Austin	Texas	Austin and destination weddings	Wedding hair and airbrush makeup using hypoallergenic products, and available for travel.	alldolledupatx@gmail.com	512-774-7971	https://alldolledupatx.com	https://www.instagram.com/alldolledupatx/
Hint of Shimmer	Hair & Makeup	Austin	Texas	Austin	Wedding makeup artists who also offer airbrush tanning before the day.			https://www.hintofshimmer.com	
Beautymark Agency	Hair & Makeup	Austin	Texas	Austin and nearby towns	Boutique studio since 2007 doing wedding hair, makeup and lashes, in-studio or on location.		512-589-2501	https://www.beautymarkagency.com	https://www.instagram.com/beautymarkagency/
Adore Makeup, Brow & Hair Salon	Hair & Makeup	Austin	Texas	Austin	Salon with a wedding team for bridal hair and makeup on the day.	adorecoordinator@gmail.com	512-524-0208	https://www.adoremakeupsalon.com	
Main Squeeze Photography	Videography	Austin	Texas	Austin and beyond	Husband-and-wife team shooting wedding video and photos with a bright, natural style.	hello@mainsqueezephotography.com		https://mainsqueezephotography.com	https://www.instagram.com/mainsqueezephotography/
PhotoHouse Films	Videography	Austin	Texas	Austin and worldwide	Documentary-style wedding films and photography, working since 2009.			https://photohousefilms.com	https://www.instagram.com/photohousefilms/
That's Amore Films	Videography	Austin	Texas	Austin, Dallas, Houston, San Antonio and worldwide	Cinematic, non-traditional wedding films with an Italian-inspired look.	contact@thatsamorefilms.com		https://www.thatsamorefilms.com	https://www.instagram.com/thatsamorefilms/
Nil Buan Videography	Videography	Pflugerville	Texas	Austin	Wedding videographer and filmmaker who also shoots commercial and documentary work.	nilbuan@gmail.com	(512) 699-1536	https://www.nilbuanvideography.com	
New Road Productions	Videography	Austin	Texas	Austin	Wedding films and photography with true-to-colour editing.			https://www.newroadproductions.com	https://www.instagram.com/newroadproductions/
Waterloo Films	Videography	Austin	Texas	Austin and Round Rock	Cinematic wedding videos built around each couple's story.			https://www.waterloofilms.com	https://www.instagram.com/waterloofilms/
Adam Grumbo Wedding Films	Videography	Hutto	Texas	Austin, Hill Country, Dallas, Houston, San Antonio and destination weddings	Wedding films shot on cinema cameras plus Super 8 and 16mm film.	adam@adamgrumboweddingfilms.com	719-964-6971	https://www.adamgrumboweddingfilms.com	https://www.instagram.com/grumbofilms/
Moonlit Wedding Films	Videography	Austin	Texas	Austin, Hill Country, San Antonio, Houston, Dallas–Fort Worth and the coast	4K and Super 8 wedding films since 2014, taking one wedding per day.	jake@moonlitweddings.com	908-216-7831	https://www.moonlitweddings.com	https://www.instagram.com/moonlitweddings/
Simon Lee Bakery	Cake	Austin	Texas	Austin	Custom and pre-designed wedding cakes baked fresh on the wedding day; tastings by appointment.			https://www.simonleebakery.com	https://www.instagram.com/simonleebakery/
Michelle's Patisserie	Cake	Austin	Texas	Austin	Custom wedding cakes in over 30 flavours, plus desserts and catering.	michelle@michellespatisserie.com		https://www.michellespatisserie.com	https://www.instagram.com/michellespatisserie/
Nordic Galley Bakeri	Cake	Austin	Texas	Austin	Custom, artistic wedding cakes designed one couple at a time.		512-636-1103	https://www.nordicgalley.com	https://www.instagram.com/nordicgalley/
Kayla Knight Cakes	Cake	Round Rock	Texas	Austin and surrounding areas	Boutique bakery making custom buttercream wedding cakes.		512-869-9807	https://www.kaylaknightcakes.com	https://www.instagram.com/kaylaknightcakes/
Sugar Mama's Bakeshop	Cake	Austin	Texas	Austin	Award-winning bakery making custom wedding cakes and cupcakes.	info@sugarmamasbakeshop.com	(512) 448-3727	https://www.sugarmamasbakeshop.com	https://www.instagram.com/sugarmamasbakeshopatx/
Feathers & Frosting	Cake	Austin	Texas	Austin	Custom wedding cakes, known as Austin's original shag-cake bakery; taking wedding orders only.			https://www.feathersandfrosting.com	
TheKnotTyer (Scott Payne)	Officiant	Austin	Texas	Austin, Lakeway, Cedar Park, Round Rock, Marble Falls, Fredericksburg and the Hill Country	Christian wedding officiant with over 40 years of ministry, writing a custom ceremony with each couple.			https://www.theknottyer.com	
Short and Sweet Weddings	Officiant	Round Rock	Texas	Greater Austin and the Hill Country	Wedding officiants performing full or partial ceremonies in English and Spanish.	info@shortandsweetweddings.com	512-704-4678	https://www.shortandsweetweddings.com	
Spoken Heart Ceremonies	Officiant	Austin	Texas	Central Texas, including Wimberley, Georgetown, Dripping Springs and Round Rock	Officiant Katrina Baecht writes personal ceremonies, including LGBTQ+, non-religious and interfaith.	katrinabaecht@gmail.com		https://spokenheartceremonies.com	
Texas Wedding Ministers	Officiant	San Antonio	Texas	All of Texas, including Austin and the Hill Country	Team of officiants covering religious, secular, bilingual and same-sex ceremonies statewide.			https://txweddingministers.com	https://www.instagram.com/txweddingministers/
Bee Lavish Event Rentals	Rentals	Austin	Texas	Austin	Vintage furniture, décor and accessories for weddings, by appointment.		(512) 944-4024	https://beelavish.com	https://www.instagram.com/beelavishvintage/
Party at the Moontower	Rentals	Austin	Texas	Austin	Design-forward furniture and décor rentals with custom fabrication, in a modern-eclectic style.	info@moontowerrentals.com	(512) 522-4982	https://moontowerrentals.com	https://www.instagram.com/moontowerrentals/
Premiere Events	Rentals	Austin	Texas	Central Texas, Bryan–College Station and north Houston	Family-owned rental company with tents, furniture, linens, tableware and catering equipment.		(512) 292-3900	https://premiereeventsonline.com	https://www.instagram.com/premiereeventstx/
LUX Event Rentals	Rentals	Austin	Texas	Austin	Furniture, tents, tables, linens, lighting and décor rentals, operating for over 18 years.	myevent@luxeventrentals.net	512-551-2186	https://www.luxeventrentals.net	https://www.instagram.com/luxeventrentals1/
Table Manners	Rentals	Austin	Texas	Austin and Central Texas	Tabletop rentals: china, glassware, flatware and serving pieces.			https://www.tablemannerstx.com	
Loot Rentals	Rentals	Austin	Texas	Austin, Dallas–Fort Worth, Houston and San Antonio	Vintage and design-forward furniture rentals and event styling.		(512) 464-1184	https://lootrentals.com	
`,
  },
  {
    name: "Austin: photo booths, transport, stationery, bridal, desserts, decor and bar",
    tsv: `Name	Category	City	State	Service area	Description	Email	Phone	Website	Instagram
Oh Happy Day Booth	Photo Booth	Austin	Texas	Austin, San Antonio, San Marcos, Dallas, Houston and College Station	Sleek, modern photo booths with custom prints and digital sharing.	hello@ohhappydaybooth.com	512-774-4975	https://www.ohhappydaybooth.com	https://www.instagram.com/ohhappydaybooth/
Pixster Photo Booths	Photo Booth	Austin	Texas	Austin, Houston, Dallas, San Antonio and beyond	Award-winning photo booth company with several booth styles and custom packages.	smile@pixsteraustin.com	1-888-668-5524	https://www.pixsteraustin.com	https://www.instagram.com/pixsterphotobooth/
Say Cheese Photo Booths	Photo Booth	Austin	Texas	Austin and Central Texas	Photo booth rentals in more than a dozen styles.	events@saycheesephotobooths.com	512-643-7766	https://www.saycheesephotobooths.com	https://www.instagram.com/saycheese.photobooths/
Around Austin	Transportation	Austin	Texas	Austin	Group transportation and guest shuttle coordination for events.			https://www.around-austin.com	
ETI Limo & Charter	Transportation	San Antonio	Texas	Texas, including Austin	Charter buses, minibuses and limousines for moving wedding guests; has an Austin office.	info@etilimo.com	(512) 452-5466	https://etilimo.com	https://www.instagram.com/eti_limo/
Lux Limo	Transportation	Austin	Texas	Austin and surrounding areas	Chauffeured luxury cars and limousines for weddings and airport runs.	info@theluxlimo.com	512-215-4971	https://theluxlimo.com	https://www.instagram.com/lux.limo.atx/
4 Leaf Limo	Transportation	Austin	Texas	Austin, Georgetown and Hutto	Locally owned black-car service running since 2011.	info@4leaflimo.com	(512) 633-0004	https://www.4leaflimo.com	https://www.instagram.com/4leaflimoatx/
ATX Classic Cars	Transportation	Dripping Springs	Texas	Central Texas	Vintage car rentals for the getaway, photos and arrivals.		512-970-9566	https://www.atxclassiccars.com	https://www.instagram.com/atxclassiccars/
Uptown Valet & Transportation	Transportation	Austin	Texas	Greater Austin	Valet parking and guest transportation for weddings and events.	reservations@uptownvalet.com	512-394-6210	https://www.uptownvalet.com	https://www.instagram.com/uptownvalet/
Flourish Creative Studio	Stationery & Invitations	Austin	Texas	Greater Austin	Custom wedding stationery and signage, with over 200 display pieces to rent.			https://flourish-creative-studio.com	https://www.instagram.com/flourish.creative.studio/
Peach Paper & Design	Stationery & Invitations	Austin	Texas	Austin and nationwide	Custom wedding invitations, day-of paper and signage.			https://www.peachpaperdesign.com	https://www.instagram.com/peachpapertx/
The Inviting Pear	Stationery & Invitations	Austin	Texas	Austin and nationwide	Design studio making custom luxury invitations and day-of stationery.	info@theinvitingpear.com	512-203-4062	https://www.theinvitingpear.com	https://www.instagram.com/the_inviting_pear/
Alexia Gavela Bridal	Bridal & Formalwear	Austin	Texas	Austin	Bridal boutique with its own custom gowns and designer collections, plus alterations.		512-419-7818	https://www.alexiagavela.com	
Sorek	Bridal & Formalwear	Austin	Texas	Austin	East 6th Street barbershop and custom menswear, with wedding packages for suits and grooming.	info@sorek.co	(512) 877-7563	https://sorek.com	https://www.instagram.com/sorektx/
Blue Bridal Boutique	Bridal & Formalwear	Austin	Texas	Austin	Women-owned bridal salon with established and up-and-coming designers and a body-positive approach; by appointment.		512-441-7700	https://www.bluebridalaustin.com	https://www.instagram.com/bluebridalaustin/
Blush Bridal Lounge	Bridal & Formalwear	Austin	Texas	Austin	Bridal boutique with designer gowns, plus-size collections and accessories.	info@blushbridallounge.com	(512) 407-9236	https://www.blushbridallounge.com	https://www.instagram.com/blushbridallounge/
Melange Bridal	Bridal & Formalwear	Austin	Texas	Austin	Bridal salon carrying gowns from well-known international designers.	info@melangebridal.com	512-345-8780	https://www.melangebridal.com	https://www.instagram.com/melangebridalatx/
Unbridaled	Bridal & Formalwear	Austin	Texas	Austin, Houston and New Orleans	Made-to-order gowns from independent ateliers and established labels.	austin@unbridaled.com	(512) 444-2743	https://www.unbridaled.com	https://www.instagram.com/unbridaled/
Caketini Bar & Co	Desserts	Austin	Texas	Austin	Interactive dessert bars with layered cake cups, plus wedding cakes and shot bars.	caketinibar.co@gmail.com	512-422-8269	https://www.caketinibar.com	https://www.instagram.com/caketinibar.co/
Dolce Social Club	Desserts	Austin	Texas	Austin	Italian dessert stations like cannoli bars, tiramisu and Italian sodas.	info@dolcesocialclub.com		https://www.dolcesocialclub.com	
The Cupcake Bar	Desserts	Austin	Texas	Austin	Interactive dessert catering and cupcake bars, running since 2007.			https://www.thecupcakebar.com	
Polkadots Bakery	Desserts	Austin	Texas	Austin	Hand-iced cupcakes, cookies and decorated cakes for weddings.	info@polkadotscupcakefactory.com	512-476-3687	https://www.polkadotscupcakefactory.com	https://www.instagram.com/polkadotsatx/
Sweet Treets Bakery	Cake	Austin	Texas	Central Texas	Woman-owned custom cake shop making wedding cakes and desserts.		(512) 892-2233	https://www.sweettreetsbakery.com	https://www.instagram.com/sweettreetsbakery/
Altared Weddings & Events	Decor & Lighting	Austin	Texas	Austin	Event lighting, draping, décor installations and photo booths, with sound and DJ services too.	info@altaredweddings.com	(512) 255-6788	https://altaredweddings.com	https://www.instagram.com/altared_weddings/
Neon Moon ATX	Decor & Lighting	Austin	Texas	Austin	Budget-friendly rentals of string lights, dance floors, arches, bars and photo booths.			https://www.neonmoon.online	
Unique Design & Events	Decor & Lighting	Pflugerville	Texas	Austin	Ceiling and tent draping and custom décor for weddings since 2008.	info@uniquedesignandevents.com	512-522-5924	https://uniquedesignandevents.com	https://www.instagram.com/uniquedesignandevents/
ILIOS Production Design	Decor & Lighting	Austin	Texas	Austin	Lighting design and production for weddings, concerts and corporate events since 2003.			https://iliosproductions.com	
Brighter Side Event Lighting	Decor & Lighting	Austin	Texas	Austin	Uplighting, festoon string lights, monograms and pin spotting for weddings.			https://brightersideeventlighting.com	
Hill Country Events	Bar	Cedar Park	Texas	Central Texas	Bartending service since 1998 with house-made cocktails and margaritas.		512-259-1755	https://www.hillcountryeventsllc.com	
Night Owl Events	Bar	Burnet	Texas	The Hill Country	Wedding bartending, plus custom cakes.	lauren@nightowleventstx.com	512-565-9359	https://www.nightowleventstx.com	
Drink to Remember	Bar	Austin	Texas	Austin, Dripping Springs, Fredericksburg and the Hill Country	Mobile bar with TABC-certified bartenders and craft cocktails.	info@dtrbartending.com	(512) 484-5128	https://www.dtrbartending.com	https://www.instagram.com/dtrbartending/
Bea's Mobile Bartending	Bar	Austin	Texas	Austin, Kyle, Buda and San Marcos	Mobile bartending plus table and chair rentals.	beasmobilebartending@gmail.com	(512) 850-1328	https://www.beasmobilebartending.com	
Bar La Maison	Bar	Round Rock	Texas	Austin	Mobile bar and signature cocktails for weddings.	hello@barlamaisontx.com	(512) 297-7790	https://barlamaisontx.com	https://www.instagram.com/barlamaisonatx/
`,
  },
];
