import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { fetchAll } from "@/lib/supabase/fetch-all";
import { AppNav } from "@/components/app-nav";
import { PublicNav } from "@/components/public-nav";
import { PUBLIC_VENDOR_COLUMNS } from "@/lib/public-listings";
import type { Vendor, VendorFavoriteEntry, VendorInquiry, Wedding } from "@/lib/supabase/types";
import { VendorsManager } from "./vendors-manager";

export const metadata: Metadata = {
  title: "Wedding vendors",
  description:
    "Find wedding photographers, caterers, florists, DJs and more near you, on a map. Details checked and dated, so you know what's current.",
  alternates: { canonical: "/vendors" },
};

function loadVendors(supabase: Awaited<ReturnType<typeof createClient>>, columns: string) {
  return fetchAll<Vendor>((from, to) =>
    supabase
      .from("vendors")
      .select(columns)
      .eq("active", true)
      .order("name")
      .order("id")
      .range(from, to)
      .returns<Vendor[]>(),
  );
}

export default async function VendorsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Logged out: the same browse screen, public columns only, and the save /
  // quote buttons turn into signup links.
  if (!user) {
    const vendors = await loadVendors(supabase, PUBLIC_VENDOR_COLUMNS);
    return (
      <main className="flex flex-1 flex-col px-6 py-16">
        <PublicNav next="/vendors" />
        <h1 className="sr-only">Wedding vendors</h1>
        <VendorsManager vendors={vendors} inquiries={[]} favorites={[]} signedIn={false} />
      </main>
    );
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
            Vendors
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-forest">
            Set up your wedding first
          </h1>
          <p className="mt-4 text-ink/70">
            Add your wedding details on the Dashboard before contacting vendors.
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

  const vendors = await loadVendors(supabase, "*");

  const { data: inquiries } = await supabase
    .from("vendor_inquiries")
    .select("*")
    .eq("wedding_id", wedding.id)
    .order("sent_at", { ascending: false })
    .returns<VendorInquiry[]>();

  const { data: favorites } = await supabase
    .from("vendor_favorites")
    .select("*")
    .eq("wedding_id", wedding.id)
    .order("created_at", { ascending: true })
    .returns<VendorFavoriteEntry[]>();

  return (
    // Full-bleed, like Venues: the filter bar is the top of this screen, and
    // the heading stays for screen readers.
    <main className="flex flex-1 flex-col px-6 py-16">
      <AppNav email={user.email ?? ""} />
      <h1 className="sr-only">Browse & request quotes</h1>
      <VendorsManager
        vendors={vendors}
        inquiries={inquiries ?? []}
        favorites={favorites ?? []}
      />
    </main>
  );
}
