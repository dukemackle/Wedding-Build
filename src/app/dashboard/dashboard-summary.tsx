import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import {
  HeadcountIcon,
  BudgetIcon,
  VenueIcon,
  VendorsIcon,
  AttireIcon,
  ChecklistIcon,
} from "@/components/icons";
import { AnimatedCounter } from "@/components/animated-counter";
import { DashboardPanel } from "./dashboard-panel";
import type { DashboardSummaryData, VendorTrackerRow } from "./dashboard-data";

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function StatTile({
  icon: Icon,
  label,
  value,
  suffix,
  format,
  detail,
  href,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value: number;
  suffix?: string;
  format?: "number" | "currency";
  detail: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-hairline bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest/10 text-forest transition-colors group-hover:bg-forest group-hover:text-parchment sm:flex">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="block font-mono-numbers text-[10px] uppercase tracking-[0.18em] text-ink/50">
          {label}
        </span>
        <span className="block font-mono-numbers text-xl font-semibold text-forest">
          <AnimatedCounter value={value} format={format} />
          {suffix && <span className="text-sm font-normal text-ink/45">{suffix}</span>}
        </span>
        <span className="block truncate text-xs text-ink/55">{detail}</span>
      </span>
    </Link>
  );
}

/**
 * Six numbers in a row under the banner, each a door to its page. Replaces the
 * big tiles, which spent a card apiece on a single figure.
 */
export function StatStrip({
  data,
  vendors,
}: {
  data: DashboardSummaryData;
  vendors: VendorTrackerRow[];
}) {
  const booked = vendors.filter((v) => v.status === "booked").length;
  return (
    <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      <StatTile
        icon={HeadcountIcon}
        label="Guest list"
        value={data.guestsTotal}
        detail={
          data.headcountIsOverride
            ? `Planning for ${data.headcount}`
            : `${data.guestsConfirmed} confirmed`
        }
        href="/guests"
      />
      <StatTile
        icon={BudgetIcon}
        label="Est. cost"
        value={data.budgetTotal}
        format="currency"
        detail={data.budgetTarget ? `Target ${usd(data.budgetTarget)}` : "No target set"}
        href="/budget"
      />
      <StatTile
        icon={VendorsIcon}
        label="Booked"
        value={booked}
        suffix={` / ${vendors.length}`}
        detail="vendors & venue"
        href="/vendors"
      />
      <StatTile
        icon={VenueIcon}
        label="Venues"
        value={data.venuesShortlisted}
        detail="shortlisted"
        href="/venues"
      />
      <StatTile
        icon={AttireIcon}
        label="Attire"
        value={data.attireShortlisted}
        detail="shortlisted"
        href="/attire"
      />
      <StatTile
        icon={ChecklistIcon}
        label="Tasks"
        value={data.tasksDone}
        suffix={` / ${data.tasksTotal}`}
        detail="done"
        href="/checklist"
      />
    </div>
  );
}

