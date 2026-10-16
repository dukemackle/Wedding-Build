import type { VendorBatch } from "@/lib/vendor-batches";

// District of Columbia vendor batches. Every row's State is "District of Columbia". Add new batches at the end.
const batches: VendorBatch[] = [
  {
    name: "Washington: photography, planning, florals, music, catering, hair & makeup, cake and videography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Mesus Studios	Photography		Washington	District of Columbia	Washington DC, Europe and worldwide	Editorial wedding photography blending directed, magazine-style portraits with candid moments, based in DC and travelling worldwide.			https://www.mesusstudios.com/	https://www.instagram.com/mesus.studios/
Carl Elixir Studio	Photography		Washington	District of Columbia		DC photo and video studio founded in 2006, mixing photojournalism with editorial work and covering South Asian weddings and elopements.	info@carlelixir.com	(202) 827-5777	https://www.carlelixirstudio.com/	https://www.instagram.com/carlelixirstudio/
Marriage & Mimosas	Planning		Washington	District of Columbia	DC and destinations	DC-rooted planning and design team led by Sam, with operations planners and coordinators handling full planning through the wedding day.			https://www.marriageandmimosas.com/	https://www.instagram.com/marriageandmimosas/
Allan Woods Flowers	Florals	2645 Connecticut Ave NW	Washington	District of Columbia		Woodley Park florist trading for over 35 years, designing custom wedding and event flowers by appointment alongside its shop.	info@allanwoods.com	(202) 332-3334	https://allanwoods.com/	https://www.instagram.com/allanwoodsflowers/
ROSIE Floral	Florals		Washington	District of Columbia		DC floral studio founded by Hawaii-born designer Rachel, creating personal, place-inspired arrangements for weddings and dinners.	hello@rosiefloral.com	202-805-3691	https://www.rosiefloral.com/	https://www.instagram.com/rosie.rosie_floral/
Lisa Lee Florals	Florals		Washington	District of Columbia	DMV	Eco-conscious DC floral studio for weddings and corporate events, from garden-style bouquets to colourful Indian-Western ceremonies.	hello@lisaleeflorals.com		https://lisaleeflorals.com/	https://www.instagram.com/lisaleeflorals/
Occasions Caterers	Catering	655 Taylor St NE	Washington	District of Columbia	Washington DC metro, Virginia and Maryland	Brookland-based caterer offering custom menus, event design and an in-house hospitality team for weddings across the DC region.	info@occasionscaterers.com	202-546-7400	https://www.occasionscaterers.com/	https://www.instagram.com/occasionscaterers/
EcoCaters	Catering	2221 Adams Pl NE	Washington	District of Columbia	Washington DC and the DMV	Sustainability-focused caterer founded in 2007, building custom organic menus for weddings with vegan, gluten-free and nut-free options.		(202) 548-7220	https://www.ecocaters.com/wedding-catering	https://www.instagram.com/ecocaters/
Well Dunn	Catering		Washington	District of Columbia	Washington DC, Maryland and Virginia	Long-running DC caterer handling weddings, galas and social events, with bespoke menus, bar service and event staffing.		202-543-7878	https://welldunn.com/	https://www.instagram.com/welldunncatering/
The Bakers' Lounge	Cake	502 H St NE	Washington	District of Columbia		British-inspired H Street bakery making handcrafted custom wedding cakes, with fillings ranging from fresh fruit to boozy truffle.		(202) 601-7107	https://www.thebakersloungedc.com/weddings	
Capitol Jill Baking	Cake		Washington	District of Columbia		Capitol Hill home bakery creating bespoke wedding and party cakes with unusual flavour pairings and a fresh design for each couple.	hi@capitoljillbaking.com		https://www.capitoljillbaking.com/	https://www.instagram.com/capitoljillbaking/
Shutter & Sound	Videography		Washington	District of Columbia	Washington DC and 14 other US cities	Film-first wedding studio founded in DC in 2014, shooting cinematic, editorial wedding films with all editing done in-house in DC.	hello@shutterandsound.com		https://shutterandsound.com/	https://www.instagram.com/shutterandsound/
Lastlook Films	Videography		Washington	District of Columbia	DC and Maryland	Story-led wedding films by Andi, weaving family moments and cultural traditions into cinematic edits delivered within 12 weeks.	lastlookfilms@gmail.com		https://www.lastlookfilms.com/	https://www.instagram.com/lastlook.films/
DJ D-Mac & Associates	Music		Washington	District of Columbia	Washington DC, Maryland, Virginia and beyond	DC DJ collective of six, running for over 20 years, pairing room-reading wedding DJ sets with live music and lighting design.	daryle@djdmac.com	(202) 328-1967	https://www.djdmac.com/	https://www.instagram.com/therealdjdmac/
District Strings	Music		Washington	District of Columbia	Greater DC region and beyond	Collective of 25 DC-area string players performing at weddings, from classical repertoire to fresh arrangements of current hits.			https://www.districtstrings.com/	https://www.instagram.com/districtstrings/
cb event design	Planning		Washington	District of Columbia		Woman-owned DC boutique planning team handling wedding planning and production alongside venue management and event programming.	info@cbeventdesign.com		https://www.cbeventdesign.com/	https://www.instagram.com/cbeventdesign/
Velada Events	Planning		Washington	District of Columbia	DC, Maryland, Virginia and the East Coast	DC planning studio led by Geraldine, offering full and partial planning with a focus on multicultural, bilingual and non-traditional weddings.			https://veladaevents.com/	https://www.instagram.com/velada.events/
Katelyn Alexandria Photography	Photography		Washington	District of Columbia	Coast to coast and international	Film-led documentary wedding photographer shooting 35mm, medium format and Polaroid alongside digital, from Capitol Hill elopements up.			https://katelynalexandriaphotography.com/	https://www.instagram.com/katelynalexandriaphoto/
The Cakeroom Bakery	Cake	2006 18th St NW	Washington	District of Columbia		Adams Morgan bakery offering wedding cake tastings and build-your-own tiered wedding cakes, alongside vintage-style celebration cakes.	info@cakeroombakery.com	(202) 450-4462	https://shop.cakeroombakery.com/	https://www.instagram.com/the_cakeroom/
DC Elite Image	Hair & Makeup		Washington	District of Columbia	Within 10 miles of DC; travel fee beyond	DC hair and makeup team led by Teresa Foss Del Rosso, specialising in multicultural hair, textured curls and all skin tones for weddings.			https://dceliteimage.com/	https://www.instagram.com/dceliteimage/
Conceptual Beauty	Hair & Makeup		Washington	District of Columbia	On-site at hotels, venues and studios	DC hair and makeup team offering on-site bridal styling with a consultative approach and gentle, natural-looking enhancement.	info@conceptualbeauty.com	202-420-8112	https://www.conceptualbeauty.com/	https://www.instagram.com/conceptualbeauty/`,
  },
  {
    name: "Washington: videography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Love in Color Films	Videography		Washington	District of Columbia	Washington DC, Maryland, Northern Virginia, Boston and New England	Wedding film studio started in 2016 by Julian Spessard, making candid, cinematic films with packages published openly on its site.	info@loveincolorfilms.com		https://www.loveincolorfilms.com/	https://www.instagram.com/loveincolorfilms/`,
  },
  {
    name: "Washington: hair & makeup",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Cole Stevens Salon	Hair & Makeup	1247 E Street SE	Washington	District of Columbia		Capitol Hill hair salon offering bridal styling with trial sessions, on-site getting-ready services and hair for the whole wedding party.	csinfo@colestevenssalon.com	(301) 345-0033	https://www.colestevenssalon.com/bridal-services-request/	https://www.instagram.com/colestevenssalon/`,
  },
  {
    name: "Washington: music",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Kennedy String Quartet	Music		Washington	District of Columbia	Washington DC region	DC string quartet founded in 2015 playing ceremonies and cocktail hours from a repertoire of more than 700 classical and pop songs.	gavon@kennedyquartet.com	(443) 247-8370	https://www.kennedyquartet.com/	`,
  },
  {
    name: "Washington: photography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Rodney Bailey Photography	Photography	1133 14th Street NW	Washington	District of Columbia	Washington DC, Northern Virginia and Maryland	Documentary wedding photography from a long-running DC studio, covering Washington, Northern Virginia and Maryland weddings in a photojournalistic style.	photography@rodneybailey.com	(703) 362-5996	https://www.rodneybailey.com/	https://www.instagram.com/rodneybaileyphotojournalist_/
Liz Fogarty Photography	Photography		Washington	District of Columbia	The East Coast and beyond	Washington-based photographer producing editorial, heirloom-minded imagery for full wedding weekends, from city ceremonies to tented Virginia estates.			https://lizfogartyphotography.com/	https://www.instagram.com/lizfogarty/
Shelly Pate Photography	Photography		Washington	District of Columbia	Washington DC, the Shenandoah Valley and the greater DMV	Fun, romantic and adventurous wedding photography from a DC photographer, including elopements and Shenandoah Valley weddings.	shellypatephoto@gmail.com		https://shellypatephotography.com/	https://www.instagram.com/shellypatephoto/
Erum Rizvi Photography	Photography		Washington	District of Columbia	Washington DC, Maryland, Virginia and global destinations	DC photographer specialising in South Asian, fusion and multicultural weddings, from Hindu and Sikh to Muslim and Pakistani celebrations.	erum@erumrizvi.com	571-243-2694	https://www.erumrizvi.com/	`,
  },
  {
    name: "Washington: videography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Feeling Weddings	Videography		Washington	District of Columbia	DC, Virginia and Maryland	Small family-run wedding film studio covering DC, Virginia and Maryland, with photography and livestreaming offered alongside the films.			https://feelingweddingfilms.com/	https://www.instagram.com/feelingweddings/
Capital Films DC	Videography		Washington	District of Columbia	Washington DC, Maryland and Virginia	DC video production company with a wedding arm offering cinematography, photography and social content for couples in DC, Maryland and Virginia.		757-254-1704	https://www.capitalfilmsdc.com/	https://www.instagram.com/capitalfilmsdc/
The Studio Weddings	Videography		Washington	District of Columbia	Washington DC, Maryland and Virginia	Cinematic wedding videography with a calm, documentary approach, filming for couples across DC, Maryland and Virginia.			https://thestudioweddings.com/	https://www.instagram.com/thestudioweddings/`,
  },
  {
    name: "Washington: planning",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Anne Book Event Design	Planning		Washington	District of Columbia	Mid-Atlantic, Midwest and East Coast	Anne Book's DC event design studio, mixing planning, styling and off-premise catering for laid-back luxe weddings across the East Coast.			https://annebook.com/	https://www.instagram.com/annebook_/
G&N Events	Planning		Washington	District of Columbia	DC, Maryland and Virginia	Mother-and-daughter team planning weddings in DC, Maryland and Virginia, with month-of, partial and full planning including cross-cultural ceremonies.	contactgnevents@gmail.com		https://www.gandnevents.com/	https://www.instagram.com/gneventsllc/
DC Event Planner	Planning		Washington	District of Columbia	DC, Maryland, Virginia and beyond	Black- and woman-owned DC planning firm handling weddings and proposals alongside wider events in DC, Virginia and beyond.	info@eventsbytrb.com		https://www.thedceventplanner.com/	https://www.instagram.com/thedceventplanner/`,
  },
  {
    name: "Washington: florals",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Little Acre Flowers	Florals	2004 17th St NW	Washington	District of Columbia	Washington DC, Maryland and Northern Virginia	Washington florist using locally grown seasonal flowers, offering full-service wedding design and smaller à la carte event florals.	info@littleacreflowers.com	(202) 524-0812	https://www.littleacreflowers.com/	https://www.instagram.com/littleacreflowers/
Capitol Hill Blooms	Florals	600 Pennsylvania Ave SE	Washington	District of Columbia	Washington DC	Capitol Hill flower shop making custom wedding bouquets and ceremony and reception flowers, with bridal consultations.		(202) 547-8405	https://www.capitolhillblooms.com/wedding-flowers	
Klassy Kreations	Florals		Washington	District of Columbia	Washington DC, including Georgetown, Navy Yard and Capitol Hill	Full-service DC wedding florist known for elegant, garden-style designs, with semi-custom packages and chuppah rentals.			https://klassy-kreations.com/washington-dc-wedding-florist	https://www.instagram.com/klassykreations/`,
  },
  {
    name: "Washington: music",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
DJ Casanova Productions	Music		Washington	District of Columbia	Washington DC, Maryland and Virginia	Bilingual English and Spanish DJ service for weddings and quinceañeras, with uplighting and Latin and bicultural sets.			https://djxcasanova.com/	https://www.instagram.com/djxcasanova/
String Poets	Music		Washington	District of Columbia	Washington DC, Alexandria, Potomac, Baltimore, Leesburg and Frederick	String quartets, trios and soloists for wedding ceremonies and cocktail hours, drawn from Washington and Baltimore musicians.		202-465-2310	https://ceremonymusic.net/	`,
  },
  {
    name: "Washington: hair & makeup",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Carla Pressley Hair & Makeup	Hair & Makeup		Washington	District of Columbia	Washington DC, Northern Virginia and Bethesda	Mobile bridal hair and makeup artist working across DC, Northern Virginia and Bethesda, with a dedicated wedding gallery.	carla@carlapressley.com	515-966-4682	https://www.carlapressley.com/	https://www.instagram.com/carlapressleyhairmakeup/
Royal Makeup & Hair	Hair & Makeup		Washington	District of Columbia	Washington DC, Northern Virginia and Maryland	Mobile hair and makeup team offering tiered bridal packages for weddings across the DMV.			https://royalmakeupandhair.com/	https://www.instagram.com/royalmakeupandhair/`,
  },
  {
    name: "Washington: catering",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Paris Caterers	Catering	2258 25th Place NE	Washington	District of Columbia	Washington, DC; Maryland; Virginia	Washington-based caterer handling wedding menus and service for couples across DC, Maryland and Virginia, with an office on Pennsylvania Avenue.	sofia@pariscaterers.com	202-349-1404	https://www.pariscaterers.com/weddings-caterer	https://www.instagram.com/pariscaterers/
Six Street Eats	Catering		Washington	District of Columbia	Washington, D.C. region	Chef-driven DC caterer, running since 2013, offering seasonal full-service and drop-off menus for weddings across the Washington region.	catering@sixstreeteats.net		https://www.sixstreeteats.com/	https://www.instagram.com/sixstreeteats/`,
  },
  {
    name: "Washington: cake, music, catering, florals, hair & makeup, planning, videography and photography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Frost & Flourish	Cake		Washington	District of Columbia	Washington DC, Maryland and Virginia	Family-run DC bakery making custom wedding cakes with Asian-inspired flavours such as ube, pandan, matcha and yuzu, kept deliberately not too sweet.			https://www.frostandflourish.com/	
5-12 Dessert	Cake		Washington	District of Columbia	Washington DC and Maryland	Black-owned DC dessert shop making custom wedding cakes, micro and petite tiered cakes, cupcake towers and dessert bars, with private tastings.		(202) 841-4127	https://5-12dessert.com/	https://www.instagram.com/512dessert/
Baked by Yael	Desserts	3000 Connecticut Ave NW	Washington	District of Columbia	DC area	Kosher, nut-free bakery by the National Zoo offering cakepop displays and favours as a twist on the traditional wedding cake.		202.234.9235	https://www.bakedbyyael.com/pages/custom-treats-everyone-will-love	https://www.instagram.com/bakedbyyael/
DJ Reece	Music		Washington	District of Columbia	Washington DC and surrounding areas	DC wedding DJ and MC bringing his own sound and lighting, also playing corporate and private events across the District and nearby.	bookings@djreece.com	202-836-1442	https://djreece.com/	https://www.instagram.com/djreecetoc/
Chris Laich Music Services	Music		Washington	District of Columbia	DC, Maryland and Virginia, including Northern Virginia and the Eastern Shore	Wedding DJ and MC for historic mansions, barns and hotels, with battery-powered speakers for outdoor ceremonies and wireless uplighting for DJ clients.	info@chrislaich.com	240.418.6207	https://www.chrislaich.com/	
Eat & Smile Catering	Catering	2212 Rhode Island Ave NE	Washington	District of Columbia		Boutique DC caterer since 2007 that sources from nearby farms and prices a la carte, so couples choose which parts of the event it handles.	oliver@eatandsmilecatering.com	202.270.1018	https://www.eatandsmilecatering.com/	https://www.instagram.com/eatandsmilecatering/
CNF Catering	Catering	1220 19th St NW	Washington	District of Columbia	Washington DC metro area	Locally owned Golden Triangle caterer founded in 1986, offering customised menus with full-service or drop-off options for weddings and other events.	sales@cnfcatering.com	(202) 293-0515	https://cnfcatering.com/	https://www.instagram.com/cnfcatering/
B. Lin Catering	Catering		Washington	District of Columbia	Washington DC	DC caterer since 2012 with highly customisable menus shaped by its multicultural kitchen team and a focus on balanced, healthy meals.	food@blincatering.com	202-838-3133	https://www.blincatering.com/	https://www.instagram.com/blincatering/
She Loves Me	Florals	1550 Harry Thomas Way NE, Suite 180	Washington	District of Columbia	Washington DC and nationwide	Avant-garde floral studio in Northeast DC offering full-service and a la carte wedding florals, plus workshops and subscriptions.			https://shelovesme.com/	
Picnic & Unwind	Florals		Washington	District of Columbia	DC and the DMV	Boutique floral studio for intimate events, small weddings and elopements, with a la carte pickup arrangements or full-service design and setup.	info@picnicandunwind.com	202-683-9514	https://www.picnicandunwind.com/flowerdesign	https://www.instagram.com/picnic.and.unwind/
Flowers On Fourteenth	Florals		Washington	District of Columbia	Washington, with delivery into nearby Maryland and Virginia	Washington florist known for same-day delivery that also keeps a wedding collection, delivering to nearby Maryland and Virginia communities.			https://flowerson14th.com/	
Georgetown Bride	Hair & Makeup		Washington	District of Columbia	Washington DC	Bridal makeup, hair, brow shaping and lashes by a DC team that works on-site in the couple's hotel suite or home on the wedding morning.			https://www.georgetownbride.com/	https://www.instagram.com/georgetownbride/
Kelley Woods Beauty	Hair & Makeup		Washington	District of Columbia	Washington DC, Maryland and Virginia	Bridal makeup artist for brides and their parties, with galleries from DC-area weddings and destination work, plus beauty classes.		(240) 286-6929	https://kelleywoods.com/	https://www.instagram.com/kwoodsbeauty/
Makeup by Alby	Hair & Makeup		Washington	District of Columbia	DC, Maryland and Virginia	Bridal makeup artist with about a decade in beauty, offering free consultations, trials and wedding-day looks for the DC region.			https://www.makeupbyalby.com/	https://www.instagram.com/makeupbyalby/
Beautifully You. by Mia	Hair & Makeup		Washington	District of Columbia	DC area, travelling	Freelance DC-area makeup artist whose bridal work aims for a timeless, personalised look that enhances rather than masks.			https://www.beautifullyyoubymia.com/	
Andrea Green Events & Design	Planning		Washington	District of Columbia	Metro DC, Orlando, Charleston and beyond	Full wedding planning that starts in engagement season, covering budget guidance, decisions and vendor recommendations for Metro DC couples.	info@andreagreenevents.com	703.718.6056	https://www.andreagreenevents.com/	https://www.instagram.com/andreagreenevents/
Statuesque Events	Planning		Washington	District of Columbia	DC, Maryland and Virginia	Planner specialising in multicultural weddings, with custom design, minute-by-minute schedules and full on-site coordination.			https://statuesqueevents.com/	https://www.instagram.com/statuesqueevent/
O'Neil Events	Planning		Washington	District of Columbia	Washington DC, Maryland, Virginia and New York City	Full-service planning and month-of coordination from a DC and New York native, covering venues such as Georgetown and The Wharf.	hello@oneilevents.com	(301) 633-6719	https://oneilevents.com/	https://www.instagram.com/oneil.events/
Vona B. Productions	Videography		Washington	District of Columbia	Washington DC and surrounding areas	Cinematic wedding films weaving real moments, vows and speeches with music, with engagement and family films also on offer.			https://vonabproductions.com/	https://www.instagram.com/vonabproductions/
Mari Harsan Studios	Videography		Washington	District of Columbia	Washington DC, Virginia, Maryland and destinations	Husband-and-wife duo shooting wedding video and photography, with films from DC venues such as Anderson House and the Willard.			https://mariharsan.com/	https://www.instagram.com/mariharsanstudios/
Eli Turner Studios	Photography		Washington	District of Columbia	Washington DC metro, Northern Virginia and Maryland	Documentary wedding photographer working since 2010, also offering engagement sessions, albums, and bar and bat mitzvah coverage.	info@eliturner.com	202-525-7055	https://www.eliturner.com/	https://www.instagram.com/eliturnerstudios/
Mantas Kubilinskas Photography	Photography		Washington	District of Columbia	Washington DC, Virginia, Maryland and worldwide	Candid, documentary-style wedding photography with venue scouting, timeline planning, and highlights within 48 hours of the day.	mantas@mantasphoto.com	+1 (202) 213-7369	https://www.mantasphoto.com/	https://www.instagram.com/mantaskubilinskasphotography/`,
  },
  {
    name: "Washington: photography, planning, videography and music",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Chris Ferenzi Photography	Photography	2122 Massachusetts Ave NW	Washington	District of Columbia		Wedding photographer for unconventional couples, with 250+ weddings shot across Washington and a studio on Massachusetts Avenue.	chris@chrisferenzi.com	609-790-1727	https://www.chrisferenzi.com/	
Natalie Estess Photography	Photography		Washington	District of Columbia		DC photographer shooting weddings and elopements on digital and film, and happy to travel for destination celebrations.			https://www.natalieestess.com/	https://www.instagram.com/natalieestessphotography/
Aimee Custis Photography	Photography		Washington	District of Columbia	East Coast, Virginia, Maryland and beyond	DC wedding photographer with a gentle, hands-off approach who keeps colour true to life across the day.			https://www.aimeecustis.com/	https://www.instagram.com/aimeecustis/
Kinfete Weddings & Events	Planning		Washington	District of Columbia	DC, Maryland, Virginia and the East Coast	DC planning team, formerly Weddings by Kristy, taking on the logistics so couples can stay focused on their people.			https://www.kinfete.com/	https://www.instagram.com/kinfete.events/
Capitol Romance	Planning		Washington	District of Columbia	DC Metro Area	DC wedding resource offering coordination for practical, personalised weddings, plus real-wedding features and a shop.			https://www.capitolromance.com/	https://www.instagram.com/capitolromance/
Lune Dune Pictures	Videography		Washington	District of Columbia		DC film production company with a wedding division making cinematic, story-driven films from engagement to vows.			https://www.lunedunepictures.com/weddings	https://www.instagram.com/lunedunepictures/
The "Original" Moonlighters	Music		Washington	District of Columbia	DC, Maryland, Virginia and across the US	Motown and variety dance band playing weddings in DC, Maryland and Virginia, and travelling to around twenty states.	info@14kmusic.com	(202) 855-1010	https://moonlightersweddingband.com/	https://www.instagram.com/mltrsband/
`,
  },
  {
    name: "Washington: cake, planning",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Couture Cakes by Sabrina	Cake		Washington	District of Columbia	Washington DC and Maryland	Custom wedding cakes finished with handmade sugar flowers, baked in limited numbers each month and delivered by cold van with on-site assembly.	info@cakesbysabrina.com		https://www.cakesbysabrina.com/	https://www.instagram.com/couturecakesbysabrina/
Sarah Kazemburg Events & Styling	Planning		Washington	District of Columbia	Washington DC, the wider DMV, Maryland's Eastern Shore, Charlottesville and East Coast destinations	Luxury full-service planning and design firm based in DC, creating refined multi-day wedding weekends around the DMV and further along the East Coast.	sarah@skbevents.com	(301) 339-8400	https://skbevents.com/	https://www.instagram.com/sarahkazemburgevents/
Andrew Roby Events	Planning		Washington	District of Columbia	Washington DC, Maryland, Virginia and destinations	DC planning and production company that handles weddings alongside corporate events, offering personalised celebrations across the DC region and beyond.			https://andrewrobyevents.com/	https://www.instagram.com/andrewrobyevents/
`,
  },
  {
    name: "Washington: cake",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Pâtisserie Poupon	Cake	1645 Wisconsin Avenue	Washington	District of Columbia	Washington DC and Baltimore, with delivery across the Baltimore-Washington area	Georgetown French bakery making cakes and wedding cakes in-house with traditional techniques since 1986, alongside croissants, tarts and pastries.		(202) 342-3248	https://patisseriepoupon.com/	https://www.instagram.com/patisserie.poupon/
`,
  },
  {
    name: "Washington: cake",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Cakes by Lala	Cake		Washington	District of Columbia	Washington DC and the greater metro Washington area	Washington DC baker making custom tiered cakes for weddings and other occasions, finished with its signature vanilla buttercream.	cakesbylalae@gmail.com		https://www.cakesbylala.org/	https://www.instagram.com/cakesbylalae/`,
  },
];

export default batches;
