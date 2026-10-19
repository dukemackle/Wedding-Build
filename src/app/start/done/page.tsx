import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { estimateWeddingCost } from "@/lib/estimator";
import { DoneView } from "./done-view";
import type { RegionalCostData, Wedding } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Your plan is ready",
  robots: { index: false },
};

/**
 * The end of first-run setup. The couple's own budget estimate is the page's
 * one gold moment (the budget is where You Do, I Do is strongest), then the
 * three first steps in the order a wedding actually depends on them.
 *
 * Shown only when there's a place and a headcount to estimate from; without
 * them the card says what it needs instead of showing a made-up number.
 */
export default async function StartDonePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: wedding } = await supabase
    .from("weddings")
    .select("*")
    .or(`user_id.eq.${user.id},member_ids.cs.{${user.id}}`)
    .maybeSingle<Wedding>();
  if (!wedding) redirect("/start");

  const guests = wedding.guest_count_override;
  let estimate: ReturnType<typeof estimateWeddingCost> | null = null;
  if (wedding.state && guests) {
    const { data: regionalData } = await supabase
      .from("regional_cost_data")
      .select("*")
      .eq("state", wedding.state)
      .returns<RegionalCostData[]>();
    estimate = estimateWeddingCost(regionalData ?? [], wedding.state, guests, wedding.style_tier, {
      region: wedding.region,
      season: wedding.season,
    });
  }

  return <DoneView wedding={wedding} estimate={estimate} />;
}
