"use server";

import { requireAdmin } from "@/lib/admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";

export type SearchHit = { href: string; title: string; detail?: string; keywords?: string };
export type SearchGroup = { label: string; hits: SearchHit[] };

const PER_GROUP = 5;

// Characters that mean something inside a PostgREST `or(...)` string. Stripped
// rather than escaped, same as the listing search.
function clean(q: string) {
  return q.replace(/[,()*%\\:"]/g, " ").trim();
}

// One `or(...)` per word: PostgREST ANDs repeated filters, so every word must
// land in at least one of the columns. "austin photo" then finds a
// photographer in Austin, which one phrase match across a single column can't.
function eachWord(words: string[], columns: string[]) {
  return words.map((w) => columns.map((c) => `${c}.ilike.%${w}%`).join(","));
}

function matchesAll(words: string[], fields: (string | null | undefined)[]) {
  const hay = fields.filter(Boolean).join(" ").toLowerCase();
  return words.every((w) => hay.includes(w));
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
  const words = term.toLowerCase().split(/\s+/).filter(Boolean);

  // Built up a filter at a time, since the number of words varies.
  let venueQuery = admin.from("venues").select("id, name, city, state");
  for (const f of eachWord(words, ["name", "city", "state", "region", "venue_type", "contact_email"])) {
    venueQuery = venueQuery.or(f);
  }
  let vendorQuery = admin.from("vendors").select("id, name, category, city, state");
  for (const f of eachWord(words, ["name", "category", "city", "state", "region", "contact_email"])) {
    vendorQuery = vendorQuery.or(f);
  }
  let attireQuery = admin.from("attire_items").select("id, name, category, designer");
  for (const f of eachWord(words, ["name", "category", "designer", "style"])) {
    attireQuery = attireQuery.or(f);
  }
  let costQuery = admin.from("regional_cost_data").select("id, state, category_key");
  for (const f of eachWord(words, ["state", "category_key", "source", "notes"])) {
    costQuery = costQuery.or(f);
  }

  const [weddings, users, venues, vendors, venueClaims, vendorClaims, feedback, attire, costs] = await Promise.all([
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
    venueQuery
      .order("name")
      .limit(PER_GROUP)
      .returns<{ id: string; name: string; city: string | null; state: string | null }[]>(),
    vendorQuery
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
    attireQuery
      .order("name")
      .limit(PER_GROUP)
      .returns<{ id: string; name: string; category: string; designer: string | null }[]>(),
    costQuery
      .order("state")
      .limit(PER_GROUP)
      .returns<{ id: string; state: string; category_key: string }[]>(),
  ]);

  // Couples match on either name, their venue, or the account email. There are
  // few enough weddings pre-launch to filter here rather than join auth.users.
  const emailByUser = new Map(
    (users.data?.users ?? []).filter((u) => u.email).map((u) => [u.id, u.email as string]),
  );
  const couples: SearchHit[] = (weddings.data ?? [])
    .filter((w) =>
      matchesAll(words, [w.partner_a_name, w.partner_b_name, w.venue_name, emailByUser.get(w.user_id), w.wedding_date]),
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
    {
      label: "Attire",
      hits: (attire.data ?? []).map((a) => ({
        href: "/admin/attire",
        title: a.name,
        detail: [a.designer, a.category].filter(Boolean).join(" · "),
      })),
    },
    {
      label: "Cost data",
      hits: (costs.data ?? []).map((c) => ({
        href: "/admin/cost-data",
        title: `${c.state} · ${c.category_key}`,
      })),
    },
  ];

  return groups.filter((g) => g.hits.length > 0);
}
