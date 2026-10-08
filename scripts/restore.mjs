#!/usr/bin/env node
// Puts a backup made by scripts/backup.mjs back into a Supabase project:
// auth users, every table's rows, Storage buckets and files. Then it counts
// what landed against the backup and prints the differences.
//
// Built for the restore drill (a scratch project) and for a real disaster
// (a fresh project). It writes only to the RESTORE_* project and refuses to
// touch the live one (NEXT_PUBLIC_SUPABASE_URL) unless --allow-production.
//
//   RESTORE_SUPABASE_URL, RESTORE_SUPABASE_SERVICE_ROLE_KEY   the target
//   SUPABASE_ACCESS_TOKEN   personal token (supabase.com/dashboard/account/tokens);
//     needed for --apply-migrations and --reset, which run SQL through
//     Supabase's Management API (the database port isn't reachable from here),
//     and to move id sequences past the restored rows.
//
// Usage: node scripts/restore.mjs --data <youdoido-backup-*.json.gz>
//          [--files <dir>]          Storage files (default: <data's folder>/files)
//          [--apply-migrations]     run supabase/migrations/*.sql first (empty project)
//          [--reset]                wipe the target first (scratch projects only)
//          [--allow-production]
//
// Passwords can't be restored: the auth admin API never returns them. Restored
// users get a random password and sign in again with "Forgot password".

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { randomBytes } from "node:crypto";
import { gunzipSync } from "node:zlib";

for (const file of [".env.local", ".env"]) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const arg = (name) => {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : undefined;
};
const flag = (name) => process.argv.includes(name);
const fail = (msg) => {
  console.error(msg);
  process.exit(1);
};

const URL_BASE = process.env.RESTORE_SUPABASE_URL?.replace(/\/$/, "");
const KEY = process.env.RESTORE_SUPABASE_SERVICE_ROLE_KEY;
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const DATA = arg("--data");
if (!URL_BASE || !KEY) fail("Missing RESTORE_SUPABASE_URL or RESTORE_SUPABASE_SERVICE_ROLE_KEY.");
if (!DATA) fail("Pass --data <youdoido-backup-*.json.gz>.");
const live = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
if (URL_BASE === live && !flag("--allow-production")) fail(`Refusing to restore into the live project (${live}).`);
if (flag("--reset") && URL_BASE === live) fail("--reset never runs against the live project.");
if ((flag("--apply-migrations") || flag("--reset")) && !TOKEN) fail("--apply-migrations and --reset need SUPABASE_ACCESS_TOKEN.");

const FILES_DIR = arg("--files") ?? join(dirname(DATA), "files");
const REF = new URL(URL_BASE).hostname.split(".")[0];
const CHUNK = 500;
const headers = { apikey: KEY, Authorization: `Bearer ${KEY}` };
const backup = JSON.parse(gunzipSync(readFileSync(DATA)));
const problems = [];
const notes = [];

async function api(path, init = {}) {
  return fetch(`${URL_BASE}${path}`, { ...init, headers: { ...headers, ...init.headers } });
}

async function sql(query) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${text.slice(0, 400)}`);
  return text ? JSON.parse(text) : null;
}

// ---- 1. Optional wipe and schema -------------------------------------------

if (flag("--reset")) {
  for (const b of (await (await api("/storage/v1/bucket")).json()) ?? []) {
    await api(`/storage/v1/bucket/${b.id}/empty`, { method: "POST" });
    await api(`/storage/v1/bucket/${b.id}`, { method: "DELETE" });
  }
  await sql(`
    drop schema if exists public cascade;
    create schema public;
    grant usage on schema public to postgres, anon, authenticated, service_role;
    grant all on schema public to postgres, service_role;
    alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;
    alter default privileges in schema public grant all on functions to postgres, anon, authenticated, service_role;
    alter default privileges in schema public grant all on sequences to postgres, anon, authenticated, service_role;
    delete from auth.users;
  `);
  console.error("reset: wiped public schema, auth users and buckets");
}

if (flag("--apply-migrations")) {
  const dir = new URL("../supabase/migrations/", import.meta.url).pathname;
  for (const name of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
    try {
      await sql(readFileSync(join(dir, name), "utf8"));
    } catch (e) {
      fail(`Migration ${name} failed: ${e.message}`);
    }
  }
  await sql(`notify pgrst, 'reload schema';`);
  await new Promise((r) => setTimeout(r, 3000));
  console.error("migrations: applied");
}

// ---- 2. Auth users ---------------------------------------------------------

let usersRestored = 0;
for (const u of backup.auth_users ?? []) {
  const res = await api("/auth/v1/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: u.id,
      email: u.email || undefined,
      phone: u.phone || undefined,
      email_confirm: Boolean(u.email_confirmed_at),
      phone_confirm: Boolean(u.phone_confirmed_at),
      user_metadata: u.user_metadata ?? {},
      app_metadata: u.app_metadata ?? {},
      password: randomBytes(24).toString("base64url"),
    }),
  });
  if (res.ok) usersRestored++;
  else {
    const text = await res.text();
    if (!/already|exists|registered/i.test(text)) problems.push(`user ${u.id}: ${res.status} ${text.slice(0, 150)}`);
  }
}

// ---- 3. Tables -------------------------------------------------------------

// Primary keys decide between upsert (safe to re-run) and plain insert.
const spec = await (await api("/rest/v1/", { headers: { Accept: "application/openapi+json" } })).json();
const hasPk = (table) =>
  Object.values(spec.definitions?.[table]?.properties ?? {}).some((p) => /<pk\/>/.test(p.description ?? ""));

async function insert(table, rows) {
  const res = await api(`/rest/v1/${encodeURIComponent(table)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: `${hasPk(table) ? "resolution=merge-duplicates," : ""}return=minimal`,
    },
    body: JSON.stringify(rows),
  });
  if (res.ok) return null;
  const body = await res.json().catch(() => ({}));
  return { code: body.code, message: body.message ?? `${res.status}` };
}

