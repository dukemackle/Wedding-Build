import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/app-nav";
import { PageShell } from "@/components/page-shell";
import { BUDGET_CATEGORIES, VENDOR_CATEGORY_TO_BUDGET_KEY } from "@/lib/budget-categories";
import { CATEGORY_ICONS } from "@/app/budget/budget-table";
import { ContractsPanel } from "@/app/budget/contracts-panel";
import type {
  BudgetContract,
  VendorInquiryStatus,
  Wedding,
} from "@/lib/supabase/types";
import { VendorRow, VenueRow, type VendorContact, type VenueContact } from "./contact-rows";
import { UnfiledContracts } from "./unfiled-contracts";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const BUDGET_KEY_TO_BROWSE_HREF: Record<string, string> = {
  venue: "/venues",
  attire: "/attire",
  ...Object.fromEntries(Object.values(VENDOR_CATEGORY_TO_BUDGET_KEY).map((key) => [key, "/vendors"])),
};

type LineItemRow = {
  category: string;
  override_value: number | null;
  purchased_from: string | null;
  vendor_id: string | null;
  venue_id: string | null;
};

type VendorDetail = { id: string; name: string; category: string | null; contact_email: string | null };
type VenueDetail = { id: string; name: string; city: string | null; state: string | null };

type Booking = {
  key: string;
  label: string;
  /** Null when there's a contract for this category but no name on the budget line yet. */
  name: string | null;
  place: string | null;
  price: number | null;
  email: string | null;
  phone: string | null;
  contracts: BudgetContract[];
};

const sectionClass = "rounded-lg border border-hairline bg-card p-5 shadow-sm";
const sectionHeadingClass =
  "font-mono-numbers text-[11px] uppercase tracking-[0.18em] text-ink/50";

function BookingCard({ booking }: { booking: Booking }) {
  const Icon = CATEGORY_ICONS[booking.key];
  return (
    <div className="flex flex-col rounded-lg border border-forest/30 bg-card p-5 shadow-sm">
      <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-ink/50">
        {Icon && <Icon className="h-3.5 w-3.5 text-brass" />}
        {booking.label}
      </p>
      {booking.name ? (
        <p className="mt-1 font-display text-xl font-semibold text-forest">{booking.name}</p>
      ) : (
        <p className="mt-1 text-sm text-ink/60">
          Contract on file.{" "}
          <Link href="/budget" className="text-brass hover:underline">
            Add who you booked on the budget
          </Link>
          .
        </p>
      )}
      {(booking.place || booking.price != null) && (
        <p className="mt-0.5 text-sm text-ink/60">
          {[booking.place, booking.price != null ? currency.format(booking.price) : null]
            .filter(Boolean)
            .join(" · ")}
        </p>
      )}
      {(booking.email || booking.phone) && (
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm">
          {booking.email && (
            <a href={`mailto:${booking.email}`} className="text-brass hover:underline">
              {booking.email}
            </a>
          )}
          {booking.phone && (
            <a href={`tel:${booking.phone}`} className="text-brass hover:underline">
              {booking.phone}
            </a>
          )}
        </div>
      )}
      <div className="mt-auto">
        <ContractsPanel rowKey={booking.key} isCustom={false} contracts={booking.contracts} />
      </div>
    </div>
  );
}

