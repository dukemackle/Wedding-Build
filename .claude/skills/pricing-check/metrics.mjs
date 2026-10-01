// Read-only snapshot of the monetization-phase trigger signals.
// Usage: node --env-file=.env.local .claude/skills/pricing-check/metrics.mjs
// Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. Prints JSON.
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(2);
}
const db = createClient(url, key, { auth: { persistSession: false } });

async function all(table, columns) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db.from(table).select(columns).range(from, from + 999);
    if (error) throw new Error(`${table}: ${error.message}`);
    rows.push(...data);
    if (data.length < 1000) return rows;
  }
}

const now = Date.now();
const DAY = 86_400_000;
const within = (iso, days) => now - new Date(iso).getTime() <= days * DAY;
const month = (iso) => iso.slice(0, 7);
const countBy = (rows, fn) =>
  rows.reduce((acc, r) => ((acc[fn(r)] = (acc[fn(r)] ?? 0) + 1), acc), {});

const [weddings, vendors, vendorInquiries, venueInquiries] = await Promise.all([
  all("weddings", "id, user_id, created_at, is_test"),
  all("vendors", "id, name, category, region, city, state, active, is_sample, created_at"),
  all("vendor_inquiries", "wedding_id, vendor_id, sent_at, status"),
  all("venue_inquiries", "wedding_id, sent_at"),
]);

// The owner's own weddings that were never flagged is_test would inflate every
// "real usage" number, so surface them rather than silently counting them.
let ownerUnflagged = null;
const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
if (adminEmail) {
  const { data } = await db.auth.admin.listUsers({ perPage: 1000 });
  const ownerIds = new Set(
    (data?.users ?? []).filter((u) => u.email?.toLowerCase() === adminEmail).map((u) => u.id),
  );
  ownerUnflagged = weddings.filter((w) => ownerIds.has(w.user_id) && !w.is_test).length;
}

const testIds = new Set(weddings.filter((w) => w.is_test).map((w) => w.id));
const real = weddings.filter((w) => !w.is_test);
const listed = vendors.filter((v) => v.active && !v.is_sample);
const realInq = vendorInquiries.filter((i) => !testIds.has(i.wedding_id));
const inq90 = realInq.filter((i) => within(i.sent_at, 90));

const perVendor90 = countBy(inq90.filter((i) => i.vendor_id), (i) => i.vendor_id);
const counts = Object.values(perVendor90).sort((a, b) => a - b);
const median = counts.length ? counts[Math.floor(counts.length / 2)] : 0;
const name = Object.fromEntries(vendors.map((v) => [v.id, v.name]));

const density = countBy(listed, (v) => `${v.category ?? "?"} | ${v.city ?? v.region ?? "?"}`);

console.log(
  JSON.stringify(
    {
      generated_at: new Date().toISOString(),
      couples: {
        total_weddings: weddings.length,
        test_weddings: testIds.size,
        owner_weddings_not_flagged_test: ownerUnflagged,
        real_weddings: real.length,
        real_signups_last_30d: real.filter((w) => within(w.created_at, 30)).length,
        real_signups_last_90d: real.filter((w) => within(w.created_at, 90)).length,
        real_signups_by_month: countBy(real, (w) => month(w.created_at)),
        real_weddings_with_a_vendor_inquiry: new Set(realInq.map((i) => i.wedding_id)).size,
      },
      vendors: {
        total_rows: vendors.length,
        listed_active_non_sample: listed.length,
        sample_rows: vendors.filter((v) => v.is_sample).length,
        inactive_rows: vendors.filter((v) => !v.active).length,
        listed_by_category: countBy(listed, (v) => v.category ?? "?"),
        densest_category_city: Object.entries(density).sort((a, b) => b[1] - a[1]).slice(0, 15),
      },
      vendor_inquiries_real: {
        all_time: realInq.length,
        last_30d: realInq.filter((i) => within(i.sent_at, 30)).length,
        last_90d: inq90.length,
        by_month: countBy(realInq, (i) => month(i.sent_at)),
        by_status: countBy(realInq, (i) => i.status),
        vendors_with_any_last_90d: counts.length,
        vendors_with_3plus_last_90d: counts.filter((c) => c >= 3).length,
        median_per_receiving_vendor_last_90d: median,
        top_vendors_last_90d: Object.entries(perVendor90)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([id, n]) => [name[id] ?? id, n]),
      },
      venue_inquiries_real: {
        all_time: venueInquiries.filter((i) => !testIds.has(i.wedding_id)).length,
        last_90d: venueInquiries.filter((i) => !testIds.has(i.wedding_id) && within(i.sent_at, 90))
          .length,
      },
    },
    null,
    2,
  ),
);
