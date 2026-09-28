import "server-only";
import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import type { createAdminSupabaseClient } from "@/lib/supabase/admin-client";

/**
 * Read-only tools for Ask Wren on /admin.
 *
 * The admin client bypasses RLS, so what the model can see is decided here and
 * nowhere else: a fixed list of tables, and per table the columns it may read.
 * Contact details (emails, phones), invite/share tokens, guest names, and the
 * messages couples send vendors are deliberately left out -- none of them are
 * needed to answer "how is the business doing", and a column that isn't listed
 * can't be selected, filtered or grouped on.
 *
 * There is no write path: the only builder calls are select + filters.
 */

const TABLES = {
  weddings: {
    about: "One row per couple. created_at is the sign-up date. Test couples are already excluded.",
    columns: [
      "id", "partner_a_name", "partner_b_name", "wedding_date", "region", "state", "season",
      "style_tier", "venue_type", "guest_count_override", "budget_target", "venue_id",
      "public_slug", "itinerary_published", "referral_code", "created_at", "updated_at",
    ],
  },
  guests: {
    about: "Couples' guest lists, counts only -- no names. Use count_by wedding_id or status.",
    columns: ["wedding_id", "status", "plus_one", "side", "guest_type", "created_at"],
  },
  venues: {
    about: "Venue listings. photo_urls is an array (use is_empty to find ones with no photos). is_sample marks demo rows.",
    columns: [
      "id", "name", "city", "state", "region", "venue_type", "setting", "capacity", "price_tier",
      "price_from", "service_level", "photo_urls", "image_url", "website", "active", "is_sample",
      "source", "last_verified_at", "created_at",
    ],
  },
  vendors: {
    about: "Vendor listings. photo_urls is an array (use is_empty to find ones with no photos). is_sample marks demo rows.",
    columns: [
      "id", "name", "category", "city", "state", "region", "service_area", "price_tier",
      "price_from", "price_unit", "photo_urls", "image_url", "website", "active", "is_sample",
      "source", "last_verified_at", "created_at",
    ],
  },
  vendor_inquiries: {
    about: "A couple contacting a vendor. status: sent | responded | booked | declined. Test couples excluded.",
    columns: [
      "id", "wedding_id", "vendor_id", "vendor_name", "category", "status", "sent_at",
      "last_followed_up_at", "booked_amount", "referral_code",
    ],
  },
  venue_inquiries: {
    about: "A couple contacting a venue. status: sent | responded. Test couples excluded.",
    columns: ["id", "wedding_id", "venue_id", "venue_name", "status", "sent_at", "referral_code"],
  },
  venue_submissions: {
    about: "A business claiming a venue listing. status: pending | approved | rejected.",
    columns: ["id", "venue_id", "status", "submitter_role", "created_at", "reviewed_at"],
  },
  vendor_submissions: {
    about: "A business claiming a vendor listing. status: pending | approved | rejected.",
    columns: ["id", "vendor_id", "status", "submitter_role", "created_at", "reviewed_at"],
  },
  feedback_submissions: {
    about: "Feedback couples send from the app. category: bug | idea | other. status: new | read | resolved.",
    columns: ["id", "wedding_id", "category", "message", "status", "created_at"],
  },
} as const;

type TableName = keyof typeof TABLES;
const TABLE_NAMES = Object.keys(TABLES) as [TableName, ...TableName[]];

/** Tables whose rows belong to a couple, so test couples get filtered out. */
const WEDDING_SCOPED: Partial<Record<TableName, true>> = {
  guests: true,
  vendor_inquiries: true,
  venue_inquiries: true,
  feedback_submissions: true,
};

const MAX_ROWS = 300;
/** count_by reads just one column, so it can cover far more rows. */
const MAX_COUNT_ROWS = 20000;
const PAGE = 1000;
const MAX_CELL_CHARS = 300;

const filterSchema = z.object({
  column: z.string(),
  op: z.enum(["eq", "neq", "gt", "gte", "lt", "lte", "ilike", "is_null", "not_null", "is_empty", "not_empty", "in"]),
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]).optional(),
});

const querySchema = z.object({
  table: z.enum(TABLE_NAMES),
  columns: z.array(z.string()).optional(),
  filters: z.array(filterSchema).optional(),
  count_by: z.string().optional(),
  order_by: z.string().optional(),
  descending: z.boolean().optional(),
  limit: z.number().int().positive().optional(),
});

type Query = z.infer<typeof querySchema>;
type Filter = z.infer<typeof filterSchema>;
type Admin = ReturnType<typeof createAdminSupabaseClient>;

/** One lookup, shown to the admin above the answer. */
export type Lookup = { table: string; rows: number };

export type AdminToolContext = { admin: Admin; testWeddingIds: string[]; lookups: Lookup[] };

function describeTables() {
  return Object.entries(TABLES)
    .map(([name, t]) => `- ${name}: ${t.about}\n  columns: ${t.columns.join(", ")}`)
    .join("\n");
}

