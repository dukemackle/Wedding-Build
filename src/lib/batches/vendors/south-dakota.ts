import type { VendorBatch } from "@/lib/vendor-batches";

// South Dakota vendor batches. Every row's State is "South Dakota". Add new batches at the end.
const batches: VendorBatch[] = [
  {
    name: "Sioux Falls: photography and videography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Jenna Heckel Photography	Photography		Sioux Falls	South Dakota	Sioux Falls and surrounding South Dakota	Wedding and elopement photographer in Sioux Falls whose style leans on candid, emotional moments between couples.			https://www.jennaheckelphoto.com/	https://www.instagram.com/jennaheckelphotography/
Michael Liedtke Photography	Photography		Sioux Falls	South Dakota	Sioux Falls, the Black Hills and the wider Midwest	Documentary-style wedding and elopement photographer who also shoots film and travels for destination elopements.	hello@michaelliedtke.com	605-310-4639	https://michaelliedtke.com/	https://www.instagram.com/michaelliedtke/
Salt & Light Studios	Photography		Sioux Falls	South Dakota		Sioux Falls wedding and couples photographer, run by one photographer who also travels for weddings beyond the city.			https://www.saltandlightstudios.co/	https://www.instagram.com/saltandlightstudios/
Ivory & Fern	Videography	714 N Duluth Ave	Sioux Falls	South Dakota		A husband-and-wife studio where he films and she photographs, with wedding film packages and more than nine years of weddings behind them.	hello@ivoryandfern.com	605.212.5330	https://www.ivoryandfern.com/	
Woody Wagon Creative	Videography		Sioux Falls	South Dakota	Sioux Falls metro, with no travel fee in the area	Wedding films with highlight edits plus full ceremony and speeches, in a documentary style, from a team with over 100 weddings shot.			https://woodywagoncreative.com/	https://www.instagram.com/woodywagoncreative/
`,
  },
  {
    name: "Sioux Falls: planning, florals, music, catering, hair and makeup, cakes and videography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Storybook Love Events	Planning		Lennox	South Dakota	South Dakota, including Sioux Falls and Rapid City	Lennox-based planner offering full planning, partial planning and day-of coordination in three tiered packages across South Dakota.		605-252-8604	https://storybookloveevents.com/	https://www.instagram.com/storybookloveevents/
Serendipitous Events	Planning	524 N Main Ave	Sioux Falls	South Dakota	South Dakota, Iowa and destination weddings	Sioux Falls planning studio founded in 2008, offering month-of coordination, partial and full planning with a signature design style.	hello@siouxfallseventplanning.com	605-321-6689	https://www.siouxfallseventplanning.com/weddings	https://www.instagram.com/serendipitous_events/
Jane Rae Events	Planning	301 S Minnesota Ave	Sioux Falls	South Dakota		Downtown Sioux Falls boutique studio combining wedding planning, event design, floral design and rentals under one roof.	hello@janeraeevents.com	(605) 799-3761	https://www.janeraeevents.com/	https://www.instagram.com/janeraeevents/
Olive & Grace Floral Design Company	Florals	4020 W Tickman St	Sioux Falls	South Dakota	Sioux Falls and beyond	Sioux Falls studio, open since 2017, doing lush, garden-inspired wedding florals, large installations and candle and vase rentals.	hello@oliveandgracefloral.com		https://www.oliveandgracefloral.com/	https://www.instagram.com/oliveandgrace.co/
The Flower Mill	Florals	4005 E 10th St	Sioux Falls	South Dakota	Sioux Falls and surrounding areas	Sioux Falls florist offering wedding consultations plus rentals such as arches, candelabras and floral walls for ceremonies and receptions.	orders@flower-mill.com	(605) 274-6080	https://flower-mill.com/sioux-falls-florist-flower-delivery/wedding-flowers/	https://www.instagram.com/theflowermillsf/
Bella Rosa Market	Florals	401 E 8th St	Sioux Falls	South Dakota	Sioux Falls area	Downtown Sioux Falls flower shop and home decor market offering a la carte or full-service floral design for weddings and events.			https://bellarosamarket.com/	https://www.instagram.com/bellarosafloral/
DJ SieffStyle Entertainment	Music		Sioux Falls	South Dakota	South Dakota, Iowa and Minnesota	Sioux Falls wedding DJ and MC service that also supplies ceremony sound, uplighting and photo booth rental.	djsieffstyle@gmail.com	605-413-5063	https://www.djsieffstyle.com/	https://www.instagram.com/djsieffstyle/
Joey Cazanova Entertainment	Music		Sioux Falls	South Dakota	Sioux Falls and surrounding areas	Sioux Falls DJ who has played weddings since 1997 and has a long background in radio, clubs and large live shows.	djworldwidetalent@gmail.com	605.305.6132	https://www.joeycazanova.com/	
Wright Music & Entertainment	Music		Sioux Falls	South Dakota	South Dakota, Minnesota and Iowa	Sioux Falls wedding DJ and emcee service that also provides lighting and a photo booth for receptions.	brody@wrightmusicent.com	507-227-8264	https://wrightmusicent.com/	https://www.instagram.com/wright_music_/
Chef Dominique's Catering	Catering	230 S Phillips Ave Ste 100	Sioux Falls	South Dakota		Sioux Falls caterer with its own downtown banquet hall for up to 300, handling receptions, rehearsal dinners and day-after brunches.	events@chefdomscatering.com	605-336-0455	https://chefdomscatering.com/wedding-catering	
En Place Catering	Catering		Sioux Falls	South Dakota	Sioux Falls	Sioux Falls caterer that handles weddings from 10 to 500 guests, with setup, staffing, service and cleanup included in its full-service rate.	hello@enplacecatering.com	605-271-4484	https://www.enplacecatering.com/wedding-catering	
On The Spot Catering	Catering	2005 Industrial St Ste 1	Tea	South Dakota	Sioux Falls area	Family-run caterer in Tea making comfort food from scratch, with setup included, for weddings and other events around Sioux Falls.	info@onthespotcateringsd.com	(605) 929-0084	https://www.onthespotcateringsd.com/	
Platinum Imagination Hair and Makeup	Hair & Makeup		Sioux Falls	South Dakota	Sioux Falls and surrounding area	Downtown Sioux Falls hair and makeup studio offering bridal trials, engagement looks and touch-up kits, on site or in the studio.	angelique@platinumimagination.com	605-321-5351	https://platinumimagination.com/bride	https://www.instagram.com/platinumihmua/
American Beauty	Hair & Makeup	401 E 8th St Ste 200N	Sioux Falls	South Dakota		Downtown Sioux Falls beauty studio doing bridal makeup in the studio, with the owner also travelling to weddings.	info@americanbeautysd.com	(605) 376-1782	https://americanbeautysd.com/	https://www.instagram.com/americanbeautysd/
Oh My Cupcakes!	Cake	5015 S Western Ave	Sioux Falls	South Dakota		Sioux Falls bakery with two shops that bakes cupcakes, cakes and desserts from scratch, including wedding cakes.			https://ohmycupcakes.com/	https://www.instagram.com/ohmycupcakes/
Anthony Begley Productions	Videography		Sioux Falls	South Dakota	The Midwest and beyond	Sioux Falls filmmaker making cinematic wedding and elopement films that lean on natural, unposed moments.			https://anthonybegley.com/	https://www.instagram.com/anthonybegleyproductions/
`,
  },
  {
    name: "Sioux Falls: hair and makeup",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Bombshell Beauty Makeup Studio	Hair & Makeup	1501 S Lake Ave	Sioux Falls	South Dakota	Sioux Falls	Central Sioux Falls makeup studio offering all-inclusive bridal makeup with airbrush application, lessons, and on-location work within the city.		605-759-2419	https://www.bombshellbeautysf.com/	https://www.instagram.com/bombshellbeautysf/
`,
  },
  {
    name: "Sioux Falls: cake",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
The Cake Lady	Cake	2225 W 50th St	Sioux Falls	South Dakota		Family wedding-cake bakery working from three generations of recipes, with design consultations, tastings, delivery and set-up.	anna@thecakeladysf.com	(605) 370-1909	https://www.thecakeladysf.com/weddings-cakes	https://www.instagram.com/cakeladysf/
Blush Bakery by Kate	Cake		Sioux Falls	South Dakota		Boutique home bakery baking elegant scratch-made wedding cakes and mini desserts, with consultations for engaged couples.	kate@blushbakerybykate.com		https://www.blushbakerybykate.com/	https://www.instagram.com/blushbakerybykate/`,
  },
  {
    name: "Rapid City: photography, videography, florals, music, catering, cake and hair & makeup",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Lavender Bouquet Photography	Photography		Rapid City	South Dakota	Black Hills and surrounding areas	Rapid City wedding photographer working since 2011, with set collections and venue guides for Black Hills ceremonies.	photo.lavenderbouquet@gmail.com	(605) 389-3299	https://lbpblackhills.com/	https://www.instagram.com/lavenderbouquetphoto/
Michaela Made Photo Co.	Photography		Rapid City	South Dakota	Rapid City, the Black Hills and Badlands	Wedding and elopement photographer who stresses honest moments, offers film and can also officiate the ceremony.	hello@michaelamadephoto.com		https://michaelamadephoto.com/	https://www.instagram.com/michaela.made.photo/
Wandering Wilde Media	Photography		Rapid City	South Dakota	Black Hills and beyond	Husband-and-wife photo and video team with a Catholic wedding focus, gentle posing guidance and true-to-life editing.			https://wanderingwildemedia.com/	https://www.instagram.com/wanderingwildemedia/
Legacy Photography	Photography		Rapid City	South Dakota	Black Hills, Badlands and Spearfish Canyon	Photographer specialising in small, intimate elopements, including Sturgis Rally weddings and destination trips.			https://legacytheblog.com/weddings/	https://www.instagram.com/legacyphotoanddesign/
Engaging Beauty	Photography		Rapid City	South Dakota	Black Hills region	Downtown Rapid City photographer shooting engagements and weddings, with printed heirloom products for the finished photos.	geiger.art@gmail.com	605-390-5823	https://engagingbeauty.com/	
Zsomething Films	Videography		Rapid City	South Dakota	Black Hills, with travel across the Midwest and beyond	Husband-and-wife filmmakers making wedding and elopement films in the Black Hills, and happy to travel for destination days.		(605) 430-7596	https://www.zsomethingfilms.com/	https://www.instagram.com/zsomethingfilms/
605 Media & Entertainment	Videography		Spearfish	South Dakota	Rapid City to Spearfish	Documentary-style wedding films with real audio, vow and toast recordings, and a photo-plus-video package with a partner photographer.	hello@605me.com	(605) 210-0314	https://www.605me.com/wedding-films	https://www.instagram.com/605mae/
Flowers by LeRoy	Florals		Rapid City	South Dakota	Spearfish to Custer State Park	Rapid City florist open since 1968, making bridal bouquets and ceremony and reception flowers, with event equipment to rent.		(605) 342-0128	https://www.flowersbyleroy.wedding/	https://www.instagram.com/flowersbyleroy/
Roots Wedding Floral	Florals		Rapid City	South Dakota	Rapid City and the Black Hills	Wedding floral arm of Root's Greenhouse, designing bouquets, ceremony flowers and centrepieces with blooms from its own greenhouse.		(605) 787-5050	https://rootsweddingfloral.com/	
Forget-Me-Not Floral	Florals	519 7th St	Rapid City	South Dakota	Rapid City, with delivery to nearby towns	Downtown Rapid City flower shop offering bridal packages, ceremony décor and centrepieces, with wedding consultations.		(605) 343-7882	https://www.forget-me-not-floral.com/	
DJ Marek	Music		Rapid City	South Dakota	Rapid City, Spearfish and Custer State Park	Rapid City DJ with 23 years of experience including cruise ships, supplying sound, lighting and effects for wedding receptions.			https://www.djmarek.com/	https://www.instagram.com/djmarek_official/
DJ Hanzie Hanz	Music		Rapid City	South Dakota	Rapid City and the Black Hills	DJ and emcee offering a la carte ceremony-only, reception-only and extra-hour packages, with ceremony vocalists and lighting design.	DJ@hanziehanz.com	605-641-3248	https://djhanziehanz.com/	
Angel's Catering & Receptions	Catering	12340 Jenter Rd	Summerset	South Dakota	Black Hills, on site or at your venue	Family catering business since 1996 with its own Summerset reception hall seating up to 200, plus off-site catering.	contact@angelscatering.biz	605-721-9229	https://www.angelsreceptions.com/	
Catered by Karen A.	Catering		Rapid City	South Dakota	Rapid City and the Black Hills	Caterer known for fresh grazing boards and tables for parties and events, with delivery and pick-up around Rapid City.	karenanag@gmail.com	605-390-9473	https://www.cateredbykarena.com/	https://www.instagram.com/cateredbykarena/
Old West Dutch Oven Catering Company	Catering		Black Hawk	South Dakota	Western South Dakota and eastern Wyoming	Dutch-oven caterer offering either costumed Old West service or a traditional formal one, and wedding menus to match.		602-550-9545	https://www.oldwestdutchovencatering.com/	
The Rustic Nook Bakery	Cake	1080 SD445	Rapid City	South Dakota	Rapid City, with delivery	Rapid City bakery making single and multi-tier wedding cakes, cupcakes and dessert bars, with free cake tastings.	rusticnookbakery@gmail.com	605-786-6126	https://www.rusticnookbakery.com/	https://www.instagram.com/rusticnookbakery/
Star Spangled Batter	Cake	2130 Jackson Blvd	Rapid City	South Dakota	Rapid City and the Black Hills	Cupcake shop and cake maker with inventive flavour pairings, handling wedding cakes and cupcake towers for events.		605-209-1491	https://starspangledbatter.com/	https://www.instagram.com/starspangledbatter/
Willow Salon and Spa	Hair & Makeup	613 6th St	Rapid City	South Dakota	Rapid City and wedding venues across the Black Hills	Salon whose bridal team does hair and makeup for the whole party, plus groom touch-ups, and travels to your venue.	info@willowsalonbh.com	605-718-3797	https://www.willowsalonbh.com/weddings	https://www.instagram.com/willowsalonbh/
Create Beauty Studio	Hair & Makeup	809 South St	Rapid City	South Dakota	Rapid City and the Black Hills	Rapid City makeup and body-care studio offering luxury beauty services, with bridal and wedding-party work in its portfolio.			https://www.createbeautystudio.com/	https://www.instagram.com/createbeautystudio/`,
  },
  {
    name: "Sioux Falls: planning, videography, music, catering and florals",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Hitch Studio	Planning	406 Main Ave	Brookings	South Dakota	Brookings, Sioux Falls, Watertown, Aberdeen, Mitchell and across South Dakota and southwest Minnesota	Brookings planning and design studio offering full or partial wedding planning, decor styling, rentals, invitations and officiating, plus venue management.		605-592-9072	https://hitchstudio.com/wedding-planning/	https://www.instagram.com/hitchstudio/
Pink Tie Events	Planning		Sioux Falls	South Dakota		Day-of coordination for couples who plan their own wedding, covering minute-by-minute timelines, vendor checks and DIY decor setup.	hello@pinktieeventsco.com	605-215-1674	https://www.pinktieeventsco.com/	https://www.instagram.com/pinktie_events/
Grey Summit Productions	Videography	2601 W Sudbury St	Sioux Falls	South Dakota		Sioux Falls wedding filmmaker with over 20 years in video production, offering cinematic films, all-day coverage packages and live streaming of ceremonies.		605-695-1067	https://www.greysummit.com/	https://www.instagram.com/greysummitproductions/
PINstudios	Videography		Tea	South Dakota	South Dakota, with travel out of state	Production studio whose wedding films have no set hour blocks, so the crew can stay from morning preparations through the late reception.	hi@pinstudios.media	(605) 679-6089	https://weddings.pinstudios.media/	https://www.instagram.com/pinstudiossf/
Sanders Media	Videography		Sioux Falls	South Dakota		Sioux Falls media business making wedding films alongside real estate photography, commercial video, aerial work and audio production.		(605) 864-7556	https://www.sandersmedia.net/wedding-films	https://www.instagram.com/justinsandersofficial/
AJ Production Company	Videography		Sioux Falls	South Dakota	Sioux Falls, the Black Hills, North Dakota and Nebraska	Film company making cinematic wedding and engagement films, with commercial work too, and travelling across the Dakotas and Nebraska.			https://www.ajproductioncompany.com/	https://www.instagram.com/ajproductioncompany/
DJ Jer Events	Music	2101 Industrial St	Tea	South Dakota	Sioux Falls area	Wedding DJ, MC and live band booking led by an event lighting designer, with uplighting, monograms, pin spotting and photo booths.	hello@djjer.com	605-368-1647	https://djjer.com/	
Roll'n Pin Catering	Catering		Sioux Falls	South Dakota	Sioux Falls, Brandon, Tea and the wider Sioux Empire	Restaurant-backed Sioux Falls caterer serving weddings since 1974 with buffets, plated meals, food stations and bar service.		605-339-9191	https://rollnpin.com/weddings	
Pied Piper Flowers & Gifts	Florals	308 W 15th St	Yankton	South Dakota	Yankton and surrounding areas	Yankton florist designing wedding bouquets, ceremony arches, candelabra flowers and centrepieces, with consultations by phone or online.		(605) 665-7700	https://www.piedpiperflowers.com/wedding-flowers	https://www.instagram.com/piedpiperflowersandgifts/
Brickhouse Flowers	Florals	236 N Main Street	Salem	South Dakota		Salem florist who takes on one wedding at a time and designs every bouquet and arrangement personally, after a sit-down consultation.		605-425-2090	https://www.brickhouseflowers.com/wedding-flowers	https://www.instagram.com/brickhouse_flowers/
`,
  },
  {
    name: "Rapid City: music, hair & makeup, planning and photography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Colt 45 Entertainment	Music		Rapid City	South Dakota	South Dakota, North Dakota, Wyoming and Nebraska, with a Black Hills focus	DJ and MC company running Black Hills weddings since 2005, adding lighting, photo booths and cold sparks to its wedding packages.	info@colt45entertainment.com	(605) 484-8797	https://www.colt45entertainment.com/	https://www.instagram.com/colt45entertainment/
William Walker Salon & Barbershop	Hair & Makeup	726 Jackson Blvd	Rapid City	South Dakota		Downtown Rapid City salon where stylists, some specialising in bridal updos, offer wedding-day updos and event styling.		(605) 716-0667	https://williamwalker.style/	
Saylor Buxcel Photography	Photography		Rapid City	South Dakota	Western South Dakota, including Spearfish, Custer, Deadwood and the Badlands	Black Hills wedding and elopement photographer with a relaxed, unposed editorial style, covering canyon, meadow and granite-peak ceremonies.	Buxcelsaylor@icloud.com	(707) 599-0576	https://www.saylorbuxcelphotography.com/weddings-elopements	https://www.instagram.com/saylor.buxcel/
Sayer JaDin Photography	Photography		Rapid City	South Dakota	Black Hills and across South Dakota	Black Hills photographer taking weddings across South Dakota, with a documentary approach that keeps the small moments of the day.	sayer@sayerjadinphotography.com		https://sayerjadinphotography.com/weddings	https://www.instagram.com/sayerjadinphotography/
`,
  },
  {
    name: "Rapid City: videography, rentals, officiant, bridal & formalwear",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
BB Photo + Film	Videography		Rapid City	South Dakota	Black Hills and beyond (willing to travel)	Husband-and-wife photo and film team based in Rapid City, offering wedding videography alone or bundled with photography, with a wedding photo portfolio online.			https://www.bbphotoandfilm.com/	https://www.instagram.com/bbphotoandfilm/
Black Hills PortaLux	Rentals		Spearfish	South Dakota	Black Hills and surrounding areas	Luxury restroom trailers with heating, air conditioning and vanity sinks, hired out for weddings and other events across the Black Hills.	hello@bhportalux.com	605-391-0723	https://www.bhportalux.com/	
Something Borrowed	Rentals		Spearfish	South Dakota	Western South Dakota, Wyoming and Montana	Hire shop supplying tents, chairs, tables, linens, lighting, dance floors and draping for weddings, serving the region since 2012.		(605) 559-0265	https://www.somethingborrowedspearfish.com/	https://www.instagram.com/somethingborrowed.llc/
Your Joyful Wedding (Mary Maisey-Ireland)	Officiant		Rapid City	South Dakota	Rapid City and the Black Hills	Wedding officiant and ceremony planner who writes custom ceremonies, and also handles vow renewals and rehearsals.	mary@yourjoyfulwedding.com	(605) 484-8464	http://www.yourjoyfulwedding.com/	https://www.instagram.com/marymaiseyireland/
Audra's Bridal Gallery	Bridal & Formalwear	601 St. Joseph St	Rapid City	South Dakota		Downtown Rapid City bridal shop stocking wedding gowns, bridesmaid and mother-of-the-bride dresses, tuxedos and suits.		605-348-8816	https://audrasbridalgallery.com/	https://www.instagram.com/audrasbridalgallery/
Michael's Menwear	Bridal & Formalwear	617 St. Joseph St	Rapid City	South Dakota		Downtown menswear shop offering wedding suits and tuxedo hire for grooms and groomsmen, with fittings and set groom packages.	sales@michaelsmw.com	(605) 342-0127	https://michaelsmw.com/	
`,
  },
];

export default batches;
