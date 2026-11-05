import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { AI_DAILY_CAPS } from "@/lib/ai/allowance";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { AdminEyebrow } from "@/app/admin/admin-nav";

const DAY = 864e5;
const card = "rounded-lg border border-hairline bg-card shadow-sm";

// Outside the component, like Home's: the page is rendered per request.
const isoDaysAgo = (days: number) => new Date(Date.now() - days * DAY).toISOString();

type Row = {
  label: string;
  detail: string;
  now: number | null;
  before: number | null;
  /** Shown instead of the numbers when the count couldn't be read. */
  missing?: string;
  /** More is worse (bounces, opt-outs): the change is coloured the other way. */
  badWhenUp?: boolean;
};

type Counted = { count: number | null; error: { message: string } | null };

/**
 * What the app used and sent in the last 30 days against the 30 before: the
 * paid AI calls by feature and every kind of message that leaves the app.
 * Counts only, no names. Test couples are left out wherever a row belongs to
 * a wedding. Prices aren't tracked per call; the bills are on Spend & renewals.
 */
export default async function AdminUsagePage() {
  await requireAdmin();
  const admin = createAdminSupabaseClient();
  const d30 = isoDaysAgo(30);
  const d60 = isoDaysAgo(60);

  const { data: testWeddings } = await admin.from("weddings").select("id").eq("is_test", true).returns<{ id: string }[]>();
  const testList = `(${(testWeddings ?? []).map((w) => w.id).join(",")})`;
  const hasTests = (testWeddings ?? []).length > 0;

  // One count per window. `filter` narrows the query (purpose, event name);
  // `wedding` is the column to drop test couples by, when the table has one.
  const pair = async (
    table: string,
    column: string,
    { filter, wedding }: { filter?: Record<string, string | boolean>; wedding?: string } = {},
  ): Promise<{ now: number | null; before: number | null; error?: string }> => {
    const one = (from: string, to?: string) => {
      let q = admin.from(table).select("*", { count: "exact", head: true }).gte(column, from);
      if (to) q = q.lt(column, to);
      for (const [k, v] of Object.entries(filter ?? {})) q = q.eq(k, v);
      if (wedding && hasTests) q = q.not(wedding, "in", testList);
      return q as unknown as PromiseLike<Counted>;
    };
    const [a, b] = await Promise.all([one(d30), one(d60, d30)]);
    const error = a.error?.message ?? b.error?.message;
    return { now: a.count, before: b.count, error };
  };

  const [chat, contracts, thankYous, listingFills, listingWrites, adminAsk, stdSent, stdOpened, vendorInq, venueInq, texts, textsFailed, bounces, complaints, coupleOptOuts, businessOptOuts, everTexts, rsvps, householdRsvps] =
    await Promise.all([
      pair("assistant_conversations", "created_at", { wedding: "wedding_id" }),
      pair("ai_uses", "created_at", { filter: { purpose: "contract" }, wedding: "wedding_id" }),
      pair("ai_uses", "created_at", { filter: { purpose: "thank_you" }, wedding: "wedding_id" }),
      pair("listing_reads", "created_at", { filter: { purpose: "read" } }),
      pair("listing_reads", "created_at", { filter: { purpose: "write" } }),
      pair("admin_assistant_log", "created_at"),
      pair("guests", "std_sent_at", { wedding: "wedding_id" }),
      pair("guests", "std_opened_at", { wedding: "wedding_id" }),
      pair("vendor_inquiries", "sent_at", { wedding: "wedding_id" }),
      pair("venue_inquiries", "sent_at", { wedding: "wedding_id" }),
      pair("events", "created_at", { filter: { name: "sms_sent" }, wedding: "wedding_id" }),
      pair("events", "created_at", { filter: { name: "sms_sent", "props->>ok": "false" }, wedding: "wedding_id" }),
      pair("email_bounces", "last_event_at", { filter: { reason: "bounce" } }),
      pair("email_bounces", "last_event_at", { filter: { reason: "complaint" } }),
      pair("marketing_consents", "opted_out_at"),
      pair("outreach_opt_outs", "created_at"),
      admin.from("events").select("id", { count: "exact", head: true }).eq("name", "sms_sent"),
      pair("events", "created_at", { filter: { name: "rsvp_received" }, wedding: "wedding_id" }),
      pair("events", "created_at", { filter: { name: "rsvp_received", "props->>status": "household" }, wedding: "wedding_id" }),
    ]);

  const row = (label: string, detail: string, r: Awaited<ReturnType<typeof pair>>, extra: Partial<Row> = {}): Row => ({
    label,
    detail,
    now: r.now,
    before: r.before,
    missing: r.error ? "not pulled" : undefined,
    ...extra,
  });
  const sum = (a: Awaited<ReturnType<typeof pair>>, b: Awaited<ReturnType<typeof pair>>) => ({
    now: a.now === null || b.now === null ? null : a.now + b.now,
    before: a.before === null || b.before === null ? null : a.before + b.before,
    error: a.error ?? b.error,
  });
  const textsLogged = (everTexts.count ?? 0) > 0;

  const ai: Row[] = [
    row("Wren chat answers", "Questions couples asked Wren in chat", chat),
    row("Contract reads", `Uploaded contracts read · capped at ${AI_DAILY_CAPS.contract} per wedding a day`, contracts),
    row("Thank-you drafts", `Notes Wren drafted · capped at ${AI_DAILY_CAPS.thank_you} per wedding a day`, thankYous),
    row("Listing fill-ins", "“Fill this in for me” on a business's own listing", listingFills),
    row("Listing writing help", "“Help me write this” on a business's own listing", listingWrites),
    row("Ask Wren (admin)", "Your own questions on Ask Wren", adminAsk),
  ];

  const messages: Row[] = [
    row("Save-the-dates emailed", "Guests whose card was last emailed in the window", stdSent),
    row("Save-the-dates opened", "Guests who first opened their card in the window (no tracking pixel)", stdOpened),
    row("Inquiries emailed", "Vendor + venue inquiries couples sent", sum(vendorInq, venueInq)),
    textsLogged || texts.error
      ? row("Texts attempted", "Schedule updates texted to opted-in guests · each one is billed", texts)
      : { label: "Texts attempted", detail: "Schedule updates texted to opted-in guests · each one is billed", now: null, before: null, missing: "no texts logged yet" },
    textsLogged
      ? row("Texts that failed", "Twilio refused or isn't set up; includes guests who replied STOP", textsFailed, { badWhenUp: true })
      : { label: "Texts that failed", detail: "Twilio refused or isn't set up; includes guests who replied STOP", now: null, before: null, missing: "no texts logged yet" },
  ];

  // Personal links (/w/<slug>/i/<code>, migration 0141) answer for a whole
  // household in one go; typed names go through the couple's approval queue.
  const typed = {
    now: rsvps.now === null || householdRsvps.now === null ? null : rsvps.now - householdRsvps.now,
    before: rsvps.before === null || householdRsvps.before === null ? null : rsvps.before - householdRsvps.before,
    error: rsvps.error ?? householdRsvps.error,
  };
  const replies: Row[] = [
    row("RSVPs from personal links", "A household answered from its invite-code link (one per household)", householdRsvps),
    row("RSVPs from typed names", "A guest typed their name on the site; the couple approves it", typed),
  ];

  const deliverability: Row[] = [
    row("Email bounces", "Addresses that bounced (latest event in the window)", bounces, { badWhenUp: true }),
    row("Spam complaints", "Recipients who marked an email as spam. Keep this near zero", complaints, { badWhenUp: true }),
    row("Couple marketing opt-outs", "Couples who unsubscribed from marketing email", coupleOptOuts, { badWhenUp: true }),
    row("Business opt-outs", "Venues and vendors who asked not to be emailed", businessOptOuts, { badWhenUp: true }),
  ];

  return (
    <div>
      <AdminEyebrow />
      <h1 className="mt-2 font-display text-3xl font-semibold text-forest">Usage &amp; messages</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink/70">
        The paid AI calls and every message that leaves the app, last 30 days against the 30 before. These are the costs
        that grow with use. Test couples are left out. Prices per call aren&apos;t tracked; the bills are on{" "}
        <Link href="/admin/spend" className="underline hover:text-forest">
          Spend &amp; renewals
        </Link>
        .
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Section title="Wren and AI" rows={ai} />
        <div className="space-y-6">
          <Section title="Messages sent" rows={messages} />
          <Section title="Deliverability and opt-outs" rows={deliverability} />
          <Section title="Guest replies" rows={replies} />
        </div>
      </div>
    </div>
  );
}

