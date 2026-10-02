import type { VenueBatch } from "@/lib/venue-batches";

// Louisiana venue batches. Every row's State is "Louisiana". Add new batches at the end.
const batches: VenueBatch[] = [
  {
    name: "Baton Rouge and St. Francisville",
    tsv: `Name	Address	City	State	Latitude	Longitude	Venue type	Setting	Capacity	Price tier	Description	Email	Phone	Website
Magnolia Mound	2161 Nicholson Drive	Baton Rouge	Louisiana			Historic / Estate	Indoor & Outdoor	250	Simple	c. 1791 Creole house museum on 16 acres, with a French Creole-style barn under a live oak for receptions and the c. 1904 Hart House for up to 50.	magnoliamound@brec.org	(225) 343-4955	https://www.brec.org/facility/MagnoliaMound
LSU AgCenter Botanic Gardens at Burden	4560 Essen Lane	Baton Rouge	Louisiana			Garden / Outdoor	Indoor & Outdoor			Research gardens with an A. Hays Town-designed Orangerie, an open-air Pavilion with a fireplace near Burden Woods, and rose and memory gardens.	botanicgardens@agcenter.lsu.edu	(225) 763-3990	https://www.lsu.edu/botanic-gardens/rentals/weddings.php
LSU Rural Life Museum and Windrush Gardens	4560 Essen Lane	Baton Rouge	Louisiana			Historic / Estate	Outdoor			Open-air museum of 32 historic outbuildings spread over 25 acres, alongside the Windrush Gardens.	rlm@lsu.edu	(225) 765-2437	https://www.lsu.edu/rurallife/rentals.php
Watermark Baton Rouge	150 Third Street	Baton Rouge	Louisiana			Ballroom / Hotel	Indoor	100		Downtown hotel with four small event rooms, among them The Vault, suited to weddings of up to 100.	info@watermarkbr.com	(225) 408-3200	https://www.watermarkbr.com/weddings
Hemingbough	10101 Highway 965 West	St. Francisville	Louisiana			Garden / Outdoor	Indoor & Outdoor			Cultural centre with an amphitheatre above Lake Audubon, the Hemstead Hall ballroom, a memorial chapel and an eight-room guest house.		(225) 635-6617	https://hemingbough.com/weddings.html
`,
  },
];

export default batches;
