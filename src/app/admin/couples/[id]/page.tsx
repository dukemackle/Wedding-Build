import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import type {
  AdminCoupleNotes,
  BudgetCustomItem,
  ChecklistItem,
  Guest,
  ItineraryEvent,
  VendorInquiry,
  VenueShortlistEntry,
  Wedding,
} from "@/lib/supabase/types";
import { NotesEditor } from "./notes-editor";

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
    { data: adminNotes },
    { data: guests },
    { data: budgetLineItems },
    { data: budgetCustomItems },
    { data: itineraryEvents },
    { data: vendorInquiries },
    { data: venueShortlist },
    { data: checklistItems },
    { data: venueInquiries },
    { data: contracts },
    { data: rsvps },
    { data: guestPosts },
    { count: galleryCount },
    { count: registryCount },
    { count: partyCount },
    { count: layoutCount },
  ] = await Promise.all([
    admin.auth.admin.getUserById(wedding.user_id),
    admin
      .from("admin_couple_notes")
      .select("*")
      .eq("wedding_id", id)
      .maybeSingle<AdminCoupleNotes>(),
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
    admin
      .from("venue_inquiries")
      .select("id, venue_name, status, sent_at")
      .eq("wedding_id", id)
      .order("sent_at", { ascending: false })
      .returns<{ id: string; venue_name: string; status: string; sent_at: string }[]>(),
    admin
      .from("budget_contracts")
      .select("id, category, file_name, created_at")
      .eq("wedding_id", id)
      .order("created_at", { ascending: false })
      .returns<{ id: string; category: string | null; file_name: string; created_at: string }[]>(),
    admin
      .from("rsvp_submissions")
      .select("status")
      .eq("wedding_id", id)
      .returns<{ status: string }[]>(),
    admin
      .from("guest_posts")
      .select("status")
      .eq("wedding_id", id)
      .returns<{ status: string }[]>(),
    admin
      .from("wedding_gallery_photos")
      .select("id", { count: "exact", head: true })
      .eq("wedding_id", id),
    admin.from("registry_items").select("id", { count: "exact", head: true }).eq("wedding_id", id),
    admin
      .from("attire_party_members")
      .select("id", { count: "exact", head: true })
      .eq("wedding_id", id),
    admin
      .from("venue_layout_items")
      .select("id", { count: "exact", head: true })
      .eq("wedding_id", id),
  ]);

  const names = [wedding.partner_a_name, wedding.partner_b_name].filter(Boolean).join(" & ");
  const confirmedGuests = (guests ?? []).filter((g) => g.status === "confirmed").length;
  const budgetTotal =
    (budgetLineItems ?? []).reduce((sum, row) => sum + (row.override_value ?? 0), 0) +
    (budgetCustomItems ?? []).reduce((sum, item) => sum + item.amount, 0);
  const completedChecklist = (checklistItems ?? []).filter((c) => c.completed).length;
  const bookedVendors = (vendorInquiries ?? []).filter((i) => i.status === "booked");
  const rsvpYes = (rsvps ?? []).filter((r) => r.status === "confirmed").length;
  const postsByStatus = (status: string) =>
    (guestPosts ?? []).filter((p) => p.status === status).length;

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

      <Section title="Admin notes">
        <NotesEditor
          weddingId={wedding.id}
          notes={adminNotes?.notes ?? null}
          tags={adminNotes?.tags ?? []}
        />
      </Section>

      <Section title="Wedding details">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-xs text-ink/50">State</dt>
            <dd className="text-ink">{wedding.state ?? "—"}</dd>
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
            <dt className="text-xs text-ink/50">Partner joined</dt>
            <dd className="text-ink">{wedding.partner_user_id ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink/50">Budget target</dt>
            <dd className="text-ink">
              {wedding.budget_target != null ? formatCurrency(wedding.budget_target) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-ink/50">Wedding party</dt>
            <dd className="text-ink">{partyCount ?? 0}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink/50">Venue layout items</dt>
            <dd className="text-ink">{layoutCount ?? 0}</dd>
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

      <Section title="Bookings">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs text-ink/50">Vendors booked</dt>
            <dd className="text-ink">
              {bookedVendors.length}
              {bookedVendors.length > 0 &&
                ` · ${formatCurrency(bookedVendors.reduce((sum, i) => sum + (i.booked_amount ?? 0), 0))}`}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-ink/50">Venue on file</dt>
            <dd className="text-ink">{wedding.venue_id ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink/50">Contracts uploaded</dt>
            <dd className="text-ink">{(contracts ?? []).length}</dd>
          </div>
        </dl>
        {(contracts ?? []).length > 0 && (
          <ul className="mt-4 flex flex-col gap-1 text-sm">
            {(contracts ?? []).map((c) => (
              <li key={c.id} className="flex items-baseline gap-3">
                <span className="w-24 shrink-0 font-mono-numbers text-xs text-ink/50">
                  {formatDate(c.created_at)}
                </span>
                <span className="text-ink">{c.file_name}</span>
                {c.category && <span className="text-xs text-ink/50">· {c.category}</span>}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Guest site">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs text-ink/50">Published</dt>
            <dd className="text-ink">{wedding.public_slug ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink/50">Itinerary public</dt>
            <dd className="text-ink">{wedding.itinerary_published ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink/50">Site RSVPs</dt>
            <dd className="text-ink">
              {(rsvps ?? []).length === 0
                ? "0"
                : `${rsvpYes} yes · ${(rsvps ?? []).length - rsvpYes} no`}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-ink/50">Gallery photos</dt>
            <dd className="text-ink">{galleryCount ?? 0}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink/50">Photo-wall posts</dt>
            <dd className="text-ink">
              {postsByStatus("approved")} shown · {postsByStatus("pending")} pending ·{" "}
              {postsByStatus("hidden")} hidden
            </dd>
          </div>
          <div>
            <dt className="text-xs text-ink/50">Registry links</dt>
            <dd className="text-ink">{registryCount ?? 0}</dd>
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

      <Section title={`Venues (${(venueShortlist ?? []).length} shortlisted · ${(venueInquiries ?? []).length} contacted)`}>
        {(venueInquiries ?? []).length === 0 ? (
          <p className="text-sm text-ink/50">No venues contacted yet.</p>
        ) : (
          <ul className="flex flex-col gap-2 text-sm">
            {(venueInquiries ?? []).map((inquiry) => (
              <li key={inquiry.id} className="flex items-baseline gap-3">
                <span className="w-24 shrink-0 font-mono-numbers text-xs text-ink/50">
                  {formatDate(inquiry.sent_at)}
                </span>
                <span className="text-ink">{inquiry.venue_name}</span>
                <span className="text-xs text-ink/50">· {inquiry.status}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}
