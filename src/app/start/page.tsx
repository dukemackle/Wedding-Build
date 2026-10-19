import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { STATES, STYLE_TIERS } from "@/lib/wedding-options";
import { SetupFlow } from "./setup-flow";

export const metadata: Metadata = {
  title: "Set up your wedding",
  robots: { index: false },
};

/**
 * First-run setup: five short questions before the dashboard, each one
 * skippable except the couple's names. Approved from the mockup on
 * 2026-10-19 (https://claude.ai/artifact/MKwFy2KT4NiNuEYcZDVH9T).
 *
 * It has its own slim header rather than PageShell's nav: there's nothing to
 * navigate to before a wedding exists, and the tabs would only pull attention
 * away from the question.
 *
 * The public estimator sends its answers along (?state=&tier=&guests=), so a
 * couple who priced a wedding before signing up doesn't answer twice.
 */
export default async function StartPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string; tier?: string; guests?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/start");

  const { data: wedding } = await supabase
    .from("weddings")
    .select("id")
    .or(`user_id.eq.${user.id},member_ids.cs.{${user.id}}`)
    .maybeSingle<{ id: string }>();
  if (wedding) redirect("/dashboard");

  const params = await searchParams;
  const guests = Number(params.guests);

  return (
    <SetupFlow
      initialState={(STATES as readonly string[]).includes(params.state ?? "") ? params.state! : ""}
      initialTier={(STYLE_TIERS as readonly string[]).includes(params.tier ?? "") ? params.tier! : ""}
      initialGuests={Number.isInteger(guests) && guests > 0 && guests <= 2000 ? guests : null}
    />
  );
}
