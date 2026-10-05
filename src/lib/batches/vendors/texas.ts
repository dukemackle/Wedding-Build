import type { VendorBatch } from "@/lib/vendor-batches";

// Texas vendor batches. Every row's State is "Texas". Add new batches at the end.
const batches: VendorBatch[] = [  {
    name: "Killeen, Harker Heights, Temple and Salado: planning, florals, cake, catering and music",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Milestone Memories & Events	Planning	2501 South W.S. Young Drive, Suite 209	Killeen	Texas		Killeen planner and showroom offering hourly consulting, day-of coordination or full wedding planning, with rentals and a venue to hire.		(254) 630-1008	https://www.milestonememoriesandevents.com/	
Botanical Jane	Florals		Temple	Texas	Temple, Waco and Austin	Floral design studio creating custom wedding flowers, with a portfolio drawn from Austin-area venues and a base in Temple.	info@botanicaljane.com		https://botanicaljane.com/	https://www.instagram.com/botanicaljane/
Wonderland Flowers	Florals		Temple	Texas	Temple, Killeen, Belton, Harker Heights, Salado and Central Texas	Temple studio florist making hand-crafted floral designs for weddings and events, with delivery across Bell County and nearby towns.	wonderlandflowers81@gmail.com	(682) 808-2973	https://www.wonderlandflowers.com/	https://www.instagram.com/wonderlandflowers/
Morgan Pearl Bakery	Cake	2415 N Main Street	Belton	Texas		Belton bakery making custom wedding cakes, late-night bites and interactive dessert stations, with tastings by appointment when the shop is closed.	info@morganpearlcakes.com	254-314-6304	https://morganpearlcakes.com/	https://www.instagram.com/morganpearlcakes/
Texas Bites Bakery	Cake		Killeen	Texas		Self-taught home baker in Killeen making custom wedding cakes and cupcakes, with a quote form, a published flavour list and wedding pricing.	texasbitesbakery@gmail.com	254-249-4934	https://www.texasbitesbakery.com/	https://www.instagram.com/texasbitesbakery/
Arboniche's Fine Catering	Catering	4013 Chaparral Rd	Killeen	Texas		Killeen caterer run since 2004 by a chef and his wife, serving buffets for 50 to 1,000-plus guests, with custom menus and china and table rentals.		254-519-4300	https://www.arbonichesfinecatering.com/	
Let Us Do The Cooking	Catering	111 S Main Street	Nolanville	Texas		Full-service caterer founded in 2006 near Killeen, handling plated dinners and buffets for weddings, military balls and corporate events.	admin@letusdothecooking.com	(254) 554-2665	https://www.letusdothecooking.com/	
DJ JayJacq Entertainment	Music		Killeen	Texas	Killeen, Harker Heights, Copperas Cove, Belton, Temple and Central Texas	Killeen mobile DJ playing weddings, reunions and parties, with R&B, jazz, reggae and disco in the mix, plus karaoke and a photo booth rental.	dj.jayjacq@gmail.com	254.462.7183	https://gjjacquot.wixsite.com/djjayjacq	https://www.instagram.com/dj.jayjacq/
`,
  },
  {
    name: "El Paso: planning and cake",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
El Paso's Bakery	Cake	3300 Fort Blvd	El Paso	Texas		Mexican bakery making pastries, cakes and breads from scratch, with specialty cakes and catering for weddings and quinceañeras.		(915) 300-6909	https://elpasosbakery.com	https://www.instagram.com/elpasosbakery/
Greggerson's Cake Cottage	Cake	2050 Trawood Dr #9	El Paso	Texas		Neighbourhood bakery known for its almond buttercream, selling ready-made and custom cakes and cupcakes for special occasions.		(915) 591-5690	https://www.greggersonscakecottage.com	https://www.instagram.com/greggersonselpaso/
Imagine Events	Planning	7365 Remcon Circle, Suite C-301	El Paso	Texas	El Paso	Event coordination and design firm with 18 years' experience, offering full planning or day-of support for weddings, plus rentals and vendor coordination.	veronica@imagineeventplanners.com	(915) 833-2300	https://www.imagineeventplanners.com	
I Do Weddings & Events	Planning	11233 Rojas Drive	El Paso	Texas	El Paso and across the United States	Full-service wedding planning and event design company with over 22 years' experience, also offering decoration, catering and equipment rentals.	cody@idoweddingsevents.net	915-771-7788	https://www.idoeventsep.com	https://www.instagram.com/idoweddingseventsep/
That One Chica Event Planner	Planning		El Paso	Texas	El Paso and surrounding areas, plus destination events	Planner Paola offers full wedding planning, day-of coordination, tent draping and event design, with 8-plus years in the industry.	pq.eventdesigner@gmail.com	(915) 600-3381	https://thatonechicaeventdesigner.com	https://www.instagram.com/urpartyplanner_pao/
Jocabed Cajiga Event Design	Planning		El Paso	Texas	El Paso and Ciudad Juárez	Bilingual wedding planner and event designer working since 2015, covering full planning and design for couples in El Paso and Juárez.	info@jocabedcajiga.com		https://www.jocabedcajiga.com	https://www.instagram.com/jocabed.planner/
`,
  },
];

export default batches;
