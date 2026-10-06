"use client";

import { useState, useTransition } from "react";
import { decideLead, linkLead } from "./actions";
import type { Lead, ResearchLead } from "./load";

function where(lead: { category: string | null; state: string | null }, couples?: number) {
  return [
    lead.category,
    couples !== undefined ? `${couples} ${couples === 1 ? "couple" : "couples"}` : null,
    lead.state,
  ]
    .filter(Boolean)
    .join(" · ");
}

function Actions({ lead }: { lead: Lead }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(action: () => Promise<{ error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.error) setError(result.error);
    });
  }
  const decide = (status: "research" | "dismissed") =>
    run(() =>
      decideLead({ kind: lead.kind, key: lead.key, name: lead.name, category: lead.category, state: lead.state, status }),
    );

  return (
    <div className="flex flex-wrap items-center gap-1.5 lg:justify-end">
      {lead.match ? (
        <button
          onClick={() => run(() => linkLead(lead.kind, lead.key, lead.match!.id))}
          disabled={isPending}
          className="rounded-full border border-forest px-3 py-1 text-sm text-forest disabled:opacity-60"
        >
          Link to it
        </button>
      ) : (
        <button
          onClick={() => decide("research")}
          disabled={isPending}
          className="rounded-full bg-forest px-3 py-1 text-sm text-parchment disabled:opacity-60"
        >
          Research it
        </button>
      )}
      <button onClick={() => decide("dismissed")} disabled={isPending} className="px-2 text-sm text-ink/60 hover:text-ink disabled:opacity-60">
        Dismiss
      </button>
      {error && <p className="w-full text-xs text-red-700">{error}</p>}
    </div>
  );
}

function TestTag({ lead }: { lead: Lead }) {
  return lead.testOnly ? (
    <span className="ml-2 rounded-full bg-ink/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-ink/50">test couple</span>
  ) : null;
}

export function LeadsList({ title, leads }: { title: string; leads: Lead[] }) {
  return (
    <section className="rounded-xl border border-hairline bg-card shadow-sm">
      <h2 className="border-b border-hairline px-4 py-3 font-display text-xl font-semibold text-forest">
        {title} <span className="text-base font-normal text-ink/40">{leads.length}</span>
      </h2>
      {leads.length === 0 ? (
        <p className="px-4 py-5 text-sm text-ink/60">None right now.</p>
      ) : (
        <>
          {/* Desktop: one table, every lead comparable at a glance. */}
          <table className="hidden w-full text-sm lg:table">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-ink/50">
                <th className="px-4 py-2 font-medium">Name as typed</th>
                <th className="py-2 font-medium">Category</th>
                <th className="py-2 font-medium">Couples</th>
                <th className="py-2 font-medium">Wedding state</th>
                <th className="py-2 font-medium">Possible match</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.key} className="border-t border-hairline">
                  <td className="px-4 py-3 font-medium text-ink">
                    {lead.name}
                    <TestTag lead={lead} />
                  </td>
                  <td className="py-3">{lead.category ?? "—"}</td>
                  <td className="py-3">{lead.couples}</td>
                  <td className="py-3">{lead.state ?? "—"}</td>
                  <td className={`py-3 ${lead.match ? "" : "text-ink/50"}`}>{lead.match?.name ?? "none"}</td>
                  <td className="px-4 py-3">
                    <Actions lead={lead} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Phone: a card per lead, actions under the name. */}
          <div className="divide-y divide-hairline text-sm lg:hidden">
            {leads.map((lead) => (
              <div key={lead.key} className="px-4 py-3">
                <p className="font-medium text-ink">
                  {lead.name}
                  <TestTag lead={lead} />
                </p>
                <p className="text-ink/60">{where(lead, lead.couples)}</p>
                {lead.match && <p className="text-ink/80">Possible match: {lead.match.name}</p>}
                <div className="mt-2">
                  <Actions lead={lead} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export function ResearchList({ leads }: { leads: ResearchLead[] }) {
  if (!leads.length) return null;
  return (
    <section className="rounded-xl border border-hairline bg-card p-4 shadow-sm">
      <h2 className="font-display text-xl font-semibold text-forest">To research</h2>
      <p className="mt-1 text-sm text-ink/60">
        Give these to the next batch for their state. Each comes back above with &ldquo;Link to it&rdquo; once it&apos;s listed.
      </p>
      <ul className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2 lg:grid-cols-3">
        {leads.map((lead) => (
          <li key={`${lead.kind}|${lead.key}`}>
            <span className="text-ink">{lead.name}</span> <span className="text-ink/50">{where(lead) || lead.kind}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
