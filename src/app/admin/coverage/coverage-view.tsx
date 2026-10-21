import { CORE_CATEGORIES, type StateTarget } from "@/lib/coverage-targets";

/** One state's row from admin_coverage() (migration 0131). */
export type StateCounts = {
  state: string;
  venues: number;
  venues_no_photo: number;
  venues_no_price: number;
  venues_no_pin: number;
  vendors: number;
  vendors_no_photo: number;
  vendors_no_price: number;
  vendors_no_pin: number;
  by_category: Record<string, number>;
  couples: number;
  views: number;
  inquiries: number;
};

/** What each kind of demand adds to a state's need when ranking. */
export const DEMAND_WEIGHT = { couple: 25, inquiry: 10, view: 1 };
const PASS1 = { venues: 15, perCategory: 3 };

export type Ranked = StateCounts & {
    venueTarget: number;
    perCategory: number;
    venueNeed: number;
    vendorNeed: number;
    vendorTarget: number;
    thinnest: { category: string; have: number }[];
    noPhoto: number;
    noPrice: number;
    noPin: number;
    score: number;
    pass1: boolean;
  };

/** Joins live counts to targets and sorts by need, with demand counting extra. */
export function rank(counts: StateCounts[], targets: StateTarget[]): Ranked[] {
  const byState = new Map(counts.map((c) => [c.state, c]));
  return targets
    .map((t) => {
      const c = byState.get(t.state) ?? {
        state: t.state, venues: 0, venues_no_photo: 0, venues_no_price: 0, venues_no_pin: 0, vendors: 0,
        vendors_no_photo: 0, vendors_no_price: 0, vendors_no_pin: 0, by_category: {}, couples: 0, views: 0, inquiries: 0,
      };
      const have = (cat: string) => c.by_category[cat] ?? 0;
      const vendorNeed = CORE_CATEGORIES.reduce((s: number, cat: string) => s + Math.max(0, t.perCategory - have(cat)), 0);
      const venueNeed = Math.max(0, t.venues - c.venues);
      const demand = c.couples * DEMAND_WEIGHT.couple + c.inquiries * DEMAND_WEIGHT.inquiry + c.views * DEMAND_WEIGHT.view;
      return {
        ...c,
        venueTarget: t.venues,
        perCategory: t.perCategory,
        venueNeed,
        vendorNeed,
        vendorTarget: t.perCategory * CORE_CATEGORIES.length,
        thinnest: CORE_CATEGORIES.map((category: string) => ({ category, have: have(category) }))
          .filter((x: { have: number }) => x.have < t.perCategory)
          .sort((a: { have: number }, b: { have: number }) => a.have - b.have)
          .slice(0, 3),
        noPhoto: c.venues_no_photo + c.vendors_no_photo,
        noPrice: c.venues_no_price + c.vendors_no_price,
        noPin: c.venues_no_pin + c.vendors_no_pin,
        score: venueNeed + vendorNeed + (venueNeed + vendorNeed > 0 ? demand : 0),
        // Statewide, so a little kinder than npm run coverage's first-metro rule.
        pass1: c.venues >= PASS1.venues && CORE_CATEGORIES.every((cat: string) => have(cat) >= PASS1.perCategory),
      };
    })
    .sort((a, b) => b.score - a.score || a.state.localeCompare(b.state));
}

const card = "rounded-lg border border-hairline bg-card shadow-sm";
const pct = (n: number, of: number) => (of ? Math.min(100, Math.round((n / of) * 100)) : 100);

function Bar({ have, target, label }: { have: number; target: number; label: string }) {
  return (
    <div>
      <div className="flex justify-between gap-2 font-mono-numbers text-xs">
        <span className="text-ink/60">{label}</span>
        <span className="text-forest">
          {have.toLocaleString()}
          <span className="text-ink/45"> / {target.toLocaleString()}</span>
        </span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-hairline/50" aria-hidden>
        <div className="h-full rounded-full bg-forest" style={{ width: `${pct(have, target)}%` }} />
      </div>
    </div>
  );
}

function Demand({ r }: { r: Ranked }) {
  if (!r.couples && !r.views && !r.inquiries) return <span className="text-ink/40">none yet</span>;
  return (
    <span>
      {[r.couples && `${r.couples} couple${r.couples === 1 ? "" : "s"}`, r.inquiries && `${r.inquiries} inq.`, r.views && `${r.views} views`]
        .filter(Boolean)
        .join(" · ")}
    </span>
  );
}

function Gaps({ r }: { r: Ranked }) {
  return <span>{[r.noPhoto, r.noPrice, r.noPin].map((n) => n.toLocaleString()).join(" · ")}</span>;
}

function Thin({ r }: { r: Ranked }) {
  if (!r.thinnest.length) return <span className="text-ink/40">all at target</span>;
  return (
    <span className="flex flex-wrap gap-1">
      {r.thinnest.map((t) => (
        <span
          key={t.category}
          className={`rounded-full border px-2 py-0.5 text-[11px] ${
            t.have < PASS1.perCategory ? "border-red-200 bg-red-50 text-red-800" : "border-hairline text-ink/70"
          }`}
        >
          {t.category} {t.have}
        </span>
      ))}
    </span>
  );
}

