import { requireAdmin } from "@/lib/admin";
import { toCsv } from "@/lib/csv";
import type { Vendor } from "@/lib/supabase/types";
import { parseListingParams } from "../../_listing/params";
import { fetchAllListings } from "../../_listing/query";
import { VENDOR_LISTING } from "../listing-config";

/** Every vendor matching the list's current filters, as a spreadsheet. */
export async function GET(request: Request) {
  await requireAdmin();

  const params = parseListingParams(Object.fromEntries(new URL(request.url).searchParams));
  const vendors = await fetchAllListings<Vendor>(VENDOR_LISTING, params);

  const csv = toCsv(
    ["Name", "Category", "City", "State", "Price tier", "Email", "Source", "Live", "Last checked", "Phone", "Website", "Price from", "Photos", "ID"],
    vendors.map((v) => [
      v.name,
      v.category ?? "",
      v.city ?? "",
      v.state ?? "",
      v.price_tier ?? "",
      v.contact_email ?? "",
      v.source ?? "",
      v.active ? "yes" : "no",
      v.last_verified_at?.slice(0, 10) ?? "never",
      v.contact_phone ?? "",
      v.website ?? "",
      v.price_from ?? "",
      v.photo_urls?.length || (v.image_url ? 1 : 0),
      // Lets /data-audit point its fixes file at the exact row.
      v.id,
    ]),
  );

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="vendors.csv"',
    },
  });
}
