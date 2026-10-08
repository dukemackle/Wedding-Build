#!/usr/bin/env node
// Weekly backup: dumps every table in Supabase's public schema, plus the auth
// users and a list of the files in Storage, into one gzipped JSON file. The
// "Weekly backup" routine runs this and uploads the file to Google Drive.
// The schema itself lives in supabase/migrations, so only the rows are saved.
// Storage files are listed (name, size, date), not downloaded.
//
// Reads keys from the environment, then .env.local / .env if present:
//   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//
// Usage: node scripts/backup.mjs [--out <dir>]   (default: ./backups)
// Prints one JSON summary line: file, bytes, and row counts per table.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

for (const file of [".env.local", ".env"]) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_BASE || !KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const outIdx = process.argv.indexOf("--out");
const OUT_DIR = outIdx > -1 ? process.argv[outIdx + 1] : "backups";
const PAGE = 1000;
const headers = { apikey: KEY, Authorization: `Bearer ${KEY}` };

async function getJson(url, init = {}) {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, { ...init, headers: { ...headers, ...init.headers } });
    const text = await res.text();
    if (res.ok) return text ? JSON.parse(text) : null;
    if (attempt >= 3 || res.status < 500) throw new Error(`${res.status} ${url}: ${text.slice(0, 200)}`);
    await new Promise((r) => setTimeout(r, 2000 * attempt));
  }
}

// PostgREST's root describes every table and view it exposes; views are
// skipped by keeping only definitions that also have a POST (insert) path.
async function listTables() {
  const spec = await getJson(`${URL_BASE}/rest/v1/`, { headers: { Accept: "application/openapi+json" } });
  return Object.entries(spec.paths ?? {})
    .filter(([path, ops]) => path !== "/" && !path.startsWith("/rpc/") && ops.post)
    .map(([path]) => path.slice(1))
    .sort();
}

async function dumpTable(table) {
  const rows = [];
  for (let from = 0; ; from += PAGE) {
    const page = await getJson(`${URL_BASE}/rest/v1/${encodeURIComponent(table)}?select=*`, {
      headers: { Range: `${from}-${from + PAGE - 1}`, "Range-Unit": "items" },
    });
    rows.push(...page);
    if (page.length < PAGE) return rows;
  }
}

async function dumpUsers() {
  const users = [];
  for (let page = 1; ; page++) {
    const res = await getJson(`${URL_BASE}/auth/v1/admin/users?page=${page}&per_page=${PAGE}`);
    users.push(...res.users);
    if (res.users.length < PAGE) return users;
  }
}

async function listFiles(bucket, prefix = "") {
  const files = [];
  for (let offset = 0; ; offset += PAGE) {
    const items = await getJson(`${URL_BASE}/storage/v1/object/list/${bucket}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prefix, limit: PAGE, offset }),
    });
    for (const item of items) {
      const path = prefix ? `${prefix}/${item.name}` : item.name;
      // Folders come back with no id; walk into them.
      if (item.id === null) files.push(...(await listFiles(bucket, path)));
      else files.push({ path, size: item.metadata?.size ?? null, updated_at: item.updated_at });
    }
    if (items.length < PAGE) return files;
  }
}

const startedAt = new Date();
const tables = {};
for (const table of await listTables()) tables[table] = await dumpTable(table);
const users = await dumpUsers();
const storage = {};
for (const bucket of await getJson(`${URL_BASE}/storage/v1/bucket`)) {
  storage[bucket.name] = await listFiles(bucket.id);
}

const backup = { createdAt: startedAt.toISOString(), source: URL_BASE, tables, auth_users: users, storage };
const gz = gzipSync(JSON.stringify(backup));
mkdirSync(OUT_DIR, { recursive: true });
const file = join(OUT_DIR, `youdoido-backup-${startedAt.toISOString().slice(0, 10)}.json.gz`);
writeFileSync(file, gz);

console.log(
  JSON.stringify({
    file,
    bytes: gz.length,
    tables: Object.fromEntries(Object.entries(tables).map(([t, rows]) => [t, rows.length])),
    auth_users: users.length,
    storage_files: Object.fromEntries(Object.entries(storage).map(([b, f]) => [b, f.length])),
  }),
);
