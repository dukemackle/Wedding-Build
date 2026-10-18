import type { VendorBatch } from "@/lib/vendor-batches";

// Wyoming vendor batches. Every row's State is "Wyoming". Add new batches at the end.
const batches: VendorBatch[] = [
  {
    name: "Jackson Hole: photography, planning, florals, music, catering, hair and makeup, cake and videography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
JCM Photography	Photography		Jackson	Wyoming	Jackson Hole and Grand Teton area; travels for destination weddings	Husband-and-wife team shooting weddings, elopements and engagements around Jackson Hole and the Tetons, and travelling for destination work.	info@jacksonholephotographers.com	307-231-0091	https://www.jacksonholephotographers.com/	https://www.instagram.com/jcmphotographyjacksonhole/
Kinsey Skye Photography	Photography		Jackson	Wyoming	Jackson Hole; travels worldwide	Documentary and cinematic wedding and elopement photographer based in Jackson Hole who also travels for destination weddings.	kinsey@kinseyskye.com	(307) 699-1467	https://kinseyskye.com/	https://www.instagram.com/kinseyskye/
Grayson Swingle Photography	Photography		Jackson	Wyoming	Jackson Hole, Teton Valley and Grand Teton National Park	Wedding, elopement, engagement and proposal photographer working in the mountain settings of Jackson Hole and the Teton region.	grayson@graysonswinglephotography.com		https://www.graysonswinglephotography.com/	https://www.instagram.com/gswinglephoto/
Wild Rose JH	Planning		Jackson	Wyoming	Jackson Hole and surrounding areas	Earth-conscious wedding and event planner offering full planning, partial coordination and elopement planning in Jackson Hole.	hello@wildrosejh.com	(307) 699-4901	https://wildrosejh.com/	https://www.instagram.com/wildrosejh/
Event Planners of Jackson Hole	Planning		Jackson	Wyoming	Jackson Hole and surrounding region	Team of planners and coordinators offering full planning and month-of coordination for weddings, with an in-house wedding officiant.		307-699-5253	https://eventplannersofjacksonhole.com/	
Forever West Weddings & Events	Planning		Jackson	Wyoming	Jackson Hole, Bozeman and Sun Valley	Wedding planning and event design that blends classical styling with the look of the American West, with Jackson Hole as a main location.	foreverwestwed@gmail.com		https://www.foreverwestweddings.com/	https://www.instagram.com/foreverwestweddings_events/
Briar Rose Flowers	Florals	495 E Hansen St	Jackson	Wyoming	Jackson, Wilson, Teton Village and Moose	Jackson florist doing custom wedding bouquets, centrepieces and arrangements, and delivering across the valley.	briarrose@onewest.net	(307) 732-1222	https://www.briarroseflowers.com/	
Fleur de V	Florals		Jackson	Wyoming	Jackson Hole	Floral designer Vanessa Flory creates flowers and event styling for weddings and parties in Jackson Hole.	vanessa@fleurdevevents.com	307.690.8440	https://www.fleurdevevents.com/	https://www.instagram.com/fleurdevjacksonhole/
Flowers by Chloe	Florals		Jackson	Wyoming		Custom floral design for weddings, events and the home, run as a small florist based in Jackson Hole.			https://www.flowersbychloejh.com/	https://www.instagram.com/flowersbychloejh/
Teton Tone	Music		Jackson	Wyoming	Destination weddings worldwide	Jackson Hole wedding band playing high-energy receptions, with ceremony sound, cocktail hour sets and an MC.	hello@tetontone.com		https://www.tetontone.com	https://www.instagram.com/tetontone/
Jackson Hole DJ	Music		Jackson	Wyoming	Jackson Hole and surrounding venues	DJ and live music team doing ceremony sound, reception DJing and guitar for cocktail hour, focused on Jackson Hole weddings since 2005.			https://www.jacksonholedj.com	https://www.instagram.com/jacksonholedj/
Snake River Strings	Music		Wilson	Wyoming	Jackson Hole and Teton County	String ensemble from solo to quartet for ceremonies and cocktail hours, playing together for over 20 years.	michelle@jhmusicacademy.com	307-690-0974	https://snakeriverstringsjh.com/	
Maho Catering	Catering		Jackson	Wyoming	Jackson Hole area	New American wedding catering led by Executive Chef Maho Hakoshima, covering rehearsal dinners and full wedding meals.	info@mcateringjh.com	307.734.9698	https://mcateringjh.com/	https://www.instagram.com/mahocatering/
Cafe Genevieve Catering	Catering	135 E Broadway	Jackson	Wyoming	Jackson Hole and surrounding communities	Catering arm of a Jackson restaurant that serves weddings and events of any size at the venue of the couple's choice.		307.732.1910	https://genevievejh.com/catering-events	https://www.instagram.com/cafegenevieve/
MileHighCook	Catering		Jackson	Wyoming	Jackson Hole and Teton County, plus Colorado, Arizona and Utah	Chef-owned caterer doing all-inclusive custom menus for multi-day destination weddings at Jackson ranches and resorts.	steve@milehighcook.net	(720) 730-7194	https://milehighcook.net/wedding-catering-in-jackson-hole-wyoming	https://www.instagram.com/milehighcook/
Hair & Makeup by Tanya	Hair & Makeup		Jackson	Wyoming	Jackson Hole, Park City, Big Sky and the Mountain West	On-location bridal hair and makeup team for weddings and elopements, with bridal packages starting at $650.		(720) 238-7969	https://tanyacrocker.com/services/bridal-services/	https://www.instagram.com/hmubytanya/
Hair by Mollie O	Hair & Makeup		Jackson	Wyoming	House calls in Teton Valley, Jackson Hole, Park City and Big Sky	Colourist, hairstylist and makeup artist offering bridal styling by appointment with house calls across the region.	molliewetzel@gmail.com	307.699.0461	https://www.molliewetzel.com/	https://www.instagram.com/mollieo_hairstylist/
Athena Beauty Artistry	Hair & Makeup		Jackson	Wyoming	Jackson Hole and surrounding area	On-site bridal hair and makeup artist with 12 years of commercial, editorial, wedding and salon experience.	athena@athenabeautyartistry.com	(406) 396-1012	https://www.athenabeautyartistry.com/	https://www.instagram.com/athenabeautyartistry/
Windy Woman Cakes	Cake		Jackson	Wyoming	Jackson, Pinedale, Star Valley and Teton Valley	Made-to-order bakery in Jackson making wedding and celebration cakes with simple, rustic, elegant finishes.			https://www.windywomancakes.com/	https://www.instagram.com/windywomancakes/
Simply Elegant Cakes	Cake		Jackson	Wyoming	Jackson Hole	Professionally trained pastry chef making custom wedding cakes and desserts for the Jackson Hole area.	simplyelegantcakesjh@gmail.com	307-264-5005	https://simplyelegantcakesjh.com/	
Foxy Cakes	Cake		Jackson	Wyoming	Greater Jackson Hole Valley	Custom wedding cakes, cupcakes and cookies in Jackson, with wedding cakes from $18 per serving and tasting consultations.			https://foxycakesjh.com/weddings	
Tower 3 Productions	Videography	2112 Hidden Ranch Ln	Jackson	Wyoming	Jackson Hole and beyond	Jackson video production company making wedding highlight films with aerial drone footage from FAA-licensed pilots.	info@tower3productions.com	307-699-1618	https://tower3productions.com/wedding-videography/	https://www.instagram.com/tower3productions/
Morales Photo & Film	Videography		Cody	Wyoming	Jackson Hole, Cody, Afton, Thayne, Alpine and Powell, plus Yellowstone and Grand Teton	Photographer and videographer shooting wedding films across northwest Wyoming, also offering a wildflower photo booth.			https://www.moralesphotoandfilm.com/	https://www.instagram.com/moralesphotoandfilm/
Diana Edlinger Studios	Videography		Jackson	Wyoming	Jackson Hole and worldwide destinations	Jackson Hole wedding photographer and filmmaker shooting digital, drone, Super 8 and 16mm film.			https://dianaedlinger.com/	
`,
  },
  {
    name: "Cheyenne: photography, planning, catering, hair and makeup and cake",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Janelle Rose Photography	Photography		Cheyenne	Wyoming	Cheyenne, Laramie, Fort Collins, Jackson Hole and the Front Range	Cheyenne photographer with 15+ years behind the lens, covering weddings, elopements, engagements and family portraits across southeast Wyoming.		307-399-4629	https://www.janellerosephotography.com/	https://www.instagram.com/janellerosephoto/
Jasmine Mallo Imagery	Photography		Cheyenne	Wyoming	Wyoming and beyond	Cheyenne-based photographer offering wedding and elopement coverage in five to ten hour packages, with a candid, emotion-led approach to storytelling.			https://www.jasminemalloimagery.com/	https://www.instagram.com/jasminemalloimagery/
Keith Wagner Photography	Photography		Cheyenne	Wyoming	Cheyenne, Wyoming	Cheyenne photographer for weddings, engagements, families and seniors, with a relaxed style, light posing and drone work as well.	keithwagnerPhotography@gmail.com		https://keithwagnerphotography.com/	https://www.instagram.com/treasured_adventures_photos/
Sunflower Soirées	Planning		Laramie	Wyoming	Laramie, Cheyenne, Centennial, Saratoga, Casper, Lander and across Wyoming	Laramie planner offering full-service planning, guided coordination, wedding-day management and rentals for couples across Wyoming, including Cheyenne.	info@sunflowersoirees.com		https://www.sunflowersoirees.com/	
Ranch Eats	Catering	1920 Thomes Ave	Cheyenne	Wyoming	Greater Cheyenne Area, Wyoming, Colorado and Nebraska	Cafe and food-truck caterer that builds custom menus for weddings and events, with couples praising the food at their receptions.	rancheatswyo@gmail.com	(307) 286-8535	https://www.rancheats.com/	
Kennison's Katering	Catering		Cheyenne	Wyoming	Cheyenne, Wyoming	Local caterer preparing menus from personal recipes for weddings, parties and private dinners, with on-site barbecue and milk can dinners available.	amikennison76@gmail.com	307-630-7676	https://kennisonskatering.com/	
Wyoming Bridal Collective	Hair & Makeup		Laramie	Wyoming	Southern Wyoming and Northern Colorado	Mobile bridal hair, airbrush makeup and spray tans for the bride and her party, with trials and all-inclusive packages.	katie@wyomingbridalcollective.com	307-343-5065	https://wyomingbridalcollective.com/	https://www.instagram.com/wyomingbridalcollective/
The Beauty Caliber	Hair & Makeup	1111 E. Lincolnway, Suite 208	Cheyenne	Wyoming	Cheyenne	Cheyenne studio offering bridal makeup trials, bridal and bridesmaid makeup, and mother-of-the-bride application.		307-274-1592	https://thebeautycaliber.glossgenius.com/	https://www.instagram.com/thebeautycaliber/
Halo Beauty Bar	Hair & Makeup	4001 Laramie St., Unit B	Cheyenne	Wyoming	Cheyenne	Boutique salon and spa where one stylist specialises in bridal hair and makeup, lived-in colour and hair extensions.		307-431-6447	https://halobeautybarwyo.com/	
Stacy Cakes	Cake		Cheyenne	Wyoming	Cheyenne	Home baker making custom tiered wedding cakes and cupcakes, with a consultation form and a mobile cupcake wagon for events.	stacycakescheyenne@gmail.com		https://www.stacycakescheyenne.com/	https://www.instagram.com/StacyCakesCheyenne/
`,
  },
  {
    name: "Cheyenne: catering, cake, hair and makeup, photography, florals and music",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Pioneer Bar-B-Que	Catering		Cheyenne	Wyoming	Wyoming and Colorado	Cheyenne caterer, open since 2004, serving smoked meats and sides for weddings, rehearsal dinners and corporate events.	lauren@pioneerbarbeque.com	(307) 214-8455	https://pioneerbarbeque.com/	
Tio's Tacos Catering	Catering		Cheyenne	Wyoming	Cheyenne area, indoor and outdoor venues	Taco caterer in Cheyenne serving weddings and other events, with buffet service indoors or cooking on site outdoors.		(307) 287-9269	https://www.tiostacos307.com/	
Occasions by Cory	Catering		Casper	Wyoming	Casper and surrounding areas	Casper catering and hospitality company with a dedicated weddings page, plus off-site bar service for events.	Events@OccasionsbyCory.com	(307) 337-2679	https://www.occasionsbycory.com/	
Frosted Tops	Cake	225 S. David St. Suite 2	Casper	Wyoming	Casper area	Casper bakery making custom wedding and birthday cakes, cupcakes and macarons, and offering wedding tastings.			https://www.frostedtops.com/	
307 Glow	Hair & Makeup	240 West 1st Street	Casper	Wyoming		Casper stylists offering bridal hair and makeup for brides and their wedding parties.	307glow24@gmail.com	(307) 267-3247	https://307glow.com/	https://www.instagram.com/307Glow/
Travis Gitthens Photography	Photography		Casper	Wyoming	Casper area	Casper wedding and portrait photographer who promises to deliver wedding images within a week of the day.	travis@travisgitthens.com	(307) 262-3337	https://travisgitthens.com/	
Tayler Ford Photography	Photography		Casper	Wyoming	Casper area	Casper photographer who specialises in weddings, also shooting engagements, couples, seniors and families.	taylerannford@gmail.com	(307) 941-1596	https://taylerfordphotography.com/	https://www.instagram.com/taylerfordphotography/
Amy Elizabeth Photography	Photography		Casper	Wyoming	Casper area	Casper photographer covering weddings and events alongside maternity, newborn, family and senior sessions.	amyelizabethimages@gmail.com	(307) 797-6161	https://www.amyelizabethimages.com/	https://www.instagram.com/amyelizabethphotographywy/
Kaylie Sirek Photography	Photography		Sheridan	Wyoming	Wyoming, Nebraska, Montana, Colorado and South Dakota	Sheridan-based wedding and elopement photographer for adventurous couples, working across Wyoming and neighbouring states.	hello@kayliesirek.com		https://www.kayliesirek.com/	https://www.instagram.com/kayliesirek/
Whirly Girl Flowers	Florals		Sheridan	Wyoming	Sheridan, the Bighorn Mountains and elsewhere in Wyoming, including Jackson Hole	Floral design studio in Sheridan creating full-service wedding florals, bouquets, boutonnieres and elopement flowers with a foraged feel.			https://www.whirlygirlflowers.com/	https://www.instagram.com/_whirlygirl/
ROW Productions	Music	900 E Lincolnway	Cheyenne	Wyoming	Wyoming, Colorado and Nebraska	Cheyenne DJ and MC with over 20 years' experience, supplying sound, lighting and equipment hire for weddings and other events.	george@rockonwheels.net	(307) 635-1018	https://rowproductions.org/	https://www.instagram.com/rowproductions/
Dynamic Sound & Lighting	Music	6150 WY-220	Casper	Wyoming	Casper, Cheyenne, Laramie and across Wyoming	Casper event production company offering wedding DJ services, sound, lighting, staging and day-of coordination across the state.	office.dynamicwy@gmail.com	(307) 315-3682	https://dynamicsoundandlightingwy.com/	
`,
  },
  {
    name: "Jackson Hole: photography, videography, planning, rentals, bar, transportation, music, florals and hair and makeup (Jackson, Cody, Lander, Rock Springs)",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
495Films	Videography		Rock Springs	Wyoming		Rock Springs videographer shooting wedding films with a documentary and artistic style, offering drone footage and a second shooter.	nick@495films.com		https://www.495films.com/	https://www.instagram.com/495films/
Sarah Penny Photography	Photography		Jackson	Wyoming	Jackson Hole and beyond	Jackson Hole photographer covering weddings, elopements and engagements in the Tetons, with a background in wedding coordination.			https://sarahpennyphoto.com/	https://www.instagram.com/sarahpennyphotography/
Karina Dopp Designs	Photography		Jackson	Wyoming	Jackson Hole, with travel available	Jackson Hole wedding photographer, with video packages, capturing candid and scenic weddings at Grand Teton venues.	photosbykdopp@gmail.com		https://karinadoppdesigns.com/	https://www.instagram.com/karinadoppdesigns/
Elise Sterck Photography	Photography		Jackson	Wyoming	Northwestern Wyoming and Eastern Idaho, with travel	Jackson photographer offering cinematic wedding and elopement coverage, including ski weddings, in Jackson Hole and the Grand Tetons.			https://elisesterckphotography.com/	https://www.instagram.com/elisesterckphotography/
Stir Photography	Photography		Jackson	Wyoming	Grand Teton National Park area, with destination travel	Photojournalistic wedding and elopement photographer in Jackson Hole who blends outdoor adventure with candid storytelling.			https://www.stirphotography.com/	https://www.instagram.com/stirphotography/
Kinseylynn Photo Co.	Photography		Jackson	Wyoming	Jackson Hole and Grand Teton National Park	Jackson Hole studio offering wedding and elopement photography and cinematography, plus Super 8 film and licensed drone coverage.			https://kinseylynnphoto.com/	https://www.instagram.com/kinseylynnphoto/
Backlight Creative	Videography		Jackson	Wyoming		Jackson Hole wedding videographer and photographer producing wedding films alongside photo coverage.	diana@backlightcreative.com		https://www.backlightcreative.com/	https://www.instagram.com/backlightcreative/
Grand Teton Events	Planning		Jackson	Wyoming	Greater Jackson area, Teton Valley and across the Mountain West	Handcrafted wedding planning for couples marrying in the greater Jackson area and the Teton Valley.	info@grandtetonevents.com	(208) 521-2138	https://www.grandtetonevents.com/	https://www.instagram.com/grandtetonevents/
Lisa Mack Events	Planning		Jackson	Wyoming	In and around Jackson	Jackson Hole wedding and event planner designing cohesive celebrations for the landscape, including multi-event wedding weekends.	lisa@lisamackevents.com		https://lisamackevents.com/	https://www.instagram.com/lisa.mack.events/
Wild West Collective	Rentals	189 Blackburn Street	Cody	Wyoming	Greater Yellowstone region	Cody rentals boutique with tents, seating, tableware, decor and a mobile bar, plus planning, design and day-of coordination.	hello@wildwestcollective.com	(307) 899-3432	https://www.wildwestcollective.com/	
Jackson Hole Event Rentals	Rentals		Wilson	Wyoming	Jackson Hole, Teton Valley (Idaho) and Alta	Rental company supplying tents, tables, chairs, furniture and add-ons for weddings and events across Jackson Hole and Teton Valley.	contact@jheventrentals.com	(307) 414-8857	https://www.jheventrentals.com/	https://www.instagram.com/jacksonholeeventrentals/
barSIPbar	Bar		Jackson	Wyoming	Anywhere in the town or valley of the Tetons	Mobile cocktail service run from a renovated 1991 horse trailer, serving events around Jackson Hole.	barsipbar@gmail.com	(307) 413-3547	https://www.barsipbar.com/	https://www.instagram.com/barsipbar/
PartyBusJH	Transportation		Jackson	Wyoming	Jackson and surrounding areas	Jackson party bus service for wedding transport, bachelor and bachelorette nights, and Grand Teton and Yellowstone tours.			https://www.partybusjh.com/	https://www.instagram.com/partybusjh/
Beats by Capella	Music		Jackson	Wyoming		Jackson DJ, sound and lighting provider for weddings and parties, with customisable packages including a VIP wedding package.	liam@beatsbycapella.com	(307) 699-5689	https://beatsbycapella.com/	https://www.instagram.com/beatsbycapella/
Field & Frond	Florals		Cody	Wyoming	Cody, Jackson, Billings, Red Lodge, Bozeman and Big Sky	Seasonal, personalised wedding and elopement floral design for Wyoming and Montana couples, with weddings shown in Jackson and the Beartooths.	hello@fieldandfrond.com		https://fieldandfrond.com/	https://www.instagram.com/fieldandfrond/
Jackson Hole Flower Farm	Florals		Jackson	Wyoming	Jackson and Wilson	Small family flower farm growing fresh, sustainably farmed flowers in the Tetons, available for small weddings and events June to September.	shaunallockhart@gmail.com	(206) 715-9039	https://www.jacksonholeflowerfarm.com/	
Hair Love LLC	Hair & Makeup	2401 G Avenue	Cody	Wyoming		Cody hair salon offering bridal hair styling and wedding packages, with elopement and wedding work shown from Shell, Wyoming.	cindybingenheimer@aol.com	(307) 920-1248	https://hairlovellc.com/	https://www.instagram.com/hairlovecindy/
Ashley Drew Artistry	Hair & Makeup		Jackson	Wyoming	Jackson Hole and the greater Teton region	Jackson makeup artist with over fifteen years of experience, offering bridal party, trial and elopement makeup.			https://ashleydrewartistry.com/	https://www.instagram.com/ashleydrewartistry/
`,
  },
  {
    name: "Casper, Cody and Sheridan: photography, catering and hair and makeup",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Tami Moore	Photography		Cody	Wyoming	Wyoming, Montana and the American West	Cody photographer for elopements and small weddings, including horseback and multi-day wilderness ceremonies across the Rockies.	tamimoore307@gmail.com	307-250-2040	https://www.tamimoore.art/	https://www.instagram.com/tamimoore307/
April Stuart Photography	Photography		Cody	Wyoming	Northeast Wyoming and Montana	Cody photographer covering weddings, elopements and proposals, with a styling guide to help couples prepare for their session.	contact@aprilstuartphoto.com	(706) 994-1627	https://www.aprilstuartphoto.com/	https://www.instagram.com/april.stuart.photo/
Braidyn Looper Photography	Photography		Sheridan	Wyoming	Wyoming	Sheridan studio photographing weddings and elopements, including Big Horn Mountains locations, alongside newborn and family sessions.			https://www.braidynlooperphoto.com/	
DSmithImages Photography	Photography		Sheridan	Wyoming	Sheridan, Wyoming and Montana	Sheridan photographer for weddings and elopements, working full days and travelling around Wyoming and Montana.	dsmithimages@gmail.com		https://www.dsiphotography.com/	https://www.instagram.com/dsmithimagesphotography/
Catering by Rosie	Catering		Cody	Wyoming	Cody foothills	Family-run Cody caterer serving Mexican and American menus for weddings, celebrations and gatherings, with a dedicated weddings page.	ordering@cateringrosieroberson.com	(307) 772-1358	https://cateringrosieroberson.com/	https://www.instagram.com/cateringrosieroberson/
Nola Catering & Private Dining	Catering		Sheridan	Wyoming		Sheridan caterer cooking Southern, Creole-influenced food, with buffets and food bars suited to wedding receptions.	megan@nolawyoming.com	(307) 763-2256	https://nolawyoming.com/	https://www.instagram.com/nolacateringwyo/
Salon De Beauté	Hair & Makeup		Sheridan	Wyoming		Sheridan salon whose service menu includes wedding hair and makeup alongside its regular cuts, colour and styling.	salondebeautesheridan@gmail.com	(307) 672-5021	https://www.salondebeautesheridan.com/	https://www.instagram.com/salondebeautesheridan/
`,
  },
  {
    name: "Jackson Hole: videography and planning",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Apres Events	Videography		Jackson	Wyoming	Jackson Hole and the Rocky Mountains	Jackson Hole wedding film studio with a documentary-leaning style, small kit and long lenses, often working alongside planners and photographers.	rory@apresvisuals.com		https://www.apresevents.com/	
Intimate Adventures Media	Videography		Jackson	Wyoming	Jackson Hole, Grand Teton and central Idaho	Photo and video team for elopements and micro-weddings in Jackson Hole and Grand Teton, with travel within 200 miles included.			https://intimateadventuresmedia.com/	https://www.instagram.com/intimateadventuresmedia/
Magnolia Ranch Events	Planning		Jackson	Wyoming	Jackson Hole	Jackson Hole planning and design team offering full-service weddings, florals, rentals and production, expanded from a florist business in 2021.			https://magnoliaranchjh.com/	https://www.instagram.com/magnoliaranchevents/
Destination Jackson Hole	Planning		Jackson	Wyoming	The Tetons and surrounding areas	Event planning company in Jackson since 1996, run by Alison Kyle since 2010, producing weddings and corporate events around the Tetons.	alison@destinationjacksonhole.com		https://www.destinationjacksonhole.com/	https://www.instagram.com/destinationjacksonhole/
`,
  },
  {
    name: "Cheyenne: cake and music",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Cake Works	Cake		Cheyenne	Wyoming	Front Range Colorado and Cheyenne, Wyoming	Cheyenne baker making custom wedding cakes, groom's cakes and cookies since 2010, with consultations and tastings and delivery along the Front Range.	cakeworksbakery@live.com	(307) 286-3441	https://cakeworksbakery.com/	https://www.instagram.com/cakeworkscolorado/
Evocative Entertainment	Music		Sheridan	Wyoming	Wyoming, southern Montana and western South Dakota	Sheridan DJ and lighting company offering wedding music, ceremony audio and event lighting across Wyoming, southern Montana and western South Dakota.	evocativeentertainment@gmail.com		https://evocativeentertainment.com/	
`,
  },
  {
    name: "Cheyenne: planning, florals and videography gaps; Casper, Cody, Sheridan and Laramie",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Cheyenne Street Railway Trolley	Transportation	121 W 15th St	Cheyenne	Wyoming		Charter trolleys, a 36-seat motor coach and a 12-seat van from Cheyenne Depot Plaza, hired for weddings, bridal parties and venue transfers.		(307) 778-3133	https://www.cheyenne.org/things-to-do/cheyenne-street-railway-trolley/	
Paintbrush Photography	Photography		Cody	Wyoming	Cody, Powell and the Big Horn Basin	Cody and Powell photographers covering weddings, couples and families, with a natural-colour style and Wyoming scenery.			https://www.paintbrush-photography.com/	https://www.instagram.com/paintbrush_photography/
Christina's Prom & Bridal	Bridal & Formalwear	2740 E 3rd St, Suite 2112	Casper	Wyoming		Casper boutique stocking wedding gowns, bridesmaid dresses and accessories, with tuxedo rental for the wedding party.		(307) 234-2251	https://promandbridal.com/	https://www.instagram.com/christinasformalwear/
Once Upon a Story Boutique	Bridal & Formalwear	250 N Main St	Sheridan	Wyoming		Sheridan bridal shop selling wedding gowns, veils and bridal party attire, with suits and tuxedos to rent or buy and free alterations.		307-674-8606	https://onceuponastoryboutique.net/	https://www.instagram.com/onceuponstory_b/
Ms. Arias' Formal Boutique	Bridal & Formalwear	611 W Lincolnway	Cheyenne	Wyoming		Cheyenne formalwear shop offering bridal gowns, bridesmaid and mother-of-the-bride dresses, and tuxedo and suit rentals.	Ms.alisha.arias@outlook.com	(307) 637-6623	https://msariasboutique.com/	https://www.instagram.com/ms.ariasboutique/
Casper Executive Car and Limousine	Transportation		Casper	Wyoming	Casper and central Wyoming	Casper limousine and car service whose Escalade and sedans carry wedding parties, with shuttles between hotel and venue.		(307) 251-2128	https://casperlimosandcars.com/	
Veronica Catering	Catering		Cody	Wyoming	Cody	Cody caterer serving Mexican dishes based on Guadalajara family recipes for weddings, parties and other events.			https://www.veronicacatering.com/	
`,
  },
  {
    name: "Cheyenne: Casper and Rock Springs photography and florals",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Studio Designs Floral & Co.	Florals	165 K Street	Rock Springs	Wyoming	Rock Springs, Green River and Sweetwater County	Rock Springs florist that designs wedding flowers locally or for destination weddings and delivers across Sweetwater County.	studiodesignsfloralco@gmail.com	307-264-3238	https://www.studiodesignsfloralco.com/	https://www.instagram.com/studiodesignsfc/
`,
  },
  {
    name: "Map fill: Riverton, and Cheyenne: catering",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Shelle Anderson Photography	Photography	612 E Main St	Riverton	Wyoming	Fremont County	Boutique Riverton studio photographing weddings and senior portraits, with printed heirloom products and wedding pricing on request.	shelle.anderson@yahoo.com	(480) 510-5351	https://shelleandersonphotos.com/	
O.B.A Photography	Photography		Riverton	Wyoming		Riverton photographer covering weddings, engagements, family, maternity, newborn and equine sessions, working from a Riverton base.		(307) 388-2770	https://photographyservicesriverton.com/	https://www.instagram.com/o.b.aphotography/
Paris West	Catering	1719 Central Avenue	Cheyenne	Wyoming		Downtown Cheyenne restaurant and bar that caters weddings and parties, serving twists on classic Western comfort food plus a full bar.	Info@parisinthewest.com	(307) 224-2170	https://parisinthewest.com/	https://www.instagram.com/pariswestcheyenne/`,
  },
  {
    name: "Map fill and gaps: Casper: florals",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Consider the Lilies	Florals	232 E 2nd St	Casper	Wyoming	Casper, Evansville, Mills and Vista West	Downtown Casper flower shop that designs wedding bouquets, ceremony arches and reception centerpieces, with delivery and setup at Casper venues.	wecare@marvelfloralart.com	(307) 315-6121	https://www.marvelfloralart.com/wedding	https://www.instagram.com/considerthelilies_flowers/`,
  },
  {
    name: "Map fill and gaps: Rock Springs: florals",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Save the Date Flower and Wedding Studio	Florals	1175 Dewar Dr	Rock Springs	Wyoming	Rock Springs and Green River	Rock Springs florist doing wedding flowers alongside tuxedo hire, table linens, chair covers and planning help, with daily delivery to Green River.		(307) 522-5283	https://www.savethedatefloral.com/	https://www.instagram.com/savethedatefloral/`,
  },
  {
    name: "Cheyenne: photography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Gwin Photography	Photography		Cheyenne	Wyoming		Documentary-style wedding and outdoor portrait photographer working from Cheyenne, with a weddings portfolio and an Around Cheyenne gallery.			https://gwinphotography.zenfolio.com/	https://www.instagram.com/gwinphotography/
`,
  },
  {
    name: "Jackson Hole: officiant, videography and transportation",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Jackson Hole Wedding Ceremonies	Officiant		Jackson	Wyoming	Jackson Hole and the Tetons, including Grand Teton National Park	Jackson Hole officiant Cindy Dahlin leads weddings, vow renewals and elopements, including ceremonies in Grand Teton National Park.			https://www.jacksonholeweddingceremonies.com/	
Watertown Films	Videography		Jackson	Wyoming		Jackson Hole studio making cinematic, editorial-style wedding and elopement films, shot at ranches and venues across the valley and further afield.			https://www.watertownfilms.com/wedding-videographer-jackson-hole	https://www.instagram.com/watertownfilms/
JH Cab	Transportation		Jackson	Wyoming		Jackson Hole cab and party bus firm running wedding guest shuttles, bridal party rides, late-night reception transfers and black car service.	22jhcab@gmail.com	307-203-5066	https://www.jh-cab.com/weddings	
Summit Transportation	Transportation		Jackson	Wyoming		Jackson luxury bus and SUV company offering custom wedding transport coordination and logistical advice for couples and their guests.	jhsummittransportation@gmail.com	(307) 264-0880	https://www.summitjh.com/	
UVC Transportation	Transportation		Jackson	Wyoming		Jackson Hole limousine and taxi service whose SUVs and 15-seat Sprinter van are available for weddings and other special occasions.			https://www.uvctrans.com/	
`,
  },
  {
    name: "Map fill and gaps: Gillette, Cody, Sheridan, Powell, Casper and Lovell: photography, florals, photo booth and cake",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
PhoenixPhotos Photography	Photography	700 S Douglas Hwy	Gillette	Wyoming		Gillette studio photographing weddings with posed and candid coverage, an engagement session included in most packages, and full-day attention on the day.	phoenixphotos15@gmail.com	307-660-6335	https://phoenixphotos.org/wedding-info	https://www.instagram.com/phoenixphotos_photography/
Forget Me Not Floral	Florals		Gillette	Wyoming	Gillette, Rozet, Moorcroft, Pine Haven and Wright	Gillette florist designing custom wedding bouquets, centrepieces and ceremony and reception flowers to suit each couple's style and budget.			https://gilletteflowers.weddingflorals.net/	
Beartooth Floral & Gifts	Florals	1316 Beck Ave	Cody	Wyoming		Cody florist offering free wedding consultations, bouquets, ceremony arches and reception pieces, with on-site decorating and arbour rentals.		(307) 587-4984	https://www.beartoothfloral.com/wedding-flowers	https://www.instagram.com/beartoothfloralandgifts/
Babes Flowers	Florals	23 N Main St	Sheridan	Wyoming		Long-running downtown Sheridan florist with full wedding packages, personalised bouquets, ceremony decor and reception flowers planned at a bridal consultation.		(307) 672-3031	https://www.babesflowers.com/wedding-flowers	https://www.instagram.com/babesflowers/
Hillside Floral	Florals	509 S Fair St	Powell	Wyoming		Powell florist with wedding flowers covering bouquets, bridal party pieces, and ceremony and reception arrangements, delivering around Powell and into Cody.		(307) 764-3688	https://www.hillsidefloralwy.com/wedding-flowers	https://www.instagram.com/hillside_floral/
McGlathery's Back Porch Designs	Florals	220 E 1st St	Powell	Wyoming		Family florist serving Powell for over 65 years, with wedding bouquets, bridal party flowers and ceremony and reception arrangements.		(307) 754-3629	https://www.mcglatherysbackporchdesigns.com/wedding-flowers	https://www.instagram.com/mcglatherysbackporchdesigns/
WYO Photo Booth	Photo Booth		Casper	Wyoming	Casper area, with travel for an added fee	Casper photo booth hire for weddings and other events, with the option to travel beyond the Casper area for an added fee.	miguel@wyophoto.com	307-251-9219	https://www.wyophoto.com/	
SweetArt Cake Company	Cake		Lovell	Wyoming		Lovell cake artist Shannon Mayes makes custom decorated cakes for special occasions, with a wedding cake gallery and a custom order service.	orders@sweetartcakecompany.com		https://www.sweetartcakecompany.com/	https://www.instagram.com/sweetartcakecompany/
`,
  },
  {
    name: "Cheyenne: hair & makeup, photography, rentals, catering, planning, music, cake, florals, bridal & formalwear, bar, decor & lighting, videography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Upstyle Wyoming	Hair & Makeup	157 K Street, Suite A	Rock Springs	Wyoming		Salon-based bridal stylist offering wedding hair and makeup packages with trial, touch-up kit and travel included, using sustainable Davines products.			https://www.upstylewyoming.com/weddings	
TBK Rental	Rentals	717 Storey Blvd	Cheyenne	Wyoming		Cheyenne party and event rental shop hiring out tents, tables, chairs, linens, china, arches, backdrops and dance floors for weddings and other celebrations.		307-638-0442	https://tbkrental.com/	
The Comfort Kitchen	Catering		Laramie	Wyoming	Laramie and southeast Wyoming	Chef-led Laramie caterer serving weddings and local events, with buffet menus, a food trailer and an online intake form for quotes.	contact@comfortkitchenwyo.com	307-314-2444	https://www.comfortkitchenwyo.com/	https://www.instagram.com/comfortkitchenwyo/
Reverend George	Planning		Cheyenne	Wyoming		Cheyenne wedding planner and marriage officiant offering planning packages for budgets of every size, with a free initial consultation.			https://reverend-george.ueniweb.com/	
Turn Up The Volume DJ/Karaoke	Music		Rock Springs	Wyoming	Rock Springs, Evanston and Rawlins	Rock Springs DJ with over fourteen years of experience playing weddings, anniversaries and private parties, plus karaoke and music bingo nights.	kjkolardj@gmail.com	307-922-3670	https://www.turnupthevolumedj.com/	
Lovely & Amazing Cakes	Cake		Green River	Wyoming	Southwest Wyoming	Home-based Green River cake boutique making custom wedding cakes by appointment, with a client gallery, testimonials and ordering guide.		307-871-1074	https://www.lovelyandamazingcakes.com/	https://www.instagram.com/lovely_amazing_cakes/
Country Cottage Gift & Floral	Florals	517 Front Street	Evanston	Wyoming		Family-run Evanston florist and gift shop designing wedding and event flowers, with a floral gallery and consultations for couples.	aplustrophy@vcn.com	307-789-3935	https://countrycottagegifthouse.com/	
Cavalryman Catering	Catering		Laramie	Wyoming		Laramie caterer from the Cavalryman Steakhouse serving flame-grilled Wyoming menus and bar service, with a dedicated wedding catering page and form.	cavcatering307@gmail.com	307-745-5551	https://laramiecatering.com/weddings/	https://www.instagram.com/cavalrymancatering50/
Drifter Dreams Bridal	Bridal & Formalwear	126 Quincy Road	Cheyenne	Wyoming		Cheyenne bridal boutique stocking Boda Bridal and Shikoba Bride gowns alongside its own off-the-rack boho and western dress collection.	Drifterdreamsbridal@gmail.com	307-287-1365	https://drifterdreams.com/	https://www.instagram.com/drifterdreamsbridal/
Kylie Rosine Photography	Photography		Rock Springs	Wyoming	Wyoming and Colorado	Rock Springs portrait and wedding photographer with a warm, natural editing style, offering a free consultation before booking.	info@kylierosine.com		https://www.kylierosine.com/	https://www.instagram.com/kylierosinephotography/
Ludwig Photography	Photography	224 E Ivinson Ave	Laramie	Wyoming		Downtown Laramie studio photographing weddings with retouched images and leather storybook albums, and archiving every wedding at the American Heritage Center.		307-754-7388	https://www.ludwigphoto.com/weddings	https://www.instagram.com/ludwigphoto/
Gentle Perch Mobile Bartending	Bar		Cheyenne	Wyoming	Cheyenne and Laramie	Mobile bartending service for weddings and private events in Cheyenne and Laramie, with quotes arranged by email or phone.	GentlePerchmb@gmail.com	307-316-3192	https://gentleperch.co/	https://www.instagram.com/gentleperchmb/
Iron & Ivory	Decor & Lighting		Cheyenne	Wyoming	Wyoming	Cheyenne rustic wedding decor rental: centrepieces, floral details and signage loaded into a trailer that couples collect and return.	ironandivoryweddings@gmail.com	307-631-6856	https://ironandivoryweddings.com/	https://www.instagram.com/ironandivoryweddings/
Aspen & Willow Floral Studio	Florals	2 E Flaming Gorge Way	Green River	Wyoming		Green River florist designing custom wedding bouquets and on-site floral decor to suit each couple's style and budget, with consultations.		307-875-2136	https://www.aspenwillowfloralstudio.com/wedding-flowers	https://www.instagram.com/aspenwillowfloralstudio/
Simply Creative Flowers, Fashion & Gifts	Florals	855 Gilchrist St	Wheatland	Wyoming		Wheatland florist, boutique and gift shop custom-designing every wedding arrangement in-house and travelling to weddings out of state.		307-322-0918	https://www.simplycreativeflowers.com/	https://www.instagram.com/shopsimplycreative/
Dragonfly Droneography	Videography		Laramie	Wyoming		Laramie FAA-certified drone pilot filming aerial video of weddings, alongside real estate and commercial work, with wedding films in the portfolio.	dragonflydrone18@gmail.com	307-241-2190	https://www.dragonflydroneography.com/	https://www.instagram.com/dragonfly_droneography/
American Soundwave	Music		Laramie	Wyoming	Laramie and the surrounding areas	Laramie disc jockey service entertaining since 1984, with a large music library, light show and sound options and a dedicated weddings page.		307-399-4040	https://www.americansoundwave.com/	
`,
  },
  {
    name: "Jackson Hole: music, officiant, photography, hair & makeup, catering, rentals",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Judd Grossman Music	Music		Jackson	Wyoming	Jackson Hole and Grand Teton National Park	Jackson Hole musician whose band plays rock, country, bluegrass and folk for private events, and who also officiates secular and Jewish ceremonies.	jg@juddgrossman.com	307-690-4935	https://juddgrossman.com/	
Jackson Hole Officiant LLC	Officiant		Teton Village	Wyoming	Jackson Hole	Teton Village-based officiant for elopements and weddings of all types, with published starting rates by location including Grand Teton sites.	JacksonHoleOfficiant@gmail.com	307.699.4281	https://www.jacksonholeofficiant.com/	
Foxtails Photography	Photography		Jackson	Wyoming	Jackson Hole and destinations worldwide	Fine art wedding and elopement photographer based at the foot of the Tetons, with a style built around wild landscapes and an artful approach.			https://foxtailsphotography.com/	https://www.instagram.com/foxtailsphotography/
Jamye Chrisman Photography	Photography		Jackson	Wyoming	Jackson Hole and the Tetons	Wedding and engagement photographer in Jackson Hole, authorised to shoot in Grand Teton National Park, with a four-step booking process.	jamye@jamyechrismanphotography.com	208.399.7662	https://jamyechrisman.com/	https://www.instagram.com/jamye_chrisman/
The Imagewell	Photography		Jackson	Wyoming	Jackson Hole	Nationally published photojournalist photographing Jackson Hole weddings for over 15 years, who also shoots family sessions around the world.		307-690-8120	https://www.theimagewell.com/	
Roslyn Smithers Photography	Photography		Jackson	Wyoming	Grand Teton National Park, Aspen, Park City, Sun Valley and destinations	Jackson Hole photographer specialising in elegant, fine art wedding photography, travelling to mountain towns and overseas destinations.	smithers.roslyn@gmail.com	(307) 699-7714	https://roslynsmithers.com/	https://www.instagram.com/roslyn.smithers/
Janelle & Co Photography	Photography		Jackson	Wyoming	Jackson Hole, the Grand Tetons and destination weddings	Jackson Hole wedding and elopement photographer offering timeless, romantic coverage with Grand Teton views, willing to travel for destination days.	info@janelleandersen.com	360-980-2681	https://janelleandco.com/	https://www.instagram.com/janelleandcophoto/
Beauty By Autym	Hair & Makeup		Jackson	Wyoming	Wyoming and Idaho	Jackson-based hair and makeup artist offering bridal looks and wedding-party services across Wyoming and Idaho.	autymnielsen@gmail.com		https://autymnielsen.wixsite.com/beautybyautym	https://www.instagram.com/beauty_by_autym/
Apex Private Chef Service	Catering		Jackson	Wyoming	Jackson Hole and Teton Valley	Private chef team in Jackson Hole offering wedding and event catering, with a wedding catering page and consultations for couples.		(208) 351-7380	https://apexprivatechef.com/wedding-catering-jackson-wy/	https://www.instagram.com/apexprivatechef/
Mountain Top Event Rentals	Rentals		Jackson	Wyoming	Jackson Hole	Jackson Hole company making and renting event pieces, which also offers full-service and day-of wedding planning for couples.	jhmountaintop@gmail.com	307-690-5234	https://www.jhmountaintopevents.com/	
`,
  },
  {
    name: "Map fill and gaps: Sheridan, Gillette, Cody and Powell: photography, photo booth, music, videography, rentals",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Intimate Portraits, LLC	Photography		Sheridan	Wyoming		Sheridan studio describing its work as fine art wedding and portrait photography, with a dedicated wedding gallery on its site.			https://www.intimateportraitsllc.com/	https://www.instagram.com/intimateportraitsllc/
Caiti Jackson Photography	Photography		Gillette	Wyoming	Wyoming and beyond	Gillette photographer serving Wyoming and beyond, with a couples gallery covering engagements, weddings and elopements plus client testimonials.	info@caitijackson.com	307-660-1580	https://www.caitijackson.com/	https://www.instagram.com/caitijackson/
Wildflower Photobooth	Photo Booth		Cody	Wyoming	Cody, Afton, Jackson Hole, Powell, Billings, Red Lodge and Yellowstone	Open-air photo booth run from Cody and Afton, with a dedicated weddings page, serving northern Wyoming, Jackson Hole and nearby Montana.			https://www.wildflowerphotobooth.com/	https://www.instagram.com/thewildflowerphotobooth/
TBM Design Photography	Photography		Powell	Wyoming	Cody area, Wyoming, Montana and beyond	Powell photographer documenting weddings and elopements around Cody and across Wyoming and Montana, run by a single photographer, Tia.	tbmdesignstudio@gmail.com		http://www.tbmdesignstudio.com/	
My Custom DJ	Music		Powell	Wyoming	Northern Wyoming and southern Montana, including Cody and Sheridan	Wedding DJ and MC service in Powell with free travel for the first 25 miles and coverage reaching Cody, Sheridan, Jackson and Billings.	mycustomdj@gmail.com	307-296-7204	https://www.mycustomdj.com/	
Wayward Films	Videography	22 1/2 Grinnell Plaza	Sheridan	Wyoming	Sheridan, WY and Denver, CO	Video production company in Sheridan with about 15 years of wedding films, publishing sample weddings and a rates sheet on request.	waywardfilms@gmail.com	307-399-1386	https://waywardvideo.com/weddings/	
Powder River Party Rentals	Rentals	2727 Coffeen Ave	Sheridan	Wyoming	Wyoming, Montana and South Dakota	Sheridan rental company with tents, tables, chairs, linens, dance floors and lighting for weddings, delivering across three states.	prpartyrentals@gmail.com	307.763.9902	https://prpartyrentals.com/	https://www.instagram.com/powderriverpartyrentals/
Event Tents by The Canopy Company	Rentals		Sheridan	Wyoming	Sheridan, Casper and Buffalo, with statewide travel	Sheridan tent company renting wedding and party tents, with set travel rates to Casper and Buffalo and further afield for a fee.		307.660.6174	https://eventtentswyo.com/	
`,
  },
];

export default batches;
