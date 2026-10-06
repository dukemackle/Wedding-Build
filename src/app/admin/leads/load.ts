import "server-only";
import { BUDGET_CATEGORIES } from "@/lib/budget-categories";
import { leadKey, likelyMatch } from "@/lib/leads";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";

export type LeadKind = "vendor" | "venue";

export type Lead = {
  kind: LeadKind;
  key: string;
  /** The spelling couples used most. */
  name: string;
  category: string | null;
  couples: number;
  state: string | null;
  /** Every couple who typed it is a test account. */
  testOnly: boolean;
  match: { id: string; name: string } | null;
};

export type ResearchLead = { kind: LeadKind; key: string; name: string; category: string | null; state: string | null };

type Line = { id: string; wedding_id: string; category: string | null; purchased_from: string };
type Listing = { id: string; name: string; state: string | null };

const PAGE = 1000;
const CATEGORY_LABEL = new Map(BUDGET_CATEGORIES.map((c) => [c.key, c.label]));

/** Budget lines naming a vendor or venue by hand, with no listing linked. */
export async function unlinkedLines(): Promise<Line[]> {
  const admin = createAdminSupabaseClient();
  const lines: Line[] = [];
  // Pages through, so a row cap on the project can't hide any.
  for (let from = 0; ; ) {
    const { data, error } = await admin
      .from("budget_line_items")
      .select("id, wedding_id, category, purchased_from")
      .not("purchased_from", "is", null)
      .is("vendor_id", null)
      .is("venue_id", null)
      .order("id")
      .range(from, from + PAGE - 1)
      .returns<Line[]>();
    if (error) throw new Error(`Couldn't read budget lines: ${error.message}`);
    if (!data?.length) break;
    lines.push(...data.filter((l) => leadKey(l.purchased_from)));
    from += data.length;
  }
  return lines;
}

export function kindOf(line: Pick<Line, "category">): LeadKind {
  return line.category === "venue" ? "venue" : "vendor";
}

async function listingsIn(table: "vendors" | "venues", states: string[]): Promise<Listing[]> {
  if (!states.length) return [];
  const admin = createAdminSupabaseClient();
  const out: Listing[] = [];
  for (let from = 0; ; ) {
    const { data } = await admin
      .from(table)
      .select("id, name, state")
      .in("state", states)
      .eq("is_sample", false)
      .order("id")
      .range(from, from + PAGE - 1)
      .returns<Listing[]>();
    if (!data?.length) break;
    out.push(...data);
    from += data.length;
  }
  return out;
}

function mostCommon(values: (string | null)[]): string | null {
  const counts = new Map<string, number>();
  for (const v of values) if (v) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

export async function loadLeads(): Promise<{ open: Lead[]; research: ResearchLead[] }> {
  const admin = createAdminSupabaseClient();
  const lines = await unlinkedLines();
  const weddingIds = [...new Set(lines.map((l) => l.wedding_id))];
  const [{ data: weddings }, { data: decided }] = await Promise.all([
    weddingIds.length
      ? admin
          .from("weddings")
          .select("id, state, is_test")
          .in("id", weddingIds)
          .returns<{ id: string; state: string | null; is_test: boolean }[]>()
      : Promise.resolve({ data: [] as { id: string; state: string | null; is_test: boolean }[] }),
    admin
      .from("listing_leads")
      .select("kind, name_key, name, category, state, status")
      .order("decided_at", { ascending: false })
      .returns<{ kind: LeadKind; name_key: string; name: string; category: string | null; state: string | null; status: string }[]>(),
  ]);
  const wedding = new Map((weddings ?? []).map((w) => [w.id, w]));
  const status = new Map((decided ?? []).map((d) => [`${d.kind}|${d.name_key}`, d.status]));

  const groups = new Map<string, Line[]>();
  for (const line of lines) {
    const id = `${kindOf(line)}|${leadKey(line.purchased_from)}`;
    if (status.get(id) === "dismissed") continue;
    groups.set(id, [...(groups.get(id) ?? []), line]);
  }

  const leads = [...groups.entries()].map(([id, group]) => {
    const [kind, key] = id.split("|") as [LeadKind, string];
    const couples = [...new Set(group.map((l) => l.wedding_id))];
    return {
      kind,
      key,
      name: mostCommon(group.map((l) => l.purchased_from.trim()))!,
      category: kind === "venue" ? null : CATEGORY_LABEL.get(mostCommon(group.map((l) => l.category)) ?? "") ?? null,
      couples: couples.length,
      state: mostCommon(couples.map((w) => wedding.get(w)?.state ?? null)),
      testOnly: couples.every((w) => wedding.get(w)?.is_test),
      match: null as Lead["match"],
      researching: status.get(id) === "research",
    };
  });

  // Matches only within the wedding's state, which keeps "Rose Hill" in Ohio
  // from pointing at a Rose Hill in Texas.
  for (const kind of ["vendor", "venue"] as const) {
    const mine = leads.filter((l) => l.kind === kind && l.state);
    const listings = await listingsIn(kind === "venue" ? "venues" : "vendors", [...new Set(mine.map((l) => l.state!))]);
    for (const lead of mine) {
      const hit = likelyMatch(lead.name, listings.filter((l) => l.state === lead.state));
      lead.match = hit ? { id: hit.id, name: hit.name } : null;
    }
  }

  // A lead sent to research waits on its own list until a batch lists it;
  // then it matches and comes back here to be linked.
  const research = leads
    .filter((l) => l.researching && !l.match)
    .map(({ kind, key, name, category, state }) => ({ kind, key, name, category, state }));
  const open = leads.filter((l) => !l.researching || l.match).map(({ kind, key, name, category, couples, state, testOnly, match }) => ({ kind, key, name, category, couples, state, testOnly, match }));

  open.sort((a, b) => Number(a.testOnly) - Number(b.testOnly) || b.couples - a.couples || a.name.localeCompare(b.name));
  return { open, research };
}
