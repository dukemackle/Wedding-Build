import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/app-nav";
import type { Vendor, VendorFavoriteEntry, VendorInquiry, Wedding } from "@/lib/supabase/types";
import { VendorsManager } from "./vendors-manager";

export default async function VendorsPage() {
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

  const { data: vendors } = await supabase
    .from("vendors")
    .select("*")
    .order("name")
    .returns<Vendor[]>();

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
    <main className="flex flex-1 flex-col items-center px-6 py-16">
      <AppNav email={user.email ?? ""} maxWidthClassName="max-w-4xl" />
      <div className="w-full max-w-4xl">
        <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
          Vendors
        </p>
        <h1 className="mt-2 mb-6 font-display text-3xl font-semibold text-forest">
          Browse & request quotes
        </h1>

        <VendorsManager
          vendors={vendors ?? []}
          inquiries={inquiries ?? []}
          favorites={favorites ?? []}
        />
      </div>
    </main>
  );
}
