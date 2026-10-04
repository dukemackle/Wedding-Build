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
];

export default batches;