// Tables are loaded in passes. A chunk that trips a foreign key (23503) is
// retried row by row, and rows still waiting on a parent go to the next pass,
// so the order works itself out without reading the schema.
let pending = Object.entries(backup.tables).filter(([, rows]) => rows.length).map(([t, rows]) => [t, rows]);
const restoredRows = {};
for (let pass = 1; pending.length && pass <= 10; pass++) {
  const next = [];
  let progress = 0;
  for (const [table, rows] of pending) {
    const waiting = [];
    for (let i = 0; i < rows.length; i += CHUNK) {
      const chunk = rows.slice(i, i + CHUNK);
      const err = await insert(table, chunk);
      if (!err) {
        progress += chunk.length;
        restoredRows[table] = (restoredRows[table] ?? 0) + chunk.length;
        continue;
      }
      if (err.code !== "23503") {
        problems.push(`${table}: ${err.code ?? ""} ${err.message}`.slice(0, 300));
        break;
      }
      for (const row of chunk) {
        const rowErr = await insert(table, [row]);
        if (!rowErr) {
          progress++;
          restoredRows[table] = (restoredRows[table] ?? 0) + 1;
        } else if (rowErr.code === "23503") waiting.push(row);
        else problems.push(`${table} row: ${rowErr.code ?? ""} ${rowErr.message}`.slice(0, 300));
      }
    }
    if (waiting.length) next.push([table, waiting]);
  }
  pending = next;
  if (!progress) break;
}
for (const [table, rows] of pending) problems.push(`${table}: ${rows.length} rows still missing a parent row`);

// Rows came back with their ids, so id sequences must move past them or the
// next insert collides.
if (TOKEN) {
  await sql(`
    do $$ declare r record; begin
      for r in
        select s.relname as seq, t.relname as tbl, a.attname as col
        from pg_class s
        join pg_depend d on d.objid = s.oid and d.deptype in ('a', 'i')
        join pg_class t on t.oid = d.refobjid
        join pg_attribute a on a.attrelid = t.oid and a.attnum = d.refobjsubid
        join pg_namespace n on n.oid = t.relnamespace
        where s.relkind = 'S' and n.nspname = 'public'
      loop
        execute format('select setval(%L, coalesce((select max(%I) from public.%I), 0) + 1, false)',
          'public.' || r.seq, r.col, r.tbl);
      end loop;
    end $$;`);
} else notes.push("id sequences not moved (no SUPABASE_ACCESS_TOKEN): fine for uuid ids, check any serial ones");

// ---- 4. Storage ------------------------------------------------------------

const buckets = backup.buckets ?? Object.keys(backup.storage ?? {}).map((id) => ({ id, name: id, public: false }));
for (const b of buckets) {
  const res = await api("/storage/v1/bucket", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(b),
  });
  if (!res.ok && res.status !== 409 && !/exists/i.test(await res.text())) problems.push(`bucket ${b.id}: ${res.status}`);
}
let filesRestored = 0;
const filesExpected = Object.values(backup.storage ?? {}).reduce((n, f) => n + f.length, 0);
for (const [bucket, files] of Object.entries(backup.storage ?? {})) {
  for (const f of files) {
    const local = join(FILES_DIR, bucket, f.path);
    if (!existsSync(local)) {
      problems.push(`file missing from backup folder: ${relative(".", local)}`);
      continue;
    }
    const res = await api(`/storage/v1/object/${bucket}/${f.path.split("/").map(encodeURIComponent).join("/")}`, {
      method: "POST",
      headers: { "Content-Type": f.mimetype ?? "application/octet-stream", "x-upsert": "true" },
      body: readFileSync(local),
    });
    if (res.ok) filesRestored++;
    else problems.push(`file ${bucket}/${f.path}: ${res.status} ${(await res.text()).slice(0, 150)}`);
  }
}

// ---- 5. Check what landed --------------------------------------------------

const mismatches = {};
for (const [table, rows] of Object.entries(backup.tables)) {
  const res = await api(`/rest/v1/${encodeURIComponent(table)}?select=*`, {
    method: "HEAD",
    headers: { Prefer: "count=exact", Range: "0-0" },
  });
  const count = Number(res.headers.get("content-range")?.split("/")[1] ?? NaN);
  if (count !== rows.length) mismatches[table] = { backup: rows.length, restored: Number.isNaN(count) ? "missing table" : count };
}

console.log(
  JSON.stringify({
    target: URL_BASE,
    from: backup.createdAt,
    tables: Object.keys(backup.tables).length,
    rows: Object.values(restoredRows).reduce((a, b) => a + b, 0),
    mismatches,
    users: `${usersRestored} created of ${backup.auth_users?.length ?? 0}`,
    files: `${filesRestored} of ${filesExpected}`,
    problems,
    notes,
  }),
);
process.exit(Object.keys(mismatches).length || problems.length ? 2 : 0);
