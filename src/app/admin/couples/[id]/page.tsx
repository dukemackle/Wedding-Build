import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import type {
  BudgetCustomItem,
  ChecklistItem,
  Guest,
  ItineraryEvent,
  VendorInquiry,
  VenueShortlistEntry,
  Wedding,
} from "@/lib/supabase/types";

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatCurrency(value: number) {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-hairline bg-card p-4">
      <p className="font-mono-numbers text-2xl font-semibold text-forest">{value}</p>
      <p className="mt-1 text-xs text-ink/60">{label}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8 w-full rounded-lg border border-hairline bg-card p-6 shadow-sm">
      <p className="mb-3 text-sm font-medium text-ink">{title}</p>
      {children}
    </div>
  );
}

export default async function AdminCoupleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminSupabaseClient();

  const { data: wedding } = await admin
    .from("weddings")
    .select("*")
    .eq("id", id)
    .maybeSingle<Wedding>();

  if (!wedding) notFound();

  const [
    { data: userData },
    { data: guests },
    { data: budgetLineItems },
    { data: budgetCustomItems },
    { data: itineraryEvents },
    { data: vendorInquiries },
    { data: venueShortlist },
    { data: checklistItems },
  ] = await Promise.all([
    admin.auth.admin.getUserById(wedding.user_id),
    admin
      .from("guests")
      .select("*")
      .eq("wedding_id", id)
      .order("name")
      .returns<Guest[]>(),
    admin
      .from("budget_line_items")
      .select("category, override_value")
      .eq("wedding_id", id)
      .returns<{ category: string; override_value: number | null }[]>(),
    admin
      .from("budget_custom_items")
      .select("*")
      .eq("wedding_id", id)
      .returns<BudgetCustomItem[]>(),
    admin
      .from("itinerary_events")
      .select("*")
      .eq("wedding_id", id)
      .order("event_date")
      .returns<ItineraryEvent[]>(),
    admin
      .from("vendor_inquiries")
      .select("*")
      .eq("wedding_id", id)
      .order("sent_at", { ascending: false })
      .returns<VendorInquiry[]>(),
    admin
      .from("venue_shortlist")
      .select("*")
      .eq("wedding_id", id)
      .returns<VenueShortlistEntry[]>(),
    admin
      .from("checklist_items")
      .select("*")
      .eq("wedding_id", id)
      .returns<ChecklistItem[]>(),
  ]);

  const names = [wedding.partner_a_name, wedding.partner_b_name].filter(Boolean).join(" & ");
  const confirmedGuests = (guests ?? []).filter((g) => g.status === "confirmed").length;
  const budgetTotal =
    (budgetLineItems ?? []).reduce((sum, row) => sum + (row.override_value ?? 0), 0) +
    (budgetCustomItems ?? []).reduce((sum, item) => sum + item.amount, 0);
  const completedChecklist = (checklistItems ?? []).filter((c) => c.completed).length;

  return (
    <div>
      <Link
        href="/admin/couples"
        className="font-mono-numbers text-sm text-brass hover:underline"
      >
        &larr; Back to couples
      </Link>
      <p className="mt-4 font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
        Admin
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-forest">{names || "—"}</h1>
      <p className="mt-1 text-sm text-ink/70">
        {userData?.user?.email ?? "No email on file"} · Wedding on{" "}
        {formatDate(wedding.wedding_date)} · Signed up {formatDate(wedding.created_at)}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="Guests confirmed" value={`${confirmedGuests} / ${(guests ?? []).length}`} />
        <StatTile label="Budget tracked" value={formatCurrency(budgetTotal)} />
        <StatTile label="Checklist done" value={`${completedChecklist} / ${(checklistItems ?? []).length}`} />
        <StatTile label="Vendor inquiries" value={(vendorInquiries ?? []).length} />
      </div>

      <Section title="Wedding details">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-xs text-ink/50">Region</dt>
            <dd className="text-ink">{wedding.region ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink/50">Season</dt>
            <dd className="text-ink">{wedding.season ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink/50">Style</dt>
            <dd className="text-ink">{wedding.style_tier ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink/50">Venue type</dt>
            <dd className="text-ink">{wedding.venue_type ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink/50">Referral code</dt>
            <dd className="font-mono-numbers text-ink">{wedding.referral_code ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink/50">Public page</dt>
            <dd className="text-ink">
              {wedding.public_slug ? (
                <a
                  href={`/w/${wedding.public_slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brass hover:underline"
                >
                  /w/{wedding.public_slug}
                </a>
              ) : (
                "—"
              )}
            </dd>
          </div>
        </dl>
      </Section>

      <Section title={`Guests (${(guests ?? []).length})`}>
        {(guests ?? []).length === 0 ? (
          <p className="text-sm text-ink/50">No guests added yet.</p>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-hairline text-xs uppercase tracking-wide text-ink/50">
                  <th className="py-2 pr-4 font-medium">Name</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 pr-4 font-medium">Priority</th>
                  <th className="py-2 font-medium">Meal</th>
                </tr>
              </thead>
              <tbody>
                {(guests ?? []).map((guest) => (
                  <tr key={guest.id} className="border-b border-hairline last:border-b-0">
                    <td className="py-2 pr-4 text-ink">
                      {guest.name}
                      {guest.plus_one && (
                        <span className="ml-1 text-xs text-ink/50">+1</span>
                      )}
                    </td>
                    <td className="py-2 pr-4 text-ink/70">{guest.status}</td>
                    <td className="py-2 pr-4 text-ink/70">{guest.priority}</td>
                    <td className="py-2 text-ink/70">{guest.meal ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section title={`Itinerary (${(itineraryEvents ?? []).length})`}>
        {(itineraryEvents ?? []).length === 0 ? (
          <p className="text-sm text-ink/50">No itinerary events yet.</p>
        ) : (
          <ul className="flex flex-col gap-2 text-sm">
            {(itineraryEvents ?? []).map((event) => (
              <li key={event.id} className="flex items-baseline gap-3">
                <span className="w-24 shrink-0 font-mono-numbers text-xs text-ink/50">
                  {formatDate(event.event_date)}
                </span>
                <span className="text-ink">{event.title}</span>
                {event.location && (
                  <span className="text-xs text-ink/50">· {event.location}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title={`Vendor inquiries (${(vendorInquiries ?? []).length})`}>
        {(vendorInquiries ?? []).length === 0 ? (
          <p className="text-sm text-ink/50">No vendors contacted yet.</p>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-hairline text-xs uppercase tracking-wide text-ink/50">
                  <th className="py-2 pr-4 font-medium">Vendor</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 pr-4 font-medium">Sent</th>
                  <th className="py-2 font-medium">Booked amount</th>
                </tr>
              </thead>
              <tbody>
                {(vendorInquiries ?? []).map((inquiry) => (
                  <tr key={inquiry.id} className="border-b border-hairline last:border-b-0">
                    <td className="py-2 pr-4 text-ink">{inquiry.vendor_name}</td>
                    <td className="py-2 pr-4 text-ink/70">{inquiry.status}</td>
                    <td className="py-2 pr-4 text-ink/70">{formatDate(inquiry.sent_at)}</td>
                    <td className="py-2 text-ink/70">
                      {inquiry.booked_amount != null ? formatCurrency(inquiry.booked_amount) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section title={`Venue shortlist (${(venueShortlist ?? []).length})`}>
        {(venueShortlist ?? []).length === 0 ? (
          <p className="text-sm text-ink/50">No venues shortlisted yet.</p>
        ) : (
          <p className="text-sm text-ink/70">
            {(venueShortlist ?? []).length} venue{(venueShortlist ?? []).length === 1 ? "" : "s"}{" "}
            shortlisted.
          </p>
        )}
      </Section>
    </div>
  );
}
