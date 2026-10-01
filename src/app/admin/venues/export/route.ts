import { requireAdmin } from "@/lib/admin";
import { toCsv } from "@/lib/csv";
import type { Venue } from "@/lib/supabase/types";
import { parseListingParams } from "../../_listing/params";
import { fetchAllListings } from "../../_listing/query";
import { VENUE_LISTING } from "../listing-config";

/** Every venue matching the list's current filters, as a spreadsheet. */
export async function GET(request: Request) {
  await requireAdmin();

  const params = parseListingParams(Object.fromEntries(new URL(request.url).searchParams));
  const venues = await fetchAllListings<Venue>(VENUE_LISTING, params);

  const csv = toCsv(
    ["Name", "Type", "City", "State", "Capacity", "Price from", "Email", "Phone", "Website", "Source", "Live", "Last checked", "Photos"],
    venues.map((v) => [
      v.name,
      v.venue_type ?? "",
      v.city ?? "",
      v.state ?? "",
      v.capacity ?? "",
      v.price_from ?? "",
      v.contact_email ?? "",
      v.contact_phone ?? "",
      v.website ?? "",
      v.source ?? "",
      v.active ? "yes" : "no",
      v.last_verified_at?.slice(0, 10) ?? "never",
      v.photo_urls?.length || (v.image_url ? 1 : 0),
    ]),
  );

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="venues.csv"',
    },
  });
}
