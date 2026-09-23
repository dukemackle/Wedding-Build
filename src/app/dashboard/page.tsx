import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/page-shell";
import { FadeInSection } from "@/components/fade-in-section";
import { WeddingDashboard } from "./wedding-dashboard";
import { StatStrip, BudgetPanel, RsvpPanel } from "./dashboard-summary";
import { ThisWeek } from "./this-week";
import { VendorTracker } from "./vendor-tracker";
import { PartnerInviteCard } from "./partner-invite-card";
import { buildVendorTracker, currentPhase, type DashboardSummaryData } from "./dashboard-data";
import type { ChecklistItem, Venue, VendorInquiryStatus, Wedding } from "@/lib/supabase/types";
import { BUDGET_CATEGORIES, computeCategoryValue, effectiveGuestCount } from "@/lib/budget-categories";

/**
 * The first screen after signing in, and so the one that has to answer "where
 * are we, and what do we do next" without a click.
 *
 * Desktop is a banner and then two columns -- the work (this week's tasks,
 * the bookings) on the left, the numbers (budget, RSVPs) in a rail on the
 * right. A phone gets the same pieces as one column, tasks first, with the
 * longer panels folded.
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
      .select("category, override_value, paid_amount, vendor_id, venue_id, purchased_from")
      .eq("wedding_id", wedding.id),
    supabase.from("budget_custom_items").select("amount, paid_amount").eq("wedding_id", wedding.id),
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
  const paid =
    visibleCategories.reduce(
      (sum, c) => sum + (lineByCategory.get(c.key)?.paid_amount ?? 0),
      0,
    ) + (customItems ?? []).reduce((sum, item) => sum + (item.paid_amount ?? 0), 0);

  const summary: DashboardSummaryData = {
    guestsConfirmed: guestRows.filter((g) => g.status === "confirmed").length,
    guestsPending: guestRows.filter((g) => g.status === "invited" || g.status === "pending")
      .length,
    guestsDeclined: guestRows.filter((g) => g.status === "declined").length,
    guestsTotal: guestRows.length,
    headcount,
    headcountIsOverride: wedding.guest_count_override != null,
    budgetTotal: categoriesTotal + customTotal,
    budgetTarget: wedding.budget_target,
    budgetPaid: paid,
    budgetCategoriesQuoted: visibleCategories.filter(
      (c) => lineByCategory.get(c.key)?.override_value != null,
    ).length,
    budgetCategoriesTotal: visibleCategories.length,
    venuesShortlisted: venuesShortlisted ?? 0,
    attireShortlisted: attireShortlisted ?? 0,
    tasksDone: checklistItems.filter((item) => item.completed).length,
    tasksTotal: checklistItems.length,
  };

  const vendors = buildVendorTracker({
    hiddenCategories: wedding.hidden_budget_categories,
    lineItems: lineItems ?? [],
    inquiries: vendorInquiries ?? [],
    bookedVenueName: bookedVenue?.name ?? null,
    venuesShortlisted: summary.venuesShortlisted,
  });

  return (
    <PageShell email={user.email ?? ""} width="canvas">
      <WeddingDashboard
        initialWedding={wedding}
        bookedVenue={bookedVenue}
        progress={{ done: summary.tasksDone, total: summary.tasksTotal }}
        phase={currentPhase(checklistItems)}
      />

      <FadeInSection delayMs={40}>
        <StatStrip data={summary} vendors={vendors} />
      </FadeInSection>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="flex min-w-0 flex-col gap-6">
          <FadeInSection delayMs={60}>
            <ThisWeek items={checklistItems} />
          </FadeInSection>
          <FadeInSection delayMs={80}>
            <VendorTracker rows={vendors} />
          </FadeInSection>
        </div>
        <aside className="flex min-w-0 flex-col gap-6">
          <FadeInSection delayMs={80}>
            <BudgetPanel data={summary} />
          </FadeInSection>
          <FadeInSection delayMs={100}>
            <RsvpPanel data={summary} rsvpDeadline={wedding.rsvp_deadline} />
          </FadeInSection>
          {wedding.user_id === user.id && (
            <FadeInSection delayMs={120}>
              <PartnerInviteCard
                inviteToken={wedding.invite_token}
                hasPartner={Boolean(wedding.partner_user_id)}
              />
            </FadeInSection>
          )}
        </aside>
      </div>
    </PageShell>
  );
}
