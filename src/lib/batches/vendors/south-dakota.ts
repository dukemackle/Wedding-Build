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
];

export default batches;
