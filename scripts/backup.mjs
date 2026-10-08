#!/usr/bin/env node
// Weekly backup: dumps every table in Supabase's public schema, plus the auth
// users and a list of the files in Storage, into one gzipped JSON file. The
// "Weekly backup" routine runs this and uploads the file to Google Drive.
// The schema itself lives in supabase/migrations, so only the rows are saved.
// Storage files are listed (name, size, date), not downloaded.
//
// Reads keys from the environment, then .env.local / .env if present:
//   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//   GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_DRIVE_FOLDER_ID   optional:
//     when all three are set, the file is also uploaded to that Drive folder
//     (a Shared Drive folder the service account is a member of; service
//     accounts have no storage of their own) and only the newest KEEP backups
//     there are kept.
//
// Usage: node scripts/backup.mjs [--out <dir>]   (default: ./backups)
// Prints one JSON summary line: file, bytes, and row counts per table.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createSign } from "node:crypto";
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
const KEEP = 12;
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
const drive = await uploadToDrive(file.split("/").pop(), gz);

console.log(
  JSON.stringify({
    file,
    bytes: gz.length,
    drive,
    tables: Object.fromEntries(Object.entries(tables).map(([t, rows]) => [t, rows.length])),
    auth_users: users.length,
    storage_files: Object.fromEntries(Object.entries(storage).map(([b, f]) => [b, f.length])),
  }),
);

// Service-account sign-in: a self-signed JWT swapped for an access token.
async function googleToken(email, privateKey) {
  const b64 = (v) => Buffer.from(JSON.stringify(v)).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({
    iss: email,
    scope: "https://www.googleapis.com/auth/drive",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  })}`;
  const sig = createSign("RSA-SHA256").update(unsigned).sign(privateKey, "base64url");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${sig}` }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`Google sign-in failed: ${res.status} ${JSON.stringify(body).slice(0, 200)}`);
  return body.access_token;
}

async function uploadToDrive(name, data) {
  const { GOOGLE_CLIENT_EMAIL: email, GOOGLE_PRIVATE_KEY: rawKey, GOOGLE_DRIVE_FOLDER_ID: folder } = process.env;
  if (!email || !rawKey || !folder) return "skipped (Google keys not set)";
  const token = await googleToken(email, rawKey.replace(/\\n/g, "\n"));
  const auth = { Authorization: `Bearer ${token}` };
  const api = "https://www.googleapis.com/drive/v3/files";
  const all = "supportsAllDrives=true&includeItemsFromAllDrives=true";

  const boundary = `backup${Date.now()}`;
  const meta = JSON.stringify({ name, parents: [folder], mimeType: "application/gzip" });
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Type: application/json\r\n\r\n${meta}\r\n--${boundary}\r\nContent-Type: application/gzip\r\n\r\n`),
    data,
    Buffer.from(`\r\n--${boundary}--`),
  ]);
  const up = await fetch(`https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true`, {
    method: "POST",
    headers: { ...auth, "Content-Type": `multipart/related; boundary=${boundary}` },
    body,
  });
  if (!up.ok) throw new Error(`Drive upload failed: ${up.status} ${(await up.text()).slice(0, 300)}`);

  const q = encodeURIComponent(`'${folder}' in parents and name contains 'youdoido-backup-' and trashed = false`);
  const list = await (await fetch(`${api}?q=${q}&orderBy=createdTime desc&pageSize=100&fields=files(id,name)&${all}`, { headers: auth })).json();
  const old = (list.files ?? []).filter((f) => f.name.startsWith("youdoido-backup-")).slice(KEEP);
  for (const f of old) {
    await fetch(`${api}/${f.id}?supportsAllDrives=true`, {
      method: "PATCH",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({ trashed: true }),
    });
  }
  return `uploaded ${name}; trashed ${old.length} old`;
}
