import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/page-shell";
import { loadVendorListing, VendorListing } from "./vendor-listing";

// The full-page listing: what a shared link, a refresh, or a link from
// outside /vendors opens. From the vendor search the same listing opens in a
// panel instead -- see ../@modal/(.)[id].
export default async function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const data = await loadVendorListing(supabase, user.id, id);
  if (!data) notFound();

  return (
    <PageShell email={user.email ?? ""} width="wide">
      <Link href="/vendors" className="mb-4 inline-block text-sm text-brass hover:underline">
        &larr; Back to vendors
      </Link>
      <VendorListing data={data} />
    </PageShell>
  );
}
