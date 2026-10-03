import type { VendorBatch } from "@/lib/vendor-batches";

// Idaho vendor batches. Every row's State is "Idaho". Add new batches at the end.
const batches: VendorBatch[] = [
  {
    name: "Boise: photography, planning, florals, music, catering, hair and makeup, cake and videography",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Corrie Butler Photography	Photography		Boise	Idaho	Boise, McCall, Sun Valley, Stanley and Garden Valley	Boise wedding photographer who takes on only a handful of weddings a year, with a warm, emotional, documentary feel.			https://corriebutlerphotography.com/weddings	
Good Earth Photo	Photography		Boise	Idaho	Idaho and the Pacific Northwest	Boise photographer for elopements and micro weddings, shooting film-inspired, unscripted images and offering Super 8 video.			https://goodearthphoto.com/	
McKenna & Clayton	Photography		Boise	Idaho	Boise, Idaho and beyond	Boise photography and videography team making bright, romantic wedding images for detail-minded couples.			https://mckennaandclayton.com/	https://www.instagram.com/mckennaandclayton/
Shelby Donald & Company	Planning		Boise	Idaho	Boise and surrounding areas	Wedding planning and day-of coordination in Boise from a planner who has coordinated more than 180 weddings.			https://shelbydonaldco.com/	https://www.instagram.com/shelbydonaldco/
Desert Flower Events	Planning		Boise	Idaho	Treasure Valley, including Nampa, Meridian, Eagle and McCall	Boise planner and day-of coordinator for weddings from small elopements to large celebrations.	hello@desertflowerboise.com	(208) 391-3694	https://www.desertflowerboise.com/	https://www.instagram.com/desertflowerevents/
Verdant Events	Planning		Boise	Idaho	Boise and surrounding areas	Boise planning studio offering coordination, partial and full planning and design, with modern, sustainable details.			https://www.verdantboise.com/	https://www.instagram.com/verdantweddingplanning/
Rust + Thistle	Florals		Boise	Idaho	Boise, Sun Valley, McCall and Twin Falls	Boise florist making romantic, organic wedding flowers, led by an owner with over twelve years in wedding floristry.	rustandthistle@gmail.com		https://www.rustandthistle.com/	https://www.instagram.com/rustandthistlefloral/
Posy Blue	Florals		Boise	Idaho	Boise and surrounding areas	Boise florist for weddings, events and flower bars, working only with American-grown flowers.	info@posyblue.com		https://www.posyblue.com/	https://www.instagram.com/posyblue/
Reverie Floristry	Florals		Boise	Idaho	Boise, Sun Valley and destination weddings	Boise florist designing romantic, detail-focused wedding and event flowers, including destination weddings.	hello@reveriefloristry.com		https://reveriefloristry.com/	https://www.instagram.com/reveriefloristry/
Sound Wave Events	Music	6169 Clinton St	Boise	Idaho	Boise and surrounding region	Boise DJ company that also supplies photo booths, lighting and dance floors for weddings and events.		208-891-0094	https://www.soundwaveevents.com/	https://www.instagram.com/soundwaveevents/
VCI Audio Entertainment	Music		Boise	Idaho	Boise and the Treasure Valley	Licensed, insured mobile DJ service in Boise covering weddings, dances, reunions and private parties.	info@vciaudio.com	(208) 938-1568	https://vciaudio.com/	
Batt Entertainment	Music		Boise	Idaho	Treasure Valley and Idaho	Boise musician offering live performances and DJ sets for weddings and private parties across Idaho.	soulserenemusic@gmail.com	208.250.3045	https://www.battentertainment.com/	https://www.instagram.com/spencerbattmusic/
3 Girls Catering	Catering	5467 N Glenwood St	Garden City	Idaho		Full-service caterer for weddings and events, with its own bistro and bar in Garden City.	3girlscateringboi@gmail.com	(208) 949-6620	https://3girlscatering.com/	
Whatever Works Catering	Catering		Boise	Idaho	Boise, Meridian, Nampa, Caldwell, Eagle and Kuna	Boise caterer for weddings and events using seasonal ingredients and menus tailored to each couple.		(208) 371-8253	https://www.whateverworkscatering.com/	https://www.instagram.com/whateverworkscatering/
Horsewood Catering	Catering	422 Caldwell Blvd	Nampa	Idaho	Boise, Meridian, McCall, Sun Valley and surrounding areas	Nampa caterer producing creative wedding menus for Boise, Meridian, McCall and Sun Valley events.		208-602-7110	https://www.horsewoodcatering.com/	https://www.instagram.com/horsewoodcatering/
Artistry By Brooke	Hair & Makeup		Kuna	Idaho	Idaho, with travel available	Kuna bridal hair and makeup artist working in her studio or on location for weddings and special occasions.	bb.muartistry@gmail.com	208-514-7724	https://www.artistrybybrooke.com/	https://www.instagram.com/artistrybybrooke_/
Rebel Color by Kodi	Hair & Makeup	8030 W Emerald St	Boise	Idaho	Boise and beyond, with travel for parties of four or more	Boise bridal hair and makeup team offering airbrush makeup and hair extensions for weddings.	rebelcolorbykodi@gmail.com		https://rebelcolorbykodi.com/weddings	https://www.instagram.com/rebelcolorbykodi/
Jamie Lee Bridal Makeup & Hair	Hair & Makeup		Boise	Idaho	Boise, Meridian, Star and Nampa	Bridal makeup and hair artist working at homes, hotels or studio spaces for weddings and special events.		760-519-0623	https://jamielee.makeup/	https://www.instagram.com/jamie_lee_makeup/
Boise Custom Cakes	Cake		Boise	Idaho	Boise, Meridian, Eagle, Star, Kuna, Nampa, Caldwell and the Treasure Valley	Custom cake designer making wedding and celebration cakes across the Treasure Valley.	service@boisecustomcakes.com	208-391-3882	https://www.boisecustomcakes.com/	
Paolian Sweets & More	Cake		Boise	Idaho	Treasure Valley	Home-based Boise bakery making custom wedding cakes and dessert bars, with gluten-free, dairy-free and vegan choices.	paoliansweets@gmail.com	(208) 841-4251	https://www.paoliansweets.com/	https://www.instagram.com/paoliansweets/
Pastry Perfection	Cake	5855 N Glenwood St	Boise	Idaho	Boise area	Boise bakery making custom wedding and party cakes alongside pastries and artisan breads, with same-day delivery.	info@pastryperfection.com	208-376-2253	https://pastryperfection.com/	
Boise Wedding Films	Videography		Boise	Idaho	Boise area, Idaho	Boise wedding filmmaker with ten years in business and more than 130 weddings filmed, focused on story and emotion.		208.912.6146	https://www.boiseweddingfilms.com/	
J. Ryan Films	Videography		Boise	Idaho	Boise, with travel	Boise videographer for weddings and events, making cinematic wedding films that focus on telling the story of the day.	info@jryanfilms.co		https://www.jryanfilms.co/	https://www.instagram.com/jryanfilms/
Panovision Films	Videography		Boise	Idaho		Boise documentary-style wedding filmmaker making story-driven films with an intimate, authentic feel.	char@charkareena.com		https://panovisionfilms.com/	https://www.instagram.com/charlottekareena/
`,
  },
];

export default batches;
