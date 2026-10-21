import Link from "next/link";

export type Entry = {
  id: string;
  created_at: string;
  actor_email: string;
  action: string;
  target_type: string;
  target_ids: string[];
  summary: string;
};

export const PAGE_SIZE = 100;

/** Filter chips, each a set of action prefixes (see logAdminAction callers). */
export const AREAS = {
  all: { label: "All", prefixes: [] },
  listings: { label: "Listings & claims", prefixes: ["vendor.", "venue.", "listing."] },
  couples: { label: "Couples", prefixes: ["couple."] },
  moderation: { label: "Moderation", prefixes: ["guest_post.", "market.", "listing_report.", "feedback."] },
  content: { label: "Content & data", prefixes: ["attire.", "cost_data.", "lead.", "spend."] },
} as const;
export type Area = keyof typeof AREAS;

const when = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/Chicago",
});

export function AuditLogView({
  entries,
  total,
  area,
  page,
  error,
}: {
  entries: Entry[];
  total: number;
  area: Area;
  page: number;
  error?: string;
}) {
  const from = (page - 1) * PAGE_SIZE;
  const href = (next: { area?: Area; page?: number }) => {
    const a = next.area ?? area;
    const p = next.page ?? 1;
    const qs = new URLSearchParams();
    if (a !== "all") qs.set("area", a);
    if (p > 1) qs.set("page", String(p));
    const s = qs.toString();
    return `/admin/audit-log${s ? `?${s}` : ""}`;
  };
  // Shown once per row only when more than one admin exists, which is rare.
  const severalAdmins = new Set(entries.map((e) => e.actor_email)).size > 1;

  return (
    <div>
      <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">Admin</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-forest">Admin log</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink/70">
        Every change made in the admin panel: claims approved, listings hidden or deleted, couples emailed, test flags
        and more. Entries can&apos;t be edited or removed. Times are US Central.
      </p>

      <nav aria-label="Filter by area" className="mt-5 flex flex-wrap gap-2">
        {(Object.keys(AREAS) as Area[]).map((key) => (
          <Link
            key={key}
            href={href({ area: key })}
            aria-current={key === area ? "page" : undefined}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              key === area
                ? "border-forest bg-forest text-parchment"
                : "border-hairline bg-card text-ink/80 hover:border-forest/40"
            }`}
          >
            {AREAS[key].label}
          </Link>
        ))}
      </nav>

      {error ? (
        <p className="mt-6 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
          Couldn&apos;t load the log: {error}
        </p>
      ) : entries.length === 0 ? (
        <p className="mt-6 rounded-lg border border-hairline bg-card p-5 text-sm text-ink/60 shadow-sm">
          {page > 1
            ? "No more entries."
            : "Nothing logged yet. Changes made in the admin panel from now on appear here."}
        </p>
      ) : (
        <>
          {/* Phone: one entry per card, the summary first. */}
          <ul className="mt-6 divide-y divide-hairline rounded-lg border border-hairline bg-card shadow-sm md:hidden">
            {entries.map((e) => (
              <li key={e.id} className="px-4 py-3 text-sm">
                <p className="text-ink">{e.summary}</p>
                <p className="mt-1 font-mono-numbers text-xs text-ink/55">
                  {when.format(new Date(e.created_at))} · {e.action}
                  {severalAdmins && ` · ${e.actor_email}`}
                </p>
              </li>
            ))}
          </ul>

          {/* Desktop: a dense table. */}
          <div className="mt-6 hidden overflow-hidden rounded-lg border border-hairline bg-card shadow-sm md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-hairline bg-parchment/60 text-xs uppercase tracking-wide text-ink/55">
                <tr>
                  <th scope="col" className="px-4 py-2 font-medium">When</th>
                  <th scope="col" className="px-4 py-2 font-medium">What happened</th>
                  <th scope="col" className="px-4 py-2 font-medium">Action</th>
                  <th scope="col" className="px-4 py-2 font-medium">By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {entries.map((e) => (
                  <tr key={e.id} className="align-top">
                    <td className="whitespace-nowrap px-4 py-2.5 font-mono-numbers text-xs text-ink/60">
                      {when.format(new Date(e.created_at))}
                    </td>
                    <td className="px-4 py-2.5 text-ink">{e.summary}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 font-mono-numbers text-xs text-ink/60">{e.action}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-xs text-ink/60">{e.actor_email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-ink/60">
            <span>
              {from + 1}&ndash;{from + entries.length} of {total}
            </span>
            <span className="flex gap-4">
              {page > 1 && (
                <Link href={href({ page: page - 1 })} className="text-brass hover:underline">
                  Newer
                </Link>
              )}
              {from + entries.length < total && (
                <Link href={href({ page: page + 1 })} className="text-brass hover:underline">
                  Older
                </Link>
              )}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
