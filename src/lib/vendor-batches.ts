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
  {
    name: "San Antonio, New Braunfels and Boerne: first batch",
    tsv: `Name	Category	City	State	Service area	Description	Email	Phone	Website	Instagram
ADC Catering Group	Catering	San Antonio	Texas	San Antonio	Full-service caterer, formerly Absolutely Delicious, producing custom menus for weddings and private events.		210-342-2321	https://adccateringgroup.com	https://www.instagram.com/absolutelydeliciouscatering/
Got It Covered Events	Catering	San Antonio	Texas	San Antonio	Catering with linens and service included, aiming for a polished event without the high price.			https://gotitcoveredsa.com	
Anne Marie's Catering & Event Center	Catering	San Antonio	Texas	San Antonio	Catering, planning and décor, plus its own event venue.	info@annemaries.com	(210) 545-2249	https://annemaries.com	https://www.instagram.com/annemarieseventcenter/
PG Special Events	Catering	San Antonio	Texas	San Antonio and surrounding areas	Custom-menu catering focused on fresh ingredients.		(210) 843-7229	https://pgspecialevents.com	https://www.instagram.com/pgspecialeventscatering/
True Flavors Catering	Catering	San Antonio	Texas	San Antonio	Caterer offering event rentals too, building each menu with the couple.	info@trueflavors.com	(210) 226-3670	https://www.trueflavors.com	https://www.instagram.com/trueflavorssa/
Heavenly Gourmet	Catering	San Antonio	Texas	San Antonio and Helotes	Wedding and event catering.	info@heavenlyg.com	210-496-9090	https://www.heavenlyg.com	https://www.instagram.com/heavenlygourmetcatering/
Texas Prime Catering	Catering	San Antonio	Texas	San Antonio	Gourmet on-site catering and mobile bar rentals.	txprimecatering@gmail.com		https://www.texasprimecatering.com	
Mana Sabroso	Catering	San Antonio	Texas	San Antonio and Austin	Wedding catering cooked fresh on site at the venue.	eventorder@manasabroso.com	(210) 931-4572	https://manasabroso.com	
Smoke in the Hills BBQ	Catering	Boerne	Texas	San Antonio and the Hill Country	Award-winning Hill Country barbecue catering, smoked low and slow.	kelly@smokeinthehillsbbq.com	830-230-5500	https://smokeinthehillsbbq.com	https://www.instagram.com/smokeinthehillsbbq/
Scarlet Rose Weddings + Events	Planning	San Antonio	Texas	San Antonio, Austin and across Texas	Wedding planning and design, plus a rental collection.			https://scarletroseevents.com	https://www.instagram.com/scarletroseevents/
All In The Details Events	Planning	San Antonio	Texas	San Antonio	Wedding and event planners.		(210) 865-6150	https://allinthedetails.events	https://www.instagram.com/allinthedetailsevents/
Weddings by Diana Boucher	Planning	San Antonio	Texas	San Antonio	Luxury wedding planning with over 30 years of experience.		(210) 854-8721	https://weddingsbydianaboucher.com	https://www.instagram.com/weddingsbydianaboucher/
Elite Event Planning	Planning	San Antonio	Texas	San Antonio	High-touch wedding planning, wedding management and event design.		210-426-1998	https://elite-eventplanning.com	https://www.instagram.com/eliteeventplanningsatx/
Lila Lane Events	Planning	New Braunfels	Texas	Central Texas, including San Antonio and Austin	Wedding planning and design based in New Braunfels.			https://lilalaneevents.com	https://www.instagram.com/lilalaneevents/
JC Events	Planning	San Antonio	Texas	San Antonio	Wedding and event planner Jennifer Craft.	jennifer@jcraftevents.com	210-643-7133	https://eventsbyjennifercraft.com	https://www.instagram.com/jcraftevents/
Sweet Gardenia Weddings	Planning	San Antonio	Texas	San Antonio, Boerne, New Braunfels and the Hill Country	Award-winning boutique wedding planning and coordination.	stephanie@sweetgardeniaweddings.com	(210) 954-5780	https://www.mysanantoniowedding.org	https://www.instagram.com/sanantonioweddingplanner/
My Forever by Nikki	Planning	San Antonio	Texas	San Antonio and surrounding cities	Award-winning wedding planning and coordination.	myforeverbynikki@gmail.com	210-326-7694	https://www.myforeverbynikki.com	https://www.instagram.com/myforeverbynikki/
The Perfect Day	Planning	New Braunfels	Texas	New Braunfels, San Antonio, Austin and Canyon Lake	Wedding planning and design team.	info@theperfectdaynb.com	(830) 632-5162	https://www.theperfectdaynb.com	https://www.instagram.com/theperfectdaynb/
Jessica Chole Photography	Photography	San Antonio	Texas	San Antonio, Austin and the Hill Country	Romantic, timeless wedding photography with over 400 weddings shot.			https://jessicachole.com	https://www.instagram.com/jessicacholephotography/
Gricelda's Photography	Photography	San Antonio	Texas	San Antonio	Timeless, elegant wedding and engagement photography.	info@griceldasphotography.com		https://griceldasphotography.com	https://www.instagram.com/griceldasphotography/
Allison Jeffers Wedding Photography	Photography	San Antonio	Texas	San Antonio, Fredericksburg and the Hill Country	Award-winning wedding photographer with a joyful, timeless style.	info@allisonjeffers.com		https://allisonjeffers.com	https://www.instagram.com/allisonjeffersphotography/
Under the Sun Photography	Photography	San Antonio	Texas	San Antonio, Austin and New Braunfels	Wedding photographer with ten years of experience.			https://underthesunphotography.com	https://www.instagram.com/underthesunphotos/
Dos Kiwis Studio	Photography	San Antonio	Texas	San Antonio	Award-winning pair of fine-art wedding and portrait photographers.	dane@doskiwis.com	210-735-5555	https://www.doskiwis.com	https://www.instagram.com/doskiwis/
Limelight Photo & Video	Photography	San Antonio	Texas	San Antonio, New Braunfels and Austin	Wedding photography and video from one studio.	events@limelightsanantonio.com	210-842-6620	https://www.limelightsanantonio.com	
WalstonPhoto	Photography	Cibolo	Texas	San Antonio and Boerne	Photography team shooting candid, documentary-style weddings.	royce@walstonphoto.com	210-827-0784	https://www.walstonphoto.com	https://www.instagram.com/walstonphoto_tx/
Gillian Menzie Photography	Photography	San Antonio	Texas	San Antonio	Fine-art wedding and portrait photographer.			https://gillianmenzie.com	https://www.instagram.com/gillian_menzie_photography/
Evember Floral & Event Design	Florals	San Antonio	Texas	San Antonio and the Hill Country	Timeless wedding florals.		210-952-2825	https://evember.com	https://www.instagram.com/evemberfloral/
Wolf Weddings	Florals	San Antonio	Texas	San Antonio and the Hill Country	Wedding florals and décor, plus planning.	wolfweddings@gmail.com	210-269-7996	https://wolfweddings.com	https://www.instagram.com/wolfweddings/
Belle Fleur	Florals	San Antonio	Texas	San Antonio	Wedding and event florist.	bellefleursatx@gmail.com	210-454-7818	http://www.bellefleurtx.com	
San Antonio Floral Designs	Florals	San Antonio	Texas	San Antonio	Wedding and event florals.			https://www.sanantoniofloraldesigns.com	https://www.instagram.com/sanantoniofloraldesigns/
Platinum DJ Entertainment	Music	San Antonio	Texas	San Antonio	Wedding and event DJs.	brandon@platinumdjentertainment.com	210-831-2007	https://platinumdjentertainment.com	https://www.instagram.com/platinumdj_sa/
At Last Entertainment & Events	Music	San Antonio	Texas	San Antonio	Wedding DJs and entertainment, plus planning and coordination.	info@atlastent.com		https://atlastent.com	https://www.instagram.com/atlastentertainmentandevents/
Power Sounds Event Entertainment	Music	San Antonio	Texas	San Antonio, Austin, Boerne and New Braunfels	Wedding DJs.		(210) 365-0052	https://www.powersoundsdj.com	https://www.instagram.com/powersoundsdj/
Gaines Entertainment	Music	San Antonio	Texas	San Antonio and Austin	High-energy DJs, hybrid live musicians and photo booths.	info@gainesentservices.com	(210) 995-3626	https://www.gainesentservices.com	https://www.instagram.com/gainesentertainment/
Mariachi Los Galleros de San Antonio	Music	San Antonio	Texas	San Antonio	Mariachi band for ceremonies, receptions and serenades.		210-884-8909	https://losgalleros.net	https://www.instagram.com/gallerosdesanantonio/
Northern Lights DJ Services	Music	San Antonio	Texas	San Antonio	Wedding DJs with live sax, lighting and day-of coordination add-ons.	admin@northernlightsdjservices.com	(210) 701-1505	https://www.northernlightsdjservices.com	https://www.instagram.com/northern_lights_dj/
Four Star Entertainment	Music	San Antonio	Texas	San Antonio	Wedding and event DJ company.	fourstardj@hotmail.com	210-326-0649	https://fourstardjevents.com	https://www.instagram.com/four_star_entertainment/
Allegretto Music	Music	San Antonio	Texas	San Antonio and Austin	Ceremony musicians: string quartet, violin, harp and cello ensembles.	mail@allegrettomusic.com	210-854-7884	https://www.allegrettomusic.com	
Cello Vida	Music	San Antonio	Texas	San Antonio	Wedding string musicians, from solo cello to string quartet.	info@cellovida.com	(210) 400-7472	https://www.cellovida.com	https://www.instagram.com/sanantonioweddingmusicians/
Mark Thomas Films	Videography	Seguin	Texas	San Antonio, Boerne and the Hill Country	Story-driven wedding videography and photography.	mark@markthomasfilms.com	830-743-2151	https://www.markthomasfilms.com	https://www.instagram.com/markthomasfilms/
The Veil Artistry	Hair & Makeup	San Antonio	Texas	San Antonio	Bridal hair and makeup.	info@theveilartistry.com		https://theveilartistry.com	https://www.instagram.com/veilartistry_/
Braid N'Hairpins	Hair & Makeup	San Antonio	Texas	San Antonio, Austin and the Hill Country	Bridal hair and makeup team.	roneeaguilar@braidnhairpins.com	210-852-9795	https://www.braidnhairpins.com	https://www.instagram.com/bnhmakeupandhair/
Cakes by Cathy Young	Cake	San Antonio	Texas	San Antonio	Custom wedding cakes.	hello@cakesbycathyyoung.com		https://www.cakesbycathyyoung.com	https://www.instagram.com/cakesbycathyyoung/
Cake & More Bake Shop	Cake	San Antonio	Texas	San Antonio	Custom wedding cakes and desserts.	cynthia@sacakes.com	(210) 494-3959	https://cakesandmorebakery.com	https://www.instagram.com/cakesandmorebakeshop/
2tarts Bakery	Cake	New Braunfels	Texas	New Braunfels	Downtown New Braunfels bakery and café making wedding cakes.		(830) 387-4606	https://2tarts.com	https://www.instagram.com/2tartsbakery/
Betty Jane's Bakeshoppe	Cake	San Antonio	Texas	San Antonio	Custom bakery known for luxury wedding cakes and groom's cakes.		210-492-1952	https://www.bettyjanesbakeshoppe.com	https://www.instagram.com/bettyjanes/
Asukar	Desserts	San Antonio	Texas	San Antonio	Specialty cakes and sweets.	hello@myasukar.com	210-764-9614	https://www.asukar.com	https://www.instagram.com/myasukar/
Reunion Coffee Cart	Desserts	San Antonio	Texas	San Antonio, New Braunfels, Boerne and the Hill Country	Mobile espresso cart with baristas for weddings.			https://reunioncoffeecart.com	
Moonstruck Weddings	Officiant	San Antonio	Texas	San Antonio and the Hill Country	Non-denominational minister, Reverend Garner, for weddings and vow renewals.	revgarner@moonstruckweddings.com	210-241-9315	https://moonstruckweddings.com	
A Wedding Priest on Call	Officiant	San Antonio	Texas	San Antonio and Central Texas	Catholic priest who officiates weddings.	aweddingpriestoncall@gmail.com	210-452-7627	https://www.aweddingpriestoncall.com	https://www.instagram.com/aweddingpriestoncall/
It's A Wonderful Life Weddings	Officiant	San Antonio	Texas	San Antonio and Austin	Award-winning officiant Pastor David, known for imaginative, personal ceremonies.	pastordavidbarger@gmail.com	210-712-5458	https://www.itsawonderfullifeweddings.com	
DPC Event Services	Rentals	San Antonio	Texas	San Antonio	Rental company with over 22 event services, from furniture to entertainment.		210-479-5541	https://dpceventservices.com	https://www.instagram.com/dpcevents/
CRU Vintage Rentals	Rentals	Boerne	Texas	Boerne, San Antonio and Austin	Vintage furniture and décor rentals.			https://www.crurentals.com	
Great Event Rentals	Rentals	San Antonio	Texas	San Antonio	Tents, lighting, furniture and décor rentals with full-service setup.		(210) 340-2007	https://greateventrentals.com	
Absolute Rentals	Rentals	San Antonio	Texas	San Antonio, Central and South Texas	Wedding rentals serving San Antonio and the Hill Country.		(210) 696-5376	https://www.absoluterentalssa.com	https://www.instagram.com/absoluterentalssa/
MBP Photo Booth	Photo Booth	San Antonio	Texas	San Antonio and Austin	Photo booth rentals with social sharing and instant prints.	info@mbpphotoboothco.com	210-307-6111	https://www.mbpphotoboothco.com	https://www.instagram.com/mbpphotobooth/
Alpha-Lit San Antonio	Decor & Lighting	San Antonio	Texas	San Antonio	Light-up marquee letter and number rentals.	sanantonio@alphalitletters.com		https://alphalitsanantonio.com	
Unique Event Services	Bar	San Antonio	Texas	San Antonio	Bartending, rentals and coordination packages for weddings.	shelly@uniqueeventservices.com	210-294-4510	https://www.uniqueeventservices.com	https://www.instagram.com/uniqueeventservices/
Team One Luxury	Transportation	New Braunfels	Texas	San Antonio, New Braunfels and the Hill Country	Wedding transportation and charters, plus planning.	events@teamoneluxury.com	830-237-2038	https://www.teamoneluxury.com	https://www.instagram.com/teamoneluxuryevents/
`,
  },
  {
    name: "San Antonio, New Braunfels and Boerne: second batch",
    tsv: `Name	Category	City	State	Service area	Description	Email	Phone	Website	Instagram
Dillon Ross Kirk Photography	Photography	San Antonio	Texas	San Antonio and destination weddings	Wedding and portrait photographer focused on emotional, elegant coverage of the day.			https://www.dillonrosskirk.com	https://www.instagram.com/dillonrosskirk/
Infinite Photography SA	Photography	San Antonio	Texas	San Antonio and the Hill Country	Wedding photography and video from one team, with drone coverage available.			https://www.infinitephotographysa.com	https://www.instagram.com/infinitephotographysa/
Nomatic Wedding Films	Videography	San Antonio	Texas	San Antonio and worldwide	Wedding videography team with over twenty years of combined experience filming weddings at home and abroad.		210-500-0301	https://www.nomaticweddingfilms.com	https://www.instagram.com/nomaticweddingfilms/
Mistique Makeup	Hair & Makeup	San Antonio	Texas	San Antonio, Austin, Dripping Springs and Dallas–Fort Worth	Bridal hair and makeup team working since 2005, with studios in San Antonio, Dripping Springs and Fort Worth.		(210) 602-9672	https://mistiquemakeup.com	https://www.instagram.com/mistiquemakeup/
Crystel Does Hair	Hair & Makeup	San Antonio	Texas	San Antonio and the Hill Country within about 90 miles	On-site bridal hair and makeup team known for glam looks and romantic hairstyles.			https://www.crysteldoeshair.com	https://www.instagram.com/crysteldoeshair/
Hill Country Bridal Stylists	Hair & Makeup	San Antonio	Texas	San Antonio, Fredericksburg and the Hill Country	On-location bridal hair and makeup aimed at a natural, true-to-you look.	andrea@hillcountrybridalstylists.com	210-325-1019	https://hillcountrybridalstylists.com	https://www.instagram.com/hillcountry_bridalstylists/
Petále Haus Floral Design	Florals	San Antonio	Texas	San Antonio	Florist and flower farm designing foam-free wedding flowers built around the season and colour.			https://petalehaus.com	https://www.instagram.com/petalehaus/
Botanika	Florals	San Antonio	Texas	San Antonio	Wedding and event florist designing statement flowers for ceremonies and receptions.	melissa@botanika.com	(210) 733-8120	https://www.botanika.com	https://www.instagram.com/botanika_brilliantstatementinc/
Petal Palace	Florals	San Antonio	Texas	San Antonio	Local flower shop of more than forty years that also does wedding flowers.	petalpalace@att.net	(210) 650-4223	https://www.petalpalaceflorist.com	https://www.instagram.com/petalpalace/
The Tuscan Rose	Florals	San Antonio	Texas	San Antonio	Local florist making bespoke wedding flowers alongside everyday arrangements.	thetuscanrose1@gmail.com	(210) 479-0777	https://thetuscanrose.com	https://www.instagram.com/tuscanrosefloral/
Statue of Design	Florals	San Antonio	Texas	San Antonio	Boutique floral studio known for artistic, avant-garde wedding designs.		210-829-0636	https://statueofdesign.com	
Fabled Blossom	Florals	Seguin	Texas	San Antonio and beyond	Full-service floral studio with a whimsical, storybook style for weddings.	fabledblossom@gmail.com		https://www.fabledblossom.com	https://www.instagram.com/fabledblossom/
Piper Rose Floral Design	Florals	Bulverde	Texas	San Antonio, Boerne, New Braunfels and the Hill Country	Garden-inspired wedding flowers from a studio in Bulverde.	info@piperrosefloral.com	830-369-7737	https://piperrosefloral.com	https://www.instagram.com/piper.rose.floral/
Wanderlust & Wild	Florals	San Antonio	Texas	San Antonio and Columbus	Wedding and event florist working from San Antonio and Columbus, Texas.	inquire@wanderlustandwild.com		https://www.wanderlustandwild.com	https://www.instagram.com/wanderlust_andwild/
Freesia Designs	Florals	San Antonio	Texas	San Antonio, Boerne and Houston	Wedding florals plus event décor and rentals.		(210) 362-1998	https://freesiadesignsevents.com	https://www.instagram.com/freesiadesignsevents/
Infinity Cakes	Cake	San Antonio	Texas	San Antonio	Custom wedding cakes designed to order.	infinitycakesandmore@gmail.com	(210) 323-0251	https://infinity-cakes.com	https://www.instagram.com/infinitycakesandmore210/
Nadler's Bakery & Deli	Cake	San Antonio	Texas	San Antonio	Family-owned bakery open since 1963, making custom wedding cakes.	info@nadlers.com	(210) 340-1021	https://www.nadlers.com	https://www.instagram.com/nadlersbakery/
Naegelin's Bakery	Cake	New Braunfels	Texas	New Braunfels	Long-running New Braunfels bakery that makes custom wedding cakes.	naegelinsbakery@icloud.com	(830) 625-5722	https://www.naegelins.com	https://www.instagram.com/naegelinsbakery/
Emerald Whisk Bakery	Cake	New Braunfels	Texas	New Braunfels	Custom cakes, cookies, macarons and French desserts.	info@emeraldwhisktx.com	830-358-6623	https://www.emeraldwhisktx.com	https://www.instagram.com/emeraldwhisk/
Sugar'd Bakehouse	Cake	San Antonio	Texas	San Antonio	Bakery making custom cakes and desserts for weddings.	info@sugardbakehouse.com	210-880-1013	https://www.sugardbakehouse.com	https://www.instagram.com/sugard_bakehouse/
Sugar Clouds Cotton Candy	Desserts	San Antonio	Texas	San Antonio	Cotton candy made on site as a dessert station for weddings.	sugarcloudscottoncandy@yahoo.com	210-800-2738	https://sugarcloudscottoncandy.com	
Your Wedding Reverend	Officiant	San Antonio	Texas	San Antonio, New Braunfels, Gruene and the Hill Country	Bilingual officiant writing personalised ceremonies in English, Spanish or both.	karol@yourweddingreverend.com	(347) 878-2320	https://www.yourweddingreverend.com	https://www.instagram.com/yourweddingreverend/
Three Strand Cord Weddings	Planning	New Braunfels	Texas	New Braunfels and the San Antonio area	Wedding planning and coordination from a New Braunfels planner.	info@threestrandcordweddings.com		https://www.threestrandcordweddings.com	https://www.instagram.com/threestrandcordweddings/
Sweet August Events	Planning	San Antonio	Texas	San Antonio	Wedding planning and event design team.	info@sweetaugustevents.com	210-269-5641	https://www.sweetaugustevents.com	https://www.instagram.com/sweetaugustevents/
Hill Country Planning	Planning	Boerne	Texas	San Antonio, Boerne, Comfort, Kerrville and Fredericksburg	Planners with over twenty years' experience, offering design, day-of coordination or full production.		(210) 723-9547	https://www.hillcountryplanning.com	
Bride on a Budget Events	Planning	San Antonio	Texas	San Antonio, Boerne, New Braunfels, Fredericksburg and Austin	Budget-friendly full planning, month-of and day-of coordination, plus floral design.	brideonabudgetsa@gmail.com	210-954-4552	https://www.bbsanantonioweddingplanners.com	https://www.instagram.com/brideonabudgetevents/
J's Party Rentals	Rentals	San Antonio	Texas	San Antonio	Event rentals since 2006, with planning and coordination available.		(210) 694-2671	https://www.jspartyrentals.com	
Illusions Rentals & Designs	Rentals	San Antonio	Texas	San Antonio	Large rental inventory covering tables, chairs, linens, dishware, lighting and tents.		(210) 223-2742	https://www.illusionsrentals.com	https://www.instagram.com/illusionsrentals/
DJZ Event Group	Music	San Antonio	Texas	San Antonio	Bilingual wedding DJs and MCs, with photo booths, LED robots and cold sparklers as add-ons.			https://www.djzeventgroup.com	https://www.instagram.com/djz_events/
Elite Sound Productions	Music	San Antonio	Texas	San Antonio and surrounding areas	Wedding DJ service with uplighting and monogram gobos.		(210) 306-1071	https://www.elitesoundproductions.com	https://www.instagram.com/elitesoundproductionssa/
San Antonio String Quartet	Music	San Antonio	Texas	San Antonio	String quartet, trio or duo for ceremonies and receptions.			http://www.sanantonioquartet.com	
Riverwalk String Quartet	Music	San Antonio	Texas	San Antonio	String quartet playing ceremony music and receptions.		(210) 229-8521	https://www.riverwalkquartet.com	
RMD Photo Booths	Photo Booth	San Antonio	Texas	San Antonio	Photo booth rentals for weddings and events.	info@rmdphotobooths.com	(210) 934-6850	https://rmdphotobooths.com	https://www.instagram.com/rmdphotobooths/
ANS Photo Booth	Photo Booth	San Antonio	Texas	San Antonio, Boerne, New Braunfels and surrounding towns	Photo booth rentals for weddings around San Antonio.	howdy@ansphotoboothco.com	210-505-5123	https://www.ansphotoboothco.com	https://www.instagram.com/ansphotobooth/
Little Lemon Shots	Photo Booth	San Antonio	Texas	San Antonio, Austin and Central Texas	Luxury photo booth experiences for weddings.	sweetnsour@littlelemonshots.com	726-400-6698	https://www.littlelemonshots.com	https://www.instagram.com/littlelemonshots/
Shake Rattle & Roll Mobile Bar	Bar	San Antonio	Texas	Austin to Corpus Christi	Mobile bar and bartenders, with fresh-juice cocktails.	info@shakerattlerollmobilebar.com	(210) 796-4482	https://shakerattlerollmobilebar.com	https://www.instagram.com/shake_rattle_roll.mobilebar/
B.A.R. Bevys Are Ready	Bar	San Antonio	Texas	San Antonio and Central Texas	Mobile bartending with styled bars for weddings.	events@bevysareready.com		https://bevysareready.com	https://www.instagram.com/bevysareready/
Bluebonnet Bartending	Bar	San Antonio	Texas	San Antonio	TABC-certified mobile bartenders and custom cocktails, in business since 2008.		210-993-0058	https://www.bluebonnetbartending.com	https://www.instagram.com/bluebonnetbartenders/
SATX Limousine & Party Bus	Transportation	San Antonio	Texas	San Antonio	Limousines and party buses for the wedding party.	satxlimousine@yahoo.com	(210) 610-1051	https://www.satxlimousine.com	
ETI Limousine & Charter	Transportation	San Antonio	Texas	Across Texas	Charter buses, sprinter vans and SUVs for guest shuttles and the wedding party.	info@etilimo.com	210-599-9999	https://etilimo.com	https://www.instagram.com/eti_limo/
`,
  },
  {
    name: "San Antonio, New Braunfels and Boerne: third batch",
    tsv: `Name	Category	City	State	Service area	Description	Email	Phone	Website	Instagram
LokeyFilms	Videography	Boerne	Texas	San Antonio, Boerne, New Braunfels and the Hill Country	Cinematic wedding films, with photography available too.	lokeyfilms.co@gmail.com	318-537-6780	https://www.lokeyfilms.com	https://www.instagram.com/lokey_films/
MobilBoheme Wedding Films	Videography	New Braunfels	Texas	Central Texas and beyond	Affordable wedding videography from a New Braunfels team.	info@mobilboheme.com	(512) 753-9135	https://www.mobilboheme.com	https://www.instagram.com/mobilboheme/
Dear Juliets Photography	Photography	San Antonio	Texas	San Antonio and the Hill Country	Husband-and-wife photographers with true-to-life colour and an editorial touch.	dearjulietsphotography@gmail.com	210-508-6925	https://www.dearjulietsphotography.com	https://www.instagram.com/dearjulietsphotography/
Jessie Schultz Photography	Photography	San Antonio	Texas	San Antonio, Austin, New Braunfels and across Texas	Husband-and-wife team shooting documentary-style weddings with editorial portraits, since 2015.			https://jessieschultzphotography.com	https://www.instagram.com/jessie.schultz/
Sarah Thompson Photography	Photography	San Antonio	Texas	San Antonio	Timeless, candid wedding photography with a relaxed, low-stress approach on the day.			https://sarahthompsonphotos.com	https://www.instagram.com/sarahthompsonphotos/
dannyROD Photography	Photography	New Braunfels	Texas	New Braunfels, San Antonio, Gruene and the Hill Country	Modern documentary wedding photography, working since 2007.			https://www.dannyrod.com	https://www.instagram.com/dannyrodphotography/
Straughan Photography	Photography	San Antonio	Texas	San Antonio and across Texas	Classic, candid wedding photography from a master-certified photographer.		(210) 445-9837	https://sanantonioweddingphotography.com	https://www.instagram.com/straughan_photography/
Virginia Ann Photography	Photography	San Antonio	Texas	San Antonio	Husband-and-wife team shooting weddings on both film and digital.	virginia@virginiaann.com	210-387-4514	https://www.virginiaann.com	https://www.instagram.com/virginiaannphotography/
Anthony Gauna Photography	Photography	San Antonio	Texas	San Antonio	Artistic documentary photography for laid-back, non-traditional couples.	anthony@anthonygaunaphoto.com	210-819-5971	https://anthonygaunaphoto.com	https://www.instagram.com/_anthonygauna/
Bluefire Photography	Photography	San Antonio	Texas	San Antonio	Natural, timeless wedding photography with relaxed posing help.		210.878.9001	https://www.bluefirephoto.com	https://www.instagram.com/bluefirephoto/
Eyeronic Love	Photography	San Antonio	Texas	San Antonio, New Braunfels, Boerne, Gruene and Austin	Fun, film-loving wedding photographer.			https://eyeroniclove.com	
Prim + Powder	Hair & Makeup	San Antonio	Texas	San Antonio, the Hill Country and South Texas	Wedding hair and makeup team for brides and bridal parties.	prim.powder@gmail.com		https://primandpowder.com	https://www.instagram.com/primandpowder/
Maven and Co Salon	Hair & Makeup	San Antonio	Texas	San Antonio	Salon offering airbrush makeup and hair for weddings, in-salon or on location.	makeupmavensa@gmail.com	210-279-3035	https://www.makeupmavensa.com	https://www.instagram.com/makeupmavenandcompany/
Southern Tease	Hair & Makeup	New Braunfels	Texas	New Braunfels and the Hill Country	On-location bridal hair and airbrush makeup.	weddings@southerntease.com	(830) 359-8667	https://www.southerntease.com	https://www.instagram.com/southern.tease/
Aly Am Paperie	Stationery & Invitations	San Antonio	Texas	San Antonio	Custom wedding invitation suites, by appointment at the studio.	art@alyampaperie.com	210-375-8400	https://alyampaperie.com	https://www.instagram.com/alyampaperie/
CalliRosa	Stationery & Invitations	San Antonio	Texas	San Antonio	Calligraphy and custom stationery: invitations, place cards, signs and seating charts, plus live calligraphy at events.	hello@callirosa.com		https://callirosa.com	https://www.instagram.com/callirosa/
Molly Ward Creative	Stationery & Invitations	Kyle	Texas	Austin, San Antonio and between	Calligraphy and stationery design: invitations, signs, place cards and live lettering.	hello@mollywardcreative.com		https://mollywardcreative.com	https://www.instagram.com/mollywardcreative/
Bella Bride Boutique	Bridal & Formalwear	San Antonio	Texas	San Antonio	Bridal shop in Stone Oak with designer wedding dresses and personal styling.	info@bellabrideboutique.com		https://www.bellabrideboutique.com	https://www.instagram.com/bellabrideboutique/
Olivia Grace Bridal	Bridal & Formalwear	San Antonio	Texas	San Antonio	Olmos Park bridal shop carrying gowns in sizes 0–28.		(210) 876-5366	https://oliviagracebridalshop.com	https://www.instagram.com/oliviagracebridal/
Bridal Galleria of Texas	Bridal & Formalwear	San Antonio	Texas	San Antonio	Locally owned, size-inclusive bridal boutique in Monte Vista.		(210) 342-5752	https://www.bridalgalleriaoftexas.com	https://www.instagram.com/bridalgalleriaoftexas/
IDoTheDressIDo	Bridal & Formalwear	San Antonio	Texas	San Antonio	Off-the-rack wedding dresses under $1,500 in sizes 0–30, open since 2005.	idothedressido@gmail.com	(210) 592-6433	https://www.idothedressido.com	https://www.instagram.com/idothedressido/
Luxe Redux Bridal	Bridal & Formalwear	San Antonio	Texas	San Antonio	Off-the-rack designer wedding dresses at a steep discount.			https://luxereduxbridal.com	https://www.instagram.com/luxereduxbridal/
Rex Formal Wear	Bridal & Formalwear	San Antonio	Texas	San Antonio	Tuxedo and suit rental for grooms and groomsmen, with several San Antonio stores.		(210) 236-7669	https://rexformalwear.com	https://www.instagram.com/rexformalwear/
EdenPark Floral	Florals	Boerne	Texas	Boerne and the Hill Country	Wedding florist designing bouquets and ceremony and reception flowers.	hello@edenparkfloral.com	830.388.8500	https://edenparkfloral.com	https://www.instagram.com/edenpark_floral/
Spice of Life Catering	Catering	San Antonio	Texas	San Antonio	Full-service caterer handling weddings from intimate to very large, with delivery, setup and cleanup.		210-366-1220	https://spiceoflifesa.com	https://www.instagram.com/spiceoflifesa/
Tacos al Carbón Cabrón	Catering	San Antonio	Texas	San Antonio	Taco catering with fresh tortillas and salsas made daily.	info@tacosalcarboncabron.com	210-907-2068	https://tacosalcarboncabron.com/catering/	https://www.instagram.com/tacosalcarboncabronsa/
Sunny's	Catering	Boerne	Texas	Boerne and San Antonio	Brunch and cocktail restaurant that caters events from its Boerne and La Cantera kitchens.		(830) 266-0498	https://www.sunnysbrunch.com	https://www.instagram.com/sunnysbrunch/
Pennies Candy Bar	Desserts	San Antonio	Texas	San Antonio	Candy and treat buffet tables styled for weddings.		(210) 379-0634	https://penniescandybar.com	https://www.instagram.com/penniescandybar_sa/
The Flawless Table & Co	Rentals	San Antonio	Texas	San Antonio, New Braunfels, Schertz and Cibolo	Statement arches, backdrops, bars and other one-of-a-kind rental pieces.			https://www.theflawlesstableco.com	https://www.instagram.com/theflawlesstableco/
Atlas Weddings & Co.	Planning	San Antonio	Texas	San Antonio	Wedding planner with a romantic, elevated style.			https://atlasweddingsandco.com	https://www.instagram.com/atlasweddingsandco/
Bloom in Grace Event Planning	Planning	San Antonio	Texas	San Antonio	Wedding planning, design and coordination.		210-371-9188	https://www.bloomingraceevents.com	
Wed in Fred	Planning	Fredericksburg	Texas	Fredericksburg and the Hill Country	Fredericksburg wedding planners offering all-inclusive packages.		830-992-5074	https://www.wedinfred.com	https://www.instagram.com/wedinfred/
VEGAs DJ Services	Music	San Antonio	Texas	San Antonio, Austin and Central Texas	Wedding DJs and bilingual MCs since 2011, with lighting, photo booths and coordination.	info@vegasdjservices.com	210-527-7840	https://www.vegasdjservices.com	
`,
  },
  {
    name: "Dallas–Fort Worth: photography, planning, catering, florals and music",
    tsv: `Name	Category	City	State	Service area	Description	Email	Phone	Website	Instagram
CN Catering	Catering	Dallas	Texas	Dallas–Fort Worth	Full-service caterer known for custom menus and polished presentation.	info@cncatering.com	214-821-2514	https://cncatering.com	https://www.instagram.com/cncatering/
Culinary Art Catering	Catering	Dallas	Texas	Dallas, Plano, Frisco, Addison and North Texas	Chef-owned caterer of more than twenty years doing upscale wedding menus.	info@culinaryartcatering.com		https://culinaryartcatering.com	https://www.instagram.com/culinaryart1/
Low Country Quisine	Catering	Addison	Texas	Dallas–Fort Worth	Lowcountry-style cooking with custom wedding menus, plus African dishes on request.	info@lowcountryquisine.com	(972) 386-4555	https://www.lowcountryquisine.com	https://www.instagram.com/lowcountryquisine/
360 Catering & Events	Catering	Fort Worth	Texas	Fort Worth, Dallas and the Metroplex	Plated dinners, buffets and hors d'oeuvres with serving staff and licensed bartenders.	info@360cateringandevents.com	(817) 714-8996	https://www.360cateringandevents.com	https://www.instagram.com/360cateringandevents/
Ferah Catering & Events	Catering	Carrollton	Texas	Dallas–Fort Worth	Custom wedding menus with halal options and bar service.	hi@ferahcatering.com	214-431-4753	https://www.ferahcatering.com	https://www.instagram.com/ferahcatering/
Chef P-Dubs Catering	Catering	Dallas	Texas	Dallas–Fort Worth	Chef-led wedding catering with curated menus, in business since 2018.			https://www.pdubbzcatering.com	https://www.instagram.com/_chefpdubb_/
Beto's Mexican Restaurant and Catering	Catering	Grand Prairie	Texas	Dallas–Fort Worth	Family-owned Mexican restaurant since 1993 that caters fajita and Tex-Mex spreads.		(972) 660-1289	https://www.eatatbetos.com	https://www.instagram.com/ilovebetos/
Bay Productions	Photography	McKinney	Texas	Dallas–Fort Worth and worldwide	Husband-and-wife photography and film team.	brittanybayproductions@gmail.com	972-533-6901	https://www.brittanybayproductions.com	https://www.instagram.com/bay_productions/
Brandi Allyse Photography	Photography	Dallas	Texas	Dallas, Fort Worth, Frisco, Plano and Austin	Wedding photographer covering North Texas.			https://brandiallyse.com	https://www.instagram.com/brandiallysephoto/
Rafael Serrano Photography	Photography	Dallas	Texas	Dallas–Fort Worth	Cinematic wedding and quinceañera photography with guided posing.	info@rafaelserranophotography.com	214-761-6160	https://www.rafaelserranophotography.com	https://www.instagram.com/rserranophoto/
Monica Salazar Photography	Photography	Dallas	Texas	Dallas, Fort Worth and Austin	Wedding, engagement and bridal photography since 2009, with photo booth rental too.	monicasalazarphoto@gmail.com	972-746-3557	https://www.monica-salazar.com	https://www.instagram.com/monicasalazarphotography/
Cowtown Clicks	Photography	Fort Worth	Texas	Fort Worth and Dallas	Wedding photography company with over twenty years' experience.		817-614-0592	https://www.cowtownclicks.com	https://www.instagram.com/cowtownclicks/
Marissa Merrill Photography	Photography	Fort Worth	Texas	Fort Worth and beyond	Wedding and engagement photographer.	marissamerrillphotography@gmail.com		https://marissamerrillphotography.com	https://www.instagram.com/marissamerrillphotography/
Meagan Nelson Photography	Photography	Fort Worth	Texas	Fort Worth and beyond	Award-winning wedding and family photographer.	hello@meagannelson.com	817-454-8330	http://meagannelson.com	https://www.instagram.com/meagannelsonphoto/
Moch Snyder Photography	Photography	Fort Worth	Texas	Fort Worth and destination weddings	Award-winning wedding and engagement photographer.	hello@mochsnyder.com		https://www.mochsnyder.com	https://www.instagram.com/mochiesnyder/
Sheltons Photography	Photography	Fort Worth	Texas	Fort Worth and Dallas	Wedding and engagement photography studio.	spencer@sheltonsphotography.com		https://www.sheltonsphotography.com	https://www.instagram.com/sheltonsphotography/
Blushington Blooms	Florals	Fort Worth	Texas	Dallas–Fort Worth	Award-winning wedding floral team: bouquets, centerpieces and ceremony flowers.	info@blushingtonblooms.com		https://www.blushingtonblooms.com	https://www.instagram.com/blushingtonblooms/
Boujee Bloom	Florals	Aubrey	Texas	Dallas–Fort Worth	Luxury wedding florals and bouquets.	hello@boujee-bloom.com	(469) 715-1600	https://www.boujee-bloom.com	https://www.instagram.com/boujeebloomfloral/
Haute Floral	Florals	Dallas	Texas	Dallas–Fort Worth	Full-service floral and event design studio.	info@hautefloral.com		https://www.hautefloral.com	https://www.instagram.com/hautefloral/
Vivienne & Vine Floral Design	Florals	Fort Worth	Texas	Fort Worth and Dallas	Wedding florist and designer.	vivienneandvine@gmail.com	682-234-9621	https://www.vivienneandvine.com	https://www.instagram.com/vivienneandvine/
Luxe Petals	Florals	Dallas	Texas	Dallas–Fort Worth	Wedding florals, plus reception linens.		(817) 805-2098	https://www.luxepetals.com	
Flower Shack Blooms	Florals	Dallas	Texas	Dallas–Fort Worth, Austin, Houston and San Antonio	Wedding florist travelling across Texas.		(817) 800-0603	https://flowershackblooms.com	https://www.instagram.com/flowershackblooms/
FLORA	Florals	Dallas	Texas	Dallas	Luxury floral design for weddings and galas.			https://www.floratx.com	https://www.instagram.com/floratx_/
Camellia Farm Flora	Florals	Fort Worth	Texas	Fort Worth	Downtown florist studio that also does wedding flowers.	tammie@camelliafarmflora.com	(817) 386-2466	https://camelliafarmflora.com	https://www.instagram.com/camelliafarmflora/
Flowers To Go	Florals	Fort Worth	Texas	Fort Worth	Downtown floral studio doing custom wedding work, with in-person consultations.			https://flowerstogofw.com	https://www.instagram.com/flowerstogofw/
Justine's Flowers	Florals	Fort Worth	Texas	Fort Worth and Dallas	Award-winning floral studio making one-of-a-kind wedding flowers.		817-821-8589	https://www.justinesflowers.com	https://www.instagram.com/justinesflowers/
DJ Dan Quinn	Music	Dallas	Texas	Dallas, Fort Worth and destination weddings	High-energy wedding DJ.		833-266-5372	https://dqbentertainment.com	https://www.instagram.com/djdanquinn/
DNA Premium Event Services	Music	Grand Prairie	Texas	Dallas–Fort Worth	Bilingual English–Spanish DJs and MCs for multicultural weddings, one wedding per DJ per day.		(469) 259-7239	https://dnaeventservices.com	https://www.instagram.com/dnaeventservices/
LeForce Entertainment	Music	Dallas	Texas	Dallas–Fort Worth	Wedding DJ group.	hello@leforcedj.com	214-302-8564	https://www.leforceentertainment.com	
Dallas String Quartet	Music	Dallas	Texas	Dallas and nationwide	String ensemble playing classical and contemporary music on traditional and electric strings.	booking@dallasstringquartet.com	(214) 288-2440	https://www.dallasstringquartet.com	https://www.instagram.com/dallasstringquartet/
Lottie & Co. Events	Planning	Dallas	Texas	Dallas and destination weddings	Design-led full-service wedding planning.	lottieandcoevents@outlook.com	214-223-3866	https://lottieandcoevents.com	https://www.instagram.com/lottieandcoevents/
Incorporate Joi	Planning	Dallas	Texas	Dallas and worldwide	Luxury wedding and event planning firm.			https://www.incorporatejoi.com	https://www.instagram.com/incorporatejoi/
S&B Events	Planning	Plano	Texas	Dallas and destination weddings	Luxury full-service wedding planning.	michelle.peska@stunningandbrilliantevents.com	704-308-6779	https://www.dallasstunningandbrilliantevents.com	https://www.instagram.com/stunningandbrilliantevents/
Shamica & Co.	Planning	Dallas	Texas	Dallas	Wedding planning, design, coordination and elopements.	hello@shamicaandco.com	(214) 449-1198	https://shamicaandco.com	https://www.instagram.com/shamicaandco/
Significant Events of Texas	Planning	Dallas	Texas	Dallas and Fort Worth	Full, partial and day-of planning and design.	info@significanteventsoftexas.com		https://significanteventsoftexas.com	https://www.instagram.com/significanteventsoftexas/
CM Promotions	Planning	Dallas	Texas	Dallas–Fort Worth	Planners focused on systems and a stress-free wedding day.			https://cmpromotions.co	https://www.instagram.com/cm.promotions/
Mrs. Planner	Planning	Dallas	Texas	Dallas, Austin and Denver	Wedding planning team with offices in Dallas, Austin and Denver.	hello@mrsplanner.com	682-472-8667	https://mrsplanner.com	https://www.instagram.com/ashlee_mrsplanner/
Fête Fort Worth	Planning	Fort Worth	Texas	Fort Worth, Texas and beyond	Luxury wedding planning.	larissa@fetefw.com		https://www.fetefw.com	https://www.instagram.com/fete.fw/
Integrity Events & Design	Planning	Fort Worth	Texas	Fort Worth	Wedding planners with a modern style.	hey@integrityeventsdesign.com		https://integrityeventsdesign.com	https://www.instagram.com/integrityevents.design/
`,
  },
  {
    name: "Dallas–Fort Worth: hair and makeup, videography, cake, officiants, rentals and bridal",
    tsv: `Name	Category	City	State	Service area	Description	Email	Phone	Website	Instagram
Lashes & Lace	Hair & Makeup	Dallas	Texas	Dallas–Fort Worth	On-location wedding hair and makeup team for brides and bridal parties.	lashesandlacemuah@gmail.com	512-757-7045	https://www.lashesandlace.com	https://www.instagram.com/lashesandlacemuah/
Paige Anderson Makeup and Hair	Hair & Makeup	Dallas	Texas	Dallas–Fort Worth	Makeup and hair artist with over sixteen years' experience, travelling to the venue, hotel or home.	paige@paigeanderson.com	(214) 448-6438	https://www.paigeanderson.com	https://www.instagram.com/paigemakeupartist/
The Styling Stewardess	Hair & Makeup	Dallas	Texas	Dallas and destination weddings worldwide	Travelling hair and makeup team focused on destination weddings.			https://www.thestylingstewardess.com	https://www.instagram.com/thestylingstewardess/
The Glam Beauty Lab	Hair & Makeup	Dallas	Texas	Dallas–Fort Worth	Award-winning hair and makeup team known for bold, glamorous looks.			https://theglambeautylab.com	https://www.instagram.com/theglambeautylab/
Candlelight Films	Videography	Dallas	Texas	Dallas and destination weddings	Husband-and-wife studio making story-driven wedding films.	contact@candlelightfilms.com	214-725-1075	https://candlelightfilms.com	https://www.instagram.com/candlelightfilms/
Daniel K. Films	Videography	Dallas	Texas	Dallas–Fort Worth and beyond	Award-winning videographer with more than 300 weddings filmed across North Texas.		(972) 439-2924	https://danielkfilms.com	https://www.instagram.com/danielkfilms/
Knox Park Films	Videography	Dallas	Texas	Texas and destination weddings	Boutique studio documenting weddings across Texas and further afield.	info@knoxparkfilms.com	(469) 569-1480	https://knoxparkfilms.com	https://www.instagram.com/knoxparkfilms/
When It Clicks	Videography	Dallas	Texas	Texas	Wedding videography team making intentional, unconventional films.			https://whenitclicks.com	https://www.instagram.com/whenitclicks/
Topher Films	Videography	Dallas	Texas	Dallas and across the US	Dallas wedding film team with crew around the country.			https://www.topherfilms.com	https://www.instagram.com/topher.films/
The Cinematic Wedding	Videography	Dallas	Texas	Dallas–Fort Worth and worldwide	Wedding films telling each couple's story, at home and abroad.	love@thecinematicwedding.com		https://www.thecinematicwedding.com	https://www.instagram.com/thecinematicwedding/
Butterfly Cakery	Cake	Plano	Texas	Plano and Dallas	Custom cakes and cupcakes made to order.	info@butterflycakery.com	469-661-8992	https://www.butterflycakery.com	https://www.instagram.com/butterflycakery/
Cakes'n Pearls	Cake	Roanoke	Texas	Dallas–Fort Worth	Custom wedding and groom's cakes with intricate designs.	cakesnpearls@gmail.com	972-302-7656	https://www.cakesnpearls.com	https://www.instagram.com/cakesnpearls/
Creme de la Creme Cake Company	Cake	Fort Worth	Texas	Fort Worth	Wedding cake shop in the historic Handley district of east Fort Worth.	info@cremedelacremecakecompany.com	817-492-8888	https://www.cremedelacremecakecompany.com	https://www.instagram.com/cremedelacremecakecompany/
Delicious Cakes	Cake	Addison	Texas	Dallas	Bakery of more than thirty years making wedding cakes.	order@deliciouscakes.com	(972) 233-2133	https://www.deliciouscakes.com	https://www.instagram.com/deliciouscakesdfw/
The London Baker	Cake	Lewisville	Texas	Dallas–Fort Worth	Luxury cake shop run by an award-winning wedding cake designer.	thelondonbakertx@gmail.com	972-410-0064	https://www.thelondonbaker.com	https://www.instagram.com/thelondonbaker/
That's The Cake Bakery	Cake	Arlington	Texas	Dallas–Fort Worth	Specialty bakery and cafe making custom wedding cakes.	hello@thatsthecake.com	(817) 617-2599	https://www.thatsthecake.com	https://www.instagram.com/thatsthecake/
Uncle Willie's Pies	Cake	Dallas	Texas	Dallas–Fort Worth	Family-owned Southern-style bakeshop since 1996 making custom wedding cakes, by appointment.	hello@unclewilliespies.com	(214) 363-4907	https://www.unclewilliespies.com	
Sugarbelle Cake Shoppe	Cake	Northlake	Texas	Dallas–Fort Worth	Made-from-scratch custom wedding cake studio.	hello@sugarbellecakeshoppe.com	940-500-0704	https://www.sugarbellecakeshoppe.com	https://www.instagram.com/sugarbelle_cakeshoppe/
Cake-Aholics Bakery	Cake	Arlington	Texas	Dallas–Fort Worth	Wedding and groom's cakes.	cakeaholicsbakery@gmail.com	817-980-4542	https://www.cake-aholics.com	https://www.instagram.com/cake_aholics_bakery/
Dallas Wedding Officiants	Officiant	Irving	Texas	Dallas–Fort Worth	Chapel, courthouse-style and on-location ceremonies, including elopements and same-day weddings.	hello@dallasweddingofficiants.com	972-672-1858	https://www.dallasweddingofficiants.com	https://www.instagram.com/dallasweddingofficiants/
Love Notes Weddings	Officiant	Dallas	Texas	Dallas–Fort Worth	Non-denominational ministers officiating religious and non-religious ceremonies since 1990.	marty@lovenotesweddings.com		https://lovenotesweddings.com	
The Magic Inside	Officiant	Dallas	Texas	Dallas and beyond	Spiritual officiant writing personalised ceremonies around each couple's beliefs.	themagicinsideofme@gmail.com		https://themagicinside.love	https://www.instagram.com/the.magic.inside.me/
TLC Event Rentals	Rentals	Dallas	Texas	Dallas–Fort Worth	Tents, tables, chairs and linens for weddings.		(214) 502-8424	https://tlceventrentals.com	https://www.instagram.com/tlceventrentalsdfw/
ELY Party Rentals	Rentals	Dallas	Texas	Dallas–Fort Worth	Event rentals for private and commercial events.	elyprdfw@yahoo.com	214-235-0707	https://www.elypartyrentals.com	https://www.instagram.com/elyprdfw/
Dallas Event Rentals	Rentals	Dallas	Texas	Dallas	Tents, tables, chairs, linens and lighting for weddings.		214-484-2489	https://dallas-partyrentals.com	https://www.instagram.com/dallaseventrentals/
Lone Star Tents & Events	Rentals	Waxahachie	Texas	Waxahachie, Ennis, Dallas and Fort Worth	Tent and party rentals.		(972) 872-8774	https://www.lonestarrents.com	
A Plus Celebrations	Rentals	Fort Worth	Texas	Fort Worth and surrounding areas	Tents, tables, chairs, linens and décor.	info@apluscelebration.com	817-518-8982	https://apluscelebration.com	https://www.instagram.com/apluscelebration/
Elegant Creations	Rentals	Fort Worth	Texas	Fort Worth	Linen, chair-cover and uplight rentals.		817-333-4727	http://www.fortworthchaircoverrentals.com	
Bliss Bridal Salon	Bridal & Formalwear	Fort Worth	Texas	Fort Worth	Bridal salon with private suites and a large selection of gowns.	appointment@blissfw.com	817-332-4696	http://www.blissfw.com	https://www.instagram.com/blissbridal/
Circle Park Bridal	Bridal & Formalwear	Dallas	Texas	Dallas–Fort Worth	Bridal shop with sample sizes from 8 to 32.	info@circleparkbridal.com		https://www.circleparkbridal.com	https://www.instagram.com/circleparkbridal/
Elizabeth Scott Bridal	Bridal & Formalwear	Burleson	Texas	Dallas–Fort Worth	Couture and designer gowns with personal styling.	info@elizabethscottbridal.com		https://elizabethscottbridal.com	https://www.instagram.com/elizabethscottbridal/
Bridal Boutique Lewisville	Bridal & Formalwear	Lewisville	Texas	Dallas–Fort Worth	Family-owned bridal salon, one of the largest in the Dallas area.	info@bridalboutiquelewisville.com		https://www.bridalboutiquelewisville.com	https://www.instagram.com/bblewisville/
`,
  },
  {
    name: "Houston: photography, planning, catering, florals and music",
    tsv: `Name	Category	City	State	Service area	Description	Email	Phone	Website	Instagram
B. Alvarado Photography	Photography	Houston	Texas	Houston, Katy and Spring	Affordable wedding photography with full-day coverage and custom packages.			https://www.balvaradophotography.com	https://www.instagram.com/balvaradophotography/
Eric & Jenn Photography	Photography	Houston	Texas	Houston and surrounding areas	Husband-and-wife team photographing romantic weddings for over ten years.			https://ericandjennphotography.com	https://www.instagram.com/ericandjenn/
Joanna Krueger Photography	Photography	Houston	Texas	Houston	Husband-and-wife team focused on a relaxed, stress-free wedding day and timeless photos.			https://joannakrueger.com	https://www.instagram.com/joannakrueger/
Julie & Daniel Photography	Photography	Houston	Texas	Houston, The Woodlands and Sugar Land	Wedding photographers blending real moments with gentle, artful direction.	julieanddanielpv@gmail.com		https://julieanddanielphoto.com	https://www.instagram.com/julieanddanielphoto/
Belle Events	Planning	Houston	Texas	Houston	Full-service luxury wedding planning, by appointment.	info@belleevents.com	832-282-0693	https://www.belleevents.com	https://www.instagram.com/belleevents/
Two Be Wed	Planning	Houston	Texas	Houston and destination weddings	Luxury wedding planning and design, from day-of coordination to full service.		713-572-3030	https://www.twobewed.com	https://www.instagram.com/twobewed/
Water to Wine Events	Planning	Houston	Texas	Houston and Galveston	Full-service planning and design, plus day-of coordination.	info@watertowineevents.com	713-291-9480	https://watertowineevents.com	https://www.instagram.com/watertowineevents/
Houston Soirée	Planning	Houston	Texas	Houston and Austin	Planning and design studio offering full service and design-led coordination.	christine@houstonsoiree.com	512-755-0179	https://houstonsoiree.com	https://www.instagram.com/houston_soiree/
Vow and Voyage	Planning	Houston	Texas	Houston and destination weddings	Wedding and honeymoon planner focused on culturally rich celebrations.	ashley@vowandvoyage.com	945-699-1012	https://vowandvoyage.com	https://www.instagram.com/vowandvoyage/
J Low Events	Planning	The Woodlands	Texas	The Woodlands and greater Houston	Boutique wedding planning studio.	info@jlowevents.com		https://www.jlowevents.com	https://www.instagram.com/jlowevents/
Brey & Co.	Planning	Houston	Texas	Houston	Wedding planning and in-house florals, with all-inclusive packages.	michelle@breyandco.com	281-451-2053	https://www.breyandco.com	https://www.instagram.com/breyandco/
Bailey Connor Catering	Catering	Houston	Texas	Houston and Galveston	Wedding catering with fresh food and full service.		713-903-7377	https://www.baileyconnor.com	https://www.instagram.com/baileyconnorcatering/
Cafe Natalie Catering	Catering	Houston	Texas	Houston	Luxury full-service wedding catering.			https://cafenataliecatering.com	https://www.instagram.com/cafenatalie/
City View Catering	Catering	Houston	Texas	Houston	Full-service caterer for weddings and events.		(713) 223-9191	https://www.cityviewcatering.com	https://www.instagram.com/cityviewcatering/
The Heights Catering	Catering	Houston	Texas	Houston	Full-service wedding catering with locally sourced produce.	theheightscatering@gmail.com	832-444-9933	https://www.theheightscatering.com	https://www.instagram.com/theheightscatering/
The Hometown Chef	Catering	Humble	Texas	Houston and surrounding areas	Chef-owned caterer for weddings and private events.		832-304-1433	https://thehometownchef.com	https://www.instagram.com/thehometownchefcateringco/
Southern Standard Hospitality	Catering	Houston	Texas	Houston	Catering company in the Energy Corridor serving weddings across greater Houston.	info@southernstandardhouston.com	(713) 570-6713	https://www.southernstandardhouston.com	https://www.instagram.com/southernstandardcatering/
Wicked Whisk Catering	Catering	The Woodlands	Texas	The Woodlands, Conroe and Houston	Wedding and event caterer north of Houston.	sales@wickedwhiskcatering.com	(713) 897-8272	https://www.wickedwhiskcatering.com	https://www.instagram.com/wickedwhiskcateringhtx/
Beyond Bloems	Florals	Houston	Texas	Houston and Magnolia	Luxury floral design and event production for weddings.	info@beyondbloems.com		https://www.beyondbloems.com	https://www.instagram.com/beyondbloems/
Blush Floral Co.	Florals	Houston	Texas	Houston	Luxury floral design studio for weddings, by appointment.	flowers@blushfloralco.com		https://blushfloralco.com	https://www.instagram.com/blushfloralco_/
Boyd's Blossoms	Florals	Baytown	Texas	Baytown, Houston and Anahuac	Local florist that also does wedding flowers.	boydsblossoms@gmail.com	(281) 422-3400	https://www.boydsblossoms.com	https://www.instagram.com/boyds_blossoms/
Bramble and Bee Floral Design	Florals	Tomball	Texas	Tomball and northwest Houston	Wedding florals inspired by English gardens and Texas wildflowers.		346-808-3008	https://www.brambleandbee.com	
Florelle Floristry Studio	Florals	Houston	Texas	Houston	Natural, abundant wedding flowers using local and American-grown blooms.			https://www.florellefloristry.com	
Freedom Floral	Florals	Houston	Texas	Houston	Garden-style florist in Spring Branch.		(713) 637-4477	https://www.freedomfloral.com	https://www.instagram.com/freedomfloraltx/
Maxit Flower Design	Florals	Houston	Texas	Houston	Award-winning wedding florals and installations.	maria@maxitflowerdesign.com	(713) 240-0531	https://www.maxitflowerdesign.com	https://www.instagram.com/maxitflowerdesign/
EVENT by OVA	Florals	Houston	Texas	Houston, Katy and destination weddings	Luxury floral studio for weddings.	info@eventbyova.com	(832) 856-7450	https://www.eventbyova.com	https://www.instagram.com/eventbyova/
Tin Cup Flower Co.	Florals	Galveston	Texas	Galveston County and surrounding areas	Artistic wedding florals for Galveston weddings.	hello@tincupflowerco.com		https://www.tincupflowerco.com	https://www.instagram.com/tincupflowerco/
Petals & Twist Designs	Florals	Houston	Texas	Houston and Katy	Wedding floral design.	petalsandtwistdesigns@gmail.com		https://www.petalsandtwistdesigns.com	https://www.instagram.com/petalsandtwist_designs/
The Mockingbirds Band	Music	Houston	Texas	Houston	Customisable wedding band with unlimited song requests.	booking@themockingbirdsband.com	713-516-1545	https://www.themockingbirdsband.com	https://www.instagram.com/themockingbirdsband/
Fine Arts Strings	Music	Houston	Texas	Houston	String musicians for ceremonies and receptions, from classical to contemporary.	john@fineartsstrings.com	713-468-0788	https://www.fineartsstrings.com	https://www.instagram.com/fineartsstrings/
Danny B DJ Company	Music	Houston	Texas	Houston and surrounding areas	Wedding DJ and MC with photo booth and dance lighting.	info@dannybdj.com	713-922-7648	https://www.dannybdj.us	https://www.instagram.com/dannyb1717/
Enloe Entertainment	Music	Houston	Texas	Greater Houston	Wedding DJ and event entertainment.	admin@enloeentertainment.com	(281) 432-9136	https://www.enloeentertainment.com	https://www.instagram.com/enloeentertainment/
AMP Events and Lighting	Music	Houston	Texas	Houston and surrounding areas	Wedding DJ, MC and lighting company.	contact@ampevents.net	713-530-1830	https://www.ampevents.net	https://www.instagram.com/ampevents_htx/
`,
  },
  {
    name: "Houston: hair and makeup, videography, cake, officiants, rentals and bridal",
    tsv: `Name	Category	City	State	Service area	Description	Email	Phone	Website	Instagram
Misty Rockwell Artistry Team	Hair & Makeup	Houston	Texas	Greater Houston and beyond	Experienced wedding makeup and hair team.	info@mistyrockwell.com	346-298-3167	https://mistyrockwell.com	https://www.instagram.com/mistyrockwellmakeup/
Butter Artistry	Hair & Makeup	Houston	Texas	Houston, Austin and San Antonio	On-location wedding makeup and hair team.	cheers@butterartistry.com		https://www.butterartistry.com	https://www.instagram.com/butterartistry/
Hart My Style	Hair & Makeup	Houston	Texas	Houston, The Woodlands and Sugar Land	On-location airbrush makeup and hair for weddings.		832-244-5386	https://hartmystyle.com	https://www.instagram.com/hartmystyle/
31 Films	Videography	Houston	Texas	Houston and destination weddings	Wedding and destination wedding films.	hello@31films.com	281-259-1220	https://www.31films.com	https://www.instagram.com/31films/
EVOKE Photography & Video	Videography	Houston	Texas	Houston, Sugar Land and Spring	Wedding film and photo team with more than 6,000 weddings behind it.	info@evokephoto.com	713-349-9508	https://www.evokephotoandvideo.com	https://www.instagram.com/evokephotoandvideo/
Quiroz Productions	Videography	Houston	Texas	Houston, The Woodlands and Sugar Land	Cinematic wedding films built around real moments.			https://www.quirozproductions.com	https://www.instagram.com/quirozproductions/
Bavarian Cakery	Cake	Houston	Texas	Houston and Cypress	Bespoke wedding cakes, made for more than twenty years.		281-469-3116	https://www.bavariancakery.com	https://www.instagram.com/bavariancakeryhouston/
Le Swan Bakery	Cake	Houston	Texas	Houston	Luxury cake studio in the Energy Corridor making bespoke wedding cakes and cookies.	hello@leswanbakery.com	832-238-5550	https://www.leswanbakery.com	https://www.instagram.com/leswanbakery/
Pastel Boutique HTX	Cake	Houston	Texas	Houston and Tomball	Custom cake bakery since 2016, making wedding cakes to order.	ideas.pastel@gmail.com	(832) 282-4773	https://pastelboutiquehtx.com	https://www.instagram.com/pastelboutiquehtx/
Roland's Swiss Pastry & Bakery	Cake	Houston	Texas	Houston	Award-winning Swiss bakery that makes custom wedding cakes.	orders@rolandsswissbakery.com	713-785-4294	https://www.rolandsswissbakery.com	https://www.instagram.com/rolandsswissbakery/
Sweetland Cakery	Cake	Houston	Texas	Houston	Handcrafted wedding cakes and cookies made to order.	info@sweetlandcakery.com	(281) 609-4050	https://sweetlandcakery.com	https://www.instagram.com/sweetlandcakeryhouston/
The Village Bakery	Cake	Houston	Texas	Houston	Rice Village bakery making custom wedding cakes and pastries.	info@tvbhouston.com	713-524-5264	https://thevillagebakeryhouston.com	
Who Made the Cake!	Cake	Houston	Texas	Houston	Award-winning cake studio known for sugar flowers and sculpted cakes.	info@whomadethecake.com	713-522-4787	https://www.whomadethecake.com	https://www.instagram.com/whomadethecakehouston/
Supreme Kakes	Cake	Houston	Texas	Greater Houston	Custom wedding cakes made with all-natural ingredients.	supremekakes@gmail.com	(281) 496-1000	https://www.supremekakes.com	https://www.instagram.com/supremekakes/
Houston Pocket Vows	Officiant	Houston	Texas	Greater Houston	Officiants who are former Texas judges, from Heights office signings to full ceremonies; se habla español.	milenabbrandao@gmail.com		https://houstonpocketvows.com	
Sensational Ceremonies	Officiant	Houston	Texas	Houston metro and the coast	Personalised ceremonies at a location of the couple's choosing.	brian@sensationalceremonies.com		https://sensationalceremonies.com	
Any Occasion Tents & Events	Rentals	Houston	Texas	Houston	Tents, tables, chairs and linens.	info@anyoccasionhouston.com	713-662-9724	https://www.anyoccasionhouston.com	https://www.instagram.com/anyoccasiontentsevents/
Big Heart Event Rentals	Rentals	Houston	Texas	Houston	Tables, chairs, arches, chuppahs, farm tables and dance floors.			https://www.bighearteventrentals.com	
Diamond Events Rentals	Rentals	Cypress	Texas	Houston, Cypress and Katy	Tables, chairs, tents and marquee letters.	info@diamondeventsrentals.com	(346) 426-8286	https://www.diamondeventsrentals.com	https://www.instagram.com/diamonder_llc/
EB Inc Events	Rentals	Humble	Texas	Houston	Linens, décor and tents for weddings.	info@ebincevents.com	(281) 812-9587	https://www.ebincevents.com	
Houston Tents & Events	Rentals	Houston	Texas	Houston	Tents, lounge furniture, tables, chairs, linens and lighting.	info@houstontentsevents.com	713-346-2012	https://www.houstontents.com	https://www.instagram.com/houstontentsevents/
Whittington Bridal	Bridal & Formalwear	Kingwood	Texas	Houston	Wedding dress shop.	contact@whittingtonbridal.com		https://whittingtonbridal.com	https://www.instagram.com/whittingtonbridal/
La Reve Bridal Couture	Bridal & Formalwear	Pearland	Texas	Houston	Bridal shop south of Houston.	info@larevebridalcouture.com	281-201-8145	https://www.larevebridalcouture.com	https://www.instagram.com/larevebridalcouture/
Impression Bridal	Bridal & Formalwear	Houston	Texas	Houston	Bridal shop near the Galleria with designer gowns at a range of prices, open since 2011.	galleria@impressionbridalstore.com	(713) 623-4696	https://www.impressionbridalstore.com	https://www.instagram.com/impressionbridalstores/
`,
  },
  {
    name: "Dallas–Fort Worth: photo booths, transport, stationery, desserts, decor and bar",
    tsv: `Name	Category	City	State	Service area	Description	Email	Phone	Website	Instagram
Big Time Selfies	Photo Booth	Arlington	Texas	Dallas–Fort Worth	Family-run photo booth rental with 360, glam and open-air booths for weddings.	info@bigtimeselfies.com	817-557-7449	https://bigtimeselfies.com	https://www.instagram.com/bigtimeselfies/
Little Camper Photo Booth	Photo Booth	Dallas	Texas	Dallas–Fort Worth and North Texas	Restored vintage camper photo booths, plus open-air booths and a phone-booth audio guestbook.	LittleCamperPhotoBooth@gmail.com	214-290-4811	https://littlecamperphotobooth.com	https://www.instagram.com/littlecamperphotobooth/
Booth & Blooms	Photo Booth	Dallas	Texas	Dallas–Fort Worth	Photo booth rentals paired with flower-wall backdrops for weddings and parties.	info@boothandblooms.com		https://www.boothandblooms.com	
DFW Royal Limos	Transportation	Dallas	Texas	Dallas–Fort Worth	Limousine and car service for weddings, parties and airport runs.	dfwlimoscarservice@gmail.com	469-777-2823	https://dfwroyallimos.com	https://www.instagram.com/dfw_royal_limo/
Black Clover Party Buses	Transportation	Dallas	Texas	Dallas, Addison, Fort Worth and Rowlett	Party buses and a Sprinter limo with custom lighting, for moving the wedding party and guests.	blackcloverpartybuses@gmail.com	469-258-2819	https://www.blackcloverpartybuses.com	https://www.instagram.com/blackcloverpartybuses/
Stamped Paper Co.	Stationery & Invitations	Dallas	Texas		Boutique studio designing wedding invitations, custom monograms and day-of paper.	hello@stampedpaperco.com	214-810-5828	https://www.stampedpaperco.com	https://www.instagram.com/stampedpaperco/
Pretty Post Calligraphy	Stationery & Invitations	Fort Worth	Texas	Dallas, Fort Worth and beyond	Calligraphy, custom invitations and hand-painted signage for weddings.	prettypostcalligraphy@gmail.com	817-437-5179	https://www.prettypostcalligraphy.com	https://www.instagram.com/prettypostcalligraphy/
Amy Sue Designs	Stationery & Invitations	Dallas	Texas		Calligrapher doing envelope addressing, signage and live on-site calligraphy at events.	amy@amysuedesigns.com	214-516-2018	https://www.amysuedesigns.com	https://www.instagram.com/amysuedesigns/
Pink Petunia Baking Co.	Desserts	Fort Worth	Texas		Custom dessert tables, cookies and treats for weddings from a Sugar Rush–winning baker.	hello@pinkpetuniabakingco.com	469-525-0352	https://www.pinkpetuniabakingco.com	
Nana Puddin' Perfection	Desserts	Fort Worth	Texas	Dallas–Fort Worth	Handmade banana pudding and specialty desserts, catered for weddings and events.	nanapuddinperfection@gmail.com	469-340-3751	https://www.nanapuddinperfection.com	https://www.instagram.com/nana_puddin_perfection/
Barnett Sweets & Co.	Desserts	Krum	Texas	Dallas–Fort Worth	Wedding cakes, mini cupcakes and dessert spreads from a North Texas bakery.	barnettsweetsco@gmail.com	940-600-9889	https://barnettsweetsco.com	https://www.instagram.com/barnettsweetsco/
Yum Cake Crumbs	Desserts	Frisco	Texas		Custom cakes and dessert displays for weddings and celebrations.			https://yumcakecrumbs.com	https://www.instagram.com/yumcakecrumbs/
Petite Sweets Bakery	Cake	Flower Mound	Texas		Scratch-made wedding cakes plus dessert tables of cookies, cupcakes and macarons.			https://petitesweetsbylaura.com	https://www.instagram.com/petite_sweets_laura/
Divine Decor of Dallas	Decor & Lighting	Dallas	Texas		Ceremony and reception decor, draping, linens and lighting.	divinedecorofdallas@gmail.com	972-510-3036	https://www.divinedecorofdallas.com	
Dixie Does Vintage	Decor & Lighting	Dallas	Texas	Dallas–Fort Worth	Vintage and one-of-a-kind decor rentals for styling a wedding.		214-202-4513	https://dixiedoesvintage.com	https://www.instagram.com/dixiedoesvintage/
Allora Mae Mobile Bar	Bar	Fort Worth	Texas	Dallas–Fort Worth	Mobile bar and bartenders serving craft cocktails at weddings.	erika@alloramae.com	817-823-0013	https://www.alloramae.com	
DFW Bartending	Bar	Arlington	Texas	North Texas and Waco	Bartenders, mobile bar rental and champagne towers for weddings.	info@dfwbartending.com	817-460-7280	https://www.dfwbartending.com	https://www.instagram.com/dfwbartending/
Bar Voyage	Bar	Colleyville	Texas	Dallas–Fort Worth	Mobile bar service with signature cocktails; you supply the alcohol.	mobilebar@bar-voyage.com	254-730-0715	https://barvoyagemobilebar.com	
`,
  },
  {
    name: "Houston: photo booths, stationery, desserts, decor and bar",
    tsv: `Name	Category	City	State	Service area	Description	Email	Phone	Website	Instagram
Foto Fête HTX	Photo Booth	Houston	Texas	Greater Houston	Mirror photo booth for weddings and galas, with printed keepsakes.			https://www.fotofetehtx.com	https://www.instagram.com/fotofetehtx/
Photobooth Houston	Photo Booth	Pasadena	Texas	Greater Houston	Print, digital, mirror and beauty-filter photo booths for weddings.	info@photoboothhouston.com	346-315-0909	https://www.photoboothhouston.com	https://www.instagram.com/photobooth_houston/
Picture Perfect Duo	Photo Booth	Houston	Texas	Houston and surrounding areas	Photo booth rental for weddings, with custom backdrops and prints.	ppdhtx@gmail.com		https://www.pictureperfectduo.com	https://www.instagram.com/pictureperfectduophotobooth/
Paper Tie Affair	Stationery & Invitations	Houston	Texas		Design studio making custom and semi-custom wedding invitations and day-of stationery.	hello@papertieaffair.com	832-248-7076	https://www.papertieaffair.com	https://www.instagram.com/papertieaffair_/
DGZ Invitations and More	Stationery & Invitations	Bellaire	Texas	Houston	Invitation shop printing wedding invitations, save the dates, menus, programs and napkins.	dgzinvitations@gmail.com	713-823-3808	https://www.dgzinvitations.com	https://www.instagram.com/dgzinvitationsandmore/
Alchemy Bake Lab	Desserts	Katy	Texas	Houston	Mini-dessert bars and custom cakes, with dozens of bite-size treats to choose from.	info@alchemybakelab.com		https://www.alchemybakelab.com	https://www.instagram.com/alchemybakelab/
Buttercream Houston	Desserts	Houston	Texas		Handmade macarons and macaron towers, plus classic wedding cakes.	contact.buttercream@gmail.com	832-907-7549	https://www.buttercreamhouston.com	https://www.instagram.com/buttercreamhouston/
Flour Gals Bakery	Desserts	Cypress	Texas	Cypress, Tomball, Magnolia, Katy and The Woodlands	Home bakery making custom cookies, cupcakes and buttercream cakes.	flourgalsbakery@gmail.com		https://www.flourgalsbakery.com	https://www.instagram.com/flourgalsbakery/
Sweet Extravagance	Desserts	Missouri City	Texas		Sculpted and themed cakes and sweet treats, including for weddings.	orders@sweetextravagance.com	(713) 705-4414	https://sweetextravagance.com	https://www.instagram.com/sweetextravagance/
Holiday Hill Events & Decor	Decor & Lighting	Pearland	Texas		Event design firm doing florals, draping, lighting, tablescapes and signage.	info@holidayhillevents.com	866-646-5432	https://www.holidayhillevents.com	https://www.instagram.com/holidayhillevents/
Bright Star Productions	Decor & Lighting	Houston	Texas		Production company handling wedding lighting, sound and video for over three decades.		713-529-2757	https://brightstarproductions.com	https://www.instagram.com/brightstarproductions/
Matchless Mobile Bar	Bar	Houston	Texas	Greater Houston	Mobile bartending with custom cocktail menus; you supply the alcohol.	kyle@matchlessmobilebar.com	(713) 364-8182	https://www.matchlessmobilebar.com	
The Curated Pour	Bar	Houston	Texas		Mobile tap bar and bartenders for weddings.	TheCuratedPour@gmail.com	(832) 732-5531	https://www.curatedpourhtx.com	https://www.instagram.com/curatedpourhtx/
The Buzz Stoppe Social	Bar	Houston	Texas		Mobile bartending and bar rentals for weddings.	thebuzzstoppesocial@gmail.com		https://www.thebuzzstoppe.com	https://www.instagram.com/thebuzzstoppesocial/
Space City Sips	Bar	Houston	Texas	Greater Houston	Mobile bartending with cocktails and mocktails, using alcohol you provide.		936-320-2978	https://www.spacecitysipshtx.com	https://www.instagram.com/spacecitysipshtx/
The Traveling Spirit	Bar	Houston	Texas		Mobile bar run by a chef turned bartender, serving creative cocktails since 2018.	Cheers@travelingspiritbar.com	832-271-8327	https://travelingspiritbar.com	https://www.instagram.com/travelingspiritbar/
Bartending2U	Bar	Houston	Texas		Bartending and alcohol catering for weddings and events.	info@bartending2u.com	(713) 489-4960	https://bartending2u.com	https://www.instagram.com/bartending2u/
`,
  },
];
