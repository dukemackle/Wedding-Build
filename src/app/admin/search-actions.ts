"use server";

import { requireAdmin } from "@/lib/admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";

export type SearchHit = { href: string; title: string; detail?: string };
export type SearchGroup = { label: string; hits: SearchHit[] };

const PER_GROUP = 5;

// Characters that mean something inside a PostgREST `or(...)` string. Stripped
// rather than escaped, same as the listing search.
function clean(q: string) {
  return q.replace(/[,()*%\\:"]/g, " ").trim();
}

function place(city: string | null, state: string | null) {
  return [city, state].filter(Boolean).join(", ");
}

/**
 * The admin-wide search: couples, venues, vendors, claims and feedback in one
 * box. Each group links to the page that already manages that thing -- venues
 * and vendors open their list pre-filtered, so editing stays where it lives.
 */
export async function adminSearch(raw: string): Promise<SearchGroup[]> {
  await requireAdmin();
  const term = clean(raw);
  if (term.length < 2) return [];

  const admin = createAdminSupabaseClient();
  const like = `%${term}%`;
  const lower = term.toLowerCase();

  const [weddings, users, venues, vendors, venueClaims, vendorClaims, feedback] = await Promise.all([
    admin
      .from("weddings")
      .select("id, user_id, partner_a_name, partner_b_name, venue_name, wedding_date")
      .returns<
        {
          id: string;
          user_id: string;
          partner_a_name: string | null;
          partner_b_name: string | null;
          venue_name: string | null;
          wedding_date: string | null;
        }[]
      >(),
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin
      .from("venues")
      .select("id, name, city, state")
      .or(`name.ilike.${like},city.ilike.${like},contact_email.ilike.${like}`)
      .order("name")
      .limit(PER_GROUP)
      .returns<{ id: string; name: string; city: string | null; state: string | null }[]>(),
    admin
      .from("vendors")
      .select("id, name, category, city, state")
      .or(`name.ilike.${like},city.ilike.${like},contact_email.ilike.${like}`)
      .order("name")
      .limit(PER_GROUP)
      .returns<
        { id: string; name: string; category: string | null; city: string | null; state: string | null }[]
      >(),
    admin
      .from("venue_submissions")
      .select("id, submitter_name, submitter_email, status, venues(name)")
      .or(`submitter_name.ilike.${like},submitter_email.ilike.${like}`)
      .order("created_at", { ascending: false })
      .limit(PER_GROUP)
      .returns<
        { id: string; submitter_name: string; submitter_email: string; status: string; venues: { name: string } | null }[]
      >(),
    admin
      .from("vendor_submissions")
      .select("id, submitter_name, submitter_email, status, vendors(name)")
      .or(`submitter_name.ilike.${like},submitter_email.ilike.${like}`)
      .order("created_at", { ascending: false })
      .limit(PER_GROUP)
      .returns<
        { id: string; submitter_name: string; submitter_email: string; status: string; vendors: { name: string } | null }[]
      >(),
    admin
      .from("feedback_submissions")
      .select("id, category, message")
      .ilike("message", like)
      .order("created_at", { ascending: false })
      .limit(PER_GROUP)
      .returns<{ id: string; category: string; message: string }[]>(),
  ]);

  // Couples match on either name, their venue, or the account email. There are
  // few enough weddings pre-launch to filter here rather than join auth.users.
  const emailByUser = new Map(
    (users.data?.users ?? []).filter((u) => u.email).map((u) => [u.id, u.email as string]),
  );
  const couples: SearchHit[] = (weddings.data ?? [])
    .filter((w) =>
      [w.partner_a_name, w.partner_b_name, w.venue_name, emailByUser.get(w.user_id)].some((v) =>
        v?.toLowerCase().includes(lower),
      ),
    )
    .slice(0, PER_GROUP)
    .map((w) => ({
      href: `/admin/couples/${w.id}`,
      title: [w.partner_a_name, w.partner_b_name].filter(Boolean).join(" & ") || "Untitled wedding",
      detail: [emailByUser.get(w.user_id), w.wedding_date].filter(Boolean).join(" · "),
    }));

  const groups: SearchGroup[] = [
    { label: "Couples", hits: couples },
    {
      label: "Venues",
      hits: (venues.data ?? []).map((v) => ({
        href: `/admin/venues?q=${encodeURIComponent(v.name)}`,
        title: v.name,
        detail: place(v.city, v.state),
      })),
    },
    {
      label: "Vendors",
      hits: (vendors.data ?? []).map((v) => ({
        href: `/admin/vendors?q=${encodeURIComponent(v.name)}`,
        title: v.name,
        detail: [v.category, place(v.city, v.state)].filter(Boolean).join(" · "),
      })),
    },
    {
      label: "Claims",
      hits: [
        ...(venueClaims.data ?? []).map((c) => ({
          href: "/admin/venues/claims",
          title: c.submitter_name,
          detail: `${c.venues?.name ?? "Venue"} · ${c.status}`,
        })),
        ...(vendorClaims.data ?? []).map((c) => ({
          href: "/admin/vendors/claims",
          title: c.submitter_name,
          detail: `${c.vendors?.name ?? "Vendor"} · ${c.status}`,
        })),
      ].slice(0, PER_GROUP),
    },
    {
      label: "Feedback",
      hits: (feedback.data ?? []).map((f) => ({
        href: "/admin/feedback",
        title: f.message.length > 70 ? `${f.message.slice(0, 70)}…` : f.message,
        detail: f.category,
      })),
    },
  ];

  return groups.filter((g) => g.hits.length > 0);
}
