import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import type { Venue, VenueFaq } from "@/lib/supabase/types";
import { AdminVenuesManager } from "./admin-venues-manager";

export default async function AdminVenuesPage() {
  const admin = createAdminSupabaseClient();
  const [{ data: venues }, { data: faqs }] = await Promise.all([
    admin.from("venues").select("*").order("name").returns<Venue[]>(),
    admin
      .from("venue_faqs")
      .select("*")
      .order("sort_order", { ascending: true })
      .returns<VenueFaq[]>(),
  ]);

  const faqsByVenueId: Record<string, VenueFaq[]> = {};
  for (const faq of faqs ?? []) {
    (faqsByVenueId[faq.venue_id] ??= []).push(faq);
  }

  return (
    <div>
      <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">Admin</p>
      <h1 className="mt-2 mb-6 font-display text-3xl font-semibold text-forest">Venues</h1>
      <AdminVenuesManager venues={venues ?? []} faqsByVenueId={faqsByVenueId} />
    </div>
  );
}
