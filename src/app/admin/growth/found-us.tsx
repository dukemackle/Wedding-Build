import { CLAIM_VIA, firstTouchLabel, heardFromLabel, type FirstTouch } from "@/lib/attribution";
import { isAdminEmail } from "@/lib/admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";

type Row = { heard_from: string | null; first_touch: FirstTouch | null };
type ClaimRow = Row & { arrived_via: string | null; submitter_email: string };

function tally(values: (string | null)[]): [string, number][] {
  const counts = new Map<string, number>();
  for (const v of values) if (v) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1]);
}

function Bars({ title, rows, empty }: { title: string; rows: [string, number][]; empty: string }) {
  const max = Math.max(0, ...rows.map(([, n]) => n));
  return (
    <div>
      <p className="mb-1 font-mono-numbers text-xs uppercase tracking-wide text-ink/50">{title}</p>
      {rows.length === 0 ? (
        <p className="py-1.5 text-xs text-ink/50">{empty}</p>
      ) : (
        rows.map(([label, count]) => (
          <div key={label} className="flex items-center gap-3 py-1.5">
            <span className="w-44 shrink-0 truncate text-xs text-ink/70" title={label}>
              {label}
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-hairline/40">
              <div className="h-2 rounded-full bg-forest" style={{ width: `${max ? Math.round((count / max) * 100) : 0}%` }} />
            </div>
            <span className="w-8 shrink-0 text-right font-mono-numbers text-xs text-ink/70">{count}</span>
          </div>
        ))
      )}
    </div>
  );
}

/**
 * How people found us (src/lib/attribution.ts): what couples and businesses
 * told us, where their first visit came from, and which of our links brought
 * a business to its claim form. Test couples and the owner's own claims are
 * left out, as on the rest of this page.
 */
export async function FoundUs({ testUserIds }: { testUserIds: Set<string> }) {
  const admin = createAdminSupabaseClient();
  const [signups, venueClaims, vendorClaims] = await Promise.all([
    admin.from("signup_sources").select("user_id, heard_from, first_touch").returns<(Row & { user_id: string })[]>(),
    admin.from("venue_submissions").select("heard_from, first_touch, arrived_via, submitter_email").returns<ClaimRow[]>(),
    admin.from("vendor_submissions").select("heard_from, first_touch, arrived_via, submitter_email").returns<ClaimRow[]>(),
  ]);
  // Before migration 0153 these error; say so instead of showing zeros.
  if (signups.error || venueClaims.error || vendorClaims.error) {
    return (
      <div className="mt-8 rounded-lg border border-hairline bg-card p-6 text-sm text-ink/60 shadow-sm">
        How people found us appears here once migration 0153_attribution.sql has been run.
      </div>
    );
  }

  const couples = (signups.data ?? []).filter((r) => !testUserIds.has(r.user_id));
  const claims = [...(venueClaims.data ?? []), ...(vendorClaims.data ?? [])].filter(
    (r) => !isAdminEmail(r.submitter_email) && r.submitter_email.toLowerCase() !== "hello@youdoido.com",
  );

  return (
    <div className="mt-8 w-full rounded-lg border border-hairline bg-card p-6 shadow-sm">
      <p className="text-sm font-medium text-ink">How people found us</p>
      <p className="mt-1 text-xs text-ink/50">
        Counted from 3 Nov 2026, when we started asking. {couples.length} couple signup{couples.length === 1 ? "" : "s"} and{" "}
        {claims.length} listing claim{claims.length === 1 ? "" : "s"} so far.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-x-10 gap-y-6 lg:grid-cols-2">
        <Bars title="Couples told us" rows={tally(couples.map((r) => heardFromLabel(r.heard_from)))} empty="No answers yet." />
        <Bars title="Couples' first visit came from" rows={tally(couples.map((r) => firstTouchLabel(r.first_touch)))} empty="None recorded yet." />
        <Bars title="Venues and vendors told us" rows={tally(claims.map((r) => heardFromLabel(r.heard_from)))} empty="No answers yet." />
        <Bars
          title="Claim form reached through"
          rows={tally(claims.map((r) => (r.arrived_via ? (CLAIM_VIA[r.arrived_via as keyof typeof CLAIM_VIA] ?? r.arrived_via) : null)))}
          empty="None recorded yet."
        />
      </div>
    </div>
  );
}
