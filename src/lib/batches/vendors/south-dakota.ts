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
Bombshell Beauty Makeup Studio	Hair & Makeup	1501 S Lake Ave	Sioux Falls	South Dakota	Sioux Falls	Central Sioux Falls makeup studio offering all-inclusive bridal makeup with airbrush application, lessons, and on-location work within the city.	jodi@bombshellbeautysf.com	605-759-2419	https://www.bombshellbeautysf.com/	https://www.instagram.com/bombshellbeautysf/
`,
  },
];

export default batches;