export default async function BookingsPage() {
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
            Bookings
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-forest">
            Set up your wedding first
          </h1>
          <p className="mt-4 text-ink/70">
            Add your wedding details on the Dashboard, then come back here as you book things.
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
    { data: lineItems },
    { data: contractRows },
    { data: venueFavoriteRows },
    { data: vendorFavoriteRows },
    { data: inquiryRows },
  ] = await Promise.all([
    supabase
      .from("budget_line_items")
      .select("category, override_value, purchased_from, vendor_id, venue_id")
      .eq("wedding_id", wedding.id)
      .returns<LineItemRow[]>(),
    supabase
      .from("budget_contracts")
      .select("*")
      .eq("wedding_id", wedding.id)
      .order("created_at", { ascending: true })
      .returns<BudgetContract[]>(),
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
      .eq("wedding_id", wedding.id)
      .returns<
        {
          vendor_id: string | null;
          vendor_name: string;
          category: string | null;
          status: VendorInquiryStatus;
        }[]
      >(),
  ]);

  const vendorIds = Array.from(
    new Set(
      [
        ...(lineItems ?? []).map((r) => r.vendor_id),
        ...(vendorFavoriteRows ?? []).map((r) => r.vendor_id),
        ...(inquiryRows ?? []).map((r) => r.vendor_id),
      ].filter((id): id is string => Boolean(id)),
    ),
  );
  const venueIds = Array.from(
    new Set(
      [
        wedding.venue_id,
        ...(lineItems ?? []).map((r) => r.venue_id),
        ...(venueFavoriteRows ?? []).map((r) => r.venue_id),
      ].filter((id): id is string => Boolean(id)),
    ),
  );

  const [{ data: vendorDetails }, { data: venueDetails }] = await Promise.all([
    vendorIds.length
      ? supabase
          .from("vendors")
          .select("id, name, category, contact_email")
          .in("id", vendorIds)
          .returns<VendorDetail[]>()
      : Promise.resolve({ data: [] as VendorDetail[] }),
    venueIds.length
      ? supabase
          .from("venues")
          .select("id, name, city, state")
          .in("id", venueIds)
          .returns<VenueDetail[]>()
      : Promise.resolve({ data: [] as VenueDetail[] }),
  ]);

  const vendorById = new Map((vendorDetails ?? []).map((v) => [v.id, v]));
  const venueById = new Map((venueDetails ?? []).map((v) => [v.id, v]));
  const vendorFavoriteById = new Map((vendorFavoriteRows ?? []).map((f) => [f.vendor_id, f]));
  const venueFavoriteById = new Map((venueFavoriteRows ?? []).map((f) => [f.venue_id, f]));
  const lineItemByCategory = new Map((lineItems ?? []).map((row) => [row.category, row]));

  // An inquiry marked booked counts even if the budget line was never filled in.
  const bookedInquiryByKey = new Map<string, { vendor_id: string | null; vendor_name: string }>();
  for (const inquiry of inquiryRows ?? []) {
    const key = inquiry.category ? VENDOR_CATEGORY_TO_BUDGET_KEY[inquiry.category] : undefined;
    if (inquiry.status === "booked" && key && !bookedInquiryByKey.has(key)) {
      bookedInquiryByKey.set(key, inquiry);
    }
  }

  const contractsByCategory = new Map<string, BudgetContract[]>();
  const unfiled: BudgetContract[] = [];
  for (const contract of contractRows ?? []) {
    if (contract.category) {
      contractsByCategory.set(contract.category, [
        ...(contractsByCategory.get(contract.category) ?? []),
        contract,
      ]);
    } else if (!contract.custom_item_id) {
      unfiled.push(contract);
    }
  }

  const hidden = new Set(wedding.hidden_budget_categories ?? []);
  const bookings: Booking[] = [];
  const stillNeed: { key: string; label: string }[] = [];
  const bookedVendorIds = new Set<string>();
  const bookedVenueIds = new Set<string>();

  for (const category of BUDGET_CATEGORIES) {
    const line = lineItemByCategory.get(category.key);
    const inquiry = bookedInquiryByKey.get(category.key);
    const contracts = contractsByCategory.get(category.key) ?? [];

    const venueId =
      line?.venue_id ?? (category.key === "venue" ? wedding.venue_id : null) ?? null;
    const vendorId = line?.vendor_id ?? inquiry?.vendor_id ?? null;
    const venue = venueId ? venueById.get(venueId) : undefined;
    const vendor = vendorId ? vendorById.get(vendorId) : undefined;
    const name =
      line?.purchased_from?.trim() || vendor?.name || venue?.name || inquiry?.vendor_name || null;

    // Booked = a name on the budget line (on Wren or not), a linked venue or
    // vendor, a booked inquiry -- or a contract, which nobody signs for fun.
    if (!name && contracts.length === 0) {
      if (!hidden.has(category.key)) stillNeed.push(category);
      continue;
    }

    if (vendorId) bookedVendorIds.add(vendorId);
    if (venueId) bookedVenueIds.add(venueId);
    const venueFavorite = venueId ? venueFavoriteById.get(venueId) : undefined;

    bookings.push({
      key: category.key,
      label: category.label,
      name,
      place: venue ? [venue.city, venue.state].filter(Boolean).join(", ") || null : null,
      price: line?.override_value ?? null,
      email: vendor?.contact_email ?? venueFavorite?.contact_email ?? null,
      phone:
        (vendorId ? vendorFavoriteById.get(vendorId)?.contact_phone : null) ??
        venueFavorite?.contact_phone ??
        null,
      contracts,
    });
  }

  // Everyone still being talked to: favorites and inquiries not already booked.
  const venueContacts: VenueContact[] = (venueFavoriteRows ?? [])
    .filter((f) => !bookedVenueIds.has(f.venue_id))
    .map((f) => ({
      id: f.venue_id,
      name: venueById.get(f.venue_id)?.name ?? "Unknown venue",
      email: f.contact_email,
      phone: f.contact_phone,
      notes: f.notes,
    }));

  const inquiryByVendorId = new Map(
    (inquiryRows ?? []).filter((i) => i.vendor_id).map((i) => [i.vendor_id as string, i]),
  );
  const vendorContacts: VendorContact[] = vendorIds
    .filter((id) => !bookedVendorIds.has(id))
    .filter((id) => vendorFavoriteById.has(id) || inquiryByVendorId.has(id))
    .map((id) => {
      const detail = vendorById.get(id);
      const favorite = vendorFavoriteById.get(id);
      const inquiry = inquiryByVendorId.get(id);
      return {
        id,
        name: detail?.name ?? inquiry?.vendor_name ?? "Unknown vendor",
        category: detail?.category ?? inquiry?.category ?? null,
        email: detail?.contact_email ?? null,
        phone: favorite?.contact_phone ?? null,
        notes: favorite?.notes ?? null,
        isFavorited: Boolean(favorite),
        inquiryStatus: inquiry?.status ?? null,
      };
    });
  const bookedNames = new Set(bookings.map((b) => b.name));
  for (const inquiry of inquiryRows ?? []) {
    if (inquiry.vendor_id || bookedNames.has(inquiry.vendor_name)) continue;
    vendorContacts.push({
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

  const tracked = bookings.length + stillNeed.length;

  return (
    <PageShell email={user.email ?? ""} width="wide">
      <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
        Wedding Plan
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-forest">Bookings</h1>
      <p className="mt-2 text-sm text-ink/70">
        Who you&apos;ve booked, who you&apos;re still talking to, and every contract.{" "}
        <span className="font-mono-numbers text-ink">
          {bookings.length} of {tracked} booked
        </span>
      </p>

      {/* Phone: one column, booked first. Desktop: booked vendors take the
          wide column, and the lists you work through sit beside them. */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <section>
          <h2 className="font-display text-2xl font-semibold text-forest">Booked</h2>
          {bookings.length === 0 ? (
            <div className={`mt-3 ${sectionClass}`}>
              <p className="text-sm text-ink/60">
                Nothing booked yet. When you book someone, add their name to that line on the{" "}
                <Link href="/budget" className="text-brass hover:underline">
                  budget
                </Link>{" "}
                and they&apos;ll show up here, whether you found them on Wren or not.
              </p>
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
              {bookings.map((booking) => (
                <BookingCard key={booking.key} booking={booking} />
              ))}
            </div>
          )}
        </section>

        <aside className="flex flex-col gap-6">
          {unfiled.length > 0 && (
            <section className={sectionClass}>
              <h2 className={sectionHeadingClass}>Unfiled contracts</h2>
              <p className="mt-1 text-sm text-ink/60">
                Uploaded on the checklist. Say what each is for and it moves to that booking and
                budget line.
              </p>
              <div className="mt-2">
                <UnfiledContracts
                  contracts={unfiled.map(({ id, file_name, created_at }) => ({
                    id,
                    file_name,
                    created_at,
                  }))}
                  categories={BUDGET_CATEGORIES.map(({ key, label }) => ({ key, label }))}
                />
              </div>
            </section>
          )}

          <section className={sectionClass}>
            <h2 className={sectionHeadingClass}>Still need</h2>
            {stillNeed.length === 0 ? (
              <p className="mt-2 text-sm text-ink/60">Everything you&apos;re tracking is booked.</p>
            ) : (
              <ul className="mt-2">
                {stillNeed.map((category) => {
                  const Icon = CATEGORY_ICONS[category.key];
                  const href = BUDGET_KEY_TO_BROWSE_HREF[category.key];
                  return (
                    <li
                      key={category.key}
                      className="flex items-center justify-between gap-2 border-b border-hairline py-2 text-sm last:border-b-0"
                    >
                      <span className="flex items-center gap-1.5 text-ink/80">
                        {Icon && <Icon className="h-3.5 w-3.5 text-ink/40" />}
                        {category.label}
                      </span>
                      {href && (
                        <Link href={href} className="shrink-0 text-xs text-brass hover:underline">
                          Browse &rarr;
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className={sectionClass}>
            <h2 className={sectionHeadingClass}>Still talking to</h2>
            {venueContacts.length + vendorContacts.length === 0 ? (
              <p className="mt-2 text-sm text-ink/60">
                Favorite a venue or vendor, or send an inquiry, and they&apos;ll show up here.
              </p>
            ) : (
              <div className="mt-1">
                {venueContacts.map((venue) => (
                  <VenueRow key={venue.id} contact={venue} />
                ))}
                {vendorContacts.map((vendor) => (
                  <VendorRow key={vendor.id} contact={vendor} />
                ))}
              </div>
            )}
          </section>
        </aside>
      </div>
    </PageShell>
  );
}
