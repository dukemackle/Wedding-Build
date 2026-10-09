#!/usr/bin/env node
// Weekly backup: dumps every table in Supabase's public schema, the auth users
// and the Storage bucket settings into one gzipped JSON file, and downloads
// every file in Storage (photos, contracts) into a folder beside it. The
// "Weekly backup" routine runs this, and copies both to the private
// youdoido-backups GitHub repo. scripts/restore.mjs puts a backup back.
// The schema itself lives in supabase/migrations, so only the rows are saved.
//
// Reads keys from the environment, then .env.local / .env if present:
//   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//   GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_DRIVE_FOLDER_ID   optional:
//     when all three are set, the data file is also uploaded to that Drive
//     folder (a Shared Drive folder the service account is a member of;
//     service accounts have no storage of their own), keeping the newest KEEP,
//     and Storage files are mirrored into its "files" subfolder.
//
// Usage: node scripts/backup.mjs [--out <dir>]   (default: ./backups)
// Writes <dir>/youdoido-backup-<date>.json.gz and <dir>/files/<bucket>/<path>.
// Prints one JSON summary line: file, bytes, drive, and counts.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
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

async function request(url, init = {}) {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, { ...init, headers: { ...headers, ...init.headers } });
    if (res.ok) return res;
    const text = await res.text();
    if (attempt >= 3 || res.status < 500) throw new Error(`${res.status} ${url}: ${text.slice(0, 200)}`);
    await new Promise((r) => setTimeout(r, 2000 * attempt));
  }
}

async function getJson(url, init) {
  const text = await (await request(url, init)).text();
  return text ? JSON.parse(text) : null;
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
      else
        files.push({
          path,
          size: item.metadata?.size ?? null,
          mimetype: item.metadata?.mimetype ?? null,
          updated_at: item.updated_at,
        });
    }
    if (items.length < PAGE) return files;
  }
}

const encodePath = (p) => p.split("/").map(encodeURIComponent).join("/");

const startedAt = new Date();
const tables = {};
for (const table of await listTables()) tables[table] = await dumpTable(table);
const users = await dumpUsers();

const buckets = (await getJson(`${URL_BASE}/storage/v1/bucket`)).map((b) => ({
  id: b.id,
  name: b.name,
  public: b.public,
  file_size_limit: b.file_size_limit ?? null,
  allowed_mime_types: b.allowed_mime_types ?? null,
}));
const storage = {};
const downloaded = []; // { bucket, path, mimetype, data }
let fileBytes = 0;
for (const bucket of buckets) {
  storage[bucket.id] = await listFiles(bucket.id);
  for (const f of storage[bucket.id]) {
    const res = await request(`${URL_BASE}/storage/v1/object/${bucket.id}/${encodePath(f.path)}`);
    const data = Buffer.from(await res.arrayBuffer());
    const dest = join(OUT_DIR, "files", bucket.id, f.path);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, data);
    downloaded.push({ bucket: bucket.id, path: f.path, mimetype: f.mimetype, data });
    fileBytes += data.length;
  }
}

const backup = { createdAt: startedAt.toISOString(), source: URL_BASE, tables, auth_users: users, buckets, storage };
const gz = gzipSync(JSON.stringify(backup));
mkdirSync(OUT_DIR, { recursive: true });
const file = join(OUT_DIR, `youdoido-backup-${startedAt.toISOString().slice(0, 10)}.json.gz`);
writeFileSync(file, gz);
// A failed upload is reported, not fatal: the files on disk can still go to
// the GitHub copy.
const drive = await uploadToDrive(file.split("/").pop(), gz, downloaded).catch((e) => `FAILED: ${e.message}`);

console.log(
  JSON.stringify({
    file,
    bytes: gz.length,
    drive,
    tables: Object.fromEntries(Object.entries(tables).map(([t, rows]) => [t, rows.length])),
    auth_users: users.length,
    storage_files: Object.fromEntries(Object.entries(storage).map(([b, f]) => [b, f.length])),
    storage_bytes: fileBytes,
  }),
);

