import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/page-shell";
import { STATES } from "@/lib/wedding-options";
import type { Wedding } from "@/lib/supabase/types";
import { ListingForm } from "../listing-form";

export const metadata: Metadata = { title: "Sell something", robots: { index: false } };

export default async function NewListingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/marketplace/new");

  // A couple's own name and wedding town fill the form in; anyone else
  // starts blank.
  const { data: wedding } = await supabase
    .from("weddings")
    .select("partner_a_name, own_venue_city, own_venue_state")
    .or(`user_id.eq.${user.id},member_ids.cs.{${user.id}}`)
    .maybeSingle<Pick<Wedding, "partner_a_name" | "own_venue_city" | "own_venue_state">>();

  const state = (STATES as readonly string[]).includes(wedding?.own_venue_state ?? "")
    ? (wedding?.own_venue_state ?? undefined)
    : undefined;

  return (
    <PageShell email={user.email ?? ""} width="reading">
      <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">Marketplace</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-forest">Sell something</h1>
      <p className="mt-2 text-ink/70">
        Pass on what&apos;s left from your wedding to someone whose day is still coming.
      </p>
      <div className="mt-8">
        <ListingForm
          sellerId={user.id}
          defaults={{
            seller_name: wedding?.partner_a_name?.split(/\s+/)[0] ?? undefined,
            city: wedding?.own_venue_city ?? undefined,
            state,
          }}
        />
      </div>
    </PageShell>
  );
}