/** /admin/coverage, given the ranked states (null when the counts couldn't be pulled). */
export function CoverageView({ rows, days }: { rows: Ranked[] | null; days: number }) {
  const sum = (k: "venues" | "vendors" | "venueNeed" | "vendorNeed" | "venueTarget" | "noPhoto" | "noPrice" | "noPin") =>
    (rows ?? []).reduce((s, r) => s + r[k], 0);
  const listed = sum("venues") + sum("vendors");

  return (
    <div>
      <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">Admin</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-forest">Coverage</h1>
      <p className="mt-2 max-w-3xl text-sm text-ink/70">
        Live listings in each state against the coverage plan&apos;s current targets, most needed first. A state with
        couples planning in it moves up: each real couple counts as {DEMAND_WEIGHT.couple} listings needed, each
        inquiry {DEMAND_WEIGHT.inquiry} and each listing view {DEMAND_WEIGHT.view} (last {days} days). Gaps by metro:{" "}
        <code>npm run coverage</code>.
      </p>

      {!rows ? (
        <p className="mt-6 text-sm text-ink/60">Not pulled: run migration 0131 to count coverage.</p>
      ) : (
        <>
          <dl className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: "States at pass 1", value: `${rows.filter((r) => r.pass1).length} / ${rows.length}`, note: "15 venues, 3 per core category, statewide" },
              { label: "Venues live", value: `${pct(sum("venues"), sum("venueTarget"))}%`, note: `${sum("venues").toLocaleString()} · ${sum("venueNeed").toLocaleString()} still needed` },
              { label: "Vendors live", value: sum("vendors").toLocaleString(), note: `${sum("vendorNeed").toLocaleString()} still needed in core categories` },
              { label: "Listings with no price", value: `${pct(sum("noPrice"), listed)}%`, note: `${sum("noPhoto").toLocaleString()} with no photo · ${sum("noPin").toLocaleString()} with no map pin` },
            ].map((t) => (
              <div key={t.label} className={`${card} p-4`}>
                <dt className="text-xs text-ink/60">{t.label}</dt>
                <dd className="mt-1 font-mono-numbers text-2xl font-semibold text-forest">{t.value}</dd>
                <dd className="mt-1 text-[11px] leading-snug text-ink/50">{t.note}</dd>
              </div>
            ))}
          </dl>

          {/* Desktop: one ranked table. */}
          <div className={`${card} mt-6 hidden overflow-hidden lg:block`}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hairline text-left text-xs text-ink/55">
                  <th className="w-10 px-4 py-2 font-medium">#</th>
                  <th className="px-3 py-2 font-medium">State</th>
                  <th className="w-44 px-3 py-2 font-medium">Venues</th>
                  <th className="w-44 px-3 py-2 font-medium">Vendors</th>
                  <th className="px-3 py-2 font-medium">Thinnest categories</th>
                  <th className="px-3 py-2 text-right font-medium" title="Listings with no photo · no price · no map pin">No photo · price · pin</th>
                  <th className="px-4 py-2 font-medium">Demand</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {rows.map((r, i) => (
                  <tr key={r.state} className="align-top">
                    <td className="px-4 py-3 font-mono-numbers text-xs text-ink/45">{i + 1}</td>
                    <td className="px-3 py-3">
                      <span className="font-medium text-ink">{r.state}</span>
                      {!r.pass1 && <span className="ml-2 text-[11px] text-red-800">below pass 1</span>}
                    </td>
                    <td className="px-3 py-3"><Bar have={r.venues} target={r.venueTarget} label="" /></td>
                    <td className="px-3 py-3"><Bar have={r.vendorTarget - r.vendorNeed} target={r.vendorTarget} label="core" /></td>
                    <td className="px-3 py-3"><Thin r={r} /></td>
                    <td className="px-3 py-3 text-right font-mono-numbers text-xs text-ink/70"><Gaps r={r} /></td>
                    <td className="px-4 py-3 text-xs text-ink/70"><Demand r={r} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Phone: a card per state, same order. */}
          <ol className="mt-6 space-y-3 lg:hidden">
            {rows.map((r, i) => (
              <li key={r.state} className={`${card} p-4`}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-medium text-ink">
                    <span className="mr-2 font-mono-numbers text-xs text-ink/45">{i + 1}</span>
                    {r.state}
                  </span>
                  {!r.pass1 && <span className="text-[11px] text-red-800">below pass 1</span>}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <Bar have={r.venues} target={r.venueTarget} label="Venues" />
                  <Bar have={r.vendorTarget - r.vendorNeed} target={r.vendorTarget} label="Vendors" />
                </div>
                <div className="mt-3"><Thin r={r} /></div>
                <p className="mt-2 text-xs text-ink/60">
                  No photo · price · pin: <Gaps r={r} /> · <Demand r={r} />
                </p>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-[11px] text-ink/45">
            Vendors count toward a category&apos;s target up to the target, so a state with 40 photographers and no cake
            makers still shows the gap. Test weddings are left out of demand.
          </p>
        </>
      )}
    </div>
  );
}