function Section({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <section className={card}>
      <header className="flex items-baseline justify-between border-b border-hairline px-5 py-3">
        <h2 className="font-display text-xl font-semibold text-forest">{title}</h2>
        <span className="font-mono-numbers text-[11px] uppercase tracking-[0.12em] text-ink/45">30d · before</span>
      </header>
      <ul className="divide-y divide-hairline">
        {rows.map((r) => (
          <li key={r.label} className="flex items-start gap-4 px-5 py-3">
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-ink">{r.label}</span>
              <span className="block text-xs text-ink/55">{r.detail}</span>
            </span>
            {r.missing ? (
              <span className="shrink-0 pt-0.5 text-xs text-ink/45">{r.missing}</span>
            ) : (
              <span className="shrink-0 text-right">
                <span className="block font-mono-numbers text-lg font-medium tabular-nums text-forest">
                  {(r.now ?? 0).toLocaleString()}
                </span>
                <Change now={r.now ?? 0} before={r.before ?? 0} badWhenUp={r.badWhenUp} />
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Change({ now, before, badWhenUp }: { now: number; before: number; badWhenUp?: boolean }) {
  const up = now > before;
  const down = now < before;
  const good = badWhenUp ? down : up;
  const bad = badWhenUp ? up : down;
  const tone = good ? "text-[#1D7A4C]" : bad ? "text-[#B4321F]" : "text-ink/50";
  return (
    <span className={`block font-mono-numbers text-[11px] ${tone}`}>
      {up ? "▲ " : down ? "▼ " : ""}
      {before.toLocaleString()} before
    </span>
  );
}
