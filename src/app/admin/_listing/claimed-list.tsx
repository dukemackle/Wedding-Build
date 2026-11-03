import Link from "next/link";
import type { createAdminSupabaseClient } from "@/lib/supabase/admin-client";

type Kind = "venue" | "vendor";

type Row = {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  active: boolean;
  claimedBy: { name: string; email: string; role: string | null; at: string } | null;
};

/** Every listing a venue or vendor has claimed, newest claim first, with who claimed it. */
export async function loadClaimed(
  admin: ReturnType<typeof createAdminSupabaseClient>,
  kind: Kind,
): Promise<Row[]> {
  const table = kind === "venue" ? "venues" : "vendors";
  const subTable = kind === "venue" ? "venue_submissions" : "vendor_submissions";
  const fk = kind === "venue" ? "venue_id" : "vendor_id";

  const { data: listings } = await admin
    .from(table)
    .select("id, name, city, state, active")
    .eq("source", "claimed")
    .returns<Omit<Row, "claimedBy">[]>();
  const ids = (listings ?? []).map((l) => l.id);
  if (ids.length === 0) return [];

  const { data: subs } = await admin
    .from(subTable)
    .select(`${fk}, submitter_name, submitter_email, submitter_role, reviewed_at, created_at`)
    .eq("status", "approved")
    .in(fk, ids)
    .order("reviewed_at", { ascending: false })
    .returns<
      (Record<string, string> & {
        submitter_name: string;
        submitter_email: string;
        submitter_role: string | null;
        reviewed_at: string | null;
        created_at: string;
      })[]
    >();

  const latest = new Map<string, Row["claimedBy"]>();
  for (const s of subs ?? []) {
    const id = s[fk];
    if (latest.has(id)) continue;
    latest.set(id, {
      name: s.submitter_name,
      email: s.submitter_email,
      role: s.submitter_role,
      at: s.reviewed_at ?? s.created_at,
    });
  }

  return (listings ?? [])
    .map((l) => ({ ...l, claimedBy: latest.get(l.id) ?? null }))
    .sort((a, b) => (b.claimedBy?.at ?? "").localeCompare(a.claimedBy?.at ?? "") || a.name.localeCompare(b.name));
}

export function ClaimedList({ kind, rows }: { kind: Kind; rows: Row[] }) {
  const plural = kind === "venue" ? "venues" : "vendors";
  return (
    <section className="mt-10">
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h2 className="font-display text-xl font-semibold text-forest">
          Claimed {plural} <span className="font-mono-numbers text-base text-ink/50">({rows.length})</span>
        </h2>
        {rows.length > 0 && (
          <Link href={`/admin/${plural}?status=claimed`} className="text-sm text-brass hover:underline">
            Open in {plural[0].toUpperCase() + plural.slice(1)} list
          </Link>
        )}
      </div>
      {rows.length === 0 ? (
        <div className="rounded-lg border border-hairline bg-card p-6 text-sm text-ink/60 shadow-sm">
          No {plural} have claimed their listing yet.
        </div>
      ) : (
        <ul className="divide-y divide-hairline rounded-lg border border-hairline bg-card shadow-sm">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <div className="min-w-0">
                <a
                  href={`https://youdoido.com/${plural}/${r.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-forest hover:underline"
                >
                  {r.name}
                </a>
                <p className="text-sm text-ink/60">
                  {[r.city, r.state].filter(Boolean).join(", ") || "No location"}
                  {!r.active && <span> · Hidden</span>}
                </p>
              </div>
              <div className="text-sm text-ink/70 sm:text-right">
                {r.claimedBy ? (
                  <>
                    <p>
                      {r.claimedBy.name}
                      {r.claimedBy.role && <span className="text-ink/50"> · {r.claimedBy.role}</span>}
                    </p>
                    <p className="text-ink/50">
                      <a href={`mailto:${r.claimedBy.email}`} className="hover:underline">
                        {r.claimedBy.email}
                      </a>{" "}
                      · {new Date(r.claimedBy.at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </>
                ) : (
                  <p className="text-ink/50">Claimed (no approved submission on file)</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
