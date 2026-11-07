import { requireAdmin } from "@/lib/admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { AdminEyebrow } from "@/app/admin/admin-nav";
import { REPEAT_INFRINGER_STRIKES } from "@/lib/copyright-agent";
import { setCopyrightNoticeStatus } from "./actions";
import { NoticeForm } from "./notice-form";
import { COUNTS_AS_STRIKE, NOTICE_STATUSES, type NoticeStatus } from "./statuses";

type Notice = {
  id: string;
  received_at: string;
  complainant: string;
  work: string;
  content_url: string;
  uploader_email: string | null;
  status: NoticeStatus;
  notes: string | null;
};

const card = "rounded-lg border border-hairline bg-card p-5 shadow-sm";
const date = (iso: string) =>
  new Date(`${iso.slice(0, 10)}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const label = (status: NoticeStatus) => NOTICE_STATUSES.find((s) => s.value === status)?.label ?? status;

/**
 * The DMCA record: every copyright notice, what was done about it, and how
 * many upheld notices each uploader has. Safe harbor needs the repeat-infringer
 * policy on /copyright to be carried out, and this is where that shows.
 */
export default async function AdminCopyrightPage() {
  await requireAdmin();
  const { data, error } = await createAdminSupabaseClient()
    .from("copyright_notices")
    .select("id, received_at, complainant, work, content_url, uploader_email, status, notes")
    .order("received_at", { ascending: false })
    .order("created_at", { ascending: false })
    .returns<Notice[]>();
  const notices = data ?? [];

  const strikes = new Map<string, number>();
  for (const n of notices) {
    if (n.uploader_email && COUNTS_AS_STRIKE.includes(n.status)) {
      strikes.set(n.uploader_email, (strikes.get(n.uploader_email) ?? 0) + 1);
    }
  }
  const repeat = [...strikes.entries()].filter(([, count]) => count >= REPEAT_INFRINGER_STRIKES);

  return (
    <div>
      <AdminEyebrow />
      <h1 className="mt-2 font-display text-3xl font-semibold text-forest">Copyright</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink/70">
        Notices sent to copyright@ under the process on /copyright. Log each one, take the content down where it lives
        (Photo wall, Buy &amp; sell, or the listing), email the uploader, then mark it here. A counter-notice goes to the
        sender; restore the content 10 to 14 business days later unless they say they&apos;ve sued.
      </p>

      {error && <p className="mt-4 text-sm text-red-800">{error.message}</p>}

      {repeat.length > 0 && (
        <section className="mt-6 rounded-lg border border-red-800/30 bg-red-50 p-5">
          <h2 className="font-display text-xl font-semibold text-red-900">Close these accounts</h2>
          <p className="mt-1 text-sm text-red-900/80">
            {REPEAT_INFRINGER_STRIKES} or more upheld notices: the policy on /copyright says the account is closed.
          </p>
          <ul className="mt-2 text-sm text-red-900">
            {repeat.map(([email, count]) => (
              <li key={email}>
                {email}: {count}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section className={card}>
          <h2 className="font-display text-xl font-semibold text-forest">
            Notices <span className="text-ink/50">({notices.length})</span>
          </h2>
          {notices.length === 0 ? (
            <p className="mt-3 text-sm text-ink/60">No notices yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-hairline">
              {notices.map((n) => (
                <li key={n.id} className="py-3 text-sm">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-medium text-ink">{n.complainant}</span>
                    <span className="text-xs text-ink/50">
                      {label(n.status)} · {date(n.received_at)}
                    </span>
                  </div>
                  <p className="mt-1 text-ink/80">{n.work}</p>
                  <a href={n.content_url} className="mt-1 block break-all text-xs text-brass hover:underline" rel="noreferrer noopener" target="_blank">
                    {n.content_url}
                  </a>
                  {n.uploader_email && (
                    <p className="mt-1 text-xs text-ink/50">
                      Uploaded by {n.uploader_email} · {strikes.get(n.uploader_email) ?? 0} upheld
                    </p>
                  )}
                  {n.notes && <p className="mt-1 whitespace-pre-line text-ink/70">{n.notes}</p>}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {NOTICE_STATUSES.filter((s) => s.value !== n.status).map((s) => (
                      <form key={s.value} action={setCopyrightNoticeStatus}>
                        <input type="hidden" name="id" value={n.id} />
                        <input type="hidden" name="status" value={s.value} />
                        <button
                          type="submit"
                          className="rounded-full border border-hairline px-3 py-1 text-xs text-ink hover:border-forest"
                        >
                          {s.label}
                        </button>
                      </form>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={card}>
          <h2 className="font-display text-xl font-semibold text-forest">Log a notice</h2>
          <NoticeForm />
        </section>
      </div>
    </div>
  );
}
