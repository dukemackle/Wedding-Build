import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/page-shell";
import { FadeInSection } from "@/components/fade-in-section";
import { WeddingDashboard } from "./wedding-dashboard";
import { FeatureGrid, buildFeatures } from "./feature-grid";
import { PartnerInviteCard } from "./partner-invite-card";
import { buildVendorTracker } from "./dashboard-data";
import type {
  AttireItem,
  ChecklistItem,
  ItineraryEvent,
  RegionalCostData,
  Venue,
  VendorInquiryStatus,
  Wedding,
} from "@/lib/supabase/types";
import { BUDGET_CATEGORIES, effectiveGuestCount } from "@/lib/budget-categories";
import { weddingCategoryEstimates } from "@/lib/estimator";

/**
 * The first screen after signing in: the couple's banner, and then one box
 * for each part of Wren. Nothing else -- it's a front door, not a report.
 */
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: wedding } = await supabase
    .from("weddings")
    .select("*")
    .or(`user_id.eq.${user.id},partner_user_id.eq.${user.id}`)
    .maybeSingle<Wedding>();

  if (!wedding) {
    return (
      <PageShell email={user.email ?? ""} width="reading">
        <WeddingDashboard initialWedding={null} />
      </PageShell>
    );
  }

  let bookedVenue: Venue | null = null;
  if (wedding.venue_id) {
    const { data: venue } = await supabase
      .from("venues")
      .select("*")
      .eq("id", wedding.venue_id)
      .maybeSingle<Venue>();
    bookedVenue = venue;
  }

  const [
    { data: guests },
    { data: lineItems },
    { data: customItems },
    { data: venueShortlist },
    { data: vendorInquiries },
    { data: attireShortlist },
    { data: checklist },
    { data: itineraryEvents },
    { count: layoutItems },
    { data: regionalData },
  ] = await Promise.all([
    supabase.from("guests").select("status, plus_one").eq("wedding_id", wedding.id),
    supabase
      .from("budget_line_items")
      .select("category, override_value, paid_amount, vendor_id, venue_id, purchased_from")
      .eq("wedding_id", wedding.id),
    supabase.from("budget_custom_items").select("amount, paid_amount").eq("wedding_id", wedding.id),
    supabase
      .from("venue_shortlist")
      .select("venue_id")
      .eq("wedding_id", wedding.id)
      .order("created_at", { ascending: false })
      .returns<{ venue_id: string }[]>(),
    supabase
      .from("vendor_inquiries")
      .select("status, category, vendor_name")
      .eq("wedding_id", wedding.id)
      .returns<{ status: VendorInquiryStatus; category: string | null; vendor_name: string }[]>(),
    supabase
      .from("attire_shortlist")
      .select("attire_item_id")
      .eq("wedding_id", wedding.id)
      .order("created_at", { ascending: false })
      .returns<{ attire_item_id: string }[]>(),
    supabase
      .from("checklist_items")
      .select("*")
      .eq("wedding_id", wedding.id)
      .returns<ChecklistItem[]>(),
    supabase
      .from("itinerary_events")
      .select("event_date, start_time, title")
      .eq("wedding_id", wedding.id)
      .order("event_date")
      .order("start_time", { nullsFirst: false })
      .returns<Pick<ItineraryEvent, "event_date" | "start_time" | "title">[]>(),
    supabase
      .from("venue_layout_items")
      .select("id", { count: "exact", head: true })
      .eq("wedding_id", wedding.id),
    supabase
      .from("regional_cost_data")
      .select("*")
      .eq("state", wedding.state ?? "")
      .returns<RegionalCostData[]>(),
  ]);

  // A photo for the Venues and Attire boxes: the booked venue, else the most
  // recently saved one; the most recently saved outfit.
  const photoVenueId = bookedVenue ? null : venueShortlist?.[0]?.venue_id;
  const attireItemId = attireShortlist?.[0]?.attire_item_id;
  const [{ data: savedVenue }, { data: savedAttire }] = await Promise.all([
    photoVenueId
      ? supabase
          .from("venues")
          .select("name, image_url")
          .eq("id", photoVenueId)
          .maybeSingle<Pick<Venue, "name" | "image_url">>()
      : Promise.resolve({ data: null }),
    attireItemId
      ? supabase
          .from("attire_items")
          .select("name, image_urls")
          .eq("id", attireItemId)
          .maybeSingle<Pick<AttireItem, "name" | "image_urls">>()
      : Promise.resolve({ data: null }),
  ]);
  const venueForPhoto = bookedVenue ?? savedVenue;

  const checklistItems = checklist ?? [];
  const guestRows = guests ?? [];
  const headcount = effectiveGuestCount(wedding, guestRows);

  // Same arithmetic as the Budget page: hidden categories don't count, and a
  // line item with no override still falls back to the estimate. Summing all
  // nineteen here used to make the two pages disagree.
  const hidden = new Set(wedding.hidden_budget_categories);
  const visibleCategories = BUDGET_CATEGORIES.filter((c) => !hidden.has(c.key));
  const lineByCategory = new Map((lineItems ?? []).map((row) => [row.category, row]));
  const estimates = weddingCategoryEstimates(regionalData ?? [], wedding, headcount);
  let categoriesTotal = 0;
  let typical = 0;
  for (const category of visibleCategories) {
    const computed = estimates.get(category.key) ?? 0;
    typical += computed;
    categoriesTotal += lineByCategory.get(category.key)?.override_value ?? computed;
  }
  const paid =
    visibleCategories.reduce((sum, c) => sum + (lineByCategory.get(c.key)?.paid_amount ?? 0), 0) +
    (customItems ?? []).reduce((sum, item) => sum + (item.paid_amount ?? 0), 0);
  const customTotal = (customItems ?? []).reduce((sum, item) => sum + item.amount, 0);

  const vendors = buildVendorTracker({
    hiddenCategories: wedding.hidden_budget_categories,
    lineItems: lineItems ?? [],
    inquiries: vendorInquiries ?? [],
    bookedVenueName: bookedVenue?.name ?? null,
    venuesShortlisted: venueShortlist?.length ?? 0,
  });

  // The wedding day's own schedule when there is one; otherwise the first
  // day that has anything on it.
  const events = itineraryEvents ?? [];
  const dayEvents = events.filter((e) => e.event_date === wedding.wedding_date);
  const shownDay = dayEvents.length > 0 ? dayEvents : events.filter((e) => e.event_date === events[0]?.event_date);

  const features = buildFeatures({
    checklist: {
      done: checklistItems.filter((item) => item.completed).length,
      total: checklistItems.length,
      next: checklistItems
        .filter((item) => !item.completed)
        .sort((a, b) => (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999"))
        .slice(0, 3)
        .map((item) => ({ title: item.title, due: item.due_date })),
    },
    budget: {
      total: categoriesTotal + customTotal,
      target: wedding.budget_target,
      paid,
      typical,
      quoted: visibleCategories.filter((c) => lineByCategory.get(c.key)?.override_value != null)
        .length,
      categories: visibleCategories.length,
    },
    guests: {
      total: guestRows.length,
      confirmed: guestRows.filter((g) => g.status === "confirmed").length,
      pending: guestRows.filter((g) => g.status === "invited" || g.status === "pending").length,
      declined: guestRows.filter((g) => g.status === "declined").length,
    },
    venue: venueForPhoto
      ? { photo: venueForPhoto.image_url, name: venueForPhoto.name, booked: Boolean(bookedVenue) }
      : null,
    venuesShortlisted: venueShortlist?.length ?? 0,
    vendors,
    attire: savedAttire
      ? { photo: savedAttire.image_urls[0] ?? null, name: savedAttire.name }
      : null,
    attireShortlisted: attireShortlist?.length ?? 0,
    itinerary: shownDay.slice(0, 3).map((e) => ({ time: e.start_time, title: e.title })),
    layoutItems: layoutItems ?? 0,
  });

  return (
    <PageShell email={user.email ?? ""} width="canvas">
      <WeddingDashboard initialWedding={wedding} bookedVenue={bookedVenue} />

      <FadeInSection delayMs={40}>
        <FeatureGrid features={features} />
      </FadeInSection>

      {wedding.user_id === user.id && (
        <FadeInSection delayMs={80}>
          <div className="mt-10 lg:mx-auto lg:w-2/5">
            <PartnerInviteCard
              inviteToken={wedding.invite_token}
              hasPartner={Boolean(wedding.partner_user_id)}
            />
          </div>
        </FadeInSection>
      )}
    </PageShell>
  );
}
