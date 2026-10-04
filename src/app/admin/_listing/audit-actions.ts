"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { createClient } from "@/lib/supabase/server";

// Applies the fixes file /data-audit writes (.claude/skills/data-audit). The
// audit runs in a session with no database access, so it hands its results to
// the owner as a file and this applies them behind requireAdmin. That keeps
// the database key out of the sessions and lets the owner see what a run would
// change before it changes anything.

type Table = "venues" | "vendors";

/** A row in the file: `id` from an admin CSV export, else the importer's source_id. */
type Ref = { id?: string; sourceId?: string; name?: string };
type Update = Ref & { set?: Record<string, unknown>; reason?: string };
type Hide = Ref & { reason?: string };
type Section = { verify?: Ref[]; update?: Update[]; hide?: Hide[] };

// The only columns an audit may change. Anything else in `set` is refused
// rather than written, so a bad file can't rewrite names, prices or photos.
const EDITABLE = ["website", "contact_email", "contact_phone"] as const;

export type AuditPlan = {
  verify: number;
  update: { name: string; changes: string; reason: string }[];
  hide: { name: string; reason: string }[];
  /** Rows the file names that aren't in the database (e.g. batch rows not added yet). */
  unmatched: string[];
};

type Resolved = {
  verifyIds: string[];
  updates: { id: string; name: string; set: Record<string, string | null>; reason: string }[];
  hides: { id: string; name: string; reason: string }[];
  unmatched: string[];
};

function readSection(json: string, table: Table): { section?: Section; error?: string } {
  let file: unknown;
  try {
    file = JSON.parse(json);
  } catch {
    return { error: "That file isn't valid JSON. Use the data-audit-fixes.json the audit wrote." };
  }
  if (!file || typeof file !== "object" || (file as { kind?: string }).kind !== "data-audit-fixes") {
    return { error: "That isn't a data-audit fixes file." };
  }
  return { section: ((file as Record<string, unknown>)[table] as Section | undefined) ?? {} };
}

function chunks<T>(list: T[], size = 150): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

async function resolve(table: Table, section: Section): Promise<Resolved | { error: string }> {
  const refs = [...(section.verify ?? []), ...(section.update ?? []), ...(section.hide ?? [])];
  const ids = [...new Set(refs.map((r) => r.id).filter((v): v is string => !!v))];
  const sourceIds = [...new Set(refs.map((r) => r.sourceId).filter((v): v is string => !!v))];

  const admin = createAdminSupabaseClient();
  type Row = { id: string; source_id: string | null; name: string };
  const rows: Row[] = [];
  for (const part of chunks(ids)) {
    const { data, error } = await admin.from(table).select("id, source_id, name").in("id", part).returns<Row[]>();
    if (error) return { error: error.message };
    rows.push(...(data ?? []));
  }
  for (const part of chunks(sourceIds)) {
    const { data, error } = await admin.from(table).select("id, source_id, name").in("source_id", part).returns<Row[]>();
    if (error) return { error: error.message };
    rows.push(...(data ?? []));
  }
  const byId = new Map(rows.map((r) => [r.id, r]));
  const bySource = new Map(rows.filter((r) => r.source_id).map((r) => [r.source_id!, r]));

  const unmatched: string[] = [];
  const find = (ref: Ref) => {
    const row = (ref.id && byId.get(ref.id)) || (ref.sourceId && bySource.get(ref.sourceId)) || undefined;
    if (!row) unmatched.push(ref.name ?? ref.sourceId ?? ref.id ?? "unnamed row");
    return row;
  };

  const hides: Resolved["hides"] = [];
  for (const ref of section.hide ?? []) {
    const row = find(ref);
    if (row) hides.push({ id: row.id, name: row.name, reason: ref.reason ?? "" });
  }
  const hidden = new Set(hides.map((h) => h.id));

  const updates: Resolved["updates"] = [];
  for (const ref of section.update ?? []) {
    const row = find(ref);
    if (!row || hidden.has(row.id)) continue;
    const set: Record<string, string | null> = {};
    for (const [key, value] of Object.entries(ref.set ?? {})) {
      if (!(EDITABLE as readonly string[]).includes(key)) {
        return { error: `The file tries to change "${key}" on ${row.name}. An audit may only change ${EDITABLE.join(", ")}.` };
      }
      if (value !== null && typeof value !== "string") return { error: `Bad value for ${key} on ${row.name}.` };
      set[key] = value === "" ? null : value;
    }
    if (Object.keys(set).length > 0) updates.push({ id: row.id, name: row.name, set, reason: ref.reason ?? "" });
  }

  const verifyIds = new Set<string>();
  for (const ref of section.verify ?? []) {
    const row = find(ref);
    if (row && !hidden.has(row.id)) verifyIds.add(row.id);
  }
  // A fixed row was looked at and corrected, so it counts as checked too.
  for (const u of updates) verifyIds.add(u.id);

  return { verifyIds: [...verifyIds], updates, hides, unmatched };
}

/** What applying the file would do, without changing anything. */
export async function previewAudit(table: Table, json: string): Promise<{ plan?: AuditPlan; error?: string }> {
  await requireAdmin();
  const { section, error } = readSection(json, table);
  if (error || !section) return { error };
  const resolved = await resolve(table, section);
  if ("error" in resolved) return { error: resolved.error };
  return {
    plan: {
      verify: resolved.verifyIds.length,
      update: resolved.updates.map((u) => ({
        name: u.name,
        changes: Object.entries(u.set)
          .map(([k, v]) => `${k.replace("contact_", "")} → ${v ?? "(blank)"}`)
          .join(", "),
        reason: u.reason,
      })),
      hide: resolved.hides.map((h) => ({ name: h.name, reason: h.reason })),
      unmatched: resolved.unmatched,
    },
  };
}

/** Applies the file: hides, then edits, then stamps "Last checked" on the rows it checked. */
export async function applyAudit(table: Table, json: string): Promise<{ error?: string }> {
  await requireAdmin();
  const { section, error } = readSection(json, table);
  if (error || !section) return { error };
  const resolved = await resolve(table, section);
  if ("error" in resolved) return { error: resolved.error };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Says the audit checked it, not the owner, so the two stay distinguishable.
  const verifiedBy = `data audit (applied by ${user?.email ?? "admin"})`;
  const admin = createAdminSupabaseClient();

  // Hidden, never deleted: a delete cascades away couples' shortlists, and the
  // batch importer would offer the row again.
  for (const part of chunks(resolved.hides.map((h) => h.id))) {
    const { error } = await admin.from(table).update({ active: false }).in("id", part);
    if (error) return { error: error.message };
  }
  // One request per distinct change, not per row: a Worker invocation may make
  // only 50 subrequests, and an audit that blanks 50 emails would hit it.
  const groups = new Map<string, { set: Record<string, string | null>; ids: string[] }>();
  for (const u of resolved.updates) {
    const key = JSON.stringify(Object.entries(u.set).sort());
    const group = groups.get(key) ?? { set: u.set, ids: [] };
    group.ids.push(u.id);
    groups.set(key, group);
  }
  for (const { set, ids } of groups.values()) {
    for (const part of chunks(ids)) {
      const { error } = await admin.from(table).update(set).in("id", part);
      if (error) return { error: error.message };
    }
  }
  const now = new Date().toISOString();
  for (const part of chunks(resolved.verifyIds)) {
    const { error } = await admin
      .from(table)
      .update({ last_verified_at: now, verified_by: verifiedBy })
      .in("id", part);
    if (error) return { error: error.message };
  }

  revalidatePath(`/admin/${table}`);
  revalidatePath(`/${table}`);
  return {};
}
