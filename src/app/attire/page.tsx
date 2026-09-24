import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/app-nav";
import { PageShell } from "@/components/page-shell";
import type {
  AttireItem,
  AttirePartyMember,
  AttireShortlistEntry,
  Wedding,
} from "@/lib/supabase/types";
import { AttireBrowser } from "./attire-browser";

export default async function AttirePage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
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
      <main className="flex flex-1 flex-col items-center px-6 py-16">
        <AppNav email={user.email ?? ""} />
        <div className="w-full max-w-md rounded-lg border border-hairline bg-card p-6 sm:p-10 text-center shadow-sm">
          <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
            Attire
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-forest">
            Set up your wedding first
          </h1>
          <p className="mt-4 text-ink/70">
            Add your wedding details on the Dashboard before browsing attire.
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

  const [{ data: items }, { data: shortlist }, { data: party }] = await Promise.all([
    supabase
      .from("attire_items")
      .select("*")
      .order("is_featured", { ascending: false })
      .order("name")
      .returns<AttireItem[]>(),
    supabase
      .from("attire_shortlist")
      .select("*")
      .eq("wedding_id", wedding.id)
      .returns<AttireShortlistEntry[]>(),
    supabase
      .from("attire_party_members")
      .select("*")
      .eq("wedding_id", wedding.id)
      .order("sort_order")
      .order("created_at")
      .returns<AttirePartyMember[]>(),
  ]);

  const vendorIds = [...new Set((items ?? []).map((i) => i.vendor_id).filter(Boolean))] as string[];
  const { data: vendors } = vendorIds.length
    ? await supabase
        .from("vendors")
        .select("id, name")
        .in("id", vendorIds)
        .returns<{ id: string; name: string }[]>()
    : { data: [] };

  return (
    <PageShell email={user.email ?? ""} width="full">
      <AttireBrowser
        items={items ?? []}
        shortlist={shortlist ?? []}
        party={party ?? []}
        vendorNames={Object.fromEntries((vendors ?? []).map((v) => [v.id, v.name]))}
        shareToken={wedding.party_share_token}
        initialView={view === "saved" || view === "party" ? view : "browse"}
      />
    </PageShell>
  );
}
