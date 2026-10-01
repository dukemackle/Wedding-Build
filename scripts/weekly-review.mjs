#!/usr/bin/env node
// Pulls the numbers behind /weekly-review and prints them as JSON. No
// dependencies: plain fetch against Supabase, Cloudflare and Resend. Each
// source is optional -- a missing key or a failed call becomes an entry in
// `unavailable` rather than stopping the run, so a partial review still works.
//
// Reads keys from the environment, then .env.local / .env if present:
//   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY   counts, signups
//   SUPABASE_ACCESS_TOKEN (personal token)                DB + storage size
//   CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID           Worker requests
//   RESEND_API_KEY (full access, not send-only)           emails sent
//   ADMIN_EMAIL                                           spots untagged test weddings

import { existsSync, readFileSync } from "node:fs";

for (const file of [".env.local", ".env"]) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const env = process.env;
const DAY = 86_400_000;
const now = Date.now();
const weekAgo = new Date(now - 7 * DAY).toISOString();
const monthAgo = new Date(now - 30 * DAY).toISOString();
const dayAgo = new Date(now - DAY).toISOString();

const out = { generatedAt: new Date(now).toISOString(), window: { from: weekAgo }, unavailable: [] };

async function getJson(url, init) {
  const res = await fetch(url, init);
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${text.slice(0, 200)}`);
  return text ? JSON.parse(text) : null;
}

async function source(name, needs, fn) {
  const missing = needs.filter((k) => !env[k]);
  if (missing.length) {
    out.unavailable.push({ source: name, reason: `missing ${missing.join(", ")}` });
    return;
  }
  try {
    out[name] = await fn();
  } catch (err) {
    out.unavailable.push({ source: name, reason: String(err.message ?? err) });
  }
}

// ---- Supabase: the same tables the admin pages read -----------------------

await source("supabase", ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"], async () => {
  const base = env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "");
  const headers = {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
  };

  async function rows(table, query) {
    return getJson(`${base}/rest/v1/${table}?${query}`, { headers });
  }
  async function count(table, filter = "") {
    const res = await fetch(`${base}/rest/v1/${table}?select=id${filter ? `&${filter}` : ""}`, {
      method: "HEAD",
      headers: { ...headers, Prefer: "count=exact", Range: "0-0" },
    });
    if (!res.ok && res.status !== 206) throw new Error(`${table}: ${res.status}`);
    return Number(res.headers.get("content-range")?.split("/")[1] ?? 0);
  }
  // Counts never fail the whole source: a renamed column shows up as null.
  async function safeCount(table, filter) {
    try {
      return await count(table, filter);
    } catch {
      return null;
    }
  }

  const weddings = await rows("weddings", "select=id,user_id,created_at,is_test&limit=10000");
  const testIds = new Set(weddings.filter((w) => w.is_test).map((w) => w.id));
  const real = weddings.filter((w) => !w.is_test);

  const users = [];
  for (let page = 1; page <= 20; page++) {
    const body = await getJson(`${base}/auth/v1/admin/users?page=${page}&per_page=1000`, { headers });
    users.push(...(body.users ?? []));
    if ((body.users ?? []).length < 1000) break;
  }
  const emailById = new Map(users.map((u) => [u.id, u.email]));
  const adminEmail = env.ADMIN_EMAIL?.toLowerCase();
  const untaggedOwnerWeddings = adminEmail
    ? real.filter((w) => emailById.get(w.user_id)?.toLowerCase() === adminEmail).map((w) => w.id)
    : [];

  async function realInquiries(table) {
    const list = await rows(table, `select=wedding_id,created_at&created_at=gte.${weekAgo}&limit=10000`);
    return list.filter((r) => !testIds.has(r.wedding_id)).length;
  }

  const [
    vendors, vendorsNew, vendorsInactive, vendorsNoGeo, vendorsSample,
    venues, venuesNew, venuesInactive, venuesNoGeo, venuesSample,
    vendorSubsPending, venueSubsPending, feedbackNew, contactWeek, guestPostsPending,
    vendorInquiriesWeek, venueInquiriesWeek,
  ] = await Promise.all([
    count("vendors"),
    count("vendors", `created_at=gte.${weekAgo}`),
    safeCount("vendors", "active=eq.false"),
    safeCount("vendors", "latitude=is.null"),
    safeCount("vendors", "is_sample=eq.true"),
    count("venues"),
    count("venues", `created_at=gte.${weekAgo}`),
    safeCount("venues", "active=eq.false"),
    safeCount("venues", "latitude=is.null"),
    safeCount("venues", "is_sample=eq.true"),
    safeCount("vendor_submissions", "status=eq.pending"),
    safeCount("venue_submissions", "status=eq.pending"),
    safeCount("feedback_submissions", "status=eq.new"),
    safeCount("contact_submissions", `created_at=gte.${weekAgo}`),
    safeCount("guest_posts", "status=eq.pending"),
    realInquiries("vendor_inquiries"),
    realInquiries("venue_inquiries"),
  ]);

  return {
    signups: {
      authUsersTotal: users.length,
      authUsersThisWeek: users.filter((u) => u.created_at >= weekAgo).length,
      activeLast30Days: users.filter((u) => u.last_sign_in_at && u.last_sign_in_at >= monthAgo).length,
      weddingsTotal: weddings.length,
      weddingsReal: real.length,
      weddingsRealThisWeek: real.filter((w) => w.created_at >= weekAgo).length,
      weddingsTest: testIds.size,
      untaggedOwnerWeddings,
    },
    vendors: { total: vendors, addedThisWeek: vendorsNew, inactive: vendorsInactive, missingGeo: vendorsNoGeo, sample: vendorsSample, submissionsPending: vendorSubsPending },
    venues: { total: venues, addedThisWeek: venuesNew, inactive: venuesInactive, missingGeo: venuesNoGeo, sample: venuesSample, submissionsPending: venueSubsPending },
    inquiriesThisWeek: { vendor: vendorInquiriesWeek, venue: venueInquiriesWeek },
    queues: { feedbackNew, contactThisWeek: contactWeek, guestPostsPending },
    freeTier: { mau: 50_000 },
  };
});

// ---- Supabase usage: database and storage size (management API) -----------

await source("supabaseUsage", ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_ACCESS_TOKEN"], async () => {
  const ref = new URL(env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(".")[0];
  const result = await getJson(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.SUPABASE_ACCESS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `select pg_database_size(current_database()) as db_bytes,
        (select coalesce(sum((metadata->>'size')::bigint), 0) from storage.objects) as storage_bytes`,
    }),
  });
  const row = result[0];
  return {
    dbMB: Math.round(Number(row.db_bytes) / 1e6),
    storageMB: Math.round(Number(row.storage_bytes) / 1e6),
    freeTier: { dbMB: 500, storageMB: 1000 },
  };
});

// ---- Cloudflare: Worker requests over the last 7 days ----------------------

await source("cloudflare", ["CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID"], async () => {
  const query = `query ($account: string!, $from: Time!, $to: Time!) {
    viewer { accounts(filter: { accountTag: $account }) {
      workersInvocationsAdaptive(limit: 10000, filter: { datetime_geq: $from, datetime_leq: $to }) {
        sum { requests errors }
        dimensions { scriptName date }
      }
    } }
  }`;
  const body = await getJson("https://api.cloudflare.com/client/v4/graphql", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      variables: { account: env.CLOUDFLARE_ACCOUNT_ID, from: weekAgo, to: new Date(now).toISOString() },
    }),
  });
  if (body.errors?.length) throw new Error(body.errors.map((e) => e.message).join("; "));
  const groups = body.data.viewer.accounts[0]?.workersInvocationsAdaptive ?? [];
  const byDay = new Map();
  let requests = 0;
  let errors = 0;
  for (const g of groups) {
    requests += g.sum.requests;
    errors += g.sum.errors;
    byDay.set(g.dimensions.date, (byDay.get(g.dimensions.date) ?? 0) + g.sum.requests);
  }
  return {
    requestsThisWeek: requests,
    errorsThisWeek: errors,
    peakDayRequests: Math.max(0, ...byDay.values()),
    freeTier: { requestsPerDay: 100_000 },
  };
});

// ---- Resend: emails actually sent ------------------------------------------

await source("resend", ["RESEND_API_KEY"], async () => {
  const emails = [];
  let after = "";
  for (let i = 0; i < 40; i++) {
    const body = await getJson(`https://api.resend.com/emails?limit=100${after ? `&after=${after}` : ""}`, {
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}` },
    });
    const page = body.data ?? [];
    emails.push(...page);
    const oldest = page.at(-1);
    if (!body.has_more || !oldest || oldest.created_at < monthAgo) break;
    after = oldest.id;
  }
  const since = (iso) => emails.filter((e) => e.created_at >= iso);
  const bounced = since(weekAgo).filter((e) => ["bounced", "complained"].includes(e.last_event)).length;
  return {
    last24h: since(dayAgo).length,
    last7Days: since(weekAgo).length,
    last30Days: since(monthAgo).length,
    bouncedOrComplainedThisWeek: bounced,
    freeTier: { perDay: 100, perMonth: 3000 },
  };
});

console.log(JSON.stringify(out, null, 2));
