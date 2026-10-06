import { revalidatePath } from "next/cache";
import { refuseBatchCaller } from "@/lib/batch-secret";
import { restamp, type FieldSources } from "@/lib/field-sources";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { rowSourceId } from "@/lib/venue-import";

// The database end of scripts/import-batches.mjs, which the batch routine
// runs. The script does the heavy part on the routine's own machine --
// parsing every batch file, geocoding, reading listings' websites for their
// addresses -- and this endpoint only reads listings and writes what the
// script worked out. Doing that work here ran Workers Free past its 10 ms of
// CPU per request (Cloudflare error 1102) and its 50 outbound requests.
//
//   GET  ?table=venues&from=0     a page of listings, for the script to match against
//   POST {"action":"insert", "table":"vendors", "rows":[...]}
//   POST {"action":"update", "table":"venues", "updates":[{"id":..., ...}]}
//   POST {"action":"refresh"}     re-render the pages that list them
//
// Same shared secret as /api/import-batches (BATCH_IMPORT_SECRET).

type Table = "venues" | "vendors";
const TABLES: readonly Table[] = ["venues", "vendors"];
const isTable = (value: unknown): value is Table => TABLES.includes(value as Table);

/** Listings per GET: Supabase's default row cap. */
const PAGE = 1000;
/** Rows per insert: one database request, kept small enough to stay quick. */
const MAX_INSERT = 100;
/** Updates per POST: one database request each, under Cloudflare's 50. */
const MAX_UPDATES = 40;

/** The only columns an update may set, so a bad payload can't touch anything else. */
const UPDATABLE = ["address", "city", "latitude", "longitude", "address_checked_at"] as const;

export async function GET(request: Request) {
  const refused = refuseBatchCaller(request);
  if (refused) return refused;
  const params = new URL(request.url).searchParams;
  const table = params.get("table");
  const from = Number(params.get("from") ?? 0);
  if (!isTable(table) || !Number.isInteger(from) || from < 0) {
    return Response.json({ error: "Needs ?table=venues|vendors and a whole-number from." }, { status: 400 });
  }
  const { data, error } = await createAdminSupabaseClient()
    .from(table)
    .select("id, name, source_id, website, city, state, address, latitude, longitude, address_checked_at")
    .order("id")
    .range(from, from + PAGE - 1);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  const rows = data ?? [];
  return Response.json({ rows, next: rows.length === PAGE ? from + rows.length : null });
}

export async function POST(request: Request) {
  const refused = refuseBatchCaller(request);
  if (refused) return refused;
  let body: { action?: unknown; table?: unknown; rows?: unknown; updates?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Body must be JSON." }, { status: 400 });
  }

  if (body.action === "refresh") {
    for (const path of ["/venues", "/vendors", "/admin/venues", "/admin/vendors"]) revalidatePath(path);
    return Response.json({ ok: true });
  }

  const table = body.table;
  if (!isTable(table)) return Response.json({ error: "table must be venues or vendors." }, { status: 400 });
  const admin = createAdminSupabaseClient();

  if (body.action === "insert") {
    const rows = body.rows;
    if (!Array.isArray(rows) || rows.length === 0 || rows.length > MAX_INSERT) {
      return Response.json({ error: `rows must hold 1-${MAX_INSERT} listings.` }, { status: 400 });
    }
    const { error } = await admin.from(table).insert(
      rows.map((row: Record<string, unknown>) => ({
        ...row,
        // As the "Add them" import stamps them: real listings, imported, keyed
        // by website so the same row is never added twice.
        is_sample: false,
        source: "import",
        source_id: rowSourceId(row),
        field_sources: restamp(null, row, "batch"),
      })),
    );
    if (error) {
      const message = error.code === "23505" ? "One of these is already listed (same website); nothing was added." : error.message;
      return Response.json({ error: message }, { status: error.code === "23505" ? 409 : 500 });
    }
    return Response.json({ inserted: rows.length });
  }

  if (body.action === "update") {
    const updates = body.updates;
    if (!Array.isArray(updates) || updates.length === 0 || updates.length > MAX_UPDATES) {
      return Response.json({ error: `updates must hold 1-${MAX_UPDATES} changes.` }, { status: 400 });
    }
    // An address arriving with address_checked_at was read off the listing's
    // own website; one without it was moved over from its batch row.
    const addressed = updates.filter((u: Record<string, unknown>) => typeof u.id === "string" && "address" in u);
    const current = new Map<string, Record<string, unknown> & { field_sources: FieldSources }>();
    if (addressed.length > 0) {
      const { data } = await admin
        .from(table)
        .select("id, address, city, field_sources")
        .in("id", addressed.map((u: Record<string, unknown>) => u.id as string));
      for (const row of data ?? []) current.set(row.id, row);
    }
    const errors = await Promise.all(
      updates.map(async (update: Record<string, unknown>) => {
        if (typeof update.id !== "string") return "Each update needs an id.";
        const values: Record<string, unknown> = Object.fromEntries(
          UPDATABLE.filter((key) => key in update).map((key) => [key, update[key]]),
        );
        if (Object.keys(values).length === 0) return null;
        if ("address" in values) {
          const { address, city } = values;
          values.field_sources = restamp(
            current.get(update.id) ?? null,
            { address, ...("city" in values ? { city } : {}) },
            "address_checked_at" in values ? "website" : "batch",
            { changedOnly: true },
          );
        }
        const { error } = await admin.from(table).update(values).eq("id", update.id);
        return error?.message ?? null;
      }),
    );
    const failed = errors.find(Boolean);
    if (failed) return Response.json({ error: failed }, { status: 500 });
    return Response.json({ updated: updates.length });
  }

  return Response.json({ error: "action must be insert, update or refresh." }, { status: 400 });
}