// Pasting the key into a settings box tends to mangle it: literal "\n"s,
// lost line breaks, stray quotes or a trailing comma from the JSON. Keep only
// the base64 body between the markers and rebuild a clean PEM around it.
function toPem(raw) {
  const m = raw.replace(/\\n/g, "\n").match(/-----BEGIN PRIVATE KEY-----([\s\S]*?)-----END PRIVATE KEY-----/);
  if (!m) throw new Error(`GOOGLE_PRIVATE_KEY has no BEGIN/END PRIVATE KEY markers (${raw.length} chars); re-paste private_key from the JSON file.`);
  const body = m[1].replace(/[^A-Za-z0-9+/=]/g, "");
  return `-----BEGIN PRIVATE KEY-----\n${body.match(/.{1,64}/g).join("\n")}\n-----END PRIVATE KEY-----\n`;
}

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

async function uploadToDrive(name, data, files) {
  const { GOOGLE_CLIENT_EMAIL: email, GOOGLE_PRIVATE_KEY: rawKey, GOOGLE_DRIVE_FOLDER_ID: folder } = process.env;
  if (!email || !rawKey || !folder) return "skipped (Google keys not set)";
  const token = await googleToken(email.trim(), toPem(rawKey));
  const auth = { Authorization: `Bearer ${token}` };
  const api = "https://www.googleapis.com/drive/v3/files";
  const all = "supportsAllDrives=true&includeItemsFromAllDrives=true";

  async function drive(url, init = {}) {
    const res = await fetch(url, { ...init, headers: { ...auth, ...init.headers } });
    if (!res.ok) throw new Error(`Drive ${init.method ?? "GET"} failed: ${res.status} ${(await res.text()).slice(0, 300)}`);
    return res;
  }
  async function list(q) {
    const out = [];
    let pageToken = "";
    do {
      const url = `${api}?q=${encodeURIComponent(q)}&orderBy=createdTime desc&pageSize=1000&fields=nextPageToken,files(id,name,size)&${all}${pageToken ? `&pageToken=${pageToken}` : ""}`;
      const body = await (await drive(url)).json();
      out.push(...(body.files ?? []));
      pageToken = body.nextPageToken ?? "";
    } while (pageToken);
    return out;
  }
  // Resumable upload: one session per file, so files over 5 MB work too.
  async function upload(fileName, parent, mimeType, bytes) {
    const start = await drive(`https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true`, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8", "X-Upload-Content-Type": mimeType },
      body: JSON.stringify({ name: fileName, parents: [parent], mimeType }),
    });
    await drive(start.headers.get("location"), { method: "PUT", headers: { "Content-Type": mimeType }, body: bytes });
  }
  const trash = (id) =>
    drive(`${api}/${id}?supportsAllDrives=true`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trashed: true }),
    });

  await upload(name, folder, "application/gzip", data);
  const old = (await list(`'${folder}' in parents and name contains 'youdoido-backup-' and trashed = false`))
    .filter((f) => f.name.startsWith("youdoido-backup-"))
    .slice(KEEP);
  for (const f of old) await trash(f.id);

  // Storage files are mirrored, not versioned: a file is uploaded when its
  // name ("bucket/path") is new or its size changed. Nothing is removed, so a
  // file deleted from Storage stays recoverable here.
  let filesFolder = (await list(`'${folder}' in parents and name = 'files' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`))[0]?.id;
  if (!filesFolder) {
    const res = await drive(`${api}?supportsAllDrives=true`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "files", parents: [folder], mimeType: "application/vnd.google-apps.folder" }),
    });
    filesFolder = (await res.json()).id;
  }
  const existing = new Map((await list(`'${filesFolder}' in parents and trashed = false`)).map((f) => [f.name, f]));
  let uploaded = 0;
  for (const f of files) {
    const fileName = `${f.bucket}/${f.path}`;
    const prev = existing.get(fileName);
    if (prev && Number(prev.size) === f.data.length) continue;
    await upload(fileName, filesFolder, f.mimetype ?? "application/octet-stream", f.data);
    if (prev) await trash(prev.id);
    uploaded++;
  }
  return `uploaded ${name}; trashed ${old.length} old; ${uploaded} of ${files.length} storage files uploaded`;
}