function cell(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.length === 0 ? "[]" : `[${value.length} items]`;
  const text = typeof value === "object" ? JSON.stringify(value) : String(value);
  const flat = text.replace(/\s+/g, " ");
  return flat.length > MAX_CELL_CHARS ? `${flat.slice(0, MAX_CELL_CHARS)}…` : flat;
}

function checkColumns(table: TableName, cols: (string | undefined)[]): string | null {
  const allowed: readonly string[] = TABLES[table].columns;
  const bad = cols.filter((c): c is string => Boolean(c) && !allowed.includes(c as string));
  return bad.length ? `Not a readable column on ${table}: ${bad.join(", ")}. Readable: ${allowed.join(", ")}.` : null;
}

// The builder's generic types don't survive being threaded through a loop, so
// this works on the loosely typed shape; every column was checked above.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyFilters(q: any, table: TableName, filters: Filter[], testWeddingIds: string[]) {
  for (const f of filters) {
    const v = f.value;
    switch (f.op) {
      case "is_null": q = q.is(f.column, null); break;
      case "not_null": q = q.not(f.column, "is", null); break;
      case "is_empty": q = q.eq(f.column, "{}"); break;
      case "not_empty": q = q.neq(f.column, "{}"); break;
      case "in": q = q.in(f.column, Array.isArray(v) ? v : [v]); break;
      case "ilike": q = q.ilike(f.column, String(v ?? "")); break;
      default: q = q[f.op](f.column, v);
    }
  }
  if (table === "weddings") q = q.eq("is_test", false);
  if (WEDDING_SCOPED[table] && testWeddingIds.length) {
    const list = `(${testWeddingIds.join(",")})`;
    // Feedback can have no wedding; keep those rather than dropping them.
    q = table === "feedback_submissions"
      ? q.or(`wedding_id.is.null,wedding_id.not.in.${list}`)
      : q.not("wedding_id", "in", list);
  }
  return q;
}

async function runQuery(ctx: AdminToolContext, input: Query): Promise<string> {
  const { table } = input;
  const filters = input.filters ?? [];
  const bad = checkColumns(table, [
    ...(input.columns ?? []),
    ...filters.map((f) => f.column),
    input.count_by,
    input.order_by,
  ]);
  if (bad) return bad;
  for (const f of filters) {
    const needsValue = !["is_null", "not_null", "is_empty", "not_empty"].includes(f.op);
    if (needsValue && f.value === undefined) return `Filter on ${f.column} (${f.op}) needs a value.`;
  }

  if (input.count_by) {
    const col = input.count_by;
    const counts = new Map<string, number>();
    let seen = 0;
    for (let from = 0; from < MAX_COUNT_ROWS; from += PAGE) {
      const q = applyFilters(ctx.admin.from(table).select(col), table, filters, ctx.testWeddingIds);
      const { data, error } = await q.range(from, from + PAGE - 1);
      if (error) return `Query failed: ${error.message}`;
      for (const row of (data ?? []) as Record<string, unknown>[]) {
        const key = cell(row[col]) || "(empty)";
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
      seen += data?.length ?? 0;
      if ((data?.length ?? 0) < PAGE) break;
    }
    ctx.lookups.push({ table, rows: seen });
    if (seen === 0) return `No ${table} rows match.`;
    const lines = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} | ${n}`);
    return [`${seen} rows, counted by ${col}:`, `${col} | count`, ...lines].join("\n");
  }

  const cols = input.columns?.length ? input.columns : [...TABLES[table].columns];
  const limit = Math.min(input.limit ?? 50, MAX_ROWS);
  let q = applyFilters(
    ctx.admin.from(table).select(cols.join(","), { count: "exact" }),
    table,
    filters,
    ctx.testWeddingIds,
  );
  if (input.order_by) q = q.order(input.order_by, { ascending: !input.descending });
  const { data, count, error } = await q.limit(limit);
  if (error) return `Query failed: ${error.message}`;

  const rows = (data ?? []) as Record<string, unknown>[];
  const total = count ?? rows.length;
  ctx.lookups.push({ table, rows: total });
  if (rows.length === 0) return `No ${table} rows match.`;
  const header = total > rows.length ? `${total} rows match; showing ${rows.length}.` : `${total} rows.`;
  return [header, cols.join(" | "), ...rows.map((r) => cols.map((c) => cell(r[c])).join(" | "))].join("\n");
}

export function buildAdminTools(ctx: AdminToolContext) {
  return [
    betaZodTool({
      name: "query",
      description: `Read rows from the You Do, I Do database. Read-only.

Tables:
${describeTables()}

Filters are ANDed. ops: eq, neq, gt, gte, lt, lte (numbers or ISO dates), ilike (use % wildcards), in (array), is_null, not_null, is_empty / not_empty (array columns such as photo_urls).
Every result starts with the total number of matching rows, even when only some are shown.
Set count_by to a column to get a count per value instead of rows -- use it for "how many by X" questions. Up to ${MAX_ROWS} rows otherwise (default 50).`,
      inputSchema: querySchema,
      run: (input) => runQuery(ctx, input),
    }),
  ];
}
