"use client";

import { useState } from "react";

type LookupWedding = {
  id: string;
  partner_a_name: string | null;
  partner_b_name: string | null;
  referral_code: string | null;
};

export function ReferralLookup({ weddings }: { weddings: LookupWedding[] }) {
  const [query, setQuery] = useState("");

  const matches =
    query.trim().length === 0
      ? []
      : weddings.filter((wedding) => {
          const names = [wedding.partner_a_name, wedding.partner_b_name]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          const code = (wedding.referral_code ?? "").toLowerCase();
          const q = query.trim().toLowerCase();
          return names.includes(q) || code.includes(q);
        });

  return (
    <div className="w-full rounded-lg border border-hairline bg-card p-6 shadow-sm">
      <p className="text-sm font-medium text-ink">Referral code lookup</p>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by couple name or referral code"
        className="mt-2 w-full rounded-md border border-hairline bg-parchment px-3 py-2 text-sm text-ink outline-none focus:border-forest"
      />
      {query.trim().length > 0 && (
        <div className="mt-3">
          {matches.length === 0 && <p className="text-sm text-ink/50">No matches.</p>}
          {matches.map((wedding) => {
            const names = [wedding.partner_a_name, wedding.partner_b_name]
              .filter(Boolean)
              .join(" & ");
            return (
              <div
                key={wedding.id}
                className="flex items-center justify-between border-b border-hairline py-2 text-sm last:border-b-0"
              >
                <span className="text-ink">{names || "—"}</span>
                <span className="font-mono-numbers text-ink/70">
                  {wedding.referral_code ?? "—"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
