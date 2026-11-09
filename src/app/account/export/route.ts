import { createClient } from "@/lib/supabase/server";
import { logError } from "@/lib/error-log";

// "Download my data" on /account: everything the couple has put into their
// wedding, as one JSON file. Read through the couple's own session, so row
// security decides what's included and nobody else's data can come along.
// Photos and contracts are listed by their links; the files themselves stay
// in storage. Promised by docs/retention.md and the Privacy Policy (R6).

/** Tables keyed by wedding_id that hold the couple's own planning data. */
const WEDDING_TABLES = [
  "guests",
  "guest_event_invites",
  "guest_notes",
  "rsvp_submissions",
  "budget_line_items",
  "budget_custom_items",
  "budget_contracts",
  "checklist_items",
  "itinerary_events",
  "seating_tables",
  "venue_rooms",
  "venue_layout_items",
  "layout_phases",
  "venue_shortlist",
  "vendor_favorites",
  "venue_inquiries",
  "vendor_inquiries",
  "registry_items",
  "registry_gifts",
  "registry_claims",
  "attire_shortlist",
  "attire_party_members",
  "wedding_preferences",
  "wedding_members",
  "wedding_invites",
  "wedding_faqs",
  "wedding_accommodations",
  "wedding_gallery_photos",
  "wedding_photo_credits",
  "guest_posts",
  "contact_submissions",
  "site_blocks",
  "site_designs",
  "save_the_dates",
  "invitations",
  "sheet_links",
  "assistant_conversations",
] as const;

const PAGE = 1000;

type Supabase = Awaited<ReturnType<typeof createClient>>;

async function allRows(supabase: Supabase, table: string, weddingId: string) {
  const rows: unknown[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("wedding_id", weddingId)
      .range(from, from + PAGE - 1);
    // A table this account can't read (or one not in this database yet) is
    // left out rather than failing the whole download.
    if (error) return null;
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE) return rows;
  }
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Please sign in first.", { status: 401 });

  try {
    const { data: wedding } = await supabase
      .from("weddings")
      .select("*")
      .or(`user_id.eq.${user.id},member_ids.cs.{${user.id}}`)
      .maybeSingle<{ id: string }>();

    const tables: Record<string, unknown[]> = {};
    if (wedding) {
      const results = await Promise.all(WEDDING_TABLES.map((t) => allRows(supabase, t, wedding.id)));
      WEDDING_TABLES.forEach((t, i) => {
        const rows = results[i];
        if (rows && rows.length) tables[t] = rows;
      });
    }

    const body = JSON.stringify(
      {
        exported_at: new Date().toISOString(),
        from: "You Do, I Do (youdoido.com)",
        account: { email: user.email, created_at: user.created_at },
        wedding: wedding ?? null,
        ...tables,
      },
      null,
      2,
    );

    const date = new Date().toISOString().slice(0, 10);
    return new Response(body, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="youdoido-data-${date}.json"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    await logError("app", "/account/export", error);
    return new Response("We couldn't build your download just now. Please try again in a minute.", { status: 500 });
  }
}