function Bar({ value, max, className }: { value: number; max: number; className: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-hairline">
      <div className={`h-full rounded-full ${className}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

/**
 * The cost picture. Labelled an estimate, because until the categories carry
 * real quotes that's all it is -- the old tile called it "Budget", which read
 * as a number the couple had chosen.
 */
export function BudgetPanel({ data }: { data: DashboardSummaryData }) {
  const target = data.budgetTarget;
  const over = target != null && data.budgetTotal > target;
  return (
    <DashboardPanel
      eyebrow="Budget"
      title={usd(data.budgetTotal)}
      summary={target ? `Estimated · target ${usd(target)}` : "Estimated total"}
      action={{ href: "/budget", label: "Open budget" }}
      collapsible
    >
      <p className="-mt-3 text-sm text-ink/60">
        Estimated total{target ? ` against your ${usd(target)} target` : ""}
      </p>

      <div className="mt-5 space-y-4">
        {target != null && (
          <div>
            <div className="mb-1.5 flex justify-between text-xs">
              <span className="text-ink/60">Estimate vs. target</span>
              <span className={`font-mono-numbers ${over ? "text-brass" : "text-forest"}`}>
                {over ? `${usd(data.budgetTotal - target)} over` : `${usd(target - data.budgetTotal)} under`}
              </span>
            </div>
            <Bar value={data.budgetTotal} max={Math.max(target, data.budgetTotal)} className={over ? "bg-brass" : "bg-forest"} />
          </div>
        )}
        <div>
          <div className="mb-1.5 flex justify-between text-xs">
            <span className="text-ink/60">Real quotes in</span>
            <span className="font-mono-numbers text-forest">
              {data.budgetCategoriesQuoted} of {data.budgetCategoriesTotal}
            </span>
          </div>
          <Bar value={data.budgetCategoriesQuoted} max={data.budgetCategoriesTotal} className="bg-brass" />
        </div>
        <div>
          <div className="mb-1.5 flex justify-between text-xs">
            <span className="text-ink/60">Paid so far</span>
            <span className="font-mono-numbers text-forest">{usd(data.budgetPaid)}</span>
          </div>
          <Bar value={data.budgetPaid} max={data.budgetTotal} className="bg-forest" />
        </div>
      </div>

      {target == null && (
        <p className="mt-5 rounded-lg bg-parchment p-3 text-xs text-ink/65">
          Set a target on the Budget page and Wren will show whether the estimate fits it.
        </p>
      )}
    </DashboardPanel>
  );
}

function formatShortDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Replies, as one stacked bar. Also where the planning headcount is
 * explained: when a couple has typed an expected number, it and the size of
 * the list can differ a lot, and showing both unlabelled looked like a bug.
 */
export function RsvpPanel({
  data,
  rsvpDeadline,
}: {
  data: DashboardSummaryData;
  rsvpDeadline: string | null;
}) {
  const total = data.guestsTotal;
  const segments = [
    { label: "Confirmed", value: data.guestsConfirmed, className: "bg-forest", dot: "bg-forest" },
    { label: "Waiting", value: data.guestsPending, className: "bg-brass/60", dot: "bg-brass/60" },
    { label: "Declined", value: data.guestsDeclined, className: "bg-ink/20", dot: "bg-ink/20" },
  ];

  return (
    <DashboardPanel
      eyebrow="RSVPs"
      title={total > 0 ? `${data.guestsConfirmed} of ${total} confirmed` : "No guests yet"}
      summary={rsvpDeadline ? `Due ${formatShortDate(rsvpDeadline)}` : undefined}
      action={{ href: "/guests", label: "Guest list" }}
      collapsible
    >
      {total > 0 ? (
        <>
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-hairline">
            {segments.map((s) =>
              s.value > 0 ? (
                <div key={s.label} className={s.className} style={{ width: `${(s.value / total) * 100}%` }} />
              ) : null,
            )}
          </div>
          <ul className="mt-4 grid grid-cols-3 gap-2">
            {segments.map((s) => (
              <li key={s.label}>
                <span className="flex items-center gap-1.5 text-xs text-ink/60">
                  <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                  {s.label}
                </span>
                <span className="font-mono-numbers text-lg font-semibold text-forest">{s.value}</span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="text-sm text-ink/60">Add guests to start tracking replies.</p>
      )}

      <dl className="mt-5 space-y-2 border-t border-hairline pt-4 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-ink/60">Planning headcount</dt>
          <dd className="font-mono-numbers text-forest">
            {data.headcount}
            <span className="ml-1 text-xs text-ink/45">
              {data.headcountIsOverride ? "your estimate" : "confirmed"}
            </span>
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink/60">RSVP deadline</dt>
          <dd className="font-mono-numbers text-forest">
            {rsvpDeadline ? formatShortDate(rsvpDeadline) : "Not set"}
          </dd>
        </div>
      </dl>
    </DashboardPanel>
  );
}
