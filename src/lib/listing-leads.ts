import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";

export type ListingType = "venue" | "vendor";

export type LeadCounts = {
  /** Distinct couples who sent an inquiry through the app. */
  inquiries: number;
  /** Taps on the listing's phone number, website or socials. */
  clicks: number;
};

/**
 * What a listing has had from couples on You Do, I Do. This is the number we
 * show a vendor to make claiming (and later paying) worth it, so it counts
 * only what's recorded: inquiries are logged before they're sent, and contact
 * taps by /api/contact-click.
 */
export async function leadCounts(type: ListingType, listingId: string): Promise<LeadCounts> {
  const admin = createAdminSupabaseClient();
  const table = type === "venue" ? "venue_inquiries" : "vendor_inquiries";
  const idColumn = type === "venue" ? "venue_id" : "vendor_id";

  const [{ data: inquiries }, { count: clicks }] = await Promise.all([
    admin
      .from(table)
      .select("wedding_id")
      .eq(idColumn, listingId)
      // "Mark booked" without an inquiry stores no message; that's not a lead.
      .not("message", "is", null)
      .returns<{ wedding_id: string }[]>(),
    admin
      .from("listing_contact_clicks")
      .select("id", { count: "exact", head: true })
      .eq("listing_type", type)
      .eq("listing_id", listingId),
  ]);

  return {
    inquiries: new Set((inquiries ?? []).map((i) => i.wedding_id)).size,
    clicks: clicks ?? 0,
  };
}

/** "3 couples have sent you an inquiry and 12 more tapped your number or website." */
export function leadSentence({ inquiries, clicks }: LeadCounts): string | null {
  if (inquiries === 0 && clicks === 0) return null;
  const couples = `${inquiries} ${inquiries === 1 ? "couple has" : "couples have"} sent you an inquiry`;
  const taps = `${clicks} ${clicks === 1 ? "time" : "times"} a couple tapped your phone number or website`;
  if (inquiries > 0 && clicks > 0) return `${couples}, and ${taps}, through You Do, I Do.`;
  if (inquiries > 0) return `${couples} through You Do, I Do.`;
  return `${clicks} ${clicks === 1 ? "time" : "times"} a couple on You Do, I Do tapped your phone number or website.`;
}
