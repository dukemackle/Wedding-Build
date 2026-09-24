import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/page-shell";
import { FadeInSection } from "@/components/fade-in-section";
import { WeddingDashboard } from "./wedding-dashboard";
import { FeatureGrid, buildFeatures } from "./feature-grid";
import { PartnerInviteCard } from "./partner-invite-card";
import { buildVendorTracker } from "./dashboard-data";
import type { ChecklistItem, Venue, VendorInquiryStatus, Wedding } from "@/lib/supabase/types";
import { BUDGET_CATEGORIES, computeCategoryValue, effectiveGuestCount } from "@/lib/budget-categories";

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
    { count: venuesShortlisted },
    { data: vendorInquiries },
    { count: attireShortlisted },
    { data: checklist },
  ] = await Promise.all([
    supabase.from("guests").select("status, plus_one").eq("wedding_id", wedding.id),
    supabase
      .from("budget_line_items")
      .select("category, override_value, vendor_id, venue_id, purchased_from")
      .eq("wedding_id", wedding.id),
    supabase.from("budget_custom_items").select("amount").eq("wedding_id", wedding.id),
    supabase
      .from("venue_shortlist")
      .select("id", { count: "exact", head: true })
      .eq("wedding_id", wedding.id),
    supabase
      .from("vendor_inquiries")
      .select("status, category, vendor_name")
      .eq("wedding_id", wedding.id)
      .returns<{ status: VendorInquiryStatus; category: string | null; vendor_name: string }[]>(),
    supabase
      .from("attire_shortlist")
      .select("id", { count: "exact", head: true })
      .eq("wedding_id", wedding.id),
    supabase
      .from("checklist_items")
      .select("*")
      .eq("wedding_id", wedding.id)
      .returns<ChecklistItem[]>(),
  ]);

  const checklistItems = checklist ?? [];
  const guestRows = guests ?? [];
  const headcount = effectiveGuestCount(wedding, guestRows);

  // Same arithmetic as the Budget page: hidden categories don't count, and a
  // line item with no override still falls back to the estimate. Summing all
  // nineteen here used to make the two pages disagree.
  const hidden = new Set(wedding.hidden_budget_categories);
  const visibleCategories = BUDGET_CATEGORIES.filter((c) => !hidden.has(c.key));
  const lineByCategory = new Map((lineItems ?? []).map((row) => [row.category, row]));
  const categoriesTotal = visibleCategories.reduce((sum, category) => {
    const computed = computeCategoryValue(
      category,
      headcount,
      wedding.region,
      wedding.season,
      wedding.style_tier,
    );
    return sum + (lineByCategory.get(category.key)?.override_value ?? computed);
  }, 0);
  const customTotal = (customItems ?? []).reduce((sum, item) => sum + item.amount, 0);

  const vendors = buildVendorTracker({
    hiddenCategories: wedding.hidden_budget_categories,
    lineItems: lineItems ?? [],
    inquiries: vendorInquiries ?? [],
    bookedVenueName: bookedVenue?.name ?? null,
    venuesShortlisted: venuesShortlisted ?? 0,
  });

  const features = buildFeatures({
    tasksDone: checklistItems.filter((item) => item.completed).length,
    tasksTotal: checklistItems.length,
    budgetTotal: categoriesTotal + customTotal,
    budgetTarget: wedding.budget_target,
    guestsTotal: guestRows.length,
    guestsConfirmed: guestRows.filter((g) => g.status === "confirmed").length,
    venuesShortlisted: venuesShortlisted ?? 0,
    vendorsBooked: vendors.filter((v) => v.status === "booked").length,
    vendorsTracked: vendors.length,
    attireShortlisted: attireShortlisted ?? 0,
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
