"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  BILLING_CYCLES,
  SPEND_CATEGORIES,
  RENEWAL_WARNING_DAYS,
  daysUntil,
  formatUsd,
  monthlyCents,
  spendTotals,
  type OpsService,
} from "@/lib/spend";
import { deleteService, saveService } from "./actions";

const card = "rounded-lg border border-hairline bg-card shadow-sm";
const inputClass =
  "w-full rounded-md border border-hairline bg-parchment px-3 py-2 text-sm text-ink outline-none focus:border-forest";
const labelClass = "mb-1 block text-xs font-medium uppercase tracking-wide text-ink/50";

function formatDate(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function price(s: OpsService) {
  if (s.amount_cents === null) return <span className="text-ink/40">Price unknown</span>;
  const per = s.billing_cycle === "monthly" ? "/mo" : s.billing_cycle === "yearly" ? "/yr" : " once";
  return (
    <span className="font-mono-numbers">
      {formatUsd(s.amount_cents)}
      <span className="text-ink/50">{per}</span>
    </span>
  );
}

function renewal(s: OpsService) {
  if (!s.next_renewal) return <span className="text-ink/40">No date</span>;
  const days = daysUntil(s.next_renewal);
  const soon = s.status === "active" && days <= RENEWAL_WARNING_DAYS;
  return (
    <span className={soon ? "font-medium text-brass" : undefined}>
      {formatDate(s.next_renewal)}
      {soon && <span className="ml-1 text-xs">({days < 0 ? "passed" : days === 0 ? "today" : `in ${days}d`})</span>}
    </span>
  );
}

function Stat({ label, value, note, highlight }: { label: string; value: string; note?: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-lg border p-3 shadow-sm sm:p-4 ${highlight ? "border-brass/60 bg-brass/10" : "border-hairline bg-card"}`}
    >
      <p className="text-[11px] uppercase tracking-wide text-ink/50 sm:text-xs">{label}</p>
      <p className="mt-1 font-mono-numbers text-lg font-semibold text-forest sm:text-2xl">{value}</p>
      {note && <p className="mt-1 hidden text-xs text-ink/60 sm:block">{note}</p>}
    </div>
  );
}

function ServiceForm({ service, onDone }: { service: OpsService | null; onDone: () => void }) {
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  function submit(formData: FormData) {
    startTransition(async () => {
      const result = await saveService(formData);
      if (result.error) setError(result.error);
      else {
        setError(undefined);
        onDone();
      }
    });
  }

  function remove() {
    if (!service || !confirm(`Delete ${service.name}? Marking it cancelled keeps the record instead.`)) return;
    startTransition(async () => {
      const result = await deleteService(service.id);
      if (result.error) setError(result.error);
      else onDone();
    });
  }

  return (
    // key on the service so switching rows resets every field
    <form key={service?.id ?? "new"} action={submit} className="space-y-3">
      {service && <input type="hidden" name="id" value={service.id} />}
      <div>
        <label className={labelClass} htmlFor="spend-name">Service</label>
        <input id="spend-name" name="name" required defaultValue={service?.name} placeholder="Google Workspace" className={inputClass} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor="spend-category">Category</label>
          <select id="spend-category" name="category" defaultValue={service?.category ?? "software"} className={inputClass}>
            {Object.entries(SPEND_CATEGORIES).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="spend-cycle">Bills</label>
          <select id="spend-cycle" name="billing_cycle" defaultValue={service?.billing_cycle ?? "monthly"} className={inputClass}>
            {Object.entries(BILLING_CYCLES).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="spend-amount">Price (USD)</label>
          <input
            id="spend-amount"
            name="amount"
            inputMode="decimal"
            defaultValue={service?.amount_cents == null ? "" : (service.amount_cents / 100).toFixed(2)}
            placeholder="Unknown"
            className={`${inputClass} font-mono-numbers`}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="spend-renewal">Next renewal</label>
          <input id="spend-renewal" name="next_renewal" type="date" defaultValue={service?.next_renewal ?? ""} className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass} htmlFor="spend-plan">Plan</label>
        <input id="spend-plan" name="plan" defaultValue={service?.plan ?? ""} placeholder="Business Starter, 1 seat" className={inputClass} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor="spend-paid">Paid with</label>
          <input id="spend-paid" name="paid_with" defaultValue={service?.paid_with ?? ""} placeholder="Card ending 1234" className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="spend-status">Status</label>
          <select id="spend-status" name="status" defaultValue={service?.status ?? "active"} className={inputClass}>
            <option value="active">Active</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      <div>
        <label className={labelClass} htmlFor="spend-notes">Notes</label>
        <textarea id="spend-notes" name="notes" rows={3} defaultValue={service?.notes ?? ""} className={inputClass} />
      </div>
      {error && <p className="text-sm text-red-800">{error}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" disabled={isPending} className="rounded-md bg-forest px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
          {isPending ? "Saving..." : service ? "Save changes" : "Add service"}
        </button>
        {service && (
          <>
            <button type="button" onClick={onDone} className="rounded-md border border-hairline px-3 py-2 text-sm text-ink/70">
              Cancel
            </button>
            <button type="button" onClick={remove} disabled={isPending} className="ml-auto text-sm text-red-800 hover:underline">
              Delete
            </button>
          </>
        )}
      </div>
    </form>
  );
}

export function SpendManager({ services }: { services: OpsService[] }) {
  const [editing, setEditing] = useState<OpsService | null>(null);
  // Phones show the form only when asked; on desktop it's always beside the list.
  const [formOpen, setFormOpen] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const totals = spendTotals(services);

  // On a phone the form opens below the list, so bring it into view.
  useEffect(() => {
    if (formOpen && window.matchMedia("(max-width: 1023px)").matches) {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [formOpen, editing]);
  const unpricedNote = totals.unpriced > 0 ? `Leaves out ${totals.unpriced} with no price yet` : undefined;

  function edit(s: OpsService) {
    setEditing(s);
    setFormOpen(true);
  }
  function done() {
    setEditing(null);
    setFormOpen(false);
  }

  const sorted = [...services].sort((a, b) => {
    if (a.status !== b.status) return a.status === "active" ? -1 : 1;
    if (a.next_renewal && b.next_renewal) return a.next_renewal.localeCompare(b.next_renewal);
    if (a.next_renewal || b.next_renewal) return a.next_renewal ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Stat label="Per month" value={formatUsd(totals.monthlyCents)} note={unpricedNote ?? "Yearly bills spread over 12 months"} />
        <Stat label="Per year" value={formatUsd(totals.yearlyCents)} note={`${totals.activeCount} active services`} />
        <Stat
          label={`Due in ${RENEWAL_WARNING_DAYS} days`}
          value={String(totals.dueSoon.length)}
          note={totals.dueSoon.length ? totals.dueSoon.map((s) => s.name).join(", ") : "Nothing due"}
          highlight={totals.dueSoon.length > 0}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className={card}>
          <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
            <p className="text-sm font-medium text-ink">Services</p>
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
              className="rounded-md border border-hairline px-3 py-1.5 text-sm text-ink lg:hidden"
            >
              Add
            </button>
          </div>

          {sorted.length === 0 ? (
            <p className="p-4 text-sm text-ink/50">Nothing here yet. Add your first service.</p>
          ) : (
            <>
              {/* Phone: one card per service */}
              <ul className="divide-y divide-hairline lg:hidden">
                {sorted.map((s) => (
                  <li key={s.id}>
                    <button type="button" onClick={() => edit(s)} className={`w-full px-4 py-3 text-left ${s.status === "cancelled" ? "opacity-50" : ""}`}>
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="font-medium text-ink">{s.name}</p>
                        <p className="shrink-0 text-sm">{price(s)}</p>
                      </div>
                      <div className="mt-1 flex items-baseline justify-between gap-3 text-xs text-ink/60">
                        <p>{SPEND_CATEGORIES[s.category]}{s.status === "cancelled" ? " · Cancelled" : ""}</p>
                        <p>Renews {renewal(s)}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>

              {/* Desktop: a table */}
              <div className="hidden lg:block">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-hairline text-xs uppercase tracking-wide text-ink/50">
                      <th className="px-4 py-2 font-medium">Service</th>
                      <th className="px-4 py-2 font-medium">Category</th>
                      <th className="px-4 py-2 font-medium">Price</th>
                      <th className="px-4 py-2 font-medium">Per month</th>
                      <th className="px-4 py-2 font-medium">Next renewal</th>
                      <th className="px-4 py-2 font-medium">Paid with</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((s) => {
                      const perMonth = monthlyCents(s);
                      return (
                        <tr
                          key={s.id}
                          onClick={() => edit(s)}
                          className={`cursor-pointer border-b border-hairline last:border-b-0 hover:bg-parchment ${
                            editing?.id === s.id ? "bg-parchment" : ""
                          } ${s.status === "cancelled" ? "opacity-50" : ""}`}
                        >
                          <td className="px-4 py-2.5">
                            <p className="font-medium text-ink">{s.name}</p>
                            {s.plan && <p className="text-xs text-ink/50">{s.plan}</p>}
                          </td>
                          <td className="px-4 py-2.5 text-ink/70">
                            {SPEND_CATEGORIES[s.category]}
                            {s.status === "cancelled" && <span className="block text-xs">Cancelled</span>}
                          </td>
                          <td className="px-4 py-2.5">{price(s)}</td>
                          <td className="px-4 py-2.5 font-mono-numbers text-ink/70">{perMonth === null ? "–" : formatUsd(perMonth)}</td>
                          <td className="px-4 py-2.5">{renewal(s)}</td>
                          <td className="px-4 py-2.5 text-ink/70">{s.paid_with ?? "–"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <div ref={formRef} className={`${card} scroll-mt-4 p-4 lg:sticky lg:top-6 ${formOpen ? "" : "hidden lg:block"}`}>
          <p className="mb-3 text-sm font-medium text-ink">{editing ? `Edit ${editing.name}` : "Add a service"}</p>
          <ServiceForm service={editing} onDone={done} />
        </div>
      </div>
    </div>
  );
}
