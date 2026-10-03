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
];

export default batches;
