import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/page-shell";
import { loadVenueListing, VenueListing } from "./venue-listing";

// The full-page listing: what a shared link, a refresh, or a link from
// outside /venues opens. Clicking a venue in the search results opens the
// same listing in a panel instead -- see ../@modal/(.)[id].
export default async function VenueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const data = await loadVenueListing(supabase, user.id, id);
  if (!data) notFound();

  return (
    <PageShell email={user.email ?? ""} width="wide">
      <Link href="/venues" className="mb-4 inline-block text-sm text-brass hover:underline">
        &larr; Back to venues
      </Link>
      <VenueListing data={data} />
    </PageShell>
  );
}
