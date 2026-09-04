import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/app-nav";
import type { Guest, RegistryItem, RsvpSubmission, Wedding } from "@/lib/supabase/types";
import { GuestsManager } from "./guests-manager";
import { RegistryManager } from "./registry-manager";
import { PublicSitePanel } from "./public-site-panel";
import { BulkInviteForm } from "./bulk-invite-form";

export default async function GuestsPage() {
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

  if (!wedding) {
    return (
      <main className="flex flex-1 flex-col items-center px-6 py-16">
        <AppNav email={user.email ?? ""} />
        <div className="w-full max-w-md rounded-lg border border-hairline bg-card p-6 sm:p-10 text-center shadow-sm">
          <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
            Guests
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-forest">
            Set up your wedding first
          </h1>
          <p className="mt-4 text-ink/70">
            Add your wedding details on the Dashboard before tracking guests.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-block rounded-md bg-forest px-4 py-2 font-medium text-parchment transition-colors hover:bg-forest/90"
          >
            Go to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const { data: guests } = await supabase
    .from("guests")
    .select("*")
    .eq("wedding_id", wedding.id)
    .order("household", { ascending: true, nullsFirst: false })
    .order("name", { ascending: true })
    .returns<Guest[]>();

  const { data: registryItems } = await supabase
    .from("registry_items")
    .select("*")
    .eq("wedding_id", wedding.id)
    .order("created_at", { ascending: true })
    .returns<RegistryItem[]>();

  const { data: rsvpSubmissions } = await supabase
    .from("rsvp_submissions")
    .select("*")
    .eq("wedding_id", wedding.id)
    .order("created_at", { ascending: true })
    .returns<RsvpSubmission[]>();

  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const origin = host ? `${protocol}://${host}` : "";

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-16">
      <AppNav email={user.email ?? ""} maxWidthClassName="max-w-3xl" />
      <div className="w-full max-w-3xl">
        <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
          Guests
        </p>
        <h1 className="mt-2 mb-6 font-display text-3xl font-semibold text-forest">
          Guest list & RSVPs
        </h1>

        <div className="flex flex-col gap-8">
          <PublicSitePanel
            publicSlug={wedding.public_slug}
            origin={origin}
            pendingSubmissions={rsvpSubmissions ?? []}
          />
          <BulkInviteForm guests={guests ?? []} publicSlug={wedding.public_slug} origin={origin} />
          <GuestsManager guests={guests ?? []} />
          <RegistryManager registryItems={registryItems ?? []} />
        </div>
      </div>
    </main>
  );
}
