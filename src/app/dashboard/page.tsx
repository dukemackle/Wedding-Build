import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/app-nav";
import { WeddingDashboard } from "./wedding-dashboard";
import { DashboardSummary, type DashboardSummaryData } from "./dashboard-summary";
import type { Wedding } from "@/lib/supabase/types";
import { BUDGET_CATEGORIES, computeCategoryValue, effectiveGuestCount } from "@/lib/budget-categories";

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
    .eq("user_id", user.id)
    .maybeSingle<Wedding>();

  let summary: DashboardSummaryData | null = null;

  if (wedding) {
    const [
      { data: guests },
      { data: budgetOverrides },
      { count: venuesShortlisted },
      { data: vendorInquiries },
      { count: attireShortlisted },
    ] = await Promise.all([
      supabase.from("guests").select("status, plus_one").eq("wedding_id", wedding.id),
      supabase
        .from("budget_line_items")
        .select("category, override_value")
        .eq("wedding_id", wedding.id),
      supabase
        .from("venue_shortlist")
        .select("id", { count: "exact", head: true })
        .eq("wedding_id", wedding.id),
      supabase.from("vendor_inquiries").select("status").eq("wedding_id", wedding.id),
      supabase
        .from("attire_shortlist")
        .select("id", { count: "exact", head: true })
        .eq("wedding_id", wedding.id),
    ]);

    const guestRows = guests ?? [];
    const headcount = effectiveGuestCount(wedding, guestRows);

    const overrideByCategory = new Map(
      (budgetOverrides ?? []).map((row) => [row.category, row.override_value]),
    );
    const budgetTotal = BUDGET_CATEGORIES.reduce((sum, category) => {
      const computed = computeCategoryValue(
        category,
        headcount,
        wedding.region,
        wedding.season,
        wedding.style_tier,
      );
      return sum + (overrideByCategory.get(category.key) ?? computed);
    }, 0);

    const inquiries = vendorInquiries ?? [];

    summary = {
      guestsConfirmed: guestRows.filter((g) => g.status === "confirmed").length,
      guestsPending: guestRows.filter(
        (g) => g.status === "invited" || g.status === "pending",
      ).length,
      guestsDeclined: guestRows.filter((g) => g.status === "declined").length,
      guestsTotal: guestRows.length,
      headcount,
      budgetTotal,
      budgetCategoriesQuoted: overrideByCategory.size,
      budgetCategoriesTotal: BUDGET_CATEGORIES.length,
      venuesShortlisted: venuesShortlisted ?? 0,
      vendorInquiriesSent: inquiries.length,
      vendorInquiriesBooked: inquiries.filter((v) => v.status === "booked").length,
      attireShortlisted: attireShortlisted ?? 0,
    };
  }

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-16">
      <AppNav email={user.email ?? ""} />
      <WeddingDashboard initialWedding={wedding} />
      {summary && <DashboardSummary data={summary} />}
    </main>
  );
}
