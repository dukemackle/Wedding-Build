import Link from "next/link";
import { ESTIMATE_GUESTS, type AreaComparison } from "@/lib/area-comparison";

/**
 * "Compared with the Austin area" on a venue or vendor listing. Built from
 * src/lib/area-comparison.ts; every figure is computed from listings we hold
 * or the estimator's model, and the card says which.
 */

const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

/** A percentile track: the area's spread, its middle, and where this one sits. */
function Spread({ at, low, high }: { at: number; low: string; high: string }) {
  const pos = Math.min(Math.max(at, 3), 97);
  return (
    <div className="mt-3" aria-hidden>
      <div className="relative h-1.5 rounded-full bg-hairline">
        <span className="absolute left-1/2 top-1/2 h-3 w-px -translate-y-1/2 bg-ink/30" />
        <span
          className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-brass shadow-sm"
          style={{ left: `${pos}%` }}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-ink/45">
        <span>{low}</span>
        <span>middle</span>
        <span>{high}</span>
      </div>
    </div>
  );
}

function Tile({ label, value, children }: { label: string; value: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-parchment p-4">
      <p className="text-xs uppercase tracking-wide text-ink/50">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold leading-tight text-forest">{value}</p>
      <div className="mt-1 text-sm text-ink/65">{children}</div>
    </div>
  );
}

export function AreaComparisonCard({ data, kind }: { data: AreaComparison; kind: "venue" | "vendor" }) {
  const { area, href, peers, peerNoun, capacity, price, estimate } = data;
  const inArea = area.endsWith("area") ? `the ${area}` : area;
  const tiles = [capacity, price, estimate].filter(Boolean).length;

  return (
    <section className="rounded-lg border border-hairline bg-card p-6 shadow-sm">
      <h2 className="font-display text-xl font-semibold text-forest">Compared with {inArea}</h2>
      <p className="mt-1 text-sm text-ink/65">
        One of {peers.toLocaleString()} {peerNoun} listed in {inArea}.
      </p>

      {tiles > 0 && (
        <div className={`mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 ${tiles > 2 ? "xl:grid-cols-3" : ""}`}>
          {capacity && (
            <Tile label="Guests" value={`Up to ${capacity.value.toLocaleString()}`}>
              {capacity.largerThan >= 50
                ? `Holds more guests than ${capacity.largerThan}% of venues here.`
                : `A smaller venue: ${100 - capacity.largerThan}% here hold more.`}{" "}
              The middle is {capacity.median.toLocaleString()}.
              <Spread at={capacity.largerThan} low={capacity.min.toLocaleString()} high={capacity.max.toLocaleString()} />
            </Tile>
          )}
          {price && (
            <Tile label="Starting price" value={money(price.value)}>
              {price.value === price.median
                ? "Right at the middle"
                : `${money(Math.abs(price.value - price.median))} ${price.value > price.median ? "above" : "below"} the middle`}{" "}
              of the {price.count} {kind === "venue" ? "venues" : peerNoun} in the area that publish one ({money(price.median)}).
              <Spread at={price.above} low={money(price.min)} high={money(price.max)} />
            </Tile>
          )}
          {estimate && (
            <Tile label={`${estimate.label} budget`} value={`${money(estimate.low)}–${money(estimate.high)}`}>
              Our estimate for {ESTIMATE_GUESTS} guests in {estimate.state}, simple to luxury.{" "}
              <Link href="/estimate" className="text-brass hover:underline">
                Estimate yours
              </Link>
            </Tile>
          )}
        </div>
      )}

      {href && (
        <Link href={href} className="mt-5 inline-block text-sm font-medium text-brass hover:underline">
          See all {peerNoun} in {inArea} &rarr;
        </Link>
      )}
    </section>
  );
}
