export type ApprovedClaim = {
  id: string;
  name: string;
  /** Full public URL: the admin lives on its own subdomain. */
  listingUrl: string;
  where: string;
  submitterName: string;
  submitterRole: string | null;
  submitterEmail: string;
  reviewedAt: string | null;
  /** How they found us, already in words (src/lib/attribution.ts). */
  foundUs: string[];
};

function shortDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";
}

/**
 * Claims already approved on the venue and vendor claims pages, so a listing
 * doesn't vanish from view the moment it's approved: where it lives and who to
 * thank. A table on desktop, one row per card on a phone.
 */
export function RecentlyApproved({ claims }: { claims: ApprovedClaim[] }) {
  if (claims.length === 0) return null;
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-semibold text-forest">Recently approved</h2>
      <p className="mt-1 mb-4 text-sm text-ink/60">{claims.length === 1 ? "The last claim you approved." : `The last ${claims.length} claims you approved, newest first.`}</p>

      {/* Desktop: a table. */}
      <div className="hidden overflow-hidden rounded-lg border border-hairline bg-card shadow-sm md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-hairline text-xs uppercase tracking-wide text-ink/50">
            <tr>
              <th className="px-4 py-3 font-medium">Listing</th>
              <th className="px-4 py-3 font-medium">Claimed by</th>
              <th className="px-4 py-3 font-medium">Found us</th>
              <th className="px-4 py-3 font-medium">Approved</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {claims.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-forest">{c.name}</p>
                  <p className="text-xs text-ink/60">{c.where}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-ink">
                    {c.submitterName}
                    {c.submitterRole ? <span className="text-ink/60"> · {c.submitterRole}</span> : null}
                  </p>
                  <p className="text-xs text-ink/60">{c.submitterEmail}</p>
                </td>
                <td className="px-4 py-3 text-xs text-ink/70">
                  {c.foundUs.length > 0 ? c.foundUs.map((line) => <p key={line}>{line}</p>) : <span className="text-ink/40">Not recorded</span>}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-ink/70">{shortDate(c.reviewedAt)}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <a href={c.listingUrl} target="_blank" rel="noopener noreferrer" className="text-[#9a6b00] hover:underline">
                    View listing
                  </a>
                  <a href={`mailto:${c.submitterEmail}`} className="ml-4 text-[#9a6b00] hover:underline">
                    Email
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phone: one card per claim. */}
      <ul className="flex flex-col gap-3 md:hidden">
        {claims.map((c) => (
          <li key={c.id} className="rounded-lg border border-hairline bg-card p-4 text-sm shadow-sm">
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-medium text-forest">{c.name}</p>
              <p className="shrink-0 text-xs text-ink/60">{shortDate(c.reviewedAt)}</p>
            </div>
            <p className="text-xs text-ink/60">{c.where}</p>
            <p className="mt-2 text-ink">
              {c.submitterName}
              {c.submitterRole ? <span className="text-ink/60"> · {c.submitterRole}</span> : null}
            </p>
            <p className="break-all text-xs text-ink/60">{c.submitterEmail}</p>
            {c.foundUs.length > 0 && <p className="mt-2 text-xs text-ink/70">Found us: {c.foundUs.join(" · ")}</p>}
            <div className="mt-3 flex gap-4">
              <a href={c.listingUrl} target="_blank" rel="noopener noreferrer" className="text-[#9a6b00] hover:underline">
                View listing
              </a>
              <a href={`mailto:${c.submitterEmail}`} className="text-[#9a6b00] hover:underline">
                Email
              </a>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
