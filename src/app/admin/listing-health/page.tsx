import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { reportReasonLabel } from "@/lib/listing-report-reasons";
import { SITE_URL, venueHref, vendorHref } from "@/lib/public-listings";
import { setReportStatus } from "./actions";

type Report = {
  id: string;
  listing_type: "venue" | "vendor";
  listing_id: string;
  reason: string;
  details: string | null;
  reporter_email: string | null;
  created_at: string;
};
type Listing = { id: string; name: string; slug: string | null; contact_email: string | null };
type Bounce = { email: string; reason: string; detail: string | null; last_event_at: string };

const card = "rounded-lg border border-hairline bg-card p-5 shadow-sm";
const date = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

/**
 * Where listing problems land, so they're caught by a check rather than a
 * couple: reports from the "Something wrong?" link on every listing, and
 * listings whose contact email our mail can no longer reach.
 */
export default async function ListingHealthPage() {
  const admin = createAdminSupabaseClient();
  const [{ data: reports }, { data: bounces }] = await Promise.all([
    admin
      .from("listing_reports")
      .select("id, listing_type, listing_id, reason, details, reporter_email, created_at")
      .eq("status", "open")
      .order("created_at", { ascending: true })
      .returns<Report[]>(),
    admin.from("email_bounces").select("*").order("last_event_at", { ascending: false }).returns<Bounce[]>(),
  ]);

  const bouncedEmails = (bounces ?? []).map((b) => b.email);
  const reportIds = (type: "venue" | "vendor") =>
    [...new Set((reports ?? []).filter((r) => r.listing_type === type).map((r) => r.listing_id))];
  const listingQuery = (table: "venues" | "vendors", ids: string[], emails: string[]) => {
    const filters = [
      ids.length ? `id.in.(${ids.join(",")})` : null,
      emails.length ? `contact_email.in.(${emails.map((e) => `"${e}"`).join(",")})` : null,
    ].filter(Boolean);
    if (filters.length === 0) return Promise.resolve({ data: [] as Listing[] });
    return admin.from(table).select("id, name, slug, contact_email").or(filters.join(",")).returns<Listing[]>();
  };
  const [{ data: venues }, { data: vendors }] = await Promise.all([
    listingQuery("venues", reportIds("venue"), bouncedEmails),
    listingQuery("vendors", reportIds("vendor"), bouncedEmails),
  ]);

  const byId = new Map<string, Listing & { type: "venue" | "vendor" }>();
  for (const v of venues ?? []) byId.set(v.id, { ...v, type: "venue" });
  for (const v of vendors ?? []) byId.set(v.id, { ...v, type: "vendor" });
  // Admin is on its own host, so listing links go to the public site.
  const href = (l: Listing & { type: "venue" | "vendor" }) =>
    `${SITE_URL}${l.type === "venue" ? venueHref(l) : vendorHref(l)}`;

  const bounceByEmail = new Map((bounces ?? []).map((b) => [b.email.toLowerCase(), b]));
  const deadEmailListings = [...byId.values()]
    .filter((l) => l.contact_email && bounceByEmail.has(l.contact_email.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">Admin</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-forest">Listing health</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink/70">
        Problems couples reported and listing emails that bounce. Fix the listing on Venues or Vendors, then close the
        report here. For a full sweep of websites and closures, run <code>/data-audit</code>.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className={card}>
          <h2 className="font-display text-xl font-semibold text-forest">
            Reported by couples <span className="text-ink/50">({reports?.length ?? 0})</span>
          </h2>
          {(reports ?? []).length === 0 ? (
            <p className="mt-3 text-sm text-ink/60">No open reports.</p>
          ) : (
            <ul className="mt-3 divide-y divide-hairline">
              {(reports ?? []).map((r) => {
                const listing = byId.get(r.listing_id);
                return (
                  <li key={r.id} className="py-3 text-sm">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      {listing ? (
                        <a href={href(listing)} className="font-medium text-ink hover:text-brass">
                          {listing.name}
                        </a>
                      ) : (
                        <span className="text-ink/50">Listing removed</span>
                      )}
                      <span className="text-xs text-ink/50">
                        {r.listing_type} · {date(r.created_at)}
                      </span>
                    </div>
                    <p className="mt-1 text-ink/80">{reportReasonLabel(r.reason)}</p>
                    {r.details && <p className="mt-1 whitespace-pre-line text-ink/70">“{r.details}”</p>}
                    {r.reporter_email && <p className="mt-1 text-xs text-ink/50">From {r.reporter_email}</p>}
                    <div className="mt-2 flex gap-2">
                      {(["fixed", "dismissed"] as const).map((status) => (
                        <form key={status} action={setReportStatus}>
                          <input type="hidden" name="id" value={r.id} />
                          <input type="hidden" name="status" value={status} />
                          <button
                            type="submit"
                            className="rounded-full border border-hairline px-3 py-1 text-xs text-ink hover:border-forest"
                          >
                            {status === "fixed" ? "Fixed" : "Not a problem"}
                          </button>
                        </form>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className={card}>
          <h2 className="font-display text-xl font-semibold text-forest">
            Email bounces <span className="text-ink/50">({deadEmailListings.length})</span>
          </h2>
          <p className="mt-1 text-xs text-ink/60">
            Couples can&apos;t send these an inquiry. Find a working address, or the business may have closed.
          </p>
          {deadEmailListings.length === 0 ? (
            <p className="mt-3 text-sm text-ink/60">Every listing email is reachable.</p>
          ) : (
            <ul className="mt-3 divide-y divide-hairline">
              {deadEmailListings.map((l) => {
                const bounce = bounceByEmail.get(l.contact_email!.toLowerCase())!;
                return (
                  <li key={l.id} className="py-3 text-sm">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <a href={href(l)} className="font-medium text-ink hover:text-brass">
                        {l.name}
                      </a>
                      <span className="text-xs text-ink/50">
                        {l.type} · {bounce.reason} · {date(bounce.last_event_at)}
                      </span>
                    </div>
                    <p className="mt-1 break-all text-ink/70">{l.contact_email}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
