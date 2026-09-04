import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/app-nav";
import type { Wedding } from "@/lib/supabase/types";
import { ContactsManager, type VendorContact, type VenueContact } from "./contacts-manager";

export default async function ContactsPage() {
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
            Contacts
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-forest">
            Set up your wedding first
          </h1>
          <p className="mt-4 text-ink/70">
            Add your wedding details on the Dashboard before building a contacts list.
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

  const [
    { data: venueFavoriteRows },
    { data: vendorFavoriteRows },
    { data: inquiryRows },
  ] = await Promise.all([
    supabase
      .from("venue_shortlist")
      .select("venue_id, contact_email, contact_phone, notes")
      .eq("wedding_id", wedding.id),
    supabase
      .from("vendor_favorites")
      .select("vendor_id, contact_phone, notes")
      .eq("wedding_id", wedding.id),
    supabase
      .from("vendor_inquiries")
      .select("vendor_id, vendor_name, category, status")
      .eq("wedding_id", wedding.id),
  ]);

  const venueIds = (venueFavoriteRows ?? []).map((r) => r.venue_id);
  const { data: venueDetails } = venueIds.length
    ? await supabase.from("venues").select("id, name").in("id", venueIds)
    : { data: [] };
  const venueNameById = new Map((venueDetails ?? []).map((v) => [v.id, v.name]));

  const venues: VenueContact[] = (venueFavoriteRows ?? []).map((favorite) => ({
    id: favorite.venue_id,
    name: venueNameById.get(favorite.venue_id) ?? "Unknown venue",
    email: favorite.contact_email,
    phone: favorite.contact_phone,
    notes: favorite.notes,
  }));

  const vendorIds = Array.from(
    new Set(
      [
        ...(vendorFavoriteRows ?? []).map((r) => r.vendor_id),
        ...(inquiryRows ?? []).map((r) => r.vendor_id).filter((id): id is string => Boolean(id)),
      ],
    ),
  );
  const { data: vendorDetails } = vendorIds.length
    ? await supabase.from("vendors").select("id, name, category, contact_email").in("id", vendorIds)
    : { data: [] };
  const vendorDetailById = new Map((vendorDetails ?? []).map((v) => [v.id, v]));
  const favoriteByVendorId = new Map((vendorFavoriteRows ?? []).map((f) => [f.vendor_id, f]));
  const inquiryByVendorId = new Map((inquiryRows ?? []).map((i) => [i.vendor_id, i]));

  const vendors: VendorContact[] = vendorIds.map((vendorId) => {
    const detail = vendorDetailById.get(vendorId);
    const favorite = favoriteByVendorId.get(vendorId);
    const inquiry = inquiryByVendorId.get(vendorId);
    return {
      id: vendorId,
      name: detail?.name ?? inquiry?.vendor_name ?? "Unknown vendor",
      category: detail?.category ?? inquiry?.category ?? null,
      email: detail?.contact_email ?? null,
      phone: favorite?.contact_phone ?? null,
      notes: favorite?.notes ?? null,
      isFavorited: Boolean(favorite),
      inquiryStatus: inquiry?.status ?? null,
    };
  });

  for (const inquiry of inquiryRows ?? []) {
    if (inquiry.vendor_id) continue;
    vendors.push({
      id: `manual-${inquiry.vendor_name}`,
      name: inquiry.vendor_name,
      category: inquiry.category,
      email: null,
      phone: null,
      notes: null,
      isFavorited: false,
      inquiryStatus: inquiry.status,
    });
  }

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-16">
      <AppNav email={user.email ?? ""} maxWidthClassName="max-w-3xl" />
      <div className="w-full max-w-3xl">
        <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
          Contacts
        </p>
        <h1 className="mt-2 mb-2 font-display text-3xl font-semibold text-forest">
          Everyone you need to reach
        </h1>
        <p className="mb-6 text-sm text-ink/70">
          Favorited venues and vendors, plus anyone you&apos;ve sent an inquiry to, all in one
          place. Looking for guests instead? Head to{" "}
          <Link href="/guests" className="text-brass hover:underline">
            Guests
          </Link>
          .
        </p>

        <ContactsManager venues={venues} vendors={vendors} />
      </div>
    </main>
  );
}
