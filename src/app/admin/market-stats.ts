import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { selectAll } from "@/lib/supabase/fetch-all";

const DAY = 864e5;

type Window = { now: number; before: number };

export type MarketStats = {
  live: number;
  listed: Window;
  /** Marked sold, plus rental dates booked: the item actually went to someone. */
  handedOn: Window;
  conversations: Window;
  reports: Window;
};

/**
 * Buy & sell's health, last 30 days against the 30 before, for Home and the
 * Buy & sell page. Listings and conversations by test couples' accounts
 * (owner or member of a wedding marked test) are left out, as elsewhere.
 *
 * "Handed on" uses a sold listing's updated_at: there's no sold_at, so a sold
 * listing edited later moves to the later date.
 */
export async function marketStats(): Promise<MarketStats> {
  const admin = createAdminSupabaseClient();
  const d30 = new Date(Date.now() - 30 * DAY).toISOString();
  const d60 = new Date(Date.now() - 60 * DAY).toISOString();

  const { data: testWeddings } = await admin
    .from("weddings")
    .select("user_id, member_ids")
    .eq("is_test", true)
    .returns<{ user_id: string; member_ids: string[] | null }[]>();
  const testUsers = new Set((testWeddings ?? []).flatMap((w) => [w.user_id, ...(w.member_ids ?? [])]));

  const [{ data: listings }, { data: threads }, { data: rentals }, { data: reports }] = await Promise.all([
    selectAll<{ id: string; seller_id: string; status: string; created_at: string; updated_at: string }>(
      admin,
      "market_listings",
      "id, seller_id, status, created_at, updated_at",
    ),
    selectAll<{ id: string; seller_id: string; buyer_id: string; created_at: string }>(
      admin,
      "market_threads",
      "id, seller_id, buyer_id, created_at",
    ),
    selectAll<{ id: string; listing_id: string; created_at: string }>(admin, "market_rental_bookings", "id, listing_id, created_at"),
    selectAll<{ id: string; created_at: string }>(admin, "market_reports", "id, created_at"),
  ]);

  const real = listings.filter((l) => !testUsers.has(l.seller_id));
  const realIds = new Set(real.map((l) => l.id));
  const split = (dates: string[]): Window => ({
    now: dates.filter((d) => d >= d30).length,
    before: dates.filter((d) => d >= d60 && d < d30).length,
  });
  const sold = split(real.filter((l) => l.status === "sold").map((l) => l.updated_at));
  const rented = split(rentals.filter((r) => realIds.has(r.listing_id)).map((r) => r.created_at));

  return {
    live: real.filter((l) => l.status === "active" || l.status === "pending").length,
    listed: split(real.map((l) => l.created_at)),
    handedOn: { now: sold.now + rented.now, before: sold.before + rented.before },
    conversations: split(
      threads.filter((t) => !testUsers.has(t.seller_id) && !testUsers.has(t.buyer_id)).map((t) => t.created_at),
    ),
    reports: split(reports.map((r) => r.created_at)),
  };
}

export const trendOf = (w: Window) => (w.now > w.before ? "up" : w.now < w.before ? "down" : "flat");
export const changeOf = (w: Window) => `${w.now.toLocaleString()} in 30d · ${w.before.toLocaleString()} before`;
