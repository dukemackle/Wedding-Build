import type { VendorBatch } from "@/lib/vendor-batches";

// Oklahoma vendor batches. Every row's State is "Oklahoma". Add new batches at the end.
const batches: VendorBatch[] = [
  {
    name: "Oklahoma City: photography, planning, florals, music and catering",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Lloyd Photo and Films	Photography		Oklahoma City	Oklahoma	Oklahoma City, Edmond and destination weddings	Photo and film team covering Oklahoma City and Edmond weddings, delivering stills and a wedding film from the same crew.			https://lloydphotoandfilms.com/	https://www.instagram.com/lloydphotoandfilms/
Terri Graves Photography and Films	Photography		Oklahoma City	Oklahoma		Husband-and-wife photo and video team in Oklahoma City, known for bright, vibrant, true-to-colour wedding images.			https://terrigravesphotography.com/	
Rylee Michelle Photo	Photography		Oklahoma City	Oklahoma	Oklahoma and beyond	Oklahoma City photographer for weddings, seniors and portraits, with a soft, true-to-colour editing style.			https://ryleemichellephoto.com/	
SSY Events	Planning		Oklahoma City	Oklahoma	Oklahoma	Oklahoma City wedding planning company offering coordination and full planning for polished, elevated celebrations.	karie@ssyevents.com		https://www.ssyevents.com/	https://www.instagram.com/shesaidyesweddings/
Blue Chalk Events	Planning		Oklahoma City	Oklahoma	Oklahoma and beyond	Oklahoma City wedding planning firm offering full-service planning for couples across the state and further afield.	info@bluechalkevents.com		https://www.bluechalkevents.com/	https://www.instagram.com/bluechalkeventsllc/
Embellished Weddings	Planning		Edmond	Oklahoma	Oklahoma City and destination weddings	Edmond-based planning firm for luxury weddings in the Oklahoma City area and destinations, with an award-winning, personal approach.			https://embellished.wedding	https://www.instagram.com/embellishedweddings/
XO by Haleigh Kenney	Florals	112 NW 132nd St	Oklahoma City	Oklahoma	Oklahoma and beyond	Oklahoma City wedding florist known for luxury bouquets, centrepieces and large-scale floral installations.		(405) 757-4357	https://www.xobyhaleighkenney.com	https://www.instagram.com/xohaleighkenney/
Main Street Floral and Events	Florals		Oklahoma City	Oklahoma	Oklahoma City area	Oklahoma City wedding and event florist offering personalised design, seasonal blooms and decor.	mainstreetfloralamelia@gmail.com		https://www.mainstreetfloralandevents.com/	https://www.instagram.com/mainstreetfloralandevents/
Poppy Lane Design	Florals		Norman	Oklahoma	Oklahoma City metro and Oklahoma	Norman floral studio with about twenty years of luxury wedding and event florals across the Oklahoma City metro.			http://www.poppylanedesign.com/	https://www.instagram.com/poppylanedesign/
Dusklight Entertainment	Music		Oklahoma City	Oklahoma	Along I-35 from Dallas to Kansas City	Oklahoma City live party band with drums, sax, guitar and strong vocals, plus DJ playlists and photo booths for receptions.			https://dusklightband.com/	https://www.instagram.com/dusklightentertainment/
All Out DJ	Music		Oklahoma City	Oklahoma	Oklahoma City and Tulsa	Wedding DJ service with custom playlists and effects, including a DJ and live saxophone combo for receptions.	info@all-outdj.com	(405) 513-0764	https://all-outdj.com/	https://www.instagram.com/alloutdjokc/
Julie Winkler Harpist	Music		Oklahoma City	Oklahoma	Oklahoma	Oklahoma City harpist with nearly twenty years' experience playing classical and custom ceremony and cocktail music.	julieawinkler96@gmail.com		https://www.juliewinklerharpist.com/	https://www.instagram.com/juliesstringsandthings/
Abbey Road Catering	Catering		Norman	Oklahoma	Norman and the Oklahoma City metro	Norman caterer serving the Oklahoma City metro since 1999, with plated wedding dinners and polished presentation.	abbey@abbeyroadcatering.com	(405) 360-1058	https://abbeyroadcatering.com/	https://www.instagram.com/abbeyroadcatering/
Harris Custom Catering	Catering		Oklahoma City	Oklahoma	Oklahoma City and surrounding area	Family-run Oklahoma City caterer since 2015, handling dietary restrictions and fusion menus for weddings.	events@harriscustomcatering.com		https://www.harriscustomcatering.com/	https://www.instagram.com/harris_custom_catering/
Swadley's Fine Event Catering	Catering		Oklahoma City	Oklahoma	Oklahoma City and beyond	Oklahoma City caterer offering buffet, plated and wedding-package service, scaled to any guest count.	catering@swadleys.com	405-413-7333	https://swadleyscatering.com/	https://www.instagram.com/swadleys_catering/
`,
  },
  {
    name: "Tulsa: photography, planning, florals, music and catering",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Laura Eddy Photography	Photography		Tulsa	Oklahoma	Tulsa and Oklahoma	Tulsa wedding and portrait photographer who photographs on film, with an approach built around real connection between couples.			https://lauraeddyphotography.com/	https://www.instagram.com/lauraeddyphotography/
Juliana Rose Photography	Photography		Tulsa	Oklahoma		Tulsa wedding and lifestyle photographer who also shoots maternity and family sessions, capturing moments as they happen.			https://www.julianarosephotography.com/	
Jordan Hathway Photography	Photography		Broken Arrow	Oklahoma	Oklahoma and destination weddings	Broken Arrow luxury wedding photographer blending fine-art polish with a documentary eye, working locally and abroad.			https://jordanhathwayphotography.com/	https://www.instagram.com/jordanhathwayphotography/
Be You Planning	Planning		Tulsa	Oklahoma	Tulsa metro, Oklahoma and destinations	Tulsa planning team handling luxury weddings, travel and events, locally across the state or at a destination.	hello@beyouplanning.com	(918) 401-0168	https://www.beyouplanning.com/	https://www.instagram.com/be_you_planning/
Bethany Faber Events	Planning		Tulsa	Oklahoma	Tulsa, Broken Arrow, Jenks and Owasso	Tulsa wedding planner offering full planning, custom design and month-of coordination for the Tulsa metro.			https://www.bethanyfaber.com/	https://www.instagram.com/bethanyfaberevents/
Divine Works Event Company	Planning		Tulsa	Oklahoma		Tulsa planner offering faith-based, budget-conscious wedding planning and day-of coordination.			https://www.divineworkseventco.com/	https://www.instagram.com/divineworkseventco/
Anthousai Floral Design	Florals		Tulsa	Oklahoma	Tulsa and destination weddings	Fine-art floral design studio in Tulsa focused on natural movement for weddings and events, locally and nationally.			https://anthousaiflorals.com	https://www.instagram.com/anthousai/
Ever Something	Florals		Tulsa	Oklahoma	Oklahoma and worldwide	Tulsa floral design and wedding planning company working with couples of all kinds, with flowers and coordination under one roof.			https://eversomething.com/	https://www.instagram.com/eversomethingevents/
Sincerely Yours Florals	Florals		Tulsa	Oklahoma	Tulsa and surrounding Oklahoma communities	Tulsa wedding florist designing bouquets, ceremony installations and centrepieces around each couple's style, venue and budget.			https://sincerelyyoursflorals.com	https://www.instagram.com/sincerelyyoursflorals/
Redline Entertainment	Music		Tulsa	Oklahoma	Tulsa	Tulsa wedding entertainment company that goes beyond DJing to cover a full range of reception entertainment.			https://www.redlinedjok.com/	https://www.instagram.com/redlinedjok/
DJ Ryno Events	Music		Tulsa	Oklahoma		Tulsa-raised wedding DJ and emcee with over 20 years' experience, who also films candid moments of the day.		(918) 978-7644	https://www.djrynoevents918.com/	https://www.instagram.com/djrynoevents/
Ignite the Night	Music		Tulsa	Oklahoma	Tulsa area	Tulsa wedding and event DJ company that builds each reception around the couple's own style rather than a stock playlist.	jordan@ignitethenighttulsa.com	918.933.8774	https://www.ignitethenighttulsa.com/	https://www.instagram.com/ignite_the_night_ent/
Tuly's Tacos	Catering		Tulsa	Oklahoma	Tulsa	Family-run Downtown Tulsa taqueria whose Jalisco recipes feed wedding receptions and parties from taco bars.	tulys918@outlook.com	(918) 378-2853	https://www.tulystacos.com/	https://www.instagram.com/tulystacos918/
Ludger's Catering & Events	Catering	1628 S Main St	Tulsa	Oklahoma	Tulsa	Tulsa caterer covering wedding receptions, holiday parties and corporate events from a Main Street base.	sales@ludgerscatering.com	918-744-9988	https://www.ludgerscatering.com	https://www.instagram.com/ludgerscatering/
Silver Dollar Catering	Catering		Tulsa	Oklahoma	Tulsa, Bartlesville and surrounding areas	Family-owned Tulsa full-service caterer with customisable menus for weddings, rehearsal dinners and larger celebrations.	silverdollarcatering@aol.com	918.361.6053	https://www.silverdollarcatering.com	
`,
  },
];

export default batches;
