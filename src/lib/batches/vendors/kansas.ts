import type { VendorBatch } from "@/lib/vendor-batches";

// Kansas vendor batches. Every row's State is "Kansas". Add new batches at the end.
const batches: VendorBatch[] = [
  {
    name: "Wichita: hair and makeup",
    tsv: `Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
Blushed Beauty Co.	Hair & Makeup	128 N Oliver Ave	Wichita	Kansas	Wichita	A Wichita team of independent artists and stylists offering bridal hair and makeup, led by a cosmetologist licensed since 2011.	info@blushedbeautyco.com	316-683-7350	https://www.blushedbeautyco.com/	https://www.instagram.com/blushedbeautyco.ict/
`,
  },
];

export default batches;
